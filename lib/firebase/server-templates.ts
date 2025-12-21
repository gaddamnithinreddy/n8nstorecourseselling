import { cache } from "react"
import { getAdminDb } from "./admin"
import { Template } from "./types"

export const getTemplateBySlug = cache(async (slug: string): Promise<Template | null> => {
    const db = await getAdminDb()
    if (!db) {
        console.error("Firebase Admin not initialized")
        return null
    }

    try {
        const querySnapshot = await db
            .collection("templates")
            .where("slug", "==", slug)
            .limit(1)
            .get()

        if (querySnapshot.empty) {
            return null
        }

        const doc = querySnapshot.docs[0]
        const data = doc.data()

        // Serialize Firestore Timestamps to plain objects
        return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate?.() || data.createdAt,
            updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
        } as Template
    } catch (error) {
        console.error("Error fetching template by slug:", error)
        return null
    }
})

export async function getAllTemplates(): Promise<Template[]> {
    const db = await getAdminDb()
    if (!db) return []

    try {
        const snapshot = await db.collection("templates").get()
        return snapshot.docs.map(doc => {
            const data = doc.data()
            return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate?.() || data.createdAt,
                updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
            } as Template
        })
    } catch (error) {
        console.error("Error fetching all templates:", error)
        return []
    }
}
