"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, Loader2, CheckCircle } from "lucide-react"
import { toast } from "sonner"

export function EmailVerificationNotice() {
    const { firebaseUser, resendVerificationEmail, isEmailVerified } = useAuth()
    const [sending, setSending] = useState(false)

    if (!firebaseUser || isEmailVerified) {
        return null
    }

    const handleResend = async () => {
        setSending(true)
        try {
            await resendVerificationEmail()
            toast.success("Verification email sent! Check your inbox.")
        } catch (error: any) {
            toast.error(error.message || "Failed to send verification email")
        } finally {
            setSending(false)
        }
    }

    return (
        <Card className="border-yellow-500/50 bg-yellow-50 dark:bg-yellow-950/20">
            <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-yellow-500/10">
                        <Mail className="h-5 w-5 text-yellow-600 dark:text-yellow-500" />
                    </div>
                    <div className="flex-1">
                        <CardTitle className="text-base text-yellow-900 dark:text-yellow-100">
                            Verify Your Email
                        </CardTitle>
                        <CardDescription className="text-yellow-700 dark:text-yellow-300">
                            We've sent a verification link to <strong>{firebaseUser.email}</strong>
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-0">
                <p className="mb-3 text-sm text-yellow-700 dark:text-yellow-300">
                    Please check your inbox and click the verification link to access all features.
                </p>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleResend}
                    disabled={sending}
                    className="border-yellow-500/50 text-yellow-700 hover:bg-yellow-100 dark:text-yellow-300 dark:hover:bg-yellow-950/40"
                >
                    {sending ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Sending...
                        </>
                    ) : (
                        "Resend Verification Email"
                    )}
                </Button>
            </CardContent>
        </Card>
    )
}
