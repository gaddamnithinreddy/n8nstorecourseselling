import { NextRequest, NextResponse } from "next/server"
import { getAuditLogs, getSecurityEvents } from "@/lib/firebase/audit-log"
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin"
import { isAdminWhitelisted } from "@/lib/firebase/settings"

export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get("authorization")
        if (!authHeader?.startsWith("Bearer ")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const token = authHeader.split("Bearer ")[1]
        const auth = await getAdminAuth()
        const adminDb = await getAdminDb()

        if (!auth || !adminDb) {
            return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
        }

        const decodedToken = await auth.verifyIdToken(token)

        // Check if user is admin
        const userDoc = await adminDb.collection("users").doc(decodedToken.uid).get()
        const userData = userDoc.data()

        if (!userData || userData.role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        // Check if admin is whitelisted
        const isWhitelisted = await isAdminWhitelisted(decodedToken.email || "")
        if (!isWhitelisted) {
            return NextResponse.json({ error: "Forbidden - Not whitelisted" }, { status: 403 })
        }

        const { searchParams } = new URL(request.url)
        const type = searchParams.get("type") || "audit" // 'audit' or 'security'
        const limit = parseInt(searchParams.get("limit") || "100")

        if (type === "security") {
            const events = await getSecurityEvents(limit)
            return NextResponse.json({ events })
        } else {
            const logs = await getAuditLogs(limit)
            return NextResponse.json({ logs })
        }
    } catch (error) {
        console.error("Error fetching logs:", error)
        return NextResponse.json(
            { error: "Failed to fetch logs" },
            { status: 500 }
        )
    }
}
