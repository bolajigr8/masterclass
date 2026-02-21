import { NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import Enrollment from '@/models/Enrollment'
import { getPrice, getAccessTier, isValidProductType } from '@/lib/pricing'
import {
  sendVirtualAccessConfirmation,
  sendFullAccessConfirmation,
  sendConsultingConfirmation,
} from '@/lib/email'

type PaystackVerifyResponse = {
  status: boolean
  message: string
  data?: {
    status: string
    reference: string
    amount: number
    currency: string
    customer: { email: string }
    paid_at?: string
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const {
      reference,
      enrollmentReference,
      productType,
      sessionId,
      sessionDates,
      sessionTime,
      sessionVenue,
      sessionCity,
      isTwoDay,
    } = body

    // ── Field validation ─────────────────────────────────────────────────────
    if (!reference || typeof reference !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid payment reference.' },
        { status: 400 },
      )
    }

    if (
      !enrollmentReference ||
      !productType ||
      !sessionId ||
      !sessionDates ||
      !sessionTime
    ) {
      return NextResponse.json(
        {
          error: 'Missing enrollment context.',
          details: 'All session and enrollment fields are required.',
        },
        { status: 400 },
      )
    }

    if (!Array.isArray(sessionDates) || sessionDates.length === 0) {
      return NextResponse.json(
        { error: 'sessionDates must be a non-empty array.' },
        { status: 400 },
      )
    }

    if (!isValidProductType(productType)) {
      return NextResponse.json(
        { error: 'Invalid product type.' },
        { status: 400 },
      )
    }

    const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY
    if (!PAYSTACK_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Payment service is not configured.' },
        { status: 500 },
      )
    }

    // ── Verify with Paystack ─────────────────────────────────────────────────
    const paystackResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      },
    )

    const paystackData: PaystackVerifyResponse = await paystackResponse.json()

    if (!paystackResponse.ok || !paystackData.status || !paystackData.data) {
      return NextResponse.json(
        {
          error: 'Payment verification failed.',
          details: paystackData.message,
        },
        { status: paystackResponse.status === 404 ? 404 : 502 },
      )
    }

    const tx = paystackData.data

    // ── Validation 1: Transaction must be successful ─────────────────────────
    if (tx.status !== 'success') {
      return NextResponse.json(
        {
          error: 'Payment not successful.',
          details: `Status is "${tx.status}".`,
        },
        { status: 402 },
      )
    }

    // ── Validation 2: Amount must match backend price ────────────────────────
    const expectedNaira = getPrice(productType)!
    const expectedKobo = expectedNaira * 100

    if (tx.amount !== expectedKobo) {
      console.error(
        `[payment/verify] Amount mismatch for ref ${reference}: ` +
          `expected ${expectedKobo} kobo, got ${tx.amount} kobo`,
      )
      return NextResponse.json(
        { error: 'Payment amount mismatch. Contact support.' },
        { status: 422 },
      )
    }

    await connectToDatabase()

    // ── Validation 3: Enrollment must exist ──────────────────────────────────
    const enrollment = await Enrollment.findOne({ enrollmentReference })
    if (!enrollment) {
      return NextResponse.json(
        { error: 'Enrollment not found.' },
        { status: 404 },
      )
    }

    // ── Validation 4: Idempotency guard ──────────────────────────────────────
    if (enrollment.paymentStatus === 'success') {
      return NextResponse.json(
        {
          success: true,
          alreadyProcessed: true,
          emailSent: true, // email was sent during the original payment
          enrollment: buildEnrollmentResponse(enrollment),
        },
        { status: 200 },
      )
    }

    // ── Validation 5: Payment reference not used on another enrollment ───────
    const existingWithRef = await Enrollment.findOne({
      paymentReference: reference,
      enrollmentReference: { $ne: enrollmentReference },
    }).lean()

    if (existingWithRef) {
      return NextResponse.json(
        { error: 'Payment reference already used on a different enrollment.' },
        { status: 409 },
      )
    }

    // ── Derive access tier from product ──────────────────────────────────────
    const accessTier = getAccessTier(productType)!

    // ── Update the enrollment ─────────────────────────────────────────────────
    enrollment.paymentStatus = 'success'
    enrollment.bookingStatus = 'confirmed'
    enrollment.paymentReference = reference
    enrollment.productType = productType
    enrollment.expectedAmount = expectedNaira
    enrollment.amountPaid = expectedNaira
    enrollment.accessTier = accessTier
    enrollment.selectedSession = {
      sessionId,
      dates: sessionDates,
      time: sessionTime,
      venue: sessionVenue ?? undefined,
      city: sessionCity ?? undefined,
      isTwoDay: Boolean(isTwoDay),
    }

    await enrollment.save()

    // ── Dispatch confirmation email (awaited, fails gracefully) ──────────────
    const emailParams = {
      name: enrollment.name,
      email: enrollment.email,
      enrollmentReference: enrollment.enrollmentReference,
      productType,
      sessionDates,
      sessionTime,
      sessionVenue,
      sessionCity,
      isTwoDay: Boolean(isTwoDay),
    }

    let emailSent = false
    try {
      if (accessTier === 'virtual') {
        await sendVirtualAccessConfirmation(emailParams)
      } else if (accessTier === 'full') {
        await sendFullAccessConfirmation(emailParams)
      } else if (accessTier === 'consulting') {
        await sendConsultingConfirmation(emailParams)
      }
      emailSent = true
    } catch (emailErr) {
      // Email failed — log it but DO NOT throw. Payment is already confirmed.
      console.error('[payment/verify] Confirmation email failed:', emailErr)
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Payment verified and enrollment confirmed.',
        emailSent,
        enrollment: buildEnrollmentResponse(enrollment),
      },
      { status: 200 },
    )
  } catch (error: any) {
    console.error('[payment/verify] Error:', error)

    if (error.code === 11000 && error.keyPattern?.paymentReference) {
      return NextResponse.json(
        { error: 'Payment reference already used.' },
        { status: 409 },
      )
    }

    return NextResponse.json(
      {
        error: 'Payment verification failed. Please try again.',
        details:
          process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 },
    )
  }
}

function buildEnrollmentResponse(enrollment: any) {
  return {
    enrollmentReference: enrollment.enrollmentReference,
    name: enrollment.name,
    email: enrollment.email,
    productType: enrollment.productType,
    selectedSession: enrollment.selectedSession,
    accessTier: enrollment.accessTier,
    bookingStatus: enrollment.bookingStatus,
    amountPaid: enrollment.amountPaid,
  }
}
