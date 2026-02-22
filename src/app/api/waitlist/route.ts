import { NextResponse } from 'next/server'
import crypto from 'crypto'
import connectToDatabase from '@/lib/mongodb'
import Enrollment from '@/models/Enrollment'
import Waitlist from '@/models/Waitlist'
import { sendWaitlistJoinedEmail } from '@/lib/email'
import { findSessionByIdFromDB } from '@/lib/session-db'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, phone, city, productType, sessionId } = body

    if (
      !name?.trim() ||
      !email?.trim() ||
      !phone?.trim() ||
      !productType ||
      !sessionId
    ) {
      return NextResponse.json(
        {
          error: 'Missing required fields.',
          details: 'name, email, phone, productType, sessionId are required.',
        },
        { status: 400 },
      )
    }

    const cleanEmail = String(email).toLowerCase().trim()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return NextResponse.json(
        { error: 'Invalid email address.' },
        { status: 400 },
      )
    }

    await connectToDatabase()

    const sessionConfig = await findSessionByIdFromDB(sessionId)
    if (!sessionConfig) {
      return NextResponse.json(
        {
          error: 'Session not found.',
          details: `No session with ID "${sessionId}".`,
        },
        { status: 404 },
      )
    }

    const now = new Date()

    const [paidCount, reservationCount] = await Promise.all([
      Enrollment.countDocuments({
        'selectedSession.sessionId': sessionId,
        paymentStatus: 'success',
        bookingStatus: 'confirmed',
        cancelledAt: { $exists: false },
      }),
      Enrollment.countDocuments({
        'selectedSession.sessionId': sessionId,
        reservationType: 'manual_paystack',
        paymentWindowStatus: { $in: ['pending', 'reminded'] },
        reservationExpiresAt: { $gt: now },
        cancelledAt: { $exists: false },
      }),
    ])

    const confirmedCount = paidCount + reservationCount

    if (confirmedCount < sessionConfig.capacity) {
      return NextResponse.json(
        {
          error: 'Session is not full.',
          details:
            'This session still has spots available. Please proceed with standard enrollment.',
          spotsAvailable: sessionConfig.capacity - confirmedCount,
        },
        { status: 409 },
      )
    }

    const existingEnrollment = await Enrollment.findOne({
      email: cleanEmail,
      'selectedSession.sessionId': sessionId,
      paymentStatus: 'success',
    })
    if (existingEnrollment) {
      return NextResponse.json(
        {
          error: 'Already enrolled.',
          details: 'This email is already enrolled in this session.',
        },
        { status: 409 },
      )
    }

    const existing = await Waitlist.findOne({
      email: cleanEmail,
      sessionId,
      status: { $in: ['waiting', 'notified'] },
    })
    if (existing) {
      return NextResponse.json(
        {
          error: 'Already on waitlist.',
          details: `You are already on the waitlist at position #${existing.position}.`,
          position: existing.position,
        },
        { status: 409 },
      )
    }

    const lastEntry = await Waitlist.findOne(
      { sessionId, status: { $in: ['waiting', 'notified'] } },
      { position: 1 },
      { sort: { position: -1 } },
    )
    const position = (lastEntry?.position ?? 0) + 1

    const confirmationToken = crypto.randomBytes(32).toString('hex')

    await Waitlist.create({
      name: String(name).trim(),
      email: cleanEmail,
      phone: String(phone).replace(/\s+/g, ''),
      city: city ? String(city).trim() : undefined,
      productType,
      sessionId,
      position,
      status: 'waiting',
      confirmationToken,
    })

    // ── Send confirmation email — awaited so failures are visible ──────────
    // We intentionally do NOT let email failure block the 201 response, but we
    // log it clearly rather than silently swallowing it.
    try {
      await sendWaitlistJoinedEmail({
        name: String(name).trim(),
        email: cleanEmail,
        productType,
        sessionLabel: sessionConfig.label,
        position,
      })
    } catch (emailErr: any) {
      // The user is on the waitlist — don't return an error for that.
      // But log prominently so it's obvious in server logs.
      console.error(
        '[waitlist] ⚠️  JOIN CONFIRMATION EMAIL FAILED — user added to waitlist but email not sent.',
        {
          email: cleanEmail,
          productType,
          sessionId,
          error: emailErr?.message ?? emailErr,
          // Surface the SendGrid response body if available
          responseBody: emailErr?.response?.body ?? null,
        },
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Added to waitlist successfully.',
        position,
        sessionLabel: sessionConfig.label,
      },
      { status: 201 },
    )
  } catch (err: any) {
    console.error('[waitlist POST] Error:', err)
    return NextResponse.json(
      {
        error: 'Failed to join waitlist.',
        details:
          process.env.NODE_ENV === 'development' ? err.message : undefined,
      },
      { status: 500 },
    )
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')?.toLowerCase().trim()
    const sessionId = searchParams.get('sessionId')

    if (!email || !sessionId) {
      return NextResponse.json(
        { error: 'email and sessionId query params required.' },
        { status: 400 },
      )
    }

    await connectToDatabase()

    const entry = await Waitlist.findOne(
      { email, sessionId, status: { $in: ['waiting', 'notified'] } },
      { position: 1, status: 1, confirmationExpiresAt: 1 },
    ).lean()

    if (!entry) {
      return NextResponse.json({ onWaitlist: false }, { status: 200 })
    }

    return NextResponse.json({
      onWaitlist: true,
      position: entry.position,
      status: entry.status,
      confirmationExpiresAt: entry.confirmationExpiresAt ?? null,
    })
  } catch (err: any) {
    console.error('[waitlist GET] Error:', err)
    return NextResponse.json({ error: 'Lookup failed.' }, { status: 500 })
  }
}
