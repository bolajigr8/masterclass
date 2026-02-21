import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import Waitlist from '@/models/Waitlist'
import { findSessionById } from '@/lib/session-config'
import { sendWaitlistSpotAvailableEmail } from '@/lib/email'

/**
 * GET /api/cron/process-waitlist
 *
 * Called every 15 minutes by Vercel Cron.
 * Two jobs in one pass:
 *   1. Expire notifications where the 24h window has passed without confirmation.
 *      Then promote the next 'waiting' person in the queue.
 *   2. (Future) Can also be triggered by cancellations via the admin cancel route.
 *
 * Protected by CRON_SECRET.
 */

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://trila.co'
const CONFIRMATION_HOURS = 24

function verifyCronAuth(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return process.env.NODE_ENV === 'development'
  return request.headers.get('authorization') === `Bearer ${secret}`
}

export async function GET(request: NextRequest) {
  if (!verifyCronAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await connectToDatabase()

  const now = new Date()
  let expired = 0
  let promoted = 0
  const errors: string[] = []

  try {
    // ── Step 1: Find all notified entries whose window has passed ───────────
    const expiredEntries = await Waitlist.find({
      status: 'notified',
      confirmationExpiresAt: { $lt: now },
    })

    for (const entry of expiredEntries) {
      entry.status = 'expired'
      await entry.save()
      expired++

      // ── Step 2: Promote the next person in the queue for this session ────
      const next = await Waitlist.findOne(
        { sessionId: entry.sessionId, status: 'waiting' },
        null,
        { sort: { position: 1 } },
      )

      if (!next) continue

      const sessionConfig = findSessionById(next.sessionId)
      if (!sessionConfig) continue

      const expiresAt = new Date(
        now.getTime() + CONFIRMATION_HOURS * 60 * 60 * 1000,
      )
      next.status = 'notified'
      next.notifiedAt = now
      next.confirmationExpiresAt = expiresAt
      await next.save()

      const confirmUrl = `${APP_URL}/waitlist/confirm?token=${next.confirmationToken}`

      try {
        await sendWaitlistSpotAvailableEmail({
          name: next.name,
          email: next.email,
          productType: next.productType,
          sessionLabel: sessionConfig.label,
          confirmUrl,
          expiresInHours: CONFIRMATION_HOURS,
        })
        promoted++
      } catch (err: any) {
        errors.push(`Email failed for ${next.email}: ${err.message}`)
      }
    }

    return NextResponse.json({
      success: true,
      runAt: now.toISOString(),
      expired,
      promoted,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (err: any) {
    console.error('[cron/process-waitlist] Fatal:', err)
    return NextResponse.json(
      { error: 'Waitlist cron failed.', details: err.message },
      { status: 500 },
    )
  }
}

/**
 * POST /api/cron/process-waitlist
 * Body: { sessionId }
 *
 * Called internally when a cancellation frees a spot immediately.
 * Same logic as GET but triggered ad-hoc rather than on a schedule.
 */
export async function POST(request: Request) {
  const authHeader = request.headers.get('x-internal-secret')
  if (authHeader !== process.env.INTERNAL_API_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { sessionId } = await request.json()
  if (!sessionId) {
    return NextResponse.json({ error: 'sessionId required.' }, { status: 400 })
  }

  await connectToDatabase()

  const now = new Date()
  const sessionConfig = findSessionById(sessionId)
  if (!sessionConfig) {
    return NextResponse.json({ error: 'Session not found.' }, { status: 404 })
  }

  const next = await Waitlist.findOne({ sessionId, status: 'waiting' }, null, {
    sort: { position: 1 },
  })

  if (!next) {
    return NextResponse.json({
      success: true,
      message: 'No one on waitlist for this session.',
    })
  }

  const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000)
  next.status = 'notified'
  next.notifiedAt = now
  next.confirmationExpiresAt = expiresAt
  await next.save()

  const confirmUrl = `${APP_URL}/waitlist/confirm?token=${next.confirmationToken}`

  await sendWaitlistSpotAvailableEmail({
    name: next.name,
    email: next.email,
    productType: next.productType,
    sessionLabel: sessionConfig.label,
    confirmUrl,
    expiresInHours: 24,
  })

  return NextResponse.json({
    success: true,
    notified: next.email,
    position: next.position,
    expiresAt: expiresAt.toISOString(),
  })
}
