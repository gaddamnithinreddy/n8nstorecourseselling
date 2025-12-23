"use client"
import * as React from "react"
import Autoplay from "embla-carousel-autoplay"
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { TemplateCard } from "@/components/template-card"
import { SetupBanner } from "@/components/setup-banner"
import { useTemplates } from "@/hooks/use-templates"
import { Button } from "@/components/ui/button"
import { useSettings } from "@/hooks/use-settings"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Zap, ArrowRight, CheckCircle, Download, ShieldCheck, Clock, Sparkles, PackageOpen } from "lucide-react"
import { motion, Variants } from "framer-motion"

function TemplateCardSkeleton() {
    return (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
            <Skeleton className="aspect-[16/10] w-full" />
            <div className="p-4 sm:p-5">
                <div className="mb-3 flex items-center gap-2">
                    <Skeleton className="h-5 w-20 rounded-full" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <Skeleton className="mb-2 h-6 w-3/4" />
                <Skeleton className="mb-2 h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-4">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-4 w-24" />
                </div>
            </div>
        </div>
    )
}

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
}

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5 }
    }
}

export default function HomePage() {
    const { settings } = useSettings()
    const { templates, loading, error, permissionError } = useTemplates(true)
    const featuredTemplates = templates.slice(0, 6)

    const features = [
        {
            icon: Zap,
            title: "Ready to Use",
            description: "Import directly into n8n and start automating in minutes",
        },
        {
            icon: ShieldCheck,
            title: "Production Ready",
            description: "Battle-tested templates with error handling built-in",
        },
        {
            icon: Clock,
            title: "Save Hours",
            description: "Skip the learning curve and get results immediately",
        },
        {
            icon: Download,
            title: "Instant Download",
            description: "Get your templates delivered to your inbox instantly",
        },
    ]

    const faqs = [
        {
            question: "Do I need coding knowledge to use these templates?",
            answer: "No. These templates are designed for beginners. Basic understanding of APIs or automation helps, but no coding is required.",
        },
        {
            question: "Can I customize the templates after purchasing?",
            answer: "Yes. All templates are fully editable inside n8n. You can modify triggers, nodes, and logic as needed.",
        },
        {
            question: "Is this a one-time payment or subscription?",
            answer: "It’s a one-time payment. No subscriptions or recurring charges.",
        },
        {
            question: "How will I receive the template after payment?",
            answer: "You’ll receive an email with a download link immediately after purchase.",
        },
        {
            question: "What if I don’t receive the email?",
            answer: "You can request for the template through the contact us page through your mail by mailing to us or you can download the template link from the account dashboard in the website",
        },
        {
            question: "Do you store my personal data?",
            answer: "Only basic information like email (for delivery). We never sell or misuse user data.",
        },
        {
            question: "What if the template doesn’t work as expected?",
            answer: "Contact support with details. We’ll help you fix the issue or guide you properly.",
        },
    ]

    return (
        <div className="flex min-h-screen flex-col">
            <Navbar />

            <main className="flex-1">
                {/* Hero Section */}
                <section className="relative overflow-hidden border-b border-border">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
                    <div className="container relative mx-auto px-4 py-16 sm:py-20 md:py-28 lg:py-32">
                        <motion.div
                            className="mx-auto max-w-3xl text-center"
                            initial="hidden"
                            animate="visible"
                            variants={containerVariants}
                        >
                            <motion.div variants={itemVariants}>
                                <motion.div
                                    className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary backdrop-blur-sm relative overflow-hidden mb-4"
                                >
                                    {/* Shimmer Effect */}
                                    <motion.div
                                        className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent"
                                        animate={{ x: ["-100%", "100%"] }}
                                        transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                                    />
                                    <Sparkles className="mr-1.5 h-3 w-3 relative z-10" />
                                    <span className="relative z-10">Premium n8n Templates</span>
                                </motion.div>
                            </motion.div>
                            <motion.h1 variants={itemVariants} className="mb-6 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl text-balance">
                                {settings?.heroTitle ? (
                                    <>
                                        {settings.heroTitle.split(" ").slice(0, -2).join(" ")}{" "}
                                        <span className="text-primary">{settings.heroTitle.split(" ").slice(-2).join(" ")}</span>
                                    </>
                                ) : (
                                    <>Automate Your Workflow with <span className="text-primary">Premium n8n Templates</span></>
                                )}
                            </motion.h1>
                            <motion.p variants={itemVariants} className="mb-8 text-base text-muted-foreground sm:text-lg md:text-xl text-pretty leading-relaxed">
                                {settings?.heroDescription || "Skip the complexity. Get production-ready n8n workflows that save you hours of development time. Import, customize, and deploy in minutes."}
                            </motion.p>
                            <motion.div variants={itemVariants} className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
                                <Button size="lg" className="w-full sm:w-auto" asChild>
                                    <Link href="/templates">
                                        Browse Templates
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                                <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent" asChild>
                                    <Link href="#features">Learn More</Link>
                                </Button>
                            </motion.div>
                        </motion.div>
                    </div>
                </section>

                {/* Features Section */}
                <section id="features" className="border-b border-border py-16 sm:py-20">
                    <div className="container mx-auto px-4">
                        <motion.div
                            className="mb-10 text-center sm:mb-12"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.5 }}
                        >
                            <h2 className="mb-3 text-2xl font-bold sm:text-3xl md:text-4xl">Why Choose Our Templates?</h2>
                            <p className="text-sm text-muted-foreground sm:text-base">
                                Built by automation experts for professionals who value their time
                            </p>
                        </motion.div>

                        {/* Desktop Grid View */}
                        <motion.div
                            className="hidden sm:grid gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-6"
                            variants={containerVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-50px" }}
                        >
                            {features.map((feature, index) => (
                                <motion.div
                                    key={feature.title}
                                    variants={itemVariants}
                                    className="group rounded-xl border border-border/60 bg-card/50 p-5 transition-all duration-300 hover:border-primary/30 hover:bg-card hover:shadow-lg sm:p-6"
                                >
                                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                                        <feature.icon className="h-5 w-5" />
                                    </div>
                                    <h3 className="mb-2 text-base font-semibold sm:text-lg">{feature.title}</h3>
                                    <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
                                </motion.div>
                            ))}
                        </motion.div>

                        {/* Mobile Carousel View */}
                        <div className="block sm:hidden">
                            <Carousel
                                opts={{
                                    loop: true,
                                }}
                                plugins={React.useMemo(() => [
                                    Autoplay({
                                        delay: 2000,
                                        stopOnInteraction: false,
                                        stopOnMouseEnter: true,
                                    }) as any
                                ], [])}
                                className="w-full"
                            >
                                <CarouselContent className="-ml-4">
                                    {features.map((feature, index) => (
                                        <CarouselItem key={index} className="pl-4 basis-[85%]">
                                            <div className="h-full rounded-xl border border-border/60 bg-card/50 p-5">
                                                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                                    <feature.icon className="h-5 w-5" />
                                                </div>
                                                <h3 className="mb-2 text-base font-semibold">{feature.title}</h3>
                                                <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
                                            </div>
                                        </CarouselItem>
                                    ))}
                                </CarouselContent>
                                <div className="mt-4 flex justify-center gap-2">
                                    {/* Optional: Add custom dots or controls here if needed, or rely on Swipe */}
                                </div>
                            </Carousel>
                        </div>
                    </div>
                </section>

                {/* Featured Templates Section */}
                <section className="py-16 sm:py-20">
                    <div className="container mx-auto px-4">
                        <motion.div
                            className="mb-10 flex flex-col items-start justify-between gap-4 sm:mb-12 sm:flex-row sm:items-center"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                        >
                            <div>
                                <h2 className="mb-2 text-2xl font-bold sm:text-3xl md:text-4xl">Featured Templates</h2>
                                <p className="text-sm text-muted-foreground sm:text-base">Our most popular automation workflows</p>
                            </div>
                            <Button variant="outline" className="shrink-0 bg-transparent" asChild>
                                <Link href="/templates">
                                    View All Templates
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </motion.div>

                        {permissionError && <SetupBanner type="firestore-rules" />}

                        {loading ? (
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6">
                                {[...Array(6)].map((_, i) => (
                                    <TemplateCardSkeleton key={i} />
                                ))}
                            </div>
                        ) : error && !permissionError ? (
                            <div className="rounded-xl border border-destructive/20 bg-destructive/5 py-12 text-center">
                                <p className="text-sm text-muted-foreground">Unable to load templates. Please try again later.</p>
                            </div>
                        ) : featuredTemplates.length > 0 ? (
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6">
                                {featuredTemplates.map((template, index) => (
                                    <TemplateCard key={template.id} template={template} index={index} />
                                ))}
                            </div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="rounded-xl border border-dashed border-border bg-card/50 py-16 text-center"
                            >
                                <PackageOpen className="mx-auto mb-4 h-12 w-12 text-muted-foreground/40" />
                                <h3 className="mb-2 text-lg font-semibold">No Templates Available Yet</h3>
                                <p className="text-sm text-muted-foreground">Premium n8n templates coming soon. Check back later!</p>
                            </motion.div>
                        )}
                    </div>
                </section>

                {/* CTA Section */}
                <section className="bg-card/50 py-16 sm:py-20">
                    <div className="container mx-auto px-4">
                        <motion.div
                            className="mx-auto max-w-2xl text-center"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.7 }}
                        >
                            <h2 className="mb-4 text-2xl font-bold sm:text-3xl md:text-4xl">Ready to Automate?</h2>
                            <p className="mb-8 text-sm text-muted-foreground sm:text-base">
                                Join hundreds of professionals who save time every day with our premium n8n templates.
                            </p>
                            <div className="flex flex-wrap items-center justify-center gap-4 text-sm sm:gap-6">
                                {["Instant download", "Email delivery", "Lifetime access"].map((item) => (
                                    <div key={item} className="flex items-center gap-2 text-muted-foreground">
                                        <CheckCircle className="h-4 w-4 text-primary" />
                                        {item}
                                    </div>
                                ))}
                            </div>
                            <Button size="lg" className="mt-8" asChild>
                                <Link href="/templates">
                                    Browse All Templates
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </motion.div>
                    </div>
                </section>

                {/* FAQ Section */}
                <section id="faq" className="py-16 sm:py-20">
                    <div className="container mx-auto px-4 max-w-3xl">
                        <motion.div
                            className="mb-10 text-center sm:mb-12"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="mb-3 text-2xl font-bold sm:text-3xl md:text-4xl">Frequently Asked Questions</h2>
                            <p className="text-sm text-muted-foreground sm:text-base">
                                Everything you need to know about our templates
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                        >
                            <Accordion type="single" collapsible className="w-full" suppressHydrationWarning>
                                {faqs.map((faq, index) => (
                                    <AccordionItem key={index} value={`item-${index}`} suppressHydrationWarning>
                                        <AccordionTrigger className="text-left text-base sm:text-lg" suppressHydrationWarning>
                                            {faq.question}
                                        </AccordionTrigger>
                                        <AccordionContent className="text-muted-foreground text-sm sm:text-base leading-relaxed" suppressHydrationWarning>
                                            {faq.answer}
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </motion.div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    )
}
