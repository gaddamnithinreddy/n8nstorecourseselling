import type { NextRequest } from "next/server"
import crypto from "crypto"
import { validateVerifyPaymentInput } from "@/lib/validation"
import { successResponse, errorResponse, HTTP_STATUS } from "@/lib/api-response"
import { sendPurchaseEmail } from "@/lib/email-service"
import { getAdminDb, isFirebaseAdminReady, getInitError } from "@/lib/firebase/admin"

export async function POST(req: NextRequest) {
  try {
    const isReady = await isFirebaseAdminReady()
    if (!isReady) {
      const initErr = getInitError()
      console.error("[Payment] Firebase Admin not initialized:", initErr)
      return errorResponse(
        "Server configuration error. Please contact support.",
        HTTP_STATUS.INTERNAL_ERROR,
        "SERVER_CONFIG_ERROR",
      )
    }

    const adminDb = await getAdminDb()
    if (!adminDb) {
      return errorResponse(
        "Database connection failed. Please try again.",
        HTTP_STATUS.INTERNAL_ERROR,
        "DB_CONNECTION_ERROR",
      )
    }

    let body: Record<string, unknown>
    try {
      body = await req.json()
    } catch {
      return errorResponse("Invalid request body", HTTP_STATUS.BAD_REQUEST, "INVALID_JSON")
    }

    const validation = validateVerifyPaymentInput(body)
    if (!validation.valid) {
      return errorResponse(validation.error, HTTP_STATUS.BAD_REQUEST, "VALIDATION_ERROR")
    }

    const { orderId, razorpay_payment_id, razorpay_order_id, razorpay_signature } = validation.data as {
      orderId: string
      razorpay_payment_id: string
      razorpay_order_id: string
      razorpay_signature: string
    }

    const razorpaySecret = process.env.RZP_SECRET
    if (!razorpaySecret) {
      console.error("[Payment] RZP_SECRET not configured")
      return errorResponse(
        "Payment verification not configured",
        HTTP_STATUS.INTERNAL_ERROR,
        "VERIFICATION_NOT_CONFIGURED",
      )
    }

    let signatureValid = false
    try {
      const signatureBody = razorpay_order_id + "|" + razorpay_payment_id
      const expectedSignature = crypto.createHmac("sha256", razorpaySecret).update(signatureBody).digest("hex")

      if (expectedSignature.length === razorpay_signature.length) {
        signatureValid = crypto.timingSafeEqual(
          Buffer.from(expectedSignature, "utf8"),
          Buffer.from(razorpay_signature, "utf8"),
        )
      }
    } catch (sigError: any) {
      console.error("[Payment] Signature verification error:", sigError)
      signatureValid = false
    }

    if (!signatureValid) {
      console.error("[Payment] Invalid signature for order:", orderId)
      return errorResponse("Invalid payment signature", HTTP_STATUS.BAD_REQUEST, "INVALID_SIGNATURE")
    }

    // Get order
    const orderDoc = await adminDb.collection("orders").doc(orderId).get()
    if (!orderDoc.exists) {
      console.error("[Payment] Order not found:", orderId)
      return errorResponse("Order not found", HTTP_STATUS.NOT_FOUND, "ORDER_NOT_FOUND")
    }

    const order = { id: orderDoc.id, ...orderDoc.data() } as Record<string, unknown>

    // Security Check: Verify Razorpay Order ID matches
    if (order.razorpayOrderId !== razorpay_order_id) {
      console.error("[Payment] Razorpay Order ID mismatch:", {
        expected: order.razorpayOrderId,
        received: razorpay_order_id
      })
      return errorResponse("Invalid payment details", HTTP_STATUS.BAD_REQUEST, "INVALID_ORDER_ID")
    }

    if (order.status !== "created") {
      console.log("[Payment] Order already processed:", orderId, "Status:", order.status)
      // If already paid, return success (idempotent)
      if (order.status === "paid") {
        return successResponse({ message: "Payment already verified" })
      }
      return errorResponse("Order already processed", HTTP_STATUS.BAD_REQUEST, "ORDER_ALREADY_PROCESSED")
    }

    // Generate download tokens and update order in a BATCH for speed and atomicity
    const { Timestamp } = await import("firebase-admin/firestore")
    const batch = adminDb.batch()

    // Generate download tokens with proper expiration
    const tokens: Array<{ templateId: string; token: string; expiresAt: any }> = []
    const templateIds = (order.templates as Array<{ templateId: string }>).map((t) => t.templateId)

    for (const templateId of templateIds) {
      const token = crypto.randomBytes(32).toString("hex")
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 7) // Token expires in 7 days
      const expiresAtTimestamp = Timestamp.fromDate(expiresAt)

      const tokenData = {
        userId: order.userId,
        templateId,
        orderId,
        token,
        expiresAt: expiresAtTimestamp,
        createdAt: Timestamp.now(),
      }

      // Add to batch: Create token document
      const tokenRef = adminDb.collection("downloadTokens").doc() // Auto-ID
      batch.set(tokenRef, tokenData)

      // Store in tokens array with proper structure
      tokens.push({
        templateId,
        token,
        expiresAt: expiresAtTimestamp
      })
    }

    // Add to batch: Update order
    const orderRef = adminDb.collection("orders").doc(orderId)
    batch.update(orderRef, {
      downloadTokens: tokens,
      updatedAt: Timestamp.now(),
      status: "paid" // Explicitly mark as paid here
    })

    // Commit all changes in one round-trip
    await batch.commit()

    // Send purchase email
    try {
      await sendPurchaseEmail(
        {
          userEmail: order.userEmail as string,
          userName: order.userName as string,
          templates: order.templates as Array<{ templateTitle: string; priceAtPurchase: number }>,
        },
        tokens,
      )
    } catch (emailError: any) {
      console.error("[Payment] Failed to send purchase email:", emailError)
      // Don't fail the payment if email fails
    }

    return successResponse({ message: "Payment verified successfully" })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error"
    console.error("[Payment] Verify payment error:", message)
    // Log stack trace for better debugging
    if (error instanceof Error && error.stack) {
      console.error("[Payment] Verify payment error stack:", error.stack)
    }
    return errorResponse("Failed to verify payment. Please contact support.", HTTP_STATUS.INTERNAL_ERROR, "VERIFY_PAYMENT_FAILED")
  }
}