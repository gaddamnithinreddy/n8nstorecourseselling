"use client"

import type React from "react"
import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { useSettings } from "@/hooks/use-settings"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Zap, Loader2, ArrowLeft, AlertCircle, CheckCircle, Eye, EyeOff, Check, X } from "lucide-react"

function SignUpForm() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [justSignedUp, setJustSignedUp] = useState(false)
  const { signUp, signInWithGoogle, user, loading: authLoading, isEmailVerified } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectParam = searchParams.get("redirect")

  useEffect(() => {
    if (!authLoading && user) {
      // If user just signed up, redirect to verification page
      if (justSignedUp && !isEmailVerified) {
        router.push("/verify-email")
        return
      }

      // Otherwise, normal redirect logic
      if (redirectParam) {
        router.push(redirectParam)
      } else if (user.role === "admin") {
        router.push("/admin")
      } else {
        router.push("/")
      }
    }
  }, [user, authLoading, router, redirectParam, justSignedUp, isEmailVerified])

  const validateForm = (): string | null => {
    if (!name.trim()) return "Name is required"
    if (name.trim().length < 2) return "Name must be at least 2 characters"
    if (!email.trim()) return "Email is required"
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Invalid email format"
    if (password.length < 6) return "Password must be at least 6 characters"
    if (password !== confirmPassword) return "Passwords do not match"
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      setLoading(false)
      return
    }

    try {
      await signUp(name.trim(), email.trim(), password)
      setJustSignedUp(true)
      toast.success("Account created! Please verify your email.")
      // Redirection handled by useEffect
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create account"
      setError(message)
      setLoading(false)
    }
    // Don't set loading to false on success to prevent UI flash before redirect
  }

  const { settings, loading: settingsLoading } = useSettings()

  // ... (rest of useEffects)

  if (authLoading || settingsLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (settings && !settings.enableUserRegistration) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
              <EyeOff className="h-6 w-6 text-muted-foreground" />
            </div>
            <CardTitle className="text-xl">Registration Disabled</CardTitle>
            <CardDescription>
              New user registration is currently turned off by the administrator.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button asChild>
              <Link href="/">Back to Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const passwordStrength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const passwordsMatch = password.length > 0 && confirmPassword.length > 0 && password === confirmPassword
  const isNameValid = name.trim().length >= 2

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />

      <div className="relative w-full max-w-md">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            <Link href="/" className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
              <Zap className="h-6 w-6 text-primary-foreground" />
            </Link>
            <CardTitle className="text-2xl">Create Account</CardTitle>
            <CardDescription>Start automating your workflows today</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <div className="grid gap-4 mb-4">
              <Button
                variant="outline"
                onClick={async () => {
                  setLoading(true)
                  try {
                    await signInWithGoogle()
                    toast.success("Account created via Google")
                  } catch (err: any) {
                    setError(err.message)
                    toast.error(err.message)
                    setLoading(false)
                  }
                }}
                disabled={loading}
                className="w-full bg-white text-black hover:bg-gray-50 border-gray-200"
              >
                <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                  <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                </svg>
                Sign up with Google
              </Button>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={loading}
                    autoComplete="name"
                    className={name.length > 0 ? (isNameValid ? "border-green-500/50 pr-10" : "border-red-500/50 pr-10") : ""}
                  />
                  {name.length > 0 && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {isNameValid ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <X className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  )}
                </div>
                {name.length > 0 && !isNameValid && (
                  <p className="text-xs text-red-500">Name must be at least 2 characters</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    autoComplete="email"
                    className={email.length > 0 ? (isEmailValid ? "border-green-500/50 pr-10" : "border-red-500/50 pr-10") : ""}
                  />
                  {email.length > 0 && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {isEmailValid ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <X className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  )}
                </div>
                {email.length > 0 && !isEmailValid && (
                  <p className="text-xs text-red-500">Please enter a valid email address</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    disabled={loading}
                    autoComplete="new-password"
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <Eye className="h-4 w-4" />
                    ) : (
                      <EyeOff className="h-4 w-4" />
                    )}
                    <span className="sr-only">Toggle password visibility</span>
                  </Button>
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3].map((level) => (
                    <div
                      key={level}
                      className={`h-1 flex-1 rounded-full transition-colors ${passwordStrength >= level
                        ? level === 1
                          ? "bg-red-500"
                          : level === 2
                            ? "bg-yellow-500"
                            : "bg-green-500"
                        : "bg-muted"
                        }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  {passwordStrength === 0 && "Must be at least 6 characters"}
                  {passwordStrength === 1 && "Weak password"}
                  {passwordStrength === 2 && "Good password"}
                  {passwordStrength === 3 && (
                    <span className="flex items-center gap-1 text-green-500">
                      <CheckCircle className="h-3 w-3" /> Strong password
                    </span>
                  )}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={loading}
                    autoComplete="new-password"
                    className={confirmPassword.length > 0 ? (passwordsMatch ? "border-green-500/50 pr-20" : "border-red-500/50 pr-20") : "pr-10"}
                  />
                  {confirmPassword.length > 0 && password.length > 0 && (
                    <div className="absolute right-12 top-1/2 -translate-y-1/2">
                      {passwordsMatch ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <X className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-muted-foreground hover:text-foreground"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? (
                      <Eye className="h-4 w-4" />
                    ) : (
                      <EyeOff className="h-4 w-4" />
                    )}
                    <span className="sr-only">Toggle password visibility</span>
                  </Button>
                </div>
                {confirmPassword.length > 0 && password.length > 0 && (
                  <p className={`text-xs flex items-center gap-1 ${passwordsMatch ? "text-green-500" : "text-red-500"}`}>
                    {passwordsMatch ? (
                      <>
                        <CheckCircle className="h-3 w-3" />
                        Passwords match
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-3 w-3" />
                        Passwords do not match
                      </>
                    )}
                  </p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href={redirectParam ? `/login?redirect=${encodeURIComponent(redirectParam)}` : "/login"}
                className="text-primary hover:underline"
              >
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function SignUpPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <SignUpForm />
    </Suspense>
  )
}
