"use client" // Error components must be Client Components

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle, RefreshCw } from "lucide-react"

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error)
    }, [error])

    return (
        <div className="flex min-h-[50vh] flex-col items-center justify-center text-center px-4 py-16">
            <div className="rounded-full bg-destructive/10 p-4 mb-4">
                <AlertCircle className="h-12 w-12 text-destructive" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight mb-2">Something went wrong!</h2>
            <p className="text-muted-foreground mb-8 max-w-md">
                We encountered an unexpected error. Please try again or contact support if the problem persists.
            </p>
            <div className="flex gap-4">
                <Button onClick={() => reset()} className="gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Try Again
                </Button>
                <Button variant="outline" onClick={() => window.location.href = "/"}>
                    Go Home
                </Button>
            </div>
        </div>
    )
}
