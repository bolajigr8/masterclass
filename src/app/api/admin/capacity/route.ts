import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import Enrollment from '@/models/Enrollment'
import { verifyAdminAuth } from '@/lib/adminAuth'
import { getAllSessionsFromDB } from '@/lib/session-db'
import Waitlist from '@/models/Waitlist'

/**
 * GET /api/admin/capacity
 *
 * Returns current capacity status for every session in the database:
 * confirmed count, capacity limit, spots remaining, waitlist depth.
 * Sessions are now stored in MongoDB — not the static session-config.ts file.
 *
 * Requires: Authorization: Bearer <ADMIN_PASSWORD>
 */
export async function GET(request: NextRequest) {
  const authError = verifyAdminAuth(request)
  if (authError) return authError

  try {
    await connectToDatabase()

    // Read from DB — includes both active and archived sessions so
    // admin can see the full capacity picture
    const grouped = await getAllSessionsFromDB()
    const allSessions = Object.values(grouped).flat()

    const results = await Promise.all(
      allSessions.map(async (session) => {
        const [confirmedCount, waitlistCount] = await Promise.all([
          Enrollment.countDocuments({
            'selectedSession.sessionId': session.sessionId,
            paymentStatus: 'success',
            bookingStatus: 'confirmed',
            cancelledAt: { $exists: false },
          }),
          Waitlist.countDocuments({
            sessionId: session.sessionId,
            status: { $in: ['waiting', 'notified'] },
          }),
        ])

        const spotsRemaining = Math.max(0, session.capacity - confirmedCount)

        return {
          sessionId: session.sessionId,
          label: session.label,
          productType: session.productType,
          city: session.city,
          dates: session.dates,
          capacity: session.capacity,
          isActive: session.isActive,
          confirmedCount,
          spotsRemaining,
          isFull: spotsRemaining === 0,
          waitlistCount,
        }
      }),
    )

    return NextResponse.json({ success: true, sessions: results })
  } catch (err: any) {
    console.error('[admin/capacity] Error:', err)
    return NextResponse.json(
      { error: 'Failed to retrieve capacity data.' },
      { status: 500 },
    )
  }
}
