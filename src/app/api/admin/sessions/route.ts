import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import Enrollment from '@/models/Enrollment'
import { verifyAdminAuth } from '@/lib/adminAuth'
import SessionConfig from '@/models/Sessionconfig'
import Waitlist from '@/models/Waitlist'
import { buildDisplayTime, generateSessionId } from '@/lib/session-db'

/**
 * GET /api/admin/sessions
 *
 * Returns all sessions (active + archived) grouped by productType,
 * each enriched with live enrollment count and waitlist depth.
 *
 * Requires: Authorization: Bearer <ADMIN_PASSWORD>
 */
export async function GET(request: NextRequest) {
  const authError = verifyAdminAuth(request)
  if (authError) return authError

  try {
    await connectToDatabase()

    const sessions = await SessionConfig.find({}, null, {
      sort: { productType: 1, sortOrder: 1, createdAt: 1 },
    }).lean()

    // Enrich each session with live enrollment + waitlist counts
    const enriched = await Promise.all(
      sessions.map(async (s) => {
        const [confirmedCount, waitlistCount] = await Promise.all([
          Enrollment.countDocuments({
            'selectedSession.sessionId': s.sessionId,
            paymentStatus: 'success',
            bookingStatus: 'confirmed',
            cancelledAt: { $exists: false },
          }),
          Waitlist.countDocuments({
            sessionId: s.sessionId,
            status: { $in: ['waiting', 'notified'] },
          }),
        ])

        return {
          ...s,
          _id: String(s._id),
          confirmedCount,
          spotsRemaining: Math.max(0, s.capacity - confirmedCount),
          isFull: confirmedCount >= s.capacity,
          waitlistCount,
        }
      }),
    )

    // Group by productType
    const grouped: Record<string, typeof enriched> = {}
    for (const s of enriched) {
      if (!grouped[s.productType]) grouped[s.productType] = []
      grouped[s.productType].push(s)
    }

    return NextResponse.json({
      success: true,
      sessions: grouped,
      total: sessions.length,
    })
  } catch (err: any) {
    console.error('[admin/sessions GET] Error:', err)
    return NextResponse.json(
      { error: 'Failed to load sessions.' },
      { status: 500 },
    )
  }
}

/**
 * POST /api/admin/sessions
 * Body: {
 *   productType: string
 *   label: string
 *   dates: string[]         — YYYY-MM-DD strings
 *   time: string            — HH:MM 24h
 *   city: string
 *   venue?: string
 *   isTwoDay?: boolean
 *   capacity: number
 *   sortOrder?: number
 *   displayTime?: string    — auto-generated if omitted
 *   sessionId?: string      — auto-generated if omitted
 * }
 *
 * Creates a new session. Returns the created document.
 * Requires: Authorization: Bearer <ADMIN_PASSWORD>
 */
export async function POST(request: NextRequest) {
  const authError = verifyAdminAuth(request)
  if (authError) return authError

  try {
    const body = await request.json()
    const {
      productType,
      label,
      dates,
      time,
      city,
      venue,
      isTwoDay,
      capacity,
      sortOrder,
      displayTime: rawDisplayTime,
      sessionId: rawSessionId,
    } = body

    // ── Validate required fields ──────────────────────────────────────────
    const missing: string[] = []
    if (!productType) missing.push('productType')
    if (!label?.trim()) missing.push('label')
    if (!Array.isArray(dates) || dates.length === 0) missing.push('dates')
    if (!time?.match(/^\d{2}:\d{2}$/)) missing.push('time (HH:MM)')
    if (!city?.trim()) missing.push('city')
    if (!capacity || isNaN(Number(capacity)) || Number(capacity) < 1)
      missing.push('capacity')

    if (missing.length > 0) {
      return NextResponse.json(
        { error: 'Missing or invalid fields.', fields: missing },
        { status: 400 },
      )
    }

    const validProducts = [
      'Virtual Masterclass',
      'Signature Live Masterclass',
      'Private JaaS Consulting',
    ]
    if (!validProducts.includes(productType)) {
      return NextResponse.json(
        {
          error: `Invalid productType. Must be one of: ${validProducts.join(', ')}`,
        },
        { status: 400 },
      )
    }

    await connectToDatabase()

    // Auto-generate sessionId if not provided
    const sessionId =
      rawSessionId?.trim() ||
      generateSessionId(productType, city.trim(), dates[0])

    // Check uniqueness
    const existing = await SessionConfig.findOne({ sessionId })
    if (existing) {
      return NextResponse.json(
        {
          error: 'A session with this ID already exists.',
          details: `sessionId "${sessionId}" is already taken. Provide a custom sessionId or adjust the dates/city.`,
        },
        { status: 409 },
      )
    }

    // Auto-generate displayTime if not provided
    const displayTime =
      rawDisplayTime?.trim() || buildDisplayTime(time, city.trim())

    // Determine the current highest sortOrder for this productType
    // so new sessions go to the end by default
    let resolvedSortOrder = sortOrder
    if (resolvedSortOrder === undefined || resolvedSortOrder === null) {
      const last = await SessionConfig.findOne(
        { productType },
        { sortOrder: 1 },
        { sort: { sortOrder: -1 } },
      ).lean()
      resolvedSortOrder = (last?.sortOrder ?? -1) + 1
    }

    const created = await SessionConfig.create({
      sessionId,
      productType,
      label: label.trim(),
      dates: dates.map((d: string) => d.trim()),
      time,
      displayTime,
      city: city.trim(),
      venue: venue?.trim() || undefined,
      isTwoDay: Boolean(isTwoDay),
      capacity: Number(capacity),
      isActive: true,
      sortOrder: resolvedSortOrder,
    })

    return NextResponse.json(
      {
        success: true,
        session: { ...created.toObject(), _id: String(created._id) },
      },
      { status: 201 },
    )
  } catch (err: any) {
    console.error('[admin/sessions POST] Error:', err)
    if (err.code === 11000) {
      return NextResponse.json(
        { error: 'A session with this ID already exists.' },
        { status: 409 },
      )
    }
    return NextResponse.json(
      {
        error: 'Failed to create session.',
        details:
          process.env.NODE_ENV === 'development' ? err.message : undefined,
      },
      { status: 500 },
    )
  }
}
