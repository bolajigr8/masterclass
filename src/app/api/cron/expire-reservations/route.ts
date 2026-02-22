import { NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import Enrollment from '@/models/Enrollment'
import { sendReservationReminder, sendReservationExpired } from '@/lib/email'
import { findSessionByIdFromDB } from '@/lib/session-db'
import { promoteWaitlistForSession } from '@/lib/waitlist-helpers'

/**
 * GET /api/cron/expire-reservations
 *
 * Scheduled cron job — runs every 30 minutes (see vercel.json).
 * Protected by CRON_SECRET (Vercel automatically sends this as a header).
 *
 * Two responsibilities per run:
 *
 *   1. REMINDER — find pending reservations that are between 3h and 4h from
 *      expiry and have not yet received a reminder. Send the reminder email
 *      and set reminderSentAt + paymentWindowStatus = 'reminded'.
 *
 *   2. EXPIRY — find reservations whose reservationExpiresAt has passed and
 *      are still pending/reminded (i.e. not paid, not already expired).
 *      Mark them expired, clear the token, and send an expiry notification.
 *
 * The reminder window (3h–4h before expiry) ensures users get at least one
 * nudge within the 24-hour window regardless of cron timing variance.
 * The 1-hour band (not a single point in time) prevents the reminder from
 * being skipped if the cron fires slightly late.
 */
export async function GET(request: Request) {
  // ── Auth ───────────────────────────────────────────────────────────────────
  const authHeader = request.headers.get('authorization')
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  }

  try {
    await connectToDatabase()

    const now = new Date()

    // ── 1. Send reminder emails ────────────────────────────────────────────
    //
    // Targets:
    //   - reservationType = 'manual_paystack'
    //   - paymentWindowStatus = 'pending'   (not yet reminded)
    //   - reminderSentAt does not exist     (belt-and-suspenders)
    //   - reservationExpiresAt is between now+3h and now+4h
    //     → user has ~3–4 hours left; sense of urgency without being too early
    //
    const reminderWindowStart = new Date(now.getTime() + 3 * 60 * 60 * 1000) // now + 3h
    const reminderWindowEnd = new Date(now.getTime() + 4 * 60 * 60 * 1000) // now + 4h

    const toRemind = await Enrollment.find({
      reservationType: 'manual_paystack',
      paymentWindowStatus: 'pending',
      reminderSentAt: { $exists: false },
      reservationExpiresAt: {
        $gt: reminderWindowStart,
        $lte: reminderWindowEnd,
      },
      cancelledAt: { $exists: false },
    })

    const reminderResults = await Promise.allSettled(
      toRemind.map(async (enrollment) => {
        try {
          await sendReservationReminder({
            name: enrollment.name,
            email: enrollment.email,
            enrollmentReference: enrollment.enrollmentReference,
            productType: enrollment.productType ?? 'Masterclass',
            reservationToken: enrollment.reservationToken!,
            expiresAt: enrollment.reservationExpiresAt!,
          })

          enrollment.paymentWindowStatus = 'reminded'
          enrollment.reminderSentAt = now
          await enrollment.save()

          return {
            enrollmentReference: enrollment.enrollmentReference,
            sent: true,
          }
        } catch (err) {
          console.error(
            `[cron/expire-reservations] Reminder failed for ${enrollment.enrollmentReference}:`,
            err,
          )
          return {
            enrollmentReference: enrollment.enrollmentReference,
            sent: false,
          }
        }
      }),
    )

    // ── 2. Expire overdue reservations ────────────────────────────────────
    //
    // Targets:
    //   - reservationType = 'manual_paystack'
    //   - paymentWindowStatus = 'pending' OR 'reminded'  (not yet expired/paid)
    //   - reservationExpiresAt < now
    //
    const toExpire = await Enrollment.find({
      reservationType: 'manual_paystack',
      paymentWindowStatus: { $in: ['pending', 'reminded'] },
      reservationExpiresAt: { $lt: now },
      cancelledAt: { $exists: false },
    })

    const expiryResults = await Promise.allSettled(
      toExpire.map(async (enrollment) => {
        try {
          // Mark expired first, then $unset the token so the sparse index
          // stays clean and the link is dead immediately. We do this with
          // two operations: save() for the status, then updateOne for $unset,
          // because Mongoose doesn't honour setting a field to undefined in save().
          enrollment.paymentWindowStatus = 'expired'
          await enrollment.save()
          await enrollment.updateOne({ $unset: { reservationToken: '' } })

          await sendReservationExpired({
            name: enrollment.name,
            email: enrollment.email,
            productType: enrollment.productType ?? 'Masterclass',
          })

          // ── Waitlist promotion ──────────────────────────────────────────
          // This reservation held a seat. Now that it has expired, that seat
          // is free — notify the next person on the waitlist immediately
          // rather than waiting for the process-waitlist cron to run.
          //
          // We only attempt this if the enrollment had a session assigned.
          // promoteWaitlistForSession uses countAvailableWaitlistSlots which
          // accounts for paid enrollments + active reservations + already-
          // notified waitlist entries, so it is safe to call even if multiple
          // reservations for the same session expire in the same cron run —
          // each call re-queries and will only promote what is actually free.
          const sessionId = enrollment.selectedSession?.sessionId
          if (sessionId) {
            const sessionConfig = await findSessionByIdFromDB(sessionId)
            if (sessionConfig) {
              promoteWaitlistForSession(
                sessionId,
                sessionConfig.capacity,
                sessionConfig.label,
              )
                .then(({ promoted, errors: promoteErrors }) => {
                  if (promoted > 0) {
                    console.log(
                      `[cron/expire-reservations] Reservation expired for ` +
                        `${enrollment.enrollmentReference} — notified ` +
                        `${promoted} waitlist ${promoted === 1 ? 'person' : 'people'} ` +
                        `for session "${sessionId}".`,
                    )
                  }
                  if (promoteErrors.length > 0) {
                    console.error(
                      `[cron/expire-reservations] Waitlist email errors for "${sessionId}":`,
                      promoteErrors,
                    )
                  }
                })
                .catch((err) => {
                  // Never let a waitlist error prevent the expiry result from
                  // being counted — log it and move on.
                  console.error(
                    `[cron/expire-reservations] Waitlist promotion error for "${sessionId}":`,
                    err,
                  )
                })
            }
          }

          return {
            enrollmentReference: enrollment.enrollmentReference,
            expired: true,
          }
        } catch (err) {
          console.error(
            `[cron/expire-reservations] Expiry failed for ${enrollment.enrollmentReference}:`,
            err,
          )
          return {
            enrollmentReference: enrollment.enrollmentReference,
            expired: false,
          }
        }
      }),
    )

    // ── Summary response ───────────────────────────────────────────────────
    const remindersSent = reminderResults.filter(
      (r) => r.status === 'fulfilled' && r.value.sent,
    ).length
    const expiredCount = expiryResults.filter(
      (r) => r.status === 'fulfilled' && r.value.expired,
    ).length

    console.log(
      `[cron/expire-reservations] run at ${now.toISOString()} — ` +
        `reminders sent: ${remindersSent}/${toRemind.length}, ` +
        `expired: ${expiredCount}/${toExpire.length}`,
    )

    return NextResponse.json(
      {
        success: true,
        processedAt: now.toISOString(),
        reminders: { found: toRemind.length, sent: remindersSent },
        expirations: { found: toExpire.length, expired: expiredCount },
      },
      { status: 200 },
    )
  } catch (err: any) {
    console.error('[cron/expire-reservations] Fatal error:', err)
    return NextResponse.json(
      {
        error: 'Cron job failed.',
        details:
          process.env.NODE_ENV === 'development' ? err.message : undefined,
      },
      { status: 500 },
    )
  }
}
