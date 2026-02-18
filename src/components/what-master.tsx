'use client'

import { useEffect, useRef, useState } from 'react'
import {
  Building2,
  Handshake,
  Globe,
  Layers,
  ShieldCheck,
  GraduationCap,
} from 'lucide-react'

const modules = [
  {
    icon: Building2,
    iconBg: 'bg-[#1a2a4a]',
    iconColor: 'text-[#4a9eff]',
    title: 'Zero-Up Mastery',
    subtitle: 'Own Premium Property with Zero Upfront Capital',
    subtitleColor: 'text-[#2563eb]',
    description:
      'Learn the exact frameworks to acquire, develop, and profit from premium real estate without deploying your own capital. Master creative financing, JV structures, and institutional-grade deal sourcing.',
  },
  {
    icon: Handshake,
    iconBg: 'bg-[#1a2a1a]',
    iconColor: 'text-[#d4a422]',
    title: 'JaaS Blueprint',
    subtitle: 'Joint-Venture-as-a-Service',
    subtitleColor: 'text-[#2563eb]',
    description:
      'Raise 20–100% GDV funding, secure premium land, structure win-win deals, tokenize assets, and sell globally. The complete playbook for modern real estate entrepreneurs.',
    featured: true,
  },
  {
    icon: Globe,
    iconBg: 'bg-[#0d1f3a]',
    iconColor: 'text-[#4a9eff]',
    title: 'Global Network',
    subtitle: 'Connect Across 10+ Major Cities',
    subtitleColor: 'text-[#2563eb]',
    description:
      'Access a curated network of developers, landowners, institutional investors, and HNWIs across Lagos, Dubai, Singapore, London, New York, Toronto, and beyond.',
  },
  {
    icon: Layers,
    iconBg: 'bg-[#1a1a2e]',
    iconColor: 'text-[#d4a422]',
    title: 'Tokenization Mastery',
    subtitle: 'Fractional Ownership & Digital Assets',
    subtitleColor: 'text-[#2563eb]',
    description:
      'Understand blockchain-powered real estate tokenization, fractional ownership structures, and how to create globally tradeable property assets.',
  },
  {
    icon: ShieldCheck,
    iconBg: 'bg-[#0d1f3a]',
    iconColor: 'text-[#4a9eff]',
    title: 'Risk Management',
    subtitle: 'Institutional-Grade Protection',
    subtitleColor: 'text-[#2563eb]',
    description:
      'Learn due diligence frameworks, legal structuring, regulatory compliance, and risk mitigation strategies used by top-tier development firms worldwide.',
  },
  {
    icon: GraduationCap,
    iconBg: 'bg-[#1a2a1a]',
    iconColor: 'text-[#d4a422]',
    title: 'Lifetime Access',
    subtitle: 'Trila University & Alumni Network',
    subtitleColor: 'text-[#2563eb]',
    description:
      'Get lifetime access to our growing library of courses, templates, deal calculators, legal documents, and an exclusive alumni community of high-performing developers.',
  },
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
      id='programme'
      className='relative bg-[#050b18] w-full py-20 lg:py-28 px-5 overflow-hidden'
    >
      {/* Subtle background glow */}
      <div className='absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#2563eb]/5 rounded-full blur-[120px] pointer-events-none' />

      <div className='max-w-[1200px] mx-auto'>
        {/* Header */}
        <div
          className={`text-center mb-14 transition-all duration-700 ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <p className='text-[11px] font-bold tracking-[0.2em] text-[#2563eb] uppercase mb-4'>
            The Programme
          </p>
          <h2
            className='font-extrabold text-white leading-tight'
            style={{ fontSize: 'clamp(32px, 5vw, 56px)' }}
          >
            What You&apos;ll Master
          </h2>
          <p className='mt-4 text-[15px] sm:text-[16px] text-white/50 max-w-[560px] mx-auto leading-relaxed'>
            A comprehensive curriculum designed for ambitious entrepreneurs
            ready to dominate the $300 trillion real estate asset class.
          </p>
        </div>

        {/* Cards Grid */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
          {modules.map((mod, i) => {
            const Icon = mod.icon
            return (
              <div
                key={mod.title}
                className={`group relative rounded-2xl border border-white/8 bg-[#0b1628]/80 p-6 flex flex-col gap-4 hover:border-white/15 hover:bg-[#0d1a35]/90 transition-all duration-500 cursor-default ${
                  visible
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${200 + i * 80}ms` }}
              >
                {/* Icon */}
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${mod.iconBg} transition-transform duration-300 group-hover:scale-110`}
                >
                  <Icon size={20} className={mod.iconColor} />
                </div>

                {/* Title + Subtitle */}
                <div>
                  <h3 className='text-white font-bold text-[17px] leading-snug'>
                    {mod.title}
                  </h3>
                  <p
                    className={`text-[13px] font-semibold mt-1 ${mod.subtitleColor}`}
                  >
                    {mod.subtitle}
                  </p>
                </div>

                {/* Description */}
                <p className='text-[13.5px] text-white/50 leading-relaxed'>
                  {mod.description}
                </p>

                {/* Hover bottom border glow */}
                <div className='absolute bottom-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-[#2563eb]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500' />
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
