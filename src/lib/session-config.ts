/**
 * CLIENT-SAFE — session dates, metadata, and capacity limits per product.
 * Dates are predefined so users pick from options, not a free calendar.
 * Capacity is the source of truth for the waitlist system.
 */

export interface SessionOption {
  sessionId: string
  label: string
  dates: string[] // ISO date strings — 1 item or 2 for Signature
  time: string // 24h, e.g. '09:00'
  displayTime: string // Human-readable, e.g. '9:00 AM WAT'
  city: string
  venue?: string
  isTwoDay?: boolean
  /** Maximum confirmed enrollments before waitlist kicks in */
  capacity: number
  /** Shown in the UI when spots are low (< 30% remaining) */
  spotsLeft?: number
}

export const SESSION_CONFIG: Record<string, SessionOption[]> = {
  'Virtual Masterclass': [
    {
      sessionId: 'vm-mar-2026',
      label: 'Series A — March 2026',
      dates: ['2026-04-03', '2026-04-10', '2026-04-17', '2026-04-24'],
      time: '18:00',
      displayTime: '6:00 PM WAT',
      city: 'Online (Zoom)',
      capacity: 200,
    },
    {
      sessionId: 'vm-may-2026',
      label: 'Series B — May 2026',
      dates: ['2026-05-05', '2026-05-12', '2026-05-19', '2026-05-26'],
      time: '18:00',
      displayTime: '6:00 PM WAT',
      city: 'Online (Zoom)',
      capacity: 200,
    },
    {
      sessionId: 'vm-jul-2026',
      label: 'Series C — July 2026',
      dates: ['2026-07-07', '2026-07-14', '2026-07-21', '2026-07-28'],
      time: '18:00',
      displayTime: '6:00 PM WAT',
      city: 'Online (Zoom)',
      capacity: 200,
    },
  ],

  'Signature Live Masterclass': [
    {
      sessionId: 'sig-lagos-mar-2026',
      label: 'Lagos · Mar 14–15, 2026',
      dates: ['2026-04-14', '2026-04-15'],
      time: '09:00',
      displayTime: '9:00 AM WAT',
      city: 'Lagos',
      venue: 'Eko Hotel & Suites, Victoria Island',
      isTwoDay: true,
      capacity: 50,
      spotsLeft: 12,
    },
    {
      sessionId: 'sig-dubai-apr-2026',
      label: 'Dubai · Apr 18–19, 2026',
      dates: ['2026-04-18', '2026-04-19'],
      time: '09:00',
      displayTime: '9:00 AM GST',
      city: 'Dubai',
      venue: 'DIFC, Gate Avenue District',
      isTwoDay: true,
      capacity: 50,
      spotsLeft: 18,
    },
    {
      sessionId: 'sig-london-jun-2026',
      label: 'London · Jun 13–14, 2026',
      dates: ['2026-06-13', '2026-06-14'],
      time: '09:00',
      displayTime: '9:00 AM BST',
      city: 'London',
      venue: 'Canary Wharf Conference Centre',
      isTwoDay: true,
      capacity: 50,
      spotsLeft: 20,
    },
    {
      sessionId: 'sig-singapore-sep-2026',
      label: 'Singapore · Sep 19–20, 2026',
      dates: ['2026-09-19', '2026-09-20'],
      time: '09:00',
      displayTime: '9:00 AM SGT',
      city: 'Singapore',
      venue: 'Marina Bay Sands Convention Centre',
      isTwoDay: true,
      capacity: 50,
      spotsLeft: 25,
    },
  ],

  'Private JaaS Consulting': [
    {
      sessionId: 'jaas-q1-2026',
      label: 'Q1 2026 — Available Now',
      dates: ['2026-04-01'],
      time: '10:00',
      displayTime: 'Flexible (you schedule after booking)',
      city: 'Online (Zoom)',
      capacity: 20,
    },
    {
      sessionId: 'jaas-q2-2026',
      label: 'Q2 2026 — April Onwards',
      dates: ['2026-04-01'],
      time: '10:00',
      displayTime: 'Flexible (you schedule after booking)',
      city: 'Online (Zoom)',
      capacity: 20,
    },
  ],
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function getSessionsForProduct(productType: string): SessionOption[] {
  return SESSION_CONFIG[productType] ?? []
}

export function getSessionById(
  productType: string,
  sessionId: string,
): SessionOption | undefined {
  return SESSION_CONFIG[productType]?.find((s) => s.sessionId === sessionId)
}

/** Find a session across all products by sessionId alone */
export function findSessionById(sessionId: string): SessionOption | undefined {
  for (const sessions of Object.values(SESSION_CONFIG)) {
    const found = sessions.find((s) => s.sessionId === sessionId)
    if (found) return found
  }
  return undefined
}

/** Format ISO date array for display — e.g. "Sat 14 & Sun 15, March 2026" */
export function formatSessionDates(
  dates: string[],
  isTwoDay?: boolean,
): string {
  if (dates.length === 0) return ''
  if (dates.length === 1 || !isTwoDay) {
    const [y, m, d] = dates[0].split('-').map(Number)
    return new Date(y, m - 1, d).toLocaleDateString('en-NG', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }
  const [y1, m1, d1] = dates[0].split('-').map(Number)
  const [y2, m2, d2] = dates[1].split('-').map(Number)
  const first = new Date(y1, m1 - 1, d1)
  const second = new Date(y2, m2 - 1, d2)
  const month = first.toLocaleDateString('en-NG', { month: 'long' })
  const year = first.getFullYear()
  const day1 = first.toLocaleDateString('en-NG', {
    weekday: 'short',
    day: 'numeric',
  })
  const day2 = second.toLocaleDateString('en-NG', {
    weekday: 'short',
    day: 'numeric',
  })
  return `${day1} & ${day2}, ${month} ${year}`
}

/** Scheduling link shown to consulting clients after payment */
export const CONSULTING_SCHEDULING_LINK =
  process.env.NEXT_PUBLIC_CONSULTING_SCHEDULING_LINK ??
  'https://calendly.com/Trila/consulting'

/**
 * CLIENT-SAFE — session dates, metadata, and capacity limits per product.
 * Sessions run hourly from Feb 22, 2026 14:00 WAT onward.
 * Capacity is the source of truth for the waitlist system.
 */

// export interface SessionOption {
//   sessionId: string
//   label: string
//   dates: string[] // ISO date strings — 1 item or 2 for Signature
//   time: string // 24h, e.g. '09:00'
//   displayTime: string // Human-readable, e.g. '2:00 PM WAT'
//   city: string
//   venue?: string
//   isTwoDay?: boolean
//   /** Maximum confirmed enrollments before waitlist kicks in */
//   capacity: number
//   /** Shown in the UI when spots are low (< 30% remaining) */
//   spotsLeft?: number
// }

// export const SESSION_CONFIG: Record<string, SessionOption[]> = {
//   'Virtual Masterclass': [
//     {
//       sessionId: 'vm-session-1',
//       label: 'Session 1 — Feb 22, 2026 · 6:00 PM',
//       dates: ['2026-02-22'],
//       time: '18:00',
//       displayTime: '6:00 PM WAT',
//       city: 'Online (Zoom)',
//       capacity: 200,
//     },
//     // {
//     //   sessionId: 'vm-session-2',
//     //   label: 'Session 2 — Feb 22, 2026 · 7:00 PM',
//     //   dates: ['2026-02-22'],
//     //   time: '19:00',
//     //   displayTime: '7:00 PM WAT',
//     //   city: 'Online (Zoom)',
//     //   capacity: 200,
//     // },
//     // {
//     //   sessionId: 'vm-session-3',
//     //   label: 'Session 3 — Feb 22, 2026 · 8:00 PM',
//     //   dates: ['2026-02-22'],
//     //   time: '20:00',
//     //   displayTime: '8:00 PM WAT',
//     //   city: 'Online (Zoom)',
//     //   capacity: 200,
//     // },
//     // {
//     //   sessionId: 'vm-session-4',
//     //   label: 'Session 4 — Feb 22, 2026 · 9:00 PM',
//     //   dates: ['2026-02-22'],
//     //   time: '21:00',
//     //   displayTime: '9:00 PM WAT',
//     //   city: 'Online (Zoom)',
//     //   capacity: 200,
//     // },
//   ],

//   'Signature Live Masterclass': [
//     {
//       sessionId: 'sig-session-1',
//       label: 'Session 1 — Feb 22, 2026 · 6:00 PM',
//       dates: ['2026-02-22', '2026-02-23'],
//       time: '18:00',
//       displayTime: '6:00 PM WAT',
//       city: 'Lagos',
//       venue: 'Eko Hotel & Suites, Victoria Island',
//       isTwoDay: true,
//       capacity: 50,
//       spotsLeft: 12,
//     },
//     // {
//     //   sessionId: 'sig-session-2',
//     //   label: 'Session 2 — Feb 22, 2026 · 7:00 PM',
//     //   dates: ['2026-02-22', '2026-02-22'],
//     //   time: '19:00',
//     //   displayTime: '7:00 PM WAT',
//     //   city: 'Dubai',
//     //   venue: 'DIFC, Gate Avenue District',
//     //   isTwoDay: false,
//     //   capacity: 50,
//     //   spotsLeft: 18,
//     // },
//     // {
//     //   sessionId: 'sig-session-3',
//     //   label: 'Session 3 — Feb 22, 2026 · 8:00 PM',
//     //   dates: ['2026-02-22', '2026-02-22'],
//     //   time: '20:00',
//     //   displayTime: '8:00 PM WAT',
//     //   city: 'London',
//     //   venue: 'Canary Wharf Conference Centre',
//     //   isTwoDay: false,
//     //   capacity: 50,
//     //   spotsLeft: 20,
//     // },
//     // {
//     //   sessionId: 'sig-session-4',
//     //   label: 'Session 4 — Feb 22, 2026 · 9:00 PM',
//     //   dates: ['2026-02-22', '2026-02-22'],
//     //   time: '21:00',
//     //   displayTime: '9:00 PM WAT',
//     //   city: 'Singapore',
//     //   venue: 'Marina Bay Sands Convention Centre',
//     //   isTwoDay: false,
//     //   capacity: 50,
//     //   spotsLeft: 25,
//     // },
//   ],

//   'Private JaaS Consulting': [
//     {
//       sessionId: 'jaas-session-1',
//       label: 'Session 1 — Feb 22, 2026 · 6:00 PM',
//       dates: ['2026-02-22'],
//       time: '18:00',
//       displayTime: '6:00 PM WAT (Flexible after booking)',
//       city: 'Online (Zoom)',
//       capacity: 20,
//     },
//     // {
//     //   sessionId: 'jaas-session-2',
//     //   label: 'Session 2 — Feb 22, 2026 · 7:00 PM',
//     //   dates: ['2026-02-22'],
//     //   time: '19:00',
//     //   displayTime: '7:00 PM WAT (Flexible after booking)',
//     //   city: 'Online (Zoom)',
//     //   capacity: 20,
//     // },
//   ],
// }

// // ---------------------------------------------------------------------------
// // Helpers
// // ---------------------------------------------------------------------------

// export function getSessionsForProduct(productType: string): SessionOption[] {
//   return SESSION_CONFIG[productType] ?? []
// }

// export function getSessionById(
//   productType: string,
//   sessionId: string,
// ): SessionOption | undefined {
//   return SESSION_CONFIG[productType]?.find((s) => s.sessionId === sessionId)
// }

// /** Find a session across all products by sessionId alone */
// export function findSessionById(sessionId: string): SessionOption | undefined {
//   for (const sessions of Object.values(SESSION_CONFIG)) {
//     const found = sessions.find((s) => s.sessionId === sessionId)
//     if (found) return found
//   }
//   return undefined
// }

// /** Format ISO date array for display — e.g. "Sat 22, February 2026" */
// export function formatSessionDates(
//   dates: string[],
//   isTwoDay?: boolean,
// ): string {
//   if (dates.length === 0) return ''
//   if (dates.length === 1 || !isTwoDay) {
//     const [y, m, d] = dates[0].split('-').map(Number)
//     return new Date(y, m - 1, d).toLocaleDateString('en-NG', {
//       weekday: 'long',
//       year: 'numeric',
//       month: 'long',
//       day: 'numeric',
//     })
//   }
//   const [y1, m1, d1] = dates[0].split('-').map(Number)
//   const [y2, m2, d2] = dates[1].split('-').map(Number)
//   const first = new Date(y1, m1 - 1, d1)
//   const second = new Date(y2, m2 - 1, d2)
//   const month = first.toLocaleDateString('en-NG', { month: 'long' })
//   const year = first.getFullYear()
//   const day1 = first.toLocaleDateString('en-NG', {
//     weekday: 'short',
//     day: 'numeric',
//   })
//   const day2 = second.toLocaleDateString('en-NG', {
//     weekday: 'short',
//     day: 'numeric',
//   })
//   return `${day1} & ${day2}, ${month} ${year}`
// }

// /** Scheduling link shown to consulting clients after payment */
// export const CONSULTING_SCHEDULING_LINK =
//   process.env.NEXT_PUBLIC_CONSULTING_SCHEDULING_LINK ??
//   'https://calendly.com/Trila/consulting'
