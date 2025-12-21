"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useSettings } from "@/hooks/use-settings"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Settings,
  Globe,
  Mail,
  CreditCard,
  Shield,
  Palette,
  Search,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Save,
  Users,
  Youtube // Added Youtube
} from "lucide-react"
import { toast } from "sonner"

export default function AdminSettingsPage() {
  const { user, firebaseUser } = useAuth()
  const { settings, loading, error, updateSettings: updateSettingsHook } = useSettings()
  const [saving, setSaving] = useState(false)
  const [localSettings, setLocalSettings] = useState<typeof settings>(null)

  // Update local settings when settings load
  useEffect(() => {
    if (settings) {
      setLocalSettings(settings)
    }
  }, [settings])

  if (error) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
        <div className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="h-6 w-6" />
          <h2 className="text-xl font-semibold">Failed to load settings</h2>
        </div>
        <p className="text-muted-foreground">{error}</p>
        <p className="text-sm text-muted-foreground">
          Make sure your account has admin permissions and Firestore rules are deployed.
        </p>
      </div>
    )
  }

  const handleSave = async () => {
    if (!localSettings) return

    setSaving(true)
    try {
      await updateSettingsHook(localSettings)
      toast.success("Settings saved successfully!")
    } catch (error) {
      toast.error("Failed to save settings")
      console.error(error)
    } finally {
      setSaving(false)
    }
  }

  const updateField = (field: string, value: any) => {
    setLocalSettings(prev => prev ? { ...prev, [field]: value } : null)
  }

  const updateSocial = (platform: string, value: string) => {
    setLocalSettings(prev => {
      if (!prev) return null
      return {
        ...prev,
        socialLinks: {
          ...prev.socialLinks,
          [platform]: value
        }
      }
    })
  }

  const updateAnalytics = (platform: string, value: string) => {
    setLocalSettings(prev => {
      if (!prev) return null
      return {
        ...prev,
        analytics: {
          ...prev.analytics,
          [platform]: value
        }
      }
    })
  }

  if (loading || !localSettings) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold md:text-3xl">Settings</h1>
          <p className="text-muted-foreground">Manage your website configuration and preferences</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
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
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6">
          <TabsTrigger value="general">
            <Settings className="mr-2 h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="features">
            <Globe className="mr-2 h-4 w-4" />
            Features
          </TabsTrigger>
          <TabsTrigger value="email">
            <Mail className="mr-2 h-4 w-4" />
            Email
          </TabsTrigger>
          <TabsTrigger value="payment">
            <CreditCard className="mr-2 h-4 w-4" />
            Payment
          </TabsTrigger>
          <TabsTrigger value="seo">
            <Search className="mr-2 h-4 w-4" />
            SEO
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="mr-2 h-4 w-4" />
            Security
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Site Identity & Branding</CardTitle>
              <CardDescription>Basic information and social links</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input
                    id="siteName"
                    value={localSettings.siteName}
                    onChange={(e) => updateField("siteName", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="logoUrl">Logo URL</Label>
                  <Input
                    id="logoUrl"
                    value={localSettings.logoUrl}
                    onChange={(e) => updateField("logoUrl", e.target.value)}
                    placeholder="https://example.com/logo.png"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="siteDescription">Site Description</Label>
                <Textarea
                  id="siteDescription"
                  value={localSettings.siteDescription}
                  onChange={(e) => updateField("siteDescription", e.target.value)}
                  rows={2}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="heroTitle">Hero Title</Label>
                  <Input
                    id="heroTitle"
                    value={localSettings.heroTitle}
                    onChange={(e) => updateField("heroTitle", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="heroDescription">Hero Description</Label>
                  <Input
                    id="heroDescription"
                    value={localSettings.heroDescription}
                    onChange={(e) => updateField("heroDescription", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="footerText">Footer Copyright Text</Label>
                  <Input
                    id="footerText"
                    value={localSettings.footerText}
                    onChange={(e) => updateField("footerText", e.target.value)}
                    placeholder="© 2024 My Store. All rights reserved."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supportEmail">Support Email</Label>
                  <Input
                    id="supportEmail"
                    type="email"
                    value={localSettings.supportEmail}
                    onChange={(e) => updateField("supportEmail", e.target.value)}
                    placeholder="support@example.com"
                  />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-sm font-medium">Social Media Links</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2"><Globe className="h-4 w-4" /> Website/Twitter</Label>
                    <Input
                      value={localSettings.socialLinks?.twitter || ""}
                      onChange={(e) => updateSocial("twitter", e.target.value)}
                      placeholder="Twitter URL"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2"><Users className="h-4 w-4" /> LinkedIn</Label>
                    <Input
                      value={localSettings.socialLinks?.linkedin || ""}
                      onChange={(e) => updateSocial("linkedin", e.target.value)}
                      placeholder="LinkedIn URL"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2"><Youtube className="h-4 w-4" /> YouTube</Label>
                    <Input
                      value={localSettings.socialLinks?.youtube || ""}
                      onChange={(e) => updateSocial("youtube", e.target.value)}
                      placeholder="YouTube Channel URL"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">GitHub</Label>
                    <Input
                      value={localSettings.socialLinks?.github || ""}
                      onChange={(e) => updateSocial("github", e.target.value)}
                      placeholder="GitHub Profile URL"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Feature Toggles */}
        <TabsContent value="features" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Feature Controls</CardTitle>
              <CardDescription>Enable or disable website features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                    {localSettings.maintenanceMode && (
                      <Badge variant="destructive" className="text-xs">
                        <AlertTriangle className="mr-1 h-3 w-3" />
                        Active
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Temporarily disable the website for maintenance
                  </p>
                </div>
                <Switch
                  id="maintenanceMode"
                  checked={localSettings.maintenanceMode}
                  onCheckedChange={(checked) => updateField("maintenanceMode", checked)}
                />
              </div>

              {localSettings.maintenanceMode && (
                <div className="space-y-2">
                  <Label htmlFor="maintenanceMessage">Maintenance Message</Label>
                  <Textarea
                    id="maintenanceMessage"
                    value={localSettings.maintenanceMessage}
                    onChange={(e) => updateField("maintenanceMessage", e.target.value)}
                    rows={2}
                  />
                </div>
              )}

              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="enablePayments">Enable Payments</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow users to purchase templates
                  </p>
                </div>
                <Switch
                  id="enablePayments"
                  checked={localSettings.enablePayments}
                  onCheckedChange={(checked) => updateField("enablePayments", checked)}
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="enableUserRegistration">Enable User Registration</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow new users to sign up
                  </p>
                </div>
                <Switch
                  id="enableUserRegistration"
                  checked={localSettings.enableUserRegistration}
                  onCheckedChange={(checked) => updateField("enableUserRegistration", checked)}
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="enableEmailNotifications">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Send order confirmation emails
                  </p>
                </div>
                <Switch
                  id="enableEmailNotifications"
                  checked={localSettings.enableEmailNotifications}
                  onCheckedChange={(checked) => updateField("enableEmailNotifications", checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Settings */}
        <TabsContent value="email" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Configuration</CardTitle>
              <CardDescription>Customize email templates and sender information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="emailFromName">From Name</Label>
                  <Input
                    id="emailFromName"
                    value={localSettings.emailFromName}
                    onChange={(e) => updateField("emailFromName", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emailFromAddress">From Email</Label>
                  <Input
                    id="emailFromAddress"
                    type="email"
                    value={localSettings.emailFromAddress}
                    onChange={(e) => updateField("emailFromAddress", e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="emailSubjectTemplate">Email Subject Template</Label>
                <Input
                  id="emailSubjectTemplate"
                  value={localSettings.emailSubjectTemplate}
                  onChange={(e) => updateField("emailSubjectTemplate", e.target.value)}
                  placeholder="Use {{templateName}} for dynamic content"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emailBodyTemplate">Email Body Template</Label>
                <Textarea
                  id="emailBodyTemplate"
                  value={localSettings.emailBodyTemplate}
                  onChange={(e) => updateField("emailBodyTemplate", e.target.value)}
                  rows={5}
                  placeholder="Use {{templateName}}, {{userName}}, etc. for dynamic content"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Settings */}
        <TabsContent value="payment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment Configuration</CardTitle>
              <CardDescription>Currency and payment gateway settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="defaultCurrency">Default Currency</Label>
                  <Input
                    id="defaultCurrency"
                    value={localSettings.defaultCurrency}
                    onChange={(e) => updateField("defaultCurrency", e.target.value.toUpperCase())}
                    maxLength={3}
                  />
                </div>
              </div>
              <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  <strong>Note:</strong> Payment gateway credentials are configured via environment variables.
                  Update CASHFREE_APP_ID and CASHFREE_SECRET_KEY in your deployment settings.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEO Settings */}
        <TabsContent value="seo" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>SEO & Metadata</CardTitle>
              <CardDescription>Optimize your website for search engines</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="metaTitle">Meta Title</Label>
                <Input
                  id="metaTitle"
                  value={localSettings.metaTitle}
                  onChange={(e) => updateField("metaTitle", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="metaDescription">Meta Description</Label>
                <Textarea
                  id="metaDescription"
                  value={localSettings.metaDescription}
                  onChange={(e) => updateField("metaDescription", e.target.value)}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="metaKeywords">Meta Keywords (comma-separated)</Label>
                <Input
                  id="metaKeywords"
                  value={localSettings.metaKeywords.join(", ")}
                  onChange={(e) => updateField("metaKeywords", e.target.value.split(",").map(k => k.trim()))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ogImage">Open Graph Image URL</Label>
                <Input
                  id="ogImage"
                  value={localSettings.ogImage}
                  onChange={(e) => updateField("ogImage", e.target.value)}
                  placeholder="/og-image.png"
                />
              </div>

              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-sm font-medium">Tracking & Analytics</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="googleAnalyticsId">Google Analytics Measurement ID</Label>
                    <Input
                      id="googleAnalyticsId"
                      value={localSettings.analytics?.googleAnalyticsId || ""}
                      onChange={(e) => updateAnalytics("googleAnalyticsId", e.target.value)}
                      placeholder="G-XXXXXXXXXX"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="metaPixelId">Meta Pixel ID</Label>
                    <Input
                      id="metaPixelId"
                      value={localSettings.analytics?.metaPixelId || ""}
                      onChange={(e) => updateAnalytics("metaPixelId", e.target.value)}
                      placeholder="1234567890"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
              <CardDescription>Manage admin access and security features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="enableAuditLog">Enable Audit Logging</Label>
                  <p className="text-sm text-muted-foreground">
                    Track all admin actions for security
                  </p>
                </div>
                <Switch
                  id="enableAuditLog"
                  checked={localSettings.enableAuditLog}
                  onCheckedChange={(checked) => updateField("enableAuditLog", checked)}
                />
              </div>

              <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-4">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Note:</strong> Admin access control is managed via environment variables (ADMIN_EMAILS).
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
