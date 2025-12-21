import { NextRequest, NextResponse } from "next/server"
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin"
import { isAdminWhitelisted, addAdminToWhitelist, removeAdminFromWhitelist } from "@/lib/firebase/settings"
import { createAuditLog } from "@/lib/firebase/audit-log"

export async function POST(request: NextRequest) {
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

        // Check if requesting admin is whitelisted
        const isWhitelisted = await isAdminWhitelisted(decodedToken.email || "")
        if (!isWhitelisted) {
            return NextResponse.json({ error: "Forbidden - Not whitelisted" }, { status: 403 })
        }

        const { action, email } = await request.json()

        if (!email || !email.includes("@")) {
            return NextResponse.json({ error: "Invalid email address" }, { status: 400 })
        }

        if (action === "add") {
            await addAdminToWhitelist(email, decodedToken.uid)

            await createAuditLog(
                decodedToken.uid,
                decodedToken.email || "unknown",
                `Added ${email} to admin whitelist`,
                "security",
                { email, action: "whitelist_add" },
                request.headers.get("x-forwarded-for") || undefined,
                request.headers.get("user-agent") || undefined
            )

            return NextResponse.json({ success: true, message: "Admin added to whitelist" })
        } else if (action === "remove") {
            // Prevent removing yourself
            if (email.toLowerCase() === decodedToken.email?.toLowerCase()) {
                return NextResponse.json(
                    { error: "Cannot remove yourself from whitelist" },
                    { status: 400 }
                )
            }

            await removeAdminFromWhitelist(email, decodedToken.uid)

            await createAuditLog(
                decodedToken.uid,
                decodedToken.email || "unknown",
                `Removed ${email} from admin whitelist`,
                "security",
                { email, action: "whitelist_remove" },
                request.headers.get("x-forwarded-for") || undefined,
                request.headers.get("user-agent") || undefined
            )

            return NextResponse.json({ success: true, message: "Admin removed from whitelist" })
        } else {
            return NextResponse.json({ error: "Invalid action" }, { status: 400 })
        }
    } catch (error) {
        console.error("Error managing whitelist:", error)
        return NextResponse.json(
            { error: "Failed to manage whitelist" },
            { status: 500 }
        )
    }
}
