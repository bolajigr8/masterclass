'use client'

import { useState } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/footer'
import { Check } from 'lucide-react'
import Script from 'next/script'
import { useRouter } from 'next/navigation'

interface ReserveAccessData {
  fullName?: string
  email?: string
  phone?: string
  preferredDate?: string
}

declare global {
  interface Window {
    PaystackPop?: {
      setup(options: {
        key: string
        email: string
        amount: number
        currency?: string
        ref?: string
        callback: (response: { reference: string }) => void
        onClose: () => void
      }): {
        openIframe: () => void
      }
    }
  }
}

const AMOUNT_NAIRA = 50000
const AMOUNT_KOBO = AMOUNT_NAIRA * 100

export default function FinalizeEnrollmentPage() {
  const router = useRouter()
  const [reserveData] = useState<ReserveAccessData | null>(() => {
    if (typeof window === 'undefined') return null

    try {
      const raw = window.localStorage.getItem('reserveAccess')
      if (!raw) return null
      return JSON.parse(raw) as ReserveAccessData
    } catch {
      return null
    }
  })
  const [isProcessing, setIsProcessing] = useState(false)

  const emailFallback = reserveData?.email || 'test@example.com'

  const handlePayWithPaystack = () => {
    if (typeof window === 'undefined') return

    const publicKey =
      process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY ||
      'pk_test_cc624c94575976e59883ca4e49d7d936a6a850cc'

    if (!window.PaystackPop) {
      alert('Unable to initialize payment at the moment. Please try again.')
      return
    }

    setIsProcessing(true)

    const handler = window.PaystackPop.setup({
      key: publicKey,
      email: emailFallback,
      amount: AMOUNT_KOBO,
      currency: 'NGN',
      callback: () => {
        setIsProcessing(false)
        router.push('/booking')
      },
      onClose: () => {
        setIsProcessing(false)
        alert('Payment window closed. You can try again whenever you are ready.')
      },
    })

    handler.openIframe()
  }

  return (
    <>
      <Navbar />
      <Script src='https://js.paystack.co/v1/inline.js' strategy='afterInteractive' />
      <main className='bg-gray-50 px-6 py-16 dark:bg-gray-950 sm:px-12 sm:py-20 md:px-16 md:py-24 lg:px-24 lg:py-32 xl:px-32'>
        <div className='mx-auto max-w-4xl'>
          <div className='mb-10 text-center sm:mb-12'>
            <h1 className='mb-3 text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl md:text-5xl'>
              Finalize Your Enrollment
            </h1>
            <p className='text-base leading-relaxed text-gray-600 dark:text-gray-300 sm:text-lg'>
              Choose your access tier and complete payment to receive your
              session details.
            </p>
          </div>

          <div className='mb-8 grid gap-6 md:grid-cols-2'>
            <div className='rounded-2xl border border-blue-200 bg-white p-6 shadow-sm dark:border-blue-500/40 dark:bg-gray-900'>
              <p className='mb-2 text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-300'>
                Virtual Access
              </p>
              <div className='mb-4 text-3xl font-bold text-gray-900 dark:text-white'>
                ₦20,000
              </div>
              <ul className='space-y-2 text-sm text-gray-700 dark:text-gray-200'>
                <li className='flex items-start gap-2'>
                  <Check className='mt-0.5 h-4 w-4 text-blue-500' />
                  <span>Full masterclass session</span>
                </li>
                <li className='flex items-start gap-2'>
                  <Check className='mt-0.5 h-4 w-4 text-blue-500' />
                  <span>Platform walkthrough</span>
                </li>
                <li className='flex items-start gap-2'>
                  <Check className='mt-0.5 h-4 w-4 text-blue-500' />
                  <span>Basic Q&amp;A access</span>
                </li>
              </ul>
            </div>

            <div className='relative rounded-2xl border border-blue-500 bg-white p-6 shadow-md dark:border-blue-500 dark:bg-gray-900'>
              <div className='absolute right-5 top-5 rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white'>
                Recommended
              </div>
              <p className='mb-2 text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-300'>
                Full Access
              </p>
              <div className='mb-4 text-3xl font-bold text-gray-900 dark:text-white'>
                ₦50,000
              </div>
              <ul className='space-y-2 text-sm text-gray-700 dark:text-gray-200'>
                <li className='flex items-start gap-2'>
                  <Check className='mt-0.5 h-4 w-4 text-blue-500' />
                  <span>Everything in Virtual</span>
                </li>
                <li className='flex items-start gap-2'>
                  <Check className='mt-0.5 h-4 w-4 text-blue-500' />
                  <span>Infrastructure deep dive</span>
                </li>
                <li className='flex items-start gap-2'>
                  <Check className='mt-0.5 h-4 w-4 text-blue-500' />
                  <span>Extended Q&amp;A session</span>
                </li>
                <li className='flex items-start gap-2'>
                  <Check className='mt-0.5 h-4 w-4 text-blue-500' />
                  <span>Exclusive materials and resources</span>
                </li>
              </ul>
            </div>
          </div>

          <div className='mt-4'>
            <button
              type='button'
              onClick={handlePayWithPaystack}
              disabled={isProcessing}
              className='flex w-full items-center justify-center rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-blue-400'
            >
              {isProcessing ? 'Processing...' : `Pay ₦${AMOUNT_NAIRA.toLocaleString('en-NG')}`}
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
