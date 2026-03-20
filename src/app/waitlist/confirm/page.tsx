'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  AlertTriangle,
} from 'lucide-react'
import type { ProductType } from '@/lib/validations'
import EnrollmentModal from '@/components/Booking-New/enrollment-modal'

// ─── Types ─────────────────────────────────────────────────────────────────────

interface WaitlistEntry {
  name: string
  email: string
  phone: string
  city?: string
  productType: string
  sessionId: string
  sessionLabel: string
  confirmationToken: string
}

type PageState =
  | { status: 'loading' }
  | { status: 'valid'; entry: WaitlistEntry; expiresAt: string | null }
  | { status: 'already_converted' }
  | { status: 'expired' }
  | { status: 'error'; message: string }

// ─── Countdown Timer ───────────────────────────────────────────────────────────

function Countdown({ expiresAt }: { expiresAt: string }) {
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    const tick = () => {
      const diff = new Date(expiresAt).getTime() - Date.now()
      if (diff <= 0) {
        setTimeLeft('Expired')
        return
      }
      const h = Math.floor(diff / 3_600_000)
      const m = Math.floor((diff % 3_600_000) / 60_000)
      const s = Math.floor((diff % 60_000) / 1_000)
      setTimeLeft(
        `${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`,
      )
    }
    tick()
    const id = setInterval(tick, 1_000)
    return () => clearInterval(id)
  }, [expiresAt])

  return (
    <span
      className={`font-mono font-bold tabular-nums ${timeLeft === 'Expired' ? 'text-red-400' : 'text-amber-400'}`}
    >
      {timeLeft}
    </span>
  )
}

// ─── Page ───────────────────────────────────────────────────────────────────────

export default function WaitlistConfirmPage() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const [pageState, setPageState] = useState<PageState>({ status: 'loading' })
  const [modalOpen, setModalOpen] = useState(false)
  const [modalClosed, setModalClosed] = useState(false)

  // ── Validate token on mount ──────────────────────────────────────────────
  useEffect(() => {
    if (!token) {
      setPageState({
        status: 'error',
        message:
          'No confirmation token found in this URL. Please check your email and click the link again.',
      })
      return
    }

    const validate = async () => {
      try {
        const res = await fetch('/api/waitlist/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        })
        const data = await res.json()

        if (res.status === 409 && data.error === 'Already confirmed.') {
          setPageState({ status: 'already_converted' })
          return
        }
        if (
          res.status === 410 ||
          (res.status === 409 && data.error?.includes('expired'))
        ) {
          setPageState({ status: 'expired' })
          return
        }
        if (!res.ok) {
          setPageState({
            status: 'error',
            message:
              data.details ??
              data.error ??
              'Confirmation failed. Please contact support.',
          })
          return
        }

        setPageState({
          status: 'valid',
          entry: data.waitlistEntry,
          expiresAt: data.expiresAt,
        })
        // Auto-open the modal so the user can pay immediately
        setModalOpen(true)
      } catch {
        setPageState({
          status: 'error',
          message: 'Network error. Please check your connection and try again.',
        })
      }
    }

    validate()
  }, [token])

  const handleModalClose = () => {
    setModalOpen(false)
    setModalClosed(true)
  }

  // ─── Loading ─────────────────────────────────────────────────────────────

  if (pageState.status === 'loading') {
    return (
      <div className='flex min-h-screen flex-col items-center justify-center bg-[#050b18] px-4'>
        <Loader2 size={48} className='mb-6 animate-spin text-[#4a9eff]' />
        <p className='text-[15px] text-white/50'>
          Verifying your confirmation link…
        </p>
      </div>
    )
  }

  // ─── Already converted ────────────────────────────────────────────────────

  if (pageState.status === 'already_converted') {
    return (
      <div className='flex min-h-screen flex-col items-center justify-center bg-[#050b18] px-4 text-center'>
        <div className='mb-6 rounded-full bg-green-500/10 p-5'>
          <CheckCircle2 size={52} className='text-green-400' />
        </div>
        <h1 className='mb-3 text-3xl font-extrabold text-white'>
          Already Confirmed
        </h1>
        <p className='text-[15px] text-white/50 max-w-sm'>
          You've already confirmed this spot and completed your enrollment.
          Check your email for your enrollment details.
        </p>
        <a
          href='/'
          className='mt-8 rounded-xl bg-[#2563eb] px-8 py-3 text-sm font-bold text-white hover:bg-[#1d4ed8]'
        >
          Back to Home
        </a>
      </div>
    )
  }

  // ─── Expired ─────────────────────────────────────────────────────────────

  if (pageState.status === 'expired') {
    return (
      <div className='flex min-h-screen flex-col items-center justify-center bg-[#050b18] px-4 text-center'>
        <div className='mb-6 rounded-full bg-red-500/10 p-5'>
          <Clock size={52} className='text-red-400' />
        </div>
        <h1 className='mb-3 text-3xl font-extrabold text-white'>
          Offer Expired
        </h1>
        <p className='text-[15px] text-white/50 max-w-sm mb-8'>
          Your 24-hour window has passed and the spot has been offered to the
          next person on the waitlist.
        </p>
        <div className='rounded-xl border border-white/8 bg-white/5 px-6 py-5 max-w-sm text-left'>
          <p className='text-[13px] text-white/60 leading-relaxed'>
            You can rejoin the waitlist for this session or another one. If you
            have questions, contact us at{' '}
            <a
              href='mailto:masterclass@Trila.pro'
              className='text-[#4a9eff] underline'
            >
              masterclass@Trila.pro
            </a>
            .
          </p>
        </div>
        <a
          href='/#pricing'
          className='mt-6 rounded-xl bg-[#2563eb] px-8 py-3 text-sm font-bold text-white hover:bg-[#1d4ed8]'
        >
          View Available Sessions
        </a>
      </div>
    )
  }

  // ─── Error ────────────────────────────────────────────────────────────────

  if (pageState.status === 'error') {
    return (
      <div className='flex min-h-screen flex-col items-center justify-center bg-[#050b18] px-4 text-center'>
        <div className='mb-6 rounded-full bg-red-500/10 p-5'>
          <XCircle size={52} className='text-red-400' />
        </div>
        <h1 className='mb-3 text-3xl font-extrabold text-white'>
          Invalid Link
        </h1>
        <p className='text-[15px] text-white/50 max-w-sm mb-8'>
          {pageState.message}
        </p>
        <a
          href='mailto:masterclass@Trila.pro'
          className='rounded-xl bg-[#2563eb] px-8 py-3 text-sm font-bold text-white hover:bg-[#1d4ed8]'
        >
          Contact Support
        </a>
      </div>
    )
  }

  // ─── Valid — spot open ────────────────────────────────────────────────────

  const { entry, expiresAt } = pageState
  const firstName = entry.name.split(' ')[0]

  return (
    <>
      <div className='flex min-h-screen flex-col items-center justify-center bg-[#050b18] px-4 py-16'>
        {/* Background glow */}
        <div className='pointer-events-none fixed inset-0 flex items-center justify-center'>
          <div className='h-96 w-96 rounded-full bg-[#2563eb]/8 blur-[120px]' />
        </div>

        <div className='relative w-full max-w-lg text-center'>
          {/* Branding */}
          <p className='mb-8 font-mono text-sm font-bold uppercase tracking-[0.2em] text-[#4a9eff]'>
            Trila Masterclass
          </p>

          {/* Icon */}
          <div className='mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#2563eb]/20'>
            <CheckCircle2 size={44} className='text-[#4a9eff]' />
          </div>

          <h1 className='mb-3 text-4xl font-extrabold text-white'>
            {firstName}, a spot just opened!
          </h1>
          <p className='mb-10 text-[16px] text-white/50 leading-relaxed'>
            Your waitlist position for{' '}
            <span className='font-semibold text-white/80'>
              {entry.sessionLabel}
            </span>{' '}
            is now available. Complete payment below to secure your place (If
            you have pid already and recieved an email confirmation - please
            ignore).
          </p>

          {/* Countdown */}
          {expiresAt && (
            <div className='mb-8 rounded-2xl border border-amber-500/30 bg-amber-500/5 px-6 py-5'>
              <div className='flex items-center justify-center gap-2 mb-2'>
                <AlertTriangle size={16} className='text-amber-400' />
                <p className='text-[12px] font-bold uppercase tracking-wider text-amber-400'>
                  Time Remaining to Confirm
                </p>
              </div>
              <div className='text-3xl'>
                <Countdown expiresAt={expiresAt} />
              </div>
              <p className='mt-2 text-[12px] text-white/30'>
                If you don't complete payment before the timer runs out, this
                spot is offered to the next person.
              </p>
            </div>
          )}

          {/* Open modal / re-open button */}
          {modalClosed ? (
            <div className='space-y-4'>
              <button
                onClick={() => {
                  setModalClosed(false)
                  setModalOpen(true)
                }}
                className='w-full rounded-xl bg-[#2563eb] px-6 py-4 text-[16px] font-bold text-white hover:bg-[#1d4ed8] transition-colors'
              >
                Complete My Payment
              </button>
              <p className='text-[12px] text-white/30'>
                Your spot is still reserved. Click above to finish.
              </p>
            </div>
          ) : (
            <p className='text-[13px] text-white/30'>
              The payment window has opened. Complete your details and pay to
              secure your spot.
            </p>
          )}

          <p className='mt-8 text-[12px] text-white/20'>
            Questions? Email{' '}
            <a
              href='mailto:masterclass@Trila.pro'
              className='text-white/40 underline'
            >
              masterclass@Trila.pro
            </a>
          </p>
        </div>
      </div>

      {/* Enrollment modal pre-filled with their details and session pre-selected */}
      <EnrollmentModal
        isOpen={modalOpen}
        onClose={handleModalClose}
        waitlistConfirmData={{
          name: entry.name,
          email: entry.email,
          phone: entry.phone,
          city: entry.city,
          productType: entry.productType as ProductType,
          sessionId: entry.sessionId,
          sessionLabel: entry.sessionLabel,
        }}
      />
    </>
  )
}
