"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useSettings } from "@/hooks/use-settings"
import { useAuth } from "@/contexts/auth-context"

export function MaintenanceCheck() {
    const { settings, loading } = useSettings()
    const { isAdmin, loading: authLoading } = useAuth()
    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
        if (loading || authLoading) return

        // If maintenance mode is active
        if (settings?.maintenanceMode) {
            // Allow access to admin pages, login, and maintenance page itself
            const isExempt =
                isAdmin ||
                pathname.startsWith("/admin") ||
                pathname === "/login" ||
                pathname === "/maintenance"

            if (!isExempt) {
                router.push("/maintenance")
            }
        }
        // If maintenance mode is OFF but we are on maintenance page
        else if (settings && !settings.maintenanceMode && pathname === "/maintenance") {
            router.push("/")
        }
    }, [settings, loading, isAdmin, authLoading, pathname, router])

    return null
}
