import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import Waitlist from '@/models/Waitlist'
import { findSessionByIdFromDB } from '@/lib/session-db'
import { promoteWaitlistForSession } from '@/lib/waitlist-helpers'

/**
 * GET /api/cron/process-waitlist
 *
 * Called every 15 minutes by Vercel Cron.
 * Finds all 'notified' waitlist entries whose 24h confirmation window has
 * passed without payment, marks them 'expired', then immediately promotes
 * the next 'waiting' person in queue for that session.
 *
 * Uses the shared promoteWaitlistForSession() helper — same logic as the
 * admin capacity increase path — so the two code paths can never diverge.
 *
 * Protected by CRON_SECRET.
 */

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
    // ── Find all notified entries whose window has passed ─────────────────
    const expiredEntries = await Waitlist.find({
      status: 'notified',
      confirmationExpiresAt: { $lt: now },
    })

    for (const entry of expiredEntries) {
      entry.status = 'expired'
      await entry.save()
      expired++

      // ── Promote the next waiting person for this session ──────────────
      // We load the session config to get the current capacity and label,
      // then delegate to the shared helper which correctly accounts for
      // paid enrollments, active reservations, and already-notified entries
      // before deciding how many (if any) people to promote.
      const sessionConfig = await findSessionByIdFromDB(entry.sessionId)
      if (!sessionConfig) {
        errors.push(
          `Session config not found for sessionId: ${entry.sessionId}`,
        )
        continue
      }

      const result = await promoteWaitlistForSession(
        entry.sessionId,
        sessionConfig.capacity,
        sessionConfig.label,
      )

      promoted += result.promoted
      errors.push(...result.errors)
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
 * Same promotion logic as GET but triggered ad-hoc for a specific session.
 *
 * Protected by INTERNAL_API_SECRET header.
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

  const sessionConfig = await findSessionByIdFromDB(sessionId)
  if (!sessionConfig) {
    return NextResponse.json({ error: 'Session not found.' }, { status: 404 })
  }

  const { promoted, errors } = await promoteWaitlistForSession(
    sessionId,
    sessionConfig.capacity,
    sessionConfig.label,
  )

  return NextResponse.json({
    success: true,
    promoted,
    errors: errors.length > 0 ? errors : undefined,
  })
}
