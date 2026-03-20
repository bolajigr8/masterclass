'use client'

import { Suspense, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import {
  Users,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Clock,
  Mail,
  PartyPopper,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

type PageState =
  | { status: 'idle' }
  | { status: 'submitting' }
  | {
      status: 'success'
      position: number
      sessionLabel: string
      email: string
    }
  | { status: 'already_waitlisted'; position: number; sessionLabel: string }
  | { status: 'spot_available'; spotsAvailable: number }
  | { status: 'already_enrolled' }
  | { status: 'bad_link' }
  | { status: 'error'; message: string }

// ─── Inner component (uses useSearchParams — must be inside <Suspense>) ───────

function WaitlistInner() {
  const searchParams = useSearchParams()
  const router = useRouter()

  // ── Read params ────────────────────────────────────────────────────────────
  const productType = searchParams.get('productType') ?? ''
  const sessionId = searchParams.get('sessionId') ?? ''
  const sessionLabel =
    searchParams.get('sessionLabel') || productType || 'your session'

  // ── Pre-filled but editable form state ────────────────────────────────────
  const [localName, setLocalName] = useState(searchParams.get('name') ?? '')
  const [localEmail, setLocalEmail] = useState(searchParams.get('email') ?? '')
  const [localPhone, setLocalPhone] = useState(searchParams.get('phone') ?? '')
  const [localCity, setLocalCity] = useState(searchParams.get('city') ?? '')

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [pageState, setPageState] = useState<PageState>({ status: 'idle' })

  // ── Validate ───────────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const errs: Record<string, string> = {}
    if (!localName.trim() || localName.trim().length < 2)
      errs.name = 'Name must be at least 2 characters'
    if (
      !localEmail.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(localEmail.trim())
    )
      errs.email = 'Please enter a valid email address'
    if (localPhone.replace(/\s+/g, '').length < 10)
      errs.phone = 'Phone number must be at least 10 digits'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!validate()) return

    setPageState({ status: 'submitting' })

    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: localName.trim(),
          email: localEmail.trim().toLowerCase(),
          phone: localPhone.replace(/\s+/g, ''),
          city: localCity.trim() || undefined,
          productType,
          sessionId,
        }),
      })

      const data = await res.json()

      // ── Success: newly added ───────────────────────────────────────────
      if (res.status === 201) {
        setPageState({
          status: 'success',
          position: data.position,
          sessionLabel: data.sessionLabel ?? sessionLabel,
          email: localEmail.trim().toLowerCase(),
        })
        return
      }

      // ── 409 branch ────────────────────────────────────────────────────
      if (res.status === 409) {
        if (data.error === 'Already on waitlist.') {
          setPageState({
            status: 'already_waitlisted',
            position: data.position,
            sessionLabel,
          })
          return
        }
        if (data.error === 'Session is not full.') {
          setPageState({
            status: 'spot_available',
            spotsAvailable: data.spotsAvailable ?? 1,
          })
          return
        }
        if (data.error === 'Already enrolled.') {
          setPageState({ status: 'already_enrolled' })
          return
        }
      }

      // ── Any other error ────────────────────────────────────────────────
      setPageState({
        status: 'error',
        message:
          data.details ??
          data.error ??
          'Something went wrong. Please try again.',
      })
    } catch {
      setPageState({
        status: 'error',
        message: 'Network error. Please check your connection and try again.',
      })
    }
  }

  // ── Shared input class helper ──────────────────────────────────────────────
  const inputClass = (field: string) =>
    `w-full rounded-xl border ${
      errors[field] ? 'border-red-500/60' : 'border-white/10'
    } bg-[#0d1a35] px-4 py-3 text-[13.5px] text-white placeholder:text-white/25 focus:border-[#2563eb]/60 focus:outline-none focus:ring-1 focus:ring-[#2563eb]/40 hover:border-white/20 transition-colors`

  // ── Missing required params — bad link ────────────────────────────────────
  if (!productType || !sessionId) {
    return (
      <main className='flex min-h-screen flex-col items-center justify-center bg-[#050b18] px-4 text-center'>
        <div className='mb-6 rounded-full bg-red-500/10 p-5'>
          <AlertCircle size={48} className='text-red-400' />
        </div>
        <h1 className='mb-3 text-2xl font-extrabold text-white'>
          Invalid Waitlist Link
        </h1>
        <p className='mb-8 text-[14px] text-white/45 max-w-sm leading-relaxed'>
          This link is missing required information. Please return to the site
          and try joining the waitlist again.
        </p>
        <button
          onClick={() => router.push('/')}
          className='flex items-center gap-2 rounded-xl bg-[#2563eb] px-6 py-3 text-[13px] font-bold text-white hover:bg-[#1d4ed8] transition-colors'
        >
          <ArrowLeft size={14} />
          Back to Home
        </button>
      </main>
    )
  }

  // ── Success state ─────────────────────────────────────────────────────────
  if (pageState.status === 'success') {
    return (
      <main className='flex min-h-screen flex-col items-center justify-center bg-[#050b18] px-4 py-16'>
        <div className='w-full max-w-md text-center'>
          {/* Icon */}
          <div className='mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10'>
            <CheckCircle2 size={44} className='text-green-400' />
          </div>

          <h1 className='mb-2 text-3xl font-extrabold text-white'>
            You're on the list!
          </h1>
          <p className='mb-8 text-[14px] text-white/50 leading-relaxed'>
            You're{' '}
            <span className='font-bold text-white'>#{pageState.position}</span>{' '}
            on the waitlist for{' '}
            <span className='font-semibold text-white/80'>
              {pageState.sessionLabel}
            </span>
            .
          </p>

          {/* Info card */}
          <div className='rounded-2xl border border-white/10 bg-[#0b1628] overflow-hidden text-left mb-6'>
            <div className='border-b border-white/8 px-5 py-3.5'>
              <p className='text-[11px] font-bold uppercase tracking-[0.15em] text-white/30'>
                What Happens Next
              </p>
            </div>
            <div className='px-5 py-5 space-y-4'>
              {[
                {
                  icon: Mail,
                  color: 'text-[#4a9eff]',
                  title: 'Check your email',
                  desc: `We've sent a confirmation to ${pageState.email}. Keep it — it has your waitlist position and reference.`,
                },
                {
                  icon: Clock,
                  color: 'text-amber-400',
                  title: "We'll notify you instantly",
                  desc: "The moment a seat opens from a cancellation or new session, you'll receive an email with a 24-hour window to complete payment.",
                },
                {
                  icon: PartyPopper,
                  color: 'text-green-400',
                  title: 'Secure your spot',
                  desc: 'Click the link in the notification email and complete payment to lock in your seat. No re-entering details needed.',
                },
              ].map(({ icon: Icon, color, title, desc }) => (
                <div key={title} className='flex gap-3'>
                  <div className='mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/5'>
                    <Icon size={14} className={color} />
                  </div>
                  <div>
                    <p className='text-[13px] font-bold text-white leading-snug'>
                      {title}
                    </p>
                    <p className='mt-0.5 text-[12px] text-white/45 leading-relaxed'>
                      {desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => router.push('/')}
            className='w-full rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-[13px] font-semibold text-white/70 hover:bg-white/10 hover:text-white transition-colors'
          >
            Back to Home
          </button>
        </div>
      </main>
    )
  }

  // ── Already on waitlist ───────────────────────────────────────────────────
  if (pageState.status === 'already_waitlisted') {
    return (
      <main className='flex min-h-screen flex-col items-center justify-center bg-[#050b18] px-4 text-center'>
        <div className='mb-6 rounded-full bg-[#4a9eff]/10 p-5'>
          <Users size={48} className='text-[#4a9eff]' />
        </div>
        <h1 className='mb-2 text-2xl font-extrabold text-white'>
          You're already on the waitlist
        </h1>
        <p className='mb-2 text-[14px] text-white/50 max-w-sm leading-relaxed'>
          Your current position for{' '}
          <span className='font-semibold text-white/80'>
            {pageState.sessionLabel}
          </span>{' '}
          is <span className='font-bold text-white'>#{pageState.position}</span>
          .
        </p>
        <p className='mb-8 text-[13px] text-white/35 max-w-sm'>
          We'll email you the moment a seat opens. No action needed.
        </p>
        <button
          onClick={() => router.push('/')}
          className='rounded-xl bg-[#2563eb] px-8 py-3 text-[13px] font-bold text-white hover:bg-[#1d4ed8] transition-colors'
        >
          Back to Home
        </button>
      </main>
    )
  }

  // ── Spot is actually available ─────────────────────────────────────────────
  if (pageState.status === 'spot_available') {
    return (
      <main className='flex min-h-screen flex-col items-center justify-center bg-[#050b18] px-4 text-center'>
        <div className='mb-6 rounded-full bg-green-500/10 p-5'>
          <PartyPopper size={48} className='text-green-400' />
        </div>
        <h1 className='mb-3 text-2xl font-extrabold text-white'>
          Good news — spots are available!
        </h1>
        <p className='mb-8 text-[14px] text-white/50 max-w-sm leading-relaxed'>
          {pageState.spotsAvailable}{' '}
          {pageState.spotsAvailable === 1 ? 'seat is' : 'seats are'} still open
          for this session. Enroll now before they're gone.
        </p>
        <button
          onClick={() => router.push('/#pricing')}
          className='rounded-xl bg-green-500 px-8 py-3.5 text-[14px] font-bold text-white hover:bg-green-400 transition-colors'
        >
          Enroll Now →
        </button>
      </main>
    )
  }

  // ── Already enrolled ──────────────────────────────────────────────────────
  if (pageState.status === 'already_enrolled') {
    return (
      <main className='flex min-h-screen flex-col items-center justify-center bg-[#050b18] px-4 text-center'>
        <div className='mb-6 rounded-full bg-green-500/10 p-5'>
          <CheckCircle2 size={48} className='text-green-400' />
        </div>
        <h1 className='mb-3 text-2xl font-extrabold text-white'>
          You're already enrolled
        </h1>
        <p className='mb-8 text-[14px] text-white/50 max-w-sm leading-relaxed'>
          This email already has a confirmed enrollment for this session. Check
          your inbox for your enrollment details and access credentials.
        </p>
        <div className='flex gap-3'>
          <a
            href='mailto:masterclass@Trila.pro'
            className='rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-[13px] font-semibold text-white/70 hover:bg-white/10 transition-colors'
          >
            Contact Support
          </a>
          <button
            onClick={() => router.push('/')}
            className='rounded-xl bg-[#2563eb] px-6 py-3 text-[13px] font-bold text-white hover:bg-[#1d4ed8] transition-colors'
          >
            Back to Home
          </button>
        </div>
      </main>
    )
  }

  // ── Generic error ─────────────────────────────────────────────────────────
  if (pageState.status === 'error') {
    return (
      <main className='flex min-h-screen flex-col items-center justify-center bg-[#050b18] px-4 text-center'>
        <div className='mb-6 rounded-full bg-red-500/10 p-5'>
          <AlertCircle size={48} className='text-red-400' />
        </div>
        <h1 className='mb-3 text-2xl font-extrabold text-white'>
          Something went wrong
        </h1>
        <p className='mb-8 text-[14px] text-white/50 max-w-sm leading-relaxed'>
          {pageState.message}
        </p>
        <div className='flex gap-3'>
          <button
            onClick={() => setPageState({ status: 'idle' })}
            className='rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-[13px] font-semibold text-white/70 hover:bg-white/10 transition-colors'
          >
            Try Again
          </button>
          <a
            href='mailto:masterclass@Trila.pro'
            className='rounded-xl bg-[#2563eb] px-6 py-3 text-[13px] font-bold text-white hover:bg-[#1d4ed8] transition-colors'
          >
            Contact Support
          </a>
        </div>
      </main>
    )
  }

  // ── Main form (idle | submitting) ─────────────────────────────────────────
  const isSubmitting = pageState.status === 'submitting'

  return (
    <main className='flex min-h-screen flex-col items-center justify-center bg-[#050b18] px-4 py-16'>
      {/* Background glow */}
      <div className='pointer-events-none fixed inset-0 flex items-center justify-center'>
        <div className='h-96 w-96 rounded-full bg-amber-500/5 blur-[140px]' />
      </div>

      <div className='relative w-full max-w-md'>
        {/* Back link */}
        <button
          onClick={() => router.back()}
          className='mb-6 flex items-center gap-1.5 text-[12px] text-white/35 hover:text-white/60 transition-colors'
        >
          <ArrowLeft size={13} />
          Back
        </button>

        {/* Header */}
        <div className='mb-6 flex items-center gap-3'>
          <div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/15'>
            <Users size={20} className='text-amber-400' />
          </div>
          <div>
            <h1 className='text-[18px] font-extrabold text-white leading-snug'>
              Join the Waitlist
            </h1>
            <p className='text-[12px] text-white/40 leading-snug'>
              {sessionLabel}
            </p>
          </div>
        </div>

        {/* Card */}
        <div className='rounded-2xl border border-white/10 bg-[#0b1628] overflow-hidden'>
          {/* Session info strip */}
          <div className='flex items-start gap-3 border-b border-white/8 bg-amber-500/5 px-5 py-4'>
            <AlertCircle size={14} className='mt-0.5 shrink-0 text-amber-400' />
            <p className='text-[12px] text-amber-400/80 leading-relaxed'>
              This session is currently at capacity. Add your details below and
              we'll notify you immediately when a seat opens up.
            </p>
          </div>

          <div className='px-5 py-6 space-y-4'>
            {/* Full Name */}
            <div>
              <label className='mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-white/30'>
                Full Name *
              </label>
              <input
                type='text'
                placeholder='e.g. Ada Okafor'
                value={localName}
                onChange={(e) => {
                  setLocalName(e.target.value)
                  if (errors.name)
                    setErrors((p) => {
                      const n = { ...p }
                      delete n.name
                      return n
                    })
                }}
                disabled={isSubmitting}
                className={inputClass('name')}
              />
              {errors.name && (
                <p className='mt-1 flex items-center gap-1 text-[11px] text-red-400'>
                  <AlertCircle size={11} />
                  {errors.name}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className='mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-white/30'>
                Email Address *
              </label>
              <input
                type='email'
                placeholder='e.g. ada@example.com'
                value={localEmail}
                onChange={(e) => {
                  setLocalEmail(e.target.value)
                  if (errors.email)
                    setErrors((p) => {
                      const n = { ...p }
                      delete n.email
                      return n
                    })
                }}
                disabled={isSubmitting}
                className={inputClass('email')}
              />
              {errors.email && (
                <p className='mt-1 flex items-center gap-1 text-[11px] text-red-400'>
                  <AlertCircle size={11} />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Phone + City */}
            <div className='grid grid-cols-2 gap-3'>
              <div>
                <label className='mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-white/30'>
                  Phone / WhatsApp *
                </label>
                <input
                  type='tel'
                  placeholder='e.g. 08012345678'
                  value={localPhone}
                  onChange={(e) => {
                    setLocalPhone(e.target.value)
                    if (errors.phone)
                      setErrors((p) => {
                        const n = { ...p }
                        delete n.phone
                        return n
                      })
                  }}
                  disabled={isSubmitting}
                  className={inputClass('phone')}
                />
                {errors.phone && (
                  <p className='mt-1 flex items-center gap-1 text-[11px] text-red-400'>
                    <AlertCircle size={11} />
                    {errors.phone}
                  </p>
                )}
              </div>
              <div>
                <label className='mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-white/30'>
                  City
                </label>
                <input
                  type='text'
                  placeholder='e.g. Lagos'
                  value={localCity}
                  onChange={(e) => setLocalCity(e.target.value)}
                  disabled={isSubmitting}
                  className={inputClass('city')}
                />
              </div>
            </div>

            {/* What to expect note */}
            <div className='rounded-xl border border-white/8 bg-white/3 px-4 py-3'>
              <p className='text-[12px] text-white/40 leading-relaxed'>
                You'll receive an email the moment a seat opens. You'll have{' '}
                <span className='font-semibold text-white/60'>24 hours</span> to
                complete payment — after that, the spot moves to the next
                person.
              </p>
            </div>

            {/* Submit button */}
            <button
              type='button'
              onClick={handleSubmit}
              disabled={isSubmitting}
              className='flex w-full items-center justify-center gap-2.5 rounded-xl bg-amber-500 px-6 py-4 text-[14px] font-bold text-[#0a0800] transition-all hover:bg-amber-400 hover:shadow-[0_0_24px_rgba(245,158,11,0.35)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50'
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className='animate-spin' />
                  Joining waitlist…
                </>
              ) : (
                <>
                  <Users size={15} />
                  Join the Waitlist
                </>
              )}
            </button>

            <p className='text-center text-[11px] text-white/25'>
              Questions?{' '}
              <a
                href='mailto:masterclass@Trila.pro'
                className='text-white/40 underline hover:text-white/60 transition-colors'
              >
                masterclass@Trila.pro
              </a>
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}

// ─── Default export — Suspense wrapper required for useSearchParams ───────────

export default function WaitlistPage() {
  return (
    <Suspense
      fallback={
        <main className='flex min-h-screen items-center justify-center bg-[#050b18]'>
          <div className='flex flex-col items-center gap-4'>
            <Loader2 size={36} className='animate-spin text-amber-400' />
            <p className='text-[14px] text-white/40'>Loading…</p>
          </div>
        </main>
      }
    >
      <WaitlistInner />
    </Suspense>
  )
}
