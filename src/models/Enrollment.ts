import mongoose, { Schema, Document, Model } from 'mongoose'

export interface ISelectedSession {
  sessionId: string
  dates: string[] // Array supports single-day and two-day (Signature) sessions
  time: string
  venue?: string // Physical venue for live sessions
  city?: string // City where the session takes place
  isTwoDay?: boolean
}

export interface IEnrollment extends Document {
  name: string
  email: string
  phone: string
  city?: string // City of interest, captured at registration
  enrollmentReference: string
  paymentStatus: 'pending' | 'success'
  bookingStatus: 'pending' | 'confirmed'
  paymentReference?: string
  productType?: string
  expectedAmount?: number
  amountPaid: number
  selectedSession?: ISelectedSession
  // Derived from productType — virtual | full | consulting
  accessTier?: 'virtual' | 'full' | 'consulting'
  // Live check-in tracking — Signature has two check-in events
  checkedInDay1: boolean
  checkedInDay1At?: Date
  checkedInDay2: boolean
  checkedInDay2At?: Date
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
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    enrollmentReference: {
      type: String,
      required: true,
      unique: true,
    },
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
    paymentReference: {
      type: String,
      unique: true,
      sparse: true,
    },
    productType: {
      type: String,
    },
    expectedAmount: {
      type: Number,
    },
    amountPaid: {
      type: Number,
      default: 0,
    },
    selectedSession: {
      type: SelectedSessionSchema,
    },
    accessTier: {
      type: String,
      enum: ['virtual', 'full', 'consulting'],
    },
    // Signature Live requires check-in on both days
    checkedInDay1: {
      type: Boolean,
      default: false,
    },
    checkedInDay1At: {
      type: Date,
    },
    checkedInDay2: {
      type: Boolean,
      default: false,
    },
    checkedInDay2At: {
      type: Date,
    },
  },
  { timestamps: true },
)

const Enrollment: Model<IEnrollment> =
  mongoose.models.Enrollment ||
  mongoose.model<IEnrollment>('Enrollment', EnrollmentSchema)

export default Enrollment
