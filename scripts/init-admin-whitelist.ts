/**
 * Initialize Admin Whitelist Script
 * 
 * This script initializes the admin whitelist from environment variables
 * Run this once after deployment to set up your first admin
 */

import { initializeApp, getApps, cert } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"

// Initialize Firebase Admin
if (getApps().length === 0) {
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
    const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL
    let privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY

    if (!projectId || !clientEmail || !privateKey) {
        console.error("Missing Firebase Admin credentials")
        process.exit(1)
    }

    // Handle private key formatting
    if (privateKey.includes("\\n")) {
        privateKey = privateKey.replace(/\\n/g, "\n")
    }

    initializeApp({
        credential: cert({
            projectId,
            clientEmail,
            privateKey,
        }),
    })
}

const db = getFirestore()

async function initializeAdminWhitelist() {
    try {
        console.log("🔐 Initializing Admin Whitelist...")

        // Get admin emails from environment variable
        const adminEmailsEnv = process.env.ADMIN_WHITELIST_EMAILS || ""
        const adminEmails = adminEmailsEnv
            .split(",")
            .map(email => email.trim().toLowerCase())
            .filter(email => email.length > 0)

        if (adminEmails.length === 0) {
            console.warn("⚠️  No admin emails found in ADMIN_WHITELIST_EMAILS environment variable")
            console.log("Please add your admin email to .env file:")
            console.log("ADMIN_WHITELIST_EMAILS=your-email@example.com")
            process.exit(1)
        }

        console.log(`📧 Found ${adminEmails.length} admin email(s):`)
        adminEmails.forEach(email => console.log(`   - ${email}`))

        // Check if settings document exists
        const settingsRef = db.collection("settings").doc("site-settings")
        const settingsDoc = await settingsRef.get()

        if (settingsDoc.exists()) {
            const currentSettings = settingsDoc.data()
            const currentWhitelist = currentSettings?.adminWhitelistEmails || []

            // Merge with existing whitelist
            const mergedWhitelist = Array.from(new Set([...currentWhitelist, ...adminEmails]))

            await settingsRef.update({
                adminWhitelistEmails: mergedWhitelist,
                updatedAt: new Date(),
                updatedBy: "system-init",
            })

            console.log("✅ Admin whitelist updated successfully!")
            console.log(`📋 Total whitelisted admins: ${mergedWhitelist.length}`)
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

            console.log("✅ Settings initialized with admin whitelist!")
            console.log(`📋 Whitelisted admins: ${adminEmails.length}`)
        }

        console.log("\n🎉 Initialization complete!")
        console.log("\n📝 Next steps:")
        console.log("1. Sign in with your admin email")
        console.log("2. Navigate to Admin Dashboard → Settings")
        console.log("3. Manage additional admins from the Security tab")

    } catch (error) {
        console.error("❌ Error initializing admin whitelist:", error)
        process.exit(1)
    }
}

// Run the initialization
initializeAdminWhitelist()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
