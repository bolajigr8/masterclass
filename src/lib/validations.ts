import { z } from 'zod'

// ─── User Info ────────────────────────────────────────────────────────────────

export const userInfoSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name is too long')
    .trim(),
  email: z
    .string()
    .email('Please enter a valid email address')
    .toLowerCase()
    .trim(),
  phone: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(20, 'Phone number is too long')
    .regex(/^[+\d\s\-()]+$/, 'Please enter a valid phone number'),
  city: z.string().max(100).trim().optional(),
})

export type UserInfoFormData = z.infer<typeof userInfoSchema>

// ─── Session Selection ────────────────────────────────────────────────────────
// Users now pick a predefined session by ID — no free date/time input.

export const sessionSelectionSchema = z.object({
  sessionId: z.string().min(1, 'Please select a session'),
})

export type SessionSelectionFormData = z.infer<typeof sessionSelectionSchema>

// ─── Product Types ────────────────────────────────────────────────────────────
// These must exactly match lib/pricing.ts PRODUCT_TYPES and the frontend plan names.

export const PRODUCT_TYPES = [
  'Virtual Masterclass',
  'Signature Live Masterclass',
  'Private JaaS Consulting',
] as const

export type ProductType = (typeof PRODUCT_TYPES)[number]

/**
 * Display prices shown in the UI (NGN).
 * Must stay in sync with backend lib/pricing.ts PRICING_MAP.
 * These are NEVER sent to the backend — they exist only for frontend display.
 */
export const DISPLAY_PRICES: Record<ProductType, number> = {
  'Virtual Masterclass': 150_000,
  'Signature Live Masterclass': 450_000,
  'Private JaaS Consulting': 350_000,
}

/**
 * USD display prices — for reference only, payment is in NGN.
 */
export const DISPLAY_PRICES_USD: Record<ProductType, string> = {
  'Virtual Masterclass': '$260',
  'Signature Live Masterclass': '$650',
  'Private JaaS Consulting': '$500+',
}

/**
 * Access tier is derived from the product — no separate user selection.
 */
export const PRODUCT_ACCESS_TIER: Record<
  ProductType,
  'virtual' | 'full' | 'consulting'
> = {
  'Virtual Masterclass': 'virtual',
  'Signature Live Masterclass': 'full',
  'Private JaaS Consulting': 'consulting',
}

// ─── Enrollment State ─────────────────────────────────────────────────────────

export interface CompleteEnrollmentData {
  userInfo: UserInfoFormData
  selectedSessionId: string
  productType: ProductType
  // Set by backend after registration
  enrollmentReference?: string
}

// ─── Success Data ─────────────────────────────────────────────────────────────

export interface EnrollmentSuccessData {
  enrollmentReference: string
  name: string
  email: string
  productType: ProductType
  selectedSession: {
    sessionId: string
    dates: string[]
    time: string
    venue?: string
    city?: string
    isTwoDay?: boolean
  }
  accessTier: 'virtual' | 'full' | 'consulting'
  bookingStatus: string
  amountPaid: number
}
