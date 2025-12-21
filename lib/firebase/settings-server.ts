import type { Firestore } from "firebase-admin/firestore"
import type { SiteSettings } from "./types"

/**
 * Initialize default settings using Admin SDK (Server-Side)
 */
export async function initializeDefaultSettings(adminDb: Firestore): Promise<SiteSettings> {
    const defaultSettings: Omit<SiteSettings, "id"> = {
        // Site Identity
        siteName: "n8n Templates Store",
        siteDescription: "Premium n8n automation templates to supercharge your workflows.",
        logoUrl: "",
        favicon: "/favicon.ico",

        // Branding
        heroTitle: "Automate Your Workflow with Premium n8n Templates",
        heroDescription: "Skip the complexity. Get production-ready n8n workflows that save you hours of development time.",
        footerText: "© 2024 n8n Templates Store. All rights reserved.",

        // Contact & Social
        supportEmail: "",
        socialLinks: {
            twitter: "",
            github: "",
            linkedin: "",
            instagram: "",
            youtube: ""
        },

        // Email Templates
        emailSubjectTemplate: "Your Purchase: {{templateName}}",
        emailBodyTemplate: "",
        emailFromName: "Course Store",
        emailFromAddress: "noreply@example.com", // Placeholder

        // Feature Toggles
        maintenanceMode: false,
        maintenanceMessage: "We're currently performing scheduled maintenance to improve your experience. Please check back soon!",
        enableUserRegistration: true,
        enablePayments: true,
        enableEmailNotifications: true,

        // SEO
        metaTitle: "n8n Templates Store - Premium Automation Workflows",
        metaDescription: "Get production-ready n8n automation templates. Save hours of development time.",
        metaKeywords: ["n8n", "automation", "templates", "workflows", "no-code"],
        ogImage: "/og-image.png",
        analytics: {
            googleAnalyticsId: "",
            metaPixelId: ""
        },

        // Currency & Pricing
        defaultCurrency: "INR",

        // Security
        enableAuditLog: true,

        // Timestamps
        updatedAt: new Date() as any,
        updatedBy: "system-init",
    }

    await adminDb.collection("settings").doc("site-settings").set(defaultSettings)

    return {
        id: "site-settings",
        ...defaultSettings
    } as SiteSettings
}
