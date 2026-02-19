'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  CheckCircle2,
  XCircle,
  Loader2,
  MapPin,
  Calendar,
  Clock,
  ShieldCheck,
  AlertTriangle,
  ChevronRight,
} from 'lucide-react'
import { SESSION_CONFIG } from '@/lib/session-config'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type PageState =
  | { status: 'form' }
  | { status: 'loading' }
  | { status: 'success'; data: CheckInSuccess }
  | { status: 'already-checked-in'; details: string; day: 1 | 2 }
  | { status: 'error'; title: string; details: string }

interface CheckInSuccess {
  name: string
  email: string
  enrollmentReference: string
  sessionDate: string
  sessionTime: string
  venue?: string
  city?: string
  isTwoDay: boolean
  day: 1 | 2
  checkedInAt: string
  checkedInDay1: boolean
  checkedInDay1At?: string
  checkedInDay2: boolean
  checkedInDay2At?: string
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(iso: string): string {
  // Parse as local date to avoid UTC-shift off-by-one
  const [year, month, day] = iso.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString('en-NG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-NG', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

/** Resolve a human-readable session label from session-config given a sessionId */
function resolveSession(sessionId: string) {
  for (const sessions of Object.values(SESSION_CONFIG)) {
    const found = sessions.find((s) => s.sessionId === sessionId)
    if (found) return found
  }
  return null
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SuccessScreen({ data }: { data: CheckInSuccess }) {
  const dayLabel = data.isTwoDay ? `Day ${data.day}` : 'Event'

  return (
    <div className='flex min-h-screen flex-col items-center justify-center bg-[#030f1c] px-5 py-12'>
      {/* Glow */}
      <div className='pointer-events-none absolute inset-0 flex items-center justify-center'>
        <div className='h-64 w-64 rounded-full bg-green-500/10 blur-[80px]' />
      </div>

      <div className='relative w-full max-w-sm text-center'>
        {/* Icon */}
        <div className='mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full border-4 border-green-500/30 bg-green-500/10'>
          <CheckCircle2 size={52} className='text-green-400' />
        </div>

        {/* Badge */}
        <div className='mb-3 inline-flex items-center gap-2 rounded-full border border-green-500/20 bg-green-500/10 px-4 py-1.5'>
          <ShieldCheck size={13} className='text-green-400' />
          <span className='font-mono text-xs font-bold uppercase tracking-widest text-green-400'>
            Access Granted — {dayLabel}
          </span>
        </div>

        {/* Name */}
        <h1 className='mb-1 text-3xl font-extrabold text-white'>
          Welcome, {data.name.split(' ')[0]}!
        </h1>
        <p className='mb-8 text-sm text-white/40'>
          You are checked in for{' '}
          <span className='font-semibold text-white/70'>{dayLabel}</span>
        </p>

        {/* Details card */}
        <div className='mb-6 w-full rounded-2xl border border-white/8 bg-white/5 p-5 text-left space-y-3'>
          {data.sessionDate && (
            <div className='flex items-start gap-3'>
              <Calendar size={15} className='mt-0.5 shrink-0 text-[#4a9eff]' />
              <div>
                <p className='text-[11px] font-semibold uppercase tracking-wide text-white/30'>
                  Date
                </p>
                <p className='text-sm text-white/80'>
                  {formatDate(data.sessionDate)}
                </p>
              </div>
            </div>
          )}

          {data.sessionTime && (
            <div className='flex items-start gap-3'>
              <Clock size={15} className='mt-0.5 shrink-0 text-[#4a9eff]' />
              <div>
                <p className='text-[11px] font-semibold uppercase tracking-wide text-white/30'>
                  Start Time
                </p>
                <p className='text-sm text-white/80'>{data.sessionTime}</p>
              </div>
            </div>
          )}

          {data.venue && (
            <div className='flex items-start gap-3'>
              <MapPin size={15} className='mt-0.5 shrink-0 text-[#4a9eff]' />
              <div>
                <p className='text-[11px] font-semibold uppercase tracking-wide text-white/30'>
                  Venue
                </p>
                <p className='text-sm text-white/80'>{data.venue}</p>
                {data.city && (
                  <p className='text-xs text-white/40'>{data.city}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Reference */}
        <div className='mb-6 rounded-xl border border-white/10 bg-white/5 px-4 py-3'>
          <p className='mb-1 text-[11px] font-bold uppercase tracking-wider text-white/30'>
            Enrollment Reference
          </p>
          <p className='font-mono text-lg font-bold tracking-widest text-white'>
            {data.enrollmentReference}
          </p>
        </div>

        {/* Day 2 reminder */}
        {data.isTwoDay && data.day === 1 && !data.checkedInDay2 && (
          <div className='rounded-xl border border-[#d4a422]/20 bg-[#d4a422]/8 px-4 py-3 text-left'>
            <p className='mb-1 text-[11px] font-bold uppercase tracking-wider text-[#d4a422]'>
              Day 2 Reminder
            </p>
            <p className='text-xs text-white/50'>
              Remember to scan the{' '}
              <strong className='text-white/70'>Day 2 QR code</strong> at the
              entrance tomorrow. Your reference number is the same.
            </p>
          </div>
        )}

        {/* Check-in timestamp */}
        <p className='mt-6 text-center text-[11px] text-white/25'>
          Checked in at {formatTime(data.checkedInAt)}
        </p>
      </div>
    </div>
  )
}

function AlreadyCheckedInScreen({
  details,
  day,
}: {
  details: string
  day: 1 | 2
}) {
  return (
    <div className='flex min-h-screen flex-col items-center justify-center bg-[#030f1c] px-5 py-12'>
      <div className='w-full max-w-sm text-center'>
        <div className='mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border-4 border-[#4a9eff]/20 bg-[#4a9eff]/8'>
          <CheckCircle2 size={44} className='text-[#4a9eff]' />
        </div>

        <div className='mb-3 inline-flex items-center gap-2 rounded-full border border-[#4a9eff]/20 bg-[#4a9eff]/10 px-4 py-1.5'>
          <ShieldCheck size={13} className='text-[#4a9eff]' />
          <span className='font-mono text-xs font-bold uppercase tracking-widest text-[#4a9eff]'>
            Already Checked In — Day {day}
          </span>
        </div>

        <h1 className='mb-3 text-2xl font-extrabold text-white'>
          You're already in!
        </h1>
        <p className='mb-6 text-sm leading-relaxed text-white/40'>{details}</p>

        <div className='rounded-xl border border-white/8 bg-white/5 px-4 py-3 text-sm text-white/50'>
          If you believe this is an error, please speak with event staff at the
          registration desk.
        </div>
      </div>
    </div>
  )
}

function ErrorScreen({
  title,
  details,
  onRetry,
}: {
  title: string
  details: string
  onRetry: () => void
}) {
  return (
    <div className='flex min-h-screen flex-col items-center justify-center bg-[#030f1c] px-5 py-12'>
      <div className='w-full max-w-sm text-center'>
        <div className='mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border-4 border-red-500/20 bg-red-500/8'>
          <XCircle size={44} className='text-red-400' />
        </div>

        <h1 className='mb-2 text-2xl font-extrabold text-white'>{title}</h1>
        <p className='mb-8 text-sm leading-relaxed text-white/40'>{details}</p>

        <button
          onClick={onRetry}
          className='flex w-full items-center justify-center gap-2 rounded-xl bg-[#2563eb] px-6 py-3.5 text-sm font-bold text-white transition-colors hover:bg-[#1d4ed8] active:scale-[0.98]'
        >
          Try Again
          <ChevronRight size={15} />
        </button>

        <p className='mt-6 text-[11px] text-white/20'>
          If the problem persists, speak to event staff.
        </p>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Input styling
// ---------------------------------------------------------------------------

const inputBase =
  'w-full rounded-xl border bg-white/5 px-4 py-3.5 text-[15px] text-white placeholder:text-white/25 focus:outline-none focus:ring-2 transition-colors'

function inputClass(hasError: boolean) {
  return `${inputBase} ${
    hasError
      ? 'border-red-500/50 focus:border-red-500/60 focus:ring-red-500/20'
      : 'border-white/10 hover:border-white/20 focus:border-[#2563eb]/60 focus:ring-[#2563eb]/20'
  }`
}

// ---------------------------------------------------------------------------
// Main form content (separated so it can use useSearchParams inside Suspense)
// ---------------------------------------------------------------------------

function CheckInContent() {
  const searchParams = useSearchParams()

  // Read sessionId and day from QR code URL params
  const sessionIdFromUrl = searchParams.get('sessionId') ?? ''
  const dayFromUrl: 1 | 2 = searchParams.get('day') === '2' ? 2 : 1

  // Resolve session metadata from config (for display only)
  const sessionMeta = sessionIdFromUrl ? resolveSession(sessionIdFromUrl) : null

  const [pageState, setPageState] = useState<PageState>({ status: 'form' })
  const [email, setEmail] = useState('')
  const [reference, setReference] = useState('')
  const [errors, setErrors] = useState<{ email?: string; reference?: string }>(
    {},
  )

  const emailRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    emailRef.current?.focus()
  }, [])

  // ── Validation ────────────────────────────────────────────────────────────
  function validate(): boolean {
    const newErrors: typeof errors = {}
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address'
    }
    if (!reference.trim() || reference.trim().length < 6) {
      newErrors.reference = 'Please enter your enrollment reference'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    if (!sessionIdFromUrl) {
      setPageState({
        status: 'error',
        title: 'Invalid QR Code',
        details:
          'This check-in link is missing a session ID. Please scan the QR code at the event entrance again.',
      })
      return
    }

    setPageState({ status: 'loading' })

    try {
      const res = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          enrollmentReference: reference.trim().toUpperCase(),
          sessionId: sessionIdFromUrl,
          day: dayFromUrl,
        }),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        setPageState({
          status: 'success',
          data: {
            ...data.attendee,
            day: dayFromUrl,
            checkedInAt: data.checkedInAt,
          },
        })
        return
      }

      // 409 = already checked in — informational, not a hard error
      if (res.status === 409) {
        setPageState({
          status: 'already-checked-in',
          details: data.details ?? 'You have already checked in for this day.',
          day: dayFromUrl,
        })
        return
      }

      // All other non-2xx responses
      setPageState({
        status: 'error',
        title: data.error ?? 'Check-In Failed',
        details:
          data.details ??
          'An unexpected error occurred. Please contact event staff.',
      })
    } catch {
      setPageState({
        status: 'error',
        title: 'Connection Error',
        details:
          'Could not reach the check-in server. Please check your internet connection and try again.',
      })
    }
  }

  function resetToForm() {
    setPageState({ status: 'form' })
    setErrors({})
    setTimeout(() => emailRef.current?.focus(), 50)
  }

  // ── Render states ─────────────────────────────────────────────────────────
  if (pageState.status === 'success') {
    return <SuccessScreen data={pageState.data} />
  }

  if (pageState.status === 'already-checked-in') {
    return (
      <AlreadyCheckedInScreen details={pageState.details} day={pageState.day} />
    )
  }

  if (pageState.status === 'error') {
    return (
      <ErrorScreen
        title={pageState.title}
        details={pageState.details}
        onRetry={resetToForm}
      />
    )
  }

  const isLoading = pageState.status === 'loading'

  // ── Form ──────────────────────────────────────────────────────────────────
  return (
    <div className='flex min-h-screen flex-col bg-[#030f1c]'>
      {/* Header strip */}
      <div className='border-b border-white/5 bg-[#040f1e] px-5 py-4'>
        <div className='mx-auto flex max-w-sm items-center justify-between'>
          <div className='flex items-center gap-2.5'>
            {/* Trila wordmark */}
            <div className='flex h-7 w-7 items-center justify-center rounded-lg bg-[#2563eb]'>
              <span className='font-mono text-[11px] font-black text-white'>
                T
              </span>
            </div>
            <span className='font-mono text-sm font-bold tracking-tight text-white'>
              Trila
            </span>
          </div>

          {/* Day badge */}
          <div className='flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1'>
            <ShieldCheck size={11} className='text-[#4a9eff]' />
            <span className='font-mono text-[11px] font-bold uppercase tracking-widest text-white/60'>
              Day {dayFromUrl} Check-In
            </span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className='flex flex-1 flex-col items-center justify-center px-5 py-10'>
        <div className='w-full max-w-sm'>
          {/* Session info banner — shown when sessionId resolves */}
          {sessionMeta && (
            <div className='mb-6 rounded-2xl border border-white/8 bg-white/4 p-4'>
              <p className='mb-2 text-[10px] font-bold uppercase tracking-widest text-white/25'>
                Signature Live Masterclass
              </p>
              <p className='text-sm font-semibold text-white/80'>
                {sessionMeta.label}
              </p>
              <div className='mt-2.5 flex flex-wrap items-center gap-3 text-xs text-white/40'>
                {sessionMeta.dates[dayFromUrl - 1] && (
                  <span className='flex items-center gap-1.5'>
                    <Calendar size={11} />
                    {formatDate(sessionMeta.dates[dayFromUrl - 1])}
                  </span>
                )}
                {sessionMeta.displayTime && (
                  <span className='flex items-center gap-1.5'>
                    <Clock size={11} />
                    {sessionMeta.displayTime}
                  </span>
                )}
                {sessionMeta.venue && (
                  <span className='flex items-center gap-1.5'>
                    <MapPin size={11} />
                    {sessionMeta.venue}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Unknown session warning */}
          {!sessionMeta && sessionIdFromUrl && (
            <div className='mb-6 flex items-start gap-3 rounded-xl border border-yellow-500/20 bg-yellow-500/8 px-4 py-3'>
              <AlertTriangle
                size={15}
                className='mt-0.5 shrink-0 text-yellow-400'
              />
              <p className='text-xs text-yellow-300/80'>
                Session not recognised. Make sure you scanned the correct QR
                code for this event.
              </p>
            </div>
          )}

          {/* No session ID — bad URL */}
          {!sessionIdFromUrl && (
            <div className='mb-6 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/8 px-4 py-3'>
              <AlertTriangle
                size={15}
                className='mt-0.5 shrink-0 text-red-400'
              />
              <p className='text-xs text-red-300/80'>
                This link is missing a session ID. Please scan the QR code at
                the venue entrance.
              </p>
            </div>
          )}

          {/* Title */}
          <h1 className='mb-1 text-2xl font-extrabold text-white'>
            Event Check-In
          </h1>
          <p className='mb-7 text-[13px] text-white/35'>
            Enter the email and reference from your confirmation email.
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className='space-y-4'>
            {/* Email */}
            <div>
              <label className='mb-2 block text-[12px] font-bold uppercase tracking-wider text-white/35'>
                Email Address
              </label>
              <input
                ref={emailRef}
                type='email'
                inputMode='email'
                autoComplete='email'
                placeholder='you@email.com'
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (errors.email)
                    setErrors((p) => ({ ...p, email: undefined }))
                }}
                disabled={isLoading}
                className={inputClass(!!errors.email)}
              />
              {errors.email && (
                <p className='mt-1.5 text-xs text-red-400'>{errors.email}</p>
              )}
            </div>

            {/* Enrollment reference */}
            <div>
              <label className='mb-2 block text-[12px] font-bold uppercase tracking-wider text-white/35'>
                Enrollment Reference
              </label>
              <input
                type='text'
                inputMode='text'
                autoComplete='off'
                autoCapitalize='characters'
                placeholder='ENR-1234567890-XXXX'
                value={reference}
                onChange={(e) => {
                  // Auto-uppercase as they type — reference is always stored uppercase
                  setReference(e.target.value.toUpperCase())
                  if (errors.reference)
                    setErrors((p) => ({ ...p, reference: undefined }))
                }}
                disabled={isLoading}
                className={`${inputClass(!!errors.reference)} font-mono tracking-widest`}
              />
              {errors.reference && (
                <p className='mt-1.5 text-xs text-red-400'>
                  {errors.reference}
                </p>
              )}
              <p className='mt-1.5 text-[11px] text-white/20'>
                Find this in your enrollment confirmation email (e.g.
                ENR-1234567890-ABCD)
              </p>
            </div>

            {/* Submit */}
            <button
              type='submit'
              disabled={isLoading || !sessionIdFromUrl}
              className='mt-2 flex w-full items-center justify-center gap-2.5 rounded-xl bg-[#2563eb] px-6 py-4 text-[15px] font-bold text-white shadow-lg shadow-[#2563eb]/20 transition-all hover:bg-[#1d4ed8] hover:shadow-[#1d4ed8]/30 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50'
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className='animate-spin' />
                  Verifying…
                </>
              ) : (
                <>
                  <ShieldCheck size={18} />
                  Check In — Day {dayFromUrl}
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Footer */}
      <div className='border-t border-white/5 px-5 py-4 text-center'>
        <p className='text-[11px] text-white/15'>
          Trila Inc · Masterclass Event Management
        </p>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Page export — Suspense boundary required for useSearchParams in Next.js App Router
// ---------------------------------------------------------------------------

export default function CheckInPage() {
  return (
    <Suspense
      fallback={
        <div className='flex min-h-screen items-center justify-center bg-[#030f1c]'>
          <Loader2 size={32} className='animate-spin text-[#4a9eff]' />
        </div>
      }
    >
      <CheckInContent />
    </Suspense>
  )
}
