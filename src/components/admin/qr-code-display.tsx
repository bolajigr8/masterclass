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

  // Build the attendee-facing check-in URL
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ??
    (typeof window !== 'undefined'
      ? window.location.origin
      : 'https://yourdomain.com')

  const checkInUrl = `${baseUrl}/checkin?sessionId=${encodeURIComponent(sessionId)}&day=${day}`

  // Use the QR Server public API to generate the QR code image
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=10&data=${encodeURIComponent(checkInUrl)}`

  return (
    <div className='border-4 border-neutral-900 bg-white'>
      {/* Header */}
      <div className='border-b-4 border-neutral-900 bg-neutral-950 px-6 py-4'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <QrCode className='h-5 w-5 text-white' />
            <div>
              <h2 className='font-mono text-sm font-bold uppercase tracking-wider text-white'>
                Check-In QR Code — Day {day}
              </h2>
              <p className='font-mono text-xs text-neutral-400'>
                {sessionLabel}
              </p>
            </div>
          </div>
          <span className='border border-white/20 px-3 py-1 font-mono text-xs font-bold uppercase text-white/60'>
            Display at entrance
          </span>
        </div>
      </div>

      <div className='flex flex-col items-center gap-6 p-8 sm:flex-row sm:items-start'>
        {/* QR Code image */}
        <div className='shrink-0 border-4 border-neutral-900 p-2 shadow-[4px_4px_0_#171717]'>
          <Image
            src={qrImageUrl}
            alt={`Check-in QR Code for Day ${day}`}
            width={220}
            height={220}
            unoptimized // external URL
          />
        </div>

        {/* Info + URL */}
        <div className='flex-1 space-y-4'>
          <div>
            <p className='mb-1 font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-500'>
              Instructions for Event Staff
            </p>
            <ul className='space-y-1.5 font-mono text-sm text-neutral-700'>
              <li className='flex items-start gap-2'>
                <span className='mt-0.5 font-bold text-neutral-900'>1.</span>
                Display this QR code prominently at the venue entrance.
              </li>
              <li className='flex items-start gap-2'>
                <span className='mt-0.5 font-bold text-neutral-900'>2.</span>
                Attendees scan with their phone camera — no app needed.
              </li>
              <li className='flex items-start gap-2'>
                <span className='mt-0.5 font-bold text-neutral-900'>3.</span>
                They enter their email and enrollment reference on the page.
              </li>
              <li className='flex items-start gap-2'>
                <span className='mt-0.5 font-bold text-neutral-900'>4.</span>A
                green <strong>"Access Granted"</strong> screen confirms entry.
              </li>
              {day === 2 && (
                <li className='flex items-start gap-2 border-l-4 border-neutral-900 pl-3'>
                  <span className='font-bold text-neutral-900'>Note:</span>
                  This is the Day 2 QR code. Make sure to display the correct
                  code each day.
                </li>
              )}
            </ul>
          </div>

          {/* URL copy */}
          <div>
            <p className='mb-1 font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-500'>
              Check-In URL
            </p>
            <div className='flex items-center gap-2 border-2 border-neutral-900 bg-neutral-50'>
              <code className='flex-1 overflow-hidden text-ellipsis whitespace-nowrap px-3 py-2 font-mono text-xs text-neutral-700'>
                {checkInUrl}
              </code>
              <button
                onClick={() => copy(checkInUrl)}
                className='flex shrink-0 items-center gap-1.5 border-l-2 border-neutral-900 bg-white px-3 py-2 font-mono text-xs font-bold uppercase text-neutral-900 transition-colors hover:bg-neutral-100'
              >
                {copied ? (
                  <>
                    <Check className='h-3.5 w-3.5 text-green-600' />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className='h-3.5 w-3.5' />
                    Copy
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
                Test
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
