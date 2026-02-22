// import mongoose, { Schema, Document, Model } from 'mongoose'

// export interface ISelectedSession {
//   sessionId: string
//   dates: string[] // Array — single-day or two for Signature
//   time: string
//   venue?: string
//   city?: string
//   isTwoDay?: boolean
// }

// export interface IEnrollment extends Document {
//   name: string
//   email: string
//   phone: string
//   city?: string
//   enrollmentReference: string
//   paymentStatus: 'pending' | 'success'
//   bookingStatus: 'pending' | 'confirmed'
//   paymentReference?: string
//   productType?: string
//   expectedAmount?: number
//   amountPaid: number
//   selectedSession?: ISelectedSession
//   accessTier?: 'virtual' | 'full' | 'consulting'

//   // Live check-in tracking — Signature has two check-in events
//   checkedInDay1: boolean
//   checkedInDay1At?: Date
//   checkedInDay2: boolean
//   checkedInDay2At?: Date

//   // ── Automated email reminder tracking ─────────────────────────────────────
//   // Virtual only — reminder sent before each Zoom session date
//   reminder24hSentAt?: Date // timestamp of last 24h reminder batch
//   reminder1hSentAt?: Date // timestamp of last 1h reminder batch

//   // ── Waitlist / capacity ────────────────────────────────────────────────────
//   cancelledAt?: Date // set if the enrollment is cancelled, freeing a spot

//   createdAt: Date
//   updatedAt: Date
// }

// const SelectedSessionSchema = new Schema<ISelectedSession>(
//   {
//     sessionId: { type: String, required: true },
//     dates: { type: [String], required: true },
//     time: { type: String, required: true },
//     venue: { type: String },
//     city: { type: String },
//     isTwoDay: { type: Boolean, default: false },
//   },
//   { _id: false },
// )

// const EnrollmentSchema = new Schema<IEnrollment>(
//   {
//     name: { type: String, required: true, trim: true },
//     email: {
//       type: String,
//       required: true,
//       unique: true,
//       lowercase: true,
//       trim: true,
//     },
//     phone: { type: String, required: true, trim: true },
//     city: { type: String, trim: true },

//     enrollmentReference: { type: String, required: true, unique: true },

//     paymentStatus: {
//       type: String,
//       enum: ['pending', 'success'],
//       default: 'pending',
//     },
//     bookingStatus: {
//       type: String,
//       enum: ['pending', 'confirmed'],
//       default: 'pending',
//     },

//     paymentReference: { type: String, unique: true, sparse: true },
//     productType: { type: String },
//     expectedAmount: { type: Number },
//     amountPaid: { type: Number, default: 0 },
//     selectedSession: { type: SelectedSessionSchema },

//     accessTier: {
//       type: String,
//       enum: ['virtual', 'full', 'consulting'],
//     },

//     // Check-in — Signature requires two separate events
//     checkedInDay1: { type: Boolean, default: false },
//     checkedInDay1At: { type: Date },
//     checkedInDay2: { type: Boolean, default: false },
//     checkedInDay2At: { type: Date },

//     // Reminder tracking — prevents duplicate sends
//     reminder24hSentAt: { type: Date },
//     reminder1hSentAt: { type: Date },

//     // Cancellation — freeing the spot triggers waitlist notification
//     cancelledAt: { type: Date },
//   },
//   { timestamps: true },
// )

// // Index for the cron job — quickly find confirmed virtual enrollments
// // whose next session date falls within the reminder window
// EnrollmentSchema.index({
//   paymentStatus: 1,
//   bookingStatus: 1,
//   accessTier: 1,
//   'selectedSession.sessionId': 1,
// })

// const Enrollment: Model<IEnrollment> =
//   mongoose.models.Enrollment ||
//   mongoose.model<IEnrollment>('Enrollment', EnrollmentSchema)

// export default Enrollment

import mongoose, { Schema, Document, Model } from 'mongoose'

// ─── Nested types ─────────────────────────────────────────────────────────────

export interface ISelectedSession {
  sessionId: string
  dates: string[] // single-day or two for Signature Live
  time: string
  venue?: string
  city?: string
  isTwoDay?: boolean
}

// ─── Main interface ───────────────────────────────────────────────────────────

export interface IEnrollment extends Document {
  // ── Core identity ────────────────────────────────────────────────────────
  name: string
  email: string
  phone: string
  city?: string
  enrollmentReference: string

  // ── Payment ──────────────────────────────────────────────────────────────
  paymentStatus: 'pending' | 'success'
  bookingStatus: 'pending' | 'confirmed'
  paymentReference?: string
  productType?: string
  expectedAmount?: number
  amountPaid: number
  selectedSession?: ISelectedSession
  accessTier?: 'virtual' | 'full' | 'consulting'

  // ── Live check-in tracking (Signature Live — two check-in events) ────────
  checkedInDay1: boolean
  checkedInDay1At?: Date
  checkedInDay2: boolean
  checkedInDay2At?: Date

  // ── Automated email reminder tracking (Virtual only) ─────────────────────
  // Prevents duplicate sends across cron runs
  reminder24hSentAt?: Date
  reminder1hSentAt?: Date

  // ── Reservation (manual Paystack link flow) ───────────────────────────────
  /**
   * 'paystack'         — standard modal flow (register → Paystack popup → verify)
   * 'manual_paystack'  — reserve form → email link → Paystack popup → verify
   * undefined          — legacy / unknown
   */
  reservationType?: 'paystack' | 'manual_paystack'

  /**
   * Secure token embedded in the reservation payment link email.
   * Validated by POST /api/reserve/confirm before opening the payment modal.
   * Cleared (set to undefined) after payment is completed.
   */
  reservationToken?: string

  /**
   * When the 24-hour (or configured) reservation window closes.
   * Queried frequently by /api/cron/expire-reservations.
   */
  reservationExpiresAt?: Date

  /**
   * Tracks the lifecycle of a manual reservation's payment window.
   * 'pending'  — reserved, payment not yet made
   * 'reminded' — reminder email has been sent
   * 'expired'  — window elapsed with no payment; seat released
   * 'paid'     — payment completed; mirrors paymentStatus === 'success'
   */
  paymentWindowStatus?: 'pending' | 'reminded' | 'expired' | 'paid'

  /**
   * Stamped when the reservation reminder email fires.
   * Prevents the cron from double-sending.
   */
  reminderSentAt?: Date

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  // Freeing a spot via cancellation triggers waitlist notification
  cancelledAt?: Date

  createdAt: Date
  updatedAt: Date
}

// ─── Schema ───────────────────────────────────────────────────────────────────

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
    // ── Core identity ──────────────────────────────────────────────────────
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

    // ── Payment ────────────────────────────────────────────────────────────
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

    // ── Check-in ───────────────────────────────────────────────────────────
    checkedInDay1: { type: Boolean, default: false },
    checkedInDay1At: { type: Date },
    checkedInDay2: { type: Boolean, default: false },
    checkedInDay2At: { type: Date },

    // ── Reminder tracking ──────────────────────────────────────────────────
    reminder24hSentAt: { type: Date },
    reminder1hSentAt: { type: Date },

    // ── Reservation (new fields) ───────────────────────────────────────────
    reservationType: {
      type: String,
      enum: ['paystack', 'manual_paystack'],
    },
    reservationToken: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    reservationExpiresAt: {
      type: Date,
      index: true, // cron queries this frequently
    },
    paymentWindowStatus: {
      type: String,
      enum: ['pending', 'reminded', 'expired', 'paid'],
      index: true,
    },
    reminderSentAt: { type: Date },

    // ── Lifecycle ──────────────────────────────────────────────────────────
    cancelledAt: { type: Date },
  },
  { timestamps: true },
)

// ─── Indexes ──────────────────────────────────────────────────────────────────

// Original — cron: find confirmed virtual enrollments within reminder window
EnrollmentSchema.index({
  paymentStatus: 1,
  bookingStatus: 1,
  accessTier: 1,
  'selectedSession.sessionId': 1,
})

// /api/sessions — count confirmed enrollments per session
EnrollmentSchema.index({
  'selectedSession.sessionId': 1,
  paymentStatus: 1,
  bookingStatus: 1,
})

// /api/sessions + /api/reserve — count actively held reservation seats
EnrollmentSchema.index({
  'selectedSession.sessionId': 1,
  reservationType: 1,
  paymentWindowStatus: 1,
})

// cron — find pending/reminded reservations nearing or past expiry
EnrollmentSchema.index({
  reservationType: 1,
  paymentWindowStatus: 1,
  reservationExpiresAt: 1,
})

// ─── Model (prevents Next.js hot-reload from recompiling) ────────────────────

const Enrollment: Model<IEnrollment> =
  mongoose.models.Enrollment ||
  mongoose.model<IEnrollment>('Enrollment', EnrollmentSchema)

export default Enrollment
