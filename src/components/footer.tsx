import React from 'react'
import Link from 'next/link'

export const Footer: React.FC = () => {
  const footerLinks = [
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
    { label: 'Contact', href: '#' },
  ]

  const currentYear = new Date().getFullYear()

  return (
    <footer className='bg-gray-50 px-6 py-12 dark:bg-gray-900 sm:px-12 md:px-16 lg:px-24 xl:px-32'>
      <div className='mx-auto max-w-7xl'>
        {/* Footer Content */}
        <div className='flex flex-col items-center space-y-6'>
          {/* Brand */}
          <div className='text-center'>
            <h3 className='mb-2 text-2xl font-bold text-gray-900 dark:text-white'>
              Trila
            </h3>
            <p className='text-sm text-gray-600 dark:text-gray-400'>
              Democratizing Real Estate Infrastructure
            </p>
          </div>

          {/* Links */}
          <nav className='flex flex-wrap items-center justify-center gap-6'>
            {footerLinks.map((link, index) => (
              <Link
                key={index}
                href={link.href}
                className='text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Copyright */}
          <div className='border-t border-gray-200 pt-6 dark:border-gray-800'>
            <p className='text-center text-sm text-gray-500 dark:text-gray-500'>
              © {currentYear} Trila Infrastructure. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
