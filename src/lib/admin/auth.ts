// ─── Admin Authentication & Storage ──────────────────────────────────────────

const ADMIN_TOKEN_KEY = 'masterclass_admin_token'

/**
 * Stores the admin token in localStorage
 */
export function setAdminToken(token: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(ADMIN_TOKEN_KEY, token)
}

/**
 * Retrieves the admin token from localStorage
 */
export function getAdminToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(ADMIN_TOKEN_KEY)
}

/**
 * Removes the admin token from localStorage
 */
export function clearAdminToken(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(ADMIN_TOKEN_KEY)
}

/**
 * Checks if admin is authenticated
 */
export function isAdminAuthenticated(): boolean {
  return !!getAdminToken()
}

// ─── Admin API Utilities ─────────────────────────────────────────────────────

interface FetchOptions extends RequestInit {
  requiresAuth?: boolean
}

/**
 * Fetches from an admin endpoint with automatic auth header injection
 */
export async function adminFetch(
  url: string,
  options: FetchOptions = {},
): Promise<Response> {
  const { requiresAuth = true, headers = {}, ...rest } = options

  const token = getAdminToken()

  if (requiresAuth && !token) {
    throw new Error('Admin authentication required')
  }

  const finalHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (typeof headers === 'object' && !Array.isArray(headers)) {
    if (headers instanceof Headers) {
      headers.forEach((value, key) => {
        finalHeaders[key] = value
      })
    } else {
      Object.assign(finalHeaders, headers)
    }
  }

  if (requiresAuth && token) {
    finalHeaders['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(url, {
    ...rest,
    headers: finalHeaders,
  })

  // Auto logout on 401
  if (requiresAuth && response.status === 401) {
    clearAdminToken()
    if (typeof window !== 'undefined') {
      window.location.href = '/admin/login'
    }
  }

  return response
}

// ─── Typed Admin API Functions ───────────────────────────────────────────────

export interface AttendeeRecord {
  _id: string
  name: string
  email: string
  phone: string
  enrollmentReference: string
  productType: string
  selectedSession: {
    sessionId: string
    date: string
    time: string
  }
  accessTier: 'virtual' | 'full'
  checkedIn: boolean
  checkedInAt?: string
  createdAt: string
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  meta: {
    page: number
    limit: number
    totalCount: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

export interface SessionStats {
  success: boolean
  sessionId: string
  stats: {
    totalLiveRegistered: number
    totalCheckedIn: number
    totalNotCheckedIn: number
    checkInRate: number
    totalVirtual: number
    totalAllAccess: number
  }
}

export async function getSessionStats(
  sessionId: string,
): Promise<SessionStats> {
  const response = await adminFetch(
    `/api/admin/stats?sessionId=${encodeURIComponent(sessionId)}`,
  )
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to fetch stats')
  }
  return response.json()
}

export async function getAttendees(
  sessionId: string,
  page: number = 1,
  limit: number = 20,
): Promise<PaginatedResponse<AttendeeRecord>> {
  const response = await adminFetch(
    `/api/admin/attendees?sessionId=${encodeURIComponent(sessionId)}&page=${page}&limit=${limit}`,
  )
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to fetch attendees')
  }
  return response.json()
}

export async function getCheckedInAttendees(
  sessionId: string,
  page: number = 1,
  limit: number = 20,
): Promise<PaginatedResponse<AttendeeRecord>> {
  const response = await adminFetch(
    `/api/admin/checked-in?sessionId=${encodeURIComponent(sessionId)}&page=${page}&limit=${limit}`,
  )
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to fetch checked-in attendees')
  }
  return response.json()
}

export async function getNotCheckedInAttendees(
  sessionId: string,
  page: number = 1,
  limit: number = 20,
): Promise<PaginatedResponse<AttendeeRecord>> {
  const response = await adminFetch(
    `/api/admin/not-checked-in?sessionId=${encodeURIComponent(sessionId)}&page=${page}&limit=${limit}`,
  )
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to fetch not-checked-in attendees')
  }
  return response.json()
}
