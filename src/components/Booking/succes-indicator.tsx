'use client'

import { CheckCircle2 } from 'lucide-react'

interface SuccessMessageProps {
  userEmail: string
  sessionDate: string
  sessionTime: string
  onReset?: () => void
}

export default function SuccessMessage({
  userEmail,
  sessionDate,
  sessionTime,
  onReset,
}: SuccessMessageProps) {
  const formattedDate = new Date(sessionDate).toLocaleDateString('en-NG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const [hours, minutes] = sessionTime.split(':')
  const timeRef = new Date()
  timeRef.setHours(Number(hours), Number(minutes))
  const formattedTime = timeRef.toLocaleTimeString('en-NG', {
    hour: 'numeric',
    minute: '2-digit',
  })

  return (
    <div className='mx-auto max-w-2xl'>
      <div className='rounded-2xl border border-green-200 bg-white p-8 text-center shadow-sm dark:border-green-800 dark:bg-gray-900 sm:p-12'>
        <div className='mb-6 flex justify-center'>
          <div className='rounded-full bg-green-100 p-4 dark:bg-green-900/30'>
            <CheckCircle2 className='h-16 w-16 text-green-600 dark:text-green-400' />
          </div>
        </div>

        <h2 className='mb-3 text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl'>
          Enrollment Successful!
        </h2>

        <p className='mb-8 text-gray-600 dark:text-gray-400'>
          Your payment has been confirmed and your masterclass session is now
          booked.
        </p>

        <div className='mb-8 space-y-4 rounded-xl bg-gray-50 p-6 text-left dark:bg-gray-800'>
          <div>
            <p className='mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400'>
              Session Details
            </p>
            <p className='text-sm font-medium text-gray-900 dark:text-gray-100'>
              {formattedDate} at {formattedTime}
            </p>
          </div>

          <div>
            <p className='mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400'>
              Confirmation Email
            </p>
            <p className='text-sm font-medium text-gray-900 dark:text-gray-100'>
              Sent to {userEmail}
            </p>
          </div>
        </div>

        <div className='space-y-3 text-sm text-gray-600 dark:text-gray-400'>
          <p>
            A confirmation email with your session link and details has been
            sent to your email address.
          </p>
          <p>
            If you don't see it in your inbox within a few minutes, please check
            your spam folder.
          </p>
        </div>

        {onReset && (
          <button
            type='button'
            onClick={onReset}
            className='mt-8 rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
          >
            Book Another Session
          </button>
        )}
      </div>
    </div>
  )
}
