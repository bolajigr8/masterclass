'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { ChevronDown } from 'lucide-react'

const stats = [
  { value: '202+', label: 'Projects Funded' },
  { value: '₦1.2T+', label: 'GDV Moved' },
  { value: '4M+', label: 'Community Members' },
  { value: '10+', label: 'Global Cities' },
]

const cities = [
  'New York',
  'Toronto',
  'Abuja',
  'Accra',
  'Nairobi',
  'Johannesburg',
  'Lagos',
  'Dubai',
  'Singapore',
  'London',
  'New York',
  'Toronto',
  'Abuja',
  'Accra',
  'Nairobi',
  'Johannesburg',
  'Lagos',
  'Dubai',
  'Singapore',
  'London',
]

export default function HeroStats() {
  const [visible, setVisible] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true)
      },
      { threshold: 0.15 },
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      ref={sectionRef}
      className='relative bg-[#050b18] w-full overflow-hidden'
    >
      {/* Top content: waitlist badge + founder card (this overlaps hero bottom) */}
      <div className='flex flex-col items-center px-5 pt-8 pb-12 gap-6'>
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
            <strong className='text-white font-bold'>4,129,487+</strong>{' '}
            aspiring landlords &amp; developers already on our waitlist
          </span>
        </div>

        {/* Founder Card */}
        <div
          className={`flex items-center gap-4 px-5 py-4 rounded-2xl border border-white/10 bg-[#0d1831]/70 backdrop-blur-md w-full max-w-105 transition-all duration-700 ${
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
              Founder, Trila · Real Estate Developer · JaaS Pioneer
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
            style={{ animationDuration: '2s' }}
          />
        </div>
      </div>

      {/* Divider */}
      <div className='w-full border-t border-white/6' />

      {/* Stats Grid */}
      <div className='grid grid-cols-2 lg:grid-cols-4 gap-0 divide-x divide-y divide-white/6 lg:divide-y-0 border-b border-white/6'>
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className={`flex flex-col items-start lg:items-center px-8 py-10 transition-all duration-700 ${
              visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
            style={{ transitionDelay: `${400 + i * 80}ms` }}
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

      {/* Divider */}
      <div className='w-full border-t border-white/6' />

      {/* Live Masterclasses Label */}
      <div
        className={`text-center pt-10 pb-5 transition-all duration-700 ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
        style={{ transitionDelay: '720ms' }}
      >
        <span className='text-[11px] font-bold tracking-[0.2em] text-white/35 uppercase'>
          Live Masterclasses Across the Globe
        </span>
      </div>

      {/* Horizontally Scrolling Cities */}
      <div className='relative overflow-hidden pb-10'>
        {/* Left fade */}
        <div className='absolute left-0 top-0 bottom-0 w-24 bg-linear-to-r from-[#050b18] to-transparent z-10 pointer-events-none' />
        {/* Right fade */}
        <div className='absolute right-0 top-0 bottom-0 w-24 bg-linear-to-l from-[#050b18] to-transparent z-10 pointer-events-none' />

        <div className='flex'>
          {/* Two copies for seamless loop */}
          {[0, 1].map((copy) => (
            <div
              key={copy}
              className='flex items-center gap-12 shrink-0 animate-marquee'
              aria-hidden={copy === 1}
            >
              {cities.slice(0, 10).map((city, i) => (
                <span
                  key={`${copy}-${i}`}
                  className='text-[15px] sm:text-[17px] font-semibold text-white/60 whitespace-nowrap hover:text-white/90 transition-colors duration-200 cursor-default'
                >
                  {city}
                </span>
              ))}
              {/* Separator dot between repetitions */}
              <span className='text-white/20 text-lg'>·</span>
            </div>
          ))}
        </div>
      </div>

      {/* Keyframe styles */}
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
