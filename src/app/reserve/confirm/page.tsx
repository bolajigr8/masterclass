'use client'

import { Suspense, useEffect, useState, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import {
  Loader2,
  AlertCircle,
  Clock,
  CheckCircle2,
  Calendar,
} from 'lucide-react'
import type { ProductType } from '@/lib/validations'
import EnrollmentModal from '@/components/Booking-New/enrollment-modal'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ReservationData {
  name: string
  email: string
  phone: string
  city?: string
  productType: ProductType
  enrollmentReference: string
  sessionId: string
  sessionLabel: string
}

type PageState =
  | { status: 'loading' }
  | { status: 'ready'; data: ReservationData; expiresAt: string | null }
  | {
      status: 'error'
      title: string
      message: string
      canReserveAgain: boolean
    }
  | { status: 'already_paid' }

// ─── Countdown helper ─────────────────────────────────────────────────────────

function useCountdown(expiresAt: string | null) {
  const [remaining, setRemaining] = useState<string>('')

  useEffect(() => {
    if (!expiresAt) return

    const tick = () => {
      const diff = new Date(expiresAt).getTime() - Date.now()
      if (diff <= 0) {
        setRemaining('Expired')
        return
      }
      const h = Math.floor(diff / 3_600_000)
      const m = Math.floor((diff % 3_600_000) / 60_000)
      const s = Math.floor((diff % 60_000) / 1_000)
      setRemaining(
        h > 0
          ? `${h}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`
          : `${m}m ${String(s).padStart(2, '0')}s`,
      )
    }

    tick()
    const id = setInterval(tick, 1_000)
    return () => clearInterval(id)
  }, [expiresAt])

  return remaining
}

// ─── Page ─────────────────────────────────────────────────────────────────────

// Inner component — uses useSearchParams, must be inside <Suspense>
function ReserveConfirmInner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')

  const [pageState, setPageState] = useState<PageState>({ status: 'loading' })
  const [modalOpen, setModalOpen] = useState(false)
  const countdown = useCountdown(
    pageState.status === 'ready' ? pageState.expiresAt : null,
  )

  // ── Validate token on mount ──────────────────────────────────────────────
  const validateToken = useCallback(async () => {
    if (!token) {
      setPageState({
        status: 'error',
        title: 'Invalid Link',
        message:
          'This link is missing a reservation token. Please use the link from your reservation confirmation email.',
        canReserveAgain: true,
      })
      return
    }

    try {
      const res = await fetch('/api/reserve/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })
      const data = await res.json()

      if (res.status === 409) {
        setPageState({ status: 'already_paid' })
        return
      }

      if (res.status === 410) {
        setPageState({
          status: 'error',
          title: 'Reservation Expired',
          message:
            'Your 24-hour payment window has passed and the seat has been released. You are welcome to make a new reservation.',
          canReserveAgain: true,
        })
        return
      }

      if (!res.ok || !data.success) {
        setPageState({
          status: 'error',
          title: 'Link Not Found',
          message:
            data.details ??
            'This payment link is invalid or has already been used. Please contact support if you believe this is an error.',
          canReserveAgain: false,
        })
        return
      }

      setPageState({
        status: 'ready',
        data: data.reservationData as ReservationData,
        expiresAt: data.expiresAt,
      })

      // Auto-open the payment modal immediately — the user clicked the link
      // specifically to pay, so there's no point making them click again.
      setModalOpen(true)
    } catch (err) {
      setPageState({
        status: 'error',
        title: 'Something Went Wrong',
        message:
          'Unable to validate your reservation link. Please check your connection and try again.',
        canReserveAgain: false,
      })
    }
  }, [token])

  useEffect(() => {
    validateToken()
  }, [validateToken])

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <main className='min-h-screen bg-[#050b18] flex items-center justify-center px-4 py-16'>
      {/* ── Loading ── */}
      {pageState.status === 'loading' && (
        <div className='flex flex-col items-center gap-4 text-center'>
          <Loader2 size={36} className='animate-spin text-[#4a9eff]' />
          <p className='text-[15px] text-white/50'>
            Validating your reservation…
          </p>
        </div>
      )}

      {/* ── Ready — show the countdown card while modal is open/closed ── */}
      {pageState.status === 'ready' && (
        <>
          <div className='w-full max-w-md'>
            <div className='rounded-2xl border border-white/10 bg-[#0b1628] overflow-hidden shadow-[0_25px_80px_rgba(0,0,0,0.7)]'>
              {/* Header */}
              <div className='border-b border-white/8 px-6 py-5 flex items-center gap-3'>
                <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1a2a4a]'>
                  <Calendar size={18} className='text-[#4a9eff]' />
                </div>
                <div>
                  <p className='text-[15px] font-bold text-white leading-snug'>
                    Complete Your Payment
                  </p>
                  <p className='text-[12px] text-white/40'>
                    {pageState.data.sessionLabel}
                  </p>
                </div>
              </div>

              <div className='px-6 py-8 space-y-5'>
                {/* Greeting */}
                <div>
                  <h1 className='text-2xl font-extrabold text-white'>
                    Hi {pageState.data.name.split(' ')[0]}! 👋
                  </h1>
                  <p className='mt-1.5 text-[14px] text-white/50 leading-relaxed'>
                    Your seat in the{' '}
                    <span className='text-white/80 font-semibold'>
                      {pageState.data.productType}
                    </span>{' '}
                    is reserved. Complete payment below to activate your
                    enrollment (If you have pid already and recieved an email
                    confirmation - please ignore)..
                  </p>
                </div>

                {/* Countdown */}
                {pageState.expiresAt &&
                  countdown &&
                  countdown !== 'Expired' && (
                    <div className='flex items-center gap-3 rounded-xl border border-[#d4a422]/30 bg-[#1a1200] px-4 py-3'>
                      <Clock size={15} className='shrink-0 text-[#d4a422]' />
                      <div>
                        <p className='text-[12px] font-bold text-[#d4a422]'>
                          Seat held for
                        </p>
                        <p className='text-[18px] font-extrabold text-white font-mono'>
                          {countdown}
                        </p>
                      </div>
                    </div>
                  )}

                {/* Expired countdown warning */}
                {countdown === 'Expired' && (
                  <div className='flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/8 px-4 py-3'>
                    <AlertCircle
                      size={15}
                      className='mt-0.5 shrink-0 text-red-400'
                    />
                    <p className='text-[13px] text-red-400'>
                      Your reservation window has expired. Please make a new
                      reservation.
                    </p>
                  </div>
                )}

                {/* What's reserved */}
                <div className='rounded-xl bg-white/4 border border-white/8 px-5 py-4 space-y-2.5'>
                  <p className='text-[11px] font-black tracking-[0.15em] uppercase text-white/30'>
                    Your Reservation
                  </p>
                  <div className='space-y-1.5'>
                    <div className='flex justify-between text-[13px]'>
                      <span className='text-white/40'>Programme</span>
                      <span className='font-semibold text-white text-right max-w-[60%]'>
                        {pageState.data.productType}
                      </span>
                    </div>
                    <div className='flex justify-between text-[13px]'>
                      <span className='text-white/40'>Session</span>
                      <span className='font-semibold text-white/80 text-right max-w-[60%]'>
                        {pageState.data.sessionLabel}
                      </span>
                    </div>
                    <div className='flex justify-between text-[13px]'>
                      <span className='text-white/40'>Reference</span>
                      <code className='text-[11px] font-bold text-[#4a9eff] tracking-wide'>
                        {pageState.data.enrollmentReference}
                      </code>
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <button
                  onClick={() => setModalOpen(true)}
                  disabled={countdown === 'Expired'}
                  className='w-full flex items-center justify-center gap-2.5 rounded-xl bg-[#2563eb] px-6 py-4 text-[14px] font-bold text-white transition-all hover:bg-[#1d4ed8] hover:shadow-[0_0_28px_rgba(37,99,235,0.45)] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed'
                >
                  Complete Payment →
                </button>

                <p className='text-center text-[11px] text-white/25'>
                  256-bit SSL · Powered by Paystack · Your seat is held until
                  the timer above reaches zero
                </p>
              </div>
            </div>
          </div>

          {/* Enrollment modal — pre-filled, skips registration */}
          <EnrollmentModal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            initialProduct={pageState.data.productType}
            initialFormData={{
              name: pageState.data.name,
              email: pageState.data.email,
              phone: pageState.data.phone,
              city: pageState.data.city,
            }}
            initialEnrollmentReference={pageState.data.enrollmentReference}
            // Re-uses the waitlistConfirmData prop to:
            //   (a) lock the modal to the reserved session
            //   (b) bypass the "session full" check (seat is already held)
            waitlistConfirmData={{
              name: pageState.data.name,
              email: pageState.data.email,
              phone: pageState.data.phone,
              city: pageState.data.city,
              productType: pageState.data.productType,
              sessionId: pageState.data.sessionId,
              sessionLabel: pageState.data.sessionLabel,
            }}
          />
        </>
      )}

      {/* ── Already paid ── */}
      {pageState.status === 'already_paid' && (
        <div className='w-full max-w-md rounded-2xl border border-green-500/20 bg-[#0b1628] px-8 py-10 text-center space-y-4'>
          <div className='flex justify-center'>
            <div className='flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10'>
              <CheckCircle2 size={36} className='text-green-400' />
            </div>
          </div>
          <h2 className='text-2xl font-extrabold text-white'>
            Already Enrolled!
          </h2>
          <p className='text-[14px] text-white/50 leading-relaxed'>
            Payment for this reservation has already been completed
            successfully. Please check your email for your enrollment
            confirmation and access details.
          </p>
          <p className='text-[12px] text-white/30'>
            Can't find the email? Check your spam folder or contact us at{' '}
            <a
              href='mailto:masterclass@Trila.pro'
              className='text-[#4a9eff] hover:underline'
            >
              masterclass@Trila.pro
            </a>
          </p>
        </div>
      )}

      {/* ── Error ── */}
      {pageState.status === 'error' && (
        <div className='w-full max-w-md rounded-2xl border border-white/10 bg-[#0b1628] px-8 py-10 text-center space-y-4'>
          <div className='flex justify-center'>
            <div className='flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10'>
              <AlertCircle size={36} className='text-red-400' />
            </div>
          </div>
          <h2 className='text-2xl font-extrabold text-white'>
            {pageState.title}
          </h2>
          <p className='text-[14px] text-white/50 leading-relaxed'>
            {pageState.message}
          </p>
          <div className='flex flex-col gap-2.5 pt-2'>
            {pageState.canReserveAgain && (
              <button
                onClick={() => router.push('/#reserve-access')}
                className='w-full rounded-xl bg-[#2563eb] px-5 py-3 text-[13px] font-bold text-white hover:bg-[#1d4ed8] transition-colors'
              >
                Make a New Reservation
              </button>
            )}
            <a
              href='mailto:masterclass@Trila.pro'
              className='block w-full rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-[13px] font-semibold text-white/70 hover:text-white hover:bg-white/10 transition-colors'
            >
              Contact Support
            </a>
          </div>
        </div>
      )}
    </main>
  )
}

// ─── Default export — wraps inner component in Suspense ───────────────────────
// Required by Next.js App Router: any component using useSearchParams must be
// rendered inside <Suspense> or it throws at build/runtime.

export default function ReserveConfirmPage() {
  return (
    <Suspense
      fallback={
        <main className='min-h-screen bg-[#050b18] flex items-center justify-center'>
          <div className='flex flex-col items-center gap-4 text-center'>
            <Loader2 size={36} className='animate-spin text-[#4a9eff]' />
            <p className='text-[15px] text-white/50'>Loading…</p>
          </div>
        </main>
      }
    >
      <ReserveConfirmInner />
    </Suspense>
  )
}
