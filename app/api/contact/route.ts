import { NextResponse } from "next/server"
import { getAdminDb } from "@/lib/firebase/admin"
import { Timestamp } from "firebase-admin/firestore"

export async function POST(req: Request) {
    try {
        const adminDb = await getAdminDb()
        if (!adminDb) {
            throw new Error("Firebase Admin not initialized")
        }

        const body = await req.json()
        const { name, email, subject, message, userId } = body

        if (!name || !email || !subject || !message) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        // Rate Limiting Logic
        const ip = req.headers.get("x-forwarded-for") || "unknown"
        const sanitizedIp = ip.replace(/[^a-zA-Z0-9]/g, "_") // Sanitize for doc ID
        const rateLimitRef = adminDb.collection("rateLimits").doc(sanitizedIp)
        const rateLimitDoc = await rateLimitRef.get()
        const now = Timestamp.now()
        const oneHourAgo = new Date(now.toMillis() - 60 * 60 * 1000)

        let requestCount = 0
        let windowStart = now

        if (rateLimitDoc.exists) {
            const data = rateLimitDoc.data()
            if (data?.windowStart?.toDate() > oneHourAgo) {
                // Within window
                if ((data?.count || 0) >= 5) {
                    return NextResponse.json(
                        { error: "Too many requests. Please try again later." },
                        { status: 429 }
                    )
                }
                requestCount = data?.count || 0
                windowStart = data?.windowStart
            }
        }

        // Update rate limit
        await rateLimitRef.set({
            count: requestCount + 1,
            windowStart: windowStart,
            lastRequest: now
        })

        const docRef = await adminDb.collection("messages").add({
            userId: userId || null,
            name,
            email,
            subject,
            message,
            status: "unread",
            createdAt: Timestamp.now(),
        })

        return NextResponse.json({ id: docRef.id, success: true })
    } catch (error) {
        console.error("Error submitting contact form:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
