import { z } from 'zod'

// Step 1: User Information validation
export const userInfoSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Name must contain only letters and spaces'),
  email: z
    .string()
    .email('Invalid email address')
    .min(5, 'Email must be at least 5 characters')
    .max(100, 'Email must not exceed 100 characters'),
  phone: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(15, 'Phone number must not exceed 15 digits')
    .regex(/^[0-9+\s()-]+$/, 'Invalid phone number format'),
})

// Step 2: Session selection validation
export const sessionSelectionSchema = z.object({
  date: z
    .string()
    .min(1, 'Date is required')
    .refine(
      (date) => {
        const selectedDate = new Date(date)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        return selectedDate >= today
      },
      { message: 'Date cannot be in the past' },
    ),
  time: z
    .string()
    .min(1, 'Time is required')
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
})

// Step 3: Payment validation
export const paymentSchema = z.object({
  accessTier: z.enum(['virtual', 'full'], {
    message: 'Please select an access tier',
  }),
  amount: z
    .number()
    .positive('Amount must be positive')
    .refine((amount) => amount === 20000 || amount === 50000, {
      message: 'Invalid amount for selected tier',
    }),
})

// Combined form data type
export type UserInfoFormData = z.infer<typeof userInfoSchema>
export type SessionSelectionFormData = z.infer<typeof sessionSelectionSchema>
export type PaymentFormData = z.infer<typeof paymentSchema>

export interface CompleteEnrollmentData {
  userInfo: UserInfoFormData
  session: SessionSelectionFormData
  payment: PaymentFormData
  enrollmentReference?: string
}
