'use client'

import { useState } from 'react'
import {
  CheckCircle2,
  Copy,
  Check,
  Wifi,
  MapPin,
  AlertTriangle,
  Mail,
  ExternalLink,
  QrCode,
  Clock,
} from 'lucide-react'
import type { EnrollmentSuccessData } from '@/lib/validations'

interface SuccessMessageProps {
  successData: EnrollmentSuccessData
  userEmail: string
  onReset?: () => void
}

function useCopyToClipboard() {
  const [copied, setCopied] = useState(false)

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      // fallback for older browsers / non-HTTPS
      const el = document.createElement('textarea')
      el.value = text
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }

  return { copied, copy }
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString('en-NG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function formatTime(timeStr: string): string {
  const parts = timeStr.split(':')
  if (parts.length < 2) return timeStr
  const ref = new Date()
  ref.setHours(Number(parts[0]), Number(parts[1]))
  return ref.toLocaleTimeString('en-NG', { hour: 'numeric', minute: '2-digit' })
}

// ─────────────────────────────────────────────────────────────────────────────
// Virtual Access Success
// ─────────────────────────────────────────────────────────────────────────────

function VirtualSuccess({
  successData,
  userEmail,
  onReset,
}: SuccessMessageProps) {
  const { copy: copyRef, copied: refCopied } = useCopyToClipboard()
  const webinarLink =
    process.env.NEXT_PUBLIC_WEBINAR_LINK ?? 'https://yourdomain.com/webinar'

  return (
    <div className='mx-auto max-w-2xl'>
      {/* Header card */}
      <div className='rounded-2xl border border-green-200 bg-white p-8 text-center shadow-sm dark:border-green-800/50 dark:bg-gray-900 sm:p-12'>
        <div className='mb-6 flex justify-center'>
          <div className='rounded-full bg-green-100 p-4 dark:bg-green-900/30'>
            <CheckCircle2 className='h-14 w-14 text-green-600 dark:text-green-400' />
          </div>
        </div>

        <div className='mb-2 flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400'>
          <Wifi className='h-4 w-4' />
          <span className='text-xs font-semibold uppercase tracking-wider'>
            Virtual Access Confirmed
          </span>
        </div>

        <h2 className='mb-3 text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl'>
          You're all set!
        </h2>
        <p className='mb-8 text-gray-600 dark:text-gray-400'>
          Payment confirmed. Your virtual access to{' '}
          <span className='font-medium text-gray-800 dark:text-gray-200'>
            {successData.productType}
          </span>{' '}
          is ready.
        </p>

        {/* Webinar link — most prominent element */}
        <div className='mb-6 overflow-hidden rounded-2xl border-2 border-blue-200 bg-blue-50 dark:border-blue-700/50 dark:bg-blue-900/20'>
          <div className='border-b border-blue-200 bg-blue-100 px-5 py-3 dark:border-blue-700/50 dark:bg-blue-900/40'>
            <div className='flex items-center gap-2'>
              <Wifi className='h-4 w-4 text-blue-600 dark:text-blue-400' />
              <span className='text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300'>
                Your Webinar Link
              </span>
            </div>
          </div>
          <div className='p-5'>
            <a
              href={webinarLink}
              target='_blank'
              rel='noopener noreferrer'
              className='mb-3 flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700'
            >
              <ExternalLink className='h-4 w-4' />
              Join Webinar
            </a>
            <p className='text-center text-xs text-blue-600 break-all dark:text-blue-400'>
              {webinarLink}
            </p>
            <p className='mt-3 text-center text-xs text-blue-700 dark:text-blue-300'>
              This link becomes active at your session time. Do not share it.
            </p>
          </div>
        </div>

        {/* Session + booking details */}
        <div className='mb-6 rounded-xl bg-gray-50 p-5 text-left dark:bg-gray-800'>
          <p className='mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400'>
            Booking Details
          </p>
          <div className='space-y-2 text-sm text-gray-700 dark:text-gray-300'>
            <div className='flex justify-between'>
              <span className='text-gray-500 dark:text-gray-400'>
                Programme
              </span>
              <span className='font-medium'>{successData.productType}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-gray-500 dark:text-gray-400'>Session</span>
              <span className='font-medium'>
                {formatDate(successData.selectedSession.date)} at{' '}
                {formatTime(successData.selectedSession.time)}
              </span>
            </div>
            <div className='flex justify-between'>
              <span className='text-gray-500 dark:text-gray-400'>Access</span>
              <span className='font-medium'>Virtual</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-gray-500 dark:text-gray-400'>
                Reference
              </span>
              <button
                onClick={() => copyRef(successData.enrollmentReference)}
                className='flex items-center gap-1 font-mono text-xs font-medium text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400'
              >
                {successData.enrollmentReference}
                {refCopied ? (
                  <Check className='h-3 w-3 text-green-500' />
                ) : (
                  <Copy className='h-3 w-3' />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Email confirmation note */}
        <div className='mb-6 flex items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 text-left text-sm dark:border-gray-800 dark:bg-gray-800'>
          <Mail className='mt-0.5 h-4 w-4 shrink-0 text-gray-400' />
          <p className='text-gray-600 dark:text-gray-400'>
            A confirmation email with your webinar link and booking details has
            been sent to{' '}
            <span className='font-medium text-gray-800 dark:text-gray-200'>
              {userEmail}
            </span>
            . Check your spam folder if it doesn't arrive within a few minutes.
          </p>
        </div>

        {onReset && (
          <button
            type='button'
            onClick={onReset}
            className='rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
          >
            Book Another Session
          </button>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Full / Live Access Success
// ─────────────────────────────────────────────────────────────────────────────

function FullAccessSuccess({
  successData,
  userEmail,
  onReset,
}: SuccessMessageProps) {
  const { copy: copyRef, copied: refCopied } = useCopyToClipboard()
  const { copy: copyEmail, copied: emailCopied } = useCopyToClipboard()

  return (
    <div className='mx-auto max-w-2xl space-y-4'>
      {/* Header card */}
      <div className='rounded-2xl border border-green-200 bg-white p-8 text-center shadow-sm dark:border-green-800/50 dark:bg-gray-900 sm:p-10'>
        <div className='mb-5 flex justify-center'>
          <div className='rounded-full bg-green-100 p-4 dark:bg-green-900/30'>
            <CheckCircle2 className='h-14 w-14 text-green-600 dark:text-green-400' />
          </div>
        </div>

        <div className='mb-2 flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400'>
          <MapPin className='h-4 w-4' />
          <span className='text-xs font-semibold uppercase tracking-wider'>
            Live Attendance Confirmed
          </span>
        </div>

        <h2 className='mb-3 text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl'>
          Your spot is secured!
        </h2>
        <p className='mb-0 text-gray-600 dark:text-gray-400'>
          Payment confirmed for{' '}
          <span className='font-medium text-gray-800 dark:text-gray-200'>
            {successData.productType}
          </span>
          .
        </p>
      </div>

      {/* ── ENROLLMENT REFERENCE — most critical element for live attendees ── */}
      <div className='overflow-hidden rounded-2xl border-2 border-amber-300 bg-amber-50 shadow-sm dark:border-amber-600/50 dark:bg-amber-900/20'>
        {/* Warning header */}
        <div className='flex items-center gap-3 border-b border-amber-300 bg-amber-100 px-5 py-4 dark:border-amber-600/50 dark:bg-amber-900/40'>
          <AlertTriangle className='h-5 w-5 shrink-0 text-amber-700 dark:text-amber-400' />
          <div>
            <p className='text-sm font-bold text-amber-800 dark:text-amber-300'>
              Save Your Enrollment Reference
            </p>
            <p className='text-xs text-amber-700 dark:text-amber-400'>
              You will need this to check in at the venue on the day of the
              event
            </p>
          </div>
        </div>

        {/* Reference display */}
        <div className='p-6'>
          <div className='mb-4 flex items-center justify-between rounded-xl bg-white px-4 py-4 shadow-sm dark:bg-gray-900'>
            <span className='mr-3 break-all font-mono text-lg font-bold tracking-widest text-gray-900 dark:text-white'>
              {successData.enrollmentReference}
            </span>
            <button
              onClick={() => copyRef(successData.enrollmentReference)}
              className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
                refCopied
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              {refCopied ? (
                <>
                  <Check className='h-3.5 w-3.5' />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className='h-3.5 w-3.5' />
                  Copy
                </>
              )}
            </button>
          </div>

          <ul className='space-y-2 text-xs text-amber-800 dark:text-amber-300'>
            <li className='flex items-start gap-2'>
              <Check className='mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600' />
              Screenshot this page or copy your reference now
            </li>
            <li className='flex items-start gap-2'>
              <Check className='mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600' />A
              copy has also been emailed to{' '}
              <button
                onClick={() => copyEmail(userEmail)}
                className='inline-flex items-center gap-1 font-semibold underline underline-offset-2'
              >
                {userEmail}
                {emailCopied ? (
                  <Check className='h-3 w-3' />
                ) : (
                  <Copy className='h-3 w-3' />
                )}
              </button>
            </li>
            <li className='flex items-start gap-2'>
              <Check className='mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600' />
              Keep it easily accessible on your phone for the event day
            </li>
          </ul>
        </div>
      </div>

      {/* ── Check-in Instructions ─────────────────────────────────────────── */}
      <div className='overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900'>
        <div className='flex items-center gap-3 border-b border-gray-100 bg-gray-50 px-5 py-4 dark:border-gray-800 dark:bg-gray-800/50'>
          <QrCode className='h-5 w-5 text-gray-500 dark:text-gray-400' />
          <p className='text-sm font-semibold text-gray-800 dark:text-gray-200'>
            How to Check In on the Day
          </p>
        </div>
        <div className='p-5'>
          <ol className='space-y-4'>
            {[
              {
                step: '1',
                title: 'Arrive at the venue',
                detail: `Check-in opens 30 minutes before your session starts. Aim to arrive with time to spare.`,
              },
              {
                step: '2',
                title: 'Scan the QR code at the entrance',
                detail:
                  'Event staff will display a QR code at the venue entrance. Scan it with your phone camera.',
              },
              {
                step: '3',
                title: 'Enter your email and enrollment reference',
                detail:
                  'On the check-in page that opens, enter the email you registered with and your enrollment reference shown above.',
              },
              {
                step: '4',
                title: 'See "Access Granted"',
                detail:
                  "If all details match, you'll be admitted immediately. No printout required.",
              },
            ].map(({ step, title, detail }) => (
              <li key={step} className='flex gap-4'>
                <div className='flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white'>
                  {step}
                </div>
                <div>
                  <p className='text-sm font-semibold text-gray-900 dark:text-white'>
                    {title}
                  </p>
                  <p className='mt-0.5 text-xs leading-relaxed text-gray-500 dark:text-gray-400'>
                    {detail}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* ── Session + timing details ──────────────────────────────────────── */}
      <div className='rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900'>
        <div className='mb-3 flex items-center gap-2'>
          <Clock className='h-4 w-4 text-gray-400' />
          <p className='text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400'>
            Session Details
          </p>
        </div>
        <div className='space-y-2 text-sm text-gray-700 dark:text-gray-300'>
          <div className='flex justify-between'>
            <span className='text-gray-500 dark:text-gray-400'>Programme</span>
            <span className='font-medium'>{successData.productType}</span>
          </div>
          <div className='flex justify-between'>
            <span className='text-gray-500 dark:text-gray-400'>Date</span>
            <span className='font-medium'>
              {formatDate(successData.selectedSession.date)}
            </span>
          </div>
          <div className='flex justify-between'>
            <span className='text-gray-500 dark:text-gray-400'>Time</span>
            <span className='font-medium'>
              {formatTime(successData.selectedSession.time)}
            </span>
          </div>
          <div className='flex justify-between'>
            <span className='text-gray-500 dark:text-gray-400'>Access</span>
            <span className='font-medium'>Full — Live Attendance</span>
          </div>
        </div>
      </div>

      {/* Email note + reset */}
      <div className='rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900'>
        <div className='flex items-start gap-3 text-sm'>
          <Mail className='mt-0.5 h-4 w-4 shrink-0 text-gray-400' />
          <p className='text-gray-600 dark:text-gray-400'>
            A confirmation email with your enrollment reference and check-in
            instructions has been sent to{' '}
            <span className='font-medium text-gray-800 dark:text-gray-200'>
              {userEmail}
            </span>
            . Check your spam folder if it doesn't arrive within a few minutes.
          </p>
        </div>

        {onReset && (
          <div className='mt-5 text-center'>
            <button
              type='button'
              onClick={onReset}
              className='rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
            >
              Book Another Session
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Exported: routes to the right success view based on tier
// ─────────────────────────────────────────────────────────────────────────────

export default function SuccessMessage(props: SuccessMessageProps) {
  if (props.successData.accessTier === 'virtual') {
    return <VirtualSuccess {...props} />
  }
  return <FullAccessSuccess {...props} />
}
