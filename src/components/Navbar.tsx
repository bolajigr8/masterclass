'use client'

import React from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import { ThemeToggle } from './theme-toggle'

interface NavbarProps {
  onRegisterClick?: () => void
}

export const Navbar: React.FC<NavbarProps> = ({ onRegisterClick }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = [
    { label: 'About', href: '/about' },
    { label: 'Speakers', href: '/speakers' },
    { label: 'Register', href: '/register' },
    { label: 'FAQ', href: '/faq' },
  ]

  return (
    <nav className='fixed top-0 z-50 w-full border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950'>
      <div className='mx-auto flex h-16 max-w-7xl items-center justify-between px-6 sm:px-12 md:px-16 lg:px-24 xl:px-32'>
        {/* Logo */}
        <Link
          href='/'
          className='text-xl font-bold text-gray-900 dark:text-white'
        >
          Trila
        </Link>

        {/* Desktop Navigation */}
        <div className='hidden items-center gap-8 md:flex'>
          {/* Nav Links */}
          <div className='flex items-center gap-8'>
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className='text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Dark Mode Toggle */}
          <ThemeToggle />

          {/* Register Button */}
          <button
            onClick={onRegisterClick}
            className='rounded-md bg-blue-500 px-6 py-2 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-600 dark:shadow-blue-900/30 dark:hover:bg-blue-700'
          >
            Register
          </button>
        </div>

        {/* Mobile Controls */}
        <div className='flex items-center gap-2 md:hidden'>
          <ThemeToggle />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label='Toggle menu'
            className='inline-flex h-9 w-9 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-900 shadow-xs transition-colors hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:hover:bg-gray-800'
          >
            {mobileMenuOpen ? (
              <X className='h-5 w-5' />
            ) : (
              <Menu className='h-5 w-5' />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className='border-t border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950 md:hidden'>
          <div className='space-y-1 px-6 pb-4 pt-2'>
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className='block rounded-md px-3 py-2 text-base font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-900 dark:hover:text-white'
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}

            {/* Mobile Register Button */}
            <button
              onClick={() => {
                onRegisterClick?.()
                setMobileMenuOpen(false)
              }}
              className='mt-2 w-full rounded-md bg-blue-500 px-6 py-2 text-base font-semibold text-white shadow-md transition-all duration-200 hover:bg-blue-600 dark:bg-blue-600 dark:shadow-blue-900/30 dark:hover:bg-blue-700'
            >
              Register
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar
