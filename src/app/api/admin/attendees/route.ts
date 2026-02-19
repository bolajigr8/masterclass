import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import Enrollment from '@/models/Enrollment'
import { verifyAdminAuth, parsePagination, parseDay } from '@/lib/adminAuth'

/**
 * GET /api/admin/attendees?sessionId=SESSION_ID&day=1&page=1&limit=20
 *
 * Returns all live-access (full, payment confirmed) attendees for a session.
 * The `day` param (1|2) determines which check-in fields are highlighted
 * in the response — both checkedInDay1 and checkedInDay2 are always returned
 * so the frontend can show full status.
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

    const { page, limit, skip } = parsePagination(searchParams)

    await connectToDatabase()

    const filter = {
      'selectedSession.sessionId': sessionId,
      paymentStatus: 'success',
      bookingStatus: 'confirmed',
      accessTier: 'full',
    }

    const [attendees, totalCount] = await Promise.all([
      Enrollment.find(filter)
        .select(
          'name email phone enrollmentReference productType selectedSession accessTier ' +
            'checkedInDay1 checkedInDay1At checkedInDay2 checkedInDay2At createdAt',
        )
        .sort({ createdAt: -1 })
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
    console.error('[admin/attendees] Error:', error)
    return NextResponse.json(
      {
        error: 'Failed to retrieve attendees.',
        details:
          process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 },
    )
  }
}
