import { getAdminDb } from "./admin"
import type { AdminAuditLog, SecurityEvent } from "./types"

/**
 * Create an audit log entry for admin actions (SERVER-SIDE ONLY)
 */
export async function createAuditLog(
    adminId: string,
    adminEmail: string,
    action: string,
    category: AdminAuditLog["category"],
    details: Record<string, any>,
    ipAddress?: string,
    userAgent?: string
): Promise<void> {
    try {
        const adminDb = await getAdminDb()
        if (!adminDb) {
            console.error("Firebase Admin not initialized")
            return
        }

        // Check if audit logging is enabled
        const settingsDoc = await adminDb.collection("settings").doc("site-settings").get()
        if (settingsDoc.exists) {
            const settings = settingsDoc.data()
            if (settings?.enableAuditLog === false) {
                return
            }
        }

        const logEntry = {
            adminId,
            adminEmail,
            action,
            category,
            details,
            ipAddress,
            userAgent,
            timestamp: new Date(),
        }

        await adminDb.collection("auditLogs").add(logEntry)
    } catch (error) {
        console.error("Error creating audit log:", error)
        // Don't throw - audit logging should not break the main flow
    }
}

/**
 * Get recent audit logs (SERVER-SIDE ONLY)
 */
export async function getAuditLogs(limitCount: number = 100): Promise<AdminAuditLog[]> {
    try {
        const adminDb = await getAdminDb()
        if (!adminDb) return []

        const snapshot = await adminDb
            .collection("auditLogs")
            .orderBy("timestamp", "desc")
            .limit(limitCount)
            .get()

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        })) as AdminAuditLog[]
    } catch (error) {
        console.error("Error fetching audit logs:", error)
        return []
    }
}

/**
 * Get audit logs for a specific admin (SERVER-SIDE ONLY)
 */
export async function getAdminAuditLogs(adminId: string, limitCount: number = 50): Promise<AdminAuditLog[]> {
    try {
        const adminDb = await getAdminDb()
        if (!adminDb) return []

        const snapshot = await adminDb
            .collection("auditLogs")
            .where("adminId", "==", adminId)
            .orderBy("timestamp", "desc")
            .limit(limitCount)
            .get()

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        })) as AdminAuditLog[]
    } catch (error) {
        console.error("Error fetching admin audit logs:", error)
        return []
    }
}

/**
 * Log a security event (SERVER-SIDE ONLY)
 */
export async function logSecurityEvent(
    type: SecurityEvent["type"],
    details: Record<string, any>,
    email?: string,
    ipAddress?: string
): Promise<void> {
    try {
        const adminDb = await getAdminDb()
        if (!adminDb) {
            console.error("Firebase Admin not initialized")
            return
        }

        const event = {
            type,
            email,
            ipAddress,
            details,
            timestamp: new Date(),
        }

        await adminDb.collection("securityEvents").add(event)
    } catch (error) {
        console.error("Error logging security event:", error)
    }
}

/**
 * Get recent security events (SERVER-SIDE ONLY)
 */
export async function getSecurityEvents(limitCount: number = 100): Promise<SecurityEvent[]> {
    try {
        const adminDb = await getAdminDb()
        if (!adminDb) return []

        const snapshot = await adminDb
            .collection("securityEvents")
            .orderBy("timestamp", "desc")
            .limit(limitCount)
            .get()

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        })) as SecurityEvent[]
    } catch (error) {
        console.error("Error fetching security events:", error)
        return []
    }
}

/**
 * Get failed login attempts for an email (SERVER-SIDE ONLY)
 */
export async function getFailedLoginAttempts(email: string, hours: number = 24): Promise<number> {
    try {
        const adminDb = await getAdminDb()
        if (!adminDb) return 0

        const cutoffTime = new Date()
        cutoffTime.setHours(cutoffTime.getHours() - hours)

        const snapshot = await adminDb
            .collection("securityEvents")
            .where("type", "==", "failed_login")
            .where("email", "==", email)
            .where("timestamp", ">=", cutoffTime)
            .get()

        return snapshot.size
    } catch (error) {
        console.error("Error fetching failed login attempts:", error)
        return 0
    }
}
