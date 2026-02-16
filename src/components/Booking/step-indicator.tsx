'use client'

import { Check } from 'lucide-react'

interface StepIndicatorProps {
  currentStep: 1 | 2 | 3
}

const steps = [
  { number: 1, title: 'Your Information', description: 'Basic details' },
  { number: 2, title: 'Session Details', description: 'Date & time' },
  { number: 3, title: 'Payment', description: 'Complete enrollment' },
]

export default function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className='w-full md:ml-12 px-4 py-8'>
      <div className='mx-auto max-w-3xl'>
        {/* Mobile: Vertical steps */}
        <div className='md:hidden space-y-4'>
          {steps.map((step) => {
            const isCompleted = step.number < currentStep
            const isCurrent = step.number === currentStep
            const isPending = step.number > currentStep

            return (
              <div key={step.number} className='flex items-start gap-4'>
                <div className='flex flex-col items-center'>
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${
                      isCompleted
                        ? 'border-blue-600 bg-blue-600 text-white'
                        : isCurrent
                          ? 'border-blue-600 bg-white text-blue-600'
                          : 'border-gray-300 bg-white text-gray-400'
                    }`}
                  >
                    {isCompleted ? (
                      <Check className='h-5 w-5' />
                    ) : (
                      <span className='text-sm font-semibold'>
                        {step.number}
                      </span>
                    )}
                  </div>
                  {step.number < steps.length && (
                    <div
                      className={`mt-2 h-12 w-0.5 ${
                        isCompleted ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    />
                  )}
                </div>
                <div className='flex-1 pt-1'>
                  <h3
                    className={`text-sm font-semibold ${
                      isCurrent
                        ? 'text-gray-900 dark:text-white'
                        : isCompleted
                          ? 'text-gray-700 dark:text-gray-300'
                          : 'text-gray-400 dark:text-gray-500'
                    }`}
                  >
                    {step.title}
                  </h3>
                  <p
                    className={`text-xs ${
                      isCurrent || isCompleted
                        ? 'text-gray-600 dark:text-gray-400'
                        : 'text-gray-400 dark:text-gray-500'
                    }`}
                  >
                    {step.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Desktop: Horizontal steps */}
        <div className='hidden md:flex items-center justify-between'>
          {steps.map((step, index) => {
            const isCompleted = step.number < currentStep
            const isCurrent = step.number === currentStep
            const isPending = step.number > currentStep

            return (
              <div key={step.number} className='flex flex-1 items-center'>
                <div className='flex flex-col items-center'>
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all ${
                      isCompleted
                        ? 'border-blue-600 bg-blue-600 text-white'
                        : isCurrent
                          ? 'border-blue-600 bg-white text-blue-600 ring-4 ring-blue-100'
                          : 'border-gray-300 bg-white text-gray-400'
                    }`}
                  >
                    {isCompleted ? (
                      <Check className='h-6 w-6' />
                    ) : (
                      <span className='text-lg font-bold'>{step.number}</span>
                    )}
                  </div>
                  <div className='mt-3 text-center'>
                    <h3
                      className={`text-sm font-semibold ${
                        isCurrent
                          ? 'text-gray-900 dark:text-white'
                          : isCompleted
                            ? 'text-gray-700 dark:text-gray-300'
                            : 'text-gray-400 dark:text-gray-500'
                      }`}
                    >
                      {step.title}
                    </h3>
                    <p
                      className={`text-xs ${
                        isCurrent || isCompleted
                          ? 'text-gray-600 dark:text-gray-400'
                          : 'text-gray-400 dark:text-gray-500'
                      }`}
                    >
                      {step.description}
                    </p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`mx-4 h-0.5 flex-1 transition-all ${
                      isCompleted ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
