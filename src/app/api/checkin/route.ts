import { NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import Enrollment from '@/models/Enrollment'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** How many minutes before the session start that check-in opens */
const CHECKIN_OPEN_MINUTES_BEFORE = 30

/** How long the session lasts — check-in is accepted until the session ends.
 *  Override via EVENT_DURATION_MINUTES env var. */
const EVENT_DURATION_MINUTES = parseInt(
  process.env.EVENT_DURATION_MINUTES ?? '480', // 8 hours to cover a full day
  10,
)

// ---------------------------------------------------------------------------
// Timezone-aware date parsing
// ---------------------------------------------------------------------------

/**
 * Given an ISO date string (YYYY-MM-DD) and a 24-hour time string (HH:MM),
 * returns a UTC Date object representing that moment in the given IANA timezone.
 *
 * We use the Intl.DateTimeFormat trick to determine the UTC offset precisely.
 */
function parseSessionStart(dateStr: string, timeStr: string, tz: string): Date {
  // Normalise time to HH:MM:SS
  const parts = timeStr.split(':')
  const hh = (parts[0] ?? '00').padStart(2, '0')
  const mm = (parts[1] ?? '00').padStart(2, '0')
  const normalized = `${dateStr}T${hh}:${mm}:00`

  // First, treat it as UTC to get a Date we can feed into Intl
  const assumedUtc = new Date(normalized + 'Z')

  try {
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

    // What does the target TZ say this UTC moment is?
    const p = Object.fromEntries(
      formatter.formatToParts(assumedUtc).map((x) => [x.type, x.value]),
    )

    // Reconstruct as a "local" Date and compute offset
    const tzLocal = new Date(
      `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}:${p.second}`,
    )
    const offsetMs = tzLocal.getTime() - assumedUtc.getTime()

    // Subtract offset to get the true UTC time for this local moment
    return new Date(assumedUtc.getTime() - offsetMs)
  } catch {
    // Fallback: WAT = UTC+1
    return new Date(assumedUtc.getTime() - 60 * 60 * 1000)
  }
}

/**
 * Derive the IANA timezone from the session city.
 * Extend this map as new cities are added to session-config.
 */
function timezoneForCity(city?: string): string {
  if (!city) return 'Africa/Lagos'
  const lower = city.toLowerCase()
  if (lower.includes('dubai')) return 'Asia/Dubai'
  if (lower.includes('london')) return 'Europe/London'
  if (lower.includes('singapore')) return 'Asia/Singapore'
  return 'Africa/Lagos' // WAT default
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // `day` must be 1 or 2. Defaults to 1 for single-day sessions.
    const { email, enrollmentReference, sessionId, day: rawDay } = body

    const day: 1 | 2 = rawDay === 2 ? 2 : 1

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

    // ── Validation 1: Enrollment must exist with matching email + reference ──
    const enrollment = await Enrollment.findOne({
      email: String(email).toLowerCase().trim(),
      enrollmentReference: String(enrollmentReference).trim().toUpperCase(),
    })

    if (!enrollment) {
      return NextResponse.json(
        {
          error: 'Check-in failed.',
          details:
            'No enrollment found matching that email and reference. Please check both and try again.',
        },
        { status: 404 },
      )
    }

    // ── Validation 2: Payment must be confirmed ─────────────────────────────
    if (enrollment.paymentStatus !== 'success') {
      return NextResponse.json(
        {
          error: 'Payment not confirmed.',
          details:
            'Your payment has not been confirmed. Please contact event staff.',
        },
        { status: 403 },
      )
    }

    // ── Validation 3: Booking must be confirmed ─────────────────────────────
    if (enrollment.bookingStatus !== 'confirmed') {
      return NextResponse.json(
        {
          error: 'Booking not confirmed.',
          details: 'Your booking is not confirmed. Please contact event staff.',
        },
        { status: 403 },
      )
    }

    // ── Validation 4: Access tier must be "full" ────────────────────────────
    if (enrollment.accessTier !== 'full') {
      return NextResponse.json(
        {
          error: 'Live check-in not available.',
          details:
            'Your enrollment is for virtual or consulting access. Live check-in is only for Signature Live Masterclass attendees.',
        },
        { status: 403 },
      )
    }

    // ── Validation 5: Session ID must match ─────────────────────────────────
    if (
      !enrollment.selectedSession ||
      enrollment.selectedSession.sessionId !== String(sessionId).trim()
    ) {
      return NextResponse.json(
        {
          error: 'Session mismatch.',
          details:
            'This check-in QR code is for a different session than the one on your enrollment. Please find the correct QR code for your event.',
        },
        { status: 403 },
      )
    }

    const session = enrollment.selectedSession

    // ── Validation 6: Day 2 only allowed for 2-day sessions ─────────────────
    if (day === 2 && !session.isTwoDay) {
      return NextResponse.json(
        {
          error: 'Invalid day.',
          details:
            'This session is a single-day event. Day 2 check-in is not applicable.',
        },
        { status: 400 },
      )
    }

    // ── Validation 7: Date array must have an entry for the requested day ────
    const dateIndex = day - 1
    const sessionDateStr = session.dates[dateIndex]
    if (!sessionDateStr) {
      return NextResponse.json(
        {
          error: 'Session date not found.',
          details: `No date configured for Day ${day} of this session.`,
        },
        { status: 400 },
      )
    }

    // ── Validation 8: Already checked in for this day ───────────────────────
    if (day === 1 && enrollment.checkedInDay1) {
      return NextResponse.json(
        {
          error: 'Already checked in.',
          details: `You already checked in for Day 1 at ${enrollment.checkedInDay1At?.toLocaleString('en-NG', { timeZone: timezoneForCity(session.city) })}.`,
        },
        { status: 409 },
      )
    }

    if (day === 2 && enrollment.checkedInDay2) {
      return NextResponse.json(
        {
          error: 'Already checked in.',
          details: `You already checked in for Day 2 at ${enrollment.checkedInDay2At?.toLocaleString('en-NG', { timeZone: timezoneForCity(session.city) })}.`,
        },
        { status: 409 },
      )
    }

    // ── Validation 9: Time window ────────────────────────────────────────────
    const tz = timezoneForCity(session.city)
    const now = new Date()
    const sessionStart = parseSessionStart(sessionDateStr, session.time, tz)
    const sessionEnd = new Date(
      sessionStart.getTime() + EVENT_DURATION_MINUTES * 60_000,
    )
    const checkinOpensAt = new Date(
      sessionStart.getTime() - CHECKIN_OPEN_MINUTES_BEFORE * 60_000,
    )

    if (now < checkinOpensAt) {
      const minutesUntilOpen = Math.ceil(
        (checkinOpensAt.getTime() - now.getTime()) / 60_000,
      )
      return NextResponse.json(
        {
          error: 'Check-in not open yet.',
          details: `Check-in for Day ${day} opens ${CHECKIN_OPEN_MINUTES_BEFORE} minutes before the session. Please return in approximately ${minutesUntilOpen} minute(s).`,
        },
        { status: 403 },
      )
    }

    if (now > sessionEnd) {
      return NextResponse.json(
        {
          error: 'Check-in closed.',
          details: `Day ${day} has ended. Check-in is no longer available.`,
        },
        { status: 403 },
      )
    }

    // ── All validations passed — mark the appropriate day as checked in ──────
    const now2 = new Date()

    if (day === 1) {
      enrollment.checkedInDay1 = true
      enrollment.checkedInDay1At = now2
    } else {
      enrollment.checkedInDay2 = true
      enrollment.checkedInDay2At = now2
    }

    await enrollment.save()

    return NextResponse.json(
      {
        success: true,
        message: 'Access Granted.',
        day,
        checkedInAt: now2.toISOString(),
        attendee: {
          name: enrollment.name,
          email: enrollment.email,
          enrollmentReference: enrollment.enrollmentReference,
          productType: enrollment.productType,
          sessionDate: sessionDateStr,
          sessionTime: session.time,
          venue: session.venue,
          city: session.city,
          isTwoDay: session.isTwoDay ?? false,
          // Reflect current state of both days
          checkedInDay1: enrollment.checkedInDay1,
          checkedInDay1At: enrollment.checkedInDay1At?.toISOString(),
          checkedInDay2: enrollment.checkedInDay2,
          checkedInDay2At: enrollment.checkedInDay2At?.toISOString(),
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
