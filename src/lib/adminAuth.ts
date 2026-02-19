/**
 * SERVER ONLY — imported only by API route files.
 * Never import this from any client component.
 */
import { NextRequest, NextResponse } from 'next/server'

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

/**
 * Verifies the Authorization header against ADMIN_PASSWORD env var.
 * Returns a 401/500 NextResponse on failure, or null if auth passes.
 * Usage: const authError = verifyAdminAuth(request); if (authError) return authError
 */
export function verifyAdminAuth(request: NextRequest): NextResponse | null {
  const adminPassword = process.env.ADMIN_PASSWORD

  if (!adminPassword) {
    console.error('[adminAuth] ADMIN_PASSWORD env var is not set.')
    return NextResponse.json(
      { error: 'Admin authentication is not configured.' },
      { status: 500 },
    )
  }

  const authHeader = request.headers.get('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      { error: 'Unauthorized. Authorization header missing or malformed.' },
      { status: 401 },
    )
  }

  const token = authHeader.slice(7) // strip "Bearer "
  if (token !== adminPassword) {
    return NextResponse.json(
      { error: 'Unauthorized. Invalid admin password.' },
      { status: 401 },
    )
  }

  return null // auth passed
}

// ---------------------------------------------------------------------------
// Pagination
// ---------------------------------------------------------------------------

export interface PaginationResult {
  page: number
  limit: number
  skip: number
}

/**
 * Parses `page` and `limit` from URLSearchParams with safe defaults.
 * page  >= 1, limit clamped to 1–100, default 20.
 */
export function parsePagination(
  searchParams: URLSearchParams,
): PaginationResult {
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
  const limit = Math.min(
    100,
    Math.max(1, parseInt(searchParams.get('limit') ?? '20', 10)),
  )
  const skip = (page - 1) * limit
  return { page, limit, skip }
}

// ---------------------------------------------------------------------------
// Day param
// ---------------------------------------------------------------------------

/**
 * Parses the `day` query param — must be 1 or 2, defaults to 1.
 */
export function parseDay(searchParams: URLSearchParams): 1 | 2 {
  const raw = parseInt(searchParams.get('day') ?? '1', 10)
  return raw === 2 ? 2 : 1
}
