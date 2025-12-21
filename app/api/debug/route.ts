import { NextResponse } from "next/server"
import { isFirebaseAdminReady, getInitError, getAdminDb } from "@/lib/firebase/admin"

export async function GET() {
    const diagnostics: Record<string, any> = {}

    // Check Firebase Admin
    try {
        const isReady = await isFirebaseAdminReady()
        diagnostics.firebaseAdmin = {
            isReady,
            initError: getInitError(),
        }

        if (isReady) {
            const db = await getAdminDb()
            diagnostics.firebaseAdmin.dbConnected = !!db
        }
    } catch (error) {
        diagnostics.firebaseAdmin = {
            error: error instanceof Error ? error.message : String(error),
        }
    }

    // Check environment variables
    diagnostics.environment = {
        hasRzpId: !!process.env.RZP_ID,
        hasRzpSecret: !!process.env.RZP_SECRET,
        rzpIdLength: process.env.RZP_ID?.length || 0,
        rzpSecretLength: process.env.RZP_SECRET?.length || 0,
        hasFirebaseProjectId: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        hasFirebaseClientEmail: !!process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        hasFirebasePrivateKey: !!process.env.FIREBASE_ADMIN_PRIVATE_KEY,
        privateKeyFormat: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.includes("BEGIN PRIVATE KEY") ? "valid" : "invalid",
    }

    // Test Razorpay import
    try {
        const razorpayModule = await import("razorpay")
        diagnostics.razorpay = {
            imported: true,
            hasDefault: !!razorpayModule.default,
        }
    } catch (error) {
        diagnostics.razorpay = {
            imported: false,
            error: error instanceof Error ? error.message : String(error),
        }
    }

    return NextResponse.json(diagnostics, { status: 200 })
}
