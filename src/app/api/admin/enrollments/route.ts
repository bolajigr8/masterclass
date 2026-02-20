import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import Enrollment from '@/models/Enrollment'
import { verifyAdminAuth, parsePagination } from '@/lib/adminAuth'

/**
 * GET /api/admin/enrollments
 *
 * Full enrollment list with rich filtering, sorting, and pagination.
 *
 * Query params:
 *   page, limit          — pagination
 *   status               — 'pending' | 'confirmed' | 'cancelled'
 *   tier                 — 'virtual' | 'full' | 'consulting'
 *   productType          — exact match
 *   city                 — partial match on selectedSession.city
 *   sessionId            — exact match
 *   search               — searches name, email, enrollmentReference
 *   sortBy               — 'createdAt' | 'amountPaid' | 'name' (default: createdAt)
 *   sortDir              — 'asc' | 'desc' (default: desc)
 *
 * Requires: Authorization: Bearer <ADMIN_PASSWORD>
 */
export async function GET(request: NextRequest) {
  const authError = verifyAdminAuth(request)
  if (authError) return authError

  try {
    const { searchParams } = new URL(request.url)
    const { page, limit, skip } = parsePagination(searchParams)

    // ── Build filter ──────────────────────────────────────────────────────
    const filter: Record<string, any> = {}

    const status = searchParams.get('status')
    if (status === 'confirmed') {
      filter.paymentStatus = 'success'
      filter.bookingStatus = 'confirmed'
      filter.cancelledAt = { $exists: false }
    } else if (status === 'pending') {
      filter.$or = [{ paymentStatus: 'pending' }, { bookingStatus: 'pending' }]
      filter.cancelledAt = { $exists: false }
    } else if (status === 'cancelled') {
      filter.cancelledAt = { $exists: true }
    }

    const tier = searchParams.get('tier')
    if (tier && ['virtual', 'full', 'consulting'].includes(tier)) {
      filter.accessTier = tier
    }

    const productType = searchParams.get('productType')
    if (productType) {
      filter.productType = productType
    }

    const city = searchParams.get('city')
    if (city) {
      filter['selectedSession.city'] = { $regex: city, $options: 'i' }
    }

    const sessionId = searchParams.get('sessionId')
    if (sessionId) {
      filter['selectedSession.sessionId'] = sessionId
    }

    const search = searchParams.get('search')?.trim()
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { enrollmentReference: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ]
    }

    // ── Sort ──────────────────────────────────────────────────────────────
    const sortBy = searchParams.get('sortBy') ?? 'createdAt'
    const sortDir = searchParams.get('sortDir') === 'asc' ? 1 : -1
    const allowedSortFields = ['createdAt', 'amountPaid', 'name', 'updatedAt']
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt'

    await connectToDatabase()

    const [enrollments, totalCount] = await Promise.all([
      Enrollment.find(filter)
        .select(
          'name email phone city enrollmentReference paymentStatus bookingStatus ' +
            'productType accessTier amountPaid selectedSession ' +
            'checkedInDay1 checkedInDay1At checkedInDay2 checkedInDay2At ' +
            'cancelledAt reminder24hSentAt reminder1hSentAt createdAt updatedAt',
        )
        .sort({ [sortField]: sortDir })
        .skip(skip)
        .limit(limit)
        .lean(),
      Enrollment.countDocuments(filter),
    ])

    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      success: true,
      data: enrollments,
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
    console.error('[admin/enrollments] Error:', err)
    return NextResponse.json(
      {
        error: 'Failed to retrieve enrollments.',
        details:
          process.env.NODE_ENV === 'development' ? err.message : undefined,
      },
      { status: 500 },
    )
  }
}
