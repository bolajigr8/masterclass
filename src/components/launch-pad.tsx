'use client'

import { useEffect, useRef, useState } from 'react'
import {
  Rocket,
  Users,
  Target,
  Star,
  Clock,
  Zap,
  Layers,
  TrendingUp,
  Shield,
  CircleCheckBig,
  Phone,
  ArrowRight,
} from 'lucide-react'

const highlights = [
  { icon: Users, label: 'Private Coaching', sub: '1-on-1 & Group' },
  { icon: Target, label: 'Strategic Consulting', sub: 'Tailored Plans' },
  { icon: Star, label: 'Equipping', sub: 'Tools & Frameworks' },
  { icon: Clock, label: 'Ongoing Support', sub: 'Continuous Access' },
]

const pillars = [
  {
    key: 'speed',
    icon: Zap,
    iconColor: '#0066FF',
    iconBgFrom: 'rgba(0, 102, 255, 0.145)',
    iconBgTo: 'rgba(0, 102, 255, 0.03)',
    // ✅ rgba gradient for the content panel background
    bgGradient: 'rgba(0, 102, 255, 0.22), rgba(0, 102, 255, 0.05)',
    borderColor: 'rgba(0, 102, 255, 0.25)',
    label: 'Speed',
    sub: 'Accelerate Your Timeline',
    content:
      'Compress years of trial-and-error into weeks. Our proven frameworks, templates, and direct mentorship fast-track your journey from idea to execution — launching projects in record time.',
  },
  {
    key: 'strategy',
    icon: Target,
    iconColor: '#c9a84c',
    iconBgFrom: 'rgba(201, 168, 76, 0.145)',
    iconBgTo: 'rgba(201, 168, 76, 0.03)',
    bgGradient: 'rgba(201, 168, 76, 0.22), rgba(201, 168, 76, 0.05)',
    borderColor: 'rgba(201, 168, 76, 0.25)',
    label: 'Strategy',
    sub: 'Precision Market Positioning',
    content:
      'Deploy data-driven strategies that position you ahead of the competition. From market analysis to go-to-market execution, master the art of calculated moves that compound over time.',
  },
  {
    key: 'structure',
    icon: Layers,
    iconColor: '#0066FF',
    iconBgFrom: 'rgba(0, 102, 255, 0.145)',
    iconBgTo: 'rgba(0, 102, 255, 0.03)',
    bgGradient: 'rgba(0, 102, 255, 0.22), rgba(0, 102, 255, 0.05)',
    borderColor: 'rgba(0, 102, 255, 0.25)',
    label: 'Structure',
    sub: 'Build to Scale',
    content:
      'Establish institutional-grade frameworks for your business — legal structures, operational systems, and governance models that attract serious investors and partners.',
  },
  {
    key: 'sustainability',
    icon: TrendingUp,
    iconColor: '#c9a84c',
    iconBgFrom: 'rgba(201, 168, 76, 0.145)',
    iconBgTo: 'rgba(201, 168, 76, 0.03)',
    bgGradient: 'rgba(201, 168, 76, 0.22), rgba(201, 168, 76, 0.05)',
    borderColor: 'rgba(201, 168, 76, 0.25)',
    label: 'Sustainability',
    sub: 'Long-Term Growth Engine',
    content:
      'Design business models with built-in longevity. Learn how to create recurring revenue streams, reinvestment cycles, and resilient portfolios that grow through any market condition.',
  },
  {
    key: 'stability',
    icon: Shield,
    iconColor: '#0066FF',
    iconBgFrom: 'rgba(0, 102, 255, 0.145)',
    iconBgTo: 'rgba(0, 102, 255, 0.03)',
    bgGradient: 'rgba(0, 102, 255, 0.22), rgba(0, 102, 255, 0.05)',
    borderColor: 'rgba(0, 102, 255, 0.25)',
    label: 'Stability',
    sub: 'Resilient Foundations',
    content:
      'Fortify your ventures against volatility. Master risk management, capital preservation, and defensive structuring that protects your assets and reputation across global markets.',
  },
]

const entrepreneurItems = [
  'First-time founders seeking structured guidance',
  'Scaling entrepreneurs hitting growth plateaus',
  'Real estate developers entering new markets',
  'Tech founders pivoting to property development',
  'Diaspora entrepreneurs building back home',
]

const organizationItems = [
  'Startups building real estate verticals',
  'Investment firms exploring JV structures',
  'Corporate teams entering property development',
  'NGOs and cooperatives seeking asset growth',
  'Family offices diversifying into real estate',
]

const trustItems = [
  'Free discovery call',
  'Personalized roadmap',
  'Flexible engagement',
]

export default function Launchpad() {
  const [visible, setVisible] = useState(false)
  const [activePillar, setActivePillar] = useState(0)
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

  const active = pillars[activePillar]
  const ActiveIcon = active.icon

  return (
    <section
      ref={ref}
      id='launchpad'
      className='relative py-24 sm:py-32 overflow-hidden'
      style={{ background: '#0a1628' }}
    >
      {/* Background layers */}
      <div
        className='absolute inset-0'
        style={{
          background: 'linear-gradient(to bottom, #070e1a, #0a1628, #070e1a)',
        }}
      />
      <div
        className='absolute top-1/4 left-1/4 rounded-full pointer-events-none'
        style={{
          width: '500px',
          height: '500px',
          background:
            'linear-gradient(to bottom-right, rgba(0,102,255,0.05), transparent)',
          filter: 'blur(200px)',
        }}
      />
      <div
        className='absolute bottom-1/3 right-1/4 rounded-full pointer-events-none'
        style={{
          width: '400px',
          height: '400px',
          background:
            'linear-gradient(to top-left, rgba(201,168,76,0.05), transparent)',
          filter: 'blur(180px)',
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
            <Rocket size={14} style={{ color: '#0066FF' }} />
            <span
              className='text-xs sm:text-sm font-semibold tracking-wider uppercase'
              style={{ color: '#0066FF' }}
            >
              Private Programme
            </span>
          </div>

          <h2 className='text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight mb-4'>
            The{' '}
            <span
              className='text-transparent bg-clip-text'
              style={{
                backgroundImage: 'linear-gradient(to right, #0066FF, #3399ff)',
              }}
            >
              Launchpad
            </span>
          </h2>
          <p className='text-white/40 text-base sm:text-lg mt-4 max-w-3xl mx-auto leading-relaxed'>
            A private coaching, consulting, and equipping programme designed to
            empower entrepreneurs and organizations with the{' '}
            <span className='text-white/60 font-medium'>
              speed, strategy, structure, sustainability, and stability
            </span>{' '}
            needed to dominate their markets — powered by Trila's pioneer real
            estate infrastructure.
          </p>
        </div>

        {/* Highlight Pills */}
        <div
          className={`grid grid-cols-2 md:grid-cols-4 gap-4 mb-16 max-w-4xl mx-auto transition-all duration-700 ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          style={{ transitionDelay: '150ms' }}
        >
          {highlights.map((h) => {
            const Icon = h.icon
            return (
              <div
                key={h.label}
                className='rounded-xl p-5 text-center transition-all'
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  backdropFilter: 'blur(4px)',
                  border: '1px solid rgba(255,255,255,0.06)',
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
                <Icon
                  size={22}
                  className='mx-auto mb-3'
                  style={{ color: '#0066FF' }}
                />
                <p className='text-white text-sm font-semibold'>{h.label}</p>
                <p className='text-white/30 text-xs mt-0.5'>{h.sub}</p>
              </div>
            )
          })}
        </div>

        {/* 5 Pillars */}
        <div
          className={`grid lg:grid-cols-12 gap-8 mb-16 transition-all duration-700 ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          style={{ transitionDelay: '250ms' }}
        >
          {/* Pillar list */}
          <div className='lg:col-span-4 space-y-2'>
            <h3 className='text-lg font-bold text-white mb-4 flex items-center gap-2'>
              <span
                className='w-8 h-0.5 rounded-full'
                style={{
                  background: 'linear-gradient(to right, #0066FF, #3399ff)',
                }}
              />
              The 5 Pillars
            </h3>
            {pillars.map((pillar, i) => {
              const PillarIcon = pillar.icon
              const isActive = activePillar === i
              return (
                <button
                  key={pillar.key}
                  onClick={() => setActivePillar(i)}
                  className='w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all duration-300'
                  style={{
                    background: isActive
                      ? 'rgba(255,255,255,0.06)'
                      : 'transparent',
                    border: isActive
                      ? `1px solid rgba(255,255,255,0.1)`
                      : '1px solid transparent',
                    borderLeft: isActive
                      ? `2px solid ${pillar.iconColor}`
                      : '2px solid transparent',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive)
                      (e.currentTarget as HTMLButtonElement).style.background =
                        'rgba(255,255,255,0.03)'
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive)
                      (e.currentTarget as HTMLButtonElement).style.background =
                        'transparent'
                  }}
                >
                  <div
                    className='w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-all'
                    style={{
                      background: `linear-gradient(135deg, ${isActive ? pillar.iconBgFrom.replace('0.145', '0.2') : pillar.iconBgFrom}, ${pillar.iconBgTo})`,
                      transform: isActive ? 'scale(1.1)' : 'scale(1)',
                    }}
                  >
                    <PillarIcon
                      size={18}
                      style={{ color: pillar.iconColor }}
                      strokeWidth={2}
                    />
                  </div>
                  <div>
                    <p
                      className='font-semibold text-sm transition-colors'
                      style={{
                        color: isActive ? '#fff' : 'rgba(255,255,255,0.5)',
                      }}
                    >
                      {pillar.label}
                    </p>
                    <p
                      className='text-xs transition-colors'
                      style={{
                        color: isActive
                          ? 'rgba(255,255,255,0.4)'
                          : 'rgba(255,255,255,0.2)',
                      }}
                    >
                      {pillar.sub}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Pillar content panel */}
          <div className='lg:col-span-8'>
            <div
              className='rounded-2xl p-8 sm:p-10 h-full flex flex-col justify-center'
              style={{
                background: 'rgba(255,255,255,0.03)',
                backdropFilter: 'blur(4px)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              {/* ✅ FIX: use active.bgGradient (rgba) instead of hex+alpha suffix */}
              <div
                className='rounded-2xl p-8 sm:p-10 mb-6 transition-all duration-500'
                style={{
                  background: `linear-gradient(135deg, ${active.bgGradient})`,
                  border: `1px solid ${active.borderColor}`,
                }}
              >
                <div className='flex items-center gap-4 mb-6'>
                  <div
                    className='w-14 h-14 rounded-xl flex items-center justify-center'
                    style={{
                      background: `linear-gradient(135deg, ${active.iconBgFrom.replace('0.145', '0.25')}, ${active.iconBgTo.replace('0.03', '0.08')})`,
                    }}
                  >
                    <ActiveIcon
                      size={28}
                      style={{ color: active.iconColor }}
                      strokeWidth={2}
                    />
                  </div>
                  <div>
                    <h3 className='text-2xl font-extrabold text-white'>
                      {active.label}
                    </h3>
                    <p
                      className='text-sm font-medium'
                      style={{ color: active.iconColor }}
                    >
                      {active.sub}
                    </p>
                  </div>
                </div>
                <p className='text-white/70 text-base leading-relaxed'>
                  {active.content}
                </p>
              </div>

              {/* Dot indicators */}
              <div className='flex items-center justify-center gap-3'>
                {pillars.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => setActivePillar(i)}
                    className='h-2.5 rounded-full transition-all duration-300'
                    style={{
                      width: activePillar === i ? '32px' : '10px',
                      background:
                        activePillar === i
                          ? `linear-gradient(90deg, ${pillars[i].iconColor}, ${pillars[i].iconColor}80)`
                          : 'rgba(255,255,255,0.1)',
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* For Entrepreneurs / For Organizations */}
        <div
          className={`grid md:grid-cols-2 gap-6 mb-16 max-w-5xl mx-auto transition-all duration-700 ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          style={{ transitionDelay: '400ms' }}
        >
          {/* Entrepreneurs */}
          <div
            className='rounded-2xl p-8'
            style={{
              background: 'rgba(255,255,255,0.03)',
              backdropFilter: 'blur(4px)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <h4 className='text-lg font-bold text-white mb-4 flex items-center gap-2'>
              <Users size={18} style={{ color: '#0066FF' }} />
              For Entrepreneurs
            </h4>
            <ul className='space-y-3'>
              {entrepreneurItems.map((item) => (
                <li
                  key={item}
                  className='flex items-start gap-3 text-white/50 text-sm'
                >
                  <CircleCheckBig
                    size={16}
                    strokeWidth={2}
                    className='shrink-0 mt-0.5'
                    style={{ color: 'rgba(0,102,255,0.6)' }}
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Organizations */}
          <div
            className='rounded-2xl p-8'
            style={{
              background: 'rgba(255,255,255,0.03)',
              backdropFilter: 'blur(4px)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <h4 className='text-lg font-bold text-white mb-4 flex items-center gap-2'>
              <Layers size={18} style={{ color: '#c9a84c' }} />
              For Organizations
            </h4>
            <ul className='space-y-3'>
              {organizationItems.map((item) => (
                <li
                  key={item}
                  className='flex items-start gap-3 text-white/50 text-sm'
                >
                  <CircleCheckBig
                    size={16}
                    strokeWidth={2}
                    className='shrink-0 mt-0.5'
                    style={{ color: 'rgba(201,168,76,0.6)' }}
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* CTA Card */}
        <div
          className={`max-w-4xl mx-auto transition-all duration-700 ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          style={{ transitionDelay: '550ms' }}
        >
          <div
            className='relative rounded-3xl overflow-hidden'
            style={{
              background: 'rgba(255,255,255,0.03)',
              backdropFilter: 'blur(4px)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            {/* Top gradient bar */}
            <div
              className='absolute top-0 left-0 right-0 h-px'
              style={{
                background:
                  'linear-gradient(to right, #0066FF, #c9a84c, #0066FF)',
              }}
            />
            {/* Inner bg gradient */}
            <div
              className='absolute inset-0'
              style={{
                background:
                  'linear-gradient(to right, rgba(0,102,255,0.05), transparent, rgba(201,168,76,0.05))',
              }}
            />

            <div className='relative p-8 sm:p-12 text-center'>
              {/* Badge */}
              <div
                className='inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-6'
                style={{
                  background: 'rgba(0,102,255,0.1)',
                  border: '1px solid rgba(0,102,255,0.2)',
                }}
              >
                <Rocket size={14} style={{ color: '#0066FF' }} />
                <span
                  className='text-xs font-semibold'
                  style={{ color: '#0066FF' }}
                >
                  Custom Pricing — Based on Your Goals
                </span>
              </div>

              <h3 className='text-2xl sm:text-3xl font-extrabold text-white mb-4'>
                Ready to Launch?
              </h3>
              <p className='text-white/40 text-sm sm:text-base max-w-2xl mx-auto mb-8 leading-relaxed'>
                The Launchpad programme is tailored to your specific
                entrepreneurial journey, goals, and timeline. Book a quick call
                to explore how we can accelerate your success.
              </p>

              {/* Buttons */}
              <div className='flex flex-col sm:flex-row items-center justify-center gap-4'>
                <button
                  className='group flex items-center gap-3 font-bold text-base px-10 py-4 rounded-full transition-all text-white'
                  style={{
                    background: 'linear-gradient(to right, #0066FF, #0052cc)',
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLButtonElement
                    el.style.background =
                      'linear-gradient(to right, #0052cc, #003d99)'
                    el.style.boxShadow = '0 25px 50px rgba(0,102,255,0.3)'
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLButtonElement
                    el.style.background =
                      'linear-gradient(to right, #0066FF, #0052cc)'
                    el.style.boxShadow = 'none'
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
                  onMouseEnter={(e) => {
                    ;(e.currentTarget as HTMLButtonElement).style.background =
                      'rgba(255,255,255,0.1)'
                  }}
                  onMouseLeave={(e) => {
                    ;(e.currentTarget as HTMLButtonElement).style.background =
                      'rgba(255,255,255,0.04)'
                  }}
                >
                  Learn more about the programme
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
