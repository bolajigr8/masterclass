// import { NextResponse } from 'next/server'
// import connectToDatabase from '@/lib/mongodb'
// import Enrollment from '@/models/Enrollment'
// import { findSessionByIdFromDB } from '@/lib/session-db'
// import type { ProductType } from '@/lib/validations'

// /**
//  * POST /api/reserve/confirm
//  *
//  * Called when the user clicks "Complete Payment" in the reservation email.
//  * Validates the token, checks the window hasn't expired, and returns the
//  * pre-filled enrollment data needed to open the payment modal without
//  * requiring the user to re-register.
//  *
//  * The enrollment modal receives:
//  *   - initialFormData        → pre-fills name / email / phone / city
//  *   - initialProduct         → pre-selects the product
//  *   - initialEnrollmentRef   → skips /api/register entirely
//  *   - sessionId / sessionLabel → passed as waitlistConfirmData so the modal
//  *                               locks to the originally-reserved session
//  *                               and bypasses the "session full" guard
//  *                               (the seat is already held for this user)
//  *
//  * Body:
//  *   token  string  required — the 64-char hex token from the email link
//  *
//  * Responses:
//  *   200  { success, expiresAt, reservationData }
//  *   400  missing / malformed token
//  *   404  token not found
//  *   409  already paid
//  *   410  reservation expired or cancelled
//  */
// export async function POST(request: Request) {
//   try {
//     const body = await request.json()
//     const { token } = body

//     if (!token || typeof token !== 'string' || token.length < 60) {
//       return NextResponse.json(
//         { error: 'Invalid reservation token.' },
//         { status: 400 },
//       )
//     }

//     await connectToDatabase()

//     const enrollment = await Enrollment.findOne({
//       reservationToken: token.trim(),
//     })

//     // ── Token not found ────────────────────────────────────────────────────
//     if (!enrollment) {
//       return NextResponse.json(
//         {
//           error: 'Token not found.',
//           details:
//             'This payment link is invalid or has already been used. Please contact support.',
//         },
//         { status: 404 },
//       )
//     }

//     // ── Already paid ───────────────────────────────────────────────────────
//     if (
//       enrollment.paymentStatus === 'success' ||
//       enrollment.paymentWindowStatus === 'paid'
//     ) {
//       return NextResponse.json(
//         {
//           error: 'Already paid.',
//           details:
//             'Payment for this reservation has already been completed. Check your email for your confirmation.',
//         },
//         { status: 409 },
//       )
//     }

//     // ── Expired ────────────────────────────────────────────────────────────
//     if (enrollment.paymentWindowStatus === 'expired') {
//       return NextResponse.json(
//         {
//           error: 'Reservation expired.',
//           details:
//             'Your 24-hour payment window has passed and the seat has been released. You are welcome to reserve again.',
//         },
//         { status: 410 },
//       )
//     }

//     // ── Cancelled / unexpected state ───────────────────────────────────────
//     if (enrollment.cancelledAt) {
//       return NextResponse.json(
//         {
//           error: 'Reservation cancelled.',
//           details:
//             'This reservation has been cancelled. Please contact support.',
//         },
//         { status: 410 },
//       )
//     }

//     // ── Live expiry check (belt-and-suspenders; cron may not have run yet) ─
//     if (
//       enrollment.reservationExpiresAt &&
//       new Date() > enrollment.reservationExpiresAt
//     ) {
//       enrollment.paymentWindowStatus = 'expired'
//       await enrollment.save()

//       return NextResponse.json(
//         {
//           error: 'Reservation expired.',
//           details:
//             'Your 24-hour payment window has passed and the seat has been released. You are welcome to reserve again.',
//         },
//         { status: 410 },
//       )
//     }

//     // ── Resolve session label for the modal ────────────────────────────────
//     const sessionConfig = enrollment.selectedSession?.sessionId
//       ? await findSessionByIdFromDB(enrollment.selectedSession.sessionId)
//       : null

//     // ── All good — return data for the modal ───────────────────────────────
//     return NextResponse.json({
//       success: true,
//       expiresAt: enrollment.reservationExpiresAt?.toISOString() ?? null,
//       reservationData: {
//         // Used for initialFormData prop on EnrollmentModal
//         name: enrollment.name,
//         email: enrollment.email,
//         phone: enrollment.phone,
//         city: enrollment.city ?? '',

//         // Used for initialProduct prop
//         productType: enrollment.productType as ProductType,

//         // Used for initialEnrollmentReference prop — skips /api/register
//         enrollmentReference: enrollment.enrollmentReference,

//         // Passed as waitlistConfirmData so modal locks to this session
//         // and bypasses the "session full" capacity guard
//         sessionId: enrollment.selectedSession?.sessionId ?? '',
//         sessionLabel:
//           sessionConfig?.label ?? enrollment.productType ?? 'Your Session',
//       },
//     })
//   } catch (err: any) {
//     console.error('[reserve/confirm] Error:', err)
//     return NextResponse.json(
//       { error: 'Confirmation failed. Please try again.' },
//       { status: 500 },
//     )
//   }
// }

import { NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import Enrollment from '@/models/Enrollment'
import { findSessionByIdFromDB } from '@/lib/session-db'
import { promoteWaitlistForSession } from '@/lib/waitlist-helpers'
import type { ProductType } from '@/lib/validations'

/**
 * POST /api/reserve/confirm
 *
 * Called when the user clicks "Complete Payment" in the reservation email.
 * Validates the token, checks the window hasn't expired, and returns the
 * pre-filled enrollment data needed to open the payment modal without
 * requiring the user to re-register.
 *
 * The enrollment modal receives:
 *   - initialFormData        → pre-fills name / email / phone / city
 *   - initialProduct         → pre-selects the product
 *   - initialEnrollmentRef   → skips /api/register entirely
 *   - sessionId / sessionLabel → passed as waitlistConfirmData so the modal
 *                               locks to the originally-reserved session
 *                               and bypasses the "session full" guard
 *                               (the seat is already held for this user)
 *
 * Body:
 *   token  string  required — the 64-char hex token from the email link
 *
 * Responses:
 *   200  { success, expiresAt, reservationData }
 *   400  missing / malformed token
 *   404  token not found
 *   409  already paid
 *   410  reservation expired or cancelled
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { token } = body

    if (!token || typeof token !== 'string' || token.length < 60) {
      return NextResponse.json(
        { error: 'Invalid reservation token.' },
        { status: 400 },
      )
    }

    await connectToDatabase()

    const enrollment = await Enrollment.findOne({
      reservationToken: token.trim(),
    })

    // ── Token not found ────────────────────────────────────────────────────
    if (!enrollment) {
      return NextResponse.json(
        {
          error: 'Token not found.',
          details:
            'This payment link is invalid or has already been used. Please contact support.',
        },
        { status: 404 },
      )
    }

    // ── Already paid ───────────────────────────────────────────────────────
    if (
      enrollment.paymentStatus === 'success' ||
      enrollment.paymentWindowStatus === 'paid'
    ) {
      return NextResponse.json(
        {
          error: 'Already paid.',
          details:
            'Payment for this reservation has already been completed. Check your email for your confirmation.',
        },
        { status: 409 },
      )
    }

    // ── Expired ────────────────────────────────────────────────────────────
    if (enrollment.paymentWindowStatus === 'expired') {
      return NextResponse.json(
        {
          error: 'Reservation expired.',
          details:
            'Your 24-hour payment window has passed and the seat has been released. You are welcome to reserve again.',
        },
        { status: 410 },
      )
    }

    // ── Cancelled / unexpected state ───────────────────────────────────────
    if (enrollment.cancelledAt) {
      return NextResponse.json(
        {
          error: 'Reservation cancelled.',
          details:
            'This reservation has been cancelled. Please contact support.',
        },
        { status: 410 },
      )
    }

    // ── Live expiry check (belt-and-suspenders; cron may not have run yet) ─
    if (
      enrollment.reservationExpiresAt &&
      new Date() > enrollment.reservationExpiresAt
    ) {
      enrollment.paymentWindowStatus = 'expired'
      await enrollment.save()

      // Bug #5 fix: promote the next waitlist person immediately rather than
      // waiting up to 30 minutes for the cron to discover this expired seat.
      // This runs non-blocking so it doesn't delay the 410 response.
      const expiredSessionId = enrollment.selectedSession?.sessionId
      if (expiredSessionId) {
        findSessionByIdFromDB(expiredSessionId)
          .then((cfg) => {
            if (cfg) {
              promoteWaitlistForSession(
                expiredSessionId,
                cfg.capacity,
                cfg.label,
              ).catch((err) =>
                console.error(
                  '[reserve/confirm] Waitlist promotion after inline expiry failed:',
                  err,
                ),
              )
            }
          })
          .catch((err) =>
            console.error(
              '[reserve/confirm] Session fetch for waitlist promotion failed:',
              err,
            ),
          )
      }

      return NextResponse.json(
        {
          error: 'Reservation expired.',
          details:
            'Your 24-hour payment window has passed and the seat has been released. You are welcome to reserve again.',
        },
        { status: 410 },
      )
    }

    // ── Resolve session label for the modal ────────────────────────────────
    const sessionConfig = enrollment.selectedSession?.sessionId
      ? await findSessionByIdFromDB(enrollment.selectedSession.sessionId)
      : null

    // ── All good — return data for the modal ───────────────────────────────
    return NextResponse.json({
      success: true,
      expiresAt: enrollment.reservationExpiresAt?.toISOString() ?? null,
      reservationData: {
        // Used for initialFormData prop on EnrollmentModal
        name: enrollment.name,
        email: enrollment.email,
        phone: enrollment.phone,
        city: enrollment.city ?? '',

        // Used for initialProduct prop
        productType: enrollment.productType as ProductType,

        // Used for initialEnrollmentReference prop — skips /api/register
        enrollmentReference: enrollment.enrollmentReference,

        // Passed as waitlistConfirmData so modal locks to this session
        // and bypasses the "session full" capacity guard
        sessionId: enrollment.selectedSession?.sessionId ?? '',
        sessionLabel:
          sessionConfig?.label ?? enrollment.productType ?? 'Your Session',
      },
    })
  } catch (err: any) {
    console.error('[reserve/confirm] Error:', err)
    return NextResponse.json(
      { error: 'Confirmation failed. Please try again.' },
      { status: 500 },
    )
  }
}
