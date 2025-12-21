"use client"

import { useSettings } from "@/hooks/use-settings"
import { Construction } from "lucide-react"

export default function MaintenancePage() {
    const { settings } = useSettings()

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
            <div className="mb-8 rounded-full bg-primary/10 p-6">
                <Construction className="h-16 w-16 text-primary" />
            </div>
            <h1 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
                Under Maintenance
            </h1>
            <p className="max-w-lg text-muted-foreground md:text-xl">
                {settings?.maintenanceMessage ||
                    "We're currently performing scheduled maintenance to improve your experience. Please check back soon!"}
            </p>
        </div>
    )
}
