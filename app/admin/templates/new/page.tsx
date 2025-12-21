"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createTemplate } from "@/hooks/use-templates"
import { useSettings } from "@/hooks/use-settings"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { ArrowLeft, Loader2, Upload, ImageIcon, Info, ExternalLink } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const categories = ["Automation", "Integration", "CRM", "Marketing", "Data", "AI"]
const levels = ["beginner", "intermediate", "advanced"] as const

export default function NewTemplatePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const { settings } = useSettings()

  // Set default currency from settings
  useEffect(() => {
    if (settings?.defaultCurrency) {
      setFormData(prev => ({ ...prev, currency: settings.defaultCurrency }))
    }
  }, [settings])

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    shortDescription: "",
    longDescription: "",
    price: "",
    originalPrice: "",
    currency: "INR", // Fallback, will be updated by useEffect
    category: "",
    tags: "",
    level: "beginner" as (typeof levels)[number],
    thumbnailUrl: "",
    previewImages: "",
    downloadFileUrl: "",
    isAvailable: true,
    stockCount: "",
    metaTitle: "",
    metaDescription: "",
  })

  // Convert PostImages page URL to direct image URL
  const getDirectImageUrl = (url: string): string => {
    if (!url) return url

    // Check if it's a PostImages page URL (e.g., https://postimg.cc/hJvGTzfy)
    const postimgMatch = url.match(/^https?:\/\/(www\.)?postimg\.cc\/([a-zA-Z0-9]+)\/?$/)
    if (postimgMatch) {
      // Convert to direct image URL by fetching the page and extracting the image
      // For now, we'll use a simple approach: append the image ID to i.postimg.cc
      return `https://i.postimg.cc/${postimgMatch[2]}.jpg`
    }

    // Check if it's already a direct PostImages URL
    if (url.includes('i.postimg.cc')) {
      return url
    }

    // Return as-is for other URLs (Imgur direct links, local paths, etc.)
    return url
  }

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
  }

  const handleTitleChange = (title: string) => {
    setFormData({
      ...formData,
      title,
      slug: generateSlug(title),
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const templateData = {
        title: formData.title,
        slug: formData.slug,
        shortDescription: formData.shortDescription,
        longDescription: formData.longDescription,
        price: Number.parseFloat(formData.price) || 0,
        originalPrice: formData.originalPrice ? Number.parseFloat(formData.originalPrice) : undefined,
        currency: formData.currency,
        category: formData.category,
        tags: formData.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        level: formData.level,
        thumbnailUrl: formData.thumbnailUrl,
        previewImages: formData.previewImages
          .split(",")
          .map((u) => u.trim())
          .filter(Boolean),
        downloadFileUrl: formData.downloadFileUrl,
        isAvailable: formData.isAvailable,
        stockCount: formData.stockCount ? Number.parseInt(formData.stockCount) : null,
        metaTitle: formData.metaTitle || formData.title,
        metaDescription: formData.metaDescription || formData.shortDescription,
      }

      await createTemplate(templateData)
      toast.success("Template created successfully!")
      router.push("/admin/templates")
    } catch (error: any) {
      toast.error(error.message || "Failed to create template")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/templates">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="font-display text-2xl font-bold">New Template</h1>
          <p className="text-muted-foreground">Add a new n8n template to your store</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Enter the template details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      placeholder="CRM Integration Workflow"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slug">Slug</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      placeholder="crm-integration-workflow"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shortDescription">Short Description *</Label>
                  <Textarea
                    id="shortDescription"
                    value={formData.shortDescription}
                    onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                    placeholder="A brief description of your template..."
                    rows={2}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="longDescription">Long Description *</Label>
                  <Textarea
                    id="longDescription"
                    value={formData.longDescription}
                    onChange={(e) => setFormData({ ...formData, longDescription: e.target.value })}
                    placeholder="Detailed description with features, use cases, etc. (supports HTML)"
                    rows={6}
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Pricing & Availability */}
            <Card>
              <CardHeader>
                <CardTitle>Pricing & Availability</CardTitle>
                <CardDescription>Set the price and stock for this template</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price *</Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="499"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="originalPrice">Original Price (Strike-through)</Label>
                    <Input
                      id="originalPrice"
                      type="number"
                      value={formData.originalPrice}
                      onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                      placeholder="999 (Optional)"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select value={formData.currency} onValueChange={(v) => setFormData({ ...formData, currency: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INR">INR (₹)</SelectItem>
                        <SelectItem value="USD">USD ($)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stockCount">Stock Count</Label>
                    <Input
                      id="stockCount"
                      type="number"
                      value={formData.stockCount}
                      onChange={(e) => setFormData({ ...formData, stockCount: e.target.value })}
                      placeholder="Leave empty for unlimited"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div>
                    <Label htmlFor="isAvailable">Available for Purchase</Label>
                    <p className="text-sm text-muted-foreground">Toggle off to hide from store</p>
                  </div>
                  <Switch
                    id="isAvailable"
                    checked={formData.isAvailable}
                    onCheckedChange={(checked) => setFormData({ ...formData, isAvailable: checked })}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Media */}
            <Card>
              <CardHeader>
                <CardTitle>Media & Files</CardTitle>
                <CardDescription>Add images and the template file</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="thumbnailUrl">Thumbnail URL</Label>
                  <Input
                    id="thumbnailUrl"
                    value={formData.thumbnailUrl}
                    onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                  />

                  {/* Image Preview & Guide */}
                  <div className="mt-4 space-y-4">
                    {formData.thumbnailUrl ? (
                      <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border bg-muted">
                        <img
                          src={getDirectImageUrl(formData.thumbnailUrl)}
                          alt="Thumbnail preview"
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://placehold.co/600x400?text=Invalid+URL`
                          }}
                        />
                        <div className="absolute bottom-2 right-2 rounded-md bg-black/70 px-2 py-1 text-xs text-white backdrop-blur-sm">
                          Preview
                        </div>
                      </div>
                    ) : (
                      <div className="flex aspect-video w-full flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 text-muted-foreground">
                        <ImageIcon className="mb-2 h-8 w-8 opacity-50" />
                        <p className="text-sm">Image preview will appear here</p>
                      </div>
                    )}

                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="hosting-tips" className="border-border">
                        <AccordionTrigger className="text-sm py-2">
                          <span className="flex items-center gap-2">
                            <Info className="h-4 w-4" />
                            How to host images for free?
                          </span>
                        </AccordionTrigger>
                        <AccordionContent className="text-sm text-muted-foreground space-y-3 pb-4">
                          <p>Since Firebase Storage is paid, you can use these free alternatives:</p>
                          <ul className="list-disc pl-4 space-y-2">
                            <li>
                              <strong>Option 1 (PostImages):</strong> Upload to <a href="https://postimages.org/" target="_blank" rel="noreferrer" className="text-primary hover:underline inline-flex items-center">PostImages <ExternalLink className="ml-1 h-3 w-3" /></a>.
                              You can paste either the page URL (e.g., <code className="bg-muted px-1 py-0.5 rounded text-xs">postimg.cc/xxx</code>) or click "Direct Link" for the image URL.
                            </li>
                            <li>
                              <strong>Option 2 (Local):</strong> Place the file in your project's <code className="bg-muted px-1 py-0.5 rounded">public</code> folder.
                              Example: <code className="bg-muted px-1 py-0.5 rounded">/my-template.png</code>.
                            </li>
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="previewImages">Preview Images</Label>
                  <Input
                    id="previewImages"
                    value={formData.previewImages}
                    onChange={(e) => setFormData({ ...formData, previewImages: e.target.value })}
                    placeholder="Comma-separated URLs"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="downloadFileUrl">Download File URL *</Label>
                  <Input
                    id="downloadFileUrl"
                    value={formData.downloadFileUrl}
                    onChange={(e) => setFormData({ ...formData, downloadFileUrl: e.target.value })}
                    placeholder="URL to the .json template file"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Upload your .json file to a storage service and paste the URL here
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Category & Tags */}
            <Card>
              <CardHeader>
                <CardTitle>Organization</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="level">Level</Label>
                  <Select
                    value={formData.level}
                    onValueChange={(v) => setFormData({ ...formData, level: v as (typeof levels)[number] })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {levels.map((level) => (
                        <SelectItem key={level} value={level} className="capitalize">
                          {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tags">Tags</Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="api, automation, crm"
                  />
                  <p className="text-xs text-muted-foreground">Comma-separated</p>
                </div>
              </CardContent>
            </Card>

            {/* SEO */}
            <Card>
              <CardHeader>
                <CardTitle>SEO</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="metaTitle">Meta Title</Label>
                  <Input
                    id="metaTitle"
                    value={formData.metaTitle}
                    onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                    placeholder="Defaults to title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="metaDescription">Meta Description</Label>
                  <Textarea
                    id="metaDescription"
                    value={formData.metaDescription}
                    onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                    placeholder="Defaults to short description"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardContent className="pt-6">
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Create Template
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}
