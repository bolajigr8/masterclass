'use client'

declare global {
  interface Window {
    PaystackPop?: {
      setup(options: {
        key: string
        email: string
        amount: number
        currency?: string
        metadata?: Record<string, unknown>
        callback: (response: { reference: string }) => void
        onClose: () => void
      }): { openIframe: () => void }
    }
  }
}

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Script from 'next/script'
import { toast } from 'sonner'
import {
  X,
  CreditCard,
  Zap,
  Check,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Copy,
  Video,
  Globe,
  Download,
  Wifi,
  Crown,
  Shield,
  MapPin,
  CalendarDays,
  ExternalLink,
  Users,
  ArrowRight,
} from 'lucide-react'
import {
  DISPLAY_PRICES,
  DISPLAY_PRICES_USD,
  type ProductType,
  type EnrollmentSuccessData,
} from '@/lib/validations'
import { CONSULTING_SCHEDULING_LINK } from '@/lib/session-config'

// ─── Types ────────────────────────────────────────────────────────────────────

interface LiveSession {
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
  confirmedCount: number
  spotsRemaining: number
  isFull: boolean
  waitlistCount: number
}

type Currency = 'USD' | 'NGN'
type ModalView = 'form' | 'processing' | 'success'

interface EnrollmentModalProps {
  isOpen: boolean
  onClose: () => void
  initialProduct?: ProductType
  initialFormData?: {
    name?: string
    email?: string
    phone?: string
    city?: string
  }
  initialEnrollmentReference?: string
  /** From /waitlist/confirm page — pre-assigns a specific session */
  waitlistConfirmData?: {
    name: string
    email: string
    phone: string
    city?: string
    productType: ProductType
    sessionId: string
    sessionLabel: string
  }
}

// ─── Static metadata ──────────────────────────────────────────────────────────

const PLAN_INFO: Record<
  ProductType,
  {
    tagline: string
    icon: React.ElementType
    iconBg: string
    iconColor: string
  }
> = {
  'Virtual Masterclass': {
    tagline: '4 × 90-min Zoom Sessions',
    icon: Wifi,
    iconBg: 'bg-[#1a2a4a]',
    iconColor: 'text-[#4a9eff]',
  },
  'Signature Live Masterclass': {
    tagline: '2-Day In-Person Experience',
    icon: Crown,
    iconBg: 'bg-[#2a1f0a]',
    iconColor: 'text-[#d4a422]',
  },
  'Private JaaS Consulting': {
    tagline: '1-on-1 Strategy Session',
    icon: Shield,
    iconBg: 'bg-[#0d1f3a]',
    iconColor: 'text-[#4a9eff]',
  },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Picks the soonest available (not full, not past) session for a product.
 * Falls back to the nearest session even if full so the UI can still show it.
 */
function pickBestSession(sessions: LiveSession[]): LiveSession | null {
  if (!sessions.length) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const future = sessions.filter((s) => {
    const last = new Date(s.dates[s.dates.length - 1])
    return last >= today
  })

  const available = future
    .filter((s) => !s.isFull)
    .sort(
      (a, b) => new Date(a.dates[0]).getTime() - new Date(b.dates[0]).getTime(),
    )

  if (available.length) return available[0]

  return (
    future.sort(
      (a, b) => new Date(a.dates[0]).getTime() - new Date(b.dates[0]).getTime(),
    )[0] ?? null
  )
}

function formatReceiptDate(d: Date): string {
  return d.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatSessionDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-NG', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function useCopyToClipboard() {
  const [copied, setCopied] = useState(false)
  const copy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      const el = document.createElement('textarea')
      el.value = text
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }, [])
  return { copied, copy }
}

// ─── Shared modal header ──────────────────────────────────────────────────────

function ModalHeader({
  product,
  onClose,
  showClose = true,
}: {
  product: ProductType
  onClose: () => void
  showClose?: boolean
}) {
  const info = PLAN_INFO[product]
  const Icon = info.icon
  return (
    <div className='flex items-center justify-between gap-4 border-b border-white/8 px-6 py-5'>
      <div className='flex items-center gap-3'>
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${info.iconBg}`}
        >
          <Icon size={18} className={info.iconColor} />
        </div>
        <div>
          <p className='text-[15px] font-bold text-white leading-snug'>
            {product}
          </p>
          <p className='text-[12px] text-white/40'>{info.tagline}</p>
        </div>
      </div>
      {showClose && (
        <button
          onClick={onClose}
          className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/40 transition-colors hover:bg-white/10 hover:text-white'
        >
          <X size={15} />
        </button>
      )}
    </div>
  )
}

// ─── Session Full card ────────────────────────────────────────────────────────

/**
 * Shown instead of the pay buttons when all sessions are at capacity.
 * Replaces the old amber text-only notice with a clear CTA to join the waitlist.
 */
function SessionFullCard({
  session,
  product,
  formData,
  onClose,
}: {
  session: LiveSession | null
  product: ProductType
  formData: { name: string; email: string; phone: string; city: string }
  onClose: () => void
}) {
  const router = useRouter()

  /**
   * Navigate to /waitlist, carrying whatever the user has already typed in the
   * modal form so they never have to re-enter their details.
   * The waitlist page accepts all params as pre-filled but still editable fields.
   */
  const handleJoinWaitlist = () => {
    const params = new URLSearchParams()

    // Only append non-empty values — the waitlist page handles missing ones
    const cleanName = formData.name.trim()
    const cleanEmail = formData.email.trim().toLowerCase()
    const cleanPhone = formData.phone.replace(/\s+/g, '')
    const cleanCity = formData.city.trim()

    if (cleanName) params.set('name', cleanName)
    if (cleanEmail) params.set('email', cleanEmail)
    if (cleanPhone) params.set('phone', cleanPhone)
    if (cleanCity) params.set('city', cleanCity)

    // These two are required for the API — always append
    params.set('productType', product)
    if (session?.sessionId) params.set('sessionId', session.sessionId)
    if (session?.label) params.set('sessionLabel', session.label)

    onClose()
    router.push(`/waitlist?${params.toString()}`)
  }

  return (
    <div className='rounded-2xl border border-amber-500/25 bg-[#140f00] overflow-hidden'>
      {/* Top strip */}
      <div className='flex items-center gap-2.5 border-b border-amber-500/15 px-5 py-3.5'>
        <Users size={14} className='shrink-0 text-amber-400' />
        <p className='text-[12px] font-bold uppercase tracking-[0.12em] text-amber-400/80'>
          Session at Capacity
        </p>
      </div>

      <div className='px-5 py-5 space-y-4'>
        <div>
          <p className='text-[14px] font-bold text-white leading-snug'>
            All seats for{' '}
            <span className='text-amber-400'>{session?.label ?? product}</span>{' '}
            are currently filled.
          </p>
          <p className='mt-1.5 text-[12px] text-white/45 leading-relaxed'>
            Join the waitlist and you'll be notified immediately if a seat opens
            up — either from a cancellation or when a new session date is
            announced.
          </p>
        </div>

        {/* Waitlist count social proof (if available) */}
        {session && session.waitlistCount > 0 && (
          <p className='text-[11px] text-white/30'>
            {session.waitlistCount}{' '}
            {session.waitlistCount === 1 ? 'person is' : 'people are'} ahead of
            you on the waitlist for this session.
          </p>
        )}

        {/* Primary CTA */}
        <button
          type='button'
          onClick={handleJoinWaitlist}
          className='flex w-full items-center justify-center gap-2.5 rounded-xl bg-amber-500 px-5 py-3.5 text-[13px] font-bold text-[#0a0800] transition-all hover:bg-amber-400 hover:shadow-[0_0_24px_rgba(245,158,11,0.35)] active:scale-[0.98]'
        >
          <Users size={14} />
          Join the Waitlist
          <ArrowRight size={13} className='ml-0.5' />
        </button>

        {/* Secondary: contact directly */}
        <p className='text-center text-[11px] text-white/30'>
          or reach us at{' '}
          <a
            href='mailto:masterclass@trila.pro'
            className='text-[#4a9eff] hover:underline'
          >
            masterclass@trila.pro
          </a>
        </p>
      </div>
    </div>
  )
}

// ─── Processing view ──────────────────────────────────────────────────────────

function ProcessingView({
  step,
  product,
}: {
  step: number
  product: ProductType
}) {
  const steps = [
    'Payment verified',
    'Generating confirmation details…',
    'Sending confirmation email',
  ]
  return (
    <div>
      <ModalHeader product={product} onClose={() => {}} showClose={false} />
      <div className='flex flex-col items-center px-8 py-12 text-center'>
        <div className='relative mb-8'>
          <div className='h-20 w-20 rounded-full border-4 border-white/10' />
          <div className='absolute inset-0 h-20 w-20 animate-spin rounded-full border-4 border-transparent border-t-[#4a9eff]' />
          <div className='absolute inset-0 flex items-center justify-center'>
            <Video size={24} className='text-[#4a9eff]' />
          </div>
        </div>
        <h3 className='mb-2 text-xl font-extrabold text-white'>
          Setting Up Your Session
        </h3>
        <p className='mb-8 text-[13px] text-white/40 max-w-xs'>
          Payment confirmed! Preparing your enrollment details…
        </p>
        <div className='w-full max-w-xs space-y-3 text-left'>
          {steps.map((label, i) => {
            const isDone = step > i
            const isCurrent = step === i
            return (
              <div key={label} className='flex items-center gap-3'>
                <div
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-500 ${
                    isDone
                      ? 'border-green-500 bg-green-500'
                      : isCurrent
                        ? 'border-[#4a9eff]'
                        : 'border-white/15'
                  }`}
                >
                  {isDone ? (
                    <Check size={12} className='text-white' />
                  ) : isCurrent ? (
                    <Loader2
                      size={11}
                      className='animate-spin text-[#4a9eff]'
                    />
                  ) : null}
                </div>
                <span
                  className={`text-[13px] transition-colors duration-500 ${
                    isDone
                      ? 'text-green-400'
                      : isCurrent
                        ? 'text-white'
                        : 'text-white/25'
                  }`}
                >
                  {label}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── Success view ─────────────────────────────────────────────────────────────

function SuccessView({
  data,
  paymentDate,
  onClose,
  onDownload,
}: {
  data: EnrollmentSuccessData
  paymentDate: string
  onClose: () => void
  onDownload: () => void
}) {
  const { copy, copied } = useCopyToClipboard()
  const product = data.productType as ProductType
  const usdAmount = DISPLAY_PRICES_USD[product]
  const session = data.selectedSession
  const isVirtual = data.accessTier === 'virtual'
  const isLive = data.accessTier === 'full'
  const isConsult = data.accessTier === 'consulting'

  return (
    <div>
      <ModalHeader product={product} onClose={onClose} />

      <div className='px-6 py-8 space-y-4'>
        {/* Checkmark */}
        <div className='flex flex-col items-center text-center mb-2'>
          <div className='mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10'>
            <CheckCircle2 size={40} className='text-green-400' />
          </div>
          <h3 className='text-2xl font-extrabold text-white'>
            Payment Successful!
          </h3>
          <p className='mt-1 text-[14px] text-white/45'>
            {isLive
              ? 'Your seat has been secured'
              : isConsult
                ? 'Your consulting slot is confirmed'
                : 'Your virtual access is ready'}
          </p>
        </div>

        {/* ── VIRTUAL: Zoom pending notice ── */}
        {isVirtual && (
          <div className='flex items-start gap-3 rounded-xl border border-[#d4a422]/30 bg-[#1a1200] px-4 py-3'>
            <AlertCircle size={15} className='mt-0.5 shrink-0 text-[#d4a422]' />
            <div>
              <p className='text-[13px] font-bold text-[#d4a422]'>
                Zoom link pending
              </p>
              <p className='mt-0.5 text-[12px] text-[#d4a422]/70 leading-relaxed'>
                Your Zoom meeting link is being generated and will be sent to
                your email with the meeting ID, passcode, and session schedule.
              </p>
            </div>
          </div>
        )}

        {/* ── SIGNATURE LIVE: Reference + check-in block ── */}
        {isLive && (
          <div className='rounded-xl border border-[#d4a422]/40 bg-[#1a1200] px-5 py-4 space-y-3'>
            <p className='text-[11px] font-black tracking-[0.15em] uppercase text-[#d4a422]'>
              ⚠️ Your Check-In Credential — Save This
            </p>
            {/* Reference big display */}
            <div className='flex items-center justify-between gap-3 rounded-lg bg-[#080f1a] border border-[#d4a422]/20 px-4 py-3'>
              <code className='text-[13px] font-bold tracking-wider text-[#d4a422] break-all leading-snug'>
                {data.enrollmentReference}
              </code>
              <button
                onClick={() => copy(data.enrollmentReference)}
                className={`shrink-0 flex h-7 w-7 items-center justify-center rounded-lg transition-all ${
                  copied
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-white/8 text-white/40 hover:text-white'
                }`}
              >
                {copied ? <Check size={12} /> : <Copy size={12} />}
              </button>
            </div>
            <p className='text-[12px] text-[#d4a422]/70 leading-relaxed'>
              This reference + your email are required for check-in on{' '}
              <strong className='text-[#d4a422]'>both Day 1 and Day 2</strong>.
              These details have been sent to{' '}
              <span className='text-white/70'>{data.email}</span>.
            </p>
            {/* Session details */}
            {session && (
              <div className='space-y-1.5 pt-1 border-t border-white/8'>
                {session.dates?.[0] && (
                  <div className='flex items-center gap-2 text-[12px] text-white/50'>
                    <CalendarDays
                      size={12}
                      className='shrink-0 text-[#4a9eff]'
                    />
                    <span>
                      Day 1:{' '}
                      <span className='text-white/80'>
                        {formatSessionDate(session.dates[0])}
                      </span>
                    </span>
                  </div>
                )}
                {session.dates?.[1] && (
                  <div className='flex items-center gap-2 text-[12px] text-white/50'>
                    <CalendarDays
                      size={12}
                      className='shrink-0 text-[#4a9eff]'
                    />
                    <span>
                      Day 2:{' '}
                      <span className='text-white/80'>
                        {formatSessionDate(session.dates[1])}
                      </span>
                    </span>
                  </div>
                )}
                {session.venue && (
                  <div className='flex items-center gap-2 text-[12px] text-white/50'>
                    <MapPin size={12} className='shrink-0 text-[#4a9eff]' />
                    <span>
                      {session.venue},{' '}
                      <span className='text-white/80'>{session.city}</span>
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── CONSULTING: Scheduling link block ── */}
        {isConsult && (
          <div className='rounded-xl border border-[#2563eb]/30 bg-[#0a1525] px-5 py-4 space-y-3'>
            <p className='text-[11px] font-black tracking-[0.15em] uppercase text-[#4a9eff]'>
              📅 Book Your Session Time
            </p>
            <p className='text-[13px] text-white/50 leading-relaxed'>
              Your payment is confirmed. Click below to choose a date and time
              that works for you — slots are available Monday–Friday, 9am–5pm
              WAT.
            </p>
            <a
              href={CONSULTING_SCHEDULING_LINK}
              target='_blank'
              rel='noopener noreferrer'
              className='flex items-center justify-center gap-2 rounded-xl bg-[#2563eb] px-5 py-3 text-[13px] font-bold text-white hover:bg-[#1d4ed8] transition-colors'
            >
              <ExternalLink size={13} />
              Schedule My 1-on-1 Session →
            </a>
            <p className='text-[11px] text-white/30 leading-relaxed'>
              Your enrollment reference and session details have been sent to{' '}
              <span className='text-white/50'>{data.email}</span>.
            </p>
          </div>
        )}

        {/* ── CONSULTING: also show Zoom pending ── */}
        {isConsult && (
          <div className='flex items-start gap-3 rounded-xl border border-[#d4a422]/30 bg-[#1a1200] px-4 py-3'>
            <AlertCircle size={15} className='mt-0.5 shrink-0 text-[#d4a422]' />
            <div>
              <p className='text-[13px] font-bold text-[#d4a422]'>
                Zoom link pending
              </p>
              <p className='mt-0.5 text-[12px] text-[#d4a422]/70 leading-relaxed'>
                Your personalised Zoom meeting link will be sent to your email
                once your session time is scheduled.
              </p>
            </div>
          </div>
        )}

        {/* ── Receipt (all products) ── */}
        <div className='overflow-hidden rounded-xl border border-white/10 bg-[#070f1e]'>
          <div className='border-b border-white/8 px-5 py-3'>
            <p className='text-[11px] font-black tracking-[0.15em] text-white/30 uppercase'>
              Receipt
            </p>
          </div>
          <div className='divide-y divide-white/5 px-5'>
            <div className='flex items-center justify-between gap-3 py-3.5'>
              <span className='text-[12px] text-white/40'>Reference</span>
              <div className='flex items-center gap-2'>
                <code className='text-[11px] font-bold tracking-wide text-white/80 break-all text-right max-w-50'>
                  {data.enrollmentReference}
                </code>
                {!isLive && (
                  <button
                    onClick={() => copy(data.enrollmentReference)}
                    className={`shrink-0 flex h-6 w-6 items-center justify-center rounded-md transition-all ${
                      copied
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-white/8 text-white/40 hover:bg-white/15 hover:text-white'
                    }`}
                  >
                    {copied ? <Check size={11} /> : <Copy size={11} />}
                  </button>
                )}
              </div>
            </div>
            <div className='flex items-center justify-between py-3.5'>
              <span className='text-[12px] text-white/40'>Tier</span>
              <span className='text-[13px] font-bold text-white'>
                {data.productType}
              </span>
            </div>
            <div className='flex items-center justify-between py-3.5'>
              <span className='text-[12px] text-white/40'>Amount</span>
              <span className='text-[14px] font-extrabold text-[#d4a422]'>
                {usdAmount} USD
              </span>
            </div>
            <div className='flex items-center justify-between py-3.5'>
              <span className='text-[12px] text-white/40'>Date</span>
              <span className='text-[13px] font-semibold text-white'>
                {paymentDate}
              </span>
            </div>
            <div className='flex items-center justify-between py-3.5'>
              <span className='text-[12px] text-white/40'>Status</span>
              <span className='flex items-center gap-1.5 text-[13px] font-bold text-green-400'>
                <CheckCircle2 size={13} /> Paid
              </span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className='flex gap-3'>
          <button
            onClick={onDownload}
            className='flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/12 bg-white/5 px-4 py-3 text-[13px] font-semibold text-white/70 transition-colors hover:bg-white/10 hover:text-white'
          >
            <Download size={14} />
            Download Receipt
          </button>
          <button
            onClick={onClose}
            className='flex flex-1 items-center justify-center rounded-xl bg-[#2563eb] px-4 py-3 text-[13px] font-bold text-white transition-colors hover:bg-[#1d4ed8]'
          >
            Done
          </button>
        </div>

        <p className='text-center text-[12px] text-white/30'>
          A confirmation email will be sent to{' '}
          <span className='text-white/50'>{data.email}</span>
          {' — '}
          <span className='text-white/25'>
            if you don't see it, check your spam folder.
          </span>
        </p>
      </div>
    </div>
  )
}

// ─── Main modal ───────────────────────────────────────────────────────────────

export default function EnrollmentModal({
  isOpen,
  onClose,
  initialProduct,
  initialFormData,
  initialEnrollmentReference,
  waitlistConfirmData,
}: EnrollmentModalProps) {
  const defaultProduct: ProductType =
    initialProduct ?? waitlistConfirmData?.productType ?? 'Virtual Masterclass'

  // ── Core state ────────────────────────────────────────────────────────────
  const [view, setView] = useState<ModalView>('form')
  const [currency, setCurrency] = useState<Currency>('USD')
  const [selectedProduct, setSelectedProduct] =
    useState<ProductType>(defaultProduct)

  // ── Processing animation state ────────────────────────────────────────────
  const [processingStep, setProcessingStep] = useState(0)
  const processingStepRef = useRef(0)
  const pendingSuccessRef = useRef<EnrollmentSuccessData | null>(null)

  // ── Sessions ──────────────────────────────────────────────────────────────
  const [allSessions, setAllSessions] = useState<Record<string, LiveSession[]>>(
    {},
  )
  const [assignedSession, setAssignedSession] = useState<LiveSession | null>(
    null,
  )
  const [sessionsLoading, setSessionsLoading] = useState(false)
  const [sessionsError, setSessionsError] = useState<string | null>(null)

  // ── Form ──────────────────────────────────────────────────────────────────
  const [formData, setFormData] = useState({
    name: initialFormData?.name ?? waitlistConfirmData?.name ?? '',
    email: initialFormData?.email ?? waitlistConfirmData?.email ?? '',
    phone: initialFormData?.phone ?? waitlistConfirmData?.phone ?? '',
    city: initialFormData?.city ?? waitlistConfirmData?.city ?? '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [apiError, setApiError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [paystackLoaded, setPaystackLoaded] = useState(false)
  const [enrollmentRef, setEnrollmentRef] = useState<string | null>(
    initialEnrollmentReference ?? null,
  )

  // ── Success ───────────────────────────────────────────────────────────────
  const [successData, setSuccessData] = useState<EnrollmentSuccessData | null>(
    null,
  )
  const [paymentDate, setPaymentDate] = useState('')

  // ── Prices ────────────────────────────────────────────────────────────────
  const ngnPrice = DISPLAY_PRICES[selectedProduct]
  const usdPrice = DISPLAY_PRICES_USD[selectedProduct]
  const displayAmount =
    currency === 'USD'
      ? `${usdPrice} USD`
      : `₦${ngnPrice.toLocaleString('en-NG')} NGN`
  const payButtonLabel =
    currency === 'USD'
      ? `Pay ${usdPrice} with Paystack`
      : `Pay ₦${ngnPrice.toLocaleString('en-NG')} with Paystack`

  // ── Fetch sessions ────────────────────────────────────────────────────────
  const fetchSessions = useCallback(
    async (forProduct?: ProductType) => {
      const product = forProduct ?? selectedProduct
      setSessionsLoading(true)
      setSessionsError(null)
      try {
        const res = await fetch('/api/sessions', { cache: 'no-store' })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to load sessions.')
        const map: Record<string, LiveSession[]> = data.sessions ?? {}
        setAllSessions(map)

        if (waitlistConfirmData) {
          const flat = Object.values(map).flat()
          setAssignedSession(
            flat.find((s) => s.sessionId === waitlistConfirmData.sessionId) ??
              null,
          )
        } else {
          setAssignedSession(pickBestSession(map[product] ?? []))
        }
      } catch (err: any) {
        setSessionsError(err.message || 'Failed to load sessions.')
      } finally {
        setSessionsLoading(false)
      }
    },
    [selectedProduct, waitlistConfirmData],
  )

  // ── Reset + fetch on open ────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return
    setView('form')
    setCurrency('USD')
    setFormData({
      name: initialFormData?.name ?? waitlistConfirmData?.name ?? '',
      email: initialFormData?.email ?? waitlistConfirmData?.email ?? '',
      phone: initialFormData?.phone ?? waitlistConfirmData?.phone ?? '',
      city: initialFormData?.city ?? waitlistConfirmData?.city ?? '',
    })
    setErrors({})
    setApiError(null)
    setIsProcessing(false)
    setEnrollmentRef(initialEnrollmentReference ?? null)
    setSuccessData(null)
    setProcessingStep(0)
    processingStepRef.current = 0
    pendingSuccessRef.current = null
    const product =
      initialProduct ??
      waitlistConfirmData?.productType ??
      'Virtual Masterclass'
    setSelectedProduct(product)
    fetchSessions(product)
  }, [isOpen]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Body scroll lock ──────────────────────────────────────────────────────
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // ── Processing animation ──────────────────────────────────────────────────
  const advanceStep = useCallback((n: number) => {
    processingStepRef.current = n
    setProcessingStep(n)
  }, [])

  const transitionToSuccess = useCallback(
    (enrollment: EnrollmentSuccessData) => {
      setTimeout(() => {
        setSuccessData(enrollment)
        setPaymentDate(formatReceiptDate(new Date()))
        setView('success')
      }, 400)
    },
    [],
  )

  useEffect(() => {
    if (view !== 'processing') return
    advanceStep(0)

    const t1 = setTimeout(() => advanceStep(1), 900)
    const t2 = setTimeout(() => {
      advanceStep(2)
      if (pendingSuccessRef.current) {
        transitionToSuccess(pendingSuccessRef.current)
      }
    }, 2200)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [view, advanceStep, transitionToSuccess])

  // ── Field change ──────────────────────────────────────────────────────────
  const handleFieldChange = (field: string, value: string) => {
    setFormData((p) => ({ ...p, [field]: value }))
    if (errors[field])
      setErrors((p) => {
        const n = { ...p }
        delete n[field]
        return n
      })
    if (apiError) setApiError(null)
  }

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const errs: Record<string, string> = {}
    if (!formData.name.trim() || formData.name.trim().length < 2)
      errs.name = 'Name must be at least 2 characters'
    if (
      !formData.email.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
    )
      errs.email = 'Please enter a valid email address'
    if (formData.phone.replace(/\s+/g, '').length < 10)
      errs.phone = 'Phone number must be at least 10 digits'
    if (!assignedSession)
      errs.session = 'No session available — please try again shortly.'
    if (!isWaitlistFlow && assignedSession?.isFull)
      errs.session = 'This session is at full capacity. Please contact support.'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  // ── Verify payment ────────────────────────────────────────────────────────
  const verifyPayment = async (paystackReference: string, ref: string) => {
    try {
      if (!assignedSession) throw new Error('No session assigned.')

      const [verifyRes] = await Promise.all([
        fetch('/api/payment/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            reference: paystackReference,
            enrollmentReference: ref,
            productType: selectedProduct,
            sessionId: assignedSession.sessionId,
            sessionDates: assignedSession.dates,
            sessionTime: assignedSession.time,
            sessionVenue: assignedSession.venue ?? null,
            sessionCity: assignedSession.city ?? null,
            isTwoDay: assignedSession.isTwoDay ?? false,
          }),
        }),
        new Promise<void>((r) => setTimeout(r, 2800)),
      ])

      const data = await verifyRes.json()

      if (!verifyRes.ok) {
        throw new Error(data.error || 'Verification failed.')
      }

      const enrollment = data.enrollment as EnrollmentSuccessData
      pendingSuccessRef.current = enrollment

      if (processingStepRef.current >= 2) {
        transitionToSuccess(enrollment)
      }
    } catch (err: any) {
      toast.error('Heads up', {
        description:
          "Payment received. If you don't get a confirmation email within 5 minutes, contact us with your reference below.",
        duration: 12_000,
      })

      const tier: EnrollmentSuccessData['accessTier'] =
        selectedProduct === 'Virtual Masterclass'
          ? 'virtual'
          : selectedProduct === 'Signature Live Masterclass'
            ? 'full'
            : 'consulting'

      const fallback: EnrollmentSuccessData = {
        enrollmentReference: ref,
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        productType: selectedProduct,
        selectedSession: assignedSession
          ? {
              sessionId: assignedSession.sessionId,
              dates: assignedSession.dates,
              time: assignedSession.time,
              venue: assignedSession.venue,
              city: assignedSession.city,
              isTwoDay: assignedSession.isTwoDay,
            }
          : { sessionId: '', dates: [], time: '' },
        accessTier: tier,
        bookingStatus: 'confirmed',
        amountPaid: DISPLAY_PRICES[selectedProduct],
      }

      pendingSuccessRef.current = fallback
      setTimeout(() => {
        setSuccessData(fallback)
        setPaymentDate(formatReceiptDate(new Date()))
        setView('success')
      }, 600)
    } finally {
      setIsProcessing(false)
    }
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!validate()) return
    if (!paystackLoaded || !window.PaystackPop) {
      toast.error('Payment system not ready', {
        description: 'Please wait a moment and try again.',
      })
      return
    }
    const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY
    if (!publicKey) {
      toast.error('Payment configuration error', {
        description: 'Please contact support.',
      })
      return
    }

    setIsProcessing(true)
    setApiError(null)

    let ref = enrollmentRef
    if (!ref) {
      try {
        const regRes = await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name.trim(),
            email: formData.email.trim().toLowerCase(),
            phone: formData.phone.replace(/\s+/g, ''),
            city: formData.city.trim() || undefined,
          }),
        })
        const regData = await regRes.json()
        if (!regRes.ok) {
          const isDup = regRes.status === 409
          toast.error(
            isDup ? 'Email already registered' : 'Registration failed',
            {
              description: isDup
                ? 'This email is already enrolled. Contact support if you need help.'
                : regData.error || 'Please try again.',
              duration: 6000,
            },
          )
          setIsProcessing(false)
          return
        }
        ref = regData.enrollmentReference
        setEnrollmentRef(ref!)
      } catch {
        toast.error('Registration failed', {
          description: 'Check your connection and try again.',
        })
        setIsProcessing(false)
        return
      }
    }

    try {
      const handler = window.PaystackPop!.setup({
        key: publicKey,
        email: formData.email.trim().toLowerCase(),
        amount: ngnPrice * 100,
        currency: 'NGN',
        metadata: {
          enrollment_reference: ref,
          product_type: selectedProduct,
          name: formData.name.trim(),
        },
        callback: (response) => {
          setView('processing')
          verifyPayment(response.reference, ref!)
        },
        onClose: () => {
          setIsProcessing(false)
        },
      })
      handler.openIframe()
    } catch {
      toast.error('Failed to open payment window', {
        description: 'Please refresh and try again.',
      })
      setIsProcessing(false)
    }
  }

  // ── Download receipt ──────────────────────────────────────────────────────
  const handleDownloadReceipt = () => {
    if (!successData) return
    const product = successData.productType as ProductType
    const usd = DISPLAY_PRICES_USD[product]
    const ngnAmt = `₦${DISPLAY_PRICES[product].toLocaleString('en-NG')}`
    const isLive = successData.accessTier === 'full'
    const session = successData.selectedSession

    const sessionBlock =
      isLive && session
        ? `<div class="note">
          <strong>Session:</strong> ${session.venue ?? ''}${session.city ? `, ${session.city}` : ''}<br/>
          ${session.dates?.[0] ? `<strong>Day 1:</strong> ${formatSessionDate(session.dates[0])}<br/>` : ''}
          ${session.dates?.[1] ? `<strong>Day 2:</strong> ${formatSessionDate(session.dates[1])}<br/>` : ''}
          <br/>Your enrollment reference above is required for check-in on both days.
         </div>`
        : `<div class="note">
          <strong>Important:</strong> Keep your enrollment reference — it identifies your enrollment.
          A confirmation email with full access details has been sent to ${successData.email}.
         </div>`

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>Receipt — Trila Masterclass</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'Helvetica Neue',Arial,sans-serif;background:#fff;color:#111;padding:48px}
  .header{border-bottom:3px solid #2563eb;padding-bottom:20px;margin-bottom:28px;display:flex;justify-content:space-between;align-items:flex-end}
  .brand{font-size:22px;font-weight:900;color:#111;letter-spacing:-0.5px}
  .brand span{color:#2563eb}
  .receipt-label{font-size:12px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:#888}
  h1{font-size:28px;font-weight:900;margin-bottom:6px}
  .subtitle{font-size:14px;color:#666;margin-bottom:20px}
  .status-badge{display:inline-flex;align-items:center;gap:6px;background:#dcfce7;color:#16a34a;font-size:12px;font-weight:700;padding:4px 12px;border-radius:999px;margin-bottom:28px}
  table{width:100%;border-collapse:collapse;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;margin-bottom:20px}
  tr{border-bottom:1px solid #e5e7eb}
  tr:last-child{border-bottom:none}
  td{padding:14px 18px;font-size:14px}
  td:first-child{color:#666;width:180px}
  td:last-child{font-weight:600;color:#111}
  .amount{color:#d97706!important;font-size:16px!important;font-weight:900!important}
  .ref{font-family:monospace;font-size:13px;letter-spacing:0.05em}
  .note{background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:14px 18px;font-size:13px;color:#92400e;line-height:1.7;margin-bottom:20px}
  .footer{padding-top:20px;border-top:1px solid #e5e7eb;font-size:12px;color:#999;display:flex;justify-content:space-between}
  @media print{body{padding:24px}@page{margin:20mm}}
</style>
</head>
<body>
<div class="header">
  <div class="brand">Trila <span>·</span> JaaS Masterclass</div>
  <div class="receipt-label">Payment Receipt</div>
</div>
<h1>Payment Successful</h1>
<p class="subtitle">${successData.productType}</p>
<div class="status-badge">✓ Paid</div>
<table>
  <tr><td>Reference</td><td class="ref">${successData.enrollmentReference}</td></tr>
  <tr><td>Programme</td><td>${successData.productType}</td></tr>
  <tr><td>Amount (USD)</td><td class="amount">${usd} USD</td></tr>
  <tr><td>Amount (NGN)</td><td>${ngnAmt} NGN</td></tr>
  <tr><td>Date</td><td>${paymentDate}</td></tr>
  <tr><td>Email</td><td>${successData.email}</td></tr>
  <tr><td>Status</td><td style="color:#16a34a;font-weight:700">Confirmed</td></tr>
</table>
${sessionBlock}
<div class="footer">
  <span>© ${new Date().getFullYear()} Trila Masterclass. All rights reserved.</span>
  <span>Lagos · Dubai · London · Singapore</span>
</div>
<script>setTimeout(function(){window.print()},400)</script>
</body>
</html>`

    const w = window.open('', '_blank', 'width=760,height=900')
    if (w) {
      w.document.open()
      w.document.write(html)
      w.document.close()
    }
  }

  if (!isOpen) return null

  const inputClass = (field: string) =>
    `w-full rounded-xl border ${
      errors[field] ? 'border-red-500/60' : 'border-white/10'
    } bg-[#0d1a35] px-4 py-3 text-[13.5px] text-white placeholder:text-white/25 focus:border-[#2563eb]/60 focus:outline-none focus:ring-1 focus:ring-[#2563eb]/40 hover:border-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`

  const isWaitlistFlow = !!waitlistConfirmData
  const allFull =
    !isWaitlistFlow &&
    !sessionsLoading &&
    !sessionsError &&
    !!assignedSession &&
    assignedSession.isFull
  const noSessions = !sessionsLoading && !sessionsError && !assignedSession
  const canPay =
    !isProcessing &&
    paystackLoaded &&
    !allFull &&
    !noSessions &&
    !sessionsLoading

  return (
    <>
      <Script
        src='https://js.paystack.co/v1/inline.js'
        strategy='afterInteractive'
        onLoad={() => setPaystackLoaded(true)}
        onError={() =>
          setApiError('Failed to load payment system. Please refresh.')
        }
      />

      {/* Backdrop */}
      <div
        className='fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6'
        onClick={(e) => {
          if (e.target === e.currentTarget && view !== 'processing') onClose()
        }}
      >
        <div className='absolute inset-0 bg-[#020509]/85 backdrop-blur-md' />

        {/* Modal */}
        <div className='relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-[#0b1628] shadow-[0_25px_80px_rgba(0,0,0,0.85)]'>
          <div className='max-h-[92vh] overflow-y-auto'>
            {/* ── Processing ─────────────────────────────────────────────── */}
            {view === 'processing' && (
              <ProcessingView step={processingStep} product={selectedProduct} />
            )}

            {/* ── Success ────────────────────────────────────────────────── */}
            {view === 'success' && successData && (
              <SuccessView
                data={successData}
                paymentDate={paymentDate}
                onClose={onClose}
                onDownload={handleDownloadReceipt}
              />
            )}

            {/* ── Form ───────────────────────────────────────────────────── */}
            {view === 'form' && (
              <>
                <ModalHeader product={selectedProduct} onClose={onClose} />

                <div className='px-6 py-6 space-y-5'>
                  {/* Currency toggle — hidden when session is full */}
                  {!allFull && (
                    <div>
                      <p className='mb-2 text-[11px] font-bold uppercase tracking-[0.15em] text-white/30'>
                        Payment Currency
                      </p>
                      <div className='flex gap-2'>
                        {(['USD', 'NGN'] as Currency[]).map((c) => (
                          <button
                            key={c}
                            type='button'
                            onClick={() => setCurrency(c)}
                            className={`flex flex-1 items-center justify-center gap-2 rounded-xl border py-2.5 text-[13px] font-bold transition-all ${
                              currency === c
                                ? 'border-[#2563eb] bg-[#2563eb] text-white'
                                : 'border-white/10 bg-white/5 text-white/50 hover:border-white/20 hover:text-white/70'
                            }`}
                          >
                            <Globe size={13} />
                            {c === 'USD' ? 'USD ($)' : 'NGN (₦)'}
                          </button>
                        ))}
                      </div>
                      <p className='mt-1.5 text-[11px] text-white/30'>
                        {currency === 'USD'
                          ? 'US Dollar selected'
                          : 'Nigerian Naira selected'}
                        {' · '}Payment processed in NGN via Paystack
                      </p>
                    </div>
                  )}

                  {/* Amount display — hidden when session is full */}
                  {!allFull && (
                    <div className='rounded-xl bg-white/5 px-5 py-4'>
                      <p className='mb-1 text-[11px] font-bold uppercase tracking-[0.12em] text-white/30'>
                        Total Amount
                      </p>
                      <p className='text-3xl font-extrabold text-white leading-none'>
                        {displayAmount}
                      </p>
                      {sessionsLoading && (
                        <p className='mt-2 flex items-center gap-1.5 text-[11px] text-white/30'>
                          <Loader2 size={10} className='animate-spin' />
                          Finding your session…
                        </p>
                      )}
                      {assignedSession && !assignedSession.isFull && (
                        <p className='mt-2 text-[11px] text-white/40'>
                          Session:{' '}
                          <span className='font-semibold text-white/60'>
                            {assignedSession.label}
                          </span>
                          {assignedSession.city &&
                            assignedSession.city !== 'Online (Zoom)' && (
                              <span className='text-white/40'>
                                {' '}
                                · {assignedSession.city}
                              </span>
                            )}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Form fields */}
                  <div className='space-y-3'>
                    <div>
                      <input
                        type='text'
                        placeholder='Full Name *'
                        value={formData.name}
                        onChange={(e) =>
                          handleFieldChange('name', e.target.value)
                        }
                        disabled={isProcessing}
                        className={inputClass('name')}
                      />
                      {errors.name && (
                        <p className='mt-1 flex items-center gap-1 text-[11px] text-red-400'>
                          <AlertCircle size={11} />
                          {errors.name}
                        </p>
                      )}
                    </div>

                    <div>
                      <input
                        type='email'
                        placeholder='Email Address *'
                        value={formData.email}
                        onChange={(e) =>
                          handleFieldChange('email', e.target.value)
                        }
                        disabled={isProcessing}
                        className={inputClass('email')}
                      />
                      {errors.email && (
                        <p className='mt-1 flex items-center gap-1 text-[11px] text-red-400'>
                          <AlertCircle size={11} />
                          {errors.email}
                        </p>
                      )}
                    </div>

                    <div className='grid grid-cols-2 gap-3'>
                      <div>
                        <input
                          type='tel'
                          placeholder='Phone / WhatsApp'
                          value={formData.phone}
                          onChange={(e) =>
                            handleFieldChange('phone', e.target.value)
                          }
                          disabled={isProcessing}
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
                        <input
                          type='text'
                          placeholder='City'
                          value={formData.city}
                          onChange={(e) =>
                            handleFieldChange('city', e.target.value)
                          }
                          disabled={isProcessing}
                          className={inputClass('city')}
                        />
                      </div>
                    </div>
                  </div>

                  {/* ── Availability notices ───────────────────────────── */}
                  {sessionsError && (
                    <div className='flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/8 px-4 py-3'>
                      <AlertCircle
                        size={14}
                        className='shrink-0 text-red-400'
                      />
                      <p className='text-[12px] text-red-400'>
                        {sessionsError}{' '}
                        <button
                          onClick={() => fetchSessions(selectedProduct)}
                          className='underline'
                        >
                          Retry
                        </button>
                      </p>
                    </div>
                  )}
                  {errors.session && !allFull && (
                    <div className='flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/8 px-4 py-3'>
                      <AlertCircle
                        size={14}
                        className='shrink-0 text-amber-400'
                      />
                      <p className='text-[12px] text-amber-400'>
                        {errors.session}
                      </p>
                    </div>
                  )}
                  {noSessions && (
                    <div className='flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3'>
                      <AlertCircle
                        size={14}
                        className='shrink-0 text-white/40'
                      />
                      <p className='text-[12px] text-white/40'>
                        No upcoming sessions available. Please check back soon.
                      </p>
                    </div>
                  )}
                  {apiError && (
                    <p className='flex items-center gap-1.5 text-[12px] text-red-400'>
                      <AlertCircle size={12} />
                      {apiError}
                    </p>
                  )}

                  {/* ── FULL CAPACITY — replaces pay buttons ───────────── */}
                  {allFull && (
                    <SessionFullCard
                      session={assignedSession}
                      product={selectedProduct}
                      formData={formData}
                      onClose={onClose}
                    />
                  )}

                  {/* ── Product info notices (hidden when full) ─────────── */}
                  {!allFull && selectedProduct === 'Virtual Masterclass' && (
                    <div className='flex items-start gap-2.5 rounded-xl border border-white/8 bg-white/3 px-4 py-3'>
                      <Video
                        size={14}
                        className='mt-0.5 shrink-0 text-[#4a9eff]'
                      />
                      <p className='text-[12px] text-white/45 leading-relaxed'>
                        A Zoom meeting link will be automatically generated
                        after payment and sent to your email with the meeting
                        ID, passcode, and scheduled date/time.
                      </p>
                    </div>
                  )}

                  {!allFull &&
                    selectedProduct === 'Signature Live Masterclass' && (
                      <div className='rounded-xl border border-white/8 bg-white/3 px-4 py-3 space-y-2'>
                        <div className='flex items-start gap-2.5'>
                          <MapPin
                            size={14}
                            className='mt-0.5 shrink-0 text-[#d4a422]'
                          />
                          <p className='text-[12px] text-white/45 leading-relaxed'>
                            {assignedSession?.venue && assignedSession?.city ? (
                              <>
                                <span className='text-white/65 font-semibold'>
                                  {assignedSession.venue},{' '}
                                  {assignedSession.city}
                                </span>
                                {' — '}
                              </>
                            ) : null}
                            Full venue details, check-in instructions, and your
                            enrollment reference will be sent to your email
                            after payment.
                          </p>
                        </div>
                        <div className='flex items-start gap-2.5'>
                          <CalendarDays
                            size={14}
                            className='mt-0.5 shrink-0 text-[#d4a422]'
                          />
                          <p className='text-[12px] text-white/45 leading-relaxed'>
                            Your reference is required at the venue entrance on{' '}
                            <span className='text-white/65 font-semibold'>
                              both Day 1 and Day 2
                            </span>
                            . Save it after payment.
                          </p>
                        </div>
                      </div>
                    )}

                  {!allFull &&
                    selectedProduct === 'Private JaaS Consulting' && (
                      <div className='flex items-start gap-2.5 rounded-xl border border-white/8 bg-white/3 px-4 py-3'>
                        <ExternalLink
                          size={14}
                          className='mt-0.5 shrink-0 text-[#4a9eff]'
                        />
                        <p className='text-[12px] text-white/45 leading-relaxed'>
                          After payment you'll receive a personal scheduling
                          link to book your 1-on-1 session with Femi Olawale at
                          a time that works for you.
                        </p>
                      </div>
                    )}

                  {/* ── Pay buttons (hidden when session is full) ───────── */}
                  {!allFull && (
                    <div className='space-y-2.5'>
                      <button
                        type='button'
                        onClick={handleSubmit}
                        disabled={!canPay}
                        className='group flex w-full items-center justify-center gap-2.5 rounded-xl bg-[#2563eb] px-6 py-4 text-[14px] font-bold text-white transition-all hover:bg-[#1d4ed8] hover:shadow-[0_0_28px_rgba(37,99,235,0.45)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none'
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 size={16} className='animate-spin' />{' '}
                            Processing…
                          </>
                        ) : !paystackLoaded ? (
                          <>
                            <Loader2 size={16} className='animate-spin' />{' '}
                            Loading payment…
                          </>
                        ) : (
                          <>
                            <CreditCard size={16} /> {payButtonLabel}{' '}
                            <span className='ml-1 opacity-70'>→</span>
                          </>
                        )}
                      </button>

                      <button
                        type='button'
                        onClick={handleSubmit}
                        disabled={!canPay}
                        className='group flex w-full items-center justify-center gap-2.5 rounded-xl bg-[#d4a422] px-6 py-4 text-[14px] font-bold text-[#0a0800] transition-all hover:bg-[#c49510] hover:shadow-[0_0_28px_rgba(212,164,34,0.4)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none'
                      >
                        <Zap size={16} />
                        Quick Pay (Instant Confirmation)
                        <span className='ml-1 opacity-60'>→</span>
                      </button>
                    </div>
                  )}

                  {/* Footer links (hidden when full) */}
                  {!allFull && (
                    <div className='space-y-2 pb-1'>
                      <p className='text-center text-[11px] text-white/25'>
                        256-bit SSL encrypted · PCI DSS compliant · Powered by
                        Paystack
                      </p>
                      <p className='text-center text-[11px]'>
                        <a
                          href='/register'
                          className='text-[#4a9eff] hover:underline'
                        >
                          Create an account
                        </a>
                        <span className='text-white/25'>
                          {' '}
                          to track your bookings & payments
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
