import { NextResponse } from 'next/server'
import crypto from 'crypto'
import connectToDatabase from '@/lib/mongodb'
import Enrollment from '@/models/Enrollment'
import Waitlist from '@/models/Waitlist'
import { findSessionById } from '@/lib/session-config'
import { sendWaitlistJoinedEmail } from '@/lib/email'

/**
 * POST /api/waitlist
 * Body: { name, email, phone, city?, productType, sessionId }
 *
 * Validates the session is genuinely at capacity, then adds the user to the
 * waitlist queue. Sends a confirmation email with their position.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, phone, city, productType, sessionId } = body

    // ── Validate required fields ──────────────────────────────────────────
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

    // ── Resolve session config ─────────────────────────────────────────────
    const sessionConfig = findSessionById(sessionId)
    if (!sessionConfig) {
      return NextResponse.json(
        {
          error: 'Session not found.',
          details: `No session with ID "${sessionId}".`,
        },
        { status: 404 },
      )
    }

    await connectToDatabase()

    // ── Check the session is actually at capacity ──────────────────────────
    const confirmedCount = await Enrollment.countDocuments({
      'selectedSession.sessionId': sessionId,
      paymentStatus: 'success',
      bookingStatus: 'confirmed',
      cancelledAt: { $exists: false },
    })

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

    // ── Check the user is not already enrolled ────────────────────────────
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

    // ── Check for duplicate waitlist entry ────────────────────────────────
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

    // ── Determine next position ────────────────────────────────────────────
    const lastEntry = await Waitlist.findOne(
      { sessionId, status: { $in: ['waiting', 'notified'] } },
      { position: 1 },
      { sort: { position: -1 } },
    )
    const position = (lastEntry?.position ?? 0) + 1

    // ── Generate unique confirmation token ────────────────────────────────
    const confirmationToken = crypto.randomBytes(32).toString('hex')

    // ── Create waitlist entry ──────────────────────────────────────────────
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

    // ── Send confirmation email (non-blocking) ────────────────────────────
    sendWaitlistJoinedEmail({
      name: String(name).trim(),
      email: cleanEmail,
      productType,
      sessionLabel: sessionConfig.label,
      position,
    }).catch((err) => console.error('[waitlist] Join email failed:', err))

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
    console.error('[waitlist] Error:', err)
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

/**
 * GET /api/waitlist?email=&sessionId=
 * Returns the waitlist position for a given email + session (public).
 */
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
    return NextResponse.json({ error: 'Lookup failed.' }, { status: 500 })
  }
}
