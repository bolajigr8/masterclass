import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import Enrollment from '@/models/Enrollment'
import { verifyAdminAuth, parsePagination, parseDay } from '@/lib/adminAuth'

/**
 * GET /api/admin/checked-in?sessionId=SESSION_ID&day=1&page=1&limit=20
 *
 * Returns attendees who have successfully checked in on the specified day.
 * day=1 → filters checkedInDay1: true
 * day=2 → filters checkedInDay2: true
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

    const day = parseDay(searchParams)
    const { page, limit, skip } = parsePagination(searchParams)

    await connectToDatabase()

    // Filter on the correct day field
    const checkedInField = day === 1 ? 'checkedInDay1' : 'checkedInDay2'

    const filter = {
      'selectedSession.sessionId': sessionId,
      paymentStatus: 'success',
      bookingStatus: 'confirmed',
      accessTier: 'full',
      [checkedInField]: true,
    }

    const [attendees, totalCount] = await Promise.all([
      Enrollment.find(filter)
        .select(
          'name email phone enrollmentReference productType selectedSession ' +
            'checkedInDay1 checkedInDay1At checkedInDay2 checkedInDay2At',
        )
        .sort({ [`${checkedInField}At`]: -1 })
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
