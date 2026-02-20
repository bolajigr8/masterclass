import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import Enrollment from '@/models/Enrollment'
import { verifyAdminAuth } from '@/lib/adminAuth'
import SessionConfig from '@/models/Sessionconfig'
import { buildDisplayTime } from '@/lib/session-db'

interface RouteContext {
  params: Promise<{ sessionId: string }>
}

/**
 * GET /api/admin/sessions/[sessionId]
 *
 * Returns a single session with live enrollment count.
 * Requires: Authorization: Bearer <ADMIN_PASSWORD>
 */
export async function GET(request: NextRequest, { params }: RouteContext) {
  const authError = verifyAdminAuth(request)
  if (authError) return authError

  const { sessionId } = await params

  try {
    await connectToDatabase()

    const session = await SessionConfig.findOne({ sessionId }).lean()

    if (!session) {
      return NextResponse.json(
        { error: `Session "${sessionId}" not found.` },
        { status: 404 },
      )
    }

    const confirmedCount = await Enrollment.countDocuments({
      'selectedSession.sessionId': sessionId,
      paymentStatus: 'success',
      bookingStatus: 'confirmed',
      cancelledAt: { $exists: false },
    })

    return NextResponse.json({
      success: true,
      session: {
        ...session,
        _id: String(session._id),
        confirmedCount,
        spotsRemaining: Math.max(0, session.capacity - confirmedCount),
        isFull: confirmedCount >= session.capacity,
      },
    })
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Failed to load session.' },
      { status: 500 },
    )
  }
}

/**
 * PUT /api/admin/sessions/[sessionId]
 *
 * Updates an existing session. Only the supplied fields are changed.
 * The sessionId itself is immutable — it's embedded in enrollment records,
 * QR codes, and waitlist entries and cannot be changed after creation.
 *
 * Updatable fields:
 *   label, dates, time, displayTime, city, venue,
 *   isTwoDay, capacity, isActive, sortOrder
 *
 * Guard: capacity cannot be reduced below current confirmed enrollment count.
 *
 * Requires: Authorization: Bearer <ADMIN_PASSWORD>
 */
export async function PUT(request: NextRequest, { params }: RouteContext) {
  const authError = verifyAdminAuth(request)
  if (authError) return authError

  const { sessionId } = await params

  try {
    const body = await request.json()
    await connectToDatabase()

    const session = await SessionConfig.findOne({ sessionId })
    if (!session) {
      return NextResponse.json(
        { error: `Session "${sessionId}" not found.` },
        { status: 404 },
      )
    }

    // ── Capacity floor guard ──────────────────────────────────────────────
    if (body.capacity !== undefined) {
      const newCapacity = Number(body.capacity)
      if (isNaN(newCapacity) || newCapacity < 1) {
        return NextResponse.json(
          { error: 'capacity must be a positive number.' },
          { status: 400 },
        )
      }

      const confirmedCount = await Enrollment.countDocuments({
        'selectedSession.sessionId': sessionId,
        paymentStatus: 'success',
        bookingStatus: 'confirmed',
        cancelledAt: { $exists: false },
      })

      if (newCapacity < confirmedCount) {
        return NextResponse.json(
          {
            error: 'Capacity cannot be set below current enrollment count.',
            details: `There are ${confirmedCount} confirmed enrollments. New capacity must be ≥ ${confirmedCount}.`,
            confirmedCount,
          },
          { status: 422 },
        )
      }
    }

    // ── Build update object — only touch provided fields ──────────────────
    const update: Record<string, any> = {}

    if (body.label !== undefined) update.label = String(body.label).trim()
    if (body.dates !== undefined)
      update.dates = body.dates.map((d: string) => d.trim())
    if (body.time !== undefined) {
      if (!String(body.time).match(/^\d{2}:\d{2}$/)) {
        return NextResponse.json(
          { error: 'time must be HH:MM format.' },
          { status: 400 },
        )
      }
      update.time = body.time
      // Auto-regenerate displayTime when time changes, unless explicitly provided
      if (body.displayTime === undefined) {
        const city = body.city ?? session.city
        update.displayTime = buildDisplayTime(body.time, city)
      }
    }
    if (body.displayTime !== undefined)
      update.displayTime = String(body.displayTime).trim()
    if (body.city !== undefined) update.city = String(body.city).trim()
    if (body.venue !== undefined)
      update.venue = body.venue ? String(body.venue).trim() : undefined
    if (body.isTwoDay !== undefined) update.isTwoDay = Boolean(body.isTwoDay)
    if (body.capacity !== undefined) update.capacity = Number(body.capacity)
    if (body.isActive !== undefined) update.isActive = Boolean(body.isActive)
    if (body.sortOrder !== undefined) update.sortOrder = Number(body.sortOrder)

    if (Object.keys(update).length === 0) {
      return NextResponse.json(
        { error: 'No updatable fields provided.' },
        { status: 400 },
      )
    }

    const updated = await SessionConfig.findOneAndUpdate(
      { sessionId },
      { $set: update },
      { new: true },
    ).lean()

    return NextResponse.json({
      success: true,
      session: { ...updated, _id: String(updated!._id) },
    })
  } catch (err: any) {
    console.error('[admin/sessions PUT] Error:', err)
    return NextResponse.json(
      {
        error: 'Failed to update session.',
        details:
          process.env.NODE_ENV === 'development' ? err.message : undefined,
      },
      { status: 500 },
    )
  }
}

/**
 * DELETE /api/admin/sessions/[sessionId]
 *
 * Soft-deletes by setting isActive: false.
 * The session disappears from the enrollment modal but all historical
 * enrollment records that reference this sessionId remain intact.
 *
 * Hard delete is blocked if confirmed enrollments exist.
 *
 * Query param: ?hard=true performs a hard delete (only if 0 enrollments).
 *
 * Requires: Authorization: Bearer <ADMIN_PASSWORD>
 */
export async function DELETE(request: NextRequest, { params }: RouteContext) {
  const authError = verifyAdminAuth(request)
  if (authError) return authError

  const { sessionId } = await params

  try {
    const { searchParams } = new URL(request.url)
    const hard = searchParams.get('hard') === 'true'

    await connectToDatabase()

    const session = await SessionConfig.findOne({ sessionId })
    if (!session) {
      return NextResponse.json(
        { error: `Session "${sessionId}" not found.` },
        { status: 404 },
      )
    }

    const confirmedCount = await Enrollment.countDocuments({
      'selectedSession.sessionId': sessionId,
      paymentStatus: 'success',
      bookingStatus: 'confirmed',
      cancelledAt: { $exists: false },
    })

    if (hard) {
      // Block hard delete if real enrollment data exists
      if (confirmedCount > 0) {
        return NextResponse.json(
          {
            error:
              'Cannot permanently delete a session with confirmed enrollments.',
            details: `Archive it instead by setting isActive: false. There are ${confirmedCount} confirmed enrollments attached to this session.`,
            confirmedCount,
          },
          { status: 422 },
        )
      }
      await SessionConfig.deleteOne({ sessionId })
      return NextResponse.json({
        success: true,
        deleted: true,
        sessionId,
      })
    }

    // Soft delete — archive
    await SessionConfig.updateOne({ sessionId }, { $set: { isActive: false } })

    return NextResponse.json({
      success: true,
      archived: true,
      sessionId,
      message:
        'Session archived. It will no longer appear in the enrollment modal. Enrollment history is preserved.',
    })
  } catch (err: any) {
    console.error('[admin/sessions DELETE] Error:', err)
    return NextResponse.json(
      { error: 'Failed to archive session.' },
      { status: 500 },
    )
  }
}
