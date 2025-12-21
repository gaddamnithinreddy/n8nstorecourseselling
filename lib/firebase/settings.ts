import { db } from "./config"
import { doc, getDoc, setDoc, serverTimestamp, Timestamp, collection, getDocs, query, where, deleteDoc, addDoc } from "firebase/firestore"
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

/**
 * Check if an email is in the admin whitelist
 */
export async function isAdminWhitelisted(email: string): Promise<boolean> {
    if (!email) return false

    try {
        const whitelistQuery = query(
            collection(db, "adminWhitelist"),
            where("email", "==", email.toLowerCase())
        )
        const snapshot = await getDocs(whitelistQuery)
        return !snapshot.empty
    } catch (error) {
        console.error("Error checking whitelist:", error)
        return false
    }
}

/**
 * Add an email to the admin whitelist
 */
export async function addAdminToWhitelist(email: string, addedBy: string): Promise<void> {
    const normalizedEmail = email.toLowerCase()

    // Check if already exists
    const isWhitelisted = await isAdminWhitelisted(normalizedEmail)
    if (isWhitelisted) return

    await addDoc(collection(db, "adminWhitelist"), {
        email: normalizedEmail,
        addedBy,
        addedAt: serverTimestamp(),
    })
}

/**
 * Remove an email from the admin whitelist
 */
export async function removeAdminFromWhitelist(email: string, removedBy: string): Promise<void> {
    const normalizedEmail = email.toLowerCase()

    const whitelistQuery = query(
        collection(db, "adminWhitelist"),
        where("email", "==", normalizedEmail)
    )
    const snapshot = await getDocs(whitelistQuery)

    const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref))
    await Promise.all(deletePromises)
}
