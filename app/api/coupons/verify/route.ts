import { NextResponse } from "next/server"
import { validateCoupon } from "@/lib/firebase/coupons"
import { rateLimit } from "@/lib/ratelimit"
import { z } from "zod"

const verifyCouponSchema = z.object({
    code: z.string().min(1, "Coupon code is required"),
    userEmail: z.string().email("Invalid email address"),
    templatePrice: z.number().min(0, "Price must be non-negative").optional().default(0),
})

export async function POST(req: Request) {
    // Rate Limit Check
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1"
    const { success } = await rateLimit(`coupon_verify_${ip}`)

    if (!success) {
        return NextResponse.json(
            { valid: false, message: "Too many requests. Please try again later." },
            { status: 429 }
        )
    }

    try {
        const body = await req.json()
        const validationResult = verifyCouponSchema.safeParse(body)

        if (!validationResult.success) {
            return NextResponse.json(
                { valid: false, message: "Invalid request data", errors: validationResult.error.format() },
                { status: 400 }
            )
        }

        const { code, userEmail, templatePrice } = validationResult.data



        const { isValid, error, coupon } = await validateCoupon(code, userEmail)





        if (!isValid) {

            return NextResponse.json({ valid: false, message: error }, { status: 200 })
        }

        // Calculate discount
        const price = templatePrice || 0
        let discountAmount = 0

        if (coupon!.discountType === "percentage") {
            discountAmount = (price * coupon!.discountValue) / 100
        } else {
            discountAmount = coupon!.discountValue
        }

        // Ensure discount doesn't exceed price
        if (discountAmount > price) {
            discountAmount = price
        }

        const finalPrice = Math.max(0, price - discountAmount)



        return NextResponse.json({
            valid: true,
            discountAmount,
            discountType: coupon!.discountType,
            finalPrice,
            coupon
        })
    } catch (error: any) {
        console.error("[Coupon Verify] Error:", error)
        return NextResponse.json({ valid: false, message: error.message }, { status: 500 })
    }
}
