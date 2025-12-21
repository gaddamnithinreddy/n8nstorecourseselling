"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { toast } from "sonner"
import { Loader2, Send, CheckCircle2, Check, X, Mail, Clock } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { validateEmail } from "@/lib/validation"

export default function ContactPage() {
    const { user } = useAuth()
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: "",
    })
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)

    // Auto-fill user details if logged in
    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                name: user.name || "",
                email: user.email || "",
            }))
        }
    }, [user])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Validate email domain
        const emailValidation = validateEmail(formData.email)
        if (!emailValidation.valid) {
            toast.error(emailValidation.error)
            return
        }

        if (formData.message.length < 10) {
            return
        }

        if (formData.message.length > 150) {
            return
        }

        setLoading(true)

        try {
            const response = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    userId: user?.id,
                }),
            })

            const data = await response.json()

            if (!response.ok) throw new Error(data.error || "Failed to send message")

            setSuccess(true)
            toast.success("Message sent successfully!")

            // Reset form but keep name/email if logged in
            setFormData(prev => ({
                name: user?.name || "",
                email: user?.email || "",
                subject: "",
                message: "",
            }))
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1 py-12 sm:py-20 bg-muted/30">
                <div className="container mx-auto px-4 max-w-2xl">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl">Contact Us</CardTitle>
                            <CardDescription>
                                Have a question or issue? Send us a message and we'll help you out.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <AnimatePresence mode="wait">
                                {success ? (
                                    <motion.div
                                        key="success"
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.4, ease: "easeOut" }}
                                        className="flex flex-col items-center justify-center py-12 text-center"
                                    >
                                        <div className="mb-6 rounded-full bg-green-100 p-4 dark:bg-green-900/30">
                                            <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
                                        </div>
                                        <h3 className="mb-2 text-2xl font-bold text-foreground">Message Sent!</h3>
                                        <p className="mb-4 max-w-sm text-muted-foreground">
                                            Thank you for reaching out. We've received your message and will get back to you shortly.
                                        </p>
                                        <div className="mb-8 rounded-lg border border-border bg-muted/50 p-4 text-left">
                                            <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold">
                                                <Clock className="h-4 w-4 text-primary" />
                                                What happens next?
                                            </h4>
                                            <ul className="space-y-1 text-sm text-muted-foreground">
                                                <li className="flex items-start gap-2">
                                                    <Check className="h-4 w-4 mt-0.5 text-green-500 shrink-0" />
                                                    <span>We'll review your message within 24 hours</span>
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <Mail className="h-4 w-4 mt-0.5 text-blue-500 shrink-0" />
                                                    <span>You'll receive a response at <strong>{formData.email}</strong></span>
                                                </li>
                                            </ul>
                                        </div>
                                        <Button onClick={() => setSuccess(false)} variant="outline">
                                            Send Another Message
                                        </Button>
                                    </motion.div>
                                ) : (
                                    <motion.form
                                        key="form"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        onSubmit={handleSubmit}
                                        className="space-y-6"
                                    >
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label htmlFor="name">Name</Label>
                                                <Input
                                                    id="name"
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                    placeholder="Your name"
                                                    required
                                                    disabled={!!user}
                                                    className={user ? "bg-muted opacity-80" : ""}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="email">Email</Label>
                                                <div className="relative">
                                                    <Input
                                                        id="email"
                                                        type="email"
                                                        value={formData.email}
                                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                        placeholder="your@email.com"
                                                        required
                                                        disabled={!!user}
                                                        className={cn(
                                                            user ? "bg-muted opacity-80" : "",
                                                            !user && formData.email.length > 0 ? (isEmailValid ? "border-green-500/50 pr-10" : "border-red-500/50 pr-10") : ""
                                                        )}
                                                    />
                                                    {!user && formData.email.length > 0 && (
                                                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                            {isEmailValid ? (
                                                                <Check className="h-4 w-4 text-green-500" />
                                                            ) : (
                                                                <X className="h-4 w-4 text-red-500" />
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                                {!user && formData.email.length > 0 && !isEmailValid && (
                                                    <p className="text-xs text-red-500">Please enter a valid email address</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="subject">Subject</Label>
                                            <Input
                                                id="subject"
                                                value={formData.subject}
                                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                                placeholder="What is this about?"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="message">Message</Label>
                                            <Textarea
                                                id="message"
                                                value={formData.message}
                                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                                placeholder="Describe your issue or question..."
                                                rows={5}
                                                required
                                                maxLength={150}
                                            />
                                            <div className="flex justify-end">
                                                <span className={cn(
                                                    "text-xs transition-colors",
                                                    formData.message.length > 0 && formData.message.length < 10
                                                        ? "text-red-500 font-medium"
                                                        : "text-muted-foreground"
                                                )}>
                                                    {formData.message.length}/150
                                                </span>
                                            </div>
                                        </div>
                                        <Button type="submit" className="w-full" disabled={loading}>
                                            {loading ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Sending...
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="mr-2 h-4 w-4" />
                                                    Send Message
                                                </>
                                            )}
                                        </Button>
                                    </motion.form>
                                )}
                            </AnimatePresence>
                        </CardContent>
                    </Card>
                </div>
            </main>
            <Footer />
        </div>
    )
}
