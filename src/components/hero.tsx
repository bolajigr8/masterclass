'use client'

import React from 'react'
import { Calendar, ChevronDown } from 'lucide-react'
import Image from 'next/image'

interface HeroProps {
  onRegisterClick?: () => void
  onViewDatesClick?: () => void
}

export const Hero: React.FC<HeroProps> = ({
  onRegisterClick,
  onViewDatesClick,
}) => {
  const handleRegisterClick = () => {
    if (onRegisterClick) {
      onRegisterClick()
      return
    }

    if (typeof window !== 'undefined') {
      const target = document.getElementById('reserve-access')

      if (target) {
        target.scrollIntoView({ behavior: 'smooth' })
        return
      }

      window.location.href = '/finalize-enrollment'
    }
  }

  return (
    <section className='relative w-full overflow-hidden min-h-[80vh] lg:min-h-screen'>
      {/* Background Image */}
      <div className='absolute inset-0 z-0'>
        <Image
          src='/hero-pic.png'
          alt='City skyline background'
          fill
          className='object-cover'
          priority
        />
        {/* Overlay - gradient to white in light mode, dark overlay in dark mode */}
        {/* <div className='absolute inset-0 bg-linear-to-b from-black/40 via-black/30 to-white dark:bg-black/60' /> */}
      </div>

      {/* Content */}
      <div className='relative z-10 flex h-full flex-col justify-center pt-24 px-6 sm:px-12 md:px-16 lg:px-24 xl:px-32'>
        <div className='max-w-3xl'>
          {/* Main Heading */}
          <h1 className='mb-6 text-3xl font-bold leading-tight text-white sm:text-4xl md:text-5xl lg:text-6xl'>
            Unlock Structured
            <br />
            Property Ownership with
            <br />
            <span className='text-blue-500 dark:text-blue-400'>Trila</span>
          </h1>

          {/* Subheading */}
          <p className='mb-8 text-base leading-relaxed text-gray-300 sm:text-lg'>
            Learn how infrastructure-backed real estate can generate rental
            <br className='hidden sm:block' />
            income without traditional ownership barriers. Book your
            <br className='hidden sm:block' />
            masterclass in under 60 seconds.
          </p>

          {/* CTA Buttons */}
          <div className='flex flex-col items-start gap-4 sm:flex-row'>
            <button
              onClick={handleRegisterClick}
              className='group flex items-center gap-2 rounded-md bg-blue-500 px-6 py-3 text-base font-semibold text-white shadow-md transition-all duration-200 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-600 dark:shadow-blue-900/30 dark:hover:bg-blue-700'
            >
              Register for Masterclass
              <span className='transition-transform duration-200 group-hover:translate-x-1'>
                →
              </span>
            </button>

            <button
              onClick={onViewDatesClick}
              className='flex items-center gap-2 rounded-md border-2 border-gray-300 bg-transparent px-6 py-3 text-base font-semibold  transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 dark:border-gray-600 text-white hover:bg-gray-800'
            >
              <Calendar className='h-5 w-5' />
              View Available Dates
            </button>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className='absolute bottom-2 left-1/2 z-10 -translate-x-1/2 animate-bounce'>
        <button
          onClick={() => {
            window.scrollTo({
              top: window.innerHeight,
              behavior: 'smooth',
            })
          }}
          className='flex h-10 w-10 items-center justify-center rounded-full border-2 border-gray-400 text-gray-900 transition-colors hover:border-gray-600 hover:bg-gray-100 dark:border-gray-500 dark:text-white dark:hover:border-gray-400 dark:hover:bg-gray-800'
          aria-label='Scroll down'
        >
          <ChevronDown className='h-6 w-6' />
        </button>
      </div>
    </section>
  )
}

export default Hero
