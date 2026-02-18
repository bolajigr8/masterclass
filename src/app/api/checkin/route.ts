import { NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import Enrollment from '@/models/Enrollment'

// How many minutes before the event start check-in opens
const CHECKIN_OPEN_MINUTES_BEFORE = 30

// How long (minutes) the event lasts — check-in closes when the event ends.
// Set via env var; default 120 minutes (2 hours).
const EVENT_DURATION_MINUTES = parseInt(
  process.env.EVENT_DURATION_MINUTES ?? '120',
  10,
)

/**
 * Parses a session date string (YYYY-MM-DD) and time string (HH:MM or HH:MM AM/PM)
 * into a UTC Date object representing the event start time.
 *
 * We assume the session time is given in the timezone specified by
 * SESSION_TIMEZONE env var (default: 'Africa/Lagos').
 */
function parseSessionStart(date: string, time: string): Date {
  const tz = process.env.SESSION_TIMEZONE ?? 'Africa/Lagos'

  // Normalise the time string (handle both 24h and 12h formats)
  const normalized = `${date}T${convertTo24h(time)}`

  // Build a Date in the target timezone using the Intl API trick:
  // We format a known UTC moment back in the target timezone and compare
  // offsets. A simpler approach works for server-side: combine date + time
  // into an ISO-like string and account for tz offset.
  //
  // For production precision we recommend using the `date-fns-tz` or `luxon`
  // library. Here we do a straightforward approach that works for WAT (UTC+1).
  const tzOffsetMs = getTimezoneOffsetMs(tz, normalized)
  const utcMs = new Date(normalized).getTime() - tzOffsetMs
  return new Date(utcMs)
}

/** Convert "2:00 PM" or "14:00" → "14:00:00" */
function convertTo24h(time: string): string {
  const upper = time.trim().toUpperCase()
  const amPmMatch = upper.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/)

  if (amPmMatch) {
    let hours = parseInt(amPmMatch[1], 10)
    const minutes = amPmMatch[2]
    const meridiem = amPmMatch[3]

    if (meridiem === 'PM' && hours !== 12) hours += 12
    if (meridiem === 'AM' && hours === 12) hours = 0

    return `${String(hours).padStart(2, '0')}:${minutes}:00`
  }

  // Assume already in HH:MM or HH:MM:SS
  const parts = upper.split(':')
  return `${parts[0].padStart(2, '0')}:${parts[1] ?? '00'}:${parts[2] ?? '00'}`
}

/** Approximates the UTC offset in ms for a given IANA timezone name. */
function getTimezoneOffsetMs(tz: string, isoLocalString: string): number {
  try {
    // Create a formatter that outputs UTC time for a given TZ
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    })

    // Parse our local ISO string as if it were UTC first
    const assumedUtc = new Date(isoLocalString + 'Z')

    // Format that UTC moment in the target timezone
    const parts = formatter.formatToParts(assumedUtc)
    const p = Object.fromEntries(parts.map((x) => [x.type, x.value]))
    const tzLocal = new Date(
      `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}:${p.second}`,
    )

    // Offset = (what the TZ says) - (what we assumed was UTC)
    return tzLocal.getTime() - assumedUtc.getTime()
  } catch {
    // Fallback to WAT = UTC+1
    return -60 * 60 * 1000
  }
}

// ---------------------------------------------------------------------------

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, enrollmentReference, sessionId } = body

    // ── Field validation ────────────────────────────────────────────────────
    if (!email || !enrollmentReference || !sessionId) {
      return NextResponse.json(
        {
          error: 'Missing required fields.',
          details:
            'email, enrollmentReference, and sessionId are all required.',
        },
        { status: 400 },
      )
    }

    await connectToDatabase()

    // ── VALIDATION 1: Enrollment must exist with matching email + reference ──
    const enrollment = await Enrollment.findOne({
      email: String(email).toLowerCase().trim(),
      enrollmentReference: String(enrollmentReference).trim(),
    })

    if (!enrollment) {
      return NextResponse.json(
        {
          error: 'Check-in failed.',
          details:
            'No enrollment found matching the provided email and enrollment reference.',
        },
        { status: 404 },
      )
    }

    // ── VALIDATION 2: Session ID must match the enrolled session ─────────────
    // This prevents a user from checking in to a session they didn't register for.
    if (
      !enrollment.selectedSession ||
      enrollment.selectedSession.sessionId !== String(sessionId).trim()
    ) {
      return NextResponse.json(
        {
          error: 'Session mismatch.',
          details:
            'This QR code is for a different session than the one you registered for.',
        },
        { status: 403 },
      )
    }

    // ── VALIDATION 3: Access tier must be "full" ─────────────────────────────
    if (enrollment.accessTier !== 'full') {
      return NextResponse.json(
        {
          error: 'Live check-in not available.',
          details:
            'Your access tier is set to "virtual". Live check-in is only available for full-access attendees.',
        },
        { status: 403 },
      )
    }

    // ── VALIDATION 4: Payment must be successful ─────────────────────────────
    if (enrollment.paymentStatus !== 'success') {
      return NextResponse.json(
        {
          error: 'Payment not confirmed.',
          details:
            'Your payment has not been confirmed. Please contact support.',
        },
        { status: 403 },
      )
    }

    // ── VALIDATION 5: Booking must be confirmed ──────────────────────────────
    if (enrollment.bookingStatus !== 'confirmed') {
      return NextResponse.json(
        {
          error: 'Booking not confirmed.',
          details:
            'Your booking has not been confirmed. Please contact support.',
        },
        { status: 403 },
      )
    }

    // ── VALIDATION 6: Not already checked in ────────────────────────────────
    if (enrollment.checkedIn) {
      return NextResponse.json(
        {
          error: 'Already checked in.',
          details: `You were already checked in at ${enrollment.checkedInAt?.toISOString()}.`,
        },
        { status: 409 },
      )
    }

    // ── VALIDATION 7: Time window ────────────────────────────────────────────
    const now = new Date()
    const sessionStart = parseSessionStart(
      enrollment.selectedSession.date,
      enrollment.selectedSession.time,
    )
    const sessionEnd = new Date(
      sessionStart.getTime() + EVENT_DURATION_MINUTES * 60 * 1000,
    )
    const checkinOpensAt = new Date(
      sessionStart.getTime() - CHECKIN_OPEN_MINUTES_BEFORE * 60 * 1000,
    )

    if (now < checkinOpensAt) {
      const minutesUntilOpen = Math.ceil(
        (checkinOpensAt.getTime() - now.getTime()) / 60_000,
      )
      return NextResponse.json(
        {
          error: 'Check-in not open yet.',
          details: `Check-in opens ${CHECKIN_OPEN_MINUTES_BEFORE} minutes before the session starts. Please come back in approximately ${minutesUntilOpen} minute(s).`,
        },
        { status: 403 },
      )
    }

    if (now > sessionEnd) {
      return NextResponse.json(
        {
          error: 'Check-in closed.',
          details: 'The session has ended. Check-in is no longer available.',
        },
        { status: 403 },
      )
    }

    // ── All validations passed — mark as checked in ──────────────────────────
    enrollment.checkedIn = true
    enrollment.checkedInAt = now
    await enrollment.save()

    return NextResponse.json(
      {
        success: true,
        message: 'Access Granted.',
        attendee: {
          name: enrollment.name,
          email: enrollment.email,
          productType: enrollment.productType,
          sessionDate: enrollment.selectedSession.date,
          sessionTime: enrollment.selectedSession.time,
          checkedInAt: enrollment.checkedInAt,
        },
      },
      { status: 200 },
    )
  } catch (error: any) {
    console.error('[checkin] Error:', error)
    return NextResponse.json(
      {
        error: 'Check-in failed. Please try again or contact event staff.',
        details:
          process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 },
    )
  }
}
