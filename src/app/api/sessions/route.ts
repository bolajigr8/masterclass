// import { NextResponse } from 'next/server'
// import connectToDatabase from '@/lib/mongodb'
// import Enrollment from '@/models/Enrollment'
// import Waitlist from '@/models/Waitlist'
// import { getActiveSessionsGrouped } from '@/lib/session-db'

// /**
//  * GET /api/sessions
//  *
//  * Public endpoint — no auth required.
//  * Returns all active sessions grouped by product type, each enriched with
//  * live capacity data so the enrollment modal can show full/available states.
//  *
//  * Response shape:
//  * {
//  *   success: true,
//  *   sessions: {
//  *     "Virtual Masterclass": [
//  *       {
//  *         sessionId, label, dates, time, displayTime, city, venue,
//  *         isTwoDay, capacity,
//  *         confirmedCount,   ← live count from DB
//  *         spotsRemaining,   ← capacity - confirmedCount
//  *         isFull,           ← spotsRemaining === 0
//  *         waitlistCount,    ← how many on active waitlist
//  *       },
//  *       ...
//  *     ],
//  *     ...
//  *   }
//  * }
//  *
//  * Cache: 60s public cache. A spot opening/closing within 60s is fine — the
//  * payment/verify route re-checks capacity server-side before confirming.
//  */
// export async function GET() {
//   try {
//     await connectToDatabase()

//     const grouped = await getActiveSessionsGrouped()

//     // Enrich each session with live enrollment + waitlist counts
//     const enriched: Record<string, unknown[]> = {}

//     for (const [productType, sessions] of Object.entries(grouped)) {
//       enriched[productType] = await Promise.all(
//         sessions.map(async (session) => {
//           const [confirmedCount, waitlistCount] = await Promise.all([
//             Enrollment.countDocuments({
//               'selectedSession.sessionId': session.sessionId,
//               paymentStatus: 'success',
//               bookingStatus: 'confirmed',
//               cancelledAt: { $exists: false },
//             }),
//             Waitlist.countDocuments({
//               sessionId: session.sessionId,
//               status: { $in: ['waiting', 'notified'] },
//             }),
//           ])

//           const spotsRemaining = Math.max(0, session.capacity - confirmedCount)

//           return {
//             ...session,
//             confirmedCount,
//             spotsRemaining,
//             isFull: spotsRemaining === 0,
//             waitlistCount,
//           }
//         }),
//       )
//     }

//     return NextResponse.json(
//       { success: true, sessions: enriched },
//       {
//         status: 200,
//         headers: {
//           'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
//         },
//       },
//     )
//   } catch (err: any) {
//     console.error('[api/sessions] Error:', err)
//     return NextResponse.json(
//       { error: 'Failed to load sessions. Please refresh.' },
//       { status: 500 },
//     )
//   }
// }

import { NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import Enrollment from '@/models/Enrollment'
import Waitlist from '@/models/Waitlist'
import { getActiveSessionsGrouped } from '@/lib/session-db'

/**
 * GET /api/sessions
 *
 * Public endpoint — no auth required.
 * Returns all active sessions grouped by product type, each enriched with
 * live capacity data so the enrollment modal can show full/available states.
 *
 * CAPACITY ACCOUNTING
 * -------------------
 * confirmedCount = paid enrollments (paymentStatus: 'success')
 *                + active manual reservations (reservationType: 'manual_paystack',
 *                  paymentWindowStatus: 'pending' | 'reminded',
 *                  reservationExpiresAt > now)
 *
 * Including pending reservations prevents two users from claiming the same
 * last seat — one via the standard modal and one via the reserve form.
 * Expired reservations are excluded so their seats return to the pool.
 *
 * Response shape:
 * {
 *   success: true,
 *   sessions: {
 *     "Virtual Masterclass": [
 *       {
 *         sessionId, label, dates, time, displayTime, city, venue,
 *         isTwoDay, capacity,
 *         confirmedCount,      ← paid + held reservations
 *         paidCount,           ← paid only (useful for admin)
 *         reservationCount,    ← held-but-unpaid reservations
 *         spotsRemaining,      ← capacity - confirmedCount
 *         isFull,              ← spotsRemaining === 0
 *         waitlistCount,       ← active waitlist entries
 *       },
 *       ...
 *     ],
 *     ...
 *   }
 * }
 *
 * Cache: 60s public cache. The payment/verify route re-checks capacity
 * server-side before confirming so a stale cache never oversells seats.
 */
export async function GET() {
  try {
    await connectToDatabase()

    const grouped = await getActiveSessionsGrouped()
    const now = new Date()

    const enriched: Record<string, unknown[]> = {}

    for (const [productType, sessions] of Object.entries(grouped)) {
      enriched[productType] = await Promise.all(
        sessions.map(async (session) => {
          const [paidCount, reservationCount, waitlistCount] =
            await Promise.all([
              // ── Paid (fully confirmed) enrollments ─────────────────────
              Enrollment.countDocuments({
                'selectedSession.sessionId': session.sessionId,
                paymentStatus: 'success',
                bookingStatus: 'confirmed',
                cancelledAt: { $exists: false },
              }),

              // ── Active manual reservations (seat held, not yet paid) ────
              // Only counts reservations that:
              //   • are manual_paystack type
              //   • are still within the 24-hour payment window
              //   • have not been expired or paid yet
              Enrollment.countDocuments({
                'selectedSession.sessionId': session.sessionId,
                reservationType: 'manual_paystack',
                paymentWindowStatus: { $in: ['pending', 'reminded'] },
                reservationExpiresAt: { $gt: now },
                cancelledAt: { $exists: false },
              }),

              // ── Waitlist (informational only, doesn't affect capacity) ──
              Waitlist.countDocuments({
                sessionId: session.sessionId,
                status: { $in: ['waiting', 'notified'] },
              }),
            ])

          // Total seats consumed = paid + actively held reservations
          const confirmedCount = paidCount + reservationCount
          const spotsRemaining = Math.max(0, session.capacity - confirmedCount)

          return {
            ...session,
            confirmedCount, // total seats consumed (paid + reserved)
            paidCount, // fully confirmed paid enrollments only
            reservationCount, // seats held by pending manual reservations
            spotsRemaining,
            isFull: spotsRemaining === 0,
            waitlistCount,
          }
        }),
      )
    }

    return NextResponse.json(
      { success: true, sessions: enriched },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
        },
      },
    )
  } catch (err: any) {
    console.error('[api/sessions] Error:', err)
    return NextResponse.json(
      { error: 'Failed to load sessions. Please refresh.' },
      { status: 500 },
    )
  }
}
