'use client'

import { useMemo, useState } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/footer'
import { Calendar, Clock } from 'lucide-react'

export default function ConfirmMasterclassSessionPage() {
  const [date, setDate] = useState<string>('')
  const [time, setTime] = useState<string>('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const base = date ? new Date(date) : new Date()
    base.setDate(1)
    return base
  })

  const calendarLabel = useMemo(() => {
    return calendarMonth.toLocaleDateString('en-NG', {
      month: 'long',
      year: 'numeric',
    })
  }, [calendarMonth])

  const calendarDays = useMemo(() => {
    const year = calendarMonth.getFullYear()
    const month = calendarMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const startWeekday = firstDay.getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    const cells: Array<number | null> = []
    for (let i = 0; i < startWeekday; i += 1) {
      cells.push(null)
    }
    for (let day = 1; day <= daysInMonth; day += 1) {
      cells.push(day)
    }

    return cells
  }, [calendarMonth])

  const selectedDay = useMemo(() => {
    if (!date) return null
    const parsed = new Date(date)
    if (Number.isNaN(parsed.getTime())) return null
    if (
      parsed.getFullYear() !== calendarMonth.getFullYear() ||
      parsed.getMonth() !== calendarMonth.getMonth()
    ) {
      return null
    }
    return parsed.getDate()
  }, [date, calendarMonth])

  const formattedDate = useMemo(() => {
    if (!date) return ''

    const parsed = new Date(date)
    if (Number.isNaN(parsed.getTime())) return ''

    return parsed.toLocaleDateString('en-NG', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }, [date])

  const formattedTime = useMemo(() => {
    if (!time) return ''

    const [hours, minutes] = time.split(':')
    if (!hours || !minutes) return ''

    const reference = new Date()
    reference.setHours(Number(hours), Number(minutes))

    return reference.toLocaleTimeString('en-NG', {
      hour: 'numeric',
      minute: '2-digit',
    })
  }, [time])

  const hasSelection = Boolean(formattedDate && formattedTime)

  const handleConfirmSession = async () => {
    if (!hasSelection) return

    setSubmitting(true)
    setSubmitError(null)

    try {
      setSubmitSuccess(true)
    } catch {
      setSubmitError('Unable to confirm session.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <Navbar />
      <main className='bg-gray-50 px-6 py-16 dark:bg-gray-950 sm:px-12 sm:py-20 md:px-16 md:py-24 lg:px-24 lg:py-32 xl:px-32'>
        <div className='mx-auto max-w-5xl'>
          <div className='mb-10 text-center sm:mb-12'>
            <h1 className='mb-3 text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl md:text-5xl'>
              Confirm Your Masterclass Session
            </h1>
            <p className='text-base leading-relaxed text-gray-600 dark:text-gray-300 sm:text-lg'>
              Select your preferred date and time. All sessions are hosted via
              secure in-platform video.
            </p>
          </div>

          <section className='mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-8'>
            <h2 className='mb-1 text-lg font-semibold text-gray-900 dark:text-gray-100'>
              Booking Details
            </h2>
            <p className='text-sm text-gray-600 dark:text-gray-300'>
              Complete your masterclass booking by selecting a date and time that
              works best for you.
            </p>
          </section>

          <section className='rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-8'>
            <div className='mb-6 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-100'>
              <Calendar className='h-5 w-5 text-blue-600 dark:text-blue-400' />
              <span>Select Date and Time</span>
            </div>

            <div className='grid gap-4 sm:grid-cols-2'>
              <div className='space-y-2'>
                <label className='block text-sm font-medium text-gray-900 dark:text-gray-100'>
                  Date
                </label>
                <div className='relative'>
                  <button
                    type='button'
                    onClick={() => setIsCalendarOpen((open) => !open)}
                    className='flex w-full items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-left text-sm text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-800 dark:bg-gray-800 dark:text-gray-100'
                  >
                    <Calendar className='h-4 w-4 text-gray-400 dark:text-gray-500' />
                    <span className='flex-1 truncate'>
                      {formattedDate || 'Select a date'}
                    </span>
                    <span className='text-xs text-gray-500 dark:text-gray-400'>
                      {calendarLabel}
                    </span>
                  </button>

                  {isCalendarOpen && (
                    <div className='absolute z-20 mt-2 w-full rounded-xl border border-gray-200 bg-white p-3 text-xs shadow-lg dark:border-gray-800 dark:bg-gray-900'>
                      <div className='mb-2 flex items-center justify-between'>
                        <button
                          type='button'
                          onClick={() =>
                            setCalendarMonth(
                              (prev) =>
                                new Date(
                                  prev.getFullYear(),
                                  prev.getMonth() - 1,
                                  1,
                                ),
                            )
                          }
                          className='rounded-lg px-2 py-1 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                        >
                          ‹
                        </button>
                        <span className='font-medium text-gray-900 dark:text-gray-100'>
                          {calendarLabel}
                        </span>
                        <button
                          type='button'
                          onClick={() =>
                            setCalendarMonth(
                              (prev) =>
                                new Date(
                                  prev.getFullYear(),
                                  prev.getMonth() + 1,
                                  1,
                                ),
                            )
                          }
                          className='rounded-lg px-2 py-1 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                        >
                          ›
                        </button>
                      </div>

                      <div className='grid grid-cols-7 gap-1 pb-1 text-center text-[11px] text-gray-500 dark:text-gray-400'>
                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day) => (
                          <div key={day}>{day}</div>
                        ))}
                      </div>

                      <div className='grid grid-cols-7 gap-1 text-center text-xs'>
                        {calendarDays.map((day, index) => {
                          if (day === null) {
                            return <div key={index} />
                          }

                          const isSelected = day === selectedDay

                          return (
                            <button
                              key={index}
                              type='button'
                              onClick={() => {
                                const selected = new Date(
                                  calendarMonth.getFullYear(),
                                  calendarMonth.getMonth(),
                                  day,
                                )
                                const iso = selected.toISOString().slice(0, 10)
                                setDate(iso)
                                setIsCalendarOpen(false)
                              }}
                              className={`flex h-8 w-8 items-center justify-center rounded-full ${
                                isSelected
                                  ? 'bg-blue-600 text-white'
                                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800'
                              }`}
                            >
                              {day}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className='space-y-2'>
                <label className='block text-sm font-medium text-gray-900 dark:text-gray-100'>
                  Time
                </label>
                <div className='flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 dark:border-gray-800 dark:bg-gray-800 dark:text-gray-100 dark:focus-within:border-blue-500 dark:focus-within:ring-blue-500/30'>
                  <Clock className='h-4 w-4 text-gray-400 dark:text-gray-500' />
                  <input
                    type='time'
                    value={time}
                    onChange={(event) => setTime(event.target.value)}
                    className='w-full border-none bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none dark:text-gray-100'
                  />
                </div>
              </div>
            </div>

            <div className='mt-6 rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-700 dark:bg-gray-800 dark:text-gray-200'>
              {hasSelection ? (
                <p>
                  You have selected{' '}
                  <span className='font-semibold'>{formattedDate}</span> at{' '}
                  <span className='font-semibold'>{formattedTime}</span>.
                </p>
              ) : (
                <p>Select a date and time to confirm your masterclass session booking.</p>
              )}
            </div>

            <div className='mt-6'>
              <button
                type='button'
                onClick={handleConfirmSession}
                disabled={!hasSelection || submitting}
                className='flex w-full items-center justify-center rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-blue-400'
              >
                {submitting ? 'Confirming...' : 'Confirm Session'}
              </button>
              {submitSuccess && (
                <p className='mt-3 text-sm text-green-600 dark:text-green-400'>
                  Your session is confirmed. A confirmation email has been sent to your inbox.
                </p>
              )}
              {submitError && (
                <p className='mt-3 text-sm text-red-600 dark:text-red-400'>
                  {submitError}
                </p>
              )}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}
