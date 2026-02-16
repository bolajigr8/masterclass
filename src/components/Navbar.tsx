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
    { label: 'About', href: '#what-you-will-master' },
    { label: 'Speakers', href: '#meet-the-experts' },
    { label: 'Register', href: '#reserve-access' },
    { label: 'FAQ', href: '#faq' },
  ]

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    if (href.startsWith('#')) {
      e.preventDefault()
      const element = document.querySelector(href)
      if (element) {
        const offset = 80 // Account for fixed navbar height
        const elementPosition = element.getBoundingClientRect().top
        const offsetPosition = elementPosition + window.pageYOffset - offset

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth',
        })
      }
      setMobileMenuOpen(false)
    }
  }

  const handleRegisterClick = () => {
    const element = document.querySelector('#reserve-access')
    if (element) {
      const offset = 80
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - offset

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      })
    }
    onRegisterClick?.()
    setMobileMenuOpen(false)
  }

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
              <a
                key={item.label}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                className='text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-300 dark:hover:text-white cursor-pointer'
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* Dark Mode Toggle */}
          <ThemeToggle />

          {/* Register Button */}
          <button
            onClick={handleRegisterClick}
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
              <a
                key={item.label}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                className='block rounded-md px-3 py-2 text-base font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-900 dark:hover:text-white cursor-pointer'
              >
                {item.label}
              </a>
            ))}

            {/* Mobile Register Button */}
            <button
              onClick={handleRegisterClick}
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
