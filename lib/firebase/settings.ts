import { db } from "./config"
import { doc, getDoc, setDoc, serverTimestamp, Timestamp } from "firebase/firestore"
import type { SiteSettings } from "./types"

const SETTINGS_DOC_ID = "site-settings"

/**
 * Get current site settings
 */
export async function getSettings(): Promise<SiteSettings | null> {
    try {
        const settingsDoc = await getDoc(doc(db, "settings", SETTINGS_DOC_ID))
        if (settingsDoc.exists()) {
            return { id: settingsDoc.id, ...settingsDoc.data() } as SiteSettings
        }
        return null
    } catch (error) {
        console.error("Error fetching settings:", error)
        return null
    }
}

/**
 * Update site settings (admin only)
 */
export async function updateSettings(
    updates: Partial<Omit<SiteSettings, "id" | "updatedAt">>,
    adminId: string
): Promise<void> {
    try {
        const settingsRef = doc(db, "settings", SETTINGS_DOC_ID)
        await setDoc(
            settingsRef,
            {
                ...updates,
                updatedAt: serverTimestamp(),
                updatedBy: adminId,
            },
            { merge: true }
        )
    } catch (error) {
        console.error("Error updating settings:", error)
        throw error
    }
}

/**
 * Initialize default settings if they don't exist
 */
/**
 * Initialize default settings if they don't exist
 */
export async function initializeDefaultSettings(): Promise<void> {
    const existing = await getSettings()
    if (existing) return

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
        updatedAt: serverTimestamp() as Timestamp,
        updatedBy: "system",
    }

    await setDoc(doc(db, "settings", SETTINGS_DOC_ID), defaultSettings)
}
// Removed unused whitelist functions as per new schema

