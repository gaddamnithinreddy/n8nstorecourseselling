import type { Timestamp } from "firebase/firestore"

export interface User {
  id: string
  name: string
  email: string
  role: "admin" | "user"
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface Template {
  id: string
  title: string
  slug: string
  shortDescription: string
  longDescription: string
  price: number
  originalPrice?: number
  currency: string
  category: string
  tags: string[]
  level: "beginner" | "intermediate" | "advanced"
  thumbnailUrl: string
  previewImages: string[]
  downloadFileUrl: string
  isAvailable: boolean
  stockCount: number | null
  salesCount: number
  metaTitle: string
  metaDescription: string
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface Coupon {
  id: string
  code: string
  discountType: "percentage" | "fixed"
  discountValue: number
  validFrom: Timestamp
  validUntil: Timestamp
  usageLimit: number | null
  usedCount: number
  specificEmail: string | null
  isActive: boolean
  createdAt: Timestamp
  purchases?: {
    userId: string
    userEmail: string
    userName: string
    orderId: string
    amount: number
    discountApplied: number
    purchasedAt: Timestamp
  }[]
}

export interface Order {
  id: string
  userId: string
  userEmail: string
  userName: string
  templates: {
    templateId: string
    templateTitle: string
    priceAtPurchase: number
  }[]
  totalAmount: number
  currency: string
  status: "created" | "paid" | "failed" | "refunded"
  razorpayOrderId: string
  razorpayPaymentId?: string
  razorpaySignature?: string
  downloadTokens: {
    templateId: string
    token: string
    expiresAt: Timestamp
  }[]
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface DownloadToken {
  id: string
  userId: string
  templateId: string
  orderId: string
  token: string
  expiresAt: Timestamp
  usedAt?: Timestamp
}

export interface SiteSettings {
  id: string
  // Site Identity
  siteName: string
  siteDescription: string
  logoUrl: string
  favicon: string

  // Branding
  heroTitle: string
  heroDescription: string
  footerText: string

  // Contact & Social
  supportEmail: string
  socialLinks: {
    twitter: string
    github: string
    linkedin: string
    instagram: string
    youtube: string
  }

  // Email Templates
  emailSubjectTemplate: string
  emailBodyTemplate: string
  emailFromName: string
  emailFromAddress: string

  // Feature Toggles
  maintenanceMode: boolean
  maintenanceMessage: string
  enableUserRegistration: boolean
  enablePayments: boolean
  enableEmailNotifications: boolean

  // SEO
  metaTitle: string
  metaDescription: string
  metaKeywords: string[]
  ogImage: string
  analytics: {
    googleAnalyticsId: string
    metaPixelId: string
  }

  // Currency & Pricing
  defaultCurrency: string
  // currencySymbol removed

  // Security
  enableAuditLog: boolean
  // adminSessionTimeout removed
  // adminWhitelistEmails removed (handled via env)

  // Timestamps
  updatedAt: Timestamp
  updatedBy: string
}

export interface AdminAuditLog {
  id: string
  adminId: string
  adminEmail: string
  action: string
  category: "auth" | "settings" | "template" | "order" | "user" | "coupon" | "security"
  details: Record<string, any>
  ipAddress?: string
  userAgent?: string
  timestamp: Timestamp
}

export interface SecurityEvent {
  id: string
  type: "failed_login" | "unauthorized_access" | "suspicious_activity" | "admin_login" | "admin_logout"
  email?: string
  ipAddress?: string
  details: Record<string, any>
  timestamp: Timestamp
}

export interface ContactMessage {
  id: string
  userId?: string
  name: string
  email: string
  subject: string
  message: string
  status: "unread" | "read" | "replied"
  createdAt: Timestamp
}

