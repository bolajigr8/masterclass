import { NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import connectToDatabase from '@/lib/mongodb'
import Enrollment from '@/models/Enrollment'
import Waitlist from '@/models/Waitlist'
import { isValidProductType } from '@/lib/pricing'
import {
  findSessionByIdFromDB,
  getSessionsForProductFromDB,
} from '@/lib/session-db'
import { sendReservationConfirmation } from '@/lib/email'

// ─── Constants ────────────────────────────────────────────────────────────────

const RESERVATION_WINDOW_MS = 24 * 60 * 60 * 1000
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateEnrollmentReference(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const randomHex = randomBytes(8).toString('hex').toUpperCase()
  return `ENR-${timestamp}-${randomHex}`
}

function generateReservationToken(): string {
  return randomBytes(32).toString('hex')
}

async function pickBestSessionForProduct(
  productType: string,
): Promise<{ sessionId: string; label: string } | null> {
  const sessions = await getSessionsForProductFromDB(productType)
  if (!sessions.length) return null

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const future = sessions.filter((s) => {
    const lastDate = new Date(s.dates[s.dates.length - 1])
    return lastDate >= today
  })

  if (!future.length) return null

  const withCounts = await Promise.all(
    future.map(async (s) => {
      const [confirmedCount, reservationCount] = await Promise.all([
        Enrollment.countDocuments({
          'selectedSession.sessionId': s.sessionId,
          paymentStatus: 'success',
          bookingStatus: 'confirmed',
          cancelledAt: { $exists: false },
        }),
        Enrollment.countDocuments({
          'selectedSession.sessionId': s.sessionId,
          reservationType: 'manual_paystack',
          paymentWindowStatus: { $in: ['pending', 'reminded'] },
          reservationExpiresAt: { $gt: new Date() },
          cancelledAt: { $exists: false },
        }),
      ])
      const held = confirmedCount + reservationCount
      return { ...s, held }
    }),
  )

  const available = withCounts
    .filter((s) => s.held < s.capacity)
    .sort(
      (a, b) => new Date(a.dates[0]).getTime() - new Date(b.dates[0]).getTime(),
    )

  if (available.length)
    return { sessionId: available[0].sessionId, label: available[0].label }

  const sorted = withCounts.sort(
    (a, b) => new Date(a.dates[0]).getTime() - new Date(b.dates[0]).getTime(),
  )
  return sorted.length
    ? { sessionId: sorted[0].sessionId, label: sorted[0].label }
    : null
}

/**
 * Sends the reservation confirmation email and logs clearly on failure.
 * Never throws — callers shouldn't fail a successful reservation due to email.
 */
async function sendReservationEmailSafely(params: {
  name: string
  email: string
  enrollmentReference: string
  productType: string
  sessionLabel: string
  reservationToken: string
  expiresAt: Date
}): Promise<void> {
  try {
    await sendReservationConfirmation(params)
  } catch (emailErr: any) {
    console.error(
      '[reserve] ⚠️  RESERVATION CONFIRMATION EMAIL FAILED — seat is reserved but email not sent.',
      {
        email: params.email,
        enrollmentReference: params.enrollmentReference,
        productType: params.productType,
        error: emailErr?.message ?? emailErr,
        // Expose SendGrid's response body if present — this tells you exactly
        // why it was rejected (unverified sender, bad API key, etc.)
        sendgridResponse: emailErr?.response?.body ?? null,
      },
    )
  }
}

// ─── Handler ──────────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, phone, city, productType } = body

    if (!name || !email || !phone || !productType) {
      return NextResponse.json(
        {
          error: 'Missing required fields.',
          details: 'name, email, phone, and productType are all required.',
        },
        { status: 400 },
      )
    }

    const cleanName = String(name).trim()
    const cleanEmail = String(email).toLowerCase().trim()
    const cleanPhone = String(phone).replace(/\s+/g, '')
    const cleanCity = city ? String(city).trim() : undefined

    if (cleanName.length < 2) {
      return NextResponse.json(
        { error: 'Name must be at least 2 characters.' },
        { status: 400 },
      )
    }
    if (!EMAIL_RE.test(cleanEmail)) {
      return NextResponse.json(
        { error: 'Invalid email address.' },
        { status: 400 },
      )
    }
    if (cleanPhone.length < 10) {
      return NextResponse.json(
        { error: 'Phone number must be at least 10 digits.' },
        { status: 400 },
      )
    }
    if (!isValidProductType(productType)) {
      return NextResponse.json(
        { error: 'Invalid product type.' },
        { status: 400 },
      )
    }

    await connectToDatabase()

    const existingEnrollment = await Enrollment.findOne({
      email: cleanEmail,
    }).lean()

    if (existingEnrollment) {
      // Already paid — hard block
      if (existingEnrollment.paymentStatus === 'success') {
        return NextResponse.json(
          {
            error: 'Email already enrolled.',
            details:
              'A completed enrollment exists for this email address. Contact support if you need help.',
          },
          { status: 409 },
        )
      }

      // Active reservation still within window — resend the payment link
      if (
        existingEnrollment.reservationType === 'manual_paystack' &&
        existingEnrollment.paymentWindowStatus !== 'expired' &&
        existingEnrollment.reservationExpiresAt &&
        new Date(existingEnrollment.reservationExpiresAt) > new Date()
      ) {
        if (existingEnrollment.reservationToken) {
          const sessionConfig = existingEnrollment.selectedSession?.sessionId
            ? await findSessionByIdFromDB(
                existingEnrollment.selectedSession.sessionId,
              )
            : null

          await sendReservationEmailSafely({
            name: existingEnrollment.name,
            email: existingEnrollment.email,
            enrollmentReference: existingEnrollment.enrollmentReference,
            productType: existingEnrollment.productType ?? productType,
            sessionLabel: sessionConfig?.label ?? 'your session',
            reservationToken: existingEnrollment.reservationToken,
            expiresAt: existingEnrollment.reservationExpiresAt,
          })
        }

        return NextResponse.json(
          {
            success: true,
            resent: true,
            enrollmentReference: existingEnrollment.enrollmentReference,
            expiresAt: existingEnrollment.reservationExpiresAt,
            message:
              'A reservation already exists for this email. The payment link has been resent.',
          },
          { status: 200 },
        )
      }

      // Stale pending Paystack enrollment — update in place
      if (
        existingEnrollment.reservationType !== 'manual_paystack' &&
        existingEnrollment.paymentStatus === 'pending'
      ) {
        const bestSession = await pickBestSessionForProduct(productType)
        if (!bestSession) {
          return NextResponse.json(
            {
              error: 'No upcoming sessions available.',
              details: 'Please check back soon or contact us.',
            },
            { status: 404 },
          )
        }

        const sessionConfig = await findSessionByIdFromDB(bestSession.sessionId)
        if (!sessionConfig) {
          return NextResponse.json(
            { error: 'Session configuration error. Please try again.' },
            { status: 500 },
          )
        }

        const activeWaitlistEntry = await Waitlist.findOne({
          email: cleanEmail,
          sessionId: bestSession.sessionId,
          status: { $in: ['waiting', 'notified'] },
        }).lean()

        if (activeWaitlistEntry) {
          return NextResponse.json(
            {
              error: 'Already on waitlist.',
              details:
                "You're already on the waitlist for this session. We'll email you the moment a seat opens.",
            },
            { status: 409 },
          )
        }

        const [confirmedCount, reservationCount] = await Promise.all([
          Enrollment.countDocuments({
            'selectedSession.sessionId': bestSession.sessionId,
            paymentStatus: 'success',
            bookingStatus: 'confirmed',
            cancelledAt: { $exists: false },
          }),
          Enrollment.countDocuments({
            'selectedSession.sessionId': bestSession.sessionId,
            reservationType: 'manual_paystack',
            paymentWindowStatus: { $in: ['pending', 'reminded'] },
            reservationExpiresAt: { $gt: new Date() },
            cancelledAt: { $exists: false },
          }),
        ])

        const totalHeld = confirmedCount + reservationCount
        if (totalHeld >= sessionConfig.capacity) {
          return NextResponse.json(
            {
              error: 'All sessions are currently at capacity.',
              details:
                'Seats may open up if pending reservations expire. Please check back in a few hours.',
              sessionId: bestSession.sessionId,
              sessionLabel: sessionConfig.label,
            },
            { status: 422 },
          )
        }

        const reservationToken = generateReservationToken()
        const reservationExpiresAt = new Date(
          Date.now() + RESERVATION_WINDOW_MS,
        )

        await Enrollment.updateOne(
          { email: cleanEmail },
          {
            $set: {
              name: cleanName,
              phone: cleanPhone,
              city: cleanCity,
              productType,
              reservationType: 'manual_paystack',
              reservationToken,
              reservationExpiresAt,
              paymentWindowStatus: 'pending',
              selectedSession: {
                sessionId: sessionConfig.sessionId,
                dates: sessionConfig.dates,
                time: sessionConfig.time,
                venue: sessionConfig.venue,
                city: sessionConfig.city,
                isTwoDay: sessionConfig.isTwoDay,
              },
            },
            $unset: { reminderSentAt: '' },
          },
        )

        await sendReservationEmailSafely({
          name: cleanName,
          email: cleanEmail,
          enrollmentReference: existingEnrollment.enrollmentReference,
          productType,
          sessionLabel: sessionConfig.label,
          reservationToken,
          expiresAt: reservationExpiresAt,
        })

        return NextResponse.json(
          {
            success: true,
            enrollmentReference: existingEnrollment.enrollmentReference,
            expiresAt: reservationExpiresAt,
          },
          { status: 201 },
        )
      }

      return NextResponse.json(
        {
          error: 'Email already registered.',
          details:
            'This email address is already in our system. Contact support if you need help.',
        },
        { status: 409 },
      )
    }

    // ── New reservation ────────────────────────────────────────────────────
    const bestSession = await pickBestSessionForProduct(productType)
    if (!bestSession) {
      return NextResponse.json(
        {
          error: 'No upcoming sessions available.',
          details: 'Please check back soon or contact us to be notified.',
        },
        { status: 404 },
      )
    }

    const sessionConfig = await findSessionByIdFromDB(bestSession.sessionId)
    if (!sessionConfig) {
      return NextResponse.json(
        { error: 'Session configuration error. Please try again.' },
        { status: 500 },
      )
    }

    const activeWaitlistEntry = await Waitlist.findOne({
      email: cleanEmail,
      sessionId: bestSession.sessionId,
      status: { $in: ['waiting', 'notified'] },
    }).lean()

    if (activeWaitlistEntry) {
      return NextResponse.json(
        {
          error: 'Already on waitlist.',
          details:
            "You're already on the waitlist for this session. We'll email you the moment a seat opens.",
        },
        { status: 409 },
      )
    }

    const [confirmedCount, reservationCount] = await Promise.all([
      Enrollment.countDocuments({
        'selectedSession.sessionId': bestSession.sessionId,
        paymentStatus: 'success',
        bookingStatus: 'confirmed',
        cancelledAt: { $exists: false },
      }),
      Enrollment.countDocuments({
        'selectedSession.sessionId': bestSession.sessionId,
        reservationType: 'manual_paystack',
        paymentWindowStatus: { $in: ['pending', 'reminded'] },
        reservationExpiresAt: { $gt: new Date() },
        cancelledAt: { $exists: false },
      }),
    ])

    const totalHeld = confirmedCount + reservationCount
    if (totalHeld >= sessionConfig.capacity) {
      return NextResponse.json(
        {
          error: 'All sessions are currently at capacity.',
          details:
            'Seats may open up when pending reservations expire. Please check back in a few hours, or contact us to join the waitlist.',
          sessionId: bestSession.sessionId,
          sessionLabel: sessionConfig.label,
        },
        { status: 422 },
      )
    }

    const enrollmentReference = generateEnrollmentReference()
    const reservationToken = generateReservationToken()
    const reservationExpiresAt = new Date(Date.now() + RESERVATION_WINDOW_MS)

    await Enrollment.create({
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      city: cleanCity,
      productType,
      enrollmentReference,
      paymentStatus: 'pending',
      bookingStatus: 'pending',
      reservationType: 'manual_paystack',
      reservationToken,
      reservationExpiresAt,
      paymentWindowStatus: 'pending',
      selectedSession: {
        sessionId: sessionConfig.sessionId,
        dates: sessionConfig.dates,
        time: sessionConfig.time,
        venue: sessionConfig.venue,
        city: sessionConfig.city,
        isTwoDay: sessionConfig.isTwoDay,
      },
    })

    // ── Send confirmation email — awaited with safe error wrapper ──────────
    await sendReservationEmailSafely({
      name: cleanName,
      email: cleanEmail,
      enrollmentReference,
      productType,
      sessionLabel: sessionConfig.label,
      reservationToken,
      expiresAt: reservationExpiresAt,
    })

    return NextResponse.json(
      {
        success: true,
        enrollmentReference,
        expiresAt: reservationExpiresAt,
      },
      { status: 201 },
    )
  } catch (error: any) {
    console.error('[reserve] Error:', error)

    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern ?? {})[0]
      if (field === 'email') {
        return NextResponse.json(
          { error: 'Email already registered.' },
          { status: 409 },
        )
      }
      if (field === 'reservationToken') {
        return NextResponse.json(
          { error: 'Token collision. Please try again.' },
          { status: 409 },
        )
      }
      return NextResponse.json(
        { error: 'Reference conflict. Please try again.' },
        { status: 409 },
      )
    }

    return NextResponse.json(
      {
        error: 'Reservation failed. Please try again.',
        details:
          process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 },
    )
  }
}
