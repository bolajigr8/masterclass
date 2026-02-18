import { NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import Enrollment from '@/models/Enrollment'
import { isValidProductType, getPriceInKobo, getPrice } from '@/lib/pricing'

type PaystackInitResponse = {
  status: boolean
  message: string
  data?: {
    authorization_url: string
    access_code: string
    reference: string
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      enrollmentReference,
      productType,
      sessionId,
      sessionDate,
      sessionTime,
      accessTier,
    } = body

    // ── Field validation ────────────────────────────────────────────────────
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
          error: 'Missing required fields',
          details:
            'enrollmentReference, productType, sessionId, sessionDate, sessionTime, and accessTier are all required.',
        },
        { status: 400 },
      )
    }

    if (!isValidProductType(productType)) {
      return NextResponse.json(
        {
          error: 'Invalid product type.',
          details: `Valid options: Single Masterclass, Fireside Chat Series, Developer Bootcamp, 1-on-1 JaaS Consulting`,
        },
        { status: 400 },
      )
    }

    if (!['virtual', 'full'].includes(accessTier)) {
      return NextResponse.json(
        {
          error: 'Invalid access tier.',
          details: 'accessTier must be "virtual" or "full".',
        },
        { status: 400 },
      )
    }

    const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY
    if (!PAYSTACK_SECRET_KEY) {
      console.error('[payment/initialize] PAYSTACK_SECRET_KEY is not set.')
      return NextResponse.json(
        { error: 'Payment service is not configured.' },
        { status: 500 },
      )
    }

    await connectToDatabase()

    // ── Fetch enrollment ────────────────────────────────────────────────────
    const enrollment = await Enrollment.findOne({ enrollmentReference })

    if (!enrollment) {
      return NextResponse.json(
        {
          error: 'Enrollment not found.',
          details: 'No enrollment exists with the provided reference.',
        },
        { status: 404 },
      )
    }

    // ── Payment already completed guard ─────────────────────────────────────
    // Prevents re-initializing a transaction against an already-paid enrollment.
    if (enrollment.paymentStatus === 'success') {
      return NextResponse.json(
        {
          error: 'Payment already completed.',
          details:
            'This enrollment has already been paid for. No further payment is required.',
        },
        { status: 409 },
      )
    }

    // ── Backend price lookup ────────────────────────────────────────────────
    // The frontend NEVER sends a price. We determine it entirely here.
    const amountKobo = getPriceInKobo(productType)!
    const amountNaira = getPrice(productType)!

    // ── Initialize Paystack transaction ────────────────────────────────────
    const paystackResponse = await fetch(
      'https://api.paystack.co/transaction/initialize',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: enrollment.email,
          amount: amountKobo,
          currency: 'NGN',
          metadata: {
            enrollmentReference,
            productType,
            sessionId,
            sessionDate,
            sessionTime,
            accessTier,
            custom_fields: [
              {
                display_name: 'Enrollment Reference',
                variable_name: 'enrollment_reference',
                value: enrollmentReference,
              },
              {
                display_name: 'Product',
                variable_name: 'product_type',
                value: productType,
              },
            ],
          },
        }),
        cache: 'no-store',
      },
    )

    const paystackData: PaystackInitResponse = await paystackResponse.json()

    if (!paystackResponse.ok || !paystackData.status || !paystackData.data) {
      console.error('[payment/initialize] Paystack error:', paystackData)
      return NextResponse.json(
        {
          error: 'Failed to initialize payment.',
          details: paystackData.message,
        },
        { status: 502 },
      )
    }

    const { authorization_url, reference } = paystackData.data

    // ── CRITICAL: Scope the Paystack reference to this enrollment NOW ───────
    // We store it BEFORE redirecting the user. During verification, we confirm
    // that the reference being verified matches the one stored here — preventing
    // a valid reference from one enrollment being used to confirm another.
    enrollment.paymentReference = reference
    enrollment.productType = productType
    enrollment.expectedAmount = amountNaira
    enrollment.selectedSession = {
      sessionId,
      date: sessionDate,
      time: sessionTime,
    }
    enrollment.accessTier = accessTier
    await enrollment.save()

    return NextResponse.json(
      {
        success: true,
        authorizationUrl: authorization_url,
        // Expose reference so frontend can pass it to the verify endpoint
        reference,
      },
      { status: 200 },
    )
  } catch (error: any) {
    console.error('[payment/initialize] Error:', error)
    return NextResponse.json(
      {
        error: 'Failed to initialize payment.',
        details:
          process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 },
    )
  }
}
