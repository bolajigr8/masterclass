// /**
//  * CLIENT-SAFE — types and fetch helpers for the admin dashboard.
//  * All API calls include the admin password from localStorage as a Bearer token.
//  */

// // ---------------------------------------------------------------------------
// // Types — mirror the Enrollment model fields returned by the API
// // ---------------------------------------------------------------------------

// export interface SelectedSessionRecord {
//   sessionId: string
//   dates: string[] // ISO date strings — 1 or 2 entries
//   time: string
//   venue?: string
//   city?: string
//   isTwoDay?: boolean
// }

// export interface AttendeeRecord {
//   _id: string
//   name: string
//   email: string
//   phone: string
//   enrollmentReference: string
//   productType?: string
//   selectedSession?: SelectedSessionRecord
//   accessTier?: 'virtual' | 'full' | 'consulting'
//   checkedInDay1: boolean
//   checkedInDay1At?: string // ISO string from DB
//   checkedInDay2: boolean
//   checkedInDay2At?: string
//   createdAt: string
// }

// export interface PaginatedMeta {
//   page: number
//   limit: number
//   totalCount: number
//   totalPages: number
//   hasNextPage: boolean
//   hasPrevPage: boolean
// }

// export interface PaginatedResponse<T> {
//   success: boolean
//   data: T[]
//   meta: PaginatedMeta
// }

// export interface DayStats {
//   totalLiveRegistered: number // full-access, confirmed, for this session
//   totalCheckedInDay1: number
//   totalCheckedInDay2: number // 0 for single-day sessions
//   totalNotCheckedInDay1: number
//   totalNotCheckedInDay2: number
//   checkInRateDay1: number // percentage, 2 dp
//   checkInRateDay2: number
//   totalVirtual: number
//   totalConsulting: number
//   totalAllAccess: number
// }

// export interface SessionStats {
//   success: boolean
//   sessionId: string
//   stats: DayStats
// }

// // ---------------------------------------------------------------------------
// // Auth helper — reads the admin password stored after login
// // ---------------------------------------------------------------------------

// function getStoredPassword(): string {
//   if (typeof window === 'undefined') return ''
//   return localStorage.getItem('admin_password') ?? ''
// }

// function authHeaders(): HeadersInit {
//   return {
//     'Content-Type': 'application/json',
//     Authorization: `Bearer ${getStoredPassword()}`,
//   }
// }

// async function apiFetch<T>(url: string): Promise<T> {
//   const res = await fetch(url, { headers: authHeaders() })
//   const data = await res.json()
//   if (!res.ok) {
//     throw new Error(data.error ?? `Request failed with status ${res.status}`)
//   }
//   return data as T
// }

// // ---------------------------------------------------------------------------
// // API helpers
// // ---------------------------------------------------------------------------

// /**
//  * Returns all live-access (full) confirmed attendees for a session.
//  * `day` is passed through so the API knows which check-in field to include.
//  */
// export async function getAttendees(
//   sessionId: string,
//   day: 1 | 2,
//   page = 1,
// ): Promise<PaginatedResponse<AttendeeRecord>> {
//   return apiFetch(
//     `/api/admin/attendees?sessionId=${encodeURIComponent(sessionId)}&day=${day}&page=${page}`,
//   )
// }

// /**
//  * Returns attendees who have checked in on the given day.
//  */
// export async function getCheckedInAttendees(
//   sessionId: string,
//   day: 1 | 2,
//   page = 1,
// ): Promise<PaginatedResponse<AttendeeRecord>> {
//   return apiFetch(
//     `/api/admin/checked-in?sessionId=${encodeURIComponent(sessionId)}&day=${day}&page=${page}`,
//   )
// }

// /**
//  * Returns attendees who have NOT yet checked in on the given day.
//  */
// export async function getNotCheckedInAttendees(
//   sessionId: string,
//   day: 1 | 2,
//   page = 1,
// ): Promise<PaginatedResponse<AttendeeRecord>> {
//   return apiFetch(
//     `/api/admin/not-checked-in?sessionId=${encodeURIComponent(sessionId)}&day=${day}&page=${page}`,
//   )
// }

// /**
//  * Returns aggregate stats for the session (both days).
//  */
// export async function getSessionStats(
//   sessionId: string,
// ): Promise<SessionStats> {
//   return apiFetch(`/api/admin/stats?sessionId=${encodeURIComponent(sessionId)}`)
// }

// /**
//  * Verifies the password against the admin API. Returns true if valid.
//  */
// export async function verifyPassword(password: string): Promise<boolean> {
//   try {
//     const res = await fetch(`/api/admin/stats?sessionId=ping`, {
//       headers: {
//         Authorization: `Bearer ${password}`,
//       },
//     })
//     // 400 (missing sessionId) means auth passed; 401 means wrong password
//     return res.status !== 401
//   } catch {
//     return false
//   }
// }

/**
 * CLIENT-SAFE — types and fetch helpers for the admin dashboard.
 * All API calls include the admin password from localStorage as a Bearer token.
 */

// ---------------------------------------------------------------------------
// Core types
// ---------------------------------------------------------------------------

export interface SelectedSessionRecord {
  sessionId: string
  dates: string[]
  time: string
  venue?: string
  city?: string
  isTwoDay?: boolean
}

export interface EnrollmentRecord {
  _id: string
  name: string
  email: string
  phone: string
  city?: string
  enrollmentReference: string
  paymentStatus: 'pending' | 'success'
  bookingStatus: 'pending' | 'confirmed'
  productType?: string
  accessTier?: 'virtual' | 'full' | 'consulting'
  amountPaid: number
  selectedSession?: SelectedSessionRecord
  checkedInDay1: boolean
  checkedInDay1At?: string
  checkedInDay2: boolean
  checkedInDay2At?: string
  cancelledAt?: string
  reminder24hSentAt?: string
  reminder1hSentAt?: string
  createdAt: string
  updatedAt: string
}

// Alias kept for backwards compatibility with existing dashboard components
export type AttendeeRecord = EnrollmentRecord

export interface WaitlistRecord {
  _id: string
  name: string
  email: string
  phone: string
  city?: string
  productType: string
  sessionId: string
  position: number
  status: 'waiting' | 'notified' | 'converted' | 'expired' | 'removed'
  notifiedAt?: string
  confirmationExpiresAt?: string
  convertedEnrollmentReference?: string
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

// ── Stats ──────────────────────────────────────────────────────────────────

export interface DayStats {
  totalLiveRegistered: number
  totalCheckedInDay1: number
  totalCheckedInDay2: number
  totalNotCheckedInDay1: number
  totalNotCheckedInDay2: number
  checkInRateDay1: number
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

// ── Revenue ────────────────────────────────────────────────────────────────

export interface RevenueTimePoint {
  date: string
  count: number
  revenue: number
}

export interface GeoPoint {
  city: string
  count: number
  revenue: number
}

export interface RevenueAnalytics {
  success: boolean
  lookbackDays: number
  summary: {
    totalRevenue: number
    totalConfirmed: number
    totalPending: number
    conversionRate: number
    averageOrderValue: number
  }
  revenueByTier: Record<string, { revenue: number; count: number }>
  revenueByProduct: Record<string, { revenue: number; count: number }>
  timeSeries: RevenueTimePoint[]
  geographic: GeoPoint[]
}

// ── Capacity ───────────────────────────────────────────────────────────────

export interface SessionCapacity {
  sessionId: string
  label: string
  productType: string
  city: string
  dates: string[]
  capacity: number
  confirmedCount: number
  spotsRemaining: number
  isFull: boolean
  waitlistCount: number
}

// ---------------------------------------------------------------------------
// Auth helpers
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

async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { ...authHeaders(), ...init?.headers },
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? `Request failed ${res.status}`)
  return data as T
}

// ---------------------------------------------------------------------------
// Event check-in helpers (existing)
// ---------------------------------------------------------------------------

export async function getAttendees(
  sessionId: string,
  day: 1 | 2,
  page = 1,
): Promise<PaginatedResponse<AttendeeRecord>> {
  return apiFetch(
    `/api/admin/attendees?sessionId=${encodeURIComponent(sessionId)}&day=${day}&page=${page}`,
  )
}

export async function getCheckedInAttendees(
  sessionId: string,
  day: 1 | 2,
  page = 1,
): Promise<PaginatedResponse<AttendeeRecord>> {
  return apiFetch(
    `/api/admin/checked-in?sessionId=${encodeURIComponent(sessionId)}&day=${day}&page=${page}`,
  )
}

export async function getNotCheckedInAttendees(
  sessionId: string,
  day: 1 | 2,
  page = 1,
): Promise<PaginatedResponse<AttendeeRecord>> {
  return apiFetch(
    `/api/admin/not-checked-in?sessionId=${encodeURIComponent(sessionId)}&day=${day}&page=${page}`,
  )
}

export async function getSessionStats(
  sessionId: string,
): Promise<SessionStats> {
  return apiFetch(`/api/admin/stats?sessionId=${encodeURIComponent(sessionId)}`)
}

// ---------------------------------------------------------------------------
// Enrollment management (new)
// ---------------------------------------------------------------------------

export interface EnrollmentFilters {
  status?: 'confirmed' | 'pending' | 'cancelled'
  tier?: 'virtual' | 'full' | 'consulting'
  productType?: string
  city?: string
  sessionId?: string
  search?: string
  sortBy?: 'createdAt' | 'amountPaid' | 'name'
  sortDir?: 'asc' | 'desc'
  page?: number
}

export async function getEnrollments(
  filters: EnrollmentFilters = {},
): Promise<PaginatedResponse<EnrollmentRecord>> {
  const params = new URLSearchParams()
  Object.entries(filters).forEach(([k, v]) => {
    if (v !== undefined && v !== '') params.set(k, String(v))
  })
  return apiFetch(`/api/admin/enrollments?${params}`)
}

export function buildExportUrl(filters: EnrollmentFilters = {}): string {
  const params = new URLSearchParams()
  const password = getStoredPassword()
  if (password) params.set('_auth', password) // fallback for direct link
  Object.entries(filters).forEach(([k, v]) => {
    if (v !== undefined && v !== '') params.set(k, String(v))
  })
  return `/api/admin/export?${params}`
}

// ---------------------------------------------------------------------------
// Revenue analytics (new)
// ---------------------------------------------------------------------------

export async function getRevenueAnalytics(
  days = 90,
): Promise<RevenueAnalytics> {
  return apiFetch(`/api/admin/revenue?days=${days}`)
}

// ---------------------------------------------------------------------------
// Capacity (new)
// ---------------------------------------------------------------------------

export async function getCapacity(): Promise<{
  success: boolean
  sessions: SessionCapacity[]
}> {
  return apiFetch('/api/admin/capacity')
}

// ---------------------------------------------------------------------------
// Notify (new)
// ---------------------------------------------------------------------------

export interface NotifyPayload {
  subject: string
  messageBody: string
  filter?: {
    status?: string
    tier?: string
    sessionId?: string
    productType?: string
    enrollmentReferences?: string[]
  }
  senderName?: string
}

export async function sendNotification(
  payload: NotifyPayload,
): Promise<{ success: boolean; sent: number; message: string }> {
  return apiFetch('/api/admin/notify', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

// ---------------------------------------------------------------------------
// Waitlist (new)
// ---------------------------------------------------------------------------

export async function getWaitlist(
  sessionId: string,
  status?: string,
  page = 1,
): Promise<PaginatedResponse<WaitlistRecord>> {
  const params = new URLSearchParams({ sessionId, page: String(page) })
  if (status) params.set('status', status)
  return apiFetch(`/api/admin/waitlist?${params}`)
}

// ---------------------------------------------------------------------------
// Auth verification
// ---------------------------------------------------------------------------

export async function verifyPassword(password: string): Promise<boolean> {
  try {
    const res = await fetch('/api/admin/stats?sessionId=ping', {
      headers: { Authorization: `Bearer ${password}` },
    })
    return res.status !== 401
  } catch {
    return false
  }
}

// ---------------------------------------------------------------------------
// Session management (schedules feature)
// ---------------------------------------------------------------------------

export interface AdminSessionRecord {
  _id: string
  sessionId: string
  productType: string
  label: string
  dates: string[]
  time: string
  displayTime: string
  city: string
  venue?: string
  isTwoDay: boolean
  capacity: number
  isActive: boolean
  sortOrder: number
  confirmedCount: number
  spotsRemaining: number
  isFull: boolean
  waitlistCount: number
  createdAt: string
  updatedAt: string
}

export interface CreateSessionPayload {
  productType: string
  label: string
  dates: string[]
  time: string
  city: string
  venue?: string
  isTwoDay?: boolean
  capacity: number
  sortOrder?: number
  displayTime?: string
}

export interface UpdateSessionPayload {
  label?: string
  dates?: string[]
  time?: string
  displayTime?: string
  city?: string
  venue?: string
  isTwoDay?: boolean
  capacity?: number
  isActive?: boolean
  sortOrder?: number
}

/** Returns all sessions (active + archived) grouped by productType with live enrollment counts */
export async function getAdminSessions(): Promise<{
  success: boolean
  sessions: Record<string, AdminSessionRecord[]>
  total: number
}> {
  return apiFetch('/api/admin/sessions')
}

/** Creates a new session */
export async function createSession(
  payload: CreateSessionPayload,
): Promise<{ success: boolean; session: AdminSessionRecord }> {
  return apiFetch('/api/admin/sessions', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

/** Updates an existing session */
export async function updateSession(
  sessionId: string,
  payload: UpdateSessionPayload,
): Promise<{ success: boolean; session: AdminSessionRecord }> {
  return apiFetch(`/api/admin/sessions/${encodeURIComponent(sessionId)}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

/** Archives a session (soft delete — hides from enrollment modal) */
export async function archiveSession(
  sessionId: string,
): Promise<{ success: boolean; archived: boolean }> {
  return apiFetch(`/api/admin/sessions/${encodeURIComponent(sessionId)}`, {
    method: 'DELETE',
  })
}

/** Restores an archived session */
export async function restoreSession(
  sessionId: string,
): Promise<{ success: boolean; session: AdminSessionRecord }> {
  return apiFetch(`/api/admin/sessions/${encodeURIComponent(sessionId)}`, {
    method: 'PUT',
    body: JSON.stringify({ isActive: true }),
  })
}

/** Seeds the database from the static session-config.ts (run once after deploy) */
export async function seedSessions(): Promise<{
  success: boolean
  inserted: number
  skipped: number
  message: string
}> {
  return apiFetch('/api/admin/sessions/seed', { method: 'POST' })
}
