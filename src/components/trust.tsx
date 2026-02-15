import React, { useMemo } from 'react'
import { Users, Award, TrendingUp, Star } from 'lucide-react'
import AnimatedSection from './animated-section'
import CountUp from './count-up'

interface Stat {
  icon: React.ReactNode
  value: string
  label: string
}

interface Testimonial {
  rating: number
  quote: string
  name: string
  title: string
}

export const TrustedByInvestors: React.FC = () => {
  const parsedStats = useMemo(
    () => {
      const baseStats: Stat[] = [
        {
          icon: <Users className='h-6 w-6' />,
          value: '200+',
          label: 'Participants',
        },
        {
          icon: <Award className='h-6 w-6' />,
          value: '95%',
          label: 'Satisfaction Rate',
        },
        {
          icon: <TrendingUp className='h-6 w-6' />,
          value: '₦2.5B+',
          label: 'Assets Under Management',
        },
      ]

      return baseStats.map((stat) => {
        const raw = stat.value.replace(/[^\d.]/g, '')
        const numeric = Number(raw || '0')
        const trimmed = stat.value.trim()
        const prefix = trimmed.startsWith('₦') ? '₦' : ''

        let suffix = ''
        if (trimmed.endsWith('B+')) {
          suffix = 'B+'
        } else if (trimmed.endsWith('+')) {
          suffix = '+'
        } else if (trimmed.endsWith('%')) {
          suffix = '%'
        }

        const target = numeric

        return {
          ...stat,
          target,
          prefix,
          suffix,
        }
      })
    },
    [],
  )

  const testimonials: Testimonial[] = [
    {
      rating: 5,
      quote:
        'The Trila masterclass fundamentally changed how I view property ownership. The democratized model provides clarity and confidence I never experienced with traditional real estate.',
      name: 'Oluwaseun Adelola',
      title: 'Investment Analyst',
    },
    {
      rating: 5,
      quote:
        'It was demystifying what fractional ownership until this session. The breakdown of rental income mechanics and risk management was exactly what I needed to make an informed decision.',
      name: 'Amaka Okonkwo',
      title: 'Business Owner',
    },
    {
      rating: 5,
      quote:
        'Professional, comprehensive, and institutional-grade content. This isn’t entry-level education—it’s the kind of strategic framework I’d expect from tier-one investment firms.',
      name: 'Ibrahim Musa',
      title: 'Financial Consultant',
    },
  ]

  return (
    <AnimatedSection>
      <section className='bg-gray-50 px-6 py-16 dark:bg-gray-900 sm:px-12 sm:py-20 md:px-16 md:py-24 lg:px-24 lg:py-32 xl:px-32'>
        <div className='mx-auto max-w-7xl'>
        {/* Section Header */}
        <div className='mb-12 text-center'>
          <h2 className='mb-4 text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl md:text-5xl'>
            Trusted by Forward-Thinking Investors
          </h2>
          <p className='mx-auto max-w-3xl text-base leading-relaxed text-gray-600 dark:text-gray-300 sm:text-lg'>
            Join hundreds of professionals who have transformed their
            understanding of structured real estate investment.
          </p>
        </div>

        <div className='mb-16 grid gap-6 sm:grid-cols-3'>
          {parsedStats.map((stat, index) => (
            <div
              key={index}
              className='rounded-lg bg-white p-6 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:bg-gray-800 dark:hover:bg-gray-750'
            >
              {/* Icon */}
              <div className='mb-4 flex justify-center'>
                <div className='flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-500 dark:bg-blue-500/10 dark:text-blue-400'>
                  {stat.icon}
                </div>
              </div>

              <div className='mb-2 text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl'>
                <CountUp
                  value={stat.target}
                  prefix={stat.prefix}
                  suffix={stat.suffix}
                />
              </div>

              {/* Label */}
              <div className='text-sm text-gray-600 dark:text-gray-400'>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Testimonials Grid */}
        <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className='rounded-lg bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:bg-gray-800 dark:hover:bg-gray-750'
            >
              {/* Star Rating */}
              <div className='mb-4 flex gap-1'>
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className='h-5 w-5 fill-blue-500 text-blue-500 dark:fill-blue-400 dark:text-blue-400'
                  />
                ))}
              </div>

              {/* Quote */}
              <p className='mb-6 text-sm leading-relaxed text-gray-600 dark:text-gray-300'>
                &ldquo;{testimonial.quote}&rdquo;
              </p>

              {/* Author */}
              <div>
                <div className='font-semibold text-gray-900 dark:text-white'>
                  {testimonial.name}
                </div>
                <div className='text-sm text-gray-600 dark:text-gray-400'>
                  {testimonial.title}
                </div>
              </div>
            </div>
          ))}
        </div>
        </div>
      </section>
    </AnimatedSection>
  )
}

export default TrustedByInvestors
