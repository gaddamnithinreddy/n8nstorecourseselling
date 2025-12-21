"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2, CheckCircle2, XCircle, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

function CheckoutResultContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const orderId = searchParams.get("order_id")

    const [status, setStatus] = useState<"verifying" | "verified_amount" | "success" | "failed">("verifying")
    const [message, setMessage] = useState("Verifying payment details...")
    const [amount, setAmount] = useState("")

    useEffect(() => {
        if (!orderId) {
            setStatus("failed")
            setMessage("Invalid Order ID")
            return
        }

        const verifyPayment = async () => {
            try {
                const res = await fetch("/api/cashfree/verify", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ orderId }),
                })

                const data = await res.json()

                if (res.ok) {
                    if (data.orderTotal) {
                        const formattedAmount = new Intl.NumberFormat('en-IN', {
                            style: 'currency',
                            currency: data.currency || 'INR',
                            maximumFractionDigits: 0
                        }).format(data.orderTotal)
                        setAmount(formattedAmount)
                        setStatus("verified_amount")

                        setTimeout(() => {
                            setStatus("success")
                            setTimeout(() => {
                                router.push("/dashboard/downloads")
                            }, 3500)
                        }, 2000)
                    } else {
                        setStatus("success")
                        setTimeout(() => {
                            router.push("/dashboard/downloads")
                        }, 3000)
                    }
                } else {
                    setStatus("failed")
                    setMessage(data.error || "Payment verification failed")
                }
            } catch (error) {
                console.error("Verification error:", error)
                setStatus("failed")
                setMessage("Something went wrong verifying the payment.")
            }
        }

        verifyPayment()
    }, [orderId, router])

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50/50 p-4">
            <Card className="w-full max-w-md p-8 text-center shadow-2xl rounded-2xl border-0 overflow-hidden bg-white/80 backdrop-blur-sm">
                <div className="flex flex-col items-center justify-center space-y-8 min-h-[300px]">
                    <AnimatePresence mode="wait">
                        {status === "verifying" && (
                            <motion.div
                                key="verifying"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="flex flex-col items-center gap-6"
                            >
                                <div className="relative h-24 w-24">
                                    <div className="absolute inset-0 rounded-full border-4 border-blue-100"></div>
                                    <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="h-12 w-12 rounded-full bg-blue-50 animate-pulse"></div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-2xl font-bold tracking-tight text-gray-900">Verifying</h2>
                                    <p className="text-gray-500">{message}</p>
                                </div>
                            </motion.div>
                        )}

                        {status === "verified_amount" && (
                            <motion.div
                                key="verified_amount"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="flex flex-col items-center gap-6"
                            >
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 200 }}
                                    className="rounded-full bg-blue-100 p-6"
                                >
                                    <CheckCircle2 className="h-12 w-12 text-blue-600" />
                                </motion.div>
                                <div className="space-y-2">
                                    <h2 className="text-2xl font-bold text-gray-900">Payment Recieved</h2>
                                    <p className="text-3xl font-bold text-blue-600">{amount}</p>
                                    <p className="text-sm text-gray-500">Securely finalizing your order...</p>
                                </div>
                            </motion.div>
                        )}

                        {status === "success" && (
                            <motion.div
                                key="success"
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="flex flex-col items-center gap-6 w-full"
                            >
                                <motion.div className="relative">
                                    <motion.svg
                                        viewBox="0 0 52 52"
                                        className="h-24 w-24 text-green-500"
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring", stiffness: 200, damping: 20 }}
                                    >
                                        <motion.circle
                                            cx="26"
                                            cy="26"
                                            r="25"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="3"
                                            initial={{ pathLength: 0, opacity: 0 }}
                                            animate={{ pathLength: 1, opacity: 1 }}
                                            transition={{ duration: 0.5, ease: "easeOut" }}
                                        />
                                        <motion.path
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M14.1 27.2l7.1 7.2 16.7-16.8"
                                            initial={{ pathLength: 0, opacity: 0 }}
                                            animate={{ pathLength: 1, opacity: 1 }}
                                            transition={{ duration: 0.4, delay: 0.4, ease: "easeOut" }}
                                        />
                                    </motion.svg>
                                </motion.div>

                                <div className="space-y-2">
                                    <h2 className="text-3xl font-bold text-gray-900">Success!</h2>
                                    <p className="text-gray-500">
                                        Your order has been confirmed.
                                    </p>
                                    <p className="text-sm text-gray-600 mt-3 bg-blue-50 p-3 rounded-lg border border-blue-100">
                                        📧 <strong>Setup guide sent to your email</strong> • Lifetime access • Non-refundable
                                    </p>
                                </div>

                                <div className="w-full max-w-xs space-y-4">
                                    <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                                        <motion.div
                                            className="absolute left-0 top-0 h-full bg-green-500"
                                            initial={{ width: "0%" }}
                                            animate={{ width: "100%" }}
                                            transition={{ duration: 3, ease: "easeInOut" }}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-400">Taking you to downloads...</p>
                                </div>
                            </motion.div>
                        )}

                        {status === "failed" && (
                            <motion.div
                                key="failed"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex flex-col items-center gap-6"
                            >
                                <motion.div
                                    initial={{ rotate: -45, scale: 0 }}
                                    animate={{ rotate: 0, scale: 1 }}
                                    transition={{ type: "spring" }}
                                    className="rounded-full bg-red-100 p-6"
                                >
                                    <XCircle className="h-12 w-12 text-red-600" />
                                </motion.div>
                                <div className="space-y-2">
                                    <h2 className="text-2xl font-bold text-gray-900">Payment Failed</h2>
                                    <p className="text-red-600 font-medium">{message}</p>
                                </div>
                                <div className="flex gap-3 w-full pt-4">
                                    <Button variant="outline" className="flex-1" onClick={() => router.push("/")}>
                                        Home
                                    </Button>
                                    <Button className="flex-1" onClick={() => window.location.reload()}>
                                        try Again
                                    </Button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </Card>
        </div>
    )
}

export default function CheckoutResultPage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
            <CheckoutResultContent />
        </Suspense>
    )
}
