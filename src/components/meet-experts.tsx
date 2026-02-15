import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import AnimatedSection from './animated-section'

interface Expert {
  name: string
  title: string
  description: string
  imageUrl: string
  profileUrl: string
}

export const MeetTheExperts: React.FC = () => {
  const experts: Expert[] = [
    {
      name: 'Adebayo Ogunlesi',
      title: 'Chief Investment Officer',
      description:
        'With over 15 years in infrastructure-backed real estate, Adebayo has structured portfolios worth over $650k, specializing in democratized ownership models and institutional-grade asset management.',
      imageUrl: '/experts.png',
      profileUrl: '/experts/adebayo-ogunlesi',
    },
    {
      name: 'Chioma Nwankwo',
      title: 'Head of Infrastructure Development',
      description:
        "Chioma leads Trila's infrastructure development initiatives, bringing deep expertise in fractional ownership frameworks and regulatory compliance across African real estate markets.",
      imageUrl: '/experts.png',
      profileUrl: '/experts/chioma-nwankwo',
    },
    {
      name: 'Funmilayo Adeyemi',
      title: 'Director of Investor Relations',
      description:
        'Funmilayo specializes in guiding high-net-worth individuals through structured real estate investments, with a focus on rental income optimization and long-term wealth preservation.',
      imageUrl: '/experts.png',
      profileUrl: '/experts/funmilayo-adeyemi',
    },
  ]

  return (
    <AnimatedSection>
      <section className='bg-gray-50 px-6 py-16 dark:bg-gray-950 sm:px-12 sm:py-20 md:px-16 md:py-24 lg:px-24 lg:py-32 xl:px-32'>
        <div className='mx-auto max-w-7xl'>
        {/* Section Header */}
        <div className='mb-12 text-center'>
          <h2 className='mb-4 text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl md:text-5xl'>
            Meet the Infrastructure Experts
          </h2>
          <p className='mx-auto max-w-3xl text-base leading-relaxed text-gray-600 dark:text-gray-300 sm:text-lg'>
            Learn from industry leaders who have pioneered structured real
            estate investment models across emerging markets.
          </p>
        </div>

        {/* Experts Grid */}
        <div className='grid gap-8 sm:grid-cols-2 lg:grid-cols-3'>
          {experts.map((expert, index) => (
            <div
              key={index}
              className='group overflow-hidden rounded-lg bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:bg-gray-900 dark:shadow-gray-900/50 dark:hover:shadow-gray-900/70'
            >
              {/* Expert Image */}
              <div className='relative h-64 w-full overflow-hidden bg-gray-200 dark:bg-gray-800'>
                <Image
                  src={expert.imageUrl}
                  alt={expert.name}
                  fill
                  className='object-cover transition-transform duration-300 group-hover:scale-105'
                />
              </div>

              {/* Expert Info */}
              <div className='p-6'>
                {/* Name */}
                <h3 className='mb-2 text-xl font-bold text-gray-900 dark:text-white'>
                  {expert.name}
                </h3>

                {/* Title */}
                <p className='mb-4 text-sm font-medium text-blue-500 dark:text-blue-400'>
                  {expert.title}
                </p>

                {/* Description */}
                <p className='mb-4 text-sm leading-relaxed text-gray-600 dark:text-gray-300'>
                  {expert.description}
                </p>

                {/* View Profile Link */}
                <Link
                  href={expert.profileUrl}
                  className='inline-flex items-center gap-2 text-sm font-medium text-blue-500 transition-colors hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300'
                >
                  View Profile
                  <ArrowRight className='h-4 w-4 transition-transform group-hover:translate-x-1' />
                </Link>
              </div>
            </div>
          ))}
        </div>
        </div>
      </section>
    </AnimatedSection>
  )
}

export default MeetTheExperts
