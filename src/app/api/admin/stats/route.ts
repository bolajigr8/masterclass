import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import Enrollment from '@/models/Enrollment'
import { verifyAdminAuth } from '@/lib/adminAuth'

/**
 * GET /api/admin/stats?sessionId=SESSION_ID
 *
 * Returns session-level attendance statistics, tracking Day 1 and Day 2
 * check-ins separately (required for Signature Live 2-day events).
 *
 * Requires: Authorization: Bearer <ADMIN_PASSWORD>
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

    const confirmedBase = {
      'selectedSession.sessionId': sessionId,
      paymentStatus: 'success',
      bookingStatus: 'confirmed',
    }

    // Run all counts in parallel
    const [
      totalLiveRegistered,
      totalCheckedInDay1,
      totalCheckedInDay2,
      totalVirtual,
      totalConsulting,
    ] = await Promise.all([
      Enrollment.countDocuments({ ...confirmedBase, accessTier: 'full' }),
      Enrollment.countDocuments({
        ...confirmedBase,
        accessTier: 'full',
        checkedInDay1: true,
      }),
      Enrollment.countDocuments({
        ...confirmedBase,
        accessTier: 'full',
        checkedInDay2: true,
      }),
      Enrollment.countDocuments({ ...confirmedBase, accessTier: 'virtual' }),
      Enrollment.countDocuments({ ...confirmedBase, accessTier: 'consulting' }),
    ])

    const totalNotCheckedInDay1 = totalLiveRegistered - totalCheckedInDay1
    const totalNotCheckedInDay2 = totalLiveRegistered - totalCheckedInDay2

    const checkInRateDay1 =
      totalLiveRegistered > 0
        ? parseFloat(
            ((totalCheckedInDay1 / totalLiveRegistered) * 100).toFixed(2),
          )
        : 0

    const checkInRateDay2 =
      totalLiveRegistered > 0
        ? parseFloat(
            ((totalCheckedInDay2 / totalLiveRegistered) * 100).toFixed(2),
          )
        : 0

    return NextResponse.json(
      {
        success: true,
        sessionId,
        stats: {
          totalLiveRegistered,
          totalCheckedInDay1,
          totalCheckedInDay2,
          totalNotCheckedInDay1,
          totalNotCheckedInDay2,
          checkInRateDay1, // e.g. 75.50 (percentage)
          checkInRateDay2,
          totalVirtual,
          totalConsulting,
          totalAllAccess: totalLiveRegistered + totalVirtual + totalConsulting,
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
