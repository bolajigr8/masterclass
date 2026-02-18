import { z } from 'zod'

// ─── Step 1: User Info ───────────────────────────────────────────────────────

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
})

export type UserInfoFormData = z.infer<typeof userInfoSchema>

// ─── Step 2: Session Selection ───────────────────────────────────────────────

export const sessionSelectionSchema = z.object({
  date: z.string().min(1, 'Please select a date'),
  time: z.string().min(1, 'Please select a time'),
})

export type SessionSelectionFormData = z.infer<typeof sessionSelectionSchema>

// ─── Step 3: Payment / Access Tier ──────────────────────────────────────────

// These are the exact product type strings the backend accepts.
// They are display names only — the backend determines the price.
export const PRODUCT_TYPES = [
  'Single Masterclass',
  'Fireside Chat Series',
  'Developer Bootcamp',
  '1-on-1 JaaS Consulting',
] as const

export type ProductType = (typeof PRODUCT_TYPES)[number]

// Display prices shown to users in the UI (must match backend pricing map)
// The frontend NEVER sends these values — they're for display only.
export const DISPLAY_PRICES: Record<ProductType, number> = {
  'Single Masterclass': 250_000,
  'Fireside Chat Series': 95_000,
  'Developer Bootcamp': 450_000,
  '1-on-1 JaaS Consulting': 180_000,
}

export const paymentSchema = z.object({
  productType: z
    .enum(PRODUCT_TYPES)
    .catch(() => PRODUCT_TYPES[0])
    .pipe(
      z.enum(PRODUCT_TYPES, {
        message: 'Please select a product type',
      }),
    ),
  accessTier: z.enum(['virtual', 'full'], {
    message: 'Please select an access tier',
  }),
})

export type PaymentFormData = z.infer<typeof paymentSchema>

// ─── Full Enrollment State (across all steps) ────────────────────────────────

export interface CompleteEnrollmentData {
  userInfo: UserInfoFormData
  session: SessionSelectionFormData
  payment: PaymentFormData
  // Set by backend after registration
  enrollmentReference?: string
}

// ─── Success data returned after payment verification ───────────────────────

export interface EnrollmentSuccessData {
  enrollmentReference: string
  name: string
  email: string
  productType: ProductType
  selectedSession: { sessionId: string; date: string; time: string }
  accessTier: 'virtual' | 'full'
  bookingStatus: string
  amountPaid: number
}
