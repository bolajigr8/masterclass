'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { ArrowRight, Play } from 'lucide-react'
import { useSmoothScroll } from '@/hooks/useSmoothScroll'

const cities =
  'Lagos · Dubai · Singapore · London · New York · Toronto · Abuja · Accra · Nairobi · Johannesburg + Worldwide Zoom Webinars'

export default function Hero() {
  const [mounted, setMounted] = useState(false)
  const { scrollTo } = useSmoothScroll()

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60)
    return () => clearTimeout(t)
  }, [])

  return (
    <section
      id='hero'
      className='relative -mb-15   min-h-screen w-full flex flex-col overflow-hidden bg-[#050b18]'
    >
      {/* Background Image */}
      <div className='absolute inset-0 z-0'>
        <Image
          src='/second.PNG'
          alt='Luxury real estate development'
          fill
          priority
          className='object-cover object-center opacity-35'
        />
        {/* Slightly lighter gradient so the tower structure reads through */}
        <div className='absolute inset-0 bg-linear-to-b from-[#050b18]/60 via-[#060c1a]/40 to-[#050b18]/95' />
        <div className='absolute inset-0 bg-linear-to-r from-[#050b18]/55 via-transparent to-[#050b18]/55' />
      </div>

      {/* Subtle grid pattern */}
      <div
        className='absolute inset-0 z-1 opacity-[0.04]'
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Decorative building icon */}
      <div className='absolute top-24 right-12 z-2 opacity-10 hidden lg:block'>
        <svg width='80' height='100' viewBox='0 0 80 100' fill='none'>
          <rect
            x='10'
            y='20'
            width='60'
            height='80'
            stroke='white'
            strokeWidth='2'
          />
          <rect
            x='20'
            y='30'
            width='12'
            height='15'
            stroke='white'
            strokeWidth='1.5'
          />
          <rect
            x='48'
            y='30'
            width='12'
            height='15'
            stroke='white'
            strokeWidth='1.5'
          />
          <rect
            x='20'
            y='55'
            width='12'
            height='15'
            stroke='white'
            strokeWidth='1.5'
          />
          <rect
            x='48'
            y='55'
            width='12'
            height='15'
            stroke='white'
            strokeWidth='1.5'
          />
          <rect
            x='30'
            y='75'
            width='20'
            height='25'
            stroke='white'
            strokeWidth='1.5'
          />
        </svg>
      </div>

      {/* Main content */}
      <div className='relative z-10 flex flex-col items-center justify-center flex-1 text-center px-5 pt-22 pb-16 lg:pt-26 lg:pb-24'>
        {/* Badge */}
        <div
          className={`inline-flex items-start gap-2.5 px-4 py-2.5 rounded-full border border-white/15 bg-[#0d1a2e]/80 backdrop-blur-sm mb-10 transition-all duration-700 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
          style={{ transitionDelay: '100ms' }}
        >
          <span className='w-2 h-2 rounded-full bg-[#f59e0b] animate-pulse shrink-0 mt-1.5' />
          <span className='text-[13px] font-bold tracking-[0.12em] text-[#f59e0b] uppercase'>
            Masterclass 2026 — Unlocking the $300 Trillion Gated Asset Class
          </span>
        </div>

        {/* Headline */}
        <h1
          className={`font-extrabold text-white leading-[1.05] tracking-tight max-w-200 transition-all duration-700 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
          style={{
            transitionDelay: '200ms',
            fontSize: 'clamp(36px, 6vw, 65px)',
          }}
        >
          Become a Real Developer
          <br />
          <span className='text-[#2563eb]'>or Global Landlord</span>
          <br />— in Days, Not Decades
        </h1>

        {/* Subheading */}
        <p
          className={`mt-6 max-w-2xl text-[16px] sm:text-[18px] text-white/60 font-medium transition-all duration-700 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
          style={{ transitionDelay: '340ms' }}
        >
          Trila is a pioneer real estate infrastructure company empowering the
          new generation of entrepreneurs and developers at global scale with
          fractional ownership, short-term rentals (STR), and
          Joint-Venture-as-a-Service (JaaS).
        </p>

        {/* Cities */}
        <p
          className={`mt-3 text-[13px] sm:text-[15px] text-white/45 max-w-160 leading-relaxed transition-all duration-700 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
          style={{ transitionDelay: '420ms' }}
        >
          {cities}
        </p>

        {/* CTA Buttons */}
        <div
          className={`mt-10 flex flex-col sm:flex-row items-center gap-4 transition-all duration-700 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
          style={{ transitionDelay: '520ms' }}
        >
          <button
            onClick={() => scrollTo('reserve-access')}
            className='group flex items-center gap-3 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-[15px] sm:text-[16px] font-bold px-7 py-4 rounded-full transition-all duration-300 hover:shadow-[0_0_30px_rgba(37,99,235,0.55)] active:scale-[0.97] w-full sm:w-auto justify-center min-w-70 focus:outline-none'
          >
            Secure Your Seat — Limited Capacity
            <ArrowRight
              size={18}
              className='transition-transform duration-200 group-hover:translate-x-1'
            />
          </button>

          <button
            onClick={() => scrollTo('reserve-access')}
            className='group flex items-center gap-3 bg-white/8 hover:bg-white/12 border border-white/20 hover:border-white/30 text-white text-[15px] sm:text-[16px] font-semibold px-7 py-4 rounded-full backdrop-blur-sm transition-all duration-300 active:scale-[0.97] w-full sm:w-auto justify-center min-w-70 focus:outline-none'
          >
            <Play
              size={14}
              className='fill-[#f59e0b] text-[#f59e0b] transition-transform duration-200 group-hover:scale-110'
            />
            Book Private Consulting Call
          </button>
        </div>
      </div>

      {/* Bottom fade */}
      {/* <div className='absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-[#050b18] to-transparent z-5' /> */}
    </section>
  )
}
