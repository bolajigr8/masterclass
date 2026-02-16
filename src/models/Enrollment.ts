import mongoose, { Schema, Document } from 'mongoose'

export interface IEnrollment extends Document {
  name: string
  email: string
  phone: string
  selectedSession?: {
    date?: string
    time?: string
  }
  amountPaid?: number
  paymentReference?: string
  paymentStatus: 'pending' | 'success' | 'failed'
  bookingStatus: 'pending' | 'confirmed' | 'cancelled'
  accessTier?: 'virtual' | 'full'
  enrollmentReference: string
  createdAt: Date
  updatedAt: Date
}

const EnrollmentSchema = new Schema<IEnrollment>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    selectedSession: {
      type: {
        date: {
          type: String,
          required: false,
        },
        time: {
          type: String,
          required: false,
        },
      },
      required: false,
    },
    amountPaid: {
      type: Number,
      required: false,
      default: 0,
    },
    paymentReference: {
      type: String,
      unique: true,
      sparse: true,
      required: false,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'success', 'failed'],
      default: 'pending',
    },
    bookingStatus: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled'],
      default: 'pending',
    },
    accessTier: {
      type: String,
      enum: ['virtual', 'full'],
      required: false,
    },
    enrollmentReference: {
      type: String,
      unique: true,
      required: true,
    },
  },
  {
    timestamps: true,
  },
)

export default mongoose.model<IEnrollment>('Enrollment', EnrollmentSchema)
