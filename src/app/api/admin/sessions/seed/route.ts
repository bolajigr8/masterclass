import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import { verifyAdminAuth } from '@/lib/adminAuth'
import { SESSION_CONFIG } from '@/lib/session-config'
import SessionConfig from '@/models/Sessionconfig'

/**
 * POST /api/admin/sessions/seed
 *
 * One-time migration: imports the hardcoded SESSION_CONFIG from
 * lib/session-config.ts into MongoDB. Safe to call multiple times —
 * uses upsert so existing records are never overwritten.
 *
 * Call this once after deploying to seed the database, then you can
 * manage sessions entirely through the admin dashboard.
 *
 * Requires: Authorization: Bearer <ADMIN_PASSWORD>
 */
export async function POST(request: NextRequest) {
  const authError = verifyAdminAuth(request)
  if (authError) return authError

  try {
    await connectToDatabase()

    let inserted = 0
    let skipped = 0

    const productTypes = Object.keys(SESSION_CONFIG)

    for (const productType of productTypes) {
      const sessions = SESSION_CONFIG[productType] ?? []

      for (let i = 0; i < sessions.length; i++) {
        const s = sessions[i]

        const filter = { sessionId: s.sessionId }
        const existing = await SessionConfig.findOne(filter).lean()

        if (existing) {
          skipped++
          continue
        }

        await SessionConfig.create({
          sessionId: s.sessionId,
          productType,
          label: s.label,
          dates: s.dates,
          time: s.time,
          displayTime: s.displayTime,
          city: s.city,
          venue: s.venue,
          isTwoDay: s.isTwoDay ?? false,
          capacity: s.capacity,
          isActive: true,
          sortOrder: i,
        })

        inserted++
      }
    }

    return NextResponse.json({
      success: true,
      message: `Seed complete. ${inserted} sessions inserted, ${skipped} already existed and were skipped.`,
      inserted,
      skipped,
    })
  } catch (err: any) {
    console.error('[sessions/seed] Error:', err)
    return NextResponse.json(
      {
        error: 'Seed failed.',
        details:
          process.env.NODE_ENV === 'development' ? err.message : undefined,
      },
      { status: 500 },
    )
  }
}
