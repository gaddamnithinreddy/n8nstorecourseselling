import { NextRequest } from "next/server"
import { successResponse, errorResponse, HTTP_STATUS } from "@/lib/api-response"
import { getAdminDb, isFirebaseAdminReady, getInitError } from "@/lib/firebase/admin"
import { sendPurchaseEmail } from "@/lib/email-service"
import { incrementCouponUsageByCode, recordCouponPurchase } from "@/lib/firebase/coupons"
import Cashfree from "@/lib/cashfree"
import crypto from "crypto"

export async function POST(req: NextRequest) {

    try {
        const isReady = await isFirebaseAdminReady()
        if (!isReady) {
            const initErr = getInitError()
            console.error("[Cashfree] Firebase Admin not initialized:", initErr)
            return errorResponse(
                "Server configuration error.",
                HTTP_STATUS.INTERNAL_ERROR,
                "SERVER_CONFIG_ERROR",
            )
        }

        const adminDb = await getAdminDb()
        if (!adminDb) {
            return errorResponse(
                "Database connection failed.",
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

        const { orderId } = body as { orderId: string }
        if (!orderId) {
            return errorResponse("Missing orderId", HTTP_STATUS.BAD_REQUEST, "MISSING_ORDER_ID")
        }



        // Get order by Cashfree Order ID (since redirect passes that)
        const orderQuery = await adminDb.collection("orders")
            .where("cashfreeOrderId", "==", orderId)
            .limit(1)
            .get()

        if (orderQuery.empty) {
            console.error("[Cashfree] Order not found for Cashfree ID:", orderId)
            return errorResponse("Order not found", HTTP_STATUS.NOT_FOUND, "ORDER_NOT_FOUND")
        }

        const orderDoc = orderQuery.docs[0]
        const firestoreOrderId = orderDoc.id // This is the actual DB ID
        const order = { id: firestoreOrderId, ...orderDoc.data() } as Record<string, unknown>
        const cashfreeOrderId = order.cashfreeOrderId as string // Should match input orderId

        if (order.status === "paid") {
            console.error("[Cashfree] Order already paid:", firestoreOrderId)
            return successResponse({
                message: "Payment already verified",
                orderTotal: order.totalAmount,
                currency: order.currency
            })
        }

        // Call Cashfree API to verify payment status
        try {

            const response = await Cashfree.PGOrderFetchPayments(cashfreeOrderId)
            const payments = response.data

            // Check for any successful payment
            const successfulPayment = payments?.find((p: any) => p.payment_status === "SUCCESS")

            if (!successfulPayment) {
                console.warn("[Cashfree] No successful payment found for:", cashfreeOrderId)
                return errorResponse("Payment not successful", HTTP_STATUS.BAD_REQUEST, "PAYMENT_FAILED")
            }



            // Payment is SUCCESS. Fulfill order.

            // Generate download tokens and update order in a BATCH
            const { Timestamp } = await import("firebase-admin/firestore")
            const batch = adminDb.batch()

            const tokens: Array<{ templateId: string; token: string; expiresAt: any }> = []
            const templateIds = (order.templates as Array<{ templateId: string }>).map((t) => t.templateId)

            for (const templateId of templateIds) {
                const token = crypto.randomBytes(32).toString("hex")
                const expiresAt = new Date()
                expiresAt.setDate(expiresAt.getDate() + 7)
                const expiresAtTimestamp = Timestamp.fromDate(expiresAt)

                const tokenData = {
                    userId: order.userId,
                    templateId,
                    orderId: firestoreOrderId, // Link to Firestore ID
                    token,
                    expiresAt: expiresAtTimestamp,
                    createdAt: Timestamp.now(),
                }

                const tokenRef = adminDb.collection("downloadTokens").doc()
                batch.set(tokenRef, tokenData)

                tokens.push({
                    templateId,
                    token,
                    expiresAt: expiresAtTimestamp
                })
            }

            const orderRef = adminDb.collection("orders").doc(firestoreOrderId) // Update using Firestore ID
            batch.update(orderRef, {
                downloadTokens: tokens,
                updatedAt: Timestamp.now(),
                status: "paid",
                paymentId: successfulPayment.cf_payment_id
            })

            await batch.commit()

            // Send email
            try {
                // Increment Coupon Usage and Record Purchase if applicable
                if (order.couponCode) {
                    try {

                        await incrementCouponUsageByCode(order.couponCode as string)

                        // Record the purchase details
                        await recordCouponPurchase(order.couponCode as string, {
                            userId: order.userId as string,
                            userEmail: order.userEmail as string,
                            userName: order.userName as string,
                            orderId: firestoreOrderId,
                            amount: order.totalAmount as number,
                            discountApplied: (order.discountAmount as number) || 0
                        })

                    } catch (couponError) {
                        console.error("[Cashfree] Failed to update coupon:", couponError)
                        // Don't fail the verification for this, just log it
                    }
                }


                await sendPurchaseEmail(
                    {
                        userEmail: order.userEmail as string,
                        userName: order.userName as string,
                        templates: order.templates as Array<{ templateTitle: string; priceAtPurchase: number }>,
                    },
                    tokens,
                )

            } catch (emailError: any) {
                console.error("[Cashfree] Failed to send purchase email:", emailError)
            }

            return successResponse({
                message: "Payment verified successfully",
                orderTotal: order.totalAmount,
                currency: order.currency
            })

        } catch (apiError: any) {
            console.error("[Cashfree] API Error:", apiError.response?.data?.message || apiError)
            return errorResponse("Failed to verify payment with gateway", HTTP_STATUS.INTERNAL_ERROR, "GATEWAY_ERROR")
        }

    } catch (error: unknown) {
        console.error("[Cashfree] Inner verify error:", error)
        return errorResponse("Failed to verify payment.", HTTP_STATUS.INTERNAL_ERROR, "VERIFY_PAYMENT_FAILED")
    }
}
