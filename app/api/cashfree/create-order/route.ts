import { NextResponse } from "next/server"
import { successResponse, errorResponse, HTTP_STATUS } from "@/lib/api-response"
import { getAdminDb, getAdminAuth, isFirebaseAdminReady, getInitError } from "@/lib/firebase/admin"
import { validateCreateOrderInput } from "@/lib/validation"
import { rateLimit } from "@/lib/ratelimit"
import { createCashfreeOrder } from "@/lib/cashfree-api" // Direct API utility

export async function POST(req: Request) {
    // 1. Rate Limit Check
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1"
    const { success } = await rateLimit.limit(ip)

    if (!success) {
        return errorResponse("Too many requests", HTTP_STATUS.TOO_MANY_REQUESTS, "RATE_LIMIT_EXCEEDED")
    }

    try {
        // 2. Auth Check
        const authHeader = req.headers.get("Authorization")
        if (!authHeader?.startsWith("Bearer ")) {
            console.error("[Cashfree] Missing or invalid authorization header")
            return errorResponse("Unauthorized", HTTP_STATUS.UNAUTHORIZED, "UNAUTHORIZED")
        }

        const token = authHeader.split("Bearer ")[1]
        const adminAuth = await getAdminAuth()

        if (!adminAuth) {
            console.error("[Cashfree] Firebase Auth not initialized")
            return errorResponse("Server error", HTTP_STATUS.INTERNAL_ERROR, "AUTH_INIT_FAILED")
        }

        let decodedToken
        try {
            decodedToken = await adminAuth.verifyIdToken(token)
        } catch (authError) {
            console.error("[Cashfree] Invalid token:", authError)
            return errorResponse("Invalid session. Please login again.", HTTP_STATUS.UNAUTHORIZED, "INVALID_TOKEN")
        }

        const userId = decodedToken.uid
        const isReady = await isFirebaseAdminReady()
        if (!isReady) {
            const initErr = getInitError()
            console.error("[Cashfree] Firebase Admin not initialized:", initErr)
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

        // 3. Check Site Settings
        const settingsDoc = await adminDb.collection("settings").doc("site-settings").get()
        let settings: any = {}
        if (settingsDoc.exists) {
            settings = settingsDoc.data()
            if (settings?.enablePayments === false) {
                return errorResponse(
                    "Payments are currently disabled by the administrator.",
                    503,
                    "PAYMENTS_DISABLED"
                )
            }
        }

        // Check Cashfree credentials present in Environment (redundant safety check)
        if (!process.env.CASHFREE_APP_ID || !process.env.CASHFREE_SECRET_KEY) {
            console.error("[Cashfree] Credentials not configured")
            return errorResponse(
                "Payment gateway not configured.",
                HTTP_STATUS.INTERNAL_ERROR,
                "PAYMENT_CONFIG_ERROR"
            )
        }

        // 4. Parse Body
        let body: Record<string, unknown>
        try {
            body = await req.json()
        } catch {
            return errorResponse("Invalid request body", HTTP_STATUS.BAD_REQUEST, "INVALID_JSON")
        }

        // 5. Fraud Detection: Velocity Check
        const VELOCITY_LIMIT = 10
        const VELOCITY_WINDOW_MINUTES = 60
        const timeWindowStart = new Date(Date.now() - VELOCITY_WINDOW_MINUTES * 60 * 1000)

        const recentOrdersSnapshot = await adminDb
            .collection("orders")
            .where("userId", "==", userId)
            .where("status", "==", "created")
            .get()

        const recentOrders = recentOrdersSnapshot.docs.filter(doc => {
            const createdAt = doc.data().createdAt?.toDate?.() || new Date(0)
            return createdAt > timeWindowStart
        })

        if (recentOrders.length >= VELOCITY_LIMIT) {
            console.warn(`[Cashfree] Velocity limit exceeded for user ${userId}`)
            return errorResponse(
                "You have too many pending orders. Please complete or cancel existing orders.",
                429,
                "VELOCITY_LIMIT_EXCEEDED"
            )
        }

        // 6. Output Validation
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

        // 7. Fetch Template & Price Calculation
        const templateDoc = await adminDb.collection("templates").doc(templateId).get()
        if (!templateDoc.exists) {
            return errorResponse("Template not found", HTTP_STATUS.NOT_FOUND, "TEMPLATE_NOT_FOUND")
        }

        const template = { id: templateDoc.id, ...templateDoc.data() } as Record<string, unknown>

        if (!template.isAvailable) {
            return errorResponse("Template unavailable", HTTP_STATUS.BAD_REQUEST, "TEMPLATE_UNAVAILABLE")
        }
        if (template.stockCount !== null && (template.stockCount as number) <= 0) {
            return errorResponse("Out of stock", HTTP_STATUS.BAD_REQUEST, "OUT_OF_STOCK")
        }

        let price = Number(template.price)
        let discountAmount = 0
        let finalCouponCode = null

        // Coupon Logic
        if (couponCode) {
            const couponsQuery = await adminDb
                .collection("coupons")
                .where("code", "==", couponCode)
                .where("isActive", "==", true)
                .limit(1)
                .get()

            if (!couponsQuery.empty) {
                const coupon = couponsQuery.docs[0].data()
                // Assume coupon is valid per previous logic
                if (coupon.discountType === "percentage") {
                    discountAmount = (price * coupon.discountValue) / 100
                } else if (coupon.discountType === "fixed") {
                    discountAmount = coupon.discountValue
                }
                if (discountAmount > price) discountAmount = price
                price = price - discountAmount
                finalCouponCode = couponCode
            }
        }

        // 8. Order Creation Phase
        const orderId = `order_${Date.now()}_${userId.slice(0, 8)}`

        // Firestore Order
        const { Timestamp } = await import("firebase-admin/firestore")
        const dbOrderData = {
            userId,
            userEmail,
            userName,
            templates: [{
                templateId: template.id,
                templateTitle: template.title,
                priceAtPurchase: Number(template.price),
            }],
            totalAmount: price,
            discountAmount,
            couponCode: finalCouponCode,
            currency: (template.currency as string) || settings.defaultCurrency || "INR",
            status: "created",
            cashfreeOrderId: orderId,
            downloadTokens: [],
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        }

        const orderRef = await adminDb.collection("orders").add(dbOrderData)

        // 9. Call Cashfree API (Direct Fetch)
        try {
            const request = {
                order_amount: price,
                order_currency: (template.currency as string) || settings.defaultCurrency || "INR",
                order_id: orderId,
                customer_details: {
                    customer_id: userId,
                    customer_phone: "9999999999",
                    customer_name: userName,
                    customer_email: userEmail
                },
                order_meta: {
                    return_url: `${req.headers.get("origin")}/checkout/result?order_id={order_id}`,
                    notify_url: `${req.headers.get("origin")}/api/cashfree/webhook`
                }
            }

            // USE NEW DIRECT API UTILITY
            const responseData = await createCashfreeOrder(request)

            // Update order with payment_session_id if useful, or just return it
            return successResponse({
                orderId: orderRef.id, // Firestore ID
                cashfreeOrderId: orderId, // Cashfree ID
                paymentSessionId: responseData.payment_session_id,
                amount: price,
                currency: request.order_currency
            })

        } catch (error: any) {
            console.error("[Cashfree] Create Order Error:", error.message || error)
            // Cleanup failed order
            await orderRef.delete()
            return errorResponse(
                error.message || "Payment gateway error",
                HTTP_STATUS.INTERNAL_ERROR,
                "CASHFREE_ERROR"
            )
        }

    } catch (error: unknown) {
        console.error("[Cashfree] Outer Error:", error)
        return errorResponse("Internal server error", HTTP_STATUS.INTERNAL_ERROR, "INTERNAL_ERROR")
    }
}
