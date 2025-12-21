"use client"

import { Button } from "@/components/ui/button"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <div className="flex min-h-screen flex-col items-center justify-center text-center p-4">
                    <h2 className="text-3xl font-bold mb-4">Critical Error</h2>
                    <p className="text-muted-foreground mb-8">Something went wrong at the application level.</p>
                    <Button onClick={() => reset()}>Try again</Button>
                </div>
            </body>
        </html>
    )
}
