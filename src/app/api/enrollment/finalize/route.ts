import connectToDatabase from '@/lib/mongodb'
import { NextResponse } from 'next/server'
import Enrollment from '@/models/Enrollment'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      enrollmentReference,
      selectedSession,
      amountPaid,
      paymentReference,
      accessTier,
    } = body

    // Validate required fields
    if (
      !enrollmentReference ||
      !selectedSession?.sessionId ||
      !selectedSession?.date ||
      !selectedSession?.time ||
      !amountPaid ||
      !paymentReference ||
      !accessTier
    ) {
      return NextResponse.json(
        {
          error: 'Missing required fields',
          details:
            'Enrollment reference, session details, amount, payment reference, and access tier are required',
        },
        { status: 400 },
      )
    }

    // Validate access tier
    if (!['virtual', 'full'].includes(accessTier)) {
      return NextResponse.json(
        {
          error: 'Invalid access tier',
          details: 'Access tier must be either "virtual" or "full"',
        },
        { status: 400 },
      )
    }

    // Connect to database
    await connectToDatabase()

    // Find the enrollment by reference
    const enrollment = await Enrollment.findOne({ enrollmentReference })

    if (!enrollment) {
      return NextResponse.json(
        {
          error: 'Enrollment not found',
          details: 'Invalid enrollment reference',
        },
        { status: 404 },
      )
    }

    // Update the enrollment with session and payment details
    enrollment.selectedSession = {
      sessionId: selectedSession.sessionId,
      date: selectedSession.date,

      time: selectedSession.time,
    }
    enrollment.amountPaid = amountPaid
    enrollment.paymentReference = paymentReference
    enrollment.paymentStatus = 'success'
    enrollment.bookingStatus = 'confirmed'
    enrollment.accessTier = accessTier

    await enrollment.save()

    // TODO: Send confirmation email to the user
    // You can implement email sending here using services like:
    // - Resend
    // - SendGrid
    // - AWS SES
    // - Nodemailer

    return NextResponse.json(
      {
        success: true,
        message: 'Enrollment finalized successfully',
        enrollment: {
          id: enrollment._id,
          name: enrollment.name,
          email: enrollment.email,
          selectedSession: enrollment.selectedSession,
          accessTier: enrollment.accessTier,
          bookingStatus: enrollment.bookingStatus,
        },
      },
      { status: 200 },
    )
  } catch (error: any) {
    console.error('Enrollment finalization error:', error)

    // Handle duplicate payment reference
    if (error.code === 11000 && error.keyPattern?.paymentReference) {
      return NextResponse.json(
        {
          error: 'Payment reference already used',
          details: 'This payment has already been processed',
        },
        { status: 409 },
      )
    }

    return NextResponse.json(
      {
        error: 'Failed to finalize enrollment',
        details: error.message,
      },
      { status: 500 },
    )
  }
}
