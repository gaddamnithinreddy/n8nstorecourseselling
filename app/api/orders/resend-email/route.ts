import { type NextRequest, NextResponse } from "next/server"
import { getAdminDb, isFirebaseAdminReady, getAdminAuth } from "@/lib/firebase/admin"
import { z } from "zod"

const resendEmailSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
})

export async function POST(req: NextRequest) {
  try {
    // 1. Auth Check (Admin Only for now)
    const authHeader = req.headers.get("Authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.split("Bearer ")[1]
    const auth = await getAdminAuth()
    if (!auth) return NextResponse.json({ error: "Server error" }, { status: 500 })

    try {
      const decodedToken = await auth.verifyIdToken(token)
      // Check role
      const db = await getAdminDb()
      if (!db) return NextResponse.json({ error: "DB error" }, { status: 500 })
      const userDoc = await db.collection("users").doc(decodedToken.uid).get()
      if (!userDoc.exists || userDoc.data()?.role !== "admin") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const isReady = await isFirebaseAdminReady()
    if (!isReady) {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }

    const adminDb = await getAdminDb()
    if (!adminDb) {
      return NextResponse.json({ error: "Database connection failed" }, { status: 500 })
    }

    const body = await req.json()
    const result = resendEmailSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 })
    }

    const { orderId } = result.data

    // Get order
    const orderDoc = await adminDb.collection("orders").doc(orderId).get()
    if (!orderDoc.exists) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    const order = orderDoc.data() as Record<string, unknown>

    if (order.status !== "paid") {
      return NextResponse.json({ error: "Can only resend email for paid orders" }, { status: 400 })
    }

    // Get template details
    const templateDetails = await Promise.all(
      (order.templates as Array<{ templateId: string }>).map(async (t) => {
        const doc = await adminDb.collection("templates").doc(t.templateId).get()
        return { ...t, ...doc.data() }
      }),
    )

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

    // Send email
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "n8n Store <noreply@yourdomain.com>",
        to: order.userEmail,
        subject: `[Resent] Your Purchase: ${templateDetails.map((t: Record<string, unknown>) => t.title).join(", ")}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #6366f1;">Your Download Links</h1>
            <p>Hi ${order.userName},</p>
            <p>Here are your download links for your purchase:</p>
            
            ${templateDetails
            .map(
              (t: Record<string, unknown>, i: number) => `
              <div style="background: #18181b; padding: 16px; border-radius: 8px; margin: 16px 0;">
                <h3 style="color: #fff; margin: 0 0 8px 0;">${t.title}</h3>
                <a href="${baseUrl}/api/downloads/${(order.downloadTokens as Array<{ token: string }>)[i]?.token}" 
                   style="background: #6366f1; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  Download Template
                </a>
              </div>
            `,
            )
            .join("")}
            
            <p style="color: #a1a1aa; font-size: 14px;">
              Download links expire 7 days from original purchase. Access your purchases anytime from your dashboard.
            </p>
          </div>
        `,
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to send email")
    }

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to resend email"
    console.error("Resend email error:", message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
