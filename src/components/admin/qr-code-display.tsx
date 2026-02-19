'use client'

import { useState } from 'react'
import Image from 'next/image'
import { QrCode, Copy, Check, ExternalLink } from 'lucide-react'

interface QRCodeDisplayProps {
  sessionId: string
  day: 1 | 2
  sessionLabel: string
}

function useCopy() {
  const [copied, setCopied] = useState(false)
  const copy = async (text: string) => {
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
  }
  return { copied, copy }
}

export default function QRCodeDisplay({
  sessionId,
  day,
  sessionLabel,
}: QRCodeDisplayProps) {
  const { copied, copy } = useCopy()

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ??
    (typeof window !== 'undefined'
      ? window.location.origin
      : 'https://yourdomain.com')

  const checkInUrl = `${baseUrl}/checkin?sessionId=${encodeURIComponent(sessionId)}&day=${day}`

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=10&data=${encodeURIComponent(checkInUrl)}`

  return (
    <div className='overflow-hidden border-4 border-neutral-900 bg-white'>
      {/* Header */}
      <div className='border-b-4 border-neutral-900 bg-neutral-950 px-4 py-4'>
        <div className='flex flex-wrap items-center justify-between gap-2'>
          <div className='flex min-w-0 items-center gap-3'>
            <QrCode className='h-5 w-5 shrink-0 text-white' />
            <div className='min-w-0'>
              <h2 className='wrap-break-word font-mono text-sm font-bold uppercase tracking-wider text-white'>
                Check-In QR Code — Day {day}
              </h2>
              <p className='wrap-break-word font-mono text-xs text-neutral-400'>
                {sessionLabel}
              </p>
            </div>
          </div>
          <span className='shrink-0 border border-white/20 px-3 py-1 font-mono text-xs font-bold uppercase text-white/60'>
            Display at entrance
          </span>
        </div>
      </div>

      {/* Always stacked: QR on top, content below */}
      <div className='flex flex-col items-center gap-6 p-6'>
        {/* QR Code image */}
        <div className='shrink-0 border-4 border-neutral-900 p-2 shadow-[4px_4px_0_#171717]'>
          <Image
            src={qrImageUrl}
            alt={`Check-in QR Code for Day ${day}`}
            width={220}
            height={220}
            unoptimized
          />
        </div>

        {/* Info + URL — full width below QR */}
        <div className='w-full space-y-4'>
          <div>
            <p className='mb-1 font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-500'>
              Instructions for Event Staff
            </p>
            <ul className='space-y-1.5 font-mono text-sm text-neutral-700'>
              <li className='flex items-start gap-2'>
                <span className='mt-0.5 shrink-0 font-bold text-neutral-900'>
                  1.
                </span>
                <span>
                  Display this QR code prominently at the venue entrance.
                </span>
              </li>
              <li className='flex items-start gap-2'>
                <span className='mt-0.5 shrink-0 font-bold text-neutral-900'>
                  2.
                </span>
                <span>
                  Attendees scan with their phone camera — no app needed.
                </span>
              </li>
              <li className='flex items-start gap-2'>
                <span className='mt-0.5 shrink-0 font-bold text-neutral-900'>
                  3.
                </span>
                <span>
                  They enter their email and enrollment reference on the page.
                </span>
              </li>
              <li className='flex items-start gap-2'>
                <span className='mt-0.5 shrink-0 font-bold text-neutral-900'>
                  4.
                </span>
                <span>
                  A green <strong>"Access Granted"</strong> screen confirms
                  entry.
                </span>
              </li>
              {day === 2 && (
                <li className='flex items-start gap-2 border-l-4 border-neutral-900 pl-3'>
                  <span className='shrink-0 font-bold text-neutral-900'>
                    Note:
                  </span>
                  <span>
                    This is the Day 2 QR code. Make sure to display the correct
                    code each day.
                  </span>
                </li>
              )}
            </ul>
          </div>

          {/* URL copy */}
          <div>
            <p className='mb-1 font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-500'>
              Check-In URL
            </p>
            <div className='flex w-full items-center overflow-hidden border-2 border-neutral-900 bg-neutral-50'>
              <code className='min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap px-3 py-2 font-mono text-xs text-neutral-700'>
                {checkInUrl}
              </code>
              <button
                onClick={() => copy(checkInUrl)}
                className='flex shrink-0 items-center gap-1.5 border-l-2 border-neutral-900 bg-white px-3 py-2 font-mono text-xs font-bold uppercase text-neutral-900 transition-colors hover:bg-neutral-100'
              >
                {copied ? (
                  <>
                    <Check className='h-3.5 w-3.5 text-green-600' />
                    <span className='hidden sm:inline'>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className='h-3.5 w-3.5' />
                    <span className='hidden sm:inline'>Copy</span>
                  </>
                )}
              </button>
              <a
                href={checkInUrl}
                target='_blank'
                rel='noopener noreferrer'
                className='flex shrink-0 items-center gap-1.5 border-l-2 border-neutral-900 bg-white px-3 py-2 font-mono text-xs font-bold uppercase text-neutral-900 transition-colors hover:bg-neutral-100'
              >
                <ExternalLink className='h-3.5 w-3.5' />
                <span className='hidden sm:inline'>Test</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
