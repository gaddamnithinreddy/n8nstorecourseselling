"use client"

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { BookOpen, Terminal, Shield, AlertCircle, CheckCircle2, ChevronRight, FileJson, Key } from "lucide-react"
import Link from "next/link"

export default function DocumentationPage() {
    return (
        <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1 py-12 sm:py-20 bg-muted/30">
                <div className="container mx-auto px-4 max-w-5xl">
                    <div className="mb-10 text-center animate-fade-in">
                        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Documentation</h1>
                        <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
                            Master your automation templates with our comprehensive guides.
                            From setup to production deployment, we've got you covered.
                        </p>
                    </div>

                    <Tabs defaultValue="welcome" className="animate-fade-in delay-100">
                        <div className="flex justify-center mb-8">
                            <TabsList className="grid w-full max-w-2xl grid-cols-4">
                                <TabsTrigger value="welcome">Welcome</TabsTrigger>
                                <TabsTrigger value="getting-started">Setup</TabsTrigger>
                                <TabsTrigger value="configuration">Config</TabsTrigger>
                                <TabsTrigger value="troubleshooting">Help</TabsTrigger>
                            </TabsList>
                        </div>

                        {/* Welcome Tab */}
                        <TabsContent value="welcome" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-2xl">Introduction</CardTitle>
                                    <CardDescription>
                                        Welcome to the official documentation for n8n Store templates.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <p className="leading-relaxed">
                                        Our templates are built for stability, scalability, and ease of use.
                                        Unlike standard workflows, we implement advanced error handling and
                                        modular logic to ensure your automations run smoothly in production environments.
                                    </p>
                                    <Alert>
                                        <Shield className="h-4 w-4" />
                                        <AlertTitle>Security First</AlertTitle>
                                        <AlertDescription>
                                            All our templates are designed with security best practices.
                                            We never hardcode credentials; everything is managed via
                                            Environment Variables or n8n Credentials store.
                                        </AlertDescription>
                                    </Alert>
                                    <div className="grid gap-4 md:grid-cols-2 mt-6">
                                        <div className="rounded-lg border p-4 bg-card/50">
                                            <h3 className="font-semibold flex items-center mb-2">
                                                <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                                                Production Ready
                                            </h3>
                                            <p className="text-sm text-muted-foreground">
                                                Battle-tested logic that handles edge cases and API rate limits automatically.
                                            </p>
                                        </div>
                                        <div className="rounded-lg border p-4 bg-card/50">
                                            <h3 className="font-semibold flex items-center mb-2">
                                                <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                                                Modular Design
                                            </h3>
                                            <p className="text-sm text-muted-foreground">
                                                Easily extend functionality without breaking the core workflow structure.
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Getting Started Tab */}
                        <TabsContent value="getting-started" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Installation Guide</CardTitle>
                                    <CardDescription>
                                        Follow these steps to import your template into n8n.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-4">
                                        <div className="flex gap-4">
                                            <div className="flex-none flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold">
                                                1
                                            </div>
                                            <div className="space-y-2">
                                                <h3 className="font-semibold text-lg">Download Your Template</h3>
                                                <p className="text-muted-foreground">
                                                    After purchase, download the <Badge variant="outline" className="font-mono text-xs">.json</Badge> file
                                                    from your email or dashboard. This file contains the complete workflow definition.
                                                </p>
                                            </div>
                                        </div>
                                        <Separator />
                                        <div className="flex gap-4">
                                            <div className="flex-none flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold">
                                                2
                                            </div>
                                            <div className="space-y-2">
                                                <h3 className="font-semibold text-lg">Import to n8n</h3>
                                                <p className="text-muted-foreground">
                                                    Open your n8n dashboard and create a new workflow.
                                                </p>
                                                <div className="rounded-md bg-muted p-4 font-mono text-sm overflow-x-auto">
                                                    <p className="text-muted-foreground"># In n8n Dashboard:</p>
                                                    <p>1. Click <span className="text-primary">"Add Workflow"</span></p>
                                                    <p>2. Select <span className="text-primary">"Import from File"</span></p>
                                                    <p>3. Choose the .json file you downloaded</p>
                                                </div>
                                            </div>
                                        </div>
                                        <Separator />
                                        <div className="flex gap-4">
                                            <div className="flex-none flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold">
                                                3
                                            </div>
                                            <div className="space-y-2">
                                                <h3 className="font-semibold text-lg">Activate</h3>
                                                <p className="text-muted-foreground">
                                                    Once imported, you will see the nodes appear. Toggle the "Active" switch
                                                    in the top right corner to start the workflow.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <Alert className="bg-blue-500/10 border-blue-500/20">
                                        <Terminal className="h-4 w-4 text-blue-500" />
                                        <AlertTitle className="text-blue-500">Pro Tip: Workflow Isolation</AlertTitle>
                                        <AlertDescription className="text-blue-500/90">
                                            We recommend running critical automations in their own dedicated execution mode
                                            main process to prevent memory leaks in high-load scenarios.
                                        </AlertDescription>
                                    </Alert>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Configuration Tab */}
                        <TabsContent value="configuration" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle>Credential Setup</CardTitle>
                                            <CardDescription>
                                                Connecting your services securely.
                                            </CardDescription>
                                        </div>
                                        <Key className="h-6 w-6 text-muted-foreground" />
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <p className="text-muted-foreground">
                                        Most templates require access to third-party APIs (like OpenAI, Stripe, or Google Sheets).
                                        Instead of entering API keys directly into nodes, we use n8n's Credential Store.
                                    </p>

                                    <div className="grid gap-4 md:grid-cols-3">
                                        <div className="space-y-2 rounded-lg border p-4">
                                            <div className="font-semibold">Param Handling</div>
                                            <p className="text-xs text-muted-foreground">
                                                Inputs are validated strictly. Ensure your input JSON matches the schema defined in the "Start" node.
                                            </p>
                                        </div>
                                        <div className="space-y-2 rounded-lg border p-4">
                                            <div className="font-semibold">Env Variables</div>
                                            <p className="text-xs text-muted-foreground">
                                                Sensitive global settings are loaded from <code>.env</code> files in our self-hosted templates.
                                            </p>
                                        </div>
                                        <div className="space-y-2 rounded-lg border p-4">
                                            <div className="font-semibold">Retry Policy</div>
                                            <p className="text-xs text-muted-foreground">
                                                Our generic API nodes are configured with exponential backoff for 429/5xx errors.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="rounded-lg bg-muted p-4">
                                        <h4 className="flex items-center font-semibold mb-2">
                                            <FileJson className="h-4 w-4 mr-2" />
                                            Example Config Object
                                        </h4>
                                        <pre className="text-xs overflow-x-auto p-2 bg-background rounded border">
                                            {`{
  "retryOnFail": true,
  "maxTries": 3,
  "waitBetweenTries": 5000,
  "suppressErrors": false
}`}
                                        </pre>
                                        <p className="text-xs text-muted-foreground mt-2">
                                            * This is a generic example of how we configure resilience in our nodes.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Troubleshooting Tab */}
                        <TabsContent value="troubleshooting" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Common Issues</CardTitle>
                                    <CardDescription>
                                        Quick fixes for standard execution errors.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="group rounded-lg border px-5 py-4 hover:bg-muted/50 transition-colors">
                                            <div className="flex items-center justify-between">
                                                <h4 className="font-semibold">Workflow stops randomly</h4>
                                                <Badge variant="outline">Memory</Badge>
                                            </div>
                                            <p className="mt-2 text-sm text-muted-foreground">
                                                If processing large datasets (e.g., 10k rows), ensure you are using
                                                the "Split in Batches" logic included in the template to avoid OOM kills.
                                            </p>
                                        </div>

                                        <div className="group rounded-lg border px-5 py-4 hover:bg-muted/50 transition-colors">
                                            <div className="flex items-center justify-between">
                                                <h4 className="font-semibold">API Rate Limits (429)</h4>
                                                <Badge variant="outline">Network</Badge>
                                            </div>
                                            <p className="mt-2 text-sm text-muted-foreground">
                                                The templates have built-in rate limit handling, but if you are on a free tier
                                                of a third-party service, you may need to increase the <code>Wait</code> node duration.
                                            </p>
                                        </div>

                                        <div className="group rounded-lg border px-5 py-4 hover:bg-muted/50 transition-colors">
                                            <div className="flex items-center justify-between">
                                                <h4 className="font-semibold">Webhook not triggering</h4>
                                                <Badge variant="outline">Connectivity</Badge>
                                            </div>
                                            <p className="mt-2 text-sm text-muted-foreground">
                                                Ensure the "Production" URL is being used, not the "Test" URL, once activated.
                                                Also check CORS settings if calling from a browser.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-8 rounded-xl border-2 border-dashed p-6 text-center">
                                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                                            <BookOpen className="h-6 w-6 text-primary" />
                                        </div>
                                        <h3 className="text-lg font-semibold">Need Advanced Support?</h3>
                                        <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
                                            For complex implementations or custom development, our certified experts are available.
                                        </p>
                                        <Button className="mt-4" variant="default" asChild>
                                            <Link href="/contact">Contact Support</Link>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </main>
            <Footer />
        </div>
    )
}
