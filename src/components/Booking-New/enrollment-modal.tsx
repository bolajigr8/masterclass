// 'use client'

// import { useState, useEffect, useCallback } from 'react'
// import Script from 'next/script'
// import { toast } from 'sonner'
// import {
//   X,
//   Check,
//   Loader2,
//   ChevronDown,
//   Wifi,
//   Crown,
//   Shield,
//   Copy,
//   ExternalLink,
//   MapPin,
//   CalendarDays,
//   Clock,
//   CheckCircle2,
//   AlertCircle,
// } from 'lucide-react'
// import {
//   PRODUCT_TYPES,
//   DISPLAY_PRICES,
//   PRODUCT_ACCESS_TIER,
//   type ProductType,
//   type EnrollmentSuccessData,
// } from '@/lib/validations'
// import {
//   getSessionsForProduct,
//   formatSessionDates,
//   CONSULTING_SCHEDULING_LINK,
//   type SessionOption,
// } from '@/lib/session-config'

// declare global {
//   interface Window {
//     PaystackPop?: {
//       setup(options: {
//         key: string
//         email: string
//         amount: number
//         currency?: string
//         metadata?: Record<string, unknown>
//         callback: (response: { reference: string }) => void
//         onClose: () => void
//       }): { openIframe: () => void }
//     }
//   }
// }

// // ─── Plan display metadata ─────────────────────────────────────────────────────

// const PLAN_META: Record<
//   ProductType,
//   { tagline: string; features: string[]; badge?: string; badgeColor?: string }
// > = {
//   'Virtual Masterclass': {
//     tagline: '4 × 90-min Live Zoom Sessions',
//     features: [
//       '4 live 90-min Zoom sessions',
//       'Full session recordings & replays',
//       'Live Q&A with Femi Olawale',
//       'Trila University library access',
//       'Private Discord community',
//       'Certificate of Completion',
//     ],
//   },
//   'Signature Live Masterclass': {
//     tagline: '2-Day In-Person Experience',
//     features: [
//       'Full 2-day in-person masterclass',
//       'Lagos, Dubai, Singapore or London',
//       'Networking dinner & cocktails',
//       'Exclusive alumni network',
//       'JaaS deal structuring workshop',
//       '1 bonus 30-min strategy call',
//       'Certificate of Completion',
//     ],
//     badge: 'MOST POPULAR',
//     badgeColor: '#d4a422',
//   },
//   'Private JaaS Consulting': {
//     tagline: '1-on-1 Private Strategy Session',
//     features: [
//       'Private 1-on-1 Zoom with Femi',
//       'Custom project strategy review',
//       'Funding & investor introductions',
//       'Legal & compliance guidance',
//       '30-day follow-up email support',
//       'Trila University lifetime access',
//     ],
//   },
// }

// const PLAN_ICONS: Record<ProductType, React.ReactNode> = {
//   'Virtual Masterclass': <Wifi size={18} className='text-[#4a9eff]' />,
//   'Signature Live Masterclass': <Crown size={18} className='text-[#d4a422]' />,
//   'Private JaaS Consulting': <Shield size={18} className='text-[#4a9eff]' />,
// }

// // ─── Props ─────────────────────────────────────────────────────────────────────

// interface EnrollmentModalProps {
//   isOpen: boolean
//   onClose: () => void
//   /** Pre-selects a product; when provided, the selector is hidden */
//   initialProduct?: ProductType
//   /** Pre-fills form fields (from the Reserve Access form) */
//   initialFormData?: {
//     name?: string
//     email?: string
//     phone?: string
//     city?: string
//   }
//   /**
//    * When the reserve-access form has already called /api/register successfully,
//    * pass the reference here so the modal skips registration entirely.
//    */
//   initialEnrollmentReference?: string
// }

// // ─── Helper ────────────────────────────────────────────────────────────────────

// function formatNaira(amount: number): string {
//   return `₦${amount.toLocaleString('en-NG')}`
// }

// function useCopyToClipboard() {
//   const [copied, setCopied] = useState(false)
//   const copy = useCallback(async (text: string) => {
//     try {
//       await navigator.clipboard.writeText(text)
//     } catch {
//       const el = document.createElement('textarea')
//       el.value = text
//       document.body.appendChild(el)
//       el.select()
//       document.execCommand('copy')
//       document.body.removeChild(el)
//     }
//     setCopied(true)
//     setTimeout(() => setCopied(false), 2500)
//   }, [])
//   return { copied, copy }
// }

// // ─── Success Display ───────────────────────────────────────────────────────────

// function SuccessDisplay({
//   data,
//   userEmail,
//   onClose,
// }: {
//   data: EnrollmentSuccessData
//   userEmail: string
//   onClose: () => void
// }) {
//   const { copy: copyRef, copied: refCopied } = useCopyToClipboard()
//   const accessTier =
//     PRODUCT_ACCESS_TIER[data.productType as ProductType] ?? data.accessTier
//   const session = data.selectedSession

//   const isVirtual = accessTier === 'virtual'
//   const isLive = accessTier === 'full'
//   const isConsulting = accessTier === 'consulting'

//   return (
//     <div className='flex flex-col items-center px-6 py-8 sm:px-10 text-center'>
//       {/* Icon */}
//       <div className='mb-6 rounded-full bg-green-500/10 p-5'>
//         <CheckCircle2 size={52} className='text-green-400' />
//       </div>

//       {/* Title */}
//       <div className='mb-2 flex items-center gap-2 text-[11px] font-bold tracking-[0.15em] uppercase text-[#4a9eff]'>
//         {PLAN_ICONS[data.productType as ProductType]}
//         <span>
//           {isVirtual && 'Virtual Access Confirmed'}
//           {isLive && 'Live Attendance Confirmed'}
//           {isConsulting && 'Consulting Session Confirmed'}
//         </span>
//       </div>
//       <h3 className='mb-2 text-2xl font-extrabold text-white'>
//         {isVirtual && "You're all set!"}
//         {isLive && 'Your seat is secured!'}
//         {isConsulting && 'Your slot is locked in!'}
//       </h3>
//       <p className='mb-8 text-[14px] text-white/50 max-w-sm'>
//         Payment confirmed for{' '}
//         <span className='text-white/80 font-medium'>{data.productType}</span>. A
//         confirmation email has been sent to{' '}
//         <span className='text-white/80'>{userEmail}</span>.
//       </p>

//       {/* ── Enrollment Reference ─────────────────────────────────────────── */}
//       <div
//         className={`w-full max-w-md mb-6 rounded-xl border p-4 ${
//           isLive
//             ? 'border-[#d4a422]/40 bg-[#1a1500]'
//             : 'border-white/10 bg-white/5'
//         }`}
//       >
//         {isLive && (
//           <p className='mb-2 text-[11px] font-bold tracking-[0.12em] uppercase text-[#d4a422]'>
//             ⚠️ Save This — Required for Day 1 & Day 2 Check-In
//           </p>
//         )}
//         <div className='flex items-center justify-between gap-3 rounded-lg bg-[#080f1a] px-4 py-3'>
//           <code className='text-sm font-bold tracking-wider text-white break-all'>
//             {data.enrollmentReference}
//           </code>
//           <button
//             onClick={() => copyRef(data.enrollmentReference)}
//             className={`shrink-0 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
//               refCopied
//                 ? 'bg-green-500/20 text-green-400'
//                 : 'bg-white/10 text-white/60 hover:bg-white/15 hover:text-white'
//             }`}
//           >
//             {refCopied ? <Check size={12} /> : <Copy size={12} />}
//             {refCopied ? 'Copied!' : 'Copy'}
//           </button>
//         </div>
//         {!isLive && (
//           <p className='mt-2 text-[11px] text-white/30'>
//             Keep this reference — it identifies your enrollment.
//           </p>
//         )}
//       </div>

//       {/* ── Session details ──────────────────────────────────────────────── */}
//       {session && (
//         <div className='w-full max-w-md mb-6 rounded-xl border border-white/8 bg-white/5 p-4 text-left'>
//           <p className='mb-3 text-[11px] font-bold tracking-[0.12em] uppercase text-white/30'>
//             Session Details
//           </p>
//           <div className='space-y-2 text-sm'>
//             {session.dates && session.dates.length > 0 && (
//               <div className='flex items-start gap-3'>
//                 <CalendarDays
//                   size={15}
//                   className='mt-0.5 shrink-0 text-[#4a9eff]'
//                 />
//                 <span className='text-white/70'>
//                   {isVirtual && session.dates.length > 1
//                     ? `${session.dates.length} sessions starting ${new Date(session.dates[0]).toLocaleDateString('en-NG', { month: 'long', day: 'numeric', year: 'numeric' })}`
//                     : formatSessionDates(session.dates, session.isTwoDay)}
//                 </span>
//               </div>
//             )}
//             {session.time && (
//               <div className='flex items-center gap-3'>
//                 <Clock size={15} className='shrink-0 text-[#4a9eff]' />
//                 <span className='text-white/70'>
//                   {session.time} {session.city?.includes('Online') ? 'WAT' : ''}
//                 </span>
//               </div>
//             )}
//             {session.venue && (
//               <div className='flex items-start gap-3'>
//                 <MapPin size={15} className='mt-0.5 shrink-0 text-[#4a9eff]' />
//                 <span className='text-white/70'>
//                   {session.venue}, {session.city}
//                 </span>
//               </div>
//             )}
//             {isVirtual && !session.venue && (
//               <div className='flex items-center gap-3'>
//                 <MapPin size={15} className='shrink-0 text-[#4a9eff]' />
//                 <span className='text-white/70'>Online (Zoom)</span>
//               </div>
//             )}
//           </div>
//         </div>
//       )}

//       {/* ── Virtual: Webinar link ────────────────────────────────────────── */}
//       {isVirtual && (
//         <div className='w-full max-w-md mb-6 rounded-xl border border-[#2563eb]/30 bg-[#0a1525] p-4'>
//           <p className='mb-3 text-[11px] font-bold tracking-[0.12em] uppercase text-[#4a9eff]'>
//             🔗 Your Webinar Link
//           </p>
//           <a
//             href={
//               process.env.NEXT_PUBLIC_WEBINAR_LINK ?? 'https://trila.co/webinar'
//             }
//             target='_blank'
//             rel='noopener noreferrer'
//             className='flex items-center justify-center gap-2 rounded-lg bg-[#2563eb] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1d4ed8]'
//           >
//             <ExternalLink size={14} />
//             Join Webinar
//           </a>
//           <p className='mt-2 text-[11px] text-white/30 text-center'>
//             Link becomes active at session time. Do not share it.
//           </p>
//         </div>
//       )}

//       {/* ── Consulting: Scheduling link ──────────────────────────────────── */}
//       {isConsulting && (
//         <div className='w-full max-w-md mb-6 rounded-xl border border-[#2563eb]/30 bg-[#0a1525] p-4'>
//           <p className='mb-3 text-[11px] font-bold tracking-[0.12em] uppercase text-[#4a9eff]'>
//             📅 Book Your Session Time
//           </p>
//           <p className='mb-3 text-sm text-white/50'>
//             Choose a date and time that works for you.
//           </p>
//           <a
//             href={CONSULTING_SCHEDULING_LINK}
//             target='_blank'
//             rel='noopener noreferrer'
//             className='flex items-center justify-center gap-2 rounded-lg bg-[#2563eb] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1d4ed8]'
//           >
//             <ExternalLink size={14} />
//             Schedule My Session →
//           </a>
//         </div>
//       )}

//       {/* ── Signature: Check-in note ─────────────────────────────────────── */}
//       {isLive && (
//         <div className='w-full max-w-md mb-6 rounded-xl border border-white/8 bg-white/5 p-4 text-left'>
//           <p className='mb-3 text-[11px] font-bold tracking-[0.12em] uppercase text-white/30'>
//             📍 Check-In Instructions (Both Days)
//           </p>
//           <ol className='space-y-2 text-sm text-white/60 list-decimal list-inside'>
//             <li>Arrive at least 30 min before start time.</li>
//             <li>Scan the QR code at the venue entrance.</li>
//             <li>Enter your email + enrollment reference above.</li>
//             <li>
//               See{' '}
//               <span className='text-green-400 font-medium'>Access Granted</span>{' '}
//               — you're in.
//             </li>
//             <li className='text-[#d4a422]'>
//               Repeat on Day 2 with the same reference.
//             </li>
//           </ol>
//         </div>
//       )}

//       <button
//         onClick={onClose}
//         className='rounded-xl border border-white/15 bg-white/8 px-8 py-3 text-sm font-semibold text-white/70 transition-colors hover:bg-white/12 hover:text-white'
//       >
//         Close
//       </button>
//     </div>
//   )
// }

// // ─── Main Modal ────────────────────────────────────────────────────────────────

// export default function EnrollmentModal({
//   isOpen,
//   onClose,
//   initialProduct,
//   initialFormData,
//   initialEnrollmentReference,
// }: EnrollmentModalProps) {
//   const productLocked = Boolean(initialProduct)
//   const defaultProduct: ProductType = initialProduct ?? 'Virtual Masterclass'

//   const [selectedProduct, setSelectedProduct] =
//     useState<ProductType>(defaultProduct)
//   const [productDropdownOpen, setProductDropdownOpen] = useState(false)

//   const [formData, setFormData] = useState({
//     name: initialFormData?.name ?? '',
//     email: initialFormData?.email ?? '',
//     phone: initialFormData?.phone ?? '',
//     city: initialFormData?.city ?? '',
//   })
//   const [selectedSessionId, setSelectedSessionId] = useState('')
//   const [errors, setErrors] = useState<Record<string, string>>({})
//   const [apiError, setApiError] = useState<string | null>(null)
//   const [isProcessing, setIsProcessing] = useState(false)
//   const [paystackLoaded, setPaystackLoaded] = useState(false)
//   // Initialise from prop when reserve-access already registered the user
//   const [enrollmentRef, setEnrollmentRef] = useState<string | null>(
//     initialEnrollmentReference ?? null,
//   )
//   const [successData, setSuccessData] = useState<EnrollmentSuccessData | null>(
//     null,
//   )

//   const sessions: SessionOption[] = getSessionsForProduct(selectedProduct)
//   const selectedSession = sessions.find(
//     (s) => s.sessionId === selectedSessionId,
//   )
//   const displayPrice = DISPLAY_PRICES[selectedProduct]
//   const meta = PLAN_META[selectedProduct]

//   // ── Reset when modal opens ────────────────────────────────────────────────
//   useEffect(() => {
//     if (isOpen) {
//       setSelectedProduct(initialProduct ?? 'Virtual Masterclass')
//       setFormData({
//         name: initialFormData?.name ?? '',
//         email: initialFormData?.email ?? '',
//         phone: initialFormData?.phone ?? '',
//         city: initialFormData?.city ?? '',
//       })
//       setSelectedSessionId('')
//       setErrors({})
//       setApiError(null)
//       setIsProcessing(false)
//       // Use the pre-registered reference if provided, otherwise clear
//       setEnrollmentRef(initialEnrollmentReference ?? null)
//       setSuccessData(null)
//     }
//   }, [isOpen, initialProduct, initialFormData, initialEnrollmentReference])

//   // ── Body scroll lock ──────────────────────────────────────────────────────
//   useEffect(() => {
//     document.body.style.overflow = isOpen ? 'hidden' : ''
//     return () => {
//       document.body.style.overflow = ''
//     }
//   }, [isOpen])

//   // ── Reset session when product changes ────────────────────────────────────
//   useEffect(() => {
//     setSelectedSessionId('')
//   }, [selectedProduct])

//   // ── Field change ──────────────────────────────────────────────────────────
//   const handleFieldChange = (field: string, value: string) => {
//     setFormData((prev) => ({ ...prev, [field]: value }))
//     if (errors[field])
//       setErrors((prev) => {
//         const n = { ...prev }
//         delete n[field]
//         return n
//       })
//     if (apiError) setApiError(null)
//   }

//   // ── Validation ────────────────────────────────────────────────────────────
//   const validate = (): boolean => {
//     const newErrors: Record<string, string> = {}
//     if (!formData.name.trim() || formData.name.trim().length < 2)
//       newErrors.name = 'Name must be at least 2 characters'
//     if (
//       !formData.email.trim() ||
//       !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
//     )
//       newErrors.email = 'Please enter a valid email address'
//     const cleanPhone = formData.phone.replace(/\s+/g, '')
//     if (!cleanPhone || cleanPhone.length < 10)
//       newErrors.phone = 'Phone number must be at least 10 digits'
//     if (!selectedSessionId) newErrors.session = 'Please select a session'
//     setErrors(newErrors)
//     return Object.keys(newErrors).length === 0
//   }

//   // ── Verify payment ────────────────────────────────────────────────────────
//   const verifyPayment = async (paystackReference: string, ref: string) => {
//     try {
//       if (!selectedSession) throw new Error('Session not found.')

//       const verifyRes = await fetch('/api/payment/verify', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           reference: paystackReference,
//           enrollmentReference: ref,
//           productType: selectedProduct,
//           sessionId: selectedSession.sessionId,
//           sessionDates: selectedSession.dates,
//           sessionTime: selectedSession.time,
//           sessionVenue: selectedSession.venue ?? null,
//           sessionCity: selectedSession.city ?? null,
//           isTwoDay: selectedSession.isTwoDay ?? false,
//         }),
//       })

//       const data = await verifyRes.json()
//       if (!verifyRes.ok)
//         throw new Error(data.error || 'Payment verification failed.')

//       setSuccessData(data.enrollment as EnrollmentSuccessData)
//     } catch (err: any) {
//       toast.error('Payment verification failed', {
//         description:
//           err.message || 'Please contact support with your payment reference.',
//         duration: 8000,
//       })
//     } finally {
//       setIsProcessing(false)
//     }
//   }

//   // ── Submit → register (if needed) → Paystack popup ───────────────────────
//   const handleSubmit = async () => {
//     if (!validate()) return
//     if (!paystackLoaded || !window.PaystackPop) {
//       toast.error('Payment system not ready', {
//         description: 'Please wait a moment and try again.',
//       })
//       return
//     }

//     const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY
//     if (!publicKey) {
//       toast.error('Payment configuration error', {
//         description: 'Please contact support.',
//       })
//       return
//     }

//     setIsProcessing(true)
//     setApiError(null)

//     // Step 1: Register (skip if already done via reserve-access form)
//     let ref = enrollmentRef
//     if (!ref) {
//       try {
//         const regRes = await fetch('/api/register', {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({
//             name: formData.name.trim(),
//             email: formData.email.trim().toLowerCase(),
//             phone: formData.phone.replace(/\s+/g, ''),
//             city: formData.city.trim() || undefined,
//           }),
//         })
//         const regData = await regRes.json()
//         if (!regRes.ok) {
//           const isDuplicate = regRes.status === 409
//           toast.error(
//             isDuplicate ? 'Email already registered' : 'Registration failed',
//             {
//               description: isDuplicate
//                 ? 'This email is already enrolled. Contact support if you need help.'
//                 : regData.error || 'Please try again.',
//               duration: 6000,
//             },
//           )
//           setIsProcessing(false)
//           return
//         }
//         ref = regData.enrollmentReference
//         setEnrollmentRef(ref!)
//       } catch (err: any) {
//         toast.error('Registration failed', {
//           description: 'Please check your connection and try again.',
//         })
//         setIsProcessing(false)
//         return
//       }
//     }

//     // Step 2: Open Paystack synchronously (no awaits between here and setup())
//     try {
//       const handler = window.PaystackPop.setup({
//         key: publicKey,
//         email: formData.email.trim().toLowerCase(),
//         amount: displayPrice * 100,
//         currency: 'NGN',
//         metadata: {
//           enrollment_reference: ref,
//           product_type: selectedProduct,
//           name: formData.name.trim(),
//         },
//         callback: (response) => {
//           verifyPayment(response.reference, ref!)
//         },
//         onClose: () => {
//           setIsProcessing(false)
//         },
//       })
//       handler.openIframe()
//     } catch (err: any) {
//       toast.error('Failed to open payment window', {
//         description: 'Please refresh the page and try again.',
//       })
//       setIsProcessing(false)
//     }
//   }

//   if (!isOpen) return null

//   const inputClass = (field: string) =>
//     `w-full rounded-xl border ${
//       errors[field] ? 'border-red-500/60' : 'border-white/10'
//     } bg-[#0d1a35] px-4 py-3 text-[13.5px] text-white placeholder:text-white/25
//      focus:border-[#2563eb]/60 focus:outline-none focus:ring-1 focus:ring-[#2563eb]/40
//      hover:border-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`

//   return (
//     <>
//       <Script
//         src='https://js.paystack.co/v1/inline.js'
//         strategy='afterInteractive'
//         onLoad={() => setPaystackLoaded(true)}
//         onError={() =>
//           setApiError('Failed to load payment system. Please refresh.')
//         }
//       />

//       {/* Backdrop */}
//       <div
//         className='fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6'
//         onClick={(e) => {
//           if (e.target === e.currentTarget) onClose()
//         }}
//       >
//         <div className='absolute inset-0 bg-[#020509]/80 backdrop-blur-md' />

//         {/* Modal */}
//         <div className='relative z-10 w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-2xl border border-white/10 bg-[#0b1628] shadow-[0_25px_80px_rgba(0,0,0,0.8)]'>
//           {/* Close */}
//           <button
//             onClick={onClose}
//             className='absolute right-4 top-4 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/40 transition-colors hover:bg-white/10 hover:text-white'
//           >
//             <X size={15} />
//           </button>

//           {successData ? (
//             // ── Success View ───────────────────────────────────────────────
//             <SuccessDisplay
//               data={successData}
//               userEmail={formData.email}
//               onClose={onClose}
//             />
//           ) : (
//             // ── Form View ──────────────────────────────────────────────────
//             <div className='grid grid-cols-1 lg:grid-cols-[320px_1fr]'>
//               {/* Left: Plan info */}
//               <div className='relative border-b border-white/8 bg-[#070f1e] p-7 lg:border-b-0 lg:border-r lg:p-8'>
//                 {meta.badge && (
//                   <div
//                     className='mb-4 inline-block rounded-full px-3 py-1 text-[10px] font-black tracking-[0.12em]'
//                     style={{
//                       background: meta.badgeColor + '22',
//                       color: meta.badgeColor,
//                       border: `1px solid ${meta.badgeColor}44`,
//                     }}
//                   >
//                     {meta.badge}
//                   </div>
//                 )}

//                 {/* Product selector or fixed label */}
//                 {productLocked ? (
//                   <div className='mb-1 flex items-center gap-2'>
//                     <span>{PLAN_ICONS[selectedProduct]}</span>
//                     <h3 className='text-[17px] font-extrabold text-white'>
//                       {selectedProduct}
//                     </h3>
//                   </div>
//                 ) : (
//                   <div className='relative mb-2'>
//                     <button
//                       type='button'
//                       onClick={() => setProductDropdownOpen((o) => !o)}
//                       disabled={isProcessing}
//                       className='flex w-full items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-left text-[14px] font-bold text-white hover:bg-white/8 transition-colors disabled:opacity-50'
//                     >
//                       <span className='flex items-center gap-2'>
//                         {PLAN_ICONS[selectedProduct]}
//                         {selectedProduct}
//                       </span>
//                       <ChevronDown
//                         size={14}
//                         className={`text-white/40 transition-transform ${productDropdownOpen ? 'rotate-180' : ''}`}
//                       />
//                     </button>
//                     {productDropdownOpen && (
//                       <div className='absolute z-30 mt-1 w-full overflow-hidden rounded-xl border border-white/10 bg-[#0d1a2e] shadow-xl'>
//                         {PRODUCT_TYPES.map((p) => (
//                           <button
//                             key={p}
//                             type='button'
//                             onClick={() => {
//                               setSelectedProduct(p)
//                               setProductDropdownOpen(false)
//                             }}
//                             className={`flex w-full items-center gap-2 px-4 py-3 text-left text-[13px] transition-colors hover:bg-white/5 ${
//                               selectedProduct === p
//                                 ? 'text-[#4a9eff]'
//                                 : 'text-white/70'
//                             }`}
//                           >
//                             {PLAN_ICONS[p]}
//                             {p}
//                           </button>
//                         ))}
//                       </div>
//                     )}
//                   </div>
//                 )}

//                 <p className='mb-5 text-[12px] text-white/40'>{meta.tagline}</p>

//                 {/* Price */}
//                 <div className='mb-5 rounded-xl bg-white/5 px-5 py-4'>
//                   <p className='mb-0.5 text-[11px] font-bold tracking-[0.12em] uppercase text-white/30'>
//                     Investment
//                   </p>
//                   <p className='text-3xl font-extrabold text-white'>
//                     {formatNaira(displayPrice)}
//                   </p>
//                   <p className='text-[12px] text-white/30'>
//                     {selectedProduct === 'Virtual Masterclass' && '≈ $260 USD'}
//                     {selectedProduct === 'Signature Live Masterclass' &&
//                       '≈ $650 USD'}
//                     {selectedProduct === 'Private JaaS Consulting' &&
//                       '≈ $500+ USD'}
//                   </p>
//                 </div>

//                 {/* Features */}
//                 <ul className='space-y-2.5'>
//                   {meta.features.map((f) => (
//                     <li key={f} className='flex items-start gap-2.5'>
//                       <Check
//                         size={14}
//                         className='mt-0.5 shrink-0 text-[#2563eb]'
//                       />
//                       <span className='text-[13px] text-white/55 leading-snug'>
//                         {f}
//                       </span>
//                     </li>
//                   ))}
//                 </ul>

//                 {/* Guarantee */}
//                 <div className='mt-6 flex items-center gap-2 text-[11px] text-white/25'>
//                   <Shield size={12} />
//                   <span>30-day money-back guarantee</span>
//                 </div>
//               </div>

//               {/* Right: Form */}
//               <div className='p-7 lg:p-8'>
//                 <h3 className='mb-1 text-[18px] font-extrabold text-white'>
//                   Reserve Your Spot
//                 </h3>
//                 <p className='mb-6 text-[13px] text-white/40'>
//                   Complete your details and proceed to secure payment.
//                 </p>

//                 <div className='space-y-4'>
//                   {/* Name + Email */}
//                   <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
//                     <div>
//                       <label className='mb-1.5 block text-[12px] font-semibold text-white/40 uppercase tracking-wide'>
//                         Full Name *
//                       </label>
//                       <input
//                         type='text'
//                         placeholder='John Doe'
//                         value={formData.name}
//                         onChange={(e) =>
//                           handleFieldChange('name', e.target.value)
//                         }
//                         disabled={isProcessing}
//                         className={inputClass('name')}
//                       />
//                       {errors.name && (
//                         <p className='mt-1 flex items-center gap-1 text-[11px] text-red-400'>
//                           <AlertCircle size={11} />
//                           {errors.name}
//                         </p>
//                       )}
//                     </div>
//                     <div>
//                       <label className='mb-1.5 block text-[12px] font-semibold text-white/40 uppercase tracking-wide'>
//                         Email Address *
//                       </label>
//                       <input
//                         type='email'
//                         placeholder='john@example.com'
//                         value={formData.email}
//                         onChange={(e) =>
//                           handleFieldChange('email', e.target.value)
//                         }
//                         disabled={isProcessing}
//                         className={inputClass('email')}
//                       />
//                       {errors.email && (
//                         <p className='mt-1 flex items-center gap-1 text-[11px] text-red-400'>
//                           <AlertCircle size={11} />
//                           {errors.email}
//                         </p>
//                       )}
//                     </div>
//                   </div>

//                   {/* Phone + City */}
//                   <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
//                     <div>
//                       <label className='mb-1.5 block text-[12px] font-semibold text-white/40 uppercase tracking-wide'>
//                         Phone / WhatsApp *
//                       </label>
//                       <input
//                         type='tel'
//                         placeholder='+234 800 000 0000'
//                         value={formData.phone}
//                         onChange={(e) =>
//                           handleFieldChange('phone', e.target.value)
//                         }
//                         disabled={isProcessing}
//                         className={inputClass('phone')}
//                       />
//                       {errors.phone && (
//                         <p className='mt-1 flex items-center gap-1 text-[11px] text-red-400'>
//                           <AlertCircle size={11} />
//                           {errors.phone}
//                         </p>
//                       )}
//                     </div>
//                     <div>
//                       <label className='mb-1.5 block text-[12px] font-semibold text-white/40 uppercase tracking-wide'>
//                         City of Interest
//                       </label>
//                       <input
//                         type='text'
//                         placeholder='Lagos, Dubai…'
//                         value={formData.city}
//                         onChange={(e) =>
//                           handleFieldChange('city', e.target.value)
//                         }
//                         disabled={isProcessing}
//                         className={inputClass('city')}
//                       />
//                     </div>
//                   </div>

//                   {/* Session Selector */}
//                   <div>
//                     <label className='mb-1.5 block text-[12px] font-semibold text-white/40 uppercase tracking-wide'>
//                       Select Session *
//                     </label>
//                     {sessions.length === 0 ? (
//                       <p className='text-[13px] text-white/30'>
//                         No sessions available for this programme.
//                       </p>
//                     ) : (
//                       <div className='grid gap-2'>
//                         {sessions.map((session) => {
//                           const isSelected =
//                             selectedSessionId === session.sessionId
//                           return (
//                             <button
//                               key={session.sessionId}
//                               type='button'
//                               onClick={() => {
//                                 setSelectedSessionId(session.sessionId)
//                                 if (errors.session)
//                                   setErrors((p) => {
//                                     const n = { ...p }
//                                     delete n.session
//                                     return n
//                                   })
//                               }}
//                               disabled={isProcessing}
//                               className={`flex items-start justify-between gap-3 rounded-xl border px-4 py-3 text-left transition-all disabled:opacity-50 ${
//                                 isSelected
//                                   ? 'border-[#2563eb]/60 bg-[#2563eb]/10'
//                                   : 'border-white/8 bg-white/3 hover:border-white/15 hover:bg-white/5'
//                               }`}
//                             >
//                               <div className='min-w-0'>
//                                 <p
//                                   className={`text-[13px] font-semibold ${isSelected ? 'text-white' : 'text-white/70'}`}
//                                 >
//                                   {session.label}
//                                 </p>
//                                 <p className='text-[11px] text-white/35 mt-0.5 truncate'>
//                                   {session.isTwoDay
//                                     ? `${session.city} · ${session.displayTime} · 2-Day Event`
//                                     : `${session.city} · ${session.displayTime}`}
//                                   {session.venue ? ` · ${session.venue}` : ''}
//                                 </p>
//                                 {session.spotsLeft !== undefined &&
//                                   session.spotsLeft <= 15 && (
//                                     <p className='mt-1 text-[10px] font-bold text-red-400'>
//                                       Only {session.spotsLeft} spots left
//                                     </p>
//                                   )}
//                               </div>
//                               <div
//                                 className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
//                                   isSelected
//                                     ? 'border-[#2563eb] bg-[#2563eb]'
//                                     : 'border-white/20'
//                                 }`}
//                               >
//                                 {isSelected && (
//                                   <Check size={11} className='text-white' />
//                                 )}
//                               </div>
//                             </button>
//                           )
//                         })}
//                       </div>
//                     )}
//                     {errors.session && (
//                       <p className='mt-1.5 flex items-center gap-1 text-[11px] text-red-400'>
//                         <AlertCircle size={11} />
//                         {errors.session}
//                       </p>
//                     )}
//                   </div>

//                   {/* Selected session summary */}
//                   {selectedSession && (
//                     <div className='rounded-xl border border-[#2563eb]/20 bg-[#2563eb]/5 px-4 py-3 text-[13px] text-white/60'>
//                       {selectedSession.isTwoDay ? (
//                         <span>
//                           <span className='text-white font-medium'>
//                             {formatSessionDates(selectedSession.dates, true)}
//                           </span>
//                           {' · '}
//                           {selectedSession.venue}, {selectedSession.city}
//                           <span className='ml-2 text-[11px] text-[#d4a422] font-bold'>
//                             2-DAY — check-in required both days
//                           </span>
//                         </span>
//                       ) : (
//                         <span>
//                           Starting{' '}
//                           <span className='text-white font-medium'>
//                             {new Date(
//                               selectedSession.dates[0],
//                             ).toLocaleDateString('en-NG', {
//                               month: 'long',
//                               day: 'numeric',
//                               year: 'numeric',
//                             })}
//                           </span>
//                           {' · '}
//                           {selectedSession.displayTime}
//                         </span>
//                       )}
//                     </div>
//                   )}

//                   {/* Submit */}
//                   <button
//                     type='button'
//                     onClick={handleSubmit}
//                     disabled={isProcessing || !paystackLoaded}
//                     className='group flex w-full items-center justify-center gap-2.5 rounded-xl bg-[#2563eb] px-6 py-4 text-[15px] font-bold text-white shadow-[0_0_0_0_rgba(37,99,235,0)] transition-all duration-300 hover:bg-[#1d4ed8] hover:shadow-[0_0_28px_rgba(37,99,235,0.45)] active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-[#2563eb]/40 disabled:shadow-none'
//                   >
//                     {isProcessing ? (
//                       <>
//                         <Loader2 size={16} className='animate-spin' />
//                         Processing…
//                       </>
//                     ) : !paystackLoaded ? (
//                       <>
//                         <Loader2 size={16} className='animate-spin' />
//                         Loading payment…
//                       </>
//                     ) : (
//                       `Proceed to Payment · ${formatNaira(displayPrice)}`
//                     )}
//                   </button>

//                   <p className='text-center text-[11px] text-white/20'>
//                     Secured by Paystack · 256-bit SSL encryption
//                   </p>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </>
//   )
// }

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

import { useState, useEffect, useCallback } from 'react'
import Script from 'next/script'
import { toast } from 'sonner'
import {
  X,
  Check,
  Loader2,
  ChevronDown,
  Wifi,
  Crown,
  Shield,
  Copy,
  ExternalLink,
  MapPin,
  CalendarDays,
  Clock,
  CheckCircle2,
  AlertCircle,
  Users,
  ClockIcon,
  AlertTriangle,
} from 'lucide-react'
import {
  PRODUCT_TYPES,
  DISPLAY_PRICES,
  PRODUCT_ACCESS_TIER,
  type ProductType,
  type EnrollmentSuccessData,
} from '@/lib/validations'
import {
  formatSessionDates,
  CONSULTING_SCHEDULING_LINK,
} from '@/lib/session-config'

// ─── Types ─────────────────────────────────────────────────────────────────────

/** Session as returned by /api/sessions — includes live capacity fields */
interface SessionWithCapacity {
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

type ModalView = 'form' | 'waitlist-form' | 'waitlist-success'

// ─── Plan display metadata ──────────────────────────────────────────────────────

const PLAN_META: Record<
  ProductType,
  { tagline: string; features: string[]; badge?: string; badgeColor?: string }
> = {
  'Virtual Masterclass': {
    tagline: '4 × 90-min Live Zoom Sessions',
    features: [
      '4 live 90-min Zoom sessions',
      'Full session recordings & replays',
      'Live Q&A with Femi Olawale',
      'Trila University library access',
      'Private Discord community',
      'Certificate of Completion',
    ],
  },
  'Signature Live Masterclass': {
    tagline: '2-Day In-Person Experience',
    features: [
      'Full 2-day in-person masterclass',
      'Lagos, Dubai, Singapore or London',
      'Networking dinner & cocktails',
      'Exclusive alumni network',
      'JaaS deal structuring workshop',
      '1 bonus 30-min strategy call',
      'Certificate of Completion',
    ],
    badge: 'MOST POPULAR',
    badgeColor: '#d4a422',
  },
  'Private JaaS Consulting': {
    tagline: '1-on-1 Private Strategy Session',
    features: [
      'Private 1-on-1 Zoom with Femi',
      'Custom project strategy review',
      'Funding & investor introductions',
      'Legal & compliance guidance',
      '30-day follow-up email support',
      'Trila University lifetime access',
    ],
  },
}

const PLAN_ICONS: Record<ProductType, React.ReactNode> = {
  'Virtual Masterclass': <Wifi size={18} className='text-[#4a9eff]' />,
  'Signature Live Masterclass': <Crown size={18} className='text-[#d4a422]' />,
  'Private JaaS Consulting': <Shield size={18} className='text-[#4a9eff]' />,
}

// ─── Props ─────────────────────────────────────────────────────────────────────

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
  /**
   * When the reserve-access form has already called /api/register successfully,
   * pass the reference here so the modal skips registration entirely.
   */
  initialEnrollmentReference?: string
  /**
   * When set, the modal opens directly into the waitlist-confirmation flow.
   * The /waitlist/confirm page passes this after validating the token.
   */
  waitlistToken?: string
  /**
   * Pre-selects a specific session (used by waitlist confirm flow).
   */
  initialSessionId?: string
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatNaira(amount: number): string {
  return `₦${amount.toLocaleString('en-NG')}`
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

// ─── Success Display ───────────────────────────────────────────────────────────

function SuccessDisplay({
  data,
  userEmail,
  onClose,
}: {
  data: EnrollmentSuccessData
  userEmail: string
  onClose: () => void
}) {
  const { copy: copyRef, copied: refCopied } = useCopyToClipboard()
  const accessTier =
    PRODUCT_ACCESS_TIER[data.productType as ProductType] ?? data.accessTier
  const session = data.selectedSession
  const isVirtual = accessTier === 'virtual'
  const isLive = accessTier === 'full'
  const isConsulting = accessTier === 'consulting'

  return (
    <div className='flex flex-col items-center px-6 py-8 sm:px-10 text-center'>
      <div className='mb-6 rounded-full bg-green-500/10 p-5'>
        <CheckCircle2 size={52} className='text-green-400' />
      </div>
      <div className='mb-2 flex items-center gap-2 text-[11px] font-bold tracking-[0.15em] uppercase text-[#4a9eff]'>
        {PLAN_ICONS[data.productType as ProductType]}
        <span>
          {isVirtual && 'Virtual Access Confirmed'}
          {isLive && 'Live Attendance Confirmed'}
          {isConsulting && 'Consulting Session Confirmed'}
        </span>
      </div>
      <h3 className='mb-2 text-2xl font-extrabold text-white'>
        {isVirtual && "You're all set!"}
        {isLive && 'Your seat is secured!'}
        {isConsulting && 'Your slot is locked in!'}
      </h3>
      <p className='mb-8 text-[14px] text-white/50 max-w-sm'>
        Payment confirmed for{' '}
        <span className='text-white/80 font-medium'>{data.productType}</span>. A
        confirmation email has been sent to{' '}
        <span className='text-white/80'>{userEmail}</span>.
      </p>

      {/* Enrollment Reference */}
      <div
        className={`w-full max-w-md mb-6 rounded-xl border p-4 ${isLive ? 'border-[#d4a422]/40 bg-[#1a1500]' : 'border-white/10 bg-white/5'}`}
      >
        {isLive && (
          <p className='mb-2 text-[11px] font-bold tracking-[0.12em] uppercase text-[#d4a422]'>
            ⚠️ Save This — Required for Day 1 & Day 2 Check-In
          </p>
        )}
        <div className='flex items-center justify-between gap-3 rounded-lg bg-[#080f1a] px-4 py-3'>
          <code className='text-sm font-bold tracking-wider text-white break-all'>
            {data.enrollmentReference}
          </code>
          <button
            onClick={() => copyRef(data.enrollmentReference)}
            className={`shrink-0 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              refCopied
                ? 'bg-green-500/20 text-green-400'
                : 'bg-white/10 text-white/60 hover:bg-white/15 hover:text-white'
            }`}
          >
            {refCopied ? <Check size={12} /> : <Copy size={12} />}
            {refCopied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        {!isLive && (
          <p className='mt-2 text-[11px] text-white/30'>
            Keep this reference — it identifies your enrollment.
          </p>
        )}
      </div>

      {/* Session details */}
      {session && (
        <div className='w-full max-w-md mb-6 rounded-xl border border-white/8 bg-white/5 p-4 text-left'>
          <p className='mb-3 text-[11px] font-bold tracking-[0.12em] uppercase text-white/30'>
            Session Details
          </p>
          <div className='space-y-2 text-sm'>
            {session.dates && session.dates.length > 0 && (
              <div className='flex items-start gap-3'>
                <CalendarDays
                  size={15}
                  className='mt-0.5 shrink-0 text-[#4a9eff]'
                />
                <span className='text-white/70'>
                  {isVirtual && session.dates.length > 1
                    ? `${session.dates.length} sessions starting ${new Date(session.dates[0]).toLocaleDateString('en-NG', { month: 'long', day: 'numeric', year: 'numeric' })}`
                    : formatSessionDates(session.dates, session.isTwoDay)}
                </span>
              </div>
            )}
            {session.time && (
              <div className='flex items-center gap-3'>
                <Clock size={15} className='shrink-0 text-[#4a9eff]' />
                <span className='text-white/70'>
                  {session.time}
                  {session.city?.includes('Online') ? ' WAT' : ''}
                </span>
              </div>
            )}
            {session.venue && (
              <div className='flex items-start gap-3'>
                <MapPin size={15} className='mt-0.5 shrink-0 text-[#4a9eff]' />
                <span className='text-white/70'>
                  {session.venue}, {session.city}
                </span>
              </div>
            )}
            {isVirtual && !session.venue && (
              <div className='flex items-center gap-3'>
                <MapPin size={15} className='shrink-0 text-[#4a9eff]' />
                <span className='text-white/70'>Online (Zoom)</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Virtual: Webinar link */}
      {isVirtual && (
        <div className='w-full max-w-md mb-6 rounded-xl border border-[#2563eb]/30 bg-[#0a1525] p-4'>
          <p className='mb-3 text-[11px] font-bold tracking-[0.12em] uppercase text-[#4a9eff]'>
            🔗 Your Webinar Link
          </p>
          <a
            href={
              process.env.NEXT_PUBLIC_WEBINAR_LINK ?? 'https://trila.co/webinar'
            }
            target='_blank'
            rel='noopener noreferrer'
            className='flex items-center justify-center gap-2 rounded-lg bg-[#2563eb] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1d4ed8]'
          >
            <ExternalLink size={14} /> Join Webinar
          </a>
          <p className='mt-2 text-[11px] text-white/30 text-center'>
            Link becomes active at session time. Do not share it.
          </p>
        </div>
      )}

      {/* Consulting: Scheduling link */}
      {isConsulting && (
        <div className='w-full max-w-md mb-6 rounded-xl border border-[#2563eb]/30 bg-[#0a1525] p-4'>
          <p className='mb-3 text-[11px] font-bold tracking-[0.12em] uppercase text-[#4a9eff]'>
            📅 Book Your Session Time
          </p>
          <p className='mb-3 text-sm text-white/50'>
            Choose a date and time that works for you.
          </p>
          <a
            href={CONSULTING_SCHEDULING_LINK}
            target='_blank'
            rel='noopener noreferrer'
            className='flex items-center justify-center gap-2 rounded-lg bg-[#2563eb] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1d4ed8]'
          >
            <ExternalLink size={14} /> Schedule My Session →
          </a>
        </div>
      )}

      {/* Signature: Check-in note */}
      {isLive && (
        <div className='w-full max-w-md mb-6 rounded-xl border border-white/8 bg-white/5 p-4 text-left'>
          <p className='mb-3 text-[11px] font-bold tracking-[0.12em] uppercase text-white/30'>
            📍 Check-In Instructions (Both Days)
          </p>
          <ol className='space-y-2 text-sm text-white/60 list-decimal list-inside'>
            <li>Arrive at least 30 min before start time.</li>
            <li>Scan the QR code at the venue entrance.</li>
            <li>Enter your email + enrollment reference above.</li>
            <li>
              See{' '}
              <span className='text-green-400 font-medium'>Access Granted</span>{' '}
              — you're in.
            </li>
            <li className='text-[#d4a422]'>
              Repeat on Day 2 with the same reference.
            </li>
          </ol>
        </div>
      )}

      <button
        onClick={onClose}
        className='rounded-xl border border-white/15 bg-white/8 px-8 py-3 text-sm font-semibold text-white/70 transition-colors hover:bg-white/12 hover:text-white'
      >
        Close
      </button>
    </div>
  )
}

// ─── Waitlist Success Display ──────────────────────────────────────────────────

function WaitlistSuccessDisplay({
  position,
  sessionLabel,
  email,
  onClose,
}: {
  position: number
  sessionLabel: string
  email: string
  onClose: () => void
}) {
  return (
    <div className='flex flex-col items-center px-6 py-8 sm:px-10 text-center'>
      <div className='mb-6 rounded-full bg-[#2563eb]/10 p-5'>
        <ClockIcon size={52} className='text-[#4a9eff]' />
      </div>
      <div className='mb-2 text-[11px] font-bold tracking-[0.15em] uppercase text-[#4a9eff]'>
        You're on the Waitlist
      </div>
      <h3 className='mb-2 text-2xl font-extrabold text-white'>
        Position #{position}
      </h3>
      <p className='mb-8 text-[14px] text-white/50 max-w-sm'>
        You've been added to the waitlist for{' '}
        <span className='text-white/80 font-medium'>{sessionLabel}</span>. We'll
        email <span className='text-white/80'>{email}</span> the moment a spot
        opens.
      </p>

      <div className='w-full max-w-md mb-8 rounded-xl border border-white/8 bg-white/5 p-5 text-left space-y-3'>
        <div className='flex items-start gap-3'>
          <div className='mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#2563eb] text-[11px] font-bold text-white'>
            1
          </div>
          <p className='text-[13px] text-white/60'>
            We'll email you within minutes of a spot opening.
          </p>
        </div>
        <div className='flex items-start gap-3'>
          <div className='mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#2563eb] text-[11px] font-bold text-white'>
            2
          </div>
          <p className='text-[13px] text-white/60'>
            You'll have{' '}
            <span className='text-white font-semibold'>24 hours</span> to
            confirm and pay.
          </p>
        </div>
        <div className='flex items-start gap-3'>
          <div className='mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#2563eb] text-[11px] font-bold text-white'>
            3
          </div>
          <p className='text-[13px] text-white/60'>
            If you don't confirm in time, the next person is notified.
          </p>
        </div>
      </div>

      <button
        onClick={onClose}
        className='rounded-xl border border-white/15 bg-white/8 px-8 py-3 text-sm font-semibold text-white/70 transition-colors hover:bg-white/12 hover:text-white'
      >
        Got it
      </button>
    </div>
  )
}

// ─── Session Card ──────────────────────────────────────────────────────────────

function SessionCard({
  session,
  isSelected,
  onSelect,
  onJoinWaitlist,
  disabled,
}: {
  session: SessionWithCapacity
  isSelected: boolean
  onSelect: () => void
  onJoinWaitlist: () => void
  disabled: boolean
}) {
  const isFull = session.isFull
  const isLow = !isFull && session.spotsRemaining <= 5

  return (
    <div
      className={`relative rounded-xl border px-4 py-3 transition-all ${
        isFull
          ? 'border-white/5 bg-white/2 opacity-70 cursor-default'
          : isSelected
            ? 'border-[#2563eb]/60 bg-[#2563eb]/10 cursor-pointer'
            : 'border-white/8 bg-white/3 hover:border-white/15 hover:bg-white/5 cursor-pointer'
      } ${disabled ? 'pointer-events-none opacity-50' : ''}`}
      onClick={!isFull && !disabled ? onSelect : undefined}
    >
      <div className='flex items-start justify-between gap-3'>
        <div className='min-w-0'>
          <p
            className={`text-[13px] font-semibold ${isSelected && !isFull ? 'text-white' : isFull ? 'text-white/40' : 'text-white/70'}`}
          >
            {session.label}
          </p>
          <p className='text-[11px] text-white/35 mt-0.5 truncate'>
            {session.isTwoDay
              ? `${session.city} · ${session.displayTime} · 2-Day Event`
              : `${session.city} · ${session.displayTime}`}
            {session.venue ? ` · ${session.venue}` : ''}
          </p>

          {/* Capacity indicator row */}
          <div className='mt-1.5 flex flex-wrap items-center gap-2'>
            {isFull ? (
              <span className='flex items-center gap-1 text-[10px] font-bold text-red-400'>
                <Users size={10} /> FULL · {session.waitlistCount} on waitlist
              </span>
            ) : isLow ? (
              <span className='flex items-center gap-1 text-[10px] font-bold text-amber-400'>
                Only {session.spotsRemaining} spot
                {session.spotsRemaining !== 1 ? 's' : ''} left
              </span>
            ) : (
              <span className='flex items-center gap-1 text-[10px] text-white/25'>
                {session.spotsRemaining} of {session.capacity} available
              </span>
            )}
          </div>
        </div>

        {/* Right side: radio or waitlist button */}
        {isFull ? (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onJoinWaitlist()
            }}
            disabled={disabled}
            className='shrink-0 rounded-lg border border-[#2563eb]/40 bg-[#2563eb]/10 px-3 py-1.5 text-[11px] font-bold text-[#4a9eff] transition-colors hover:bg-[#2563eb]/20 disabled:opacity-50'
          >
            Join Waitlist
          </button>
        ) : (
          <div
            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
              isSelected ? 'border-[#2563eb] bg-[#2563eb]' : 'border-white/20'
            }`}
          >
            {isSelected && <Check size={11} className='text-white' />}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main Modal ────────────────────────────────────────────────────────────────

export default function EnrollmentModal({
  isOpen,
  onClose,
  initialProduct,
  initialFormData,
  initialEnrollmentReference,
  waitlistToken,
  initialSessionId,
}: EnrollmentModalProps) {
  const productLocked = Boolean(initialProduct)
  const defaultProduct: ProductType = initialProduct ?? 'Virtual Masterclass'

  // ── UI State ─────────────────────────────────────────────────────────────
  const [modalView, setModalView] = useState<ModalView>('form')
  const [selectedProduct, setSelectedProduct] =
    useState<ProductType>(defaultProduct)
  const [productDropdownOpen, setProductDropdownOpen] = useState(false)

  // ── Session data fetched from DB ──────────────────────────────────────────
  const [sessionsMap, setSessionsMap] = useState<
    Record<string, SessionWithCapacity[]>
  >({})
  const [sessionsLoading, setSessionsLoading] = useState(false)
  const [sessionsError, setSessionsError] = useState<string | null>(null)

  // ── Form state ────────────────────────────────────────────────────────────
  const [formData, setFormData] = useState({
    name: initialFormData?.name ?? '',
    email: initialFormData?.email ?? '',
    phone: initialFormData?.phone ?? '',
    city: initialFormData?.city ?? '',
  })
  const [selectedSessionId, setSelectedSessionId] = useState(
    initialSessionId ?? '',
  )
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [apiError, setApiError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [paystackLoaded, setPaystackLoaded] = useState(false)
  const [enrollmentRef, setEnrollmentRef] = useState<string | null>(
    initialEnrollmentReference ?? null,
  )
  const [successData, setSuccessData] = useState<EnrollmentSuccessData | null>(
    null,
  )

  // ── Waitlist state ────────────────────────────────────────────────────────
  const [waitlistSession, setWaitlistSession] =
    useState<SessionWithCapacity | null>(null)
  const [waitlistResult, setWaitlistResult] = useState<{
    position: number
    sessionLabel: string
  } | null>(null)
  const [isSubmittingWaitlist, setIsSubmittingWaitlist] = useState(false)

  const sessions: SessionWithCapacity[] = sessionsMap[selectedProduct] ?? []
  const selectedSession = sessions.find(
    (s) => s.sessionId === selectedSessionId,
  )
  const displayPrice = DISPLAY_PRICES[selectedProduct]
  const meta = PLAN_META[selectedProduct]

  // ── Fetch sessions from /api/sessions ─────────────────────────────────────
  const fetchSessions = useCallback(async () => {
    setSessionsLoading(true)
    setSessionsError(null)
    try {
      const res = await fetch('/api/sessions', { cache: 'no-store' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to load sessions.')
      setSessionsMap(data.sessions ?? {})
    } catch (err: any) {
      setSessionsError(err.message || 'Failed to load sessions.')
    } finally {
      setSessionsLoading(false)
    }
  }, [])

  // ── Reset on open ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return
    setSelectedProduct(initialProduct ?? 'Virtual Masterclass')
    setFormData({
      name: initialFormData?.name ?? '',
      email: initialFormData?.email ?? '',
      phone: initialFormData?.phone ?? '',
      city: initialFormData?.city ?? '',
    })
    setSelectedSessionId(initialSessionId ?? '')
    setErrors({})
    setApiError(null)
    setIsProcessing(false)
    setEnrollmentRef(initialEnrollmentReference ?? null)
    setSuccessData(null)
    setModalView('form')
    setWaitlistSession(null)
    setWaitlistResult(null)

    // Fetch fresh session data every time the modal opens
    fetchSessions()
  }, [
    isOpen,
    initialProduct,
    initialFormData,
    initialEnrollmentReference,
    initialSessionId,
    fetchSessions,
  ])

  // ── Body scroll lock ──────────────────────────────────────────────────────
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // ── Reset session when product changes ────────────────────────────────────
  useEffect(() => {
    setSelectedSessionId('')
  }, [selectedProduct])

  // ── Field change ──────────────────────────────────────────────────────────
  const handleFieldChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field])
      setErrors((prev) => {
        const n = { ...prev }
        delete n[field]
        return n
      })
    if (apiError) setApiError(null)
  }

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    if (!formData.name.trim() || formData.name.trim().length < 2)
      newErrors.name = 'Name must be at least 2 characters'
    if (
      !formData.email.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
    )
      newErrors.email = 'Please enter a valid email address'
    const cleanPhone = formData.phone.replace(/\s+/g, '')
    if (!cleanPhone || cleanPhone.length < 10)
      newErrors.phone = 'Phone number must be at least 10 digits'
    if (!selectedSessionId) newErrors.session = 'Please select a session'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // ── "Join Waitlist" button on a full session card ─────────────────────────
  const handleWaitlistClick = (session: SessionWithCapacity) => {
    setWaitlistSession(session)
    setSelectedSessionId(session.sessionId)
    setModalView('waitlist-form')
  }

  // ── Submit waitlist form ──────────────────────────────────────────────────
  const handleWaitlistSubmit = async () => {
    if (!waitlistSession) return

    // Validate name/email/phone first
    const newErrors: Record<string, string> = {}
    if (!formData.name.trim() || formData.name.trim().length < 2)
      newErrors.name = 'Name must be at least 2 characters'
    if (
      !formData.email.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
    )
      newErrors.email = 'Please enter a valid email address'
    const cleanPhone = formData.phone.replace(/\s+/g, '')
    if (!cleanPhone || cleanPhone.length < 10)
      newErrors.phone = 'Phone number must be at least 10 digits'
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsSubmittingWaitlist(true)
    setApiError(null)

    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone.replace(/\s+/g, ''),
          city: formData.city.trim() || undefined,
          productType: selectedProduct,
          sessionId: waitlistSession.sessionId,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (res.status === 409 && data.position) {
          // Already on waitlist — show success anyway with their existing position
          setWaitlistResult({
            position: data.position,
            sessionLabel: waitlistSession.label,
          })
          setModalView('waitlist-success')
          return
        }
        throw new Error(data.error || 'Failed to join waitlist.')
      }

      setWaitlistResult({
        position: data.position,
        sessionLabel: data.sessionLabel,
      })
      setModalView('waitlist-success')
    } catch (err: any) {
      setApiError(err.message || 'Failed to join waitlist. Please try again.')
    } finally {
      setIsSubmittingWaitlist(false)
    }
  }

  // ── Verify payment ────────────────────────────────────────────────────────
  const verifyPayment = async (paystackReference: string, ref: string) => {
    try {
      if (!selectedSession) throw new Error('Session not found.')
      const verifyRes = await fetch('/api/payment/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reference: paystackReference,
          enrollmentReference: ref,
          productType: selectedProduct,
          sessionId: selectedSession.sessionId,
          sessionDates: selectedSession.dates,
          sessionTime: selectedSession.time,
          sessionVenue: selectedSession.venue ?? null,
          sessionCity: selectedSession.city ?? null,
          isTwoDay: selectedSession.isTwoDay ?? false,
          // Pass waitlist token if this came from a waitlist confirm flow
          waitlistToken: waitlistToken ?? null,
        }),
      })
      const data = await verifyRes.json()
      if (!verifyRes.ok)
        throw new Error(data.error || 'Payment verification failed.')
      setSuccessData(data.enrollment as EnrollmentSuccessData)
    } catch (err: any) {
      toast.error('Payment verification failed', {
        description:
          err.message || 'Please contact support with your payment reference.',
        duration: 8000,
      })
    } finally {
      setIsProcessing(false)
    }
  }

  // ── Submit → register → Paystack popup ───────────────────────────────────
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

    // Step 1: Register (skip if already done)
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
          const isDuplicate = regRes.status === 409
          toast.error(
            isDuplicate ? 'Email already registered' : 'Registration failed',
            {
              description: isDuplicate
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
          description: 'Please check your connection and try again.',
        })
        setIsProcessing(false)
        return
      }
    }

    // Step 2: Open Paystack
    try {
      const handler = window.PaystackPop!.setup({
        key: publicKey,
        email: formData.email.trim().toLowerCase(),
        amount: displayPrice * 100,
        currency: 'NGN',
        metadata: {
          enrollment_reference: ref,
          product_type: selectedProduct,
          name: formData.name.trim(),
        },
        callback: (response) => {
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

  if (!isOpen) return null

  const inputClass = (field: string) =>
    `w-full rounded-xl border ${errors[field] ? 'border-red-500/60' : 'border-white/10'} bg-[#0d1a35] px-4 py-3 text-[13.5px] text-white placeholder:text-white/25 focus:border-[#2563eb]/60 focus:outline-none focus:ring-1 focus:ring-[#2563eb]/40 hover:border-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`

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
          if (e.target === e.currentTarget) onClose()
        }}
      >
        <div className='absolute inset-0 bg-[#020509]/80 backdrop-blur-md' />

        {/* Modal */}
        <div className='relative z-10 w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-2xl border border-white/10 bg-[#0b1628] shadow-[0_25px_80px_rgba(0,0,0,0.8)]'>
          {/* Close button */}
          <button
            onClick={onClose}
            className='absolute right-4 top-4 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/40 transition-colors hover:bg-white/10 hover:text-white'
          >
            <X size={15} />
          </button>

          {/* ── Success view ───────────────────────────────────────────────── */}
          {successData && (
            <SuccessDisplay
              data={successData}
              userEmail={formData.email}
              onClose={onClose}
            />
          )}

          {/* ── Waitlist success view ──────────────────────────────────────── */}
          {!successData &&
            modalView === 'waitlist-success' &&
            waitlistResult && (
              <WaitlistSuccessDisplay
                position={waitlistResult.position}
                sessionLabel={waitlistResult.sessionLabel}
                email={formData.email}
                onClose={onClose}
              />
            )}

          {/* ── Form + Waitlist form views ─────────────────────────────────── */}
          {!successData && modalView !== 'waitlist-success' && (
            <div className='grid grid-cols-1 lg:grid-cols-[320px_1fr]'>
              {/* Left: Plan info */}
              <div className='relative border-b border-white/8 bg-[#070f1e] p-7 lg:border-b-0 lg:border-r lg:p-8'>
                {meta.badge && (
                  <div
                    className='mb-4 inline-block rounded-full px-3 py-1 text-[10px] font-black tracking-[0.12em]'
                    style={{
                      background: meta.badgeColor + '22',
                      color: meta.badgeColor,
                      border: `1px solid ${meta.badgeColor}44`,
                    }}
                  >
                    {meta.badge}
                  </div>
                )}

                {/* Product selector or fixed label */}
                {productLocked ? (
                  <div className='mb-1 flex items-center gap-2'>
                    <span>{PLAN_ICONS[selectedProduct]}</span>
                    <h3 className='text-[17px] font-extrabold text-white'>
                      {selectedProduct}
                    </h3>
                  </div>
                ) : (
                  <div className='relative mb-2'>
                    <button
                      type='button'
                      onClick={() => setProductDropdownOpen((o) => !o)}
                      disabled={isProcessing}
                      className='flex w-full items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-left text-[14px] font-bold text-white hover:bg-white/8 transition-colors disabled:opacity-50'
                    >
                      <span className='flex items-center gap-2'>
                        {PLAN_ICONS[selectedProduct]}
                        {selectedProduct}
                      </span>
                      <ChevronDown
                        size={14}
                        className={`text-white/40 transition-transform ${productDropdownOpen ? 'rotate-180' : ''}`}
                      />
                    </button>
                    {productDropdownOpen && (
                      <div className='absolute z-30 mt-1 w-full overflow-hidden rounded-xl border border-white/10 bg-[#0d1a2e] shadow-xl'>
                        {PRODUCT_TYPES.map((p) => (
                          <button
                            key={p}
                            type='button'
                            onClick={() => {
                              setSelectedProduct(p)
                              setProductDropdownOpen(false)
                            }}
                            className={`flex w-full items-center gap-2 px-4 py-3 text-left text-[13px] transition-colors hover:bg-white/5 ${selectedProduct === p ? 'text-[#4a9eff]' : 'text-white/70'}`}
                          >
                            {PLAN_ICONS[p]}
                            {p}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <p className='mb-5 text-[12px] text-white/40'>{meta.tagline}</p>

                {/* Price */}
                <div className='mb-5 rounded-xl bg-white/5 px-5 py-4'>
                  <p className='mb-0.5 text-[11px] font-bold tracking-[0.12em] uppercase text-white/30'>
                    Investment
                  </p>
                  <p className='text-3xl font-extrabold text-white'>
                    {formatNaira(displayPrice)}
                  </p>
                  <p className='text-[12px] text-white/30'>
                    {selectedProduct === 'Virtual Masterclass' && '≈ $260 USD'}
                    {selectedProduct === 'Signature Live Masterclass' &&
                      '≈ $650 USD'}
                    {selectedProduct === 'Private JaaS Consulting' &&
                      '≈ $500+ USD'}
                  </p>
                </div>

                {/* Features */}
                <ul className='space-y-2.5'>
                  {meta.features.map((f) => (
                    <li key={f} className='flex items-start gap-2.5'>
                      <Check
                        size={14}
                        className='mt-0.5 shrink-0 text-[#2563eb]'
                      />
                      <span className='text-[13px] text-white/55 leading-snug'>
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className='mt-6 flex items-center gap-2 text-[11px] text-white/25'>
                  <Shield size={12} />
                  <span>30-day money-back guarantee</span>
                </div>
              </div>

              {/* Right: Form */}
              <div className='p-7 lg:p-8'>
                {/* ── WAITLIST FORM VIEW ──────────────────────────────────── */}
                {modalView === 'waitlist-form' && waitlistSession && (
                  <div>
                    <button
                      onClick={() => {
                        setModalView('form')
                        setWaitlistSession(null)
                      }}
                      className='mb-5 flex items-center gap-1.5 text-[12px] text-white/40 hover:text-white/70 transition-colors'
                    >
                      ← Back to sessions
                    </button>

                    <h3 className='mb-1 text-[18px] font-extrabold text-white'>
                      Join the Waitlist
                    </h3>
                    <p className='mb-5 text-[13px] text-white/40'>
                      This session is full. Add yourself to the queue and we'll
                      notify you the moment a spot opens.
                    </p>

                    {/* Session being waited for */}
                    <div className='mb-5 rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3'>
                      <p className='text-[10px] font-bold uppercase tracking-wider text-amber-400 mb-1'>
                        Session Full
                      </p>
                      <p className='text-[14px] font-semibold text-white'>
                        {waitlistSession.label}
                      </p>
                      <p className='text-[12px] text-white/40 mt-0.5'>
                        {waitlistSession.city}
                        {waitlistSession.venue
                          ? ` · ${waitlistSession.venue}`
                          : ''}{' '}
                        ·{' '}
                        {waitlistSession.waitlistCount > 0
                          ? `${waitlistSession.waitlistCount} already waiting`
                          : 'Be the first on the list'}
                      </p>
                    </div>

                    <div className='space-y-4'>
                      {/* Name + Email */}
                      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                        <div>
                          <label className='mb-1.5 block text-[12px] font-semibold text-white/40 uppercase tracking-wide'>
                            Full Name *
                          </label>
                          <input
                            type='text'
                            placeholder='John Doe'
                            value={formData.name}
                            onChange={(e) =>
                              handleFieldChange('name', e.target.value)
                            }
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
                          <label className='mb-1.5 block text-[12px] font-semibold text-white/40 uppercase tracking-wide'>
                            Email Address *
                          </label>
                          <input
                            type='email'
                            placeholder='john@example.com'
                            value={formData.email}
                            onChange={(e) =>
                              handleFieldChange('email', e.target.value)
                            }
                            className={inputClass('email')}
                          />
                          {errors.email && (
                            <p className='mt-1 flex items-center gap-1 text-[11px] text-red-400'>
                              <AlertCircle size={11} />
                              {errors.email}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Phone + City */}
                      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                        <div>
                          <label className='mb-1.5 block text-[12px] font-semibold text-white/40 uppercase tracking-wide'>
                            Phone / WhatsApp *
                          </label>
                          <input
                            type='tel'
                            placeholder='+234 800 000 0000'
                            value={formData.phone}
                            onChange={(e) =>
                              handleFieldChange('phone', e.target.value)
                            }
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
                          <label className='mb-1.5 block text-[12px] font-semibold text-white/40 uppercase tracking-wide'>
                            City of Interest
                          </label>
                          <input
                            type='text'
                            placeholder='Lagos, Dubai…'
                            value={formData.city}
                            onChange={(e) =>
                              handleFieldChange('city', e.target.value)
                            }
                            className={inputClass('city')}
                          />
                        </div>
                      </div>

                      {/* API error */}
                      {apiError && (
                        <div className='flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-3'>
                          <AlertTriangle
                            size={14}
                            className='mt-0.5 shrink-0 text-red-400'
                          />
                          <p className='text-[13px] text-red-300'>{apiError}</p>
                        </div>
                      )}

                      <button
                        onClick={handleWaitlistSubmit}
                        disabled={isSubmittingWaitlist}
                        className='flex w-full items-center justify-center gap-2.5 rounded-xl bg-[#2563eb] px-6 py-4 text-[15px] font-bold text-white transition-all hover:bg-[#1d4ed8] disabled:cursor-not-allowed disabled:opacity-50'
                      >
                        {isSubmittingWaitlist ? (
                          <>
                            <Loader2 size={16} className='animate-spin' />
                            Adding you to the queue…
                          </>
                        ) : (
                          <>
                            <Users size={16} />
                            Join Waitlist for {waitlistSession.label}
                          </>
                        )}
                      </button>
                      <p className='text-center text-[11px] text-white/20'>
                        No payment now. We'll email you when a spot opens —
                        you'll have 24 hours to confirm.
                      </p>
                    </div>
                  </div>
                )}

                {/* ── ENROLLMENT FORM VIEW ─────────────────────────────────── */}
                {modalView === 'form' && (
                  <div>
                    <h3 className='mb-1 text-[18px] font-extrabold text-white'>
                      Reserve Your Spot
                    </h3>
                    <p className='mb-6 text-[13px] text-white/40'>
                      Complete your details and proceed to secure payment.
                    </p>

                    <div className='space-y-4'>
                      {/* Name + Email */}
                      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                        <div>
                          <label className='mb-1.5 block text-[12px] font-semibold text-white/40 uppercase tracking-wide'>
                            Full Name *
                          </label>
                          <input
                            type='text'
                            placeholder='John Doe'
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
                          <label className='mb-1.5 block text-[12px] font-semibold text-white/40 uppercase tracking-wide'>
                            Email Address *
                          </label>
                          <input
                            type='email'
                            placeholder='john@example.com'
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
                      </div>

                      {/* Phone + City */}
                      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                        <div>
                          <label className='mb-1.5 block text-[12px] font-semibold text-white/40 uppercase tracking-wide'>
                            Phone / WhatsApp *
                          </label>
                          <input
                            type='tel'
                            placeholder='+234 800 000 0000'
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
                          <label className='mb-1.5 block text-[12px] font-semibold text-white/40 uppercase tracking-wide'>
                            City of Interest
                          </label>
                          <input
                            type='text'
                            placeholder='Lagos, Dubai…'
                            value={formData.city}
                            onChange={(e) =>
                              handleFieldChange('city', e.target.value)
                            }
                            disabled={isProcessing}
                            className={inputClass('city')}
                          />
                        </div>
                      </div>

                      {/* Session Selector */}
                      <div>
                        <label className='mb-1.5 block text-[12px] font-semibold text-white/40 uppercase tracking-wide'>
                          Select Session *
                        </label>

                        {sessionsLoading ? (
                          <div className='flex items-center gap-2 py-3 text-[13px] text-white/40'>
                            <Loader2 size={14} className='animate-spin' />{' '}
                            Loading sessions…
                          </div>
                        ) : sessionsError ? (
                          <div className='rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-[13px] text-red-400'>
                            {sessionsError}{' '}
                            <button
                              onClick={fetchSessions}
                              className='underline text-red-300'
                            >
                              Retry
                            </button>
                          </div>
                        ) : sessions.length === 0 ? (
                          <p className='text-[13px] text-white/30'>
                            No sessions available for this programme.
                          </p>
                        ) : (
                          <div className='grid gap-2'>
                            {sessions.map((session) => (
                              <SessionCard
                                key={session.sessionId}
                                session={session}
                                isSelected={
                                  selectedSessionId === session.sessionId
                                }
                                onSelect={() => {
                                  setSelectedSessionId(session.sessionId)
                                  if (errors.session)
                                    setErrors((p) => {
                                      const n = { ...p }
                                      delete n.session
                                      return n
                                    })
                                }}
                                onJoinWaitlist={() =>
                                  handleWaitlistClick(session)
                                }
                                disabled={isProcessing}
                              />
                            ))}
                          </div>
                        )}

                        {errors.session && (
                          <p className='mt-1.5 flex items-center gap-1 text-[11px] text-red-400'>
                            <AlertCircle size={11} />
                            {errors.session}
                          </p>
                        )}
                      </div>

                      {/* Selected session summary */}
                      {selectedSession && !selectedSession.isFull && (
                        <div className='rounded-xl border border-[#2563eb]/20 bg-[#2563eb]/5 px-4 py-3 text-[13px] text-white/60'>
                          {selectedSession.isTwoDay ? (
                            <span>
                              <span className='text-white font-medium'>
                                {formatSessionDates(
                                  selectedSession.dates,
                                  true,
                                )}
                              </span>
                              {' · '}
                              {selectedSession.venue}, {selectedSession.city}
                              <span className='ml-2 text-[11px] text-[#d4a422] font-bold'>
                                2-DAY — check-in required both days
                              </span>
                            </span>
                          ) : (
                            <span>
                              Starting{' '}
                              <span className='text-white font-medium'>
                                {new Date(
                                  selectedSession.dates[0],
                                ).toLocaleDateString('en-NG', {
                                  month: 'long',
                                  day: 'numeric',
                                  year: 'numeric',
                                })}
                              </span>
                              {' · '}
                              {selectedSession.displayTime}
                            </span>
                          )}
                        </div>
                      )}

                      {/* API error */}
                      {apiError && (
                        <div className='flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-3'>
                          <AlertTriangle
                            size={14}
                            className='mt-0.5 shrink-0 text-red-400'
                          />
                          <p className='text-[13px] text-red-300'>{apiError}</p>
                        </div>
                      )}

                      {/* Submit */}
                      <button
                        onClick={handleSubmit}
                        disabled={isProcessing || !paystackLoaded}
                        className='group flex w-full items-center justify-center gap-2.5 rounded-xl bg-[#2563eb] px-6 py-4 text-[15px] font-bold text-white shadow-[0_0_0_0_rgba(37,99,235,0)] transition-all duration-300 hover:bg-[#1d4ed8] hover:shadow-[0_0_28px_rgba(37,99,235,0.45)] active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-[#2563eb]/40 disabled:shadow-none'
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 size={16} className='animate-spin' />
                            Processing…
                          </>
                        ) : !paystackLoaded ? (
                          <>
                            <Loader2 size={16} className='animate-spin' />
                            Loading payment…
                          </>
                        ) : (
                          `Proceed to Payment · ${formatNaira(displayPrice)}`
                        )}
                      </button>

                      <p className='text-center text-[11px] text-white/20'>
                        Secured by Paystack · 256-bit SSL encryption
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
