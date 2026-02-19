'use client'

import { useEffect, useRef, useState } from 'react'
import { Check, ArrowRight, Shield, Zap, Crown } from 'lucide-react'
import type { ProductType } from '@/lib/validations'
import EnrollmentModal from './enrollment-modal'

const plans: {
  id: string
  icon: React.ElementType
  iconBg: string
  iconColor: string
  name: string
  type: string
  price: string
  currency: string
  naira: string
  features: string[]
  cta: string
  featured: boolean
  badge: string | null
  product: ProductType
}[] = [
  {
    id: 'virtual',
    icon: Zap,
    iconBg: 'bg-[#1a2a4a]',
    iconColor: 'text-[#4a9eff]',
    name: 'Virtual Masterclass',
    type: '4 × 90-min Zoom Sessions',
    price: '$260',
    currency: 'USD',
    naira: '₦150,000 NGN',
    features: [
      '4 live 90-minute Zoom sessions',
      'Full session recordings & replays',
      'Live Q&A with Femi Olawale',
      'Trila University library access',
      'Certificate of Completion',
      'Private Discord community',
      'Deal analysis templates',
    ],
    cta: 'Join Virtual Series',
    featured: false,
    badge: null,
    product: 'Virtual Masterclass',
  },
  {
    id: 'signature',
    icon: Crown,
    iconBg: 'bg-[#2a1f0a]',
    iconColor: 'text-[#d4a422]',
    name: 'Signature Live Masterclass',
    type: '2-Day In-Person Experience',
    price: '$650',
    currency: 'USD',
    naira: '₦450,000 NGN',
    features: [
      'Full 2-day in-person masterclass',
      'Lagos, Dubai, Singapore, or London',
      'Complete session recordings',
      'Exclusive alumni network access',
      'Trila University lifetime access',
      'Certificate of Completion',
      'Networking dinner & cocktails',
      'JaaS deal structuring workshop',
      '1 bonus 30-min strategy call',
    ],
    cta: 'Secure Your Seat',
    featured: true,
    badge: 'MOST POPULAR — LIMITED SEATS',
    product: 'Signature Live Masterclass',
  },
  {
    id: 'consulting',
    icon: Shield,
    iconBg: 'bg-[#0d1f3a]',
    iconColor: 'text-[#4a9eff]',
    name: 'Private JaaS Consulting',
    type: '1-on-1 Strategy Session',
    price: '$500+',
    currency: 'USD',
    naira: '₦350,000 NGN',
    features: [
      'Personal 1-on-1 Zoom session',
      'Custom project strategy review',
      'JaaS deal structuring advice',
      'Funding & investor introductions',
      'Legal & compliance guidance',
      'Trila University lifetime access',
      'Certificate of Completion',
      'Follow-up email support (30 days)',
    ],
    cta: 'Book Consulting Call',
    featured: false,
    badge: null,
    product: 'Private JaaS Consulting',
  },
]

export default function Pricing() {
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<ProductType>(
    'Virtual Masterclass',
  )

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true)
      },
      { threshold: 0.08 },
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  const handlePlanClick = (product: ProductType) => {
    setSelectedProduct(product)
    setModalOpen(true)
  }

  return (
    <>
      <section
        ref={ref}
        id='pricing'
        className='relative bg-[#050b18] w-full py-20 lg:py-28 px-5 overflow-hidden'
      >
        {/* Background glow */}
        <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-175 h-125 bg-[#2563eb]/5 rounded-full blur-[150px] pointer-events-none' />

        <div className='max-w-300 mx-auto'>
          {/* Header */}
          <div
            className={`text-center mb-14 transition-all duration-700 ${
              visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
          >
            <p className='text-[11px] font-bold tracking-[0.2em] text-[#d4a422] uppercase mb-4'>
              Investment in Your Future
            </p>
            <h2
              className='font-extrabold text-white leading-tight'
              style={{ fontSize: 'clamp(32px, 5vw, 56px)' }}
            >
              Choose Your Path
            </h2>
            <p className='mt-4 text-[15px] text-white/50 max-w-130 mx-auto leading-relaxed'>
              Every tier includes lifetime access to Trila University,
              certificate of completion, and private community membership.
            </p>
          </div>

          {/* Cards */}
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch'>
            {plans.map((plan, i) => {
              const Icon = plan.icon
              return (
                <div
                  key={plan.id}
                  className={`relative flex flex-col rounded-2xl border transition-all duration-700 ${
                    plan.featured
                      ? 'border-[#d4a422]/50 bg-[#0f1b30]'
                      : 'border-white/8 bg-[#0b1628]/80'
                  } ${
                    visible
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 translate-y-10'
                  }`}
                  style={{ transitionDelay: `${200 + i * 100}ms` }}
                >
                  {plan.badge && (
                    <div className='absolute -top-px left-1/2 -translate-x-1/2 w-[calc(100%-2px)]'>
                      <div className='bg-[#d4a422] text-[#0a0800] text-[11px] font-black tracking-[0.12em] text-center py-2.5 rounded-t-2xl'>
                        {plan.badge}
                      </div>
                    </div>
                  )}

                  <div className='p-6 lg:p-7 flex flex-col gap-6 flex-1 pt-14 lg:pt-16'>
                    {/* Icon + Name */}
                    <div className='flex items-start gap-3'>
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${plan.iconBg}`}
                      >
                        <Icon size={18} className={plan.iconColor} />
                      </div>
                      <div>
                        <h3 className='text-white font-bold text-[16px] leading-snug'>
                          {plan.name}
                        </h3>
                        <p className='text-white/40 text-[12px] mt-0.5'>
                          {plan.type}
                        </p>
                      </div>
                    </div>

                    {/* Price */}
                    <div>
                      <div className='flex items-end gap-2'>
                        <span
                          className='font-extrabold text-white leading-none'
                          style={{ fontSize: 'clamp(38px, 5vw, 52px)' }}
                        >
                          {plan.price}
                        </span>
                        <span className='text-white/40 text-[13px] font-medium mb-2'>
                          {plan.currency}
                        </span>
                      </div>
                      <p className='text-white/35 text-[12px] mt-1'>
                        {plan.naira}
                      </p>
                    </div>

                    <div className='border-t border-white/8' />

                    {/* Features */}
                    <ul className='flex flex-col gap-3 flex-1'>
                      {plan.features.map((feat) => (
                        <li key={feat} className='flex items-start gap-2.5'>
                          <Check
                            size={15}
                            className='text-[#2563eb] shrink-0 mt-0.5'
                          />
                          <span className='text-white/65 text-[13.5px] leading-snug'>
                            {feat}
                          </span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA — now opens modal */}
                    <button
                      onClick={() => handlePlanClick(plan.product)}
                      className={`group flex items-center justify-center gap-2.5 font-bold text-[14px] px-6 py-3.5 rounded-full transition-all duration-300 active:scale-[0.97] mt-auto ${
                        plan.featured
                          ? 'bg-[#d4a422] hover:bg-[#c49510] text-[#0a0800] hover:shadow-[0_0_24px_rgba(212,164,34,0.4)]'
                          : 'bg-[#2563eb] hover:bg-[#1d4ed8] text-white hover:shadow-[0_0_24px_rgba(37,99,235,0.4)]'
                      }`}
                    >
                      {plan.cta}
                      <ArrowRight
                        size={15}
                        className='transition-transform duration-200 group-hover:translate-x-1'
                      />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Guarantee */}
          <div
            className={`flex items-center justify-center gap-2.5 mt-10 transition-all duration-700 ${
              visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{ transitionDelay: '600ms' }}
          >
            <div className='flex items-center gap-2.5 px-5 py-3 rounded-full border border-white/10 bg-[#0d1a2e]/60 backdrop-blur-sm'>
              <Shield size={15} className='text-white/40 shrink-0' />
              <span className='text-[13px] text-white/45'>
                30-day money-back guarantee · No questions asked · Cancel
                anytime
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Enrollment Modal */}
      <EnrollmentModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialProduct={selectedProduct}
      />
    </>
  )
}
