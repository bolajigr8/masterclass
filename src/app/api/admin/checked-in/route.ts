import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import Enrollment from '@/models/Enrollment'
import { verifyAdminAuth, parsePagination } from '@/lib/adminAuth'

/**
 * GET /api/admin/checked-in?sessionId=SESSION_ID&page=1&limit=20
 *
 * Returns attendees who have successfully checked in for the given session.
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

    const { page, limit, skip } = parsePagination(searchParams)

    await connectToDatabase()

    const filter = {
      'selectedSession.sessionId': sessionId,
      paymentStatus: 'success',
      bookingStatus: 'confirmed',
      accessTier: 'full',
      checkedIn: true,
    }

    const [attendees, totalCount] = await Promise.all([
      Enrollment.find(filter)
        .select(
          'name email phone enrollmentReference productType selectedSession checkedIn checkedInAt',
        )
        .sort({ checkedInAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Enrollment.countDocuments(filter),
    ])

    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json(
      {
        success: true,
        data: attendees,
        meta: {
          page,
          limit,
          totalCount,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
      { status: 200 },
    )
  } catch (error: any) {
    console.error('[admin/checked-in] Error:', error)
    return NextResponse.json(
      {
        error: 'Failed to retrieve checked-in attendees.',
        details:
          process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 },
    )
  }
}
