'use client'

import { useState, FormEvent } from 'react'
import { Shield, AlertCircle, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { useAdminAuth } from '@/hooks/useAdminAuth'

export default function AdminLoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { login } = useAdminAuth()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      // The admin password is simply used as the bearer token.
      // Backend will validate it against ADMIN_PASSWORD env var.
      // We test auth by calling a protected endpoint.
      const testResponse = await fetch('/api/admin/stats?sessionId=test', {
        headers: {
          Authorization: `Bearer ${password}`,
        },
      })

      if (testResponse.status === 401) {
        setError('Invalid admin password')
        setIsSubmitting(false)
        return
      }

      // If we didn't get 401, the password is valid (even if the endpoint
      // returns 400 for missing sessionId — that's fine, auth passed)
      login(password)
    } catch (err: any) {
      setError('Authentication failed. Please try again.')
      setIsSubmitting(false)
    }
  }

  return (
    <div className='flex min-h-screen items-center justify-center bg-neutral-950 px-4'>
      <div className='w-full max-w-md'>
        {/* Header */}
        <div className='mb-8 text-center'>
          <div className='mb-4 flex justify-center'>
            <div className='rounded-none border-4 border-white bg-neutral-950 p-4'>
              <Shield className='h-12 w-12 text-white' strokeWidth={2.5} />
            </div>
          </div>
          <h1 className='mb-2 font-mono text-3xl font-bold uppercase tracking-tight text-white'>
            Admin Access
          </h1>
          <p className='font-mono text-sm text-neutral-400'>
            Masterclass Event Management
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className='space-y-6'>
          <div className='border-4 border-white bg-white'>
            <div className='border-b-4 border-neutral-950 bg-neutral-950 px-6 py-4'>
              <p className='font-mono text-sm font-bold uppercase tracking-wider text-white'>
                Authentication
              </p>
            </div>

            <div className='p-6'>
              {error && (
                <div className='mb-6 border-l-4 border-red-600 bg-red-50 p-4'>
                  <div className='flex items-start gap-3'>
                    <AlertCircle className='h-5 w-5 shrink-0 text-red-600' />
                    <p className='font-mono text-sm font-medium text-red-900'>
                      {error}
                    </p>
                  </div>
                </div>
              )}

              <div>
                <label
                  htmlFor='password'
                  className='mb-2 block font-mono text-xs font-bold uppercase tracking-wider text-neutral-900'
                >
                  Admin Password
                </label>
                <div className='relative'>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id='password'
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      setError(null)
                    }}
                    disabled={isSubmitting}
                    className='w-full border-2 border-neutral-900 bg-neutral-50 px-4 py-3 font-mono text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-950 focus:outline-none focus:ring-4 focus:ring-neutral-950/10 disabled:cursor-not-allowed disabled:opacity-50'
                    placeholder='Enter password'
                    autoFocus
                  />
                  <button
                    type='button'
                    onClick={() => setShowPassword((s) => !s)}
                    className='absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-900'
                  >
                    {showPassword ? (
                      <EyeOff className='h-5 w-5' />
                    ) : (
                      <Eye className='h-5 w-5' />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <button
            type='submit'
            disabled={!password.trim() || isSubmitting}
            className='group relative w-full overflow-hidden border-4 border-white bg-white py-4 font-mono text-sm font-bold uppercase tracking-wider text-neutral-950 transition-all hover:bg-neutral-950 hover:text-white disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-neutral-950'
          >
            <span className='relative z-10 flex items-center justify-center gap-2'>
              {isSubmitting ? (
                <>
                  <div className='h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent' />
                  Authenticating
                </>
              ) : (
                <>
                  Access Dashboard
                  <ArrowRight className='h-4 w-4 transition-transform group-hover:translate-x-1' />
                </>
              )}
            </span>
          </button>
        </form>

        {/* Footer note */}
        <p className='mt-8 text-center font-mono text-xs text-neutral-600'>
          Authorized personnel only
        </p>
      </div>
    </div>
  )
}
