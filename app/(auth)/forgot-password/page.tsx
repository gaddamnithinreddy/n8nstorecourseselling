"use client"

import { useState } from "react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Zap, Loader2, ArrowLeft, AlertCircle, CheckCircle } from "lucide-react"
import { sendPasswordResetEmail } from "firebase/auth"
import { auth } from "@/lib/firebase/config"
import { validateEmail } from "@/lib/validation"

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("")
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState("")
    const { checkEmailProvider } = useAuth()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")
        setSuccess(false)

        // Validate email domain
        const emailValidation = validateEmail(email)
        if (!emailValidation.valid) {
            setError(emailValidation.error)
            setLoading(false)
            return
        }

        try {
            // Check if account exists and which provider it uses
            const providerCheck = await checkEmailProvider(emailValidation.data!)

            if (!providerCheck.exists) {
                setError("No account found with this email address. Would you like to sign up instead?")
                setLoading(false)
                return
            }

            if (providerCheck.provider === 'google.com') {
                setError("This account uses Google Sign-In and doesn't have a password. Please sign in with Google instead.")
                setLoading(false)
                return
            }

            // Send password reset email
            await sendPasswordResetEmail(auth, emailValidation.data!)
            setSuccess(true)
            toast.success("Reset link sent!", {
                description: "Check your email for instructions to reset your password.",
            })
        } catch (error: any) {
            console.error("Password reset error:", error)
            let message = "Failed to send reset link"

            if (error.code === "auth/user-not-found") {
                message = "No account found with this email"
            } else if (error.code === "auth/invalid-email") {
                message = "Invalid email address"
            } else if (error.code === "auth/too-many-requests") {
                message = "Too many attempts. Please try again later"
            }

            setError(message)
            toast.error(message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />

            <div className="relative w-full max-w-md">
                <Link
                    href="/login"
                    className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Login
                </Link>

                <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
                    <CardHeader className="text-center">
                        <Link href="/" className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
                            <Zap className="h-6 w-6 text-primary-foreground" />
                        </Link>
                        <CardTitle className="text-2xl">Reset Password</CardTitle>
                        <CardDescription>Enter your email to receive a password reset link</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {success ? (
                            <div className="space-y-4 text-center">
                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                                    <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="font-semibold">Check your email</h3>
                                    <p className="text-sm text-muted-foreground">
                                        We've sent a password reset link to <strong>{email}</strong>
                                    </p>
                                </div>
                                <Button variant="outline" className="w-full" onClick={() => setSuccess(false)}>
                                    Resend Link
                                </Button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {error && (
                                    <div className="flex items-start gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                                        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                                        <div>
                                            {error}
                                            {error.includes("No account found") && (
                                                <div className="mt-2">
                                                    <Link href="/signup" className="font-medium underline hover:no-underline">
                                                        Create an account
                                                    </Link>
                                                </div>
                                            )}
                                            {error.includes("Google Sign-In") && (
                                                <div className="mt-2">
                                                    <Link href="/login" className="font-medium underline hover:no-underline">
                                                        Sign in with Google
                                                    </Link>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        disabled={loading}
                                        autoComplete="email"
                                    />
                                </div>
                                <Button type="submit" className="w-full" disabled={loading}>
                                    {loading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Sending Link...
                                        </>
                                    ) : (
                                        "Send Reset Link"
                                    )}
                                </Button>
                            </form>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
