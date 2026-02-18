import { NextRequest, NextResponse } from 'next/server'

/**
 * Validates the admin Bearer token from the Authorization header.
 * Returns a 401/500 NextResponse if auth fails, or null if auth passes.
 *
 * Usage:
 *   const authError = verifyAdminAuth(request)
 *   if (authError) return authError
 */
export function verifyAdminAuth(request: NextRequest): NextResponse | null {
  const adminPassword = process.env.ADMIN_PASSWORD

  if (!adminPassword) {
    return NextResponse.json(
      { error: 'Admin authentication is not configured on this server.' },
      { status: 500 },
    )
  }

  const authHeader = request.headers.get('authorization')

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      {
        error: 'Unauthorized',
        details: 'Provide a valid Bearer token in the Authorization header.',
      },
      { status: 401 },
    )
  }

  const token = authHeader.slice(7) // strip "Bearer "

  if (token !== adminPassword) {
    return NextResponse.json(
      { error: 'Unauthorized', details: 'Invalid credentials.' },
      { status: 401 },
    )
  }

  return null // auth passed
}

/**
 * Parses and validates pagination query params.
 * Returns { page, limit, skip } with safe defaults.
 */
export function parsePagination(searchParams: URLSearchParams): {
  page: number
  limit: number
  skip: number
} {
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10) || 1)
  const limit = Math.min(
    100,
    Math.max(1, parseInt(searchParams.get('limit') ?? '20', 10) || 20),
  )
  const skip = (page - 1) * limit
  return { page, limit, skip }
}
