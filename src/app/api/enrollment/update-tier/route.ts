import { NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import Enrollment from '@/models/Enrollment'
import {
  sendTierChangedToVirtualEmail,
  sendTierChangedToFullEmail,
} from '@/lib/email'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, enrollmentReference, accessTier } = body

    // ── Field validation ────────────────────────────────────────────────────
    if (!email || !enrollmentReference || !accessTier) {
      return NextResponse.json(
        {
          error: 'Missing required fields.',
          details:
            'email, enrollmentReference, and accessTier are all required.',
        },
        { status: 400 },
      )
    }

    if (!['virtual', 'full'].includes(accessTier)) {
      return NextResponse.json(
        {
          error: 'Invalid access tier.',
          details: 'accessTier must be "virtual" or "full".',
        },
        { status: 400 },
      )
    }

    await connectToDatabase()

    // ── Find enrollment by both email AND reference (identity validation) ───
    const enrollment = await Enrollment.findOne({
      email: String(email).toLowerCase().trim(),
      enrollmentReference: String(enrollmentReference).trim(),
    })

    if (!enrollment) {
      return NextResponse.json(
        {
          error: 'Enrollment not found.',
          details:
            'No enrollment matches the provided email and enrollment reference combination.',
        },
        { status: 404 },
      )
    }

    // ── Enrollment must be paid and confirmed ───────────────────────────────
    if (
      enrollment.paymentStatus !== 'success' ||
      enrollment.bookingStatus !== 'confirmed'
    ) {
      return NextResponse.json(
        {
          error: 'Enrollment not confirmed.',
          details:
            'Access tier can only be updated after payment is completed and booking is confirmed.',
        },
        { status: 409 },
      )
    }

    // ── Check-in lock ───────────────────────────────────────────────────────
    // Once a user has physically checked in, tier changes are forbidden.
    if (enrollment.checkedIn) {
      return NextResponse.json(
        {
          error: 'Tier update not allowed.',
          details:
            'You have already checked in to this event. Access tier cannot be changed after check-in.',
        },
        { status: 409 },
      )
    }

    // ── No-op guard ─────────────────────────────────────────────────────────
    if (enrollment.accessTier === accessTier) {
      return NextResponse.json(
        {
          success: true,
          message: `Access tier is already set to "${accessTier}". No change was made.`,
          accessTier,
        },
        { status: 200 },
      )
    }

    const previousTier = enrollment.accessTier
    enrollment.accessTier = accessTier
    await enrollment.save()

    // ── Email notification based on direction of change ─────────────────────
    const emailParams = {
      name: enrollment.name,
      email: enrollment.email,
      enrollmentReference: enrollment.enrollmentReference,
      productType: enrollment.productType!,
      sessionDate: enrollment.selectedSession!.date,
      sessionTime: enrollment.selectedSession!.time,
    }

    if (accessTier === 'virtual') {
      // Changed to virtual → send webinar link immediately
      sendTierChangedToVirtualEmail(emailParams).catch((err) =>
        console.error('[update-tier] Failed to send virtual email:', err),
      )
    } else {
      // Changed to full → send live check-in instructions
      sendTierChangedToFullEmail(emailParams).catch((err) =>
        console.error('[update-tier] Failed to send full email:', err),
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: `Access tier updated from "${previousTier}" to "${accessTier}".`,
        accessTier,
        liveCheckinEligible: accessTier === 'full',
      },
      { status: 200 },
    )
  } catch (error: any) {
    console.error('[update-tier] Error:', error)
    return NextResponse.json(
      {
        error: 'Failed to update access tier.',
        details:
          process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 },
    )
  }
}
