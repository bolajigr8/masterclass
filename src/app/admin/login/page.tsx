'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, Loader2, AlertCircle } from 'lucide-react'
import { verifyPassword } from '@/lib/admin/auth'

export default function AdminLoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password.trim()) return

    setIsLoading(true)
    setError(null)

    const valid = await verifyPassword(password.trim())

    if (valid) {
      localStorage.setItem('admin_password', password.trim())
      router.replace('/admin/dashboard')
    } else {
      setError('Incorrect password. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <div className='flex min-h-screen items-center justify-center bg-neutral-100 px-4'>
      <div className='w-full max-w-sm border-4 border-neutral-900 bg-white shadow-[6px_6px_0_#171717]'>
        {/* Header */}
        <div className='border-b-4 border-neutral-900 bg-neutral-950 px-6 py-5'>
          <div className='flex items-center gap-3'>
            <Lock className='h-5 w-5 text-white' />
            <div>
              <h1 className='font-mono text-base font-bold uppercase tracking-tight text-white'>
                Admin Access
              </h1>
              <p className='font-mono text-xs text-neutral-400'>
                Masterclass Event Management
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className='p-6'>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div>
              <label className='mb-2 block font-mono text-xs font-bold uppercase tracking-wider text-neutral-700'>
                Admin Password
              </label>
              <input
                type='password'
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setError(null)
                }}
                placeholder='Enter password'
                autoFocus
                disabled={isLoading}
                className='w-full border-2 border-neutral-900 bg-neutral-50 px-4 py-3 font-mono text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2 disabled:opacity-50'
              />
            </div>

            {error && (
              <div className='flex items-center gap-2 border-l-4 border-red-600 bg-red-50 px-3 py-2'>
                <AlertCircle className='h-4 w-4 shrink-0 text-red-600' />
                <p className='font-mono text-xs text-red-700'>{error}</p>
              </div>
            )}

            <button
              type='submit'
              disabled={isLoading || !password.trim()}
              className='flex w-full items-center justify-center gap-2 border-2 border-neutral-900 bg-neutral-950 px-6 py-3 font-mono text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50'
            >
              {isLoading ? (
                <>
                  <Loader2 className='h-4 w-4 animate-spin' />
                  Verifying…
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
