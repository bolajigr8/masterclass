import mongoose, { Schema, Document, Model } from 'mongoose'

/**
 * Stores all masterclass session configuration in MongoDB.
 * This replaces the hardcoded SESSION_CONFIG in session-config.ts.
 *
 * Admins manage sessions via the dashboard. The enrollment modal,
 * cron jobs, check-in routes, and waitlist system all read from here.
 */
export interface ISessionConfig extends Document {
  /**
   * Unique stable identifier — used in enrollment records, QR codes,
   * waitlist entries, and URLs. Generated on creation, never changed.
   * Pattern: 'sig-lagos-mar-2026' | 'vm-mar-2026' | 'jaas-q1-2026'
   */
  sessionId: string

  /**
   * Which product this session belongs to.
   * Must exactly match pricing.ts PRODUCT_TYPES values.
   */
  productType:
    | 'Virtual Masterclass'
    | 'Signature Live Masterclass'
    | 'Private JaaS Consulting'

  /** Short label shown in dropdowns: "Lagos · Mar 14–15, 2026" */
  label: string

  /**
   * ISO date strings (YYYY-MM-DD).
   * Virtual: 4 weekly dates.
   * Signature: 2 consecutive dates (Day 1, Day 2).
   * Consulting: 1 representative date (actual time is scheduled separately).
   */
  dates: string[]

  /** 24h time string used by the check-in time-window logic: "09:00" */
  time: string

  /** Human-readable time shown to attendees: "9:00 AM WAT" */
  displayTime: string

  /** City name for display and timezone resolution */
  city: string

  /** Physical venue for live sessions */
  venue?: string

  /** True for Signature Live — enables Day 1/Day 2 check-in logic */
  isTwoDay: boolean

  /** Maximum confirmed (paid + booked) enrollments before waitlist kicks in */
  capacity: number

  /**
   * Controls visibility in the enrollment modal dropdown.
   * Archived sessions (isActive: false) are hidden from new enrollees
   * but their historical enrollment data is preserved.
   */
  isActive: boolean

  /** Lower number = shown first in dropdowns */
  sortOrder: number

  createdAt: Date
  updatedAt: Date
}

const SessionConfigSchema = new Schema<ISessionConfig>(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    productType: {
      type: String,
      required: true,
      enum: [
        'Virtual Masterclass',
        'Signature Live Masterclass',
        'Private JaaS Consulting',
      ],
    },
    label: {
      type: String,
      required: true,
      trim: true,
    },
    dates: {
      type: [String],
      required: true,
      validate: {
        validator: (v: string[]) => v.length >= 1,
        message: 'At least one date is required.',
      },
    },
    time: {
      type: String,
      required: true,
      trim: true,
      // Validates HH:MM 24h format
      match: [/^\d{2}:\d{2}$/, 'time must be HH:MM format, e.g. "09:00"'],
    },
    displayTime: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    venue: {
      type: String,
      trim: true,
    },
    isTwoDay: {
      type: Boolean,
      default: false,
    },
    capacity: {
      type: Number,
      required: true,
      min: [1, 'Capacity must be at least 1'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
)

// Fast lookups by product type (used by enrollment modal and cron)
SessionConfigSchema.index({ productType: 1, isActive: 1, sortOrder: 1 })

// Unique sessionId lookup (used everywhere — QR codes, check-in, waitlist)
SessionConfigSchema.index({ sessionId: 1 })

const SessionConfig: Model<ISessionConfig> =
  mongoose.models.SessionConfig ||
  mongoose.model<ISessionConfig>('SessionConfig', SessionConfigSchema)

export default SessionConfig
