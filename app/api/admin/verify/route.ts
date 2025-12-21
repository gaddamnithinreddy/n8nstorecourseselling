import { NextRequest, NextResponse } from "next/server"
import { logSecurityEvent } from "@/lib/firebase/audit-log"
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin"

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

        // Check if user exists and has admin role
        const userDoc = await adminDb.collection("users").doc(decodedToken.uid).get()
        const userData = userDoc.data()

        if (!userData || userData.role !== "admin") {
            await logSecurityEvent(
                "unauthorized_access",
                { attempted: "admin_verify", reason: "not_admin" },
                decodedToken.email,
                request.headers.get("x-forwarded-for") || undefined
            )
            return NextResponse.json(
                { error: "Forbidden - Admin role required", isAdmin: false, isWhitelisted: false },
                { status: 403 }
            )
        }

        // Check if admin is whitelisted via Environment Variables
        const allowedAdmins = (process.env.ADMIN_EMAILS || "").split(",").map(e => e.trim().toLowerCase()).filter(e => e.length > 0)

        // If whitelist is configured, check if user is in it. If strictly empty, allow all admins (or block all - safer to block but let's assume allow if not set to avoid lockout, or better yet, default to block if critical?)
        // Actually, typically if ADMIN_EMAILS is not set, we might rely just on the "admin" role in DB. 
        // But the previous logic implied a whitelist check. Let's keep it safe: if ADMIN_EMAILS is provided, enforce it.
        const userEmail = (decodedToken.email || "").toLowerCase()
        const isWhitelisted = allowedAdmins.length === 0 || allowedAdmins.includes(userEmail)

        if (!isWhitelisted) {
            await logSecurityEvent(
                "unauthorized_access",
                { attempted: "admin_verify", reason: "not_whitelisted" },
                decodedToken.email,
                request.headers.get("x-forwarded-for") || undefined
            )
            return NextResponse.json(
                { error: "Forbidden - Not in admin whitelist", isAdmin: true, isWhitelisted: false },
                { status: 403 }
            )
        }

        // Log successful admin verification
        await logSecurityEvent(
            "admin_login",
            { success: true },
            decodedToken.email,
            request.headers.get("x-forwarded-for") || undefined
        )

        return NextResponse.json({
            success: true,
            isAdmin: true,
            isWhitelisted: true,
            email: decodedToken.email,
        })
    } catch (error) {
        console.error("Error verifying admin:", error)
        return NextResponse.json(
            { error: "Failed to verify admin access" },
            { status: 500 }
        )
    }
}

// Forced refresh
