import { NextResponse } from "next/server"
import { getAdminDb } from "@/lib/firebase/admin"

import { Template } from "@/lib/firebase/types"

export async function GET() {
    try {
        const db = await getAdminDb()
        if (!db) {
            return NextResponse.json({ error: "Database not connected" }, { status: 500 })
        }

        const templatesSnapshot = await db.collection("templates").limit(10).get()
        const templates = templatesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as unknown as Template[]

        return NextResponse.json({
            count: templatesSnapshot.size,
            templates: templates.map(t => ({
                id: t.id,
                title: t.title,
                price: t.price,
                currency: t.currency,
                isAvailable: t.isAvailable,
                stockCount: t.stockCount,
            }))
        })
    } catch (error) {
        return NextResponse.json({
            error: error instanceof Error ? error.message : String(error)
        }, { status: 500 })
    }
}
