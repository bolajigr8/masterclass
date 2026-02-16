import { NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import Enrollment from '@/models/Enrollment'

// Generate a unique enrollment reference
function generateEnrollmentReference(): string {
  const timestamp = Date.now().toString(36)
  const randomStr = Math.random().toString(36).substring(2, 8)
  return `ENR-${timestamp}-${randomStr}`.toUpperCase()
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, phone } = body

    // Validate required fields
    if (!name || !email || !phone) {
      return NextResponse.json(
        {
          error: 'Missing required fields',
          details: 'Name, email, and phone are required',
        },
        { status: 400 },
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          error: 'Invalid email format',
        },
        { status: 400 },
      )
    }

    // Validate phone format (basic validation)
    if (phone.length < 10) {
      return NextResponse.json(
        {
          error: 'Invalid phone number',
        },
        { status: 400 },
      )
    }

    // Connect to database
    await connectToDatabase()

    // Generate enrollment reference
    const enrollmentReference = generateEnrollmentReference()

    // Store temporary enrollment data (without session details yet)
    // This will be updated in the finalize step
    const tempEnrollment = await Enrollment.create({
      name,
      email,
      phone,
      enrollmentReference,
      // Don't set optional fields - they'll be filled in later steps
      // selectedSession, paymentReference, accessTier will be undefined
      // amountPaid defaults to 0
      // paymentStatus defaults to 'pending'
      // bookingStatus defaults to 'pending'
    })

    return NextResponse.json(
      {
        success: true,
        enrollmentReference,
        message: 'Enrollment initiated successfully',
      },
      { status: 201 },
    )
  } catch (error: any) {
    console.error('Enrollment initiation error:', error)

    // Handle duplicate enrollment reference (unlikely but possible)
    if (error.code === 11000) {
      return NextResponse.json(
        {
          error: 'Enrollment reference conflict. Please try again.',
        },
        { status: 409 },
      )
    }

    return NextResponse.json(
      {
        error: 'Failed to initiate enrollment',
        details: error.message,
      },
      { status: 500 },
    )
  }
}
