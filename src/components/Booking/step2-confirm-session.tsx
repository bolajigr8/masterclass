// 'use client'

// import { useMemo, useState } from 'react'
// import { Calendar, Clock, AlertCircle, ArrowLeft, Loader2 } from 'lucide-react'
// import {
//   sessionSelectionSchema,
//   type SessionSelectionFormData,
// } from '@/lib/validations'

// interface Step2ConfirmSessionProps {
//   formData: SessionSelectionFormData
//   onNext: (data: SessionSelectionFormData) => void
//   onBack: () => void
// }

// export default function Step2ConfirmSession({
//   formData,
//   onNext,
//   onBack,
// }: Step2ConfirmSessionProps) {
//   const [date, setDate] = useState<string>(formData.date || '')
//   const [time, setTime] = useState<string>(formData.time || '')
//   const [errors, setErrors] = useState<
//     Partial<Record<keyof SessionSelectionFormData, string>>
//   >({})
//   const [isSubmitting, setIsSubmitting] = useState(false)

//   const [isCalendarOpen, setIsCalendarOpen] = useState(false)
//   const [calendarMonth, setCalendarMonth] = useState(() => {
//     const base = date ? new Date(date) : new Date()
//     base.setDate(1)
//     return base
//   })

//   const calendarLabel = useMemo(() => {
//     return calendarMonth.toLocaleDateString('en-NG', {
//       month: 'long',
//       year: 'numeric',
//     })
//   }, [calendarMonth])

//   const calendarDays = useMemo(() => {
//     const year = calendarMonth.getFullYear()
//     const month = calendarMonth.getMonth()
//     const firstDay = new Date(year, month, 1)
//     const startWeekday = firstDay.getDay()
//     const daysInMonth = new Date(year, month + 1, 0).getDate()

//     const cells: Array<number | null> = []
//     for (let i = 0; i < startWeekday; i += 1) {
//       cells.push(null)
//     }
//     for (let day = 1; day <= daysInMonth; day += 1) {
//       cells.push(day)
//     }

//     return cells
//   }, [calendarMonth])

//   const selectedDay = useMemo(() => {
//     if (!date) return null
//     const parsed = new Date(date)
//     if (Number.isNaN(parsed.getTime())) return null
//     if (
//       parsed.getFullYear() !== calendarMonth.getFullYear() ||
//       parsed.getMonth() !== calendarMonth.getMonth()
//     ) {
//       return null
//     }
//     return parsed.getDate()
//   }, [date, calendarMonth])

//   const formattedDate = useMemo(() => {
//     if (!date) return ''

//     const parsed = new Date(date)
//     if (Number.isNaN(parsed.getTime())) return ''

//     return parsed.toLocaleDateString('en-NG', {
//       weekday: 'long',
//       year: 'numeric',
//       month: 'long',
//       day: 'numeric',
//     })
//   }, [date])

//   const formattedTime = useMemo(() => {
//     if (!time) return ''

//     const [hours, minutes] = time.split(':')
//     if (!hours || !minutes) return ''

//     const reference = new Date()
//     reference.setHours(Number(hours), Number(minutes))

//     return reference.toLocaleTimeString('en-NG', {
//       hour: 'numeric',
//       minute: '2-digit',
//     })
//   }, [time])

//   const hasSelection = Boolean(formattedDate && formattedTime)

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()

//     // console.log('=== Step 2 Form Submit ===')
//     // console.log('Date:', date)
//     // console.log('Time:', time)

//     setIsSubmitting(true)
//     setErrors({})

//     try {
//       // Validate session data
//       const validatedData = sessionSelectionSchema.parse({ date, time })
//       // console.log('Validation passed:', validatedData)

//       // Move to next step
//       onNext(validatedData)
//       // console.log('onNext called successfully')
//     } catch (error: any) {
//       console.error('Validation error:', error)

//       if (error.errors) {
//         const newErrors: Partial<
//           Record<keyof SessionSelectionFormData, string>
//         > = {}
//         error.errors.forEach((err: any) => {
//           // console.log('Field error:', err.path[0], err.message)
//           if (err.path[0]) {
//             newErrors[err.path[0] as keyof SessionSelectionFormData] =
//               err.message
//           }
//         })
//         setErrors(newErrors)
//       } else {
//         // Generic error
//         // console.error('Unknown validation error:', error)
//         alert('Validation failed: ' + (error.message || 'Unknown error'))
//       }

//       setIsSubmitting(false)
//     }
//   }

//   return (
//     <div className='mx-auto max-w-2xl'>
//       <div className='mb-8 text-center'>
//         <h2 className='mb-2 text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl'>
//           Select Your Session
//         </h2>
//         <p className='text-gray-600 dark:text-gray-400'>
//           Choose your preferred date and time for the masterclass
//         </p>
//       </div>

//       <form onSubmit={handleSubmit} className='space-y-6'>
//         <div className='rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-8'>
//           <div className='mb-6 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-100'>
//             <Calendar className='h-5 w-5 text-blue-600 dark:text-blue-400' />
//             <span>Select Date and Time</span>
//           </div>

//           <div className='grid gap-6 sm:grid-cols-2'>
//             {/* Date Field */}
//             <div className='space-y-2'>
//               <label className='block text-sm font-medium text-gray-900 dark:text-gray-100'>
//                 Date *
//               </label>
//               <div className='relative'>
//                 <button
//                   type='button'
//                   onClick={() => setIsCalendarOpen((open) => !open)}
//                   disabled={isSubmitting}
//                   className={`flex w-full items-center gap-3 rounded-xl border ${
//                     errors.date
//                       ? 'border-red-500 focus:ring-red-500'
//                       : 'border-gray-200 focus:ring-blue-500'
//                   } bg-gray-50 px-4 py-3 text-left text-sm text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-800 dark:bg-gray-800 dark:text-gray-100`}
//                 >
//                   <Calendar className='h-4 w-4 text-gray-400 dark:text-gray-500' />
//                   <span className='flex-1 truncate'>
//                     {formattedDate || 'Select a date'}
//                   </span>
//                   <span className='text-xs text-gray-500 dark:text-gray-400'>
//                     {calendarLabel}
//                   </span>
//                 </button>

//                 {isCalendarOpen && (
//                   <div className='absolute z-20 mt-2 w-full rounded-xl border border-gray-200 bg-white p-3 text-xs shadow-lg dark:border-gray-800 dark:bg-gray-900'>
//                     <div className='mb-2 flex items-center justify-between'>
//                       <button
//                         type='button'
//                         onClick={() =>
//                           setCalendarMonth(
//                             (prev) =>
//                               new Date(
//                                 prev.getFullYear(),
//                                 prev.getMonth() - 1,
//                                 1,
//                               ),
//                           )
//                         }
//                         className='rounded-lg px-2 py-1 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
//                       >
//                         ‹
//                       </button>
//                       <span className='font-medium text-gray-900 dark:text-gray-100'>
//                         {calendarLabel}
//                       </span>
//                       <button
//                         type='button'
//                         onClick={() =>
//                           setCalendarMonth(
//                             (prev) =>
//                               new Date(
//                                 prev.getFullYear(),
//                                 prev.getMonth() + 1,
//                                 1,
//                               ),
//                           )
//                         }
//                         className='rounded-lg px-2 py-1 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
//                       >
//                         ›
//                       </button>
//                     </div>

//                     <div className='grid grid-cols-7 gap-1 pb-1 text-center text-[11px] text-gray-500 dark:text-gray-400'>
//                       {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day) => (
//                         <div key={day}>{day}</div>
//                       ))}
//                     </div>

//                     <div className='grid grid-cols-7 gap-1 text-center text-xs'>
//                       {calendarDays.map((day, index) => {
//                         if (day === null) {
//                           return <div key={index} />
//                         }

//                         const isSelected = day === selectedDay

//                         return (
//                           <button
//                             key={index}
//                             type='button'
//                             onClick={() => {
//                               const selected = new Date(
//                                 calendarMonth.getFullYear(),
//                                 calendarMonth.getMonth(),
//                                 day,
//                               )
//                               const iso = selected.toISOString().slice(0, 10)
//                               // console.log('Date selected:', iso)
//                               setDate(iso)
//                               setIsCalendarOpen(false)
//                               if (errors.date) {
//                                 setErrors((prev) => ({
//                                   ...prev,
//                                   date: undefined,
//                                 }))
//                               }
//                             }}
//                             className={`flex h-8 w-8 items-center justify-center rounded-full ${
//                               isSelected
//                                 ? 'bg-blue-600 text-white'
//                                 : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800'
//                             }`}
//                           >
//                             {day}
//                           </button>
//                         )
//                       })}
//                     </div>
//                   </div>
//                 )}
//               </div>
//               {/* {errors.date && (
//                 <div className='flex items-center gap-1 text-sm text-red-600'>
//                   <AlertCircle className='h-4 w-4' />
//                   <span>{errors.date}</span>
//                 </div>
//               )} */}
//             </div>

//             {/* Time Field */}
//             <div className='space-y-2'>
//               <label className='block text-sm font-medium text-gray-900 dark:text-gray-100'>
//                 Time *
//               </label>
//               <div
//                 className={`flex items-center gap-3 rounded-xl border ${
//                   errors.time
//                     ? 'border-red-500 focus-within:ring-red-500'
//                     : 'border-gray-200 focus-within:ring-blue-500'
//                 } bg-gray-50 px-4 py-3 text-sm text-gray-900 focus-within:border-transparent focus-within:bg-white focus-within:ring-2 dark:border-gray-800 dark:bg-gray-800 dark:text-gray-100`}
//               >
//                 <Clock className='h-4 w-4 text-gray-400 dark:text-gray-500' />
//                 <input
//                   type='time'
//                   value={time}
//                   onChange={(e) => {
//                     // console.log('Time selected:', e.target.value)
//                     setTime(e.target.value)
//                     if (errors.time) {
//                       setErrors((prev) => ({ ...prev, time: undefined }))
//                     }
//                   }}
//                   disabled={isSubmitting}
//                   className='w-full border-none bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-100'
//                 />
//               </div>
//               {/* {errors.time && (
//                 <div className='flex items-center gap-1 text-sm text-red-600'>
//                   <AlertCircle className='h-4 w-4' />
//                   <span>{errors.time}</span>
//                 </div>
//               )} */}
//             </div>
//           </div>

//           {/* Selection Summary */}
//           <div className='mt-6 rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-700 dark:bg-gray-800 dark:text-gray-200'>
//             {hasSelection ? (
//               <p>
//                 You have selected{' '}
//                 <span className='font-semibold'>{formattedDate}</span> at{' '}
//                 <span className='font-semibold'>{formattedTime}</span>.
//               </p>
//             ) : (
//               <p>
//                 Select a date and time to confirm your masterclass session
//                 booking.
//               </p>
//             )}
//           </div>

//           {/* Debug Info - Remove after testing */}
//           {/* <div className='mt-4 rounded-lg bg-yellow-50 p-3 text-xs dark:bg-yellow-900/20'>
//             <p className='font-semibold text-yellow-800 dark:text-yellow-300'>
//               Debug Info:
//             </p>
//             <p className='text-yellow-700 dark:text-yellow-400'>
//               Date: {date || 'Not selected'}
//             </p>
//             <p className='text-yellow-700 dark:text-yellow-400'>
//               Time: {time || 'Not selected'}
//             </p>
//           </div> */}
//         </div>

//         {/* Navigation Buttons */}
//         <div className='flex gap-4'>
//           <button
//             type='button'
//             onClick={onBack}
//             disabled={isSubmitting}
//             className='flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
//           >
//             <ArrowLeft className='h-4 w-4' />
//             Back
//           </button>
//           <button
//             type='submit'
//             disabled={!hasSelection || isSubmitting}
//             className='flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-blue-400'
//           >
//             {isSubmitting ? (
//               <>
//                 <Loader2 className='h-4 w-4 animate-spin' />
//                 <span>Processing...</span>
//               </>
//             ) : (
//               'Continue to Payment'
//             )}
//           </button>
//         </div>
//       </form>
//     </div>
//   )
// }

'use client'

import { useMemo, useState } from 'react'
import { Calendar, Clock, AlertCircle, ArrowLeft, Loader2 } from 'lucide-react'
import {
  sessionSelectionSchema,
  type SessionSelectionFormData,
} from '@/lib/validations'

interface Step2ConfirmSessionProps {
  formData: SessionSelectionFormData
  onNext: (data: SessionSelectionFormData) => void
  onBack: () => void
}

export default function Step2ConfirmSession({
  formData,
  onNext,
  onBack,
}: Step2ConfirmSessionProps) {
  const [date, setDate] = useState<string>(formData.date || '')
  const [time, setTime] = useState<string>(formData.time || '')
  const [errors, setErrors] = useState<
    Partial<Record<keyof SessionSelectionFormData, string>>
  >({})
  const [isSubmitting, setIsSubmitting] = useState(false)
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
    for (let i = 0; i < startWeekday; i++) cells.push(null)
    for (let day = 1; day <= daysInMonth; day++) cells.push(day)
    return cells
  }, [calendarMonth])

  const selectedDay = useMemo(() => {
    if (!date) return null
    const parsed = new Date(date)
    if (isNaN(parsed.getTime())) return null
    if (
      parsed.getFullYear() !== calendarMonth.getFullYear() ||
      parsed.getMonth() !== calendarMonth.getMonth()
    )
      return null
    return parsed.getDate()
  }, [date, calendarMonth])

  const formattedDate = useMemo(() => {
    if (!date) return ''
    const parsed = new Date(date)
    if (isNaN(parsed.getTime())) return ''
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
    const ref = new Date()
    ref.setHours(Number(hours), Number(minutes))
    return ref.toLocaleTimeString('en-NG', {
      hour: 'numeric',
      minute: '2-digit',
    })
  }, [time])

  const hasSelection = Boolean(formattedDate && formattedTime)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrors({})

    const parsed = sessionSelectionSchema.safeParse({ date, time })

    if (!parsed.success) {
      const newErrors: Partial<Record<keyof SessionSelectionFormData, string>> =
        {}
      parsed.error.issues.forEach((err) => {
        if (err.path[0])
          newErrors[err.path[0] as keyof SessionSelectionFormData] = err.message
      })
      setErrors(newErrors)
      setIsSubmitting(false)
      return
    }

    onNext(parsed.data)
    // Parent handles setCurrentStep — no need to reset isSubmitting
  }

  return (
    <div className='mx-auto max-w-2xl'>
      <div className='mb-8 text-center'>
        <h2 className='mb-2 text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl'>
          Select Your Session
        </h2>
        <p className='text-gray-600 dark:text-gray-400'>
          Choose your preferred date and time for the masterclass
        </p>
      </div>

      <form onSubmit={handleSubmit} className='space-y-6'>
        <div className='rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-8'>
          <div className='mb-6 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-100'>
            <Calendar className='h-5 w-5 text-blue-600 dark:text-blue-400' />
            <span>Select Date and Time</span>
          </div>

          <div className='grid gap-6 sm:grid-cols-2'>
            {/* Date */}
            <div className='space-y-2'>
              <label className='block text-sm font-medium text-gray-900 dark:text-gray-100'>
                Date *
              </label>
              <div className='relative'>
                <button
                  type='button'
                  onClick={() => setIsCalendarOpen((o) => !o)}
                  disabled={isSubmitting}
                  className={`flex w-full items-center gap-3 rounded-xl border ${
                    errors.date ? 'border-red-500' : 'border-gray-200'
                  } bg-gray-50 px-4 py-3 text-left text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-800 dark:bg-gray-800 dark:text-gray-100`}
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
                      {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                        <div key={i}>{d}</div>
                      ))}
                    </div>
                    <div className='grid grid-cols-7 gap-1 text-center text-xs'>
                      {calendarDays.map((day, idx) => {
                        if (day === null) return <div key={idx} />
                        const isSelected = day === selectedDay
                        const isToday =
                          new Date().getDate() === day &&
                          new Date().getMonth() === calendarMonth.getMonth() &&
                          new Date().getFullYear() ===
                            calendarMonth.getFullYear()
                        return (
                          <button
                            key={idx}
                            type='button'
                            onClick={() => {
                              const selected = new Date(
                                calendarMonth.getFullYear(),
                                calendarMonth.getMonth(),
                                day,
                              )
                              setDate(selected.toISOString().slice(0, 10))
                              setIsCalendarOpen(false)
                              if (errors.date)
                                setErrors((prev) => ({
                                  ...prev,
                                  date: undefined,
                                }))
                            }}
                            className={`flex h-8 w-8 items-center justify-center rounded-full ${
                              isSelected
                                ? 'bg-blue-600 text-white'
                                : isToday
                                  ? 'border border-blue-300 text-blue-600 dark:border-blue-700 dark:text-blue-400'
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
              {errors.date && (
                <div className='flex items-center gap-1 text-sm text-red-600 dark:text-red-400'>
                  <AlertCircle className='h-4 w-4' />
                  <span>{errors.date}</span>
                </div>
              )}
            </div>

            {/* Time */}
            <div className='space-y-2'>
              <label className='block text-sm font-medium text-gray-900 dark:text-gray-100'>
                Time *
              </label>
              <div
                className={`flex items-center gap-3 rounded-xl border ${
                  errors.time ? 'border-red-500' : 'border-gray-200'
                } bg-gray-50 px-4 py-3 text-sm text-gray-900 focus-within:border-transparent focus-within:ring-2 focus-within:ring-blue-500 dark:border-gray-800 dark:bg-gray-800 dark:text-gray-100`}
              >
                <Clock className='h-4 w-4 text-gray-400 dark:text-gray-500' />
                <input
                  type='time'
                  value={time}
                  onChange={(e) => {
                    setTime(e.target.value)
                    if (errors.time)
                      setErrors((prev) => ({ ...prev, time: undefined }))
                  }}
                  disabled={isSubmitting}
                  className='w-full border-none bg-transparent text-sm text-gray-900 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-100'
                />
              </div>
              {errors.time && (
                <div className='flex items-center gap-1 text-sm text-red-600 dark:text-red-400'>
                  <AlertCircle className='h-4 w-4' />
                  <span>{errors.time}</span>
                </div>
              )}
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
              <p>
                Select a date and time to confirm your masterclass session
                booking.
              </p>
            )}
          </div>
        </div>

        <div className='flex gap-4'>
          <button
            type='button'
            onClick={onBack}
            disabled={isSubmitting}
            className='flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
          >
            <ArrowLeft className='h-4 w-4' />
            Back
          </button>
          <button
            type='submit'
            disabled={!hasSelection || isSubmitting}
            className='flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-blue-400'
          >
            {isSubmitting ? (
              <>
                <Loader2 className='h-4 w-4 animate-spin' />
                <span>Processing…</span>
              </>
            ) : (
              'Continue to Payment'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
