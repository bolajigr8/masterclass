// 'use client'

// import { useState } from 'react'
// import { Check, ArrowLeft, AlertCircle, Loader2 } from 'lucide-react'
// import Script from 'next/script'
// import type { CompleteEnrollmentData } from '@/lib/validations'

// declare global {
//   interface Window {
//     PaystackPop?: {
//       setup(options: {
//         key: string
//         email: string
//         amount: number
//         currency?: string
//         ref?: string
//         callback: (response: { reference: string }) => void
//         onClose: () => void
//       }): {
//         openIframe: () => void
//       }
//     }
//   }
// }

// interface Step3PaymentProps {
//   completeData: CompleteEnrollmentData
//   onBack: () => void
//   onSuccess: () => void
// }

// type AccessTier = 'virtual' | 'full'

// const PRICING = {
//   virtual: 20000,
//   full: 50000,
// }

// export default function Step3Payment({
//   completeData,
//   onBack,
//   onSuccess,
// }: Step3PaymentProps) {
//   const [selectedTier, setSelectedTier] = useState<AccessTier>('full')
//   const [isProcessing, setIsProcessing] = useState(false)
//   const [error, setError] = useState<string | null>(null)
//   const [paystackLoaded, setPaystackLoaded] = useState(false)

//   const selectedAmount = PRICING[selectedTier]
//   const selectedAmountKobo = selectedAmount * 100

//   const handlePayWithPaystack = async () => {
//     // console.log('=== Payment Flow Started ===')
//     // console.log('Complete Data:', completeData)
//     // console.log('Selected Tier:', selectedTier)
//     // console.log('Selected Amount:', selectedAmount)
//     // console.log('Paystack Loaded:', paystackLoaded)
//     // console.log('Window PaystackPop:', typeof window.PaystackPop)

//     // Check if enrollment reference exists
//     if (!completeData.enrollmentReference) {
//       // setError(
//       //   'Enrollment reference is missing. Please start over from step 1.',
//       // )
//       // console.error('Missing enrollment reference')
//       return
//     }

//     if (!paystackLoaded || typeof window === 'undefined') {
//       setError(
//         'Payment system is not ready. Please wait a moment and try again.',
//       )
//       // console.error('Paystack not loaded or window undefined')
//       return
//     }

//     const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || 'pk_test'

//     // console.log('Using Paystack Key:', publicKey?.substring(0, 10) + '...')

//     if (!window.PaystackPop) {
//       setError('Unable to initialize payment at the moment. Please try again.')
//       console.error('window.PaystackPop is undefined')
//       return
//     }

//     setIsProcessing(true)
//     setError(null)

//     try {
//       // console.log('Setting up Paystack handler...')

//       const handler = window.PaystackPop.setup({
//         key: publicKey,
//         email: completeData.userInfo.email,
//         amount: selectedAmountKobo,
//         currency: 'NGN',
//         callback: (response) => {
//           // console.log('Payment callback received:', response)
//           setIsProcessing(true)

//           // Handle async operations in IIFE to avoid async callback
//           ;(async () => {
//             try {
//               console.log('Verifying payment...')
//               // Verify payment with backend
//               const verifyResponse = await fetch('/api/payment/verify', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ reference: response.reference }),
//               })

//               const verifyData = await verifyResponse.json()
//               // console.log('Verify response:', verifyData)

//               if (!verifyResponse.ok || verifyData.status !== 'success') {
//                 throw new Error('Payment verification failed')
//               }

//               // console.log('Finalizing enrollment...')
//               // Finalize enrollment
//               const finalizeResponse = await fetch('/api/enrollment/finalize', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({
//                   enrollmentReference: completeData.enrollmentReference,
//                   selectedSession: completeData.session,
//                   amountPaid: selectedAmount,
//                   paymentReference: response.reference,
//                   accessTier: selectedTier,
//                 }),
//               })

//               const finalizeData = await finalizeResponse.json()
//               // console.log('Finalize response:', finalizeData)

//               if (!finalizeResponse.ok) {
//                 throw new Error(
//                   finalizeData.error || 'Failed to finalize enrollment',
//                 )
//               }

//               // Success!
//               // console.log('Enrollment complete!')
//               onSuccess()
//             } catch (err: any) {
//               console.error('Payment processing error:', err)
//               setError(
//                 err.message || 'An error occurred processing your payment',
//               )
//               setIsProcessing(false)
//             }
//           })()
//         },
//         onClose: () => {
//           // console.log('Payment modal closed')
//           setIsProcessing(false)
//           setError(null)
//         },
//       })

//       // console.log('Handler created:', handler)
//       // console.log('Opening Paystack iframe...')
//       handler.openIframe()
//       // console.log('Iframe opened successfully')
//     } catch (err: any) {
//       // console.error('Failed to open payment window:', err)
//       console.error('Error details:', {
//         message: err.message,
//         stack: err.stack,
//         name: err.name,
//       })
//       setError(
//         `Failed to open payment window: ${err.message || 'Unknown error'}`,
//       )
//       setIsProcessing(false)
//     }
//   }

//   return (
//     <>
//       <Script
//         src='https://js.paystack.co/v1/inline.js'
//         strategy='afterInteractive'
//         onLoad={() => {
//           console.log('Paystack script loaded')
//           setPaystackLoaded(true)
//         }}
//         onError={(e) => {
//           console.error('Failed to load Paystack script:', e)
//           setError('Failed to load payment system. Please refresh the page.')
//         }}
//       />

//       <div className='mx-auto max-w-3xl'>
//         {/* Debug Info - Remove after testing */}
//         {/* <div className='mb-4 rounded-lg bg-yellow-50 p-3 text-xs dark:bg-yellow-900/20'>
//           <p className='font-semibold text-yellow-800 dark:text-yellow-300'>
//             Debug Info:
//           </p>
//           <p className='text-yellow-700 dark:text-yellow-400'>
//             Enrollment Ref: {completeData.enrollmentReference || 'MISSING'}
//           </p>
//           <p className='text-yellow-700 dark:text-yellow-400'>
//             Email: {completeData.userInfo.email}
//           </p>
//           <p className='text-yellow-700 dark:text-yellow-400'>
//             Session Date: {completeData.session.date}
//           </p>
//           <p className='text-yellow-700 dark:text-yellow-400'>
//             Session Time: {completeData.session.time}
//           </p>
//           <p className='text-yellow-700 dark:text-yellow-400'>
//             Paystack Loaded: {paystackLoaded ? 'Yes' : 'No'}
//           </p>
//         </div> */}

//         <div className='mb-8 text-center'>
//           <h2 className='mb-2 text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl'>
//             Choose Your Access Tier
//           </h2>
//           <p className='text-gray-600 dark:text-gray-400'>
//             Select the package that best fits your learning goals
//           </p>
//         </div>

//         <div className='mb-8 grid gap-6 md:grid-cols-2'>
//           {/* Virtual Access */}
//           <button
//             type='button'
//             onClick={() => setSelectedTier('virtual')}
//             disabled={isProcessing}
//             className={`rounded-2xl border-2 bg-white p-6 text-left shadow-sm transition-all disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-900 ${
//               selectedTier === 'virtual'
//                 ? 'border-blue-500 ring-4 ring-blue-100 dark:ring-blue-500/30'
//                 : 'border-gray-200 hover:border-blue-300 dark:border-gray-800 dark:hover:border-blue-700'
//             }`}
//           >
//             <div className='mb-4 flex items-start justify-between'>
//               <div>
//                 <p className='mb-1 text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-300'>
//                   Virtual Access
//                 </p>
//                 <div className='text-3xl font-bold text-gray-900 dark:text-white'>
//                   ₦{PRICING.virtual.toLocaleString('en-NG')}
//                 </div>
//               </div>
//               <div
//                 className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${
//                   selectedTier === 'virtual'
//                     ? 'border-blue-600 bg-blue-600'
//                     : 'border-gray-300'
//                 }`}
//               >
//                 {selectedTier === 'virtual' && (
//                   <Check className='h-4 w-4 text-white' />
//                 )}
//               </div>
//             </div>
//             <ul className='space-y-2 text-sm text-gray-700 dark:text-gray-200'>
//               <li className='flex items-start gap-2'>
//                 <Check className='mt-0.5 h-4 w-4 shrink-0 text-blue-500' />
//                 <span>Full masterclass session</span>
//               </li>
//               <li className='flex items-start gap-2'>
//                 <Check className='mt-0.5 h-4 w-4 shrink-0 text-blue-500' />
//                 <span>Platform walkthrough</span>
//               </li>
//               <li className='flex items-start gap-2'>
//                 <Check className='mt-0.5 h-4 w-4 shrink-0 text-blue-500' />
//                 <span>Basic Q&A access</span>
//               </li>
//             </ul>
//           </button>

//           {/* Full Access */}
//           <button
//             type='button'
//             onClick={() => setSelectedTier('full')}
//             disabled={isProcessing}
//             className={`relative rounded-2xl border-2 bg-white p-6 text-left shadow-md transition-all disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-900 ${
//               selectedTier === 'full'
//                 ? 'border-blue-500 ring-4 ring-blue-100 dark:ring-blue-500/30'
//                 : 'border-blue-400 hover:border-blue-500 dark:border-blue-600 dark:hover:border-blue-500'
//             }`}
//           >
//             <div className='absolute right-5 top-5 rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white'>
//               Recommended
//             </div>
//             <div className='mb-4 flex items-start justify-between'>
//               <div>
//                 <p className='mb-1 text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-300'>
//                   Full Access
//                 </p>
//                 <div className='text-3xl font-bold text-gray-900 dark:text-white'>
//                   ₦{PRICING.full.toLocaleString('en-NG')}
//                 </div>
//               </div>
//               <div
//                 className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${
//                   selectedTier === 'full'
//                     ? 'border-blue-600 bg-blue-600'
//                     : 'border-gray-300'
//                 }`}
//               >
//                 {selectedTier === 'full' && (
//                   <Check className='h-4 w-4 text-white' />
//                 )}
//               </div>
//             </div>
//             <ul className='space-y-2 text-sm text-gray-700 dark:text-gray-200'>
//               <li className='flex items-start gap-2'>
//                 <Check className='mt-0.5 h-4 w-4 shrink-0 text-blue-500' />
//                 <span>Everything in Virtual</span>
//               </li>
//               <li className='flex items-start gap-2'>
//                 <Check className='mt-0.5 h-4 w-4 shrink-0 text-blue-500' />
//                 <span>Infrastructure deep dive</span>
//               </li>
//               <li className='flex items-start gap-2'>
//                 <Check className='mt-0.5 h-4 w-4 shrink-0 text-blue-500' />
//                 <span>Extended Q&A session</span>
//               </li>
//               <li className='flex items-start gap-2'>
//                 <Check className='mt-0.5 h-4 w-4 shrink-0 text-blue-500' />
//                 <span>Exclusive materials and resources</span>
//               </li>
//             </ul>
//           </button>
//         </div>

//         {/* Error Message */}
//         {error && (
//           <div className='mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400'>
//             <AlertCircle className='mt-0.5 h-5 w-5 shrink-0' />
//             <div>
//               <p className='font-semibold'>Payment Error</p>
//               <p>{error}</p>
//             </div>
//           </div>
//         )}

//         {/* Navigation Buttons */}
//         <div className='flex gap-4'>
//           <button
//             type='button'
//             onClick={onBack}
//             disabled={isProcessing}
//             className='flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
//           >
//             <ArrowLeft className='h-4 w-4' />
//             Back
//           </button>
//           <button
//             type='button'
//             onClick={handlePayWithPaystack}
//             disabled={isProcessing || !paystackLoaded}
//             className='flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-blue-400'
//           >
//             {isProcessing ? (
//               <>
//                 <Loader2 className='h-4 w-4 animate-spin' />
//                 <span>Processing...</span>
//               </>
//             ) : (
//               `Pay ₦${selectedAmount.toLocaleString('en-NG')}`
//             )}
//           </button>
//         </div>
//       </div>
//     </>
//   )
// }

'use client'

import { useState } from 'react'
import {
  Check,
  ArrowLeft,
  AlertCircle,
  Loader2,
  Wifi,
  MapPin,
  ChevronDown,
} from 'lucide-react'
import Script from 'next/script'
import {
  type CompleteEnrollmentData,
  type EnrollmentSuccessData,
  type ProductType,
  PRODUCT_TYPES,
  DISPLAY_PRICES,
} from '@/lib/validations'

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

interface Step3PaymentProps {
  completeData: CompleteEnrollmentData
  onBack: () => void
  onSuccess: (result: EnrollmentSuccessData) => void
}

type AccessTier = 'virtual' | 'full'

function deriveSessionId(date: string): string {
  return `session-${date}`
}

function formatAmount(amount: number): string {
  return `₦${amount.toLocaleString('en-NG')}`
}

const PRODUCT_DESCRIPTIONS: Record<
  ProductType,
  { tagline: string; features: string[] }
> = {
  'Single Masterclass': {
    tagline: 'One focused deep-dive session',
    features: [
      'Full masterclass session',
      'Platform walkthrough',
      'Q&A access',
      'Session recording',
    ],
  },
  'Fireside Chat Series': {
    tagline: 'Intimate expert conversations',
    features: [
      'Series of chat sessions',
      'Direct expert access',
      'Community network',
      'Key takeaway notes',
    ],
  },
  'Developer Bootcamp': {
    tagline: 'Hands-on technical immersion',
    features: [
      'Full bootcamp curriculum',
      'Live coding sessions',
      'Project mentorship',
      'Certificate of completion',
    ],
  },
  '1-on-1 JaaS Consulting': {
    tagline: 'Personalised one-on-one guidance',
    features: [
      'Private consulting session',
      'Custom roadmap',
      'Follow-up Q&A slot',
      'Priority support access',
    ],
  },
}

const ACCESS_TIER_INFO: Record<
  AccessTier,
  { label: string; description: string; icon: React.ReactNode }
> = {
  virtual: {
    label: 'Virtual',
    description:
      'Join online via webinar link. Receive your access link immediately after payment.',
    icon: <Wifi className='h-5 w-5' />,
  },
  full: {
    label: 'Full — Live Attendance',
    description:
      'Attend in person at the venue. Required for live check-in on the day.',
    icon: <MapPin className='h-5 w-5' />,
  },
}

export default function Step3Payment({
  completeData,
  onBack,
  onSuccess,
}: Step3PaymentProps) {
  const [selectedProduct, setSelectedProduct] =
    useState<ProductType>('Single Masterclass')
  const [selectedTier, setSelectedTier] = useState<AccessTier>('full')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [paystackLoaded, setPaystackLoaded] = useState(false)
  const [productDropdownOpen, setProductDropdownOpen] = useState(false)

  const displayPrice = DISPLAY_PRICES[selectedProduct]

  // ─────────────────────────────────────────────────────────────────────────
  // After the Paystack popup callback fires, verify the payment with the
  // backend. We pass all the context (product, session, tier) here so the
  // backend can validate the amount and finalize the enrollment in one step.
  // ─────────────────────────────────────────────────────────────────────────
  const verifyPayment = async (paystackReference: string) => {
    setIsProcessing(true)
    setError(null)

    try {
      const verifyResponse = await fetch('/api/payment/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reference: paystackReference,
          // Pass enrollment context so backend can finalize in one call
          enrollmentReference: completeData.enrollmentReference,
          productType: selectedProduct,
          sessionId: deriveSessionId(completeData.session.date),
          sessionDate: completeData.session.date,
          sessionTime: completeData.session.time,
          accessTier: selectedTier,
        }),
      })

      const verifyData = await verifyResponse.json()

      if (!verifyResponse.ok) {
        throw new Error(
          verifyData.error ||
            'Payment verification failed. Please contact support.',
        )
      }

      onSuccess(verifyData.enrollment as EnrollmentSuccessData)
    } catch (err: any) {
      console.error('[payment] Verification error:', err)
      setError(
        err.message ||
          'Payment was received but verification failed. Please contact support with reference: ' +
            paystackReference,
      )
      setIsProcessing(false)
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Open the Paystack inline popup.
  //
  // KEY FIX: This function is NOT async. window.PaystackPop.setup() must be
  // called synchronously — calling it after an `await` causes Paystack's v1
  // inline library to fail its internal callback validation with:
  // "Attribute callback must be a valid function"
  //
  // We do all async work (verification) only INSIDE the popup callback, after
  // Paystack has already validated its options.
  // ─────────────────────────────────────────────────────────────────────────
  const handlePayWithPaystack = () => {
    if (!completeData.enrollmentReference) {
      setError(
        'Enrollment reference is missing. Please go back to step 1 and try again.',
      )
      return
    }

    const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY
    if (!publicKey) {
      setError('Payment configuration error. Please contact support.')
      return
    }

    if (!paystackLoaded || !window.PaystackPop) {
      setError(
        'Payment system is not ready. Please wait a moment and try again.',
      )
      return
    }

    setIsProcessing(true)
    setError(null)

    // ── All setup() options are defined synchronously here ──────────────────
    // No awaits above this point. This is the root cause of the Paystack error.
    try {
      const handler = window.PaystackPop.setup({
        key: publicKey,
        email: completeData.userInfo.email,
        // Amount in kobo — Paystack will charge exactly this amount.
        // Backend verify will confirm the amount matches the product price.
        amount: displayPrice * 100,
        currency: 'NGN',
        metadata: {
          enrollment_reference: completeData.enrollmentReference,
          product_type: selectedProduct,
          access_tier: selectedTier,
        },
        // Regular (non-async) callback. Async work is delegated to verifyPayment().
        callback: (response) => {
          verifyPayment(response.reference)
        },
        onClose: () => {
          setIsProcessing(false)
          setError(null)
        },
      })

      handler.openIframe()
    } catch (err: any) {
      console.error('[payment] Failed to open popup:', err)
      setError(
        'Failed to open the payment window. Please refresh the page and try again.',
      )
      setIsProcessing(false)
    }
  }

  return (
    <>
      <Script
        src='https://js.paystack.co/v1/inline.js'
        strategy='afterInteractive'
        onLoad={() => setPaystackLoaded(true)}
        onError={() =>
          setError('Failed to load payment system. Please refresh the page.')
        }
      />

      <div className='mx-auto max-w-3xl'>
        <div className='mb-8 text-center'>
          <h2 className='mb-2 text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl'>
            Choose Your Package
          </h2>
          <p className='text-gray-600 dark:text-gray-400'>
            Select a programme and your preferred access type
          </p>
        </div>

        <div className='space-y-6'>
          {/* ── Product Type ──────────────────────────────────────────────── */}
          <div className='rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-8'>
            <h3 className='mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400'>
              Programme
            </h3>

            <div className='relative mb-4'>
              <button
                type='button'
                onClick={() => setProductDropdownOpen((o) => !o)}
                disabled={isProcessing}
                className='flex w-full items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-left text-sm font-medium text-gray-900 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-800 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700'
              >
                <span>{selectedProduct}</span>
                <ChevronDown
                  className={`h-4 w-4 text-gray-400 transition-transform ${
                    productDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {productDropdownOpen && (
                <div className='absolute z-20 mt-1 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-800 dark:bg-gray-900'>
                  {PRODUCT_TYPES.map((product) => (
                    <button
                      key={product}
                      type='button'
                      onClick={() => {
                        setSelectedProduct(product)
                        setProductDropdownOpen(false)
                      }}
                      className={`flex w-full items-center justify-between px-4 py-3 text-left text-sm transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${
                        selectedProduct === product
                          ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                          : 'text-gray-900 dark:text-gray-100'
                      }`}
                    >
                      <div>
                        <span className='font-medium'>{product}</span>
                        <span className='ml-2 text-xs text-gray-500 dark:text-gray-400'>
                          {PRODUCT_DESCRIPTIONS[product].tagline}
                        </span>
                      </div>
                      <span className='ml-4 shrink-0 font-semibold text-gray-700 dark:text-gray-300'>
                        {formatAmount(DISPLAY_PRICES[product])}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className='rounded-xl bg-blue-50 p-4 dark:bg-blue-900/20'>
              <p className='mb-3 text-xs font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-300'>
                {PRODUCT_DESCRIPTIONS[selectedProduct].tagline}
              </p>
              <ul className='space-y-2'>
                {PRODUCT_DESCRIPTIONS[selectedProduct].features.map(
                  (feature) => (
                    <li
                      key={feature}
                      className='flex items-center gap-2 text-sm text-blue-800 dark:text-blue-200'
                    >
                      <Check className='h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400' />
                      <span>{feature}</span>
                    </li>
                  ),
                )}
              </ul>
            </div>
          </div>

          {/* ── Access Tier ───────────────────────────────────────────────── */}
          <div className='rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-8'>
            <h3 className='mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400'>
              Access Type
            </h3>

            <div className='grid gap-4 sm:grid-cols-2'>
              {(
                Object.entries(ACCESS_TIER_INFO) as [
                  AccessTier,
                  (typeof ACCESS_TIER_INFO)[AccessTier],
                ][]
              ).map(([tier, info]) => (
                <button
                  key={tier}
                  type='button'
                  onClick={() => setSelectedTier(tier)}
                  disabled={isProcessing}
                  className={`rounded-xl border-2 p-4 text-left transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
                    selectedTier === tier
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 bg-gray-50 hover:border-gray-300 dark:border-gray-800 dark:bg-gray-800 dark:hover:border-gray-700'
                  }`}
                >
                  <div className='mb-2 flex items-center justify-between'>
                    <div
                      className={`rounded-lg p-1.5 ${
                        selectedTier === tier
                          ? 'bg-blue-100 text-blue-600 dark:bg-blue-800 dark:text-blue-300'
                          : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                      }`}
                    >
                      {info.icon}
                    </div>
                    <div
                      className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                        selectedTier === tier
                          ? 'border-blue-600 bg-blue-600'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      {selectedTier === tier && (
                        <Check className='h-3 w-3 text-white' />
                      )}
                    </div>
                  </div>
                  <p
                    className={`mb-1 text-sm font-semibold ${
                      selectedTier === tier
                        ? 'text-blue-700 dark:text-blue-300'
                        : 'text-gray-900 dark:text-gray-100'
                    }`}
                  >
                    {info.label}
                  </p>
                  <p className='text-xs leading-relaxed text-gray-500 dark:text-gray-400'>
                    {info.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* ── Order Summary ─────────────────────────────────────────────── */}
          <div className='rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900'>
            <h3 className='mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400'>
              Order Summary
            </h3>
            <div className='space-y-2 text-sm'>
              <div className='flex justify-between text-gray-700 dark:text-gray-300'>
                <span>{selectedProduct}</span>
                <span className='font-medium'>
                  {formatAmount(displayPrice)}
                </span>
              </div>
              <div className='flex justify-between text-gray-500 dark:text-gray-400'>
                <span>Access type</span>
                <span>{ACCESS_TIER_INFO[selectedTier].label}</span>
              </div>
              <div className='mt-3 border-t border-gray-100 pt-3 dark:border-gray-800'>
                <div className='flex justify-between font-bold text-gray-900 dark:text-white'>
                  <span>Total</span>
                  <span className='text-blue-600 dark:text-blue-400'>
                    {formatAmount(displayPrice)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Error ─────────────────────────────────────────────────────── */}
          {error && (
            <div className='flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-800/50 dark:bg-red-900/20 dark:text-red-400'>
              <AlertCircle className='mt-0.5 h-5 w-5 shrink-0' />
              <div>
                <p className='font-semibold'>Payment Error</p>
                <p>{error}</p>
              </div>
            </div>
          )}

          {/* ── Actions ───────────────────────────────────────────────────── */}
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
                  <span>Processing…</span>
                </>
              ) : !paystackLoaded ? (
                <>
                  <Loader2 className='h-4 w-4 animate-spin' />
                  <span>Loading payment…</span>
                </>
              ) : (
                `Pay ${formatAmount(displayPrice)}`
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
