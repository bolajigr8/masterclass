import { NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import Enrollment from '@/models/Enrollment'
import { getPrice, isValidProductType } from '@/lib/pricing'
import {
  sendVirtualAccessConfirmation,
  sendFullAccessConfirmation,
} from '@/lib/email'

type PaystackVerifyResponse = {
  status: boolean
  message: string
  data?: {
    status: string
    reference: string
    amount: number // kobo
    currency: string
    customer: {
      email: string
      first_name?: string
      last_name?: string
    }
    paid_at?: string
    channel?: string
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const {
      reference,
      // Enrollment context — sent by frontend after popup callback
      enrollmentReference,
      productType,
      sessionId,
      sessionDate,
      sessionTime,
      accessTier,
    } = body

    // ── Field validation ──────────────────────────────────────────────────
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
      !sessionDate ||
      !sessionTime ||
      !accessTier
    ) {
      return NextResponse.json(
        {
          error: 'Missing enrollment context.',
          details:
            'enrollmentReference, productType, sessionId, sessionDate, sessionTime, and accessTier are all required.',
        },
        { status: 400 },
      )
    }

    if (!isValidProductType(productType)) {
      return NextResponse.json(
        { error: 'Invalid product type.' },
        { status: 400 },
      )
    }

    if (!['virtual', 'full'].includes(accessTier)) {
      return NextResponse.json(
        { error: 'Invalid access tier.' },
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

    // ── Verify with Paystack ──────────────────────────────────────────────
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
        {
          status: paystackResponse.status === 404 ? 404 : 502,
        },
      )
    }

    const tx = paystackData.data

    // ── VALIDATION 1: Transaction must be successful ──────────────────────
    if (tx.status !== 'success') {
      return NextResponse.json(
        {
          error: 'Payment not successful.',
          details: `Transaction status is "${tx.status}".`,
        },
        { status: 402 },
      )
    }

    // ── VALIDATION 2: Amount must match backend-expected price ────────────
    // Backend determines the price from productType — frontend display amount
    // is never trusted for the actual charge validation.
    const expectedNaira = getPrice(productType)!
    const expectedKobo = expectedNaira * 100

    if (tx.amount !== expectedKobo) {
      console.error(
        `[payment/verify] Amount mismatch for ref ${reference}: ` +
          `expected ${expectedKobo} kobo, got ${tx.amount} kobo`,
      )
      return NextResponse.json(
        {
          error: 'Payment amount mismatch.',
          details:
            'The amount paid does not match the expected price. Contact support.',
        },
        { status: 422 },
      )
    }

    await connectToDatabase()

    // ── VALIDATION 3: Enrollment must exist ───────────────────────────────
    const enrollment = await Enrollment.findOne({ enrollmentReference })

    if (!enrollment) {
      return NextResponse.json(
        {
          error: 'Enrollment not found.',
          details: 'No enrollment matched the provided reference.',
        },
        { status: 404 },
      )
    }

    // ── VALIDATION 4: Not already paid (idempotency guard) ─────────────────
    if (enrollment.paymentStatus === 'success') {
      // Already processed — idempotent success response
      return NextResponse.json(
        {
          success: true,
          message: 'This enrollment has already been confirmed.',
          alreadyProcessed: true,
          enrollment: {
            enrollmentReference: enrollment.enrollmentReference,
            name: enrollment.name,
            email: enrollment.email,
            productType: enrollment.productType,
            selectedSession: enrollment.selectedSession,
            accessTier: enrollment.accessTier,
            bookingStatus: enrollment.bookingStatus,
            amountPaid: enrollment.amountPaid,
          },
        },
        { status: 200 },
      )
    }

    // ── VALIDATION 5: Payment reference not used on another enrollment ─────
    // Sparse unique index handles DB-level enforcement, but check early for
    // a clean error message.
    const existingWithRef = await Enrollment.findOne({
      paymentReference: reference,
      enrollmentReference: { $ne: enrollmentReference },
    }).lean()

    if (existingWithRef) {
      return NextResponse.json(
        {
          error: 'Payment reference already used.',
          details:
            'This payment reference has already been applied to a different enrollment.',
        },
        { status: 409 },
      )
    }

    // ── All validations passed — update the enrollment ────────────────────
    enrollment.paymentStatus = 'success'
    enrollment.bookingStatus = 'confirmed'
    enrollment.paymentReference = reference
    enrollment.productType = productType
    enrollment.expectedAmount = expectedNaira
    enrollment.amountPaid = expectedNaira
    enrollment.selectedSession = {
      sessionId,
      date: sessionDate,
      time: sessionTime,
    }
    enrollment.accessTier = accessTier

    await enrollment.save()

    // ── Dispatch confirmation email ───────────────────────────────────────
    const emailParams = {
      name: enrollment.name,
      email: enrollment.email,
      enrollmentReference: enrollment.enrollmentReference,
      productType,
      sessionDate,
      sessionTime,
    }

    if (accessTier === 'virtual') {
      sendVirtualAccessConfirmation(emailParams).catch((err) =>
        console.error('[payment/verify] Failed to send virtual email:', err),
      )
    } else {
      sendFullAccessConfirmation(emailParams).catch((err) =>
        console.error(
          '[payment/verify] Failed to send full-access email:',
          err,
        ),
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Payment verified and enrollment confirmed.',
        enrollment: {
          enrollmentReference: enrollment.enrollmentReference,
          name: enrollment.name,
          email: enrollment.email,
          productType: enrollment.productType,
          selectedSession: enrollment.selectedSession,
          accessTier: enrollment.accessTier,
          bookingStatus: enrollment.bookingStatus,
          amountPaid: enrollment.amountPaid,
        },
      },
      { status: 200 },
    )
  } catch (error: any) {
    console.error('[payment/verify] Error:', error)

    // MongoDB duplicate key on paymentReference
    if (error.code === 11000 && error.keyPattern?.paymentReference) {
      return NextResponse.json(
        {
          error: 'Payment reference already used.',
          details: 'This payment has already been applied to an enrollment.',
        },
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
