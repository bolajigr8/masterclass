/**
 * CLIENT-SAFE — types and fetch helpers for the admin dashboard.
 * All API calls include the admin password from localStorage as a Bearer token.
 */

// ---------------------------------------------------------------------------
// Types — mirror the Enrollment model fields returned by the API
// ---------------------------------------------------------------------------

export interface SelectedSessionRecord {
  sessionId: string
  dates: string[] // ISO date strings — 1 or 2 entries
  time: string
  venue?: string
  city?: string
  isTwoDay?: boolean
}

export interface AttendeeRecord {
  _id: string
  name: string
  email: string
  phone: string
  enrollmentReference: string
  productType?: string
  selectedSession?: SelectedSessionRecord
  accessTier?: 'virtual' | 'full' | 'consulting'
  checkedInDay1: boolean
  checkedInDay1At?: string // ISO string from DB
  checkedInDay2: boolean
  checkedInDay2At?: string
  createdAt: string
}

export interface PaginatedMeta {
  page: number
  limit: number
  totalCount: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  meta: PaginatedMeta
}

export interface DayStats {
  totalLiveRegistered: number // full-access, confirmed, for this session
  totalCheckedInDay1: number
  totalCheckedInDay2: number // 0 for single-day sessions
  totalNotCheckedInDay1: number
  totalNotCheckedInDay2: number
  checkInRateDay1: number // percentage, 2 dp
  checkInRateDay2: number
  totalVirtual: number
  totalConsulting: number
  totalAllAccess: number
}

export interface SessionStats {
  success: boolean
  sessionId: string
  stats: DayStats
}

// ---------------------------------------------------------------------------
// Auth helper — reads the admin password stored after login
// ---------------------------------------------------------------------------

function getStoredPassword(): string {
  if (typeof window === 'undefined') return ''
  return localStorage.getItem('admin_password') ?? ''
}

function authHeaders(): HeadersInit {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getStoredPassword()}`,
  }
}

async function apiFetch<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: authHeaders() })
  const data = await res.json()
  if (!res.ok) {
    throw new Error(data.error ?? `Request failed with status ${res.status}`)
  }
  return data as T
}

// ---------------------------------------------------------------------------
// API helpers
// ---------------------------------------------------------------------------

/**
 * Returns all live-access (full) confirmed attendees for a session.
 * `day` is passed through so the API knows which check-in field to include.
 */
export async function getAttendees(
  sessionId: string,
  day: 1 | 2,
  page = 1,
): Promise<PaginatedResponse<AttendeeRecord>> {
  return apiFetch(
    `/api/admin/attendees?sessionId=${encodeURIComponent(sessionId)}&day=${day}&page=${page}`,
  )
}

/**
 * Returns attendees who have checked in on the given day.
 */
export async function getCheckedInAttendees(
  sessionId: string,
  day: 1 | 2,
  page = 1,
): Promise<PaginatedResponse<AttendeeRecord>> {
  return apiFetch(
    `/api/admin/checked-in?sessionId=${encodeURIComponent(sessionId)}&day=${day}&page=${page}`,
  )
}

/**
 * Returns attendees who have NOT yet checked in on the given day.
 */
export async function getNotCheckedInAttendees(
  sessionId: string,
  day: 1 | 2,
  page = 1,
): Promise<PaginatedResponse<AttendeeRecord>> {
  return apiFetch(
    `/api/admin/not-checked-in?sessionId=${encodeURIComponent(sessionId)}&day=${day}&page=${page}`,
  )
}

/**
 * Returns aggregate stats for the session (both days).
 */
export async function getSessionStats(
  sessionId: string,
): Promise<SessionStats> {
  return apiFetch(`/api/admin/stats?sessionId=${encodeURIComponent(sessionId)}`)
}

/**
 * Verifies the password against the admin API. Returns true if valid.
 */
export async function verifyPassword(password: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/admin/stats?sessionId=ping`, {
      headers: {
        Authorization: `Bearer ${password}`,
      },
    })
    // 400 (missing sessionId) means auth passed; 401 means wrong password
    return res.status !== 401
  } catch {
    return false
  }
}
