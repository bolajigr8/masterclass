'use client'

import { useState, useEffect } from 'react'
import { QrCode, Download, Maximize2, X } from 'lucide-react'

interface QRCodeDisplayProps {
  sessionId: string
}

export default function QRCodeDisplay({ sessionId }: QRCodeDisplayProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!sessionId) return

    setIsLoading(true)
    setError(null)

    // Fetch QR code as base64 data URL
    fetch(`/api/qr/${encodeURIComponent(sessionId)}?format=base64`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to generate QR code')
        return res.json()
      })
      .then((data) => {
        setQrDataUrl(data.qrCode)
        setIsLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setIsLoading(false)
      })
  }, [sessionId])

  const downloadQR = () => {
    if (!qrDataUrl) return

    const a = document.createElement('a')
    a.href = qrDataUrl
    a.download = `qr-code-${sessionId}.png`
    a.click()
  }

  if (isLoading) {
    return (
      <div className='border-4 border-neutral-900 bg-white p-8'>
        <div className='flex h-64 items-center justify-center'>
          <div className='h-12 w-12 animate-spin rounded-full border-4 border-neutral-900 border-t-transparent' />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='border-4 border-red-600 bg-red-50 p-8'>
        <p className='text-center font-mono text-sm text-red-900'>{error}</p>
      </div>
    )
  }

  return (
    <>
      <div className='border-4 border-neutral-900 bg-white'>
        <div className='border-b-4 border-neutral-900 bg-neutral-950 px-6 py-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <QrCode className='h-5 w-5 text-white' strokeWidth={2} />
              <h3 className='font-mono text-sm font-bold uppercase tracking-wider text-white'>
                Check-In QR Code
              </h3>
            </div>
            <div className='flex items-center gap-2'>
              <button
                onClick={downloadQR}
                className='flex items-center gap-2 border-2 border-white bg-white px-3 py-2 font-mono text-xs font-bold uppercase text-neutral-950 transition-colors hover:bg-neutral-950 hover:text-white'
              >
                <Download className='h-4 w-4' />
                Download
              </button>
              <button
                onClick={() => setIsFullscreen(true)}
                className='flex items-center gap-2 border-2 border-white bg-white px-3 py-2 font-mono text-xs font-bold uppercase text-neutral-950 transition-colors hover:bg-neutral-950 hover:text-white'
              >
                <Maximize2 className='h-4 w-4' />
                Fullscreen
              </button>
            </div>
          </div>
        </div>

        <div className='bg-white p-8'>
          <div className='mx-auto w-fit border-8 border-neutral-950 bg-white p-6'>
            {qrDataUrl && (
              <img
                src={qrDataUrl}
                alt={`QR code for session ${sessionId}`}
                className='h-64 w-64'
              />
            )}
          </div>

          <div className='mt-6 space-y-2 text-center'>
            <p className='font-mono text-xs font-bold uppercase tracking-wider text-neutral-900'>
              Session: {sessionId}
            </p>
            <p className='font-mono text-xs text-neutral-500'>
              Display this QR code at the venue entrance for attendee check-in
            </p>
          </div>
        </div>
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div
          className='fixed inset-0 z-50 flex items-center justify-center bg-neutral-950'
          onClick={() => setIsFullscreen(false)}
        >
          <button
            onClick={() => setIsFullscreen(false)}
            className='absolute right-8 top-8 text-white transition-colors hover:text-neutral-400'
          >
            <X className='h-8 w-8' strokeWidth={2} />
          </button>

          <div className='border-8 border-white bg-white p-12'>
            {qrDataUrl && (
              <img
                src={qrDataUrl}
                alt={`QR code for session ${sessionId}`}
                className='h-128 w-lg'
              />
            )}
          </div>

          <div className='absolute bottom-8 text-center'>
            <p className='font-mono text-lg font-bold uppercase tracking-wider text-white'>
              Session: {sessionId}
            </p>
            <p className='mt-2 font-mono text-sm text-neutral-400'>
              Press ESC or click anywhere to close
            </p>
          </div>
        </div>
      )}
    </>
  )
}
