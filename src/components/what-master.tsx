'use client'

import { useEffect, useRef, useState } from 'react'
import {
  Building2,
  Handshake,
  Globe,
  Coins,
  Shield,
  GraduationCap,
} from 'lucide-react'

const modules = [
  {
    icon: Building2,
    iconColor: '#0066FF',
    title: 'Zero-Up Mastery',
    subtitle: 'Own Premium Property with Zero Upfront Capital',
    subtitleColor: '#0066FF',
    description:
      'Learn the exact frameworks to acquire, develop, and profit from premium real estate without deploying your own capital. Master creative financing, JV structures, and institutional-grade deal sourcing.',
    glowColor: 'rgba(0, 102, 255, 0.19)',
    iconBgFrom: 'rgba(0, 102, 255, 0.125)',
    iconBgTo: 'rgba(0, 102, 255, 0.03)',
  },
  {
    icon: Handshake,
    iconColor: '#c9a84c',
    title: 'JaaS Blueprint',
    subtitle: 'Joint-Venture-as-a-Service',
    subtitleColor: '#c9a84c',
    description:
      'Raise 20–100% GDV funding, secure premium land, structure win-win deals, tokenize assets, and sell globally. The complete playbook for modern real estate entrepreneurs.',
    glowColor: 'rgba(201, 168, 76, 0.19)',
    iconBgFrom: 'rgba(201, 168, 76, 0.125)',
    iconBgTo: 'rgba(201, 168, 76, 0.03)',
  },
  {
    icon: Globe,
    iconColor: '#0066FF',
    title: 'Global Network',
    subtitle: 'Connect Across 10+ Major Cities',
    subtitleColor: '#0066FF',
    description:
      'Access a curated network of developers, landowners, institutional investors, and HNWIs across Lagos, Dubai, Singapore, London, New York, Toronto, and beyond.',
    glowColor: 'rgba(0, 102, 255, 0.19)',
    iconBgFrom: 'rgba(0, 102, 255, 0.125)',
    iconBgTo: 'rgba(0, 102, 255, 0.03)',
  },
  {
    icon: Coins,
    iconColor: '#c9a84c',
    title: 'Fractional Ownership & STR',
    subtitle: 'Fractional Ownership & Short-Term Rentals',
    subtitleColor: '#c9a84c',
    description:
      'Understand fractional ownership structures, short-term rental (STR) models, and how to create globally tradeable property assets for maximum returns.',
    glowColor: 'rgba(201, 168, 76, 0.19)',
    iconBgFrom: 'rgba(201, 168, 76, 0.125)',
    iconBgTo: 'rgba(201, 168, 76, 0.03)',
  },
  {
    icon: Shield,
    iconColor: '#0066FF',
    title: 'Risk Management',
    subtitle: 'Institutional-Grade Protection',
    subtitleColor: '#0066FF',
    description:
      'Learn due diligence frameworks, legal structuring, regulatory compliance, and risk mitigation strategies used by top-tier development firms worldwide.',
    glowColor: 'rgba(0, 102, 255, 0.19)',
    iconBgFrom: 'rgba(0, 102, 255, 0.125)',
    iconBgTo: 'rgba(0, 102, 255, 0.03)',
  },
  {
    icon: GraduationCap,
    iconColor: '#c9a84c',
    title: 'Lifetime Access',
    subtitle: 'Trila University & Alumni Network',
    subtitleColor: '#c9a84c',
    description:
      'Get lifetime access to our growing library of courses, templates, deal calculators, legal documents, and an exclusive alumni community of high-performing developers.',
    glowColor: 'rgba(201, 168, 76, 0.19)',
    iconBgFrom: 'rgba(201, 168, 76, 0.125)',
    iconBgTo: 'rgba(201, 168, 76, 0.03)',
  },
]

const instructorStats = [
  { value: '202+', label: 'Projects' },
  { value: '₦1.2T+', label: 'GDV Moved' },
  { value: '15+', label: 'Years Experience' },
  { value: '10+', label: 'Countries' },
]

const instructorTags = [
  'JaaS Pioneer',
  'Fractional Ownership',
  'STR Expert',
  'Global Speaker',
]

export default function WhatYouWillMaster() {
  const [visible, setVisible] = useState(false)
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

  return (
    <section
      ref={ref}
      id='features'
      className='relative py-24 sm:py-32 overflow-hidden'
      style={{ background: '#070e1a' }}
    >
      {/* Background gradients */}
      <div
        className='absolute inset-0'
        style={{
          background: 'linear-gradient(to bottom, #0a1628, #070e1a, #0a1628)',
        }}
      />
      <div
        className='absolute top-0 left-1/2 -translate-x-1/2 rounded-full'
        style={{
          width: '800px',
          height: '400px',
          background:
            'linear-gradient(to bottom, rgba(0,102,255,0.05), transparent)',
          filter: 'blur(150px)',
          pointerEvents: 'none',
        }}
      />

      <div className='relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        {/* Header */}
        <div
          className={`text-center mb-16 sm:mb-20 transition-all duration-700 ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <p
            className='text-xs sm:text-sm font-semibold tracking-[0.2em] uppercase mb-4'
            style={{ color: '#c9a84c' }}
          >
            The Programme
          </p>
          <h2 className='text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight'>
            What You'll Master
          </h2>
          <p className='text-white/40 text-base sm:text-lg mt-4 max-w-2xl mx-auto'>
            A comprehensive curriculum designed for ambitious entrepreneurs
            ready to dominate the $300 trillion real estate asset class through
            fractional ownership, STR, and JaaS.
          </p>
        </div>

        {/* Cards Grid */}
        <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8'>
          {modules.map((mod, i) => {
            const Icon = mod.icon
            return (
              <div
                key={mod.title}
                className={`group relative rounded-2xl p-8 transition-all duration-500 hover:-translate-y-1 cursor-default ${
                  visible
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-8'
                }`}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  backdropFilter: 'blur(4px)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  transitionDelay: `${200 + i * 80}ms`,
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
                {/* Icon */}
                <div
                  className='w-14 h-14 rounded-xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110'
                  style={{
                    background: `linear-gradient(135deg, ${mod.iconBgFrom}, ${mod.iconBgTo})`,
                  }}
                >
                  <Icon
                    size={26}
                    style={{ color: mod.iconColor }}
                    strokeWidth={2}
                  />
                </div>

                {/* Title */}
                <h3 className='text-xl font-bold text-white mb-1'>
                  {mod.title}
                </h3>

                {/* Subtitle */}
                <p
                  className='text-sm font-medium mb-3'
                  style={{ color: mod.subtitleColor }}
                >
                  {mod.subtitle}
                </p>

                {/* Description */}
                <p className='text-white/40 text-sm leading-relaxed'>
                  {mod.description}
                </p>

                {/* Hover border glow overlay */}
                <div
                  className='absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none'
                  style={{
                    boxShadow: `${mod.glowColor} 0px 0px 0px 1px inset`,
                  }}
                />
              </div>
            )
          })}
        </div>

        {/* Instructor Section */}
        <div
          className={`mt-20 sm:mt-24 transition-all duration-700 ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          style={{ transitionDelay: '700ms' }}
        >
          <div
            className='rounded-3xl overflow-hidden'
            style={{
              background: 'rgba(255,255,255,0.03)',
              backdropFilter: 'blur(4px)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <div className='grid md:grid-cols-2 gap-0'>
              {/* Image side */}
              <div
                className='relative h-80 md:h-auto'
                style={{
                  background:
                    'linear-gradient(135deg, rgba(0,102,255,0.1), #0d1f3c, rgba(201,168,76,0.1))',
                }}
              >
                <img
                  src='/femi.jpg'
                  alt='Femi Olawale'
                  className='w-full h-full object-cover object-top'
                />
                {/* Right-side fade for desktop */}
                <div
                  className='absolute inset-0 hidden md:block'
                  style={{
                    background:
                      'linear-gradient(to right, transparent, rgba(10,22,40,0.8))',
                  }}
                />
                {/* Bottom-side fade for mobile */}
                <div
                  className='absolute inset-0 md:hidden'
                  style={{
                    background: 'linear-gradient(to top, #0a1628, transparent)',
                  }}
                />
              </div>

              {/* Content side */}
              <div className='p-8 sm:p-10 lg:p-12 flex flex-col justify-center'>
                <p
                  className='text-xs font-semibold tracking-[0.2em] uppercase mb-4'
                  style={{ color: '#c9a84c' }}
                >
                  Your Instructor
                </p>
                <h3 className='text-2xl sm:text-3xl font-extrabold text-white mb-4'>
                  Femi Olawale
                </h3>
                <p className='text-white/50 text-sm leading-relaxed mb-6'>
                  Founder & CEO of Trila, a pioneer real estate infrastructure
                  company empowering the new generation of entrepreneurs and
                  developers at global scale with fractional ownership,
                  short-term rentals (STR), and Joint-Venture-as-a-Service
                  (JaaS). Femi has structured and facilitated over 202 projects
                  across Africa, the Middle East, and Europe, moving over ₦1.2
                  trillion in Gross Development Value.
                </p>

                {/* Stats Grid */}
                <div className='grid grid-cols-2 gap-4 mb-6'>
                  {instructorStats.map((stat) => (
                    <div
                      key={stat.label}
                      className='rounded-xl p-3 text-center'
                      style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.06)',
                      }}
                    >
                      <p
                        className='text-lg font-bold'
                        style={{
                          background:
                            'linear-gradient(to right, #c9a84c, #e8d5a0)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text',
                        }}
                      >
                        {stat.value}
                      </p>
                      <p className='text-white/30 text-xs'>{stat.label}</p>
                    </div>
                  ))}
                </div>

                {/* Tags */}
                <div className='flex flex-wrap gap-2'>
                  {instructorTags.map((tag) => (
                    <span
                      key={tag}
                      className='text-xs font-medium px-3 py-1.5 rounded-full'
                      style={{
                        color: '#0066FF',
                        background:
                          'linear-gradient(to right, rgba(0,102,255,0.15), rgba(0,102,255,0.05))',
                        border: '1px solid rgba(0,102,255,0.2)',
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
