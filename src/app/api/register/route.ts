import { NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import connectToDatabase from '@/lib/mongodb'
import Enrollment from '@/models/Enrollment'
import { sendRegistrationConfirmation } from '@/lib/email'

// ---------------------------------------------------------------------------
// Cryptographically secure enrollment reference
// Format: ENR-<timestamp-base36>-<8-random-hex-bytes>
// e.g.   ENR-LZK3F2A-A1B2C3D4E5F60708
// ---------------------------------------------------------------------------
function generateEnrollmentReference(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const randomHex = randomBytes(8).toString('hex').toUpperCase()
  return `ENR-${timestamp}-${randomHex}`
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, phone, city } = body

    if (!name || !email || !phone) {
      return NextResponse.json(
        {
          error: 'Missing required fields',
          details: 'name, email, and phone are all required.',
        },
        { status: 400 },
      )
    }

    if (!EMAIL_RE.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format.' },
        { status: 400 },
      )
    }

    const cleanPhone = String(phone).replace(/\s+/g, '')
    if (cleanPhone.length < 10) {
      return NextResponse.json(
        { error: 'Invalid phone number. Must be at least 10 digits.' },
        { status: 400 },
      )
    }

    if (String(name).trim().length < 2) {
      return NextResponse.json(
        { error: 'Name must be at least 2 characters.' },
        { status: 400 },
      )
    }

    await connectToDatabase()

    const existing = await Enrollment.findOne({
      email: email.toLowerCase().trim(),
    }).lean()

    if (existing) {
      return NextResponse.json(
        {
          error: 'Email already registered.',
          details:
            'An enrollment with this email already exists. Each email can only be registered once.',
        },
        { status: 409 },
      )
    }

    const enrollmentReference = generateEnrollmentReference()

    await Enrollment.create({
      name: String(name).trim(),
      email: email.toLowerCase().trim(),
      phone: cleanPhone,
      city: city ? String(city).trim() : undefined,
      enrollmentReference,
    })

    sendRegistrationConfirmation({
      name: String(name).trim(),
      email: email.toLowerCase().trim(),
      enrollmentReference,
    }).catch((err) =>
      console.error('[register] Failed to send confirmation email:', err),
    )

    return NextResponse.json(
      { success: true, enrollmentReference },
      { status: 201 },
    )
  } catch (error: any) {
    console.error('[register] Error:', error)

    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern ?? {})[0]
      if (field === 'email') {
        return NextResponse.json(
          { error: 'Email already registered.' },
          { status: 409 },
        )
      }
      return NextResponse.json(
        { error: 'Reference generation conflict. Please try again.' },
        { status: 409 },
      )
    }

    return NextResponse.json(
      {
        error: 'Registration failed. Please try again.',
        details:
          process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 },
    )
  }
}
