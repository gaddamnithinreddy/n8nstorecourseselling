"use client"

import type React from "react"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { getTemplateById, updateTemplate } from "@/hooks/use-templates"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { ArrowLeft, Loader2, Save } from "lucide-react"
import type { Template } from "@/lib/firebase/types"

const categories = ["Automation", "Integration", "CRM", "Marketing", "Data", "AI"]
const levels = ["beginner", "intermediate", "advanced"] as const

export default function EditTemplatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [template, setTemplate] = useState<Template | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    shortDescription: "",
    longDescription: "",
    price: "",
    originalPrice: "",
    currency: "INR",
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

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const data = await getTemplateById(id)
        if (data) {
          setTemplate(data)
          setFormData({
            title: data.title || "",
            slug: data.slug || "",
            shortDescription: data.shortDescription || "",
            longDescription: data.longDescription || "",
            price: data.price?.toString() || "",
            originalPrice: data.originalPrice?.toString() || "",
            currency: data.currency || "INR",
            category: data.category || "",
            tags: data.tags?.join(", ") || "",
            level: data.level || "beginner",
            thumbnailUrl: data.thumbnailUrl || "",
            previewImages: data.previewImages?.join(", ") || "",
            downloadFileUrl: data.downloadFileUrl || "",
            isAvailable: data.isAvailable ?? true,
            stockCount: data.stockCount?.toString() || "",
            metaTitle: data.metaTitle || "",
            metaDescription: data.metaDescription || "",
          })
        }
      } catch (error) {
        toast.error("Failed to load template")
      } finally {
        setLoading(false)
      }
    }
    fetchTemplate()
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

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

      await updateTemplate(id, templateData)
      toast.success("Template updated successfully!")
      router.push("/admin/templates")
    } catch (error: any) {
      toast.error(error.message || "Failed to update template")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    )
  }

  if (!template) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <h2 className="text-lg font-semibold">Template not found</h2>
        <Button asChild className="mt-4">
          <Link href="/admin/templates">Back to Templates</Link>
        </Button>
      </div>
    )
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
          <h1 className="font-display text-2xl font-bold">Edit Template</h1>
          <p className="text-muted-foreground">{template.title}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slug">Slug</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shortDescription">Short Description *</Label>
                  <Textarea
                    id="shortDescription"
                    value={formData.shortDescription}
                    onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
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
                    rows={6}
                    required
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pricing & Availability</CardTitle>
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
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="originalPrice">Original Price</Label>
                    <Input
                      id="originalPrice"
                      type="number"
                      value={formData.originalPrice}
                      onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                      placeholder="Optional"
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
                      placeholder="Unlimited"
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

            <Card>
              <CardHeader>
                <CardTitle>Media & Files</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="thumbnailUrl">Thumbnail URL</Label>
                  <Input
                    id="thumbnailUrl"
                    value={formData.thumbnailUrl}
                    onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                  />
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
                    required
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
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
                </div>
              </CardContent>
            </Card>

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
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="metaDescription">Meta Description</Label>
                  <Textarea
                    id="metaDescription"
                    value={formData.metaDescription}
                    onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <Button type="submit" className="w-full" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
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
