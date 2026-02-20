import mongoose, { Schema, Document, Model } from 'mongoose'

export interface ISelectedSession {
  sessionId: string
  dates: string[] // Array — single-day or two for Signature
  time: string
  venue?: string
  city?: string
  isTwoDay?: boolean
}

export interface IEnrollment extends Document {
  name: string
  email: string
  phone: string
  city?: string
  enrollmentReference: string
  paymentStatus: 'pending' | 'success'
  bookingStatus: 'pending' | 'confirmed'
  paymentReference?: string
  productType?: string
  expectedAmount?: number
  amountPaid: number
  selectedSession?: ISelectedSession
  accessTier?: 'virtual' | 'full' | 'consulting'

  // Live check-in tracking — Signature has two check-in events
  checkedInDay1: boolean
  checkedInDay1At?: Date
  checkedInDay2: boolean
  checkedInDay2At?: Date

  // ── Automated email reminder tracking ─────────────────────────────────────
  // Virtual only — reminder sent before each Zoom session date
  reminder24hSentAt?: Date // timestamp of last 24h reminder batch
  reminder1hSentAt?: Date // timestamp of last 1h reminder batch

  // ── Waitlist / capacity ────────────────────────────────────────────────────
  cancelledAt?: Date // set if the enrollment is cancelled, freeing a spot

  createdAt: Date
  updatedAt: Date
}

const SelectedSessionSchema = new Schema<ISelectedSession>(
  {
    sessionId: { type: String, required: true },
    dates: { type: [String], required: true },
    time: { type: String, required: true },
    venue: { type: String },
    city: { type: String },
    isTwoDay: { type: Boolean, default: false },
  },
  { _id: false },
)

const EnrollmentSchema = new Schema<IEnrollment>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: { type: String, required: true, trim: true },
    city: { type: String, trim: true },

    enrollmentReference: { type: String, required: true, unique: true },

    paymentStatus: {
      type: String,
      enum: ['pending', 'success'],
      default: 'pending',
    },
    bookingStatus: {
      type: String,
      enum: ['pending', 'confirmed'],
      default: 'pending',
    },

    paymentReference: { type: String, unique: true, sparse: true },
    productType: { type: String },
    expectedAmount: { type: Number },
    amountPaid: { type: Number, default: 0 },
    selectedSession: { type: SelectedSessionSchema },

    accessTier: {
      type: String,
      enum: ['virtual', 'full', 'consulting'],
    },

    // Check-in — Signature requires two separate events
    checkedInDay1: { type: Boolean, default: false },
    checkedInDay1At: { type: Date },
    checkedInDay2: { type: Boolean, default: false },
    checkedInDay2At: { type: Date },

    // Reminder tracking — prevents duplicate sends
    reminder24hSentAt: { type: Date },
    reminder1hSentAt: { type: Date },

    // Cancellation — freeing the spot triggers waitlist notification
    cancelledAt: { type: Date },
  },
  { timestamps: true },
)

// Index for the cron job — quickly find confirmed virtual enrollments
// whose next session date falls within the reminder window
EnrollmentSchema.index({
  paymentStatus: 1,
  bookingStatus: 1,
  accessTier: 1,
  'selectedSession.sessionId': 1,
})

const Enrollment: Model<IEnrollment> =
  mongoose.models.Enrollment ||
  mongoose.model<IEnrollment>('Enrollment', EnrollmentSchema)

export default Enrollment
