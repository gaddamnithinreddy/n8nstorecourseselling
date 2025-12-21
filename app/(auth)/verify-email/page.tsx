"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, Loader2, CheckCircle2, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

export default function VerifyEmailPage() {
    const { firebaseUser, resendVerificationEmail, isEmailVerified, loading } = useAuth()
    const [sending, setSending] = useState(false)
    const [checking, setChecking] = useState(false)
    const router = useRouter()

    // Redirect if already verified
    useEffect(() => {
        if (!loading && isEmailVerified) {
            toast.success("Email verified! Redirecting...")
            setTimeout(() => router.push("/dashboard"), 1500)
        }
    }, [isEmailVerified, loading, router])

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!loading && !firebaseUser) {
            router.push("/login")
        }
    }, [firebaseUser, loading, router])

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

    const handleCheckVerification = async () => {
        setChecking(true)
        try {
            // Reload the user to get fresh verification status
            await firebaseUser?.reload()

            if (firebaseUser?.emailVerified) {
                toast.success("Email verified successfully!")
                setTimeout(() => router.push("/dashboard"), 1500)
            } else {
                toast.error("Email not verified yet. Please check your inbox and click the verification link.")
            }
        } catch (error: any) {
            toast.error("Failed to check verification status")
        } finally {
            setChecking(false)
        }
    }

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (isEmailVerified) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background p-4">
                <Card className="w-full max-w-md border-green-500/50 bg-green-50 dark:bg-green-950/20">
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
                            <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-500" />
                        </div>
                        <CardTitle className="text-2xl text-green-900 dark:text-green-100">
                            Email Verified!
                        </CardTitle>
                        <CardDescription className="text-green-700 dark:text-green-300">
                            Redirecting to your dashboard...
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />

            <div className="relative w-full max-w-md">
                <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                            <Mail className="h-8 w-8 text-primary" />
                        </div>
                        <CardTitle className="text-2xl">Check Your Email</CardTitle>
                        <CardDescription>
                            We've sent a verification link to
                        </CardDescription>
                        <p className="mt-2 text-base font-semibold text-foreground">
                            {firebaseUser?.email}
                        </p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="rounded-lg border border-border bg-muted/50 p-4">
                            <h3 className="mb-2 font-semibold text-sm">What's next?</h3>
                            <ol className="space-y-2 text-sm text-muted-foreground">
                                <li className="flex gap-2">
                                    <span className="font-semibold text-primary">1.</span>
                                    <span>Check your inbox for the verification email</span>
                                </li>
                                <li className="flex gap-2">
                                    <span className="font-semibold text-primary">2.</span>
                                    <span>Click the verification link in the email</span>
                                </li>
                                <li className="flex gap-2">
                                    <span className="font-semibold text-primary">3.</span>
                                    <span>Come back here and click "I've Verified"</span>
                                </li>
                            </ol>
                        </div>

                        <div className="rounded-lg border border-yellow-500/50 bg-yellow-50 dark:bg-yellow-950/20 p-3">
                            <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                <strong>Important:</strong> You must verify your email before you can purchase templates.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Button
                                onClick={handleCheckVerification}
                                disabled={checking}
                                className="w-full"
                            >
                                {checking ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Checking...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 className="mr-2 h-4 w-4" />
                                        I've Verified - Continue
                                    </>
                                )}
                            </Button>

                            <Button
                                variant="outline"
                                onClick={handleResend}
                                disabled={sending}
                                className="w-full"
                            >
                                {sending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <RefreshCw className="mr-2 h-4 w-4" />
                                        Resend Verification Email
                                    </>
                                )}
                            </Button>
                        </div>

                        <div className="pt-4 text-center text-sm text-muted-foreground">
                            <Link href="/dashboard" className="text-primary hover:underline">
                                Skip for now (limited access)
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
