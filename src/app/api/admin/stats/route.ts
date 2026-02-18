import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import Enrollment from '@/models/Enrollment'
import { verifyAdminAuth } from '@/lib/adminAuth'

/**
 * GET /api/admin/stats?sessionId=SESSION_ID
 *
 * Returns session-level attendance statistics:
 *   - totalRegistered: full-access confirmed attendees
 *   - totalCheckedIn: how many have checked in
 *   - totalNotCheckedIn: how many have not checked in
 *   - checkInRate: percentage (0-100, 2 decimal places)
 *   - virtualAttendees: confirmed virtual-access count
 *
 * Requires:  Authorization: Bearer <ADMIN_PASSWORD>
 */
export async function GET(request: NextRequest) {
  const authError = verifyAdminAuth(request)
  if (authError) return authError

  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId query parameter is required.' },
        { status: 400 },
      )
    }

    await connectToDatabase()

    const baseFilter = {
      'selectedSession.sessionId': sessionId,
      paymentStatus: 'success',
      bookingStatus: 'confirmed',
    }

    // Run all counts in parallel for efficiency
    const [totalLiveRegistered, totalCheckedIn, totalVirtual] =
      await Promise.all([
        Enrollment.countDocuments({ ...baseFilter, accessTier: 'full' }),
        Enrollment.countDocuments({
          ...baseFilter,
          accessTier: 'full',
          checkedIn: true,
        }),
        Enrollment.countDocuments({ ...baseFilter, accessTier: 'virtual' }),
      ])

    const totalNotCheckedIn = totalLiveRegistered - totalCheckedIn
    const checkInRate =
      totalLiveRegistered > 0
        ? parseFloat(((totalCheckedIn / totalLiveRegistered) * 100).toFixed(2))
        : 0

    return NextResponse.json(
      {
        success: true,
        sessionId,
        stats: {
          totalLiveRegistered,
          totalCheckedIn,
          totalNotCheckedIn,
          checkInRate, // percentage e.g. 75.50
          totalVirtual,
          totalAllAccess: totalLiveRegistered + totalVirtual,
        },
      },
      { status: 200 },
    )
  } catch (error: any) {
    console.error('[admin/stats] Error:', error)
    return NextResponse.json(
      {
        error: 'Failed to retrieve session statistics.',
        details:
          process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 },
    )
  }
}
