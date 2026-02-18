import { NextRequest, NextResponse } from 'next/server'
import QRCode from 'qrcode'

/**
 * GET /api/qr/[sessionId]
 *
 * Generates a session-scoped QR code image (PNG) dynamically.
 * The QR encodes the check-in page URL with the sessionId embedded.
 *
 * This code is NOT user-specific — it is displayed by the admin/staff
 * at the venue and is the same for all attendees of that session.
 *
 * Usage: <img src="/api/qr/SESSION_ID_HERE" />
 *
 * Query params:
 *   ?format=base64  → returns JSON { qrCode: "data:image/png;base64,..." }
 *   (default)       → returns a raw PNG image stream
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  try {
    const { sessionId } = await params

    if (!sessionId || sessionId.trim() === '') {
      return NextResponse.json(
        { error: 'Session ID is required.' },
        { status: 400 },
      )
    }

    // Only allow alphanumeric + hyphens/underscores to prevent URL injection
    if (!/^[a-zA-Z0-9_-]+$/.test(sessionId)) {
      return NextResponse.json(
        { error: 'Invalid session ID format.' },
        { status: 400 },
      )
    }

    const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://yourdomain.com'
    const checkinUrl = `${BASE_URL}/event-checkin?sessionId=${encodeURIComponent(sessionId)}`

    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format')

    if (format === 'base64') {
      // Return a JSON body containing a base64 data URL — useful for embedding
      const dataUrl = await QRCode.toDataURL(checkinUrl, {
        errorCorrectionLevel: 'H', // High — tolerates up to 30% damage
        type: 'image/png',
        margin: 2,
        width: 400,
        color: {
          dark: '#1a1a2e', // dark squares
          light: '#ffffff', // background
        },
      })

      return NextResponse.json(
        {
          sessionId,
          checkinUrl,
          qrCode: dataUrl,
        },
        { status: 200 },
      )
    }

    // Default: stream a raw PNG image
    const pngBuffer = await QRCode.toBuffer(checkinUrl, {
      errorCorrectionLevel: 'H',
      type: 'png',
      margin: 2,
      width: 400,
      color: {
        dark: '#1a1a2e',
        light: '#ffffff',
      },
    })

    return new NextResponse(new Uint8Array(pngBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Content-Length': pngBuffer.length.toString(),
        // Re-generate on every request (session codes are dynamic)
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    })
  } catch (error: any) {
    console.error('[qr] Error generating QR code:', error)
    return NextResponse.json(
      {
        error: 'Failed to generate QR code.',
        details:
          process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 },
    )
  }
}
