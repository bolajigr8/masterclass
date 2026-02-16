'use client'

import { useState } from 'react'
import { Check, ArrowLeft, AlertCircle, Loader2 } from 'lucide-react'
import Script from 'next/script'
import type { CompleteEnrollmentData } from '@/lib/validations'

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

interface Step3PaymentProps {
  completeData: CompleteEnrollmentData
  onBack: () => void
  onSuccess: () => void
}

type AccessTier = 'virtual' | 'full'

const PRICING = {
  virtual: 20000,
  full: 50000,
}

export default function Step3Payment({
  completeData,
  onBack,
  onSuccess,
}: Step3PaymentProps) {
  const [selectedTier, setSelectedTier] = useState<AccessTier>('full')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [paystackLoaded, setPaystackLoaded] = useState(false)

  const selectedAmount = PRICING[selectedTier]
  const selectedAmountKobo = selectedAmount * 100

  const handlePayWithPaystack = async () => {
    // console.log('=== Payment Flow Started ===')
    // console.log('Complete Data:', completeData)
    // console.log('Selected Tier:', selectedTier)
    // console.log('Selected Amount:', selectedAmount)
    // console.log('Paystack Loaded:', paystackLoaded)
    // console.log('Window PaystackPop:', typeof window.PaystackPop)

    // Check if enrollment reference exists
    if (!completeData.enrollmentReference) {
      // setError(
      //   'Enrollment reference is missing. Please start over from step 1.',
      // )
      // console.error('Missing enrollment reference')
      return
    }

    if (!paystackLoaded || typeof window === 'undefined') {
      setError(
        'Payment system is not ready. Please wait a moment and try again.',
      )
      // console.error('Paystack not loaded or window undefined')
      return
    }

    const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || 'pk_test'

    // console.log('Using Paystack Key:', publicKey?.substring(0, 10) + '...')

    if (!window.PaystackPop) {
      setError('Unable to initialize payment at the moment. Please try again.')
      console.error('window.PaystackPop is undefined')
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      // console.log('Setting up Paystack handler...')

      const handler = window.PaystackPop.setup({
        key: publicKey,
        email: completeData.userInfo.email,
        amount: selectedAmountKobo,
        currency: 'NGN',
        callback: (response) => {
          // console.log('Payment callback received:', response)
          setIsProcessing(true)

          // Handle async operations in IIFE to avoid async callback
          ;(async () => {
            try {
              console.log('Verifying payment...')
              // Verify payment with backend
              const verifyResponse = await fetch('/api/payment/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reference: response.reference }),
              })

              const verifyData = await verifyResponse.json()
              // console.log('Verify response:', verifyData)

              if (!verifyResponse.ok || verifyData.status !== 'success') {
                throw new Error('Payment verification failed')
              }

              // console.log('Finalizing enrollment...')
              // Finalize enrollment
              const finalizeResponse = await fetch('/api/enrollment/finalize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  enrollmentReference: completeData.enrollmentReference,
                  selectedSession: completeData.session,
                  amountPaid: selectedAmount,
                  paymentReference: response.reference,
                  accessTier: selectedTier,
                }),
              })

              const finalizeData = await finalizeResponse.json()
              // console.log('Finalize response:', finalizeData)

              if (!finalizeResponse.ok) {
                throw new Error(
                  finalizeData.error || 'Failed to finalize enrollment',
                )
              }

              // Success!
              // console.log('Enrollment complete!')
              onSuccess()
            } catch (err: any) {
              console.error('Payment processing error:', err)
              setError(
                err.message || 'An error occurred processing your payment',
              )
              setIsProcessing(false)
            }
          })()
        },
        onClose: () => {
          // console.log('Payment modal closed')
          setIsProcessing(false)
          setError(null)
        },
      })

      // console.log('Handler created:', handler)
      // console.log('Opening Paystack iframe...')
      handler.openIframe()
      // console.log('Iframe opened successfully')
    } catch (err: any) {
      // console.error('Failed to open payment window:', err)
      console.error('Error details:', {
        message: err.message,
        stack: err.stack,
        name: err.name,
      })
      setError(
        `Failed to open payment window: ${err.message || 'Unknown error'}`,
      )
      setIsProcessing(false)
    }
  }

  return (
    <>
      <Script
        src='https://js.paystack.co/v1/inline.js'
        strategy='afterInteractive'
        onLoad={() => {
          console.log('Paystack script loaded')
          setPaystackLoaded(true)
        }}
        onError={(e) => {
          console.error('Failed to load Paystack script:', e)
          setError('Failed to load payment system. Please refresh the page.')
        }}
      />

      <div className='mx-auto max-w-3xl'>
        {/* Debug Info - Remove after testing */}
        {/* <div className='mb-4 rounded-lg bg-yellow-50 p-3 text-xs dark:bg-yellow-900/20'>
          <p className='font-semibold text-yellow-800 dark:text-yellow-300'>
            Debug Info:
          </p>
          <p className='text-yellow-700 dark:text-yellow-400'>
            Enrollment Ref: {completeData.enrollmentReference || 'MISSING'}
          </p>
          <p className='text-yellow-700 dark:text-yellow-400'>
            Email: {completeData.userInfo.email}
          </p>
          <p className='text-yellow-700 dark:text-yellow-400'>
            Session Date: {completeData.session.date}
          </p>
          <p className='text-yellow-700 dark:text-yellow-400'>
            Session Time: {completeData.session.time}
          </p>
          <p className='text-yellow-700 dark:text-yellow-400'>
            Paystack Loaded: {paystackLoaded ? 'Yes' : 'No'}
          </p>
        </div> */}

        <div className='mb-8 text-center'>
          <h2 className='mb-2 text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl'>
            Choose Your Access Tier
          </h2>
          <p className='text-gray-600 dark:text-gray-400'>
            Select the package that best fits your learning goals
          </p>
        </div>

        <div className='mb-8 grid gap-6 md:grid-cols-2'>
          {/* Virtual Access */}
          <button
            type='button'
            onClick={() => setSelectedTier('virtual')}
            disabled={isProcessing}
            className={`rounded-2xl border-2 bg-white p-6 text-left shadow-sm transition-all disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-900 ${
              selectedTier === 'virtual'
                ? 'border-blue-500 ring-4 ring-blue-100 dark:ring-blue-500/30'
                : 'border-gray-200 hover:border-blue-300 dark:border-gray-800 dark:hover:border-blue-700'
            }`}
          >
            <div className='mb-4 flex items-start justify-between'>
              <div>
                <p className='mb-1 text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-300'>
                  Virtual Access
                </p>
                <div className='text-3xl font-bold text-gray-900 dark:text-white'>
                  ₦{PRICING.virtual.toLocaleString('en-NG')}
                </div>
              </div>
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${
                  selectedTier === 'virtual'
                    ? 'border-blue-600 bg-blue-600'
                    : 'border-gray-300'
                }`}
              >
                {selectedTier === 'virtual' && (
                  <Check className='h-4 w-4 text-white' />
                )}
              </div>
            </div>
            <ul className='space-y-2 text-sm text-gray-700 dark:text-gray-200'>
              <li className='flex items-start gap-2'>
                <Check className='mt-0.5 h-4 w-4 shrink-0 text-blue-500' />
                <span>Full masterclass session</span>
              </li>
              <li className='flex items-start gap-2'>
                <Check className='mt-0.5 h-4 w-4 shrink-0 text-blue-500' />
                <span>Platform walkthrough</span>
              </li>
              <li className='flex items-start gap-2'>
                <Check className='mt-0.5 h-4 w-4 shrink-0 text-blue-500' />
                <span>Basic Q&A access</span>
              </li>
            </ul>
          </button>

          {/* Full Access */}
          <button
            type='button'
            onClick={() => setSelectedTier('full')}
            disabled={isProcessing}
            className={`relative rounded-2xl border-2 bg-white p-6 text-left shadow-md transition-all disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-900 ${
              selectedTier === 'full'
                ? 'border-blue-500 ring-4 ring-blue-100 dark:ring-blue-500/30'
                : 'border-blue-400 hover:border-blue-500 dark:border-blue-600 dark:hover:border-blue-500'
            }`}
          >
            <div className='absolute right-5 top-5 rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white'>
              Recommended
            </div>
            <div className='mb-4 flex items-start justify-between'>
              <div>
                <p className='mb-1 text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-300'>
                  Full Access
                </p>
                <div className='text-3xl font-bold text-gray-900 dark:text-white'>
                  ₦{PRICING.full.toLocaleString('en-NG')}
                </div>
              </div>
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${
                  selectedTier === 'full'
                    ? 'border-blue-600 bg-blue-600'
                    : 'border-gray-300'
                }`}
              >
                {selectedTier === 'full' && (
                  <Check className='h-4 w-4 text-white' />
                )}
              </div>
            </div>
            <ul className='space-y-2 text-sm text-gray-700 dark:text-gray-200'>
              <li className='flex items-start gap-2'>
                <Check className='mt-0.5 h-4 w-4 shrink-0 text-blue-500' />
                <span>Everything in Virtual</span>
              </li>
              <li className='flex items-start gap-2'>
                <Check className='mt-0.5 h-4 w-4 shrink-0 text-blue-500' />
                <span>Infrastructure deep dive</span>
              </li>
              <li className='flex items-start gap-2'>
                <Check className='mt-0.5 h-4 w-4 shrink-0 text-blue-500' />
                <span>Extended Q&A session</span>
              </li>
              <li className='flex items-start gap-2'>
                <Check className='mt-0.5 h-4 w-4 shrink-0 text-blue-500' />
                <span>Exclusive materials and resources</span>
              </li>
            </ul>
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className='mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400'>
            <AlertCircle className='mt-0.5 h-5 w-5 shrink-0' />
            <div>
              <p className='font-semibold'>Payment Error</p>
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className='flex gap-4'>
          <button
            type='button'
            onClick={onBack}
            disabled={isProcessing}
            className='flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
          >
            <ArrowLeft className='h-4 w-4' />
            Back
          </button>
          <button
            type='button'
            onClick={handlePayWithPaystack}
            disabled={isProcessing || !paystackLoaded}
            className='flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-blue-400'
          >
            {isProcessing ? (
              <>
                <Loader2 className='h-4 w-4 animate-spin' />
                <span>Processing...</span>
              </>
            ) : (
              `Pay ₦${selectedAmount.toLocaleString('en-NG')}`
            )}
          </button>
        </div>
      </div>
    </>
  )
}
