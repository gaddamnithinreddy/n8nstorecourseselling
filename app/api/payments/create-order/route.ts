import { NextResponse } from "next/server"
import { successResponse, errorResponse, HTTP_STATUS } from "@/lib/api-response"
import { getAdminDb, getAdminAuth, isFirebaseAdminReady, getInitError } from "@/lib/firebase/admin"
import { Template } from "@/lib/firebase/types"
import { getAuth } from "firebase-admin/auth"
import Razorpay from "razorpay"
import { validateCoupon } from "@/lib/firebase/coupons"
import { Timestamp } from "firebase-admin/firestore"
import { rateLimit } from "@/lib/ratelimit"
import { validateCreateOrderInput } from "@/lib/validation"

export async function POST(req: Request) {
  // Rate Limit Check
  const ip = req.headers.get("x-forwarded-for") || "127.0.0.1"
  const { success } = await rateLimit(`create_order_${ip} `)

  if (!success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later.", code: "RATE_LIMIT_EXCEEDED" },
      { status: 429 }
    )
  }

  console.log("[Payment] ===== POST /api/payments/create-order called =====")
  try {
    // 1. Auth Check (Critical Security Fix)
    const authHeader = req.headers.get("Authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      console.error("[Payment] Missing or invalid authorization header")
      return errorResponse("Unauthorized", HTTP_STATUS.UNAUTHORIZED, "UNAUTHORIZED")
    }

    const token = authHeader.split("Bearer ")[1]
    const adminAuth = await getAdminAuth()

    if (!adminAuth) {
      console.error("[Payment] Firebase Auth not initialized")
      return errorResponse("Server error", HTTP_STATUS.INTERNAL_ERROR, "AUTH_INIT_FAILED")
    }

    let decodedToken
    try {
      decodedToken = await adminAuth.verifyIdToken(token)
    } catch (authError) {
      console.error("[Payment] Invalid token:", authError)
      return errorResponse("Invalid session. Please login again.", HTTP_STATUS.UNAUTHORIZED, "INVALID_TOKEN")
    }

    const userId = decodedToken.uid
    // ... continue with other checks
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

    // --- CHECK SETTINGS: ENABLE PAYMENTS ---
    const settingsDoc = await adminDb.collection("settings").doc("site-settings").get()
    const settings = settingsDoc.exists ? settingsDoc.data() : null

    if (settings && settings.enablePayments === false) {
      console.warn("[Payment] Payments are disabled in settings")
      return errorResponse(
        "Payments are currently disabled by the administrator.",
        503,
        "PAYMENTS_DISABLED"
      )
    }

    const defaultCurrency = settings?.defaultCurrency || "INR"

    const razorpayKeyId = process.env.RZP_ID
    const razorpaySecret = process.env.RZP_SECRET

    console.log("[Payment] Environment check:", {
      hasRzpId: !!razorpayKeyId,
      hasRzpSecret: !!razorpaySecret,
      rzpIdLength: razorpayKeyId?.length,
      rzpSecretLength: razorpaySecret?.length,
    })

    if (!razorpayKeyId || !razorpaySecret) {
      console.error("[Payment] Razorpay credentials not configured")
      return errorResponse(
        "Payment gateway not configured. Please contact support.",
        HTTP_STATUS.INTERNAL_ERROR,
        "PAYMENT_NOT_CONFIGURED",
      )
    }

    // Validate that credentials are properly formatted
    if (typeof razorpayKeyId !== 'string' || razorpayKeyId.trim().length === 0) {
      console.error("[Payment] Invalid RZP_ID format")
      return errorResponse(
        "Payment gateway misconfigured. Please contact support.",
        HTTP_STATUS.INTERNAL_ERROR,
        "PAYMENT_MISCONFIGURED",
      )
    }

    if (typeof razorpaySecret !== 'string' || razorpaySecret.trim().length === 0) {
      console.error("[Payment] Invalid RZP_SECRET format")
      return errorResponse(
        "Payment gateway misconfigured. Please contact support.",
        HTTP_STATUS.INTERNAL_ERROR,
        "PAYMENT_MISCONFIGURED",
      )
    }

    // ... (existing body parsing)
    let body: Record<string, unknown>
    try {
      body = await req.json()
    } catch {
      return errorResponse("Invalid request body", HTTP_STATUS.BAD_REQUEST, "INVALID_JSON")
    }

    // --- FRAUD DETECTION: Velocity Check ---
    // Prevent spam by limiting unpaid orders
    const VELOCITY_LIMIT = 5
    const VELOCITY_WINDOW_MINUTES = 60

    const timeWindowStart = new Date(Date.now() - VELOCITY_WINDOW_MINUTES * 60 * 1000)

    // Simplified query to avoid composite index requirement
    const recentOrdersSnapshot = await adminDb
      .collection("orders")
      .where("userId", "==", userId)
      .where("status", "==", "created") // Only count unpaid orders
      .get()

    // Filter by time in-memory to avoid needing a composite index
    const recentOrders = recentOrdersSnapshot.docs.filter(doc => {
      const createdAt = doc.data().createdAt?.toDate?.() || new Date(0)
      return createdAt > timeWindowStart
    })

    if (recentOrders.length >= VELOCITY_LIMIT) {
      console.warn(`[Payment] Velocity limit exceeded for user ${userId}: ${recentOrders.length} orders in ${VELOCITY_WINDOW_MINUTES}m`)
      return errorResponse(
        "You have too many pending orders. Please complete or cancel existing orders before creating a new one.",
        429,
        "VELOCITY_LIMIT_EXCEEDED"
      )
    }
    // ---------------------------------------

    const validation = validateCreateOrderInput(body)
    if (!validation.valid) {
      return errorResponse(validation.error, HTTP_STATUS.BAD_REQUEST, "VALIDATION_ERROR")
    }

    const { templateId, userEmail, userName, couponCode } = validation.data as {
      templateId: string
      userEmail: string
      userName: string
      couponCode?: string
    }

    console.log("[Payment] Received request with couponCode:", couponCode, "type:", typeof couponCode)

    // ... (existing environment var checks) ...

    try {
      // First, get the template data using Firebase Admin
      console.log("[Payment] Fetching template:", templateId)
      const templateDoc = await adminDb.collection("templates").doc(templateId).get()

      if (!templateDoc.exists) {
        console.error("[Payment] Template not found:", templateId)
        return errorResponse("Template not found", HTTP_STATUS.NOT_FOUND, "TEMPLATE_NOT_FOUND")
      }

      const template = { id: templateDoc.id, ...templateDoc.data() } as Record<string, unknown>
      console.log("[Payment] Template fetched:", { id: template.id, title: template.title, price: template.price })

      if (!template.isAvailable) {
        console.error("[Payment] Template unavailable:", templateId)
        return errorResponse("Template is currently unavailable", HTTP_STATUS.BAD_REQUEST, "TEMPLATE_UNAVAILABLE")
      }

      if (template.stockCount !== null && (template.stockCount as number) <= 0) {
        console.error("[Payment] Template out of stock:", templateId)
        return errorResponse("Template is out of stock", HTTP_STATUS.BAD_REQUEST, "OUT_OF_STOCK")
      }

      let price = Number(template.price)
      let discountAmount = 0
      let finalCouponCode = null

      // --- COUPON VALIDATION ---
      if (couponCode) {
        console.log("[Payment] Validating coupon:", couponCode)
        const couponsQuery = await adminDb
          .collection("coupons")
          .where("code", "==", couponCode)
          .where("isActive", "==", true)
          .limit(1)
          .get()

        console.log("[Payment] Coupon query result:", { empty: couponsQuery.empty, size: couponsQuery.size })

        if (!couponsQuery.empty) {
          const couponDoc = couponsQuery.docs[0]
          const coupon = couponDoc.data()

          console.log("[Payment] Coupon data:", {
            code: coupon.code,
            discountType: coupon.discountType,
            discountValue: coupon.discountValue,
            validFrom: coupon.validFrom,
            validUntil: coupon.validUntil,
            usageLimit: coupon.usageLimit,
            usedCount: coupon.usedCount,
            specificEmail: coupon.specificEmail,
            isActive: coupon.isActive
          })

          const now = new Date()

          // Check dates - handle both Admin SDK Timestamps and serialized formats
          let validFrom: Date
          let validUntil: Date

          if (coupon.validFrom?.toDate) {
            validFrom = coupon.validFrom.toDate()
          } else if (coupon.validFrom?._seconds) {
            validFrom = new Date(coupon.validFrom._seconds * 1000)
          } else if (coupon.validFrom?.seconds) {
            validFrom = new Date(coupon.validFrom.seconds * 1000)
          } else {
            validFrom = new Date(coupon.validFrom)
          }

          if (coupon.validUntil?.toDate) {
            validUntil = coupon.validUntil.toDate()
          } else if (coupon.validUntil?._seconds) {
            validUntil = new Date(coupon.validUntil._seconds * 1000)
          } else if (coupon.validUntil?.seconds) {
            validUntil = new Date(coupon.validUntil.seconds * 1000)
          } else {
            validUntil = new Date(coupon.validUntil)
          }

          console.log("[Payment] Date comparison:", {
            now: now.toISOString(),
            validFrom: validFrom.toISOString(),
            validUntil: validUntil.toISOString(),
            isAfterStart: now >= validFrom,
            isBeforeEnd: now <= validUntil
          })

          if (now >= validFrom && now <= validUntil) {
            // Check usage limit
            if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
              console.warn("[Payment] Coupon usage limit reached")
              return errorResponse("Coupon usage limit reached", HTTP_STATUS.BAD_REQUEST, "COUPON_LIMIT_REACHED")
            }

            // Check specific email
            if (coupon.specificEmail && coupon.specificEmail.toLowerCase() !== userEmail.toLowerCase()) {
              console.warn("[Payment] Coupon email mismatch")
              return errorResponse("This coupon is restricted to a different email", HTTP_STATUS.BAD_REQUEST, "COUPON_INVALID_EMAIL")
            }

            // Apply Discount
            if (coupon.discountType === "percentage") {
              discountAmount = (price * coupon.discountValue) / 100
            } else if (coupon.discountType === "fixed") {
              discountAmount = coupon.discountValue
            }

            // Ensure price doesn't go below zero
            if (discountAmount > price) {
              discountAmount = price
            }

            price = price - discountAmount
            finalCouponCode = couponCode
            console.log(`[Payment] Coupon applied successfully: ${couponCode}, Discount: ${discountAmount}, Original Price: ${Number(template.price)}, New Price: ${price} `)

          } else {
            console.warn("[Payment] Coupon expired or inactive")
            return errorResponse("Coupon is expired or inactive", HTTP_STATUS.BAD_REQUEST, "COUPON_EXPIRED")
          }
        } else {
          console.warn("[Payment] Invalid coupon code")
          return errorResponse("Invalid coupon code", HTTP_STATUS.BAD_REQUEST, "COUPON_INVALID")
        }
      }

      if (isNaN(price) || price < 0) {
        console.error("[Payment] Invalid calculated price:", price)
        return errorResponse("Invalid price calculation", HTTP_STATUS.INTERNAL_ERROR, "INVALID_PRICE")
      }

      // ... (Razorpay logic) ...

      // Razorpay logic follows...
      console.log("[Payment] Importing Razorpay module...")
      let Razorpay
      try {
        const razorpayModule = await import("razorpay")
        Razorpay = razorpayModule.default
        console.log("[Payment] Razorpay module imported successfully")
      } catch (importErr) {
        console.error("[Payment] Razorpay import error:", importErr)
        return errorResponse("Payment gateway initialization failed", HTTP_STATUS.INTERNAL_ERROR, "PAYMENT_INIT_FAILED")
      }

      let razorpay
      try {
        console.log("[Payment] Initializing Razorpay with key:", razorpayKeyId.substring(0, 5) + "...")
        razorpay = new Razorpay({
          key_id: razorpayKeyId.trim(),
          key_secret: razorpaySecret.trim(),
        })
        console.log("[Payment] Razorpay initialized successfully")
      } catch (rzpError: any) {
        console.error("[Payment] Razorpay init error:", rzpError)
        return errorResponse("Payment gateway initialization failed", HTTP_STATUS.INTERNAL_ERROR, "PAYMENT_INIT_FAILED")
      }

      let razorpayOrder
      try {
        const orderParams = {
          amount: Math.round(price * 100), // Amount in paise
          currency: (template.currency as string) || defaultCurrency,
          receipt: `order_${Date.now()}_${userId.slice(0, 8)} `,
        }
        console.log("[Payment] Creating Razorpay order with params:", orderParams)

        razorpayOrder = await razorpay.orders.create(orderParams)
        console.log("[Payment] Razorpay order created:", {
          id: razorpayOrder.id,
          amount: razorpayOrder.amount
        })
      } catch (orderError: any) {
        // ... (error handling) ...
        console.error("[Payment] Razorpay order creation error:", orderError)
        return errorResponse(
          "Failed to create payment order. Please try again.",
          HTTP_STATUS.INTERNAL_ERROR,
          "RAZORPAY_ORDER_FAILED",
        )
      }

      console.log("[Payment] Creating order in Firestore...")
      const { Timestamp } = await import("firebase-admin/firestore")

      const orderData = {
        userId,
        userEmail,
        userName,
        templates: [
          {
            templateId: template.id,
            templateTitle: template.title,
            priceAtPurchase: Number(template.price), // Store original price per item
          },
        ],
        totalAmount: price, // Final discounted price
        discountAmount: discountAmount, // NEW: Store total discount
        couponCode: finalCouponCode, // NEW: Store coupon used
        currency: (template.currency as string) || defaultCurrency,
        status: "created",
        razorpayOrderId: razorpayOrder.id,
        downloadTokens: [],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      }

      const orderRef = await adminDb.collection("orders").add(orderData)
      console.log("[Payment] Order created in Firestore:", orderRef.id)

      return successResponse({
        orderId: orderRef.id,
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount, // Returns amount to frontend
        currency: razorpayOrder.currency,
        discountAmount, // Optional: return to frontend for display
        finalPrice: price
      })
    } finally {
      // Cleanup if needed
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error"
    console.error("[Payment] ===== OUTER CATCH - Create order error =====")
    console.error("[Payment] Error message:", message)
    console.error("[Payment] Error type:", typeof error)
    console.error("[Payment] Error object:", error)
    // Log stack trace for better debugging
    if (error instanceof Error && error.stack) {
      console.error("[Payment] Create order error stack:", error.stack)
    }
    return errorResponse("Failed to create order. Please try again.", HTTP_STATUS.INTERNAL_ERROR, "CREATE_ORDER_FAILED")
  }
}