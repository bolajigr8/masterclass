/**
 * CLIENT-SAFE — session dates and metadata for each product.
 * Dates are predefined here so users pick from options, not a free calendar.
 * This file is intentionally separate from pricing.ts (which is backend-only).
 */

export interface SessionOption {
  sessionId: string
  label: string // Short label for the dropdown
  dates: string[] // ISO date strings — single item or two for Signature
  time: string // 24h, e.g. '09:00'
  displayTime: string // Human-readable, e.g. '9:00 AM WAT'
  city: string
  venue?: string // Physical venue for live sessions
  isTwoDay?: boolean // Signature Live is always true
  spotsLeft?: number // Optional urgency indicator
}

export const SESSION_CONFIG: Record<string, SessionOption[]> = {
  'Virtual Masterclass': [
    {
      sessionId: 'vm-mar-2026',
      label: 'Series A — March 2026',
      dates: ['2026-03-03', '2026-03-10', '2026-03-17', '2026-03-24'],
      time: '18:00',
      displayTime: '6:00 PM WAT',
      city: 'Online (Zoom)',
    },
    {
      sessionId: 'vm-may-2026',
      label: 'Series B — May 2026',
      dates: ['2026-05-05', '2026-05-12', '2026-05-19', '2026-05-26'],
      time: '18:00',
      displayTime: '6:00 PM WAT',
      city: 'Online (Zoom)',
    },
    {
      sessionId: 'vm-jul-2026',
      label: 'Series C — July 2026',
      dates: ['2026-07-07', '2026-07-14', '2026-07-21', '2026-07-28'],
      time: '18:00',
      displayTime: '6:00 PM WAT',
      city: 'Online (Zoom)',
    },
  ],

  'Signature Live Masterclass': [
    {
      sessionId: 'sig-lagos-mar-2026',
      label: 'Lagos · Mar 14–15, 2026',
      dates: ['2026-03-14', '2026-03-15'],
      time: '09:00',
      displayTime: '9:00 AM WAT',
      city: 'Lagos',
      venue: 'Eko Hotel & Suites, Victoria Island',
      isTwoDay: true,
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
      spotsLeft: 25,
    },
  ],

  'Private JaaS Consulting': [
    {
      sessionId: 'jaas-q1-2026',
      label: 'Q1 2026 — Available Now',
      dates: ['2026-03-01'],
      time: '10:00',
      displayTime: 'Flexible (you schedule after booking)',
      city: 'Online (Zoom)',
    },
    {
      sessionId: 'jaas-q2-2026',
      label: 'Q2 2026 — April Onwards',
      dates: ['2026-04-01'],
      time: '10:00',
      displayTime: 'Flexible (you schedule after booking)',
      city: 'Online (Zoom)',
    },
  ],
}

export function getSessionsForProduct(productType: string): SessionOption[] {
  return SESSION_CONFIG[productType] ?? []
}

export function getSessionById(
  productType: string,
  sessionId: string,
): SessionOption | undefined {
  return SESSION_CONFIG[productType]?.find((s) => s.sessionId === sessionId)
}

/** Format an array of ISO dates for display, e.g. "March 14 & 15, 2026" */
export function formatSessionDates(
  dates: string[],
  isTwoDay: boolean | undefined,
): string {
  if (dates.length === 0) return ''
  if (dates.length === 1) {
    return new Date(dates[0]).toLocaleDateString('en-NG', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }
  // Two-day: "Saturday, March 14 & Sunday, March 15, 2026"
  const first = new Date(dates[0])
  const second = new Date(dates[1])
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
  'https://calendly.com/trila/consulting'
