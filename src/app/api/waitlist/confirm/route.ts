import { NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import Waitlist from '@/models/Waitlist'
import { findSessionByIdFromDB } from '@/lib/session-db'

/**
 * POST /api/waitlist/confirm
 * Body: { token }
 *
 * Called when an attendee clicks "Confirm My Spot" in the waitlist notification email.
 * Validates the token is valid and not expired, then returns the user's pre-filled
 * details so the /waitlist/confirm page can open the enrollment modal directly.
 *
 * Session config is now read from MongoDB via findSessionByIdFromDB().
 *
 * The enrollment modal completes payment normally — on success, the payment/verify
 * route should also mark the waitlist entry as 'converted'.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { token } = body

    if (!token || typeof token !== 'string' || token.length < 32) {
      return NextResponse.json(
        { error: 'Invalid confirmation token.' },
        { status: 400 },
      )
    }

    await connectToDatabase()

    const entry = await Waitlist.findOne({ confirmationToken: token.trim() })

    if (!entry) {
      return NextResponse.json(
        {
          error: 'Token not found.',
          details:
            'This confirmation link is invalid. Please check your email or contact support.',
        },
        { status: 404 },
      )
    }

    // Already converted — they already paid
    if (entry.status === 'converted') {
      return NextResponse.json(
        {
          error: 'Already confirmed.',
          details:
            'You have already confirmed this spot and completed enrollment.',
        },
        { status: 409 },
      )
    }

    // Expired or removed
    if (entry.status === 'expired' || entry.status === 'removed') {
      return NextResponse.json(
        {
          error: 'This offer has expired.',
          details:
            'Your 24-hour window has passed and the spot was offered to the next person. Join the waitlist again to stay in the queue.',
        },
        { status: 410 },
      )
    }

    // Not yet notified — still in queue
    if (entry.status !== 'notified') {
      return NextResponse.json(
        {
          error: 'No spot currently available.',
          details:
            'You are still in the queue. We will notify you when a spot opens.',
        },
        { status: 409 },
      )
    }

    // Check 24h expiry window
    if (
      entry.confirmationExpiresAt &&
      new Date() > entry.confirmationExpiresAt
    ) {
      entry.status = 'expired'
      await entry.save()
      return NextResponse.json(
        {
          error: 'Confirmation window expired.',
          details:
            'Your 24-hour window has passed. The spot has been offered to the next person.',
        },
        { status: 410 },
      )
    }

    // Resolve session metadata from DB for display
    const sessionConfig = await findSessionByIdFromDB(entry.sessionId)

    return NextResponse.json({
      success: true,
      message:
        'Spot confirmed. Proceed to payment to complete your enrollment.',
      // expiresAt lets the frontend show a countdown timer
      expiresAt: entry.confirmationExpiresAt?.toISOString() ?? null,
      waitlistEntry: {
        name: entry.name,
        email: entry.email,
        phone: entry.phone,
        city: entry.city,
        productType: entry.productType,
        sessionId: entry.sessionId,
        sessionLabel: sessionConfig?.label ?? entry.sessionId,
        confirmationToken: token,
      },
    })
  } catch (err: any) {
    console.error('[waitlist/confirm] Error:', err)
    return NextResponse.json(
      { error: 'Confirmation failed. Please try again.' },
      { status: 500 },
    )
  }
}
