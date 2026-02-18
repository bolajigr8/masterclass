import mongoose, { Schema, Document, Model } from 'mongoose'

export interface ISelectedSession {
  sessionId: string
  date: string
  time: string
}

export interface IEnrollment extends Document {
  name: string
  email: string
  phone: string
  enrollmentReference: string
  paymentStatus: 'pending' | 'success'
  bookingStatus: 'pending' | 'confirmed'
  // Set at payment initialization — scopes the Paystack reference to this enrollment
  paymentReference?: string
  // The product type selected during payment initialization
  productType?: string
  // The backend-determined expected amount (Naira) — used for verification
  expectedAmount?: number
  amountPaid: number
  selectedSession?: ISelectedSession
  accessTier?: 'virtual' | 'full'
  checkedIn: boolean
  checkedInAt?: Date
  createdAt: Date
  updatedAt: Date
}

const SelectedSessionSchema = new Schema<ISelectedSession>(
  {
    sessionId: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
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
    // sparse: true allows multiple docs with no paymentReference,
    // but enforces uniqueness when a value IS present
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
      enum: ['virtual', 'full'],
    },
    checkedIn: {
      type: Boolean,
      default: false,
    },
    checkedInAt: {
      type: Date,
    },
  },
  { timestamps: true },
)

const Enrollment: Model<IEnrollment> =
  mongoose.models.Enrollment ||
  mongoose.model<IEnrollment>('Enrollment', EnrollmentSchema)

export default Enrollment
