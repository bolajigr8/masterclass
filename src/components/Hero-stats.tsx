'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { ChevronDown } from 'lucide-react'

const stats = [
  { value: '202+', label: 'Projects Funded' },
  { value: '₦1.2T+', label: 'GDV Moved' },
  { value: '200K+', label: 'Global Community' },
  { value: '10+', label: 'Global Cities' },
]

const topBarStats = [
  { value: '10+', label: 'Cities' },
  { value: '202+', label: 'Projects' },
  { value: '₦1.2T+', label: 'GDV' },
]

const partnerFilterTabs = [
  'Strategic Alliances',
  'Capital Partners',
  'Technology Partners',
  'Advisory Network',
]

const partners = [
  {
    initials: 'AH',
    name: 'ABM Holdings',
    category: 'Strategic Alliance',
    delay: 420,
  },
  { initials: 'MA', name: 'Mbda Africa', category: 'Partner', delay: 460 },
  { initials: 'A', name: 'Andela', category: 'Technology', delay: 500 },
  {
    initials: 'F',
    name: 'Flutterwave',
    category: 'Capital Partner',
    delay: 540,
  },
  {
    initials: 'DG',
    name: 'Dangote Group',
    category: 'Strategic Alliance',
    delay: 580,
  },
  { initials: 'C', name: 'CGSE', category: 'Capital Partner', delay: 620 },
  {
    initials: 'PA',
    name: 'PwC Africa',
    category: 'Advisory Network',
    delay: 660,
  },
  {
    initials: 'LG',
    name: 'Landmark Group',
    category: 'Strategic Alliance',
    delay: 700,
  },
]

const cities = [
  { name: 'New York', code: 'us' },
  { name: 'Toronto', code: 'ca' },
  { name: 'Abuja', code: 'ng' },
  { name: 'Accra', code: 'gh' },
  { name: 'Nairobi', code: 'ke' },
  { name: 'Johannesburg', code: 'za' },
  { name: 'Lagos', code: 'ng' },
  { name: 'Dubai', code: 'ae' },
  { name: 'Singapore', code: 'sg' },
  { name: 'London', code: 'gb' },
]

export default function HeroStats() {
  const [visible, setVisible] = useState(false)
  const [activeTab, setActiveTab] = useState('Strategic Alliances')
  const sectionRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true)
      },
      { threshold: 0.1 },
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      ref={sectionRef}
      className='relative bg-[#050b18] w-full overflow-hidden'
    >
      {/* ── TOP STATS BANNER ── */}
      <div
        className={`flex items-center justify-between gap-4 mx-auto max-w-2xl px-5 py-8 mt-6 mb-4 rounded-2xl border border-white/10 bg-[#0d1831]/60 backdrop-blur-md transition-all duration-700 ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
        }`}
        style={{ transitionDelay: '0ms' }}
      >
        {/* Left: icon + headline */}
        <div className='flex items-center gap-3 min-w-0'>
          <div className='shrink-0 w-8 h-8 rounded-lg bg-[#1a2d50] border border-white/10 flex items-center justify-center'>
            <svg width='16' height='16' viewBox='0 0 16 16' fill='none'>
              <circle cx='8' cy='8' r='3' fill='#d4a422' />
              <circle
                cx='8'
                cy='8'
                r='6.5'
                stroke='#d4a422'
                strokeWidth='1'
                strokeDasharray='2 2'
              />
            </svg>
          </div>
          <div className='min-w-0'>
            <p className='text-white font-bold text-[13px] sm:text-[14px] leading-tight'>
              200,000+
            </p>
            <p className='text-white/50 text-[11px] sm:text-[12px] truncate'>
              Developers, Startups, HNWI &amp; Organizations Worldwide
            </p>
          </div>
        </div>

        {/* Right: mini stats */}
        <div className='flex items-center gap-4 shrink-0 pl-4 border-l border-white/10'>
          {topBarStats.map((s) => (
            <div key={s.label} className='flex flex-col items-center'>
              <span className='text-white font-bold text-[12px] sm:text-[13px] leading-tight'>
                {s.value}
              </span>
              <span className='text-white/40 text-[10px]'>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── WAITLIST BADGE + FOUNDER CARD ── */}
      <div className='flex flex-col items-center px-5 pt-2 pb-12 gap-6'>
        {/* Waitlist Badge */}
        <div
          className={`inline-flex items-center gap-2.5 px-5 py-3 rounded-full border border-white/10 bg-[#0d1a2e]/80 backdrop-blur-sm transition-all duration-700 ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
          style={{ transitionDelay: '100ms' }}
        >
          <span className='relative flex h-2.5 w-2.5 shrink-0'>
            <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60' />
            <span className='relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400' />
          </span>
          <span className='text-[13px] sm:text-[14px] text-white/80'>
            <strong className='text-white font-bold'>4,130,193+</strong>{' '}
            aspiring landlords &amp; developers already on our waitlist
          </span>
        </div>

        {/* Founder Card */}
        <div
          className={`flex items-center gap-4 px-5 py-4 rounded-2xl border border-white/10 bg-[#0d1831]/70 backdrop-blur-md w-full max-w-104 transition-all duration-700 ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
          style={{ transitionDelay: '220ms' }}
        >
          <div className='shrink-0 w-14 h-14 rounded-full overflow-hidden border-2 border-white/10'>
            <Image
              src='/femi.jpg'
              alt='Femi Olawale'
              width={56}
              height={56}
              className='object-cover w-full h-full'
            />
          </div>
          <div>
            <p className='text-white font-bold text-[15px]'>
              Led by Femi Olawale
            </p>
            <p className='text-white/50 text-[12.5px] mt-0.5'>
              Founder &amp; CEO, Trila · Real Estate Developer · JaaS Pioneer
            </p>
          </div>
        </div>

        {/* Chevron */}
        <div
          className={`transition-all duration-700 ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}
          style={{ transitionDelay: '340ms' }}
        >
          <ChevronDown
            size={22}
            className='text-white/30 animate-bounce'
            aria-hidden='true'
            style={{ animationDuration: '2s' }}
          />
        </div>
      </div>

      {/* ── TRUSTED PARTNERS & COLLABORATORS ── */}
      <div className='w-full border-t border-white/6' />
      <div
        className={`px-5 py-10 transition-all duration-700 ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        }`}
        style={{ transitionDelay: '380ms' }}
      >
        {/* Section heading */}
        <p className='text-center text-[11px] font-bold tracking-[0.2em] text-white/35 uppercase mb-8'>
          Trusted Partners &amp; Collaborators
        </p>

        {/* Partner Cards Grid */}
        <div className='grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4 max-w-7xl mx-auto mb-8'>
          {partners.map((partner) => (
            <div
              key={partner.name}
              className={`flex flex-col items-center gap-3 px-4 py-6 rounded-2xl border border-white/8 bg-[#0d1831]/50 hover:border-white/20 hover:bg-[#0d1831]/80 transition-all duration-300 cursor-pointer group ${
                visible
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-4'
              }`}
              style={{ transitionDelay: `${partner.delay}ms` }}
            >
              <div className='w-14 h-14 rounded-xl bg-[#1a2d50] border border-white/10 flex items-center justify-center group-hover:border-[#d4a422]/30 transition-colors duration-300'>
                <span className='text-white/70 font-bold text-[14px] group-hover:text-[#d4a422] transition-colors duration-300'>
                  {partner.initials}
                </span>
              </div>
              <div className='text-center'>
                <p className='text-white/70 text-[12px] font-semibold leading-tight'>
                  {partner.name}
                </p>
                <p className='text-white/35 text-[11px] mt-1 leading-tight'>
                  {partner.category}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Filter Tabs */}
        <div className='flex items-center justify-center flex-wrap'>
          {partnerFilterTabs.map((tab, i) => (
            <div key={tab} className='flex items-center'>
              {i > 0 && (
                <span className='text-white/15 text-xs select-none'>|</span>
              )}
              <button
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 text-[12px] font-medium transition-colors duration-200 ${
                  activeTab === tab
                    ? 'text-white/90'
                    : 'text-white/35 hover:text-white/60'
                }`}
              >
                {tab}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ── STATS GRID ── */}
      <div className='w-full border-t border-white/6' />
      <div className='grid grid-cols-2 lg:grid-cols-4 gap-0 divide-x divide-y divide-white/6 lg:divide-y-0 border-b border-white/6'>
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className={`flex flex-col items-start lg:items-center px-8 py-10 transition-all duration-700 ${
              visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
            style={{ transitionDelay: `${640 + i * 80}ms` }}
          >
            <span
              className='font-extrabold text-[#d4a422] leading-none'
              style={{ fontSize: 'clamp(32px, 4.5vw, 52px)' }}
            >
              {stat.value}
            </span>
            <span className='mt-2 text-[13px] sm:text-[14px] text-white/50 font-medium'>
              {stat.label}
            </span>
          </div>
        ))}
      </div>

      {/* ── LIVE MASTERCLASSES TICKER ── */}
      <div className='w-full border-t border-white/6' />
      <div
        className={`text-center pt-10 pb-5 transition-all duration-700 ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
        style={{ transitionDelay: '960ms' }}
      >
        <span className='text-[11px] font-bold tracking-[0.2em] text-white/35 uppercase'>
          Live Masterclasses Across the Globe
        </span>
      </div>

      <div className='relative overflow-hidden pb-10'>
        {/* Left fade */}
        <div className='absolute left-0 top-0 bottom-0 w-24 bg-linear-to-r from-[#050b18] to-transparent z-10 pointer-events-none' />
        {/* Right fade */}
        <div className='absolute right-0 top-0 bottom-0 w-24 bg-linear-to-l from-[#050b18] to-transparent z-10 pointer-events-none' />

        <div className='flex'>
          <div
            aria-hidden='false'
            className='flex items-center gap-12 shrink-0 animate-marquee'
          >
            {cities.map((city, i) => (
              <span
                key={`a-${i}`}
                className='flex items-center gap-2.5 text-[15px] sm:text-[17px] font-semibold text-white/60 whitespace-nowrap hover:text-white/90 transition-colors duration-200 cursor-default'
              >
                <img
                  src={`https://flagcdn.com/w20/${city.code}.png`}
                  srcSet={`https://flagcdn.com/w40/${city.code}.png 2x`}
                  width={20}
                  height={15}
                  alt={city.name}
                  className='rounded-sm opacity-80 shrink-0'
                />
                {city.name}
              </span>
            ))}
            <span className='text-white/20 text-lg'>·</span>
          </div>
          <div
            aria-hidden='true'
            className='flex items-center gap-12 shrink-0 animate-marquee'
          >
            {cities.map((city, i) => (
              <span
                key={`b-${i}`}
                className='flex items-center gap-2.5 text-[15px] sm:text-[17px] font-semibold text-white/60 whitespace-nowrap hover:text-white/90 transition-colors duration-200 cursor-default'
              >
                <img
                  src={`https://flagcdn.com/w20/${city.code}.png`}
                  srcSet={`https://flagcdn.com/w40/${city.code}.png 2x`}
                  width={20}
                  height={15}
                  alt={city.name}
                  className='rounded-sm opacity-80 shrink-0'
                />
                {city.name}
              </span>
            ))}
            <span className='text-white/20 text-lg'>·</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-100%);
          }
        }
        .animate-marquee {
          animation: marquee 28s linear infinite;
          padding-right: 3rem;
        }
      `}</style>
    </section>
  )
}
