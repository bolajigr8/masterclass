'use client'

import { useEffect, useRef, useState } from 'react'
import {
  Zap,
  MapPin,
  Users,
  Percent,
  UserCheck,
  Building,
  House,
  Megaphone,
  Sparkles,
  Scale,
  Shield,
  Phone,
  ArrowRight,
  CircleCheckBig,
} from 'lucide-react'
import { useSmoothScroll } from '@/hooks/useSmoothScroll'

const packItems = [
  {
    number: '01',
    icon: MapPin,
    iconColor: '#0066FF',
    iconBgFrom: 'rgba(0, 102, 255, 0.125)',
    iconBgTo: 'rgba(0, 102, 255, 0.03)',
    glowColor: 'rgba(0, 102, 255, 0.19)',
    title: 'Curated JV Land',
    description:
      'Premium, vetted land parcels in high-growth corridors across global markets — pre-negotiated and ready for development.',
  },
  {
    number: '02',
    icon: Users,
    iconColor: '#c9a84c',
    iconBgFrom: 'rgba(201, 168, 76, 0.125)',
    iconBgTo: 'rgba(201, 168, 76, 0.03)',
    glowColor: 'rgba(201, 168, 76, 0.19)',
    title: 'Select Investors',
    description:
      'Direct access to a curated network of HNWIs, family offices, and institutional investors actively seeking JV opportunities.',
  },
  {
    number: '03',
    icon: Percent,
    iconColor: '#0066FF',
    iconBgFrom: 'rgba(0, 102, 255, 0.125)',
    iconBgTo: 'rgba(0, 102, 255, 0.03)',
    glowColor: 'rgba(0, 102, 255, 0.19)',
    title: '20–30% GDV Funding',
    description:
      'Structured funding covering 20–30% of Gross Development Value, enabling you to launch without full capital deployment.',
  },
  {
    number: '04',
    icon: UserCheck,
    iconColor: '#c9a84c',
    iconBgFrom: 'rgba(201, 168, 76, 0.125)',
    iconBgTo: 'rgba(201, 168, 76, 0.03)',
    glowColor: 'rgba(201, 168, 76, 0.19)',
    title: 'Proxy Team',
    description:
      'A dedicated team of professionals — architects, engineers, project managers — executing on your behalf across markets.',
  },
  {
    number: '05',
    icon: Building,
    iconColor: '#0066FF',
    iconBgFrom: 'rgba(0, 102, 255, 0.125)',
    iconBgTo: 'rgba(0, 102, 255, 0.03)',
    glowColor: 'rgba(0, 102, 255, 0.19)',
    title: 'Community Access',
    description:
      'Join an exclusive network of developers, investors, and entrepreneurs collaborating on deals and sharing insights globally.',
  },
  {
    number: '06',
    icon: House,
    iconColor: '#c9a84c',
    iconBgFrom: 'rgba(201, 168, 76, 0.125)',
    iconBgTo: 'rgba(201, 168, 76, 0.03)',
    glowColor: 'rgba(201, 168, 76, 0.19)',
    title: 'Stable Address (Workspace)',
    description:
      'Professional workspace and business address in premium locations — establishing credibility and operational presence.',
  },
  {
    number: '07',
    icon: Megaphone,
    iconColor: '#0066FF',
    iconBgFrom: 'rgba(0, 102, 255, 0.125)',
    iconBgTo: 'rgba(0, 102, 255, 0.03)',
    glowColor: 'rgba(0, 102, 255, 0.19)',
    title: 'Presale-Market Engine',
    description:
      'A complete go-to-market system for pre-selling units — marketing funnels, sales teams, and buyer acquisition infrastructure.',
  },
  {
    number: '08',
    icon: Sparkles,
    iconColor: '#c9a84c',
    iconBgFrom: 'rgba(201, 168, 76, 0.125)',
    iconBgTo: 'rgba(201, 168, 76, 0.03)',
    glowColor: 'rgba(201, 168, 76, 0.19)',
    title: 'High-Key Branding',
    description:
      'Premium brand identity, marketing collateral, digital presence, and positioning that commands investor and buyer confidence.',
  },
  {
    number: '09',
    icon: Scale,
    iconColor: '#0066FF',
    iconBgFrom: 'rgba(0, 102, 255, 0.125)',
    iconBgTo: 'rgba(0, 102, 255, 0.03)',
    glowColor: 'rgba(0, 102, 255, 0.19)',
    title: 'Legal Structuring',
    description:
      'Institutional-grade legal frameworks — JV agreements, SPVs, regulatory compliance, and asset protection across jurisdictions.',
  },
]

const trustItems = [
  'No upfront commitment',
  'Custom-tailored proposal',
  '24hr response time',
]

export default function JaaSActivationPack() {
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const { scrollTo } = useSmoothScroll()

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

  return (
    <section
      ref={ref}
      id='activation-pack'
      className='relative py-24 sm:py-32 overflow-hidden'
      style={{ background: '#070e1a' }}
    >
      {/* Background layers */}
      <div
        className='absolute inset-0'
        style={{
          background: 'linear-gradient(to bottom, #0a1628, #070e1a, #0a1628)',
        }}
      />
      <div
        className='absolute top-1/3 right-0 rounded-full pointer-events-none'
        style={{
          width: '500px',
          height: '500px',
          background:
            'linear-gradient(to bottom-left, rgba(201,168,76,0.05), transparent)',
          filter: 'blur(180px)',
        }}
      />
      <div
        className='absolute bottom-1/4 left-0 rounded-full pointer-events-none'
        style={{
          width: '400px',
          height: '400px',
          background:
            'linear-gradient(to top-right, rgba(0,102,255,0.05), transparent)',
          filter: 'blur(150px)',
        }}
      />

      <div className='relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        {/* Header */}
        <div
          className={`text-center mb-16 sm:mb-20 transition-all duration-700 ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <div
            className='inline-flex items-center gap-2 rounded-full px-5 py-2 mb-6'
            style={{
              background: 'rgba(255,255,255,0.04)',
              backdropFilter: 'blur(4px)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <Zap size={14} style={{ color: '#c9a84c' }} />
            <span
              className='text-xs sm:text-sm font-semibold tracking-wider uppercase'
              style={{ color: '#c9a84c' }}
            >
              Everything You Need to Launch
            </span>
          </div>

          <h2 className='text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight mb-4'>
            JaaS{' '}
            <span
              className='text-transparent bg-clip-text'
              style={{
                backgroundImage: 'linear-gradient(to right, #c9a84c, #e8d5a0)',
              }}
            >
              Activation Pack
            </span>
          </h2>
          <p className='text-white/40 text-base sm:text-lg mt-4 max-w-3xl mx-auto leading-relaxed'>
            The complete infrastructure package for aspiring and active real
            estate developers. Powered by Trila — a pioneer real estate
            infrastructure company empowering the new generation at global
            scale.
          </p>
        </div>

        {/* Cards Grid */}
        <div className='grid sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6 mb-16'>
          {packItems.map((item, i) => {
            const Icon = item.icon
            return (
              <div
                key={item.number}
                className={`group relative rounded-2xl p-7 transition-all duration-500 hover:-translate-y-1 cursor-default ${
                  visible
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-8'
                }`}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  backdropFilter: 'blur(4px)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  transitionDelay: `${200 + i * 60}ms`,
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget
                  el.style.background = 'rgba(255,255,255,0.06)'
                  el.style.border = '1px solid rgba(255,255,255,0.1)'
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget
                  el.style.background = 'rgba(255,255,255,0.03)'
                  el.style.border = '1px solid rgba(255,255,255,0.06)'
                }}
              >
                {/* Background number */}
                <span
                  className='absolute top-4 right-4 text-5xl font-extrabold select-none'
                  style={{ color: 'rgba(255,255,255,0.06)' }}
                >
                  {item.number}
                </span>

                {/* Icon */}
                <div
                  className='w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110'
                  style={{
                    background: `linear-gradient(135deg, ${item.iconBgFrom}, ${item.iconBgTo})`,
                  }}
                >
                  <Icon
                    size={22}
                    style={{ color: item.iconColor }}
                    strokeWidth={2}
                  />
                </div>

                {/* Title */}
                <h3 className='text-lg font-bold text-white mb-2'>
                  {item.title}
                </h3>

                {/* Description */}
                <p className='text-white/40 text-sm leading-relaxed'>
                  {item.description}
                </p>

                {/* Hover inset glow */}
                <div
                  className='absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none'
                  style={{
                    boxShadow: `${item.glowColor} 0px 0px 0px 1px inset`,
                  }}
                />
              </div>
            )
          })}
        </div>

        {/* CTA Card */}
        <div
          className={`max-w-4xl mx-auto transition-all duration-700 ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          style={{ transitionDelay: '800ms' }}
        >
          <div
            className='relative rounded-3xl overflow-hidden'
            style={{
              background: 'rgba(255,255,255,0.03)',
              backdropFilter: 'blur(4px)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            {/* Inner bg gradient */}
            <div
              className='absolute inset-0'
              style={{
                background:
                  'linear-gradient(to right, rgba(0,102,255,0.05), transparent, rgba(201,168,76,0.05))',
              }}
            />

            {/* Top gradient bar */}
            <div
              className='absolute top-0 left-0 right-0 h-px'
              style={{
                background:
                  'linear-gradient(to right, #0066FF, #c9a84c, #0066FF)',
              }}
            />

            <div className='relative p-8 sm:p-12 text-center'>
              {/* Badge */}
              <div
                className='inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-6'
                style={{
                  background: 'rgba(201,168,76,0.1)',
                  border: '1px solid rgba(201,168,76,0.2)',
                }}
              >
                <Shield size={14} style={{ color: '#c9a84c' }} />
                <span
                  className='text-xs font-semibold'
                  style={{ color: '#c9a84c' }}
                >
                  Custom Pricing — Tailored to Your Project
                </span>
              </div>

              <h3 className='text-2xl sm:text-3xl font-extrabold text-white mb-4'>
                Ready to Activate Your JaaS Pack?
              </h3>
              <p className='text-white/40 text-sm sm:text-base max-w-2xl mx-auto mb-8 leading-relaxed'>
                Every activation pack is customized based on your market,
                project scope, and development goals. Book a quick call with our
                team to discuss your specific requirements and get a tailored
                proposal.
              </p>

              {/* Buttons */}
              <div className='flex flex-col sm:flex-row items-center justify-center gap-4'>
                <button
                  className='group flex items-center gap-3 font-bold text-base px-10 py-4 rounded-full transition-all'
                  style={{
                    background: 'linear-gradient(to right, #c9a84c, #e8d5a0)',
                    color: '#0a1628',
                  }}
                  onClick={() => scrollTo('reserve-access')}
                  onMouseEnter={(e) => {
                    ;(e.currentTarget as HTMLButtonElement).style.background =
                      'linear-gradient(to right, #b8933f, #c9a84c)'
                    ;(e.currentTarget as HTMLButtonElement).style.boxShadow =
                      '0 25px 50px rgba(201,168,76,0.2)'
                  }}
                  onMouseLeave={(e) => {
                    ;(e.currentTarget as HTMLButtonElement).style.background =
                      'linear-gradient(to right, #c9a84c, #e8d5a0)'
                    ;(e.currentTarget as HTMLButtonElement).style.boxShadow =
                      'none'
                  }}
                >
                  <Phone size={18} strokeWidth={2} />
                  Book a Quick Call
                  <ArrowRight
                    size={18}
                    strokeWidth={2}
                    className='group-hover:translate-x-1 transition-transform'
                  />
                </button>

                <button
                  className='group flex items-center gap-2 font-medium text-sm px-8 py-4 rounded-full transition-all text-white/70 hover:text-white'
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                  onClick={() => scrollTo('reserve-access')}
                  onMouseEnter={(e) => {
                    ;(e.currentTarget as HTMLButtonElement).style.background =
                      'rgba(255,255,255,0.1)'
                  }}
                  onMouseLeave={(e) => {
                    ;(e.currentTarget as HTMLButtonElement).style.background =
                      'rgba(255,255,255,0.04)'
                  }}
                >
                  Or send us a message
                  <ArrowRight
                    size={14}
                    strokeWidth={2}
                    className='group-hover:translate-x-1 transition-transform'
                  />
                </button>
              </div>

              {/* Trust row */}
              <div
                className='flex flex-wrap items-center justify-center gap-6 mt-8 pt-8'
                style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
              >
                {trustItems.map((item) => (
                  <div
                    key={item}
                    className='flex items-center gap-2 text-xs text-white/30'
                  >
                    <CircleCheckBig
                      size={14}
                      strokeWidth={2}
                      className='text-green-500/60'
                    />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
