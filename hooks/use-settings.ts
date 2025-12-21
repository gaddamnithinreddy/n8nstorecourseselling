"use client"

import { useState, useEffect } from "react"
import { doc, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase/config"
import type { SiteSettings } from "@/lib/firebase/types"
import { useAuth } from "@/contexts/auth-context"

const SETTINGS_DOC_ID = "site-settings"

export function useSettings() {
    const { firebaseUser } = useAuth()
    const [settings, setSettings] = useState<SiteSettings | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const unsubscribe = onSnapshot(
            doc(db, "settings", SETTINGS_DOC_ID),
            (doc) => {
                if (doc.exists()) {
                    setSettings({ id: doc.id, ...doc.data() } as SiteSettings)
                } else {
                    setSettings(null)
                }
                setLoading(false)
            },
            (err) => {
                console.error("Error fetching settings:", err)
                setError(err.message)
                setLoading(false)
            }
        )

        return () => unsubscribe()
    }, [])

    const updateSettings = async (updates: Partial<SiteSettings>) => {
        try {
            if (!firebaseUser) {
                throw new Error("You must be logged in to update settings")
            }

            const token = await firebaseUser.getIdToken()

            const response = await fetch("/api/settings", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(updates),
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || "Failed to update settings")
            }

            return await response.json()
        } catch (err) {
            console.error("Error updating settings:", err)
            throw err
        }
    }

    return { settings, loading, error, updateSettings }
}
