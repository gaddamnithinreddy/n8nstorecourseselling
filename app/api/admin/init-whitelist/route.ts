import { NextRequest, NextResponse } from "next/server"
import { getAdminDb } from "@/lib/firebase/admin"

/**
 * Initialize Admin Whitelist API
 * Call this endpoint once to set up the admin whitelist from environment variables
 * 
 * Usage: GET /api/admin/init-whitelist
 */
export async function GET(request: NextRequest) {
    try {
        console.log("🔐 Initializing Admin Whitelist...")

        const adminDb = await getAdminDb()
        if (!adminDb) {
            return NextResponse.json(
                { error: "Firebase Admin not configured" },
                { status: 500 }
            )
        }

        // Get admin emails from environment variable
        const adminEmailsEnv = process.env.ADMIN_WHITELIST_EMAILS || ""
        const adminEmails = adminEmailsEnv
            .split(",")
            .map(email => email.trim().toLowerCase())
            .filter(email => email.length > 0)

        if (adminEmails.length === 0) {
            return NextResponse.json(
                {
                    error: "No admin emails found in ADMIN_WHITELIST_EMAILS environment variable",
                    instructions: "Add your admin email to .env file: ADMIN_WHITELIST_EMAILS=your-email@example.com"
                },
                { status: 400 }
            )
        }

        console.log(`📧 Found ${adminEmails.length} admin email(s):`, adminEmails)

        // Check if settings document exists
        const settingsRef = adminDb.collection("settings").doc("site-settings")
        const settingsDoc = await settingsRef.get()

        if (settingsDoc.exists) {
            const currentSettings = settingsDoc.data()
            const currentWhitelist = currentSettings?.adminWhitelistEmails || []

            // Merge with existing whitelist
            const mergedWhitelist = Array.from(new Set([...currentWhitelist, ...adminEmails]))

            await settingsRef.update({
                adminWhitelistEmails: mergedWhitelist,
                updatedAt: new Date(),
                updatedBy: "system-init",
            })

            return NextResponse.json({
                success: true,
                message: "Admin whitelist updated successfully!",
                totalAdmins: mergedWhitelist.length,
                newAdmins: adminEmails.filter(email => !currentWhitelist.includes(email)),
                allAdmins: mergedWhitelist,
            })
        } else {
            // Create new settings document with defaults
            const defaultSettings = {
                // Site Identity
                siteName: "n8n Templates Store",
                siteDescription: "Premium n8n automation templates to supercharge your workflows",
                logo: "/logo.png",
                favicon: "/favicon.ico",

                // Branding
                primaryColor: "#6366f1",
                heroTitle: "Supercharge Your Workflows",
                heroDescription: "Get production-ready n8n automation templates. Save hours of development time.",

                // Email Templates
                emailSubjectTemplate: "Your {{templateName}} is ready!",
                emailBodyTemplate: "Thank you for your purchase. Your template is ready to download.",
                emailFromName: "n8n Store",
                emailFromAddress: "noreply@yourdomain.com",

                // Feature Toggles
                maintenanceMode: false,
                maintenanceMessage: "We're currently performing maintenance. Please check back soon!",
                enableUserRegistration: true,
                enablePayments: true,
                enableEmailNotifications: true,

                // SEO
                metaTitle: "n8n Templates Store - Premium Automation Workflows",
                metaDescription: "Get production-ready n8n automation templates. Save hours of development time with our premium workflow collection.",
                metaKeywords: ["n8n", "automation", "templates", "workflows", "no-code"],
                ogImage: "/og-image.png",

                // Currency & Pricing
                defaultCurrency: "INR",
                currencySymbol: "₹",

                // Security
                adminWhitelistEmails: adminEmails,
                adminSessionTimeout: 3600000, // 1 hour
                enableAuditLog: true,

                // Timestamps
                updatedAt: new Date(),
                updatedBy: "system-init",
            }

            await settingsRef.set(defaultSettings)

            return NextResponse.json({
                success: true,
                message: "Settings initialized with admin whitelist!",
                totalAdmins: adminEmails.length,
                newAdmins: adminEmails,
                allAdmins: adminEmails,
            })
        }
    } catch (error) {
        console.error("❌ Error initializing admin whitelist:", error)
        return NextResponse.json(
            {
                error: "Failed to initialize admin whitelist",
                details: error instanceof Error ? error.message : String(error)
            },
            { status: 500 }
        )
    }
}
