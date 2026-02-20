import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import Enrollment from '@/models/Enrollment'
import { verifyAdminAuth } from '@/lib/adminAuth'
import { sendAdminNotificationBlast } from '@/lib/email'

/**
 * POST /api/admin/notify
 * Body: {
 *   subject: string
 *   messageBody: string          — plain text, {name} is interpolated per recipient
 *   filter: {
 *     status?: 'confirmed' | 'pending' | 'cancelled'
 *     tier?: 'virtual' | 'full' | 'consulting'
 *     sessionId?: string
 *     productType?: string
 *     enrollmentReferences?: string[]  — target specific people
 *   }
 *   senderName?: string
 * }
 *
 * Sends a branded email to all enrollees matching the filter.
 * Max 2000 recipients per call as a safety limit.
 *
 * Requires: Authorization: Bearer <ADMIN_PASSWORD>
 */
export async function POST(request: NextRequest) {
  const authError = verifyAdminAuth(request)
  if (authError) return authError

  try {
    const body = await request.json()
    const { subject, messageBody, filter: rawFilter, senderName } = body

    if (!subject?.trim() || !messageBody?.trim()) {
      return NextResponse.json(
        { error: 'subject and messageBody are required.' },
        { status: 400 },
      )
    }

    // ── Build MongoDB filter from request ─────────────────────────────────
    const dbFilter: Record<string, any> = {}

    if (rawFilter?.status === 'confirmed') {
      dbFilter.paymentStatus = 'success'
      dbFilter.bookingStatus = 'confirmed'
      dbFilter.cancelledAt = { $exists: false }
    } else if (rawFilter?.status === 'pending') {
      dbFilter.$or = [
        { paymentStatus: 'pending' },
        { bookingStatus: 'pending' },
      ]
      dbFilter.cancelledAt = { $exists: false }
    } else if (rawFilter?.status === 'cancelled') {
      dbFilter.cancelledAt = { $exists: true }
    }

    if (rawFilter?.tier) dbFilter.accessTier = rawFilter.tier
    if (rawFilter?.sessionId)
      dbFilter['selectedSession.sessionId'] = rawFilter.sessionId
    if (rawFilter?.productType) dbFilter.productType = rawFilter.productType

    if (rawFilter?.enrollmentReferences?.length) {
      dbFilter.enrollmentReference = { $in: rawFilter.enrollmentReferences }
    }

    await connectToDatabase()

    const enrollments = await Enrollment.find(dbFilter)
      .select('name email')
      .limit(2000)
      .lean()

    if (enrollments.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No enrollees match the given filter.' },
        { status: 200 },
      )
    }

    const recipients = enrollments.map((e) => ({
      name: e.name,
      email: e.email,
    }))

    await sendAdminNotificationBlast({
      recipients,
      subject: subject.trim(),
      messageBody: messageBody.trim(),
      senderName: senderName?.trim(),
    })

    return NextResponse.json({
      success: true,
      sent: recipients.length,
      message: `Email sent to ${recipients.length} enrollee(s).`,
    })
  } catch (err: any) {
    console.error('[admin/notify] Error:', err)
    return NextResponse.json(
      {
        error: 'Notification failed.',
        details:
          process.env.NODE_ENV === 'development' ? err.message : undefined,
      },
      { status: 500 },
    )
  }
}
