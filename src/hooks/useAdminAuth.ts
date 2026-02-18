'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  isAdminAuthenticated,
  setAdminToken,
  clearAdminToken,
} from '@/lib/admin/auth'

export function useAdminAuth(options: { redirectIfNotAuth?: boolean } = {}) {
  const { redirectIfNotAuth = false } = options
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const authenticated = isAdminAuthenticated()
    setIsAuthenticated(authenticated)
    setIsLoading(false)

    if (redirectIfNotAuth && !authenticated) {
      router.push('/admin/login')
    }
  }, [redirectIfNotAuth, router])

  const login = (token: string) => {
    setAdminToken(token)
    setIsAuthenticated(true)
    router.push('/admin/dashboard')
  }

  const logout = () => {
    clearAdminToken()
    setIsAuthenticated(false)
    router.push('/admin/login')
  }

  return { isAuthenticated, isLoading, login, logout }
}
