import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"
import { getCoupons, createCoupon } from "@/lib/firebase/coupons"
import { Timestamp } from "firebase-admin/firestore"
import { z } from "zod"
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin"

async function verifyAdmin(req: Request) {
    const authHeader = req.headers.get("Authorization")
    if (!authHeader?.startsWith("Bearer ")) return null

    const token = authHeader.split("Bearer ")[1]
    const auth = await getAdminAuth()
    if (!auth) return null

    try {
        const decodedToken = await auth.verifyIdToken(token)
        const db = await getAdminDb()
        if (!db) return null

        const userDoc = await db.collection("users").doc(decodedToken.uid).get()
        if (!userDoc.exists) return null

        const userData = userDoc.data()
        return userData?.role === "admin" ? decodedToken : null
    } catch {
        return null
    }
}

const createCouponSchema = z.object({
    code: z.string().min(1, "Code is required"),
    discountType: z.enum(["percentage", "fixed"], { errorMap: () => ({ message: "Invalid discount type" }) }),
    discountValue: z.number().min(0, "Discount value must be non-negative"),
    validFrom: z.string().refine(val => !isNaN(Date.parse(val)), "Invalid 'Valid From' date"),
    validUntil: z.string().refine(val => !isNaN(Date.parse(val)), "Invalid 'Valid Until' date"),
    usageLimit: z.number().nullable().optional(), // 0 is valid, null is unlimited
    specificEmail: z.string().email().optional().or(z.literal("")).nullable(),
})

export async function GET(req: Request) {
    const isAdmin = await verifyAdmin(req)
    if (!isAdmin) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const coupons = await getCoupons()
        // Sort by created desc
        coupons.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis())
        return NextResponse.json(coupons)
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function POST(req: Request) {
    const isAdmin = await verifyAdmin(req)
    if (!isAdmin) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await req.json()

        // Zod Validation
        const result = createCouponSchema.safeParse({
            ...body,
            discountValue: Number(body.discountValue),
            usageLimit: (body.usageLimit !== undefined && body.usageLimit !== null && body.usageLimit !== "") ? Number(body.usageLimit) : null
        })

        if (!result.success) {
            return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 })
        }

        const data = result.data
        const validFromDate = Date.parse(data.validFrom)
        const validUntilDate = Date.parse(data.validUntil)

        const coupon = await createCoupon({
            code: data.code.toUpperCase(),
            discountType: data.discountType as "percentage" | "fixed",
            discountValue: data.discountValue,
            validFrom: Timestamp.fromMillis(validFromDate) as any,
            validUntil: Timestamp.fromMillis(validUntilDate) as any,
            usageLimit: data.usageLimit ?? null,
            specificEmail: data.specificEmail || null,
            isActive: true,
        })

        return NextResponse.json(coupon)
    } catch (error: any) {
        console.error("Error creating coupon:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
