'use client'

import { useEffect, useRef, useState } from 'react'
import {
  Lock,
  Building2,
  Globe,
  CreditCard,
  ChevronDown,
  Shield,
  CircleCheckBig,
  ArrowRight,
  Copy,
  Check,
  Info,
} from 'lucide-react'

const INFO_TEXT =
  'After payment, send proof of transfer to masterclass@trila.pro or WhatsApp +234 7064000854 for instant confirmation.'

const BANK_INSTRUCTIONS = [
  'Transfer the exact amount for your selected tier',
  'Use your full name and email as payment reference',
  'Send proof of payment to masterclass@trila.pro',
  'Confirmation will be sent within 2–4 business hours',
]

const paymentMethods = [
  {
    category: 'Bank Transfer',
    icon: Building2,
    iconColor: '#0066FF',
    iconBgFrom: 'rgba(0, 102, 255, 0.125)',
    iconBgTo: 'rgba(0, 102, 255, 0.03)',
    accentColor: '#0066FF',
    title: 'Access Bank Nigeria',
    subtitle: 'Direct bank transfer',
    fields: [
      {
        label: 'Account Name',
        value: 'Trila Technologies Ltd',
        copyable: true,
      },
      { label: 'Account Number', value: '0123456789', copyable: true },
      { label: 'Bank', value: 'Access Bank Plc' },
      { label: 'Currency', value: 'NGN (Nigerian Naira)' },
      { label: 'Sort Code', value: '044' },
    ],
    instructions: BANK_INSTRUCTIONS,
  },
  {
    category: 'Bank Transfer',
    icon: Building2,
    iconColor: '#c9a84c',
    iconBgFrom: 'rgba(201, 168, 76, 0.125)',
    iconBgTo: 'rgba(201, 168, 76, 0.03)',
    accentColor: '#c9a84c',
    title: 'Zenith International Bank',
    subtitle: 'Direct bank transfer',
    fields: [
      {
        label: 'Account Name',
        value: 'Trila Technologies Ltd',
        copyable: true,
      },
      { label: 'Account Number', value: '1234567890', copyable: true },
      { label: 'Bank', value: 'Zenith International Bank' },
      { label: 'Currency', value: 'NGN (Nigerian Naira)' },
      { label: 'Sort Code', value: '057' },
    ],
    instructions: BANK_INSTRUCTIONS,
  },
  {
    category: 'Digital Payment',
    icon: Globe,
    iconColor: 'rgb(255, 107, 0)',
    iconBgFrom: 'rgba(255, 107, 0, 0.125)',
    iconBgTo: 'rgba(255, 107, 0, 0.03)',
    accentColor: 'rgb(255, 107, 0)',
    title: 'Payoneer',
    subtitle: 'International payment',
    fields: [
      { label: 'Payoneer Email', value: 'payments@trila.pro', copyable: true },
      { label: 'Account Holder', value: 'Trila Technologies Ltd' },
      { label: 'Currency', value: 'USD / EUR / GBP' },
      { label: 'Processing Time', value: '1–2 business days' },
    ],
    instructions: [
      'Log in to your Payoneer account',
      'Select "Make a Payment" and enter the email above',
      'Enter the USD equivalent of your selected tier',
      'Include your full name and tier in the payment note',
      'Send confirmation screenshot to masterclass@trila.pro',
    ],
  },
  {
    category: 'Digital Payment',
    icon: CreditCard,
    iconColor: '#4a7fd4',
    iconBgFrom: 'rgba(0, 48, 135, 0.125)',
    iconBgTo: 'rgba(0, 48, 135, 0.03)',
    accentColor: '#4a7fd4',
    title: 'PayPal',
    subtitle: 'International payment',
    fields: [
      { label: 'PayPal Email', value: 'payments@trila.pro', copyable: true },
      { label: 'Account Holder', value: 'Trila Technologies Ltd' },
      { label: 'Currency', value: 'USD / EUR / GBP' },
      { label: 'Processing Time', value: 'Instant – 24 hours' },
    ],
    instructions: [
      'Log in to your PayPal account',
      'Select "Send Money" → "Paying for goods or services"',
      'Enter the PayPal email above and the USD amount',
      'Add your full name and selected tier in the note',
      'Send confirmation to masterclass@trila.pro',
    ],
  },
]

const securityFeatures = [
  {
    icon: Shield,
    label: 'Bank-Level Security',
    sub: 'All transactions are encrypted and verified',
  },
  {
    icon: CircleCheckBig,
    label: 'Instant Confirmation',
    sub: 'Receive booking confirmation within hours',
  },
  {
    icon: Lock,
    label: 'Money-Back Guarantee',
    sub: '30-day refund policy, no questions asked',
  },
]

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false)
  const handle = async () => {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      onClick={handle}
      className='flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all shrink-0'
      style={{
        background: copied ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.05)',
        border: copied
          ? '1px solid rgba(34,197,94,0.3)'
          : '1px solid rgba(255,255,255,0.08)',
        color: copied ? 'rgb(74,222,128)' : 'rgba(255,255,255,0.4)',
      }}
    >
      {copied ? <Check size={11} /> : <Copy size={11} />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}

export default function PaymentOptions() {
  const [visible, setVisible] = useState(false)
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true)
      },
      { threshold: 0.1 },
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  const toggle = (i: number) => setActiveIndex(activeIndex === i ? null : i)
  const active = activeIndex !== null ? paymentMethods[activeIndex] : null

  return (
    <section
      ref={ref}
      id='payment-options'
      className='relative py-24 sm:py-32 overflow-hidden'
      style={{ background: '#070e1a' }}
    >
      {/* Backgrounds */}
      <div
        className='absolute inset-0'
        style={{
          background: 'linear-gradient(to bottom, #0a1628, #070e1a, #0a1628)',
        }}
      />
      <div
        className='absolute top-1/3 left-0 rounded-full pointer-events-none'
        style={{
          width: '400px',
          height: '400px',
          background:
            'linear-gradient(to right, rgba(0,102,255,0.05), transparent)',
          filter: 'blur(150px)',
        }}
      />
      <div
        className='absolute bottom-1/4 right-0 rounded-full pointer-events-none'
        style={{
          width: '400px',
          height: '400px',
          background:
            'linear-gradient(to left, rgba(201,168,76,0.05), transparent)',
          filter: 'blur(150px)',
        }}
      />

      <div className='relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        {/* Header */}
        <div
          className={`text-center mb-16 sm:mb-20 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
        >
          <div
            className='inline-flex items-center gap-2 rounded-full px-5 py-2 mb-6'
            style={{
              background: 'rgba(255,255,255,0.04)',
              backdropFilter: 'blur(4px)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <Lock size={14} className='text-green-400' />
            <span className='text-green-400 text-xs sm:text-sm font-semibold tracking-wider uppercase'>
              Secure Payment Options
            </span>
          </div>
          <h2 className='text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight mb-4'>
            Payment{' '}
            <span
              className='text-transparent bg-clip-text'
              style={{
                backgroundImage: 'linear-gradient(to right, #0066FF, #3399ff)',
              }}
            >
              Options
            </span>
          </h2>
          <p className='text-white/40 text-base sm:text-lg mt-4 max-w-3xl mx-auto leading-relaxed'>
            Choose your preferred payment method. We accept direct bank
            transfers and international digital payments for seamless processing
            worldwide.
          </p>
        </div>

        {/* Cards */}
        <div
          className={`grid sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5 mb-6 max-w-6xl mx-auto transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          style={{ transitionDelay: '150ms' }}
        >
          {paymentMethods.map((method, i) => {
            const Icon = method.icon
            const isActive = activeIndex === i
            return (
              <button
                key={method.title}
                onClick={() => toggle(i)}
                className='relative text-left rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 overflow-hidden'
                style={{
                  background: isActive
                    ? 'rgba(255,255,255,0.06)'
                    : 'rgba(255,255,255,0.03)',
                  backdropFilter: 'blur(4px)',
                  border: isActive
                    ? '1px solid rgba(255,255,255,0.12)'
                    : '1px solid rgba(255,255,255,0.06)',
                }}
              >
                {/* Active top border */}
                {isActive && (
                  <div
                    className='absolute top-0 left-0 right-0 h-0.5'
                    style={{ background: method.accentColor }}
                  />
                )}

                <span className='text-[10px] uppercase tracking-wider font-semibold text-white/20 mb-3 block'>
                  {method.category}
                </span>

                <div
                  className='w-12 h-12 rounded-xl flex items-center justify-center mb-4'
                  style={{
                    background: `linear-gradient(135deg, ${method.iconBgFrom}, ${method.iconBgTo})`,
                  }}
                >
                  <Icon
                    size={22}
                    style={{ color: method.iconColor }}
                    strokeWidth={2}
                  />
                </div>

                <h3 className='text-white font-bold text-base mb-1'>
                  {method.title}
                </h3>
                <p className='text-white/30 text-xs'>{method.subtitle}</p>

                <div
                  className='flex items-center gap-1.5 mt-4 text-xs font-medium'
                  style={{ color: method.accentColor }}
                >
                  {isActive ? 'Hide details' : 'View details'}
                  <ChevronDown
                    size={12}
                    strokeWidth={2}
                    className='transition-transform duration-300'
                    style={{
                      transform: isActive ? 'rotate(180deg)' : 'rotate(0deg)',
                    }}
                  />
                </div>
              </button>
            )
          })}
        </div>

        {/* Expanded Detail Panel — full width below cards */}
        <div
          className='max-w-6xl mx-auto mb-10 transition-all duration-500 overflow-hidden'
          style={{
            maxHeight: active ? '700px' : '0px',
            opacity: active ? 1 : 0,
          }}
        >
          {active && (
            <div
              className='rounded-2xl overflow-hidden'
              style={{
                background: 'rgba(255,255,255,0.03)',
                backdropFilter: 'blur(4px)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              {/* Panel header */}
              <div
                className='flex items-center justify-between px-8 py-5'
                style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
              >
                <div className='flex items-center gap-3'>
                  {(() => {
                    const Icon = active.icon
                    return (
                      <div
                        className='w-8 h-8 rounded-lg flex items-center justify-center'
                        style={{
                          background: `linear-gradient(135deg, ${active.iconBgFrom}, ${active.iconBgTo})`,
                        }}
                      >
                        <Icon
                          size={16}
                          style={{ color: active.iconColor }}
                          strokeWidth={2}
                        />
                      </div>
                    )
                  })()}
                  <h3 className='text-white font-bold text-lg'>
                    {active.title}
                  </h3>
                </div>
                <div
                  className='flex items-center gap-1.5 text-xs font-semibold'
                  style={{ color: 'rgb(74,222,128)' }}
                >
                  <div className='w-1.5 h-1.5 rounded-full bg-green-400' />
                  Verified &amp; Secure
                </div>
              </div>

              {/* Panel body — two columns */}
              <div
                className='grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x'
                style={{ borderColor: 'rgba(255,255,255,0.06)' }}
              >
                {/* Left: Account Details */}
                <div className='p-8'>
                  <p className='text-[10px] uppercase tracking-[0.2em] font-bold text-white/30 mb-5'>
                    Account Details
                  </p>
                  <div className='space-y-5'>
                    {active.fields.map((field) => (
                      <div key={field.label}>
                        <p className='text-white/30 text-xs mb-1'>
                          {field.label}
                        </p>
                        <div className='flex items-center justify-between gap-3'>
                          <p className='text-white font-semibold text-sm'>
                            {field.value}
                          </p>
                          {field.copyable && <CopyButton value={field.value} />}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: Instructions */}
                <div className='p-8'>
                  <p className='text-[10px] uppercase tracking-[0.2em] font-bold text-white/30 mb-5'>
                    Payment Instructions
                  </p>
                  <ol className='space-y-3 mb-6'>
                    {active.instructions.map((step, idx) => (
                      <li key={idx} className='flex items-start gap-3'>
                        <span
                          className='shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold mt-0.5'
                          style={{
                            background: `linear-gradient(135deg, ${active.iconBgFrom}, ${active.iconBgTo})`,
                            color: active.iconColor,
                            border: `1px solid ${active.accentColor}40`,
                          }}
                        >
                          {idx + 1}
                        </span>
                        <span className='text-white/60 text-sm leading-relaxed'>
                          {step}
                        </span>
                      </li>
                    ))}
                  </ol>

                  {/* Info box */}
                  <div
                    className='rounded-xl p-4 flex items-start gap-3'
                    style={{
                      background: 'rgba(0,102,255,0.07)',
                      border: '1px solid rgba(0,102,255,0.15)',
                    }}
                  >
                    <Info
                      size={14}
                      className='shrink-0 mt-0.5'
                      style={{ color: '#4a9eff' }}
                    />
                    <p className='text-white/50 text-xs leading-relaxed'>
                      After payment, send proof of transfer to{' '}
                      <span style={{ color: '#4a9eff' }}>
                        masterclass@trila.pro
                      </span>{' '}
                      or WhatsApp{' '}
                      <span style={{ color: '#4a9eff' }}>+234 7064000854</span>{' '}
                      for instant confirmation.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Security trust bar */}
        <div
          className={`max-w-4xl mx-auto transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          style={{ transitionDelay: '350ms' }}
        >
          <div
            className='rounded-2xl p-8 sm:p-10'
            style={{
              background:
                'linear-gradient(to right, rgba(255,255,255,0.03), rgba(255,255,255,0.05), rgba(255,255,255,0.03))',
              backdropFilter: 'blur(4px)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <div className='grid sm:grid-cols-3 gap-6 text-center mb-8'>
              {securityFeatures.map((feat) => {
                const FeatIcon = feat.icon
                return (
                  <div key={feat.label} className='flex flex-col items-center'>
                    <div
                      className='w-10 h-10 rounded-xl flex items-center justify-center mb-3'
                      style={{
                        background:
                          'linear-gradient(to bottom-right, rgba(34,197,94,0.15), rgba(34,197,94,0.05))',
                      }}
                    >
                      <FeatIcon
                        size={18}
                        strokeWidth={2}
                        className='text-green-400'
                      />
                    </div>
                    <p className='text-white font-semibold text-sm'>
                      {feat.label}
                    </p>
                    <p className='text-white/30 text-xs mt-1'>{feat.sub}</p>
                  </div>
                )
              })}
            </div>

            <div className='text-center'>
              <p className='text-white/30 text-xs mb-4'>
                Need help with payment? Our team is available 24/7.
              </p>
              <button
                className='group inline-flex items-center gap-2 text-white font-semibold text-sm px-8 py-3 rounded-full transition-all'
                style={{
                  background: 'linear-gradient(to right, #0066FF, #0052cc)',
                }}
                onMouseEnter={(e) => {
                  ;(e.currentTarget as HTMLButtonElement).style.boxShadow =
                    '0 10px 30px rgba(0,102,255,0.25)'
                }}
                onMouseLeave={(e) => {
                  ;(e.currentTarget as HTMLButtonElement).style.boxShadow =
                    'none'
                }}
                onClick={() =>
                  scrollTo({
                    top:
                      document.getElementById('reserve-access')?.offsetTop ?? 0,
                    behavior: 'smooth',
                  })
                }
              >
                Contact Support
                <ArrowRight
                  size={16}
                  strokeWidth={2}
                  className='group-hover:translate-x-1 transition-transform'
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
