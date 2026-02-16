'use client'

import { useState } from 'react'
import { User, Mail, Phone, AlertCircle, Loader2 } from 'lucide-react'
import { userInfoSchema, type UserInfoFormData } from '@/lib/validations'

interface Step1UserInfoProps {
  formData: UserInfoFormData
  onNext: (data: UserInfoFormData) => void
}

export default function Step1UserInfo({
  formData,
  onNext,
}: Step1UserInfoProps) {
  const [localData, setLocalData] = useState<UserInfoFormData>(formData)
  const [errors, setErrors] = useState<
    Partial<Record<keyof UserInfoFormData, string>>
  >({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (field: keyof UserInfoFormData, value: string) => {
    setLocalData((prev) => ({ ...prev, [field]: value }))
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrors({})

    try {
      // Validate form data
      const validatedData = userInfoSchema.parse(localData)

      // Move to next step
      onNext(validatedData)
    } catch (error: any) {
      if (error.errors) {
        const newErrors: Partial<Record<keyof UserInfoFormData, string>> = {}
        error.errors.forEach((err: any) => {
          if (err.path[0]) {
            newErrors[err.path[0] as keyof UserInfoFormData] = err.message
          }
        })
        setErrors(newErrors)
      }
      setIsSubmitting(false)
    }
  }

  return (
    <div className='mx-auto max-w-2xl'>
      <div className='mb-8 text-center'>
        <h2 className='mb-2 text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl'>
          Let's Get Started
        </h2>
        <p className='text-gray-600 dark:text-gray-400'>
          Please provide your information to reserve your spot
        </p>
      </div>

      <form onSubmit={handleSubmit} className='space-y-6'>
        <div className='rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-8'>
          {/* Name Field */}
          <div className='mb-6'>
            <label
              htmlFor='name'
              className='mb-2 block text-sm font-medium text-gray-900 dark:text-gray-100'
            >
              Full Name *
            </label>
            <div className='relative'>
              <div className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4'>
                <User className='h-5 w-5 text-gray-400' />
              </div>
              <input
                type='text'
                id='name'
                value={localData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                disabled={isSubmitting}
                className={`w-full rounded-xl border ${
                  errors.name
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-200 focus:ring-blue-500'
                } bg-gray-50 py-3 pl-12 pr-4 text-gray-900 placeholder:text-gray-400 focus:border-transparent focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-800 dark:bg-gray-800 dark:text-gray-100`}
                placeholder='John Doe'
              />
            </div>
            {/* {errors.name && (
              <div className='mt-2 flex items-center gap-1 text-sm text-red-600'>
                <AlertCircle className='h-4 w-4' />
                <span>{errors.name}</span>
              </div>
            )} */}
          </div>

          {/* Email Field */}
          <div className='mb-6'>
            <label
              htmlFor='email'
              className='mb-2 block text-sm font-medium text-gray-900 dark:text-gray-100'
            >
              Email Address *
            </label>
            <div className='relative'>
              <div className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4'>
                <Mail className='h-5 w-5 text-gray-400' />
              </div>
              <input
                type='email'
                id='email'
                value={localData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                disabled={isSubmitting}
                className={`w-full rounded-xl border ${
                  errors.email
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-200 focus:ring-blue-500'
                } bg-gray-50 py-3 pl-12 pr-4 text-gray-900 placeholder:text-gray-400 focus:border-transparent focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-800 dark:bg-gray-800 dark:text-gray-100`}
                placeholder='john@example.com'
              />
            </div>
            {/* {errors.email && (
              <div className='mt-2 flex items-center gap-1 text-sm text-red-600'>
                <AlertCircle className='h-4 w-4' />
                <span>{errors.email}</span>
              </div>
            )} */}
          </div>

          {/* Phone Field */}
          <div>
            <label
              htmlFor='phone'
              className='mb-2 block text-sm font-medium text-gray-900 dark:text-gray-100'
            >
              Phone Number *
            </label>
            <div className='relative'>
              <div className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4'>
                <Phone className='h-5 w-5 text-gray-400' />
              </div>
              <input
                type='tel'
                id='phone'
                value={localData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                disabled={isSubmitting}
                className={`w-full rounded-xl border ${
                  errors.phone
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-200 focus:ring-blue-500'
                } bg-gray-50 py-3 pl-12 pr-4 text-gray-900 placeholder:text-gray-400 focus:border-transparent focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-800 dark:bg-gray-800 dark:text-gray-100`}
                placeholder='+234 800 000 0000'
              />
            </div>
            {/* {errors.phone && (
              <div className='mt-2 flex items-center gap-1 text-sm text-red-600'>
                <AlertCircle className='h-4 w-4' />
                <span>{errors.phone}</span>
              </div>
            )} */}
          </div>
        </div>

        {/* Submit Button with Spinner */}
        <button
          type='submit'
          disabled={isSubmitting}
          className='flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-blue-400'
        >
          {isSubmitting ? (
            <>
              <Loader2 className='h-4 w-4 animate-spin' />
              <span>Processing...</span>
            </>
          ) : (
            'Continue to Session Selection'
          )}
        </button>
      </form>
    </div>
  )
}
