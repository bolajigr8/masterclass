'use client'

import { useState } from 'react'
import { Calendar, Phone, Mail, User } from 'lucide-react'
import { useRouter } from 'next/navigation'
import AnimatedSection from './animated-section'

export const ReserveAccessSection = () => {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [preferredDate, setPreferredDate] = useState('')

  const handleContinue = () => {
    if (typeof window !== 'undefined') {
      const payload = {
        fullName,
        email,
        phone,
        preferredDate,
      }

      window.localStorage.setItem('reserveAccess', JSON.stringify(payload))
    }

    router.push('/finalize-enrollment')
  }

  return (
    <AnimatedSection>
      <section
        id='reserve-access'
        className='bg-gray-50 px-6 py-16 dark:bg-gray-950 sm:px-12 sm:py-20 md:px-16 md:py-24 lg:px-24 lg:py-32 xl:px-32'
      >
        <div className='mx-auto max-w-3xl'>
        <div className='mb-10 text-center sm:mb-12'>
          <h2 className='mb-3 text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl md:text-5xl'>
            Reserve Your Access
          </h2>
          <p className='text-base leading-relaxed text-gray-600 dark:text-gray-300 sm:text-lg'>
            Complete this form to secure your place in the next available
            masterclass session.
          </p>
        </div>

        <div className='rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-8'>
          <div className='space-y-5 sm:space-y-6'>
            <div className='space-y-2'>
              <label className='block text-sm font-medium text-gray-900 dark:text-gray-100'>
                Full Name
              </label>
              <div className='flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 dark:border-gray-800 dark:bg-gray-800 dark:text-gray-100 dark:focus-within:border-blue-500 dark:focus-within:ring-blue-500/30'>
                <User className='h-4 w-4 text-gray-400 dark:text-gray-500' />
                <input
                  type='text'
                  placeholder='Enter your full name'
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  className='w-full border-none bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none dark:text-gray-100'
                />
              </div>
            </div>

            <div className='space-y-2'>
              <label className='block text-sm font-medium text-gray-900 dark:text-gray-100'>
                Email Address
              </label>
              <div className='flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 dark:border-gray-800 dark:bg-gray-800 dark:text-gray-100 dark:focus-within:border-blue-500 dark:focus-within:ring-blue-500/30'>
                <Mail className='h-4 w-4 text-gray-400 dark:text-gray-500' />
                <input
                  type='email'
                  placeholder='your.email@example.com'
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className='w-full border-none bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none dark:text-gray-100'
                />
              </div>
            </div>

            <div className='space-y-2'>
              <label className='block text-sm font-medium text-gray-900 dark:text-gray-100'>
                Phone Number
              </label>
              <div className='flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 dark:border-gray-800 dark:bg-gray-800 dark:text-gray-100 dark:focus-within:border-blue-500 dark:focus-within:ring-blue-500/30'>
                <Phone className='h-4 w-4 text-gray-400 dark:text-gray-500' />
                <input
                  type='tel'
                  placeholder='+234 XXX XXX XXXX'
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  className='w-full border-none bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none dark:text-gray-100'
                />
              </div>
            </div>

            <div className='space-y-2'>
              <label className='block text-sm font-medium text-gray-900 dark:text-gray-100'>
                Preferred Session Date
              </label>
              <div className='flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 dark:border-gray-800 dark:bg-gray-800 dark:text-gray-100 dark:focus-within:border-blue-500 dark:focus-within:ring-blue-500/30'>
                <Calendar className='h-4 w-4 text-gray-400 dark:text-gray-500' />
                <input
                  type='date'
                  value={preferredDate}
                  onChange={(event) => setPreferredDate(event.target.value)}
                  className='w-full border-none bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none dark:text-gray-100'
                />
              </div>
            </div>

            <div className='pt-2'>
              <button
                type='button'
                onClick={handleContinue}
                className='flex w-full items-center justify-center rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
              >
                <span>Continue to Booking</span>
                <span className='ml-2 text-lg'>→</span>
              </button>
            </div>
          </div>
        </div>
        </div>
      </section>
    </AnimatedSection>
  )
}

export default ReserveAccessSection
