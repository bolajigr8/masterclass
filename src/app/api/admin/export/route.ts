import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import Enrollment from '@/models/Enrollment'
import { verifyAdminAuth } from '@/lib/adminAuth'

/**
 * GET /api/admin/export?status=confirmed&tier=full&sessionId=...
 *
 * Exports all matching enrollments as a downloadable CSV.
 * Accepts the same filter params as /api/admin/enrollments.
 * No pagination — exports everything matching the filter.
 *
 * Requires: Authorization: Bearer <ADMIN_PASSWORD>
 */
export async function GET(request: NextRequest) {
  const authError = verifyAdminAuth(request)
  if (authError) return authError

  try {
    const { searchParams } = new URL(request.url)

    // ── Same filter logic as enrollments route ────────────────────────────
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
    if (productType) filter.productType = productType

    const city = searchParams.get('city')
    if (city) filter['selectedSession.city'] = { $regex: city, $options: 'i' }

    const sessionId = searchParams.get('sessionId')
    if (sessionId) filter['selectedSession.sessionId'] = sessionId

    const search = searchParams.get('search')?.trim()
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { enrollmentReference: { $regex: search, $options: 'i' } },
      ]
    }

    await connectToDatabase()

    // Limit export to 5000 rows as a safety cap
    const enrollments = await Enrollment.find(filter)
      .sort({ createdAt: -1 })
      .limit(5000)
      .lean()

    // ── Build CSV ──────────────────────────────────────────────────────────
    const headers = [
      'Reference',
      'Name',
      'Email',
      'Phone',
      'City',
      'Product',
      'Access Tier',
      'Payment Status',
      'Booking Status',
      'Amount Paid (NGN)',
      'Session ID',
      'Session City',
      'Session Venue',
      'Session Dates',
      'Checked In Day 1',
      'Day 1 Check-In Time',
      'Checked In Day 2',
      'Day 2 Check-In Time',
      'Cancelled',
      'Registered At',
    ]

    function esc(val: string | undefined | null): string {
      if (val === null || val === undefined) return ''
      const str = String(val)
      // Wrap in quotes if the value contains commas, quotes, or newlines
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`
      }
      return str
    }

    function fmtDate(d: string | Date | undefined): string {
      if (!d) return ''
      return new Date(d).toISOString().replace('T', ' ').slice(0, 19)
    }

    const rows = enrollments.map((e) => {
      const sess = e.selectedSession
      return [
        esc(e.enrollmentReference),
        esc(e.name),
        esc(e.email),
        esc(e.phone),
        esc(e.city),
        esc(e.productType),
        esc(e.accessTier),
        esc(e.paymentStatus),
        esc(e.bookingStatus),
        esc(String(e.amountPaid ?? 0)),
        esc(sess?.sessionId),
        esc(sess?.city),
        esc(sess?.venue),
        esc(sess?.dates?.join(' | ')),
        esc(e.checkedInDay1 ? 'Yes' : 'No'),
        esc(fmtDate(e.checkedInDay1At as any)),
        esc(e.checkedInDay2 ? 'Yes' : 'No'),
        esc(fmtDate(e.checkedInDay2At as any)),
        esc(e.cancelledAt ? 'Yes' : 'No'),
        esc(fmtDate(e.createdAt as any)),
      ].join(',')
    })

    const csv = [headers.join(','), ...rows].join('\n')
    const timestamp = new Date().toISOString().slice(0, 10)
    const filename = `Trila-enrollments-${timestamp}.csv`

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (err: any) {
    console.error('[admin/export] Error:', err)
    return NextResponse.json(
      {
        error: 'Export failed.',
        details:
          process.env.NODE_ENV === 'development' ? err.message : undefined,
      },
      { status: 500 },
    )
  }
}
