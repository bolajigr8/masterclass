import mongoose, { Schema, Document, Model } from 'mongoose'

/**
 * Status lifecycle:
 *   waiting   → spot opens → notified (24h window starts)
 *   notified  → confirms payment → converted (removed from waitlist, enrolled)
 *   notified  → 24h expires without action → expired (next person notified)
 *   waiting   → user requests removal → removed
 */
export type WaitlistStatus =
  | 'waiting' // in queue, no spot yet
  | 'notified' // spot offered, awaiting confirmation within 24h
  | 'converted' // confirmed and paid — now a full enrollment
  | 'expired' // did not confirm within 24h, spot passed to next
  | 'removed' // voluntarily removed from waitlist

export interface IWaitlist extends Document {
  // Identity
  name: string
  email: string
  phone: string
  city?: string

  // Which product and session they're waiting for
  productType: string
  sessionId: string

  // Queue position — 1-based, lower = closer to front
  position: number

  status: WaitlistStatus

  // Set when we notify them a spot opened
  notifiedAt?: Date

  // The deadline to confirm (notifiedAt + 24 hours)
  confirmationExpiresAt?: Date

  // Set when they successfully convert — links to their enrollment
  convertedEnrollmentReference?: string

  // Token sent in the confirmation email URL — prevents CSRF
  confirmationToken: string

  createdAt: Date
  updatedAt: Date
  convertedAt: Date
}

const WaitlistSchema = new Schema<IWaitlist>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    city: { type: String, trim: true },

    productType: { type: String, required: true },
    sessionId: { type: String, required: true },

    position: { type: Number, required: true },
    status: {
      type: String,
      enum: ['waiting', 'notified', 'converted', 'expired', 'removed'],
      default: 'waiting',
    },
    convertedAt: { type: Date },
    notifiedAt: { type: Date },
    confirmationExpiresAt: { type: Date },
    convertedEnrollmentReference: { type: String },
    confirmationToken: { type: String, required: true, unique: true },
  },
  { timestamps: true },
)

// Unique constraint: one active waitlist entry per email per session
WaitlistSchema.index({ email: 1, sessionId: 1, status: 1 })

// Fast queue lookup — ordered by position
WaitlistSchema.index({ sessionId: 1, status: 1, position: 1 })

const Waitlist: Model<IWaitlist> =
  mongoose.models.Waitlist ||
  mongoose.model<IWaitlist>('Waitlist', WaitlistSchema)

export default Waitlist
