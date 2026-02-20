import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import Enrollment from '@/models/Enrollment'
import { verifyAdminAuth } from '@/lib/adminAuth'

/**
 * GET /api/admin/revenue
 *
 * Returns revenue analytics:
 *   - totalRevenue: sum of all confirmed amountPaid
 *   - revenueByTier: breakdown by virtual / full / consulting
 *   - revenueByProduct: breakdown by exact product name
 *   - bookingsOverTime: daily confirmed enrollment counts for the last N days
 *   - revenueOverTime: daily revenue for the last N days
 *   - geographicDistribution: attendee count by session city
 *   - conversionRate: confirmed / (confirmed + pending)
 *
 * Query params:
 *   days — lookback window in days (default 90, max 365)
 *
 * Requires: Authorization: Bearer <ADMIN_PASSWORD>
 */
export async function GET(request: NextRequest) {
  const authError = verifyAdminAuth(request)
  if (authError) return authError

  try {
    const { searchParams } = new URL(request.url)
    const days = Math.min(
      365,
      Math.max(7, parseInt(searchParams.get('days') ?? '90', 10)),
    )

    await connectToDatabase()

    const confirmedFilter = {
      paymentStatus: 'success',
      bookingStatus: 'confirmed',
      cancelledAt: { $exists: false },
    }

    const lookbackDate = new Date()
    lookbackDate.setDate(lookbackDate.getDate() - days)

    // ── Run all aggregations in parallel ───────────────────────────────────
    const [
      totalResult,
      revenueByTier,
      revenueByProduct,
      bookingsOverTime,
      geographicData,
      totalConfirmed,
      totalPending,
      waitlistTotal,
    ] = await Promise.all([
      // Total revenue
      Enrollment.aggregate([
        { $match: confirmedFilter },
        { $group: { _id: null, total: { $sum: '$amountPaid' } } },
      ]),

      // Revenue by access tier
      Enrollment.aggregate([
        { $match: confirmedFilter },
        {
          $group: {
            _id: '$accessTier',
            revenue: { $sum: '$amountPaid' },
            count: { $sum: 1 },
          },
        },
      ]),

      // Revenue by product type
      Enrollment.aggregate([
        { $match: confirmedFilter },
        {
          $group: {
            _id: '$productType',
            revenue: { $sum: '$amountPaid' },
            count: { $sum: 1 },
          },
        },
      ]),

      // Daily bookings + revenue for chart
      Enrollment.aggregate([
        {
          $match: {
            ...confirmedFilter,
            createdAt: { $gte: lookbackDate },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
            },
            count: { $sum: 1 },
            revenue: { $sum: '$amountPaid' },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      // Geographic distribution by session city
      Enrollment.aggregate([
        { $match: confirmedFilter },
        { $match: { 'selectedSession.city': { $exists: true } } },
        {
          $group: {
            _id: '$selectedSession.city',
            count: { $sum: 1 },
            revenue: { $sum: '$amountPaid' },
          },
        },
        { $sort: { count: -1 } },
      ]),

      // Total confirmed
      Enrollment.countDocuments(confirmedFilter),

      // Total pending
      Enrollment.countDocuments({
        $or: [{ paymentStatus: 'pending' }, { bookingStatus: 'pending' }],
        cancelledAt: { $exists: false },
      }),

      // Waitlist is imported below — placeholder here
      Promise.resolve(0),
    ])

    // ── Format results ────────────────────────────────────────────────────
    const totalRevenue = totalResult[0]?.total ?? 0
    const conversionRate =
      totalConfirmed + totalPending > 0
        ? parseFloat(
            ((totalConfirmed / (totalConfirmed + totalPending)) * 100).toFixed(
              2,
            ),
          )
        : 0

    const tierMap: Record<string, { revenue: number; count: number }> = {}
    for (const row of revenueByTier) {
      tierMap[row._id ?? 'unknown'] = { revenue: row.revenue, count: row.count }
    }

    const productMap: Record<string, { revenue: number; count: number }> = {}
    for (const row of revenueByProduct) {
      productMap[row._id ?? 'unknown'] = {
        revenue: row.revenue,
        count: row.count,
      }
    }

    // Fill any missing days in the time series with 0s
    const dateMap: Record<string, { count: number; revenue: number }> = {}
    for (const row of bookingsOverTime) {
      dateMap[row._id] = { count: row.count, revenue: row.revenue }
    }

    const timeSeries: Array<{ date: string; count: number; revenue: number }> =
      []
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const key = d.toISOString().slice(0, 10)
      timeSeries.push({
        date: key,
        count: dateMap[key]?.count ?? 0,
        revenue: dateMap[key]?.revenue ?? 0,
      })
    }

    const geographic = geographicData.map((row) => ({
      city: row._id ?? 'Unknown',
      count: row.count,
      revenue: row.revenue,
    }))

    return NextResponse.json({
      success: true,
      lookbackDays: days,
      summary: {
        totalRevenue,
        totalConfirmed,
        totalPending,
        conversionRate,
        averageOrderValue:
          totalConfirmed > 0
            ? parseFloat((totalRevenue / totalConfirmed).toFixed(0))
            : 0,
      },
      revenueByTier: tierMap,
      revenueByProduct: productMap,
      timeSeries, // array of { date, count, revenue } for charts
      geographic, // array of { city, count, revenue }
    })
  } catch (err: any) {
    console.error('[admin/revenue] Error:', err)
    return NextResponse.json(
      {
        error: 'Revenue query failed.',
        details:
          process.env.NODE_ENV === 'development' ? err.message : undefined,
      },
      { status: 500 },
    )
  }
}
