'use client'

import React, { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import Link from 'next/link'
import AnimatedSection from './animated-section'

interface FAQItem {
  question: string
  answer: string
}

export const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const faqs: FAQItem[] = [
    {
      question: "How does Trila's ownership model work?",
      answer:
        'Trila uses an infrastructure-backed fractional ownership model that gives multiple investors in one share of institutional-grade real estate. Each property is structured through a legal framework that provides transparent ownership, rental income distribution, and professional management oversight. This eliminates traditional barriers like high capital requirements and opaque processes.',
    },
    {
      question: 'Is this a live session?',
      answer:
        'Yes, this is a live interactive session where you can ask questions and engage directly with our infrastructure experts. Each masterclass is limited to ensure quality interaction and personalized attention.',
    },
    {
      question: 'How do I access the video room?',
      answer:
        'Once you register, you will receive an email with your unique access link and meeting credentials. Simply click the link 5-10 minutes before the scheduled time to join the video room.',
    },
    {
      question: 'What if I pay via bank transfer?',
      answer:
        'Bank transfer payments are processed within 24 hours. After payment, send your receipt to payments@Trila.com with your registration details. You will receive confirmation once verified.',
    },
    {
      question: 'Can I re-schedule my session?',
      answer:
        'Yes, you can reschedule up to 24 hours before your session. Contact our support team with your preferred new date, and we will accommodate you based on availability.',
    },
    {
      question: 'Are sessions recorded?',
      answer:
        'Yes, all sessions are recorded. Registered participants receive access to the recording within 48 hours after the session, available for 30 days.',
    },
    {
      question: "What's the difference between Virtual and Full Access?",
      answer:
        'Virtual Access includes the live masterclass and recording. Full Access adds exclusive materials, 1-on-1 consultation, priority investment opportunities, and extended resource access.',
    },
    {
      question: 'Is my payment information secure?',
      answer:
        'Absolutely. We use industry-standard encryption and secure payment processors. Your financial information is never stored on our servers and all transactions are PCI-DSS compliant.',
    },
  ]

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <AnimatedSection>
      <section className='bg-white px-6 py-16 dark:bg-gray-950 sm:px-12 sm:py-20 md:px-16 md:py-24 lg:px-24 lg:py-32 xl:px-32'>
        <div className='mx-auto max-w-4xl'>
          {/* Section Header */}
          <div className='mb-12 text-center'>
            <h2 className='mb-4 text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl md:text-5xl'>
              Frequently Asked Questions
            </h2>
            <p className='text-base leading-relaxed text-gray-600 dark:text-gray-300 sm:text-lg'>
              Everything you need to know about the masterclass and enrollment
              process.
            </p>
          </div>

          {/* FAQ Accordion */}
          <div className='mb-12 space-y-4'>
            {faqs.map((faq, index) => (
              <div
                key={index}
                className='overflow-hidden rounded-lg border border-gray-200 bg-gray-50 transition-all hover:-translate-y-0.5 hover:shadow-sm dark:border-gray-800 dark:bg-gray-900'
              >
                {/* Question Button */}
                <button
                  onClick={() => toggleFAQ(index)}
                  className='flex w-full items-center justify-between gap-4 p-6 text-left transition-colors hover:bg-gray-100 dark:hover:bg-gray-800'
                >
                  <span className='text-base font-semibold text-gray-900 dark:text-white sm:text-lg'>
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-gray-600 transition-transform dark:text-gray-400 ${
                      openIndex === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Answer */}
                {openIndex === index && (
                  <div className='border-t border-gray-200 bg-white px-6 py-4 dark:border-gray-800 dark:bg-gray-950'>
                    <p className='text-sm leading-relaxed text-gray-600 dark:text-gray-300 sm:text-base'>
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Contact Support CTA */}
          <div className='text-center'>
            <p className='mb-4 text-base text-gray-600 dark:text-gray-300'>
              Still have questions?
            </p>
            <Link
              href='/contact'
              className='inline-block rounded-md border-2 border-gray-300 bg-transparent px-6 py-3 text-base font-semibold text-gray-900 transition-all duration-200 hover:bg-gray-100 dark:border-gray-700 dark:text-white dark:hover:bg-gray-900'
            >
              Contact Support
            </Link>
          </div>
        </div>
      </section>
    </AnimatedSection>
  )
}

export default FAQ
