"use client"

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ShieldAlert, Mail } from "lucide-react"

export default function RefundPolicyPage() {
    return (
        <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1 py-12 sm:py-20 bg-muted/30">
                <div className="container mx-auto px-4 max-w-3xl">
                    <div className="mb-8 text-center animate-fade-in">
                        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Refund Policy</h1>
                        <p className="mt-4 text-muted-foreground">
                            Transparency and clarity about our billing and refund practices.
                        </p>
                    </div>

                    <Card className="animate-fade-in delay-100">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ShieldAlert className="h-5 w-5 text-primary" />
                                Policy Overview
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6 text-sm leading-relaxed text-muted-foreground sm:text-base">
                            <p>
                                At n8n Store, we strive to provide high-quality, production-ready automation templates.
                                Due to the digital nature of our products, all sales are final.
                            </p>

                            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900/50 dark:bg-yellow-900/20">
                                <h3 className="mb-2 font-semibold text-yellow-800 dark:text-yellow-200">
                                    Why No Refunds?
                                </h3>
                                <p className="text-yellow-700 dark:text-yellow-300">
                                    Our templates are downloadable digital assets. Once purchased, you receive instant access to the
                                    source code and configuration files, which cannot be "returned." Therefore, we generally do not
                                    offer refunds once a purchase is completed.
                                </p>
                            </div>

                            <h3 className="font-semibold text-foreground">Exceptions & Support</h3>
                            <p>
                                While we do not offer refunds, we are committed to ensuring you get value from your purchase.
                                If you encounter technical issues with a template that cannot be resolved:
                            </p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>
                                    <strong>Broken Files:</strong> If the download link is broken or the file is corrupted.
                                </li>
                                <li>
                                    <strong>Misrepresentation:</strong> If the template functionality is significantly different from the description.
                                </li>
                            </ul>
                            <p>
                                In such rare cases, please contact our support team within 7 days of purchase. We will review
                                your request on a case-by-case basis.
                            </p>

                            <div className="pt-4 border-t">
                                <h3 className="mb-2 font-semibold text-foreground">Need Assistance?</h3>
                                <p className="mb-4">
                                    If you're having trouble setting up your template, our support team is happy to help you get started.
                                </p>
                                <a
                                    href="/contact"
                                    className="inline-flex items-center text-primary hover:underline"
                                >
                                    <Mail className="mr-2 h-4 w-4" />
                                    Contact Support
                                </a>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
            <Footer />
        </div>
    )
}
