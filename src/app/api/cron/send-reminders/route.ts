import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import Enrollment from '@/models/Enrollment'
import {
  sendVirtualSessionReminder24h,
  sendVirtualSessionReminder1h,
} from '@/lib/email'
import { findSessionByIdFromDB } from '@/lib/session-db'

/**
 * GET /api/cron/send-reminders
 *
 * Called by Vercel Cron every 30 minutes.
 * Finds confirmed virtual enrollees whose next session date falls within
 * the 24h or 1h reminder window, then sends the appropriate email.
 *
 * Session metadata (label, displayTime, etc.) is now read from MongoDB
 * via findSessionByIdFromDB() — no longer depends on static session-config.ts.
 *
 * Idempotent — checks reminder24hSentAt / reminder1hSentAt before sending.
 * Protected by CRON_SECRET header.
 */

const ZOOM_LINK =
  process.env.NEXT_PUBLIC_WEBINAR_LINK ?? 'https://Trila.co/webinar'
const ZOOM_MEETING_ID = process.env.ZOOM_MEETING_ID
const ZOOM_PASSCODE = process.env.ZOOM_PASSCODE

/** Window in minutes around each threshold to catch late/early cron runs */
const WINDOW_MINUTES = 35

function verifyCronAuth(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return process.env.NODE_ENV === 'development'
  return request.headers.get('authorization') === `Bearer ${secret}`
}

function sessionToUTC(dateStr: string, timeStr: string, city = ''): Date {
  const [h, m] = timeStr.split(':').map(Number)
  const hPad = String(h).padStart(2, '0')
  const mPad = String(m ?? 0).padStart(2, '0')
  const lower = city.toLowerCase()
  const offset = lower.includes('dubai')
    ? '+04:00'
    : lower.includes('london')
      ? '+00:00'
      : lower.includes('singapore')
        ? '+08:00'
        : '+01:00' // WAT default
  return new Date(`${dateStr}T${hPad}:${mPad}:00${offset}`)
}

export async function GET(request: NextRequest) {
  if (!verifyCronAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await connectToDatabase()

  const now = new Date()
  let sent24h = 0
  let sent1h = 0
  const errors: string[] = []

  try {
    const enrollments = await Enrollment.find({
      paymentStatus: 'success',
      bookingStatus: 'confirmed',
      accessTier: 'virtual',
      cancelledAt: { $exists: false },
    }).lean()

    for (const enrollment of enrollments) {
      const session = enrollment.selectedSession
      if (!session) continue

      // ── Resolve session metadata from DB ──────────────────────────────
      const sessionConfig = await findSessionByIdFromDB(session.sessionId)
      // If session no longer exists in DB, skip gracefully
      if (!sessionConfig) continue

      // ── Find the next upcoming date ───────────────────────────────────
      const upcoming = session.dates
        .map((dateStr, index) => ({ dateStr, index }))
        .filter(
          ({ dateStr }) =>
            sessionToUTC(dateStr, session.time, session.city) > now,
        )

      if (upcoming.length === 0) continue

      const { dateStr: nextDateStr, index: nextIndex } = upcoming[0]
      const sessionStart = sessionToUTC(nextDateStr, session.time, session.city)
      const minutesUntil = (sessionStart.getTime() - now.getTime()) / 60_000

      // ── 24h reminder ─────────────────────────────────────────────────
      const mins24h = 24 * 60
      const in24hWindow =
        minutesUntil >= mins24h - WINDOW_MINUTES &&
        minutesUntil <= mins24h + WINDOW_MINUTES

      if (in24hWindow && !enrollment.reminder24hSentAt) {
        try {
          await sendVirtualSessionReminder24h({
            name: enrollment.name,
            email: enrollment.email,
            enrollmentReference: enrollment.enrollmentReference,
            sessionLabel: sessionConfig.label,
            sessionDate: nextDateStr,
            sessionTime: sessionConfig.displayTime,
            sessionNumber: nextIndex + 1,
            totalSessions: session.dates.length,
            webinarLink: ZOOM_LINK,
            zoomMeetingId: ZOOM_MEETING_ID,
            zoomPasscode: ZOOM_PASSCODE,
          })
          await Enrollment.updateOne(
            { _id: enrollment._id, reminder24hSentAt: { $exists: false } },
            { $set: { reminder24hSentAt: now } },
          )
          sent24h++
        } catch (err: any) {
          errors.push(`24h failed for ${enrollment.email}: ${err.message}`)
        }
      }

      // ── 1h reminder ──────────────────────────────────────────────────
      const in1hWindow =
        minutesUntil >= 60 - WINDOW_MINUTES &&
        minutesUntil <= 60 + WINDOW_MINUTES

      if (in1hWindow && !enrollment.reminder1hSentAt) {
        try {
          await sendVirtualSessionReminder1h({
            name: enrollment.name,
            email: enrollment.email,
            enrollmentReference: enrollment.enrollmentReference,
            sessionLabel: sessionConfig.label,
            sessionDate: nextDateStr,
            sessionTime: sessionConfig.displayTime,
            sessionNumber: nextIndex + 1,
            totalSessions: session.dates.length,
            webinarLink: ZOOM_LINK,
            zoomMeetingId: ZOOM_MEETING_ID,
            zoomPasscode: ZOOM_PASSCODE,
          })
          await Enrollment.updateOne(
            { _id: enrollment._id, reminder1hSentAt: { $exists: false } },
            { $set: { reminder1hSentAt: now } },
          )
          sent1h++
        } catch (err: any) {
          errors.push(`1h failed for ${enrollment.email}: ${err.message}`)
        }
      }
    }

    return NextResponse.json({
      success: true,
      runAt: now.toISOString(),
      sent24h,
      sent1h,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (err: any) {
    console.error('[cron/send-reminders] Fatal:', err)
    return NextResponse.json(
      { error: 'Cron failed.', details: err.message },
      { status: 500 },
    )
  }
}
