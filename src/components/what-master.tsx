import React from 'react'
import { Building2, TrendingUp, Target, Users } from 'lucide-react'
import AnimatedSection from './animated-section'

interface MasteryCard {
  icon: React.ReactNode
  title: string
  description: string
}

export const WhatYouWillMaster: React.FC = () => {
  const masteryCards: MasteryCard[] = [
    {
      icon: <Building2 className='h-6 w-6' />,
      title: 'The $300T Asset Shift',
      description:
        'Master the foundational principles of infrastructure-backed property ownership and how institutional models democratize access.',
    },
    {
      icon: <TrendingUp className='h-6 w-6' />,
      title: 'Deal Structuring & Funding Clarity',
      description:
        'Understand the mechanics of generating passive rental income through fractional ownership and optimized capital allocation.',
    },
    {
      icon: <Target className='h-6 w-6' />,
      title: 'The Developer Fast-Track Blueprint',
      description:
        'Learn how infrastructure-grade access enables market-making frameworks and joint-venture professional real estate.',
    },
    {
      icon: <Users className='h-6 w-6' />,
      title: 'Investor & Zero-Up Strategy',
      description:
        'Experience a comprehensive demonstration of the Trila platform, from registration to thoughtful participation.',
    },
  ]

  return (
    <AnimatedSection>
      <section className='bg-white px-6 py-16 dark:bg-gray-950 sm:px-12 sm:py-20 md:px-16 md:py-24 lg:px-24 lg:py-32 xl:px-32'>
        <div className='mx-auto max-w-7xl'>
        {/* Section Header */}
        <div className='mb-12 text-center'>
          <h2 className='mb-6 text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl md:text-5xl'>
            What You’ll Master
          </h2>

          <div className='mx-auto max-w-4xl space-y-4 text-base leading-relaxed text-gray-600 dark:text-gray-300 sm:text-lg'>
            <p>
              This masterclass is designed for forward-thinking individuals
              seeking to understand how property ownership is being restructured
              through infrastructure-backed models. Trila democratizes access to
              institutional-grade real estate by removing traditional
              barriers—high capital requirements, opaque processes, and complex
              management overhead.
            </p>

            <p>
              You’ll learn the mechanics of rental income generation through
              fractional ownership, how infrastructure provides stability and
              transparency, and the risk management frameworks that protect your
              investment. This isn’t theory—it’s a practical deep dive into
              capital allocation systems that work, supported by real
              infrastructure and real assets.
            </p>

            <p>
              Whether you’re beginning your wealth-building journey or
              diversifying an existing portfolio, this session provides the
              clarity and framework needed to make informed decisions in the
              evolving landscape of structured real estate investment.
            </p>
          </div>
        </div>

          {/* Mastery Cards Grid */}
          <div className='grid gap-6 sm:grid-cols-2 lg:gap-8'>
            {masteryCards.map((card, index) => (
              <div
                key={index}
                className='group rounded-lg border border-gray-200 bg-gray-50 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-blue-500 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900 dark:hover:border-blue-500 dark:hover:shadow-gray-900/50 sm:p-8'
              >
              {/* Icon */}
              <div className='mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-500 transition-colors group-hover:bg-blue-500 group-hover:text-white dark:bg-blue-900/30 dark:text-blue-400 dark:group-hover:bg-blue-600 dark:group-hover:text-white'>
                {card.icon}
              </div>

              {/* Title */}
              <h3 className='mb-3 text-xl font-bold text-gray-900 dark:text-white'>
                {card.title}
              </h3>

                {/* Description */}
                <p className='text-sm leading-relaxed text-gray-600 dark:text-gray-300 sm:text-base'>
                  {card.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </AnimatedSection>
  )
}

export default WhatYouWillMaster
