import Enrollment from '@/models/Enrollment'
import Waitlist from '@/models/Waitlist'
import { sendWaitlistSpotAvailableEmail } from '@/lib/email'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://Trila.co'
const CONFIRMATION_HOURS = 24

/**
 * Calculates how many waitlist spots are currently uncontested for a session.
 *
 * A seat is "claimed" by any of:
 *   1. A confirmed paid enrollment
 *   2. An active manual_paystack reservation within its 24h window
 *   3. A waitlist entry currently in 'notified' state (person has a live offer)
 *
 * We include (3) because if we didn't, increasing capacity by 1 when someone is
 * already in 'notified' state would trigger a second notification — both could
 * pay simultaneously and oversell the session.
 *
 * Returns the number of seats that can safely be offered to new waitlist people.
 */
export async function countAvailableWaitlistSlots(
  sessionId: string,
  capacity: number,
): Promise<number> {
  const now = new Date()

  const [paidCount, reservationCount, notifiedCount] = await Promise.all([
    // Confirmed paid enrollments
    Enrollment.countDocuments({
      'selectedSession.sessionId': sessionId,
      paymentStatus: 'success',
      bookingStatus: 'confirmed',
      cancelledAt: { $exists: false },
    }),

    // Active manual_paystack reservations within their 24h window
    Enrollment.countDocuments({
      'selectedSession.sessionId': sessionId,
      reservationType: 'manual_paystack',
      paymentWindowStatus: { $in: ['pending', 'reminded'] },
      reservationExpiresAt: { $gt: now },
      cancelledAt: { $exists: false },
    }),

    // Waitlist people who already have an active spot offer (not yet paid/expired)
    Waitlist.countDocuments({
      sessionId,
      status: 'notified',
      confirmationExpiresAt: { $gt: now },
    }),
  ])

  const totalClaimed = paidCount + reservationCount + notifiedCount
  return Math.max(0, capacity - totalClaimed)
}

/**
 * Promotes the next `waiting` person(s) on the waitlist for a given session.
 *
 * Called in two situations:
 *   A. Immediately after admin increases session capacity (PUT /api/admin/sessions/:id)
 *   B. After a notified entry expires without payment (cron /api/cron/process-waitlist)
 *
 * For each available slot, the next person in queue (lowest position) is:
 *   - moved from 'waiting' → 'notified'
 *   - given a 24h confirmation window
 *   - sent the "spot available" email with their unique confirm link
 *
 * The loop promotes at most `availableSlots` people. In practice this is usually
 * 1, but handles admin increasing capacity by more than 1 in one go.
 *
 * Returns a summary of what happened — useful for logging in callers.
 */
export async function promoteWaitlistForSession(
  sessionId: string,
  capacity: number,
  sessionLabel: string,
): Promise<{ promoted: number; errors: string[] }> {
  const now = new Date()
  const errors: string[] = []
  let promoted = 0

  // How many slots can we actually fill?
  const availableSlots = await countAvailableWaitlistSlots(sessionId, capacity)

  if (availableSlots <= 0) {
    return { promoted: 0, errors: [] }
  }

  // Promote one person per available slot, in queue order
  for (let i = 0; i < availableSlots; i++) {
    const next = await Waitlist.findOne(
      { sessionId, status: 'waiting' },
      null,
      { sort: { position: 1 } },
    )

    if (!next) break // No more people waiting

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
        sessionLabel,
        confirmUrl,
        expiresInHours: CONFIRMATION_HOURS,
      })
      promoted++
    } catch (err: any) {
      // Email failed — but the status is already 'notified'.
      // Log the error; the cron will catch it on the next pass if needed.
      errors.push(`Email failed for ${next.email}: ${err.message}`)
      console.error(
        `[waitlist-helpers] Spot available email failed for ${next.email}:`,
        err,
      )
    }
  }

  return { promoted, errors }
}
