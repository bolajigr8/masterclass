'use client'

import { useSmoothScroll } from '@/hooks/useSmoothScroll'
import {
  Building2,
  Handshake,
  Globe,
  Target,
  Layers,
  Zap,
  ArrowRight,
} from 'lucide-react'

const stats = [
  {
    value: '200K+',
    label: 'Global Community',
    sublabel: 'Developers, Startups & HNWIs',
  },
  {
    value: '₦1.2T+',
    label: 'GDV Facilitated',
    sublabel: 'Across 10+ Countries',
  },
  {
    value: '202+',
    label: 'Projects Structured',
    sublabel: 'Africa, Middle East & Europe',
  },
  {
    value: '15+',
    label: 'Years Combined',
    sublabel: 'Leadership Experience',
  },
]

const jaasFeatures = [
  {
    icon: (
      <Target className='w-5.5 h-5.5' style={{ color: 'rgb(0, 102, 255)' }} />
    ),
    iconBg:
      'linear-gradient(135deg, rgba(0, 102, 255, 0.125), rgba(0, 102, 255, 0.03))',
    title: 'Deal Sourcing & Structuring',
    description:
      'Curated JV land, premium off-market deals, and institutional-grade legal structuring across 10+ global markets.',
  },
  {
    icon: (
      <Layers className='w-5.5 h-5.5' style={{ color: 'rgb(201, 168, 76)' }} />
    ),
    iconBg:
      'linear-gradient(135deg, rgba(201, 168, 76, 0.125), rgba(201, 168, 76, 0.03))',
    title: 'Capital & Funding Access',
    description:
      '20–100% GDV funding through our network of select investors, family offices, and institutional partners.',
  },
  {
    icon: <Zap className='w-5.5 h-5.5' style={{ color: 'rgb(0, 102, 255)' }} />,
    iconBg:
      'linear-gradient(135deg, rgba(0, 102, 255, 0.125), rgba(0, 102, 255, 0.03))',
    title: 'Execution Infrastructure',
    description:
      'Proxy development teams, presale-market engines, high-key branding, and end-to-end project management.',
  },
  {
    icon: (
      <Globe className='w-5.5 h-5.5' style={{ color: 'rgb(201, 168, 76)' }} />
    ),
    iconBg:
      'linear-gradient(135deg, rgba(201, 168, 76, 0.125), rgba(201, 168, 76, 0.03))',
    title: 'Community & Scale',
    description:
      'A global community of developers, stable workspace addresses, alumni network, and the JaaS Accelerator program.',
  },
]

export default function AboutSection() {
  const { scrollTo } = useSmoothScroll()

  return (
    <section
      id='about'
      className='relative bg-[#070e1a] py-24 sm:py-32 overflow-hidden'
    >
      {/* Background gradients */}
      <div className='absolute inset-0 bg-linear-to-b from-[#0a1628] via-[#070e1a] to-[#0a1628]' />
      <div className='absolute top-0 right-0 w-125 h-125 bg-linear-to-bl from-[#0066FF]/8 to-transparent rounded-full blur-[150px]' />
      <div className='absolute bottom-0 left-0 w-100 h-100 bg-linear-to-tr from-[#c9a84c]/6 to-transparent rounded-full blur-[120px]' />

      <div className='relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        {/* Header */}
        <div className='text-center mb-16 sm:mb-20'>
          <p className='text-[#c9a84c] text-xs sm:text-sm font-semibold tracking-[0.2em] uppercase mb-4'>
            About Us
          </p>
          <h2 className='text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight mb-4'>
            Trila{' '}
            <span className='text-transparent bg-clip-text bg-linear-to-r from-[#0066FF] via-[#3399ff] to-[#0066FF]'>
              x
            </span>{' '}
            JaaS
          </h2>
          <p className='text-white/40 text-base sm:text-lg mt-4 max-w-3xl mx-auto leading-relaxed'>
            Trila is a pioneer real estate infrastructure company empowering the
            new generation of entrepreneurs and developers at global scale with{' '}
            <span className='text-[#c9a84c] font-semibold'>
              fractional ownership
            </span>
            ,{' '}
            <span className='text-[#c9a84c] font-semibold'>
              short-term rentals (STR)
            </span>
            , and{' '}
            <span className='text-[#c9a84c] font-semibold'>
              Joint-Venture-as-a-Service (JaaS)
            </span>
            .
          </p>
        </div>

        {/* Main Grid */}
        <div className='grid lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-20'>
          {/* Left Column */}
          <div className='space-y-6'>
            {/* Trila Vision Card */}
            <div className='bg-white/3 backdrop-blur-sm border border-white/6 rounded-2xl p-8 border-l-4 border-l-[#0066FF]'>
              <h3 className='text-xl font-bold text-white mb-3 flex items-center gap-3'>
                <Building2 className='w-5.5 h-5.5 text-[#0066FF]' />
                The Trila Vision
              </h3>
              <p className='text-white/50 text-sm leading-relaxed'>
                Founded to bridge the gap between aspiring developers and the
                $300 trillion global real estate market, Trila provides the
                infrastructure, capital access, and strategic partnerships
                needed to build, invest, and scale in real estate — without the
                traditional barriers of entry. Through fractional ownership, STR
                models, and JaaS, we believe that geography, capital, or
                connections should never limit ambition.
              </p>
            </div>

            {/* What is JaaS Card */}
            <div className='bg-white/3 backdrop-blur-sm border border-white/6 rounded-2xl p-8 border-l-4 border-l-[#c9a84c]'>
              <h3 className='text-xl font-bold text-white mb-3 flex items-center gap-3'>
                <Handshake className='w-5.5 h-5.5 text-[#c9a84c]' />
                What is JaaS?
              </h3>
              <p className='text-white/50 text-sm leading-relaxed'>
                Joint-Venture-as-a-Service (JaaS) is Trila&apos;s proprietary
                framework that packages everything an entrepreneur needs to
                become a real estate developer or global landlord: curated land,
                investor matching, GDV funding (20–100%), proxy teams, legal
                structuring, branding, and presale market engines — all
                delivered as a turnkey service.
              </p>
            </div>

            {/* Global Reach Card */}
            <div className='bg-white/3 backdrop-blur-sm border border-white/6 rounded-2xl p-8 border-l-4 border-l-[#0066FF]'>
              <h3 className='text-xl font-bold text-white mb-3 flex items-center gap-3'>
                <Globe className='w-5.5 h-5.5 text-[#0066FF]' />
                Global Reach, Local Impact
              </h3>
              <p className='text-white/50 text-sm leading-relaxed'>
                Operating across Lagos, Dubai, Singapore, London, New York,
                Toronto, Abuja, Accra, Nairobi, and Johannesburg — Trila
                connects a global network of 200,000+ developers, startups,
                HNWIs, and organizations to premium real estate opportunities
                through fractional ownership, STR, and JaaS worldwide.
              </p>
            </div>
          </div>

          {/* Right Column */}
          <div className='space-y-6'>
            <h3 className='text-2xl font-bold text-white mb-8'>
              The JaaS{' '}
              <span className='text-transparent bg-clip-text bg-linear-to-r from-[#c9a84c] to-[#e8d5a0]'>
                Ecosystem
              </span>
            </h3>

            {jaasFeatures.map((feature, index) => (
              <div
                key={index}
                className='group flex items-start gap-5 bg-white/3 backdrop-blur-sm border border-white/6 rounded-xl p-6 hover:bg-white/6 hover:border-white/10 transition-all duration-300'
              >
                <div
                  className='w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110'
                  style={{ background: feature.iconBg }}
                >
                  {feature.icon}
                </div>
                <div>
                  <h4 className='text-white font-semibold text-base mb-1'>
                    {feature.title}
                  </h4>
                  <p className='text-white/40 text-sm leading-relaxed'>
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}

            {/* Learn More Button */}
            <button
              onClick={() => scrollTo('programme')}
              className='group mt-4 inline-flex items-center gap-2 text-[#0066FF] font-semibold text-sm hover:text-[#3399ff] transition-colors'
            >
              Learn more about partnering with Trila
              <ArrowRight className='w-4 h-4 group-hover:translate-x-1 transition-transform' />
            </button>
          </div>
        </div>

        {/* Stats Bar */}
        <div className='bg-linear-to-r from-white/3 via-white/5 to-white/3 backdrop-blur-sm border border-white/6 rounded-2xl p-8 sm:p-10'>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-8 text-center'>
            {stats.map((stat, index) => (
              <div key={index}>
                <p className='text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-[#c9a84c] to-[#e8d5a0]'>
                  {stat.value}
                </p>
                <p className='text-white text-sm font-medium mt-1'>
                  {stat.label}
                </p>
                <p className='text-white/30 text-xs mt-0.5'>{stat.sublabel}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
