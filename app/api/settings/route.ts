import { NextRequest, NextResponse } from "next/server"

import { createAuditLog } from "@/lib/firebase/audit-log"
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin"

export async function GET() {
    try {
        const adminDb = await getAdminDb()
        if (!adminDb) {
            return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
        }

        const settingsRef = adminDb.collection("settings").doc("site-settings")
        const doc = await settingsRef.get()

        if (doc.exists) {
            return NextResponse.json({ id: doc.id, ...doc.data() })
        }

        // Initialize default settings if they don't exist
        const { initializeDefaultSettings } = await import("@/lib/firebase/settings-server")
        const newSettings = await initializeDefaultSettings(adminDb)

        return NextResponse.json(newSettings)
    } catch (error) {
        console.error("Error fetching settings:", error)
        return NextResponse.json(
            { error: "Failed to fetch settings" },
            { status: 500 }
        )
    }
}

export async function PUT(request: NextRequest) {
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
            return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 })
        }

        // Check if admin is whitelisted
        // Check if admin is whitelist
        const settingsDoc = await adminDb.collection("settings").doc("site-settings").get()
        const currentSettings = settingsDoc.data()

        if (currentSettings && currentSettings.adminWhitelistEmails && currentSettings.adminWhitelistEmails.length > 0) {
            const isWhitelisted = currentSettings.adminWhitelistEmails
                .map((e: string) => e.toLowerCase().trim())
                .includes(decodedToken.email?.toLowerCase().trim() || "")

            if (!isWhitelisted) {
                return NextResponse.json(
                    { error: "Forbidden - Not in admin whitelist" },
                    { status: 403 }
                )
            }
        }

        const updates = await request.json()

        // Update settings using Admin SDK
        await adminDb.collection("settings").doc("site-settings").set({
            ...updates,
            updatedAt: new Date(),
            updatedBy: decodedToken.uid,
        }, { merge: true })

        // Create audit log
        await createAuditLog(
            decodedToken.uid,
            decodedToken.email || "unknown",
            "Updated site settings",
            "settings",
            { updates },
            request.headers.get("x-forwarded-for") || undefined,
            request.headers.get("user-agent") || undefined
        )

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error updating settings:", error)
        return NextResponse.json(
            { error: "Failed to update settings" },
            { status: 500 }
        )
    }
}
