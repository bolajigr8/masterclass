'use client'

import { useState } from 'react'

import type {
  UserInfoFormData,
  SessionSelectionFormData,
  CompleteEnrollmentData,
} from '@/lib/validations'
import StepIndicator from './step-indicator'
import Step1UserInfo from './step-one-info'
import Step2ConfirmSession from './step2-confirm-session'
import Step3Payment from './step3-finalize-enrollment'
import SuccessMessage from './succes-indicator'

type Step = 1 | 2 | 3 | 4 // 4 is success

export default function ReserveAccessSection() {
  const [currentStep, setCurrentStep] = useState<Step>(1)
  const [formData, setFormData] = useState<CompleteEnrollmentData>({
    userInfo: {
      name: '',
      email: '',
      phone: '',
    },
    session: {
      date: '',
      time: '',
    },
    payment: {
      accessTier: 'full',
      amount: 50000,
    },
  })

  // Handle Step 1: User Information
  const handleStep1Complete = async (data: UserInfoFormData) => {
    setFormData((prev) => ({ ...prev, userInfo: data }))

    try {
      // Initiate enrollment and get reference
      const response = await fetch('/api/enrollment/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          phone: data.phone,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to initiate enrollment')
      }

      // Store enrollment reference
      setFormData((prev) => ({
        ...prev,
        enrollmentReference: result.enrollmentReference,
      }))

      // Move to next step
      setCurrentStep(2)
    } catch (error: any) {
      console.error('Enrollment initiation error:', error)
      alert(error.message || 'Failed to proceed. Please try again.')
    }
  }

  // Handle Step 2: Session Selection
  const handleStep2Complete = (data: SessionSelectionFormData) => {
    setFormData((prev) => ({ ...prev, session: data }))
    setCurrentStep(3)
  }

  // Handle Step 3: Payment Success
  const handleStep3Success = () => {
    setCurrentStep(4)
  }

  // Handle going back
  const handleBackToStep1 = () => {
    setCurrentStep(1)
  }

  const handleBackToStep2 = () => {
    setCurrentStep(2)
  }

  // Reset form (for booking another session)
  const handleReset = () => {
    setFormData({
      userInfo: {
        name: '',
        email: '',
        phone: '',
      },
      session: {
        date: '',
        time: '',
      },
      payment: {
        accessTier: 'full',
        amount: 50000,
      },
    })
    setCurrentStep(1)
  }

  return (
    <section className='bg-gray-50 px-6 py-16 dark:bg-gray-950 sm:px-12 sm:py-20 md:px-16 md:py-24 lg:px-24 lg:py-32'>
      <div className='mx-auto max-w-6xl'>
        {/* Section Header */}
        <div className='mb-12 text-center'>
          <h1 className='mb-3 text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl md:text-5xl'>
            Reserve Your Access
          </h1>
          <p className='text-base leading-relaxed text-gray-600 dark:text-gray-300 sm:text-lg'>
            Join our exclusive masterclass and transform your investment
            strategy
          </p>
        </div>

        {/* Progress Indicator - Only show for steps 1-3 */}
        {currentStep !== 4 && (
          <StepIndicator currentStep={currentStep as 1 | 2 | 3} />
        )}

        {/* Step Content */}
        <div className='mt-8'>
          {currentStep === 1 && (
            <Step1UserInfo
              formData={formData.userInfo}
              onNext={handleStep1Complete}
            />
          )}

          {currentStep === 2 && (
            <Step2ConfirmSession
              formData={formData.session}
              onNext={handleStep2Complete}
              onBack={handleBackToStep1}
            />
          )}

          {currentStep === 3 && (
            <Step3Payment
              completeData={formData}
              onBack={handleBackToStep2}
              onSuccess={handleStep3Success}
            />
          )}

          {currentStep === 4 && (
            <SuccessMessage
              userEmail={formData.userInfo.email}
              sessionDate={formData.session.date}
              sessionTime={formData.session.time}
              onReset={handleReset}
            />
          )}
        </div>
      </div>
    </section>
  )
}
