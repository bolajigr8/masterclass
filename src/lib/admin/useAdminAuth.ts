'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface UseAdminAuthOptions {
  /** If true, redirect to /admin/login when not authenticated */
  redirectIfNotAuth?: boolean
}

interface UseAdminAuthReturn {
  isLoading: boolean
  isAuthenticated: boolean
  logout: () => void
}

export function useAdminAuth({
  redirectIfNotAuth = false,
}: UseAdminAuthOptions = {}): UseAdminAuthReturn {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const password = localStorage.getItem('admin_password')

    if (!password) {
      if (redirectIfNotAuth) {
        router.replace('/admin/login')
      } else {
        setIsLoading(false)
      }
      return
    }

    setIsAuthenticated(true)
    setIsLoading(false)
  }, [redirectIfNotAuth, router])

  const logout = () => {
    localStorage.removeItem('admin_password')
    router.replace('/admin/login')
  }

  return { isLoading, isAuthenticated, logout }
}
