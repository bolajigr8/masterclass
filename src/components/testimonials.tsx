'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const featuredTestimonials = [
  {
    id: 1,
    quote:
      '"The JaaS Blueprint completely transformed how I structure deals. Within 6 months of the masterclass, I closed my first ₦800M development project with zero personal capital."',
    name: 'Adebayo Ogunlesi',
    title: 'Real Estate Developer, Lagos',
    badge: '₦800M first deal',
    avatar: '/testimonial1.jpg',
    rating: 5,
  },
  {
    id: 2,
    quote:
      "Femi's approach to tokenized real estate opened my eyes to a completely new asset class. The network alone is worth 10x the investment.",
    name: 'Amara Nwosu',
    title: 'Investment Analyst, Dubai',
    avatar: '/testimonial2.jpg',
    rating: 5,
  },
  {
    id: 3,
    quote:
      'From zero real estate experience to owning a portfolio of 12 units across two countries. The Trila Masterclass gave me the frameworks, confidence, and connections.',
    name: 'Kwame Asante',
    title: 'Property Developer, Accra',
    badge: '12 units, 2 countries',
    avatar: '/testimonial3.jpg',
    rating: 5,
  },
  {
    id: 4,
    quote:
      'The private consulting session with Femi was a game-changer. He helped me restructure a stalled project and within 90 days we had full funding.',
    name: 'Chidima Eze',
    title: 'Entrepreneur, London',
    badge: 'Full funding in 90 days',
    avatar: '/testimonial4.jpg',
    rating: 5,
  },
  {
    id: 5,
    quote:
      "I've attended masterclasses globally — McKinsey, Harvard, Wharton. Trila's programme is uniquely practical and immediately actionable for African markets.",
    name: 'Ibrahim Musa',
    title: 'Fund Manager, Abuja',
    badge: '$2.4M fund raised',
    avatar: '/testimonial5.jpg',
    rating: 5,
  },
  {
    id: 6,
    quote:
      'The global network is incredible. I connected with a Singapore-based investor at the masterclass who co-funded my first Canadian development project.',
    name: 'Oluwaseun Bakare',
    title: 'Developer, Toronto',
    badge: 'Cross-border JV deal',
    avatar: '/testimonial6.jpg',
    rating: 5,
  },
]

const gridTestimonials = [
  {
    id: 6,
    quote:
      '"The JaaS Blueprint completely transformed how I structure deals. Within 6 months of the masterclass, I closed my first ₦800M development project with zero personal capital."',
    name: 'Adebayo Ogunlesi',
    title: 'Real Estate Developer, Lagos',
    avatar: '/testimonial1.jpg',
    rating: 5,
  },
  {
    id: 7,
    quote:
      "Femi's approach to tokenized real estate opened my eyes to a completely new asset class. The network alone is worth 10x the investment.",
    name: 'Amara Nwosu',
    title: 'Investment Analyst, Dubai',
    avatar: '/testimonial2.jpg',
    rating: 5,
  },
  {
    id: 8,
    quote:
      'From zero real estate experience to owning a portfolio of 12 units across two countries. The Trila Masterclass gave me the frameworks, confidence, and connections.',
    name: 'Kwame Asante',
    title: 'Property Developer, Accra',
    avatar: '/testimonial3.jpg',
    rating: 5,
  },
]

function StarRating({ count = 5 }: { count?: number }) {
  return (
    <div className='flex items-center gap-1'>
      {Array.from({ length: count }).map((_, i) => (
        <svg key={i} width='16' height='16' viewBox='0 0 16 16' fill='none'>
          <path
            d='M8 1.5L9.854 5.757L14.5 6.382L11.25 9.493L12.118 14.118L8 11.757L3.882 14.118L4.75 9.493L1.5 6.382L6.146 5.757L8 1.5Z'
            fill='#FBBF24'
            stroke='#FBBF24'
            strokeWidth='0.5'
          />
        </svg>
      ))}
    </div>
  )
}

export default function Testimonials() {
  const [current, setCurrent] = useState(0)
  const [visible, setVisible] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const autoRef = useRef<ReturnType<typeof setInterval> | null>(null)

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

  const goTo = useCallback(
    (index: number) => {
      if (isAnimating) return
      setIsAnimating(true)
      setCurrent(index)
      setTimeout(() => setIsAnimating(false), 400)
    },
    [isAnimating],
  )

  const prev = () =>
    goTo(
      (current - 1 + featuredTestimonials.length) % featuredTestimonials.length,
    )
  const next = useCallback(
    () => goTo((current + 1) % featuredTestimonials.length),
    [current, goTo],
  )

  // Autoplay
  useEffect(() => {
    autoRef.current = setInterval(next, 5000)
    return () => {
      if (autoRef.current) clearInterval(autoRef.current)
    }
  }, [next])

  const active = featuredTestimonials[current]

  return (
    <section
      ref={ref}
      id='testimonials'
      className='relative bg-[#050b18] w-full py-20 lg:py-28 px-5 overflow-hidden'
    >
      {/* Glow */}
      <div className='absolute top-0 right-1/3 w-125 h-100 bg-[#d4a422]/4 rounded-full blur-[150px] pointer-events-none' />

      <div className='max-w-275 mx-auto'>
        {/* Header */}
        <div
          className={`text-center mb-12 transition-all duration-700 ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <p className='text-[11px] font-bold tracking-[0.2em] text-[#d4a422] uppercase mb-4'>
            Success Stories
          </p>
          <h2
            className='font-extrabold text-white leading-tight'
            style={{ fontSize: 'clamp(32px, 5vw, 54px)' }}
          >
            Hear From Our Alumni
          </h2>
          <p className='mt-4 text-[15px] text-white/50 max-w-105 mx-auto'>
            Real results from real entrepreneurs who took the leap.
          </p>
        </div>

        {/* Featured Carousel */}
        <div
          className={`relative rounded-2xl border border-white/8 bg-[#0b1628]/80 p-6 sm:p-8 lg:p-10 mb-6 overflow-hidden transition-all duration-700 ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          style={{ transitionDelay: '200ms' }}
        >
          {/* Large decorative quote marks */}
          <div className='absolute top-6 left-7 text-[80px] leading-none font-serif text-[#2563eb]/20 select-none pointer-events-none'>
            &#8220;
          </div>

          <div
            className={`flex flex-col sm:flex-row gap-6 sm:gap-10 items-start transition-all duration-400 ${
              isAnimating
                ? 'opacity-0 translate-x-4'
                : 'opacity-100 translate-x-0'
            }`}
          >
            {/* Avatar */}
            <div className='shrink-0'>
              <div className='w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-white/15'>
                <Image
                  src={active.avatar}
                  alt={active.name}
                  width={80}
                  height={80}
                  className='object-cover w-full h-full'
                />
              </div>
            </div>

            {/* Content */}
            <div className='flex-1'>
              <p className='text-white/85 text-[16px] sm:text-[18px] font-medium italic leading-relaxed mb-5'>
                {active.quote}
              </p>
              <div className='flex flex-wrap items-center gap-3'>
                <div>
                  <p className='text-white font-bold text-[15px]'>
                    {active.name}
                  </p>
                  <p className='text-white/45 text-[13px]'>{active.title}</p>
                </div>
                <span className='ml-auto sm:ml-0 px-3 py-1 rounded-full bg-[#d4a422]/20 border border-[#d4a422]/30 text-[#d4a422] text-[11px] font-bold'>
                  {active.badge}
                </span>
              </div>
              <div className='mt-3'>
                <StarRating count={active.rating} />
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className='flex items-center justify-center gap-3 mt-8'>
            <button
              onClick={prev}
              className='w-9 h-9 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all duration-200'
              aria-label='Previous'
            >
              <ChevronLeft size={16} />
            </button>

            {featuredTestimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`rounded-full transition-all duration-300 ${
                  i === current
                    ? 'w-6 h-2.5 bg-[#2563eb]'
                    : 'w-2.5 h-2.5 bg-white/20 hover:bg-white/40'
                }`}
              />
            ))}

            <button
              onClick={next}
              className='w-9 h-9 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all duration-200'
              aria-label='Next'
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Grid Testimonials */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
          {gridTestimonials.map((t, i) => (
            <div
              key={t.id}
              className={`rounded-2xl border border-white/8 bg-[#0b1628]/60 p-5 flex flex-col gap-4 hover:border-white/15 hover:bg-[#0d1a35]/70 transition-all duration-500 ${
                visible
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${400 + i * 100}ms` }}
            >
              <StarRating count={t.rating} />
              <p className='text-white/60 text-[13.5px] leading-relaxed flex-1'>
                {t.quote}
              </p>
              <div className='flex items-center gap-3 pt-1 border-t border-white/6'>
                <div className='w-9 h-9 rounded-full overflow-hidden border border-white/10 shrink-0'>
                  <Image
                    src={t.avatar}
                    alt={t.name}
                    width={36}
                    height={36}
                    className='object-cover w-full h-full'
                  />
                </div>
                <div>
                  <p className='text-white font-semibold text-[13px]'>
                    {t.name}
                  </p>
                  <p className='text-white/40 text-[11.5px]'>{t.title}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
