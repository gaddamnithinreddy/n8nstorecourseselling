import { z } from "zod"

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MAX_STRING_LENGTH = 500

/**
 * List of allowed email domains (popular providers only)
 * Temporary/disposable email services are not allowed
 */
const ALLOWED_EMAIL_DOMAINS = [
  // Google
  'gmail.com',
  'googlemail.com',

  // Microsoft
  'outlook.com',
  'hotmail.com',
  'live.com',
  'msn.com',

  // Yahoo
  'yahoo.com',
  'ymail.com',
  'yahoo.co.uk',
  'yahoo.co.in',

  // Apple
  'icloud.com',
  'me.com',
  'mac.com',

  // Other popular providers
  'protonmail.com',
  'proton.me',
  'aol.com',
  'zoho.com',
  'mail.com',
  'gmx.com',
  'yandex.com',

  // Educational (common)
  'edu',
]

/**
 * Sanitize string input by removing dangerous characters
 */
export function sanitize(input: string, maxLength = MAX_STRING_LENGTH): string {
  if (typeof input !== "string") return ""
  return input
    .replace(/[<>'"&]/g, "")
    .trim()
    .slice(0, maxLength)
}

/**
 * Check if email domain is allowed (popular providers only)
 */
export function isEmailDomainAllowed(email: string): boolean {
  if (!email || typeof email !== 'string') return false

  const emailLower = email.toLowerCase().trim()
  if (!EMAIL_REGEX.test(emailLower)) return false

  const domain = emailLower.split('@')[1]
  if (!domain) return false

  // Check exact match
  if (ALLOWED_EMAIL_DOMAINS.includes(domain)) return true

  // Check if ends with .edu (educational domains)
  if (domain.endsWith('.edu')) return true

  return false
}

/**
 * Validate email and return user-friendly error message
 */
export function validateEmail(email: string): ValidationResult<string> {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'Email address is required' }
  }

  const emailLower = email.toLowerCase().trim()

  if (!EMAIL_REGEX.test(emailLower)) {
    return { valid: false, error: 'Please enter a valid email address' }
  }

  if (!isEmailDomainAllowed(emailLower)) {
    return {
      valid: false,
      error: 'Please use a valid email from a trusted provider (Gmail, Outlook, Yahoo, iCloud, etc.). Temporary email addresses are not allowed.'
    }
  }

  return { valid: true, error: '', data: emailLower }
}

/**
 * Validation result type
 */
interface ValidationResult<T = unknown> {
  valid: boolean
  error: string
  data?: T
}

// Zod Schemas
const createOrderSchema = z.object({
  templateId: z.string().min(1, "Template ID is required").transform(val => sanitize(val)),
  userId: z.string().optional().transform(val => val ? sanitize(val) : ""), // Access token verification handles this usually, but body might carry it
  userEmail: z.string().email("Valid email address is required").transform(val => sanitize(val)),
  userName: z.string().optional().default("Customer").transform(val => sanitize(val)),
  couponCode: z.string().optional().transform(val => val ? sanitize(val).toUpperCase() : undefined),
})

const verifyPaymentSchema = z.object({
  orderId: z.string().min(1, "Order ID is required").transform(val => sanitize(val)),
  razorpay_payment_id: z.string().min(1, "Payment ID is required").transform(val => sanitize(val)),
  razorpay_order_id: z.string().min(1, "Razorpay Order ID is required").transform(val => sanitize(val)),
  razorpay_signature: z.string().min(1, "Signature is required").transform(val => sanitize(val)),
})

/**
 * Validate create order input
 */
export function validateCreateOrderInput(data: Record<string, unknown>): ValidationResult {
  const result = createOrderSchema.safeParse(data)
  if (!result.success) {
    const errorMsg = result.error.errors[0].message
    return { valid: false, error: errorMsg }
  }
  return { valid: true, error: "", data: result.data }
}

/**
 * Validate verify payment input
 */
export function validateVerifyPaymentInput(data: Record<string, unknown>): ValidationResult {
  const result = verifyPaymentSchema.safeParse(data)
  if (!result.success) {
    const errorMsg = result.error.errors[0].message
    return { valid: false, error: errorMsg }
  }
  return { valid: true, error: "", data: result.data }
}

/**
 * Validate template input for create/update
 */
export function validateTemplateInput(data: Record<string, unknown>, isUpdate = false): ValidationResult {
  if (!data || typeof data !== "object") {
    return { valid: false, error: "Invalid request body" }
  }

  // Required fields for creation
  if (!isUpdate) {
    if (!data.title || typeof data.title !== "string" || data.title.trim().length < 3) {
      return { valid: false, error: "Title must be at least 3 characters" }
    }

    if (!data.shortDescription || typeof data.shortDescription !== "string") {
      return { valid: false, error: "Short description is required" }
    }

    if (typeof data.price !== "number" || data.price < 0) {
      return { valid: false, error: "Valid price is required" }
    }

    if (!data.category || typeof data.category !== "string") {
      return { valid: false, error: "Category is required" }
    }

    if (!data.downloadFileUrl || typeof data.downloadFileUrl !== "string") {
      return { valid: false, error: "Download file URL is required" }
    }
  }

  return { valid: true, error: "", data }
}
