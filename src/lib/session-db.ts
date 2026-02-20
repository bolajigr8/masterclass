/**
 * SERVER ONLY — never import this from any client component.
 *
 * Provides the same helper functions as session-config.ts (getSessionsForProduct,
 * findSessionById, etc.) but reads from MongoDB instead of hardcoded config.
 *
 * All API routes, cron jobs, and check-in routes should import from here.
 * Client components fetch from /api/sessions instead.
 */
import connectToDatabase from '@/lib/mongodb'
import SessionConfig, { type ISessionConfig } from '@/models/Sessionconfig'

// ---------------------------------------------------------------------------
// Shape returned to callers — mirrors the client-side SessionOption interface
// ---------------------------------------------------------------------------

export interface SessionRecord {
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
}

function toRecord(doc: ISessionConfig): SessionRecord {
  return {
    sessionId: doc.sessionId,
    productType: doc.productType,
    label: doc.label,
    dates: doc.dates,
    time: doc.time,
    displayTime: doc.displayTime,
    city: doc.city,
    venue: doc.venue,
    isTwoDay: doc.isTwoDay ?? false,
    capacity: doc.capacity,
    isActive: doc.isActive,
    sortOrder: doc.sortOrder ?? 0,
  }
}

// ---------------------------------------------------------------------------
// Public helpers
// ---------------------------------------------------------------------------

/**
 * Returns all active sessions for a given product type, sorted by sortOrder.
 * Equivalent to SESSION_CONFIG[productType] in the old static file.
 */
export async function getSessionsForProductFromDB(
  productType: string,
): Promise<SessionRecord[]> {
  await connectToDatabase()
  const docs = await SessionConfig.find({ productType, isActive: true }, null, {
    sort: { sortOrder: 1, createdAt: 1 },
  }).lean()
  return docs.map(toRecord)
}

/**
 * Finds a session by its sessionId across all product types.
 * Equivalent to findSessionById() in the old static file.
 * Returns null if not found (does not throw).
 */
export async function findSessionByIdFromDB(
  sessionId: string,
): Promise<SessionRecord | null> {
  await connectToDatabase()
  const doc = await SessionConfig.findOne({ sessionId }).lean()
  return doc ? toRecord(doc) : null
}

/**
 * Returns ALL sessions grouped by productType (active + inactive).
 * Used by admin routes that need the full picture.
 */
export async function getAllSessionsFromDB(): Promise<
  Record<string, SessionRecord[]>
> {
  await connectToDatabase()
  const docs = await SessionConfig.find({}, null, {
    sort: { productType: 1, sortOrder: 1, createdAt: 1 },
  }).lean()

  const grouped: Record<string, SessionRecord[]> = {}
  for (const doc of docs) {
    if (!grouped[doc.productType]) grouped[doc.productType] = []
    grouped[doc.productType].push(toRecord(doc))
  }
  return grouped
}

/**
 * Returns only the active sessions grouped by productType.
 * Used by the public /api/sessions endpoint.
 */
export async function getActiveSessionsGrouped(): Promise<
  Record<string, SessionRecord[]>
> {
  await connectToDatabase()
  const docs = await SessionConfig.find({ isActive: true }, null, {
    sort: { sortOrder: 1, createdAt: 1 },
  }).lean()

  const grouped: Record<string, SessionRecord[]> = {}
  for (const doc of docs) {
    if (!grouped[doc.productType]) grouped[doc.productType] = []
    grouped[doc.productType].push(toRecord(doc))
  }
  return grouped
}

/**
 * Generates a unique sessionId from product type, city/label, and first date.
 * Example: "sig-lagos-mar-2026", "vm-mar-2026", "jaas-q1-2026"
 */
export function generateSessionId(
  productType: string,
  city: string,
  firstDate: string, // YYYY-MM-DD
): string {
  const prefix =
    productType === 'Virtual Masterclass'
      ? 'vm'
      : productType === 'Signature Live Masterclass'
        ? 'sig'
        : 'jaas'

  const [year, month] = firstDate.split('-')
  const monthNames = [
    '',
    'jan',
    'feb',
    'mar',
    'apr',
    'may',
    'jun',
    'jul',
    'aug',
    'sep',
    'oct',
    'nov',
    'dec',
  ]
  const monthStr = monthNames[parseInt(month, 10)] ?? month

  const citySlug = city
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .split('-')[0] // take first word only

  if (
    productType === 'Virtual Masterclass' ||
    productType === 'Private JaaS Consulting'
  ) {
    // No city needed for online sessions
    return `${prefix}-${monthStr}-${year}`
  }

  return `${prefix}-${citySlug}-${monthStr}-${year}`
}

/**
 * Auto-generates the displayTime string from a 24h time and city.
 * Example: "09:00", "Lagos" → "9:00 AM WAT"
 */
export function buildDisplayTime(time: string, city: string): string {
  const [hStr, mStr] = time.split(':')
  const h = parseInt(hStr ?? '0', 10)
  const m = parseInt(mStr ?? '0', 10)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h
  const mPad = String(m).padStart(2, '0')
  const timeStr = m === 0 ? `${h12}:00 ${ampm}` : `${h12}:${mPad} ${ampm}`

  const lower = city.toLowerCase()
  const tz = lower.includes('dubai')
    ? 'GST'
    : lower.includes('london')
      ? 'BST'
      : lower.includes('singapore')
        ? 'SGT'
        : 'WAT'

  return `${timeStr} ${tz}`
}
