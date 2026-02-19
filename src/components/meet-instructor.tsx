'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'

const instructorStats = [
  { value: '202+', label: 'Projects' },
  { value: '₦1.2T+', label: 'GDV Moved' },
  { value: '15+', label: 'Years Experience' },
  { value: '10+', label: 'Countries' },
]

const tags = [
  'JaaS Pioneer',
  'Tokenization Expert',
  'Development Finance',
  'Global Speaker',
]

export default function MeetTheInstructor() {
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
      id='meet-the-experts'
      className='relative bg-[#050b18] w-full py-20 lg:py-28 px-5 overflow-hidden'
    >
      {/* Background glow */}
      <div className='absolute bottom-0 right-1/4 w-125 h-100 bg-[#2563eb]/4 rounded-full blur-[140px] pointer-events-none' />

      <div className='max-w-275 mx-auto'>
        <div
          className={`relative rounded-3xl border border-white/8 bg-[#0b1628]/70 overflow-hidden flex flex-col lg:flex-row transition-all duration-700 ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {/* Left — Instructor Image */}
          <div className='relative w-full lg:w-[42%] min-h-80 lg:min-h-135 shrink-0 bg-[#0d1a2e]'>
            <Image
              src='/femi.jpg'
              alt='Femi Olawale'
              fill
              className='object-cover object-top'
            />
            {/* Bottom gradient on image */}
            <div className='absolute inset-0 bg-linear-to-t from-[#0b1628]/60 via-transparent to-transparent lg:bg-linear-to-r lg:from-transparent lg:to-[#0b1628]/80' />
          </div>

          {/* Right — Content */}
          <div className='flex flex-col justify-center px-7 py-10 lg:px-10 lg:py-12 gap-5'>
            {/* Label */}
            <p
              className={`text-[11px] font-bold tracking-[0.2em] text-[#d4a422] uppercase transition-all duration-700 ${
                visible
                  ? 'opacity-100 translate-x-0'
                  : 'opacity-0 translate-x-6'
              }`}
              style={{ transitionDelay: '200ms' }}
            >
              Your Instructor
            </p>

            {/* Name */}
            <h2
              className={`font-extrabold text-white leading-tight transition-all duration-700 ${
                visible
                  ? 'opacity-100 translate-x-0'
                  : 'opacity-0 translate-x-6'
              }`}
              style={{
                fontSize: 'clamp(28px, 4vw, 42px)',
                transitionDelay: '280ms',
              }}
            >
              Femi Olawale
            </h2>

            {/* Bio */}
            <p
              className={`text-[14px] sm:text-[15px] text-white/55 leading-relaxed max-w-120 transition-all duration-700 ${
                visible
                  ? 'opacity-100 translate-x-0'
                  : 'opacity-0 translate-x-6'
              }`}
              style={{ transitionDelay: '360ms' }}
            >
              Founder of Trila, real estate developer, and pioneer of
              Joint-Venture-as-a-Service (JaaS). Femi has structured and
              facilitated over 202 projects across Africa, the Middle East, and
              Europe, moving over ₦1.2 trillion in Gross Development Value. His
              mission: democratize access to premium real estate for the next
              generation of African-global entrepreneurs.
            </p>

            {/* Stats Grid */}
            <div
              className={`grid grid-cols-2 gap-3 mt-2 transition-all duration-700 ${
                visible
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-4'
              }`}
              style={{ transitionDelay: '440ms' }}
            >
              {instructorStats.map((stat) => (
                <div
                  key={stat.label}
                  className='rounded-xl border border-white/8 bg-[#0d1a35]/80 px-5 py-4 flex flex-col gap-1 hover:border-white/15 transition-colors duration-300'
                >
                  <span className='text-[#d4a422] font-extrabold text-[22px] sm:text-[26px] leading-none'>
                    {stat.value}
                  </span>
                  <span className='text-white/45 text-[12px] font-medium'>
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Tags */}
            <div
              className={`flex flex-wrap gap-2 mt-1 transition-all duration-700 ${
                visible
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-4'
              }`}
              style={{ transitionDelay: '560ms' }}
            >
              {tags.map((tag) => (
                <span
                  key={tag}
                  className='px-3.5 py-1.5 rounded-full border border-[#2563eb]/40 bg-[#2563eb]/10 text-[#4a9eff] text-[12px] font-semibold'
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
