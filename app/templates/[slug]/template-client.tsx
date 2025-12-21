"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { useTemplate } from "@/hooks/use-templates"
import { useSettings } from "@/hooks/use-settings"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import {
    ArrowLeft,
    ShoppingCart,
    Zap,
    CheckCircle,
    AlertCircle,
    Loader2,
    LogIn,
    CreditCard,
    Ticket,
    X,
    ArrowRight,
} from "lucide-react"
import { SuccessAnimation, FailureAnimation, CouponConfetti } from "@/components/status-animations"
import Script from "next/script"
import { Template } from "@/lib/firebase/types"

// import { load } from "@cashfreepayments/cashfree-js" // Removing problematic load

declare global {
    interface Window {
        Razorpay: unknown
        Cashfree: any
    }
}

function TemplateDetailSkeleton() {
    return (
        <div className="flex min-h-screen flex-col bg-background">
            <Navbar />
            <main className="flex-1 py-8 md:py-12">
                <div className="container mx-auto px-4">
                    <Skeleton className="mb-6 h-5 w-32" />
                    <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
                        <div className="space-y-4">
                            <Skeleton className="aspect-video w-full rounded-xl" />
                            <div className="hidden grid-cols-4 gap-2 sm:grid">
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <Skeleton key={i} className="aspect-video rounded-lg" />
                                ))}
                            </div>
                        </div>
                        <div className="space-y-5">
                            <div className="flex gap-2">
                                <Skeleton className="h-6 w-24 rounded-full" />
                                <Skeleton className="h-6 w-20 rounded-full" />
                            </div>
                            <Skeleton className="h-9 w-4/5" />
                            <Skeleton className="h-5 w-full" />
                            <Skeleton className="h-12 w-36" />
                            <Skeleton className="h-12 w-full rounded-lg sm:w-48" />
                            <Skeleton className="h-32 w-full rounded-lg" />
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}

interface TemplateClientProps {
    slug: string
    initialTemplate?: Template | null
}

export default function TemplateClient({ slug, initialTemplate }: TemplateClientProps) {
    const router = useRouter()
    const { settings } = useSettings()

    const { template: fetchedTemplate, loading, error } = useTemplate(slug)
    const template = initialTemplate || fetchedTemplate;

    const { user, loading: authLoading, firebaseUser } = useAuth()
    const [purchasing, setPurchasing] = useState(false)
    // Razorpay commented out
    // const [razorpayKey, setRazorpayKey] = useState<string | null>(null)
    // const [razorpayLoading, setRazorpayLoading] = useState(true)
    const [cashfree, setCashfree] = useState<any>(null)
    const [paymentConfigured, setPaymentConfigured] = useState(true)

    const paymentsEnabled = settings?.enablePayments !== false
    const [couponCode, setCouponCode] = useState("")
    const [couponError, setCouponError] = useState("")
    const [couponSuccess, setCouponSuccess] = useState("")
    const [appliedCoupon, setAppliedCoupon] = useState<{
        code: string
        discountAmount: number
        discountType: "percentage" | "fixed"
        finalPrice: number
    } | null>(null)

    const [pendingPayment, setPendingPayment] = useState<{
        orderId: string
        // razorpayOrderId: string // Removed
        cashfreeOrderId?: string
        paymentSessionId?: string
        amount: number
        currency: string
    } | null>(null)
    const [showSuccess, setShowSuccess] = useState(false)
    const [showFailure, setShowFailure] = useState(false)
    const [showConfetti, setShowConfetti] = useState(false)

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "instant" })

        // Check for pending payment in localStorage
        const storedPayment = localStorage.getItem(`pending_payment_${slug}`)
        if (storedPayment) {
            try {
                const payment = JSON.parse(storedPayment)
                setPendingPayment(payment)

            } catch (e) {
                localStorage.removeItem(`pending_payment_${slug}`)
            }
        }
    }, [slug])

    useEffect(() => {
        const checkConfig = async () => {
            try {
                const configRes = await fetch("/api/config/cashfree")
                const config = await configRes.json()

                if (!config.configured) {
                    setPaymentConfigured(false)
                    return
                }

                setPaymentConfigured(true)
                // Env mode will be used in Script onLoad
            } catch (err) {
                console.error("Config check error:", err)
            }
        }
        checkConfig()
    }, [])

    // Script loaded handler
    const handleScriptLoad = () => {

        if (window.Cashfree) {
            try {
                const mode = "sandbox" // Or fetch from config if we store it in state. 
                // Simplified: Sandbox for testing. In prod, we'd want to sync this.
                // Ideally we fetch config, store env in state.

                // For now, defaulting to sandbox is safer for testing.
                const cashfree = new window.Cashfree({
                    mode: "sandbox"
                })
                setCashfree(cashfree)

            } catch (e) {
                console.error("[Cashfree] Init error:", e)
            }
        }
    }

    /* Razorpay Config Commented Out
    useEffect(() => {
        const fetchRazorpayConfig = async () => {
            try {
                const res = await fetch("/api/config/razorpay")
                const data = await res.json()

                if (data.keyId) {
                    setRazorpayKey(data.keyId)
                    setPaymentConfigured(true)
                } else {
                    setPaymentConfigured(false)
                }
            } catch {
                setPaymentConfigured(false)
            } finally {
                setRazorpayLoading(false)
            }
        }

        fetchRazorpayConfig()
    }, [])
    */

    // Warn user before leaving page during payment
    // Removed beforeunload listener to allow smooth redirection for payment
    // ensure user feels safe that payment is processing

    const formatPrice = useCallback((price: number, currency: string) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency,
            maximumFractionDigits: 0,
        }).format(price)
    }, [])

    const handlePurchase = useCallback(async () => {
        if (!user) {
            toast.error("Please sign in to purchase", {
                action: {
                    label: "Sign In",
                    onClick: () => router.push(`/login?redirect=/templates/${slug}`),
                },
            })
            return
        }

        if (!user.email) {
            toast.error("Your account is missing an email address", {
                description: "Please update your profile to continue.",
            })
            return
        }

        // Check email verification
        const isEmailVerified = firebaseUser?.emailVerified;
        if (!isEmailVerified) {
            toast.error("Email Verification Required", {
                description: "Please verify your email address before purchasing templates.",
                action: {
                    label: "Verify Email",
                    onClick: () => router.push("/verify-email"),
                },
            })
            return
        }

        if (!template) {
            toast.error("Template not found")
            return
        }

        if (!template.isAvailable) {
            toast.error("This template is currently unavailable")
            return
        }

        if (!template.isAvailable) {
            toast.error("This template is currently unavailable")
            return
        }

        if (!paymentConfigured) {
            toast.error("Payment gateway not configured", {
                description: "The administrator needs to add Cashfree credentials.",
            })
            return
        }

        setPurchasing(true)
        const loadingToast = toast.loading("Preparing your order...")



        try {
            if (!firebaseUser) {
                toast.error("Please sign in to continue")
                return
            }

            const token = await firebaseUser.getIdToken()

            const orderPayload = {
                templateId: template.id,
                userId: user.id,
                userEmail: user.email,
                userName: user.name,
                couponCode: appliedCoupon?.code
            }



            // Cashfree Create Order
            const orderRes = await fetch("/api/cashfree/create-order", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(orderPayload),
            })

            let orderData
            const contentType = orderRes.headers.get("content-type")
            if (contentType && contentType.includes("application/json")) {
                orderData = await orderRes.json()
            } else {
                const textResponse = await orderRes.text()
                console.error("[v0] Non-JSON response from create-order:", textResponse)
                toast.dismiss(loadingToast)
                toast.error("Server error", {
                    description: "The server returned an unexpected response. Please try again later.",
                })
                setPurchasing(false)
                return
            }

            toast.dismiss(loadingToast)

            // Store payment in localStorage
            if (orderRes.ok) {
                const paymentData = {
                    orderId: orderData.data.orderId,
                    cashfreeOrderId: orderData.data.cashfreeOrderId,
                    paymentSessionId: orderData.data.paymentSessionId,
                    amount: orderData.data.amount,
                    currency: orderData.data.currency,
                }
                localStorage.setItem(`pending_payment_${slug}`, JSON.stringify(paymentData))
                setPendingPayment(paymentData)

                // 5. Checkout with Cashfree


                // Using Redirect Flow as per documentation
                if (cashfree) {
                    try {
                        cashfree.checkout({
                            paymentSessionId: orderData.data.paymentSessionId,
                            // Using _self (Same Tab) to ensure Mobile Compatibility (avoids Popup Blockers)
                            redirectTarget: "_self",
                        })

                        // Note: Cashfree redirects, so code below might not run immediately or at all.
                        // But for some modes it might.
                        setPurchasing(false)
                    } catch (cfError) {
                        console.error("Cashfree checkout error:", cfError)
                        toast.error("Payment initiation failed")
                        setPurchasing(false)
                    }
                }
            } else {
                toast.error(orderData.error || "Failed to create order")
                setPurchasing(false)
            }

            /* Razorpay Logic Commented Out
            if (orderRes.ok) {
                 // ... (Razorpay logic)
            }
            // ... (rest of Razorpay code)
            */
        } catch (err) {
            console.error("[v0] Purchase error:", err)
            toast.dismiss(loadingToast)
            const message = err instanceof Error ? err.message : "Failed to initiate payment"
            toast.error("Payment error", {
                description: message,
            })
            setPurchasing(false)
        }
    }, [user, template, cashfree, paymentConfigured, router, slug, appliedCoupon, firebaseUser])

    if (loading) {
        return <TemplateDetailSkeleton />
    }

    if (error || !template) {
        return (
            <div className="flex min-h-screen flex-col bg-background">
                <Navbar />
                <main className="flex-1 py-12">
                    <div className="container mx-auto px-4">
                        <div className="mx-auto max-w-md rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center animate-fade-in">
                            <AlertCircle className="mx-auto mb-4 h-12 w-12 text-destructive" />
                            <h2 className="mb-2 text-2xl font-bold">Template Not Found</h2>
                            <p className="mb-6 text-muted-foreground">
                                The template you&apos;re looking for doesn&apos;t exist or has been removed.
                            </p>
                            <Button asChild>
                                <Link href="/templates">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Back to Templates
                                </Link>
                            </Button>
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        )
    }

    const isReady = !authLoading
    const canPurchase = template.isAvailable && !purchasing && isReady && paymentConfigured && user && paymentsEnabled

    return (
        <div className="flex min-h-screen flex-col bg-background relative">
            <Navbar />

            {/* Cashfree Script (Self-Hosted to bypass AdBlockers) */}
            <Script
                src="/cashfree.js"
                strategy="lazyOnload"
                onLoad={handleScriptLoad}
                onError={(e) => {
                    console.error("Cashfree script error:", e)
                    toast.error("Payment System Blocked", {
                        description: "Please disable AdBlocker (uBlock, etc) and refresh.",
                        duration: 6000
                    })
                }}
            />

            {showSuccess && <SuccessAnimation />}
            {showFailure && <FailureAnimation />}
            {showConfetti && <CouponConfetti />}

            <main className="flex-1 py-8 md:py-12">
                <div className="container mx-auto px-4">
                    <Link
                        href="/templates"
                        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Templates
                    </Link>

                    <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 animate-fade-in">
                        {/* Image Section */}
                        <div>
                            <div className="relative aspect-video overflow-hidden rounded-xl border border-border bg-muted shadow-sm">
                                {template.thumbnailUrl ? (
                                    <Image
                                        src={template.thumbnailUrl || "/placeholder.svg"}
                                        alt={template.title}
                                        fill
                                        className="object-cover"
                                        priority
                                        sizes="(max-width: 1024px) 100vw, 50vw"
                                    />
                                ) : (
                                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                                        <Zap className="h-16 w-16 text-muted-foreground/30" />
                                    </div>
                                )}
                            </div>

                            {template.previewImages && template.previewImages.length > 0 && (
                                <div className="mt-4 hidden grid-cols-4 gap-2 sm:grid">
                                    {template.previewImages.slice(0, 4).map((img, i) => (
                                        <div
                                            key={i}
                                            className="relative aspect-video overflow-hidden rounded-lg border border-border bg-muted"
                                        >
                                            <Image
                                                src={img || "/placeholder.svg"}
                                                alt={`Preview ${i + 1}`}
                                                fill
                                                className="object-cover"
                                                sizes="(max-width: 1024px) 25vw, 12vw"
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Details Section */}
                        <div className="space-y-5">
                            <div className="flex flex-wrap gap-2">
                                <Badge variant="outline" className="font-medium">
                                    {template.category}
                                </Badge>
                                <Badge variant="secondary" className="capitalize">
                                    {template.level}
                                </Badge>
                                {template.tags?.slice(0, 3).map((tag) => (
                                    <Badge key={tag} variant="outline" className="text-xs text-muted-foreground">
                                        {tag}
                                    </Badge>
                                ))}
                            </div>

                            <div>
                                <h1 className="mb-3 text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">{template.title}</h1>
                                <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
                                    {template.shortDescription}
                                </p>
                            </div>

                            <div className="flex flex-col gap-1">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-bold text-primary sm:text-4xl">
                                        {formatPrice(template.price, template.currency)}
                                    </span>
                                    <span className="text-sm text-muted-foreground">one-time purchase</span>
                                </div>
                                {template.originalPrice && template.originalPrice > template.price && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-base text-muted-foreground line-through decoration-destructive/50">
                                            {formatPrice(template.originalPrice, template.currency)}
                                        </span>
                                        <Badge variant="destructive" className="h-5 text-[10px] animate-pulse">SALE</Badge>
                                    </div>
                                )}
                            </div>



                            {template.isAvailable ? (
                                <div className="flex items-center gap-2 text-sm font-medium text-green-600 dark:text-green-400">
                                    <CheckCircle className="h-4 w-4" />
                                    <span>Available for purchase</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 text-sm font-medium text-destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <span>Currently unavailable</span>
                                </div>
                            )}

                            {/* Coupon Section */}
                            <div className="rounded-xl border border-border bg-card/50 backdrop-blur-sm overflow-hidden min-h-[5.5rem] relative flex items-center justify-center transition-all duration-300">
                                <AnimatePresence mode="wait" initial={false}>
                                    {!appliedCoupon ? (
                                        <motion.div
                                            key="coupon-input"
                                            initial={{ opacity: 0, y: 10, position: "absolute", width: "100%" }}
                                            animate={{ opacity: 1, y: 0, position: "relative" }}
                                            exit={{ opacity: 0, y: -10, position: "absolute" }}
                                            transition={{ duration: 0.25, ease: "easeOut" }}
                                            className="p-4 space-y-3 w-full"
                                        >
                                            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                                <Ticket className="h-4 w-4" />
                                                <span>Have a coupon code?</span>
                                            </div>
                                            <div className="flex gap-2">
                                                <motion.div
                                                    className="flex-1 relative"
                                                    animate={couponError ? { x: [0, -10, 10, -10, 10, 0] } : {}}
                                                    transition={{ duration: 0.4 }}
                                                >
                                                    <input
                                                        type="text"
                                                        value={couponCode}
                                                        onChange={(e) => {
                                                            setCouponCode(e.target.value.toUpperCase())
                                                            setCouponError("")
                                                        }}
                                                        placeholder="ENTER CODE"
                                                        className="w-full h-10 rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 uppercase tracking-wide transition-all"
                                                        onKeyDown={(e) => {
                                                            if (e.key === "Enter" && couponCode) {
                                                                // Trigger apply click
                                                                const btn = document.getElementById("apply-coupon-btn");
                                                                if (btn) btn.click();
                                                            }
                                                        }}
                                                    />
                                                </motion.div>
                                                <Button
                                                    id="apply-coupon-btn"
                                                    variant="secondary"
                                                    className="h-10 px-6 font-medium"
                                                    disabled={!couponCode}
                                                    onClick={async () => {
                                                        setCouponError("")
                                                        setCouponSuccess("")
                                                        if (!couponCode) return;

                                                        try {
                                                            const res = await fetch("/api/coupons/verify", {
                                                                method: "POST",
                                                                headers: { "Content-Type": "application/json" },
                                                                body: JSON.stringify({
                                                                    code: couponCode,
                                                                    userEmail: user?.email,
                                                                    templatePrice: template.price
                                                                })
                                                            })
                                                            const data = await res.json()
                                                            if (res.ok && data.valid) {
                                                                setAppliedCoupon({
                                                                    code: couponCode,
                                                                    discountAmount: data.discountAmount,
                                                                    discountType: data.discountType,
                                                                    finalPrice: data.finalPrice
                                                                })
                                                                setCouponSuccess(`Coupon applied! You save ${formatPrice(data.discountAmount, template.currency)}`)
                                                                setShowConfetti(true)
                                                                setTimeout(() => setShowConfetti(false), 3000)
                                                            } else {
                                                                setCouponError(data.message || "Invalid coupon")
                                                            }
                                                        } catch (err) {
                                                            setCouponError("Failed to verify coupon")
                                                        }
                                                    }}
                                                >
                                                    Apply
                                                </Button>
                                            </div>
                                            <AnimatePresence>
                                                {couponError && (
                                                    <motion.p
                                                        initial={{ opacity: 0, y: -10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        className="text-xs text-destructive font-medium flex items-center gap-1"
                                                    >
                                                        <AlertCircle className="h-3 w-3" />
                                                        {couponError}
                                                    </motion.p>
                                                )}
                                            </AnimatePresence>
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="coupon-success"
                                            initial={{ opacity: 0, y: 10, position: "absolute", width: "100%" }}
                                            animate={{ opacity: 1, y: 0, position: "relative" }}
                                            exit={{ opacity: 0, y: -10, position: "absolute" }}
                                            transition={{ duration: 0.25, ease: "easeOut" }}
                                            className="bg-green-500/10 p-4 flex items-center justify-between w-full"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="rounded-full bg-green-100 p-2 text-green-600 dark:bg-green-900/40 dark:text-green-400">
                                                    <Ticket className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-green-700 dark:text-green-300">
                                                        Code '{appliedCoupon.code}' Applied
                                                    </p>
                                                    <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                                                        You saved {formatPrice(appliedCoupon.discountAmount, template.currency)}
                                                    </p>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-green-700 hover:text-red-600 hover:bg-green-500/20 dark:text-green-300 dark:hover:text-red-400"
                                                onClick={() => {
                                                    setAppliedCoupon(null)
                                                    setCouponCode("")
                                                    setCouponSuccess("")
                                                    setCouponError("")
                                                }}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Price Summary if Coupon Applied */}
                            {appliedCoupon && (
                                <div className="rounded-lg border border-green-500/20 bg-green-500/10 p-4">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-sm text-muted-foreground">Original Price:</span>
                                        <span className="text-sm line-through">{formatPrice(template.price, template.currency)}</span>
                                    </div>
                                    <div className="flex justify-between items-center mb-1 text-green-600 dark:text-green-400">
                                        <span className="text-sm font-medium">Discount:</span>
                                        <span className="text-sm font-medium">-{formatPrice(appliedCoupon.discountAmount, template.currency)}</span>
                                    </div>
                                    <div className="flex justify-between items-center border-t border-green-500/20 pt-2 mt-2">
                                        <span className="font-bold">Total:</span>
                                        <span className="font-bold text-lg">{formatPrice(appliedCoupon.finalPrice, template.currency)}</span>
                                    </div>
                                </div>
                            )}

                            {/* Payments Disabled Warning */}
                            {!paymentsEnabled && (
                                <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
                                    <div className="flex items-start gap-3">
                                        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
                                        <div>
                                            <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
                                                Payments Disabled
                                            </p>
                                            <p className="mt-1 text-xs text-amber-600/80 dark:text-amber-400/80">
                                                Purchasing is currently disabled by the administrator.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Payment Gateway Warning */}
                            {!paymentConfigured && (
                                <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
                                    <div className="flex items-start gap-3">
                                        <CreditCard className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
                                        <div>
                                            <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
                                                Payment Gateway Not Configured
                                            </p>
                                            <p className="mt-1 text-xs text-amber-600/80 dark:text-amber-400/80">
                                                Add CASHFREE_APP_ID and CASHFREE_SECRET_KEY environment variables to enable payments.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Sign In Prompt */}
                            {!authLoading && !user && (
                                <div className="rounded-lg border border-border bg-muted/30 p-4">
                                    <div className="flex items-center gap-3">
                                        <LogIn className="h-5 w-5 text-muted-foreground" />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">Sign in to purchase</p>
                                            <p className="text-xs text-muted-foreground">You need an account to buy templates</p>
                                        </div>
                                        <Button size="sm" asChild>
                                            <Link href={`/login?redirect=/templates/${slug}`}>Sign In</Link>
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Buy Button */}
                            <Button
                                size="lg"
                                className="w-full transition-all sm:w-auto"
                                disabled={!canPurchase}
                                onClick={handlePurchase}
                            >
                                {purchasing ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Processing...
                                    </>
                                ) : !isReady ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Loading...
                                    </>
                                ) : !template.isAvailable ? (
                                    <>
                                        <AlertCircle className="mr-2 h-5 w-5" />
                                        Unavailable
                                    </>
                                ) : !user ? (
                                    <>
                                        <LogIn className="mr-2 h-5 w-5" />
                                        Sign In to Buy
                                    </>
                                ) : !paymentConfigured ? (
                                    <>
                                        <CreditCard className="mr-2 h-5 w-5" />
                                        Payment Unavailable
                                    </>
                                ) : (
                                    <>
                                        <ShoppingCart className="mr-2 h-5 w-5" />
                                        Buy Now - {formatPrice(appliedCoupon ? appliedCoupon.finalPrice : template.price, template.currency)}
                                    </>
                                )}
                            </Button>

                            {/* What's Included */}
                            <div className="rounded-lg border border-border bg-card p-5">
                                <h3 className="mb-4 font-semibold">What&apos;s Included</h3>
                                <ul className="space-y-3 text-sm">
                                    {["n8n workflow JSON file", "Setup documentation", "Lifetime access", "Free updates"].map((item) => (
                                        <li key={item} className="flex items-center gap-3 text-muted-foreground">
                                            <CheckCircle className="h-4 w-4 shrink-0 text-green-500" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Non-Refundable Policy Notice */}
                            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
                                    <div className="space-y-2">
                                        <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                                            Important Purchase Terms
                                        </p>
                                        <ul className="space-y-1.5 text-xs text-amber-800/90 dark:text-amber-300/90">
                                            <li className="flex items-start gap-2">
                                                <span className="mt-0.5 text-amber-600 dark:text-amber-400">•</span>
                                                <span><strong>Non-refundable:</strong> All sales are final due to the digital nature of the product</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="mt-0.5 text-amber-600 dark:text-amber-400">•</span>
                                                <span><strong>Setup guide:</strong> Detailed instructions sent via email after purchase</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="mt-0.5 text-amber-600 dark:text-amber-400">•</span>
                                                <span><strong>Lifetime access:</strong> Download and use forever with free updates</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}
