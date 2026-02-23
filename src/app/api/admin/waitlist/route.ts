import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import Waitlist from '@/models/Waitlist'
import { verifyAdminAuth, parsePagination } from '@/lib/adminAuth'

/**
 * GET /api/admin/waitlist?sessionId=&status=waiting&page=1
 *
 * Returns the waitlist for a given session, ordered by position.
 * Optional `status` filter: waiting | notified | converted | expired | removed
 *
 * Requires: Authorization: Bearer <ADMIN_PASSWORD>
 */
export async function GET(request: NextRequest) {
  const authError = verifyAdminAuth(request)
  if (authError) return authError

  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')
    const status = searchParams.get('status')
    const { page, limit, skip } = parsePagination(searchParams)

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId is required.' },
        { status: 400 },
      )
    }

    const filter: Record<string, any> = { sessionId }
    if (status) {
      filter.status = status
    }

    await connectToDatabase()

    const [entries, totalCount] = await Promise.all([
      Waitlist.find(filter)
        .select(
          'name email phone city productType sessionId position status notifiedAt confirmationExpiresAt convertedEnrollmentReference createdAt',
        )
        .sort({ position: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Waitlist.countDocuments(filter),
    ])

    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      success: true,
      data: entries,
      meta: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    })
  } catch (err: any) {
    console.error('[admin/waitlist] Error:', err)
    return NextResponse.json(
      { error: 'Failed to retrieve waitlist.' },
      { status: 500 },
    )
  }
}
