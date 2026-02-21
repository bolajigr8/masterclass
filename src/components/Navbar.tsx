'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import {
  ChevronDown,
  GraduationCap,
  CreditCard,
  Info,
  Users,
  Zap,
  Rocket,
  Wallet,
  Star,
  MessageSquare,
} from 'lucide-react'
import { useSmoothScroll } from '@/hooks/useSmoothScroll'

const moreLinks = [
  { label: 'About Trila x JaaS', sectionId: 'about', icon: Info },
  { label: 'Our Team', sectionId: 'team-section', icon: Users },
  { label: 'JaaS Activation Pack', sectionId: 'activation-pack', icon: Zap },
  { label: 'Launchpad', sectionId: 'launchpad', icon: Rocket },
  { label: 'Payment Options', sectionId: 'payment-options', icon: Wallet },
  { label: 'Testimonials', sectionId: 'testimonials', icon: Star },
  { label: 'Contact', sectionId: 'contact', icon: MessageSquare },
]

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { scrollTo } = useSmoothScroll()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close "More" dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('[data-more-menu]')) setMoreOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleNavClick = (sectionId: string) => {
    setIsOpen(false)
    setMoreOpen(false)
    scrollTo(sectionId)
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-[#080d1a]/90 backdrop-blur-xl border-b border-white/5 shadow-[0_4px_30px_rgba(0,0,0,0.4)]'
          : 'bg-transparent'
      }`}
    >
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex items-center justify-between h-20'>
          {/* Logo */}
          <button
            onClick={() => scrollTo('hero')}
            className='shrink-0 focus:outline-none flex items-center'
            aria-label='Go to top'
          >
            <Image
              src='/logo.png'
              alt='Trila'
              width={110}
              height={36}
              className='h-8 sm:h-9 w-auto object-contain'
            />
          </button>

          {/* Desktop Nav Links */}
          <div className='hidden md:flex items-center gap-1'>
            <button
              onClick={() => handleNavClick('programme')}
              className='text-white/70 hover:text-white text-sm font-medium tracking-wide transition-colors relative group px-4 py-2'
            >
              Programme
              <span className='absolute bottom-0 left-4 right-4 h-0.5 bg-linear-to-r from-[#0066FF] to-[#3399ff] scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300' />
            </button>

            <button
              onClick={() => handleNavClick('pricing')}
              className='text-white/70 hover:text-white text-sm font-medium tracking-wide transition-colors relative group px-4 py-2'
            >
              Pricing
              <span className='absolute bottom-0 left-4 right-4 h-0.5 bg-linear-to-r from-[#0066FF] to-[#3399ff] scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300' />
            </button>

            {/* More Dropdown */}
            <div className='relative' data-more-menu>
              <button
                onClick={() => setMoreOpen((v) => !v)}
                className='flex items-center gap-1.5 text-sm font-medium tracking-wide transition-colors px-4 py-2 rounded-lg text-white/70 hover:text-white'
              >
                More
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-200 ${moreOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {moreOpen && (
                <div className='absolute top-full left-0 mt-2 w-56 bg-[#0a1628]/98 backdrop-blur-xl border border-white/10 rounded-xl shadow-xl py-2 z-50'>
                  {moreLinks.map(({ label, sectionId, icon: Icon }) => (
                    <button
                      key={label}
                      onClick={() => handleNavClick(sectionId)}
                      className='flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors'
                    >
                      <Icon size={15} className='text-white/25 shrink-0' />
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Desktop CTA */}
          <div className='hidden md:flex items-center gap-4'>
            <button
              onClick={() => handleNavClick('contact')}
              className='text-white/70 hover:text-white text-sm font-medium transition-colors'
            >
              Sign In
            </button>
            <button
              onClick={() => handleNavClick('reserve-access')}
              className='bg-linear-to-r from-[#0066FF] to-[#0052cc] hover:from-[#0052cc] hover:to-[#003d99] text-white text-sm font-semibold px-6 py-2.5 rounded-full transition-all hover:shadow-lg hover:shadow-[#0066FF]/25 active:scale-95'
            >
              Secure Your Seat
            </button>
          </div>

          {/* Mobile Hamburger / Close */}
          <button
            onClick={() => setIsOpen((v) => !v)}
            className='md:hidden text-white p-2 focus:outline-none'
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
          >
            {isOpen ? (
              // X icon
              <svg
                xmlns='http://www.w3.org/2000/svg'
                width='24'
                height='24'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              >
                <path d='M18 6 6 18' />
                <path d='m6 6 12 12' />
              </svg>
            ) : (
              // Menu icon
              <svg
                xmlns='http://www.w3.org/2000/svg'
                width='24'
                height='24'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              >
                <line x1='4' x2='20' y1='12' y2='12' />
                <line x1='4' x2='20' y1='6' y2='6' />
                <line x1='4' x2='20' y1='18' y2='18' />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {isOpen && (
        <div className='md:hidden bg-[#0a1628]/98 backdrop-blur-xl border-t border-white/5 animate-fade-in max-h-[80vh] overflow-y-auto'>
          <div className='px-4 py-6 space-y-1'>
            <button
              onClick={() => handleNavClick('programme')}
              className='flex items-center gap-3 w-full text-left text-white/70 hover:text-white py-3 text-base font-medium transition-colors'
            >
              <GraduationCap size={18} className='text-white/30' />
              Programme
            </button>

            <button
              onClick={() => handleNavClick('pricing')}
              className='flex items-center gap-3 w-full text-left text-white/70 hover:text-white py-3 text-base font-medium transition-colors'
            >
              <CreditCard size={18} className='text-white/30' />
              Pricing
            </button>

            <div className='py-2'>
              <p className='text-white/20 text-[10px] uppercase tracking-[0.2em] font-semibold px-1'>
                Explore
              </p>
            </div>

            {moreLinks.map(({ label, sectionId, icon: Icon }) => (
              <button
                key={label}
                onClick={() => handleNavClick(sectionId)}
                className='flex items-center gap-3 w-full text-left text-white/60 hover:text-white py-2.5 text-sm font-medium transition-colors'
              >
                <Icon size={16} className='text-white/25 shrink-0' />
                {label}
              </button>
            ))}

            <div className='pt-4 border-t border-white/10 space-y-3'>
              <button
                onClick={() => handleNavClick('contact')}
                className='w-full text-left text-white/70 hover:text-white py-2 text-sm'
              >
                Sign In
              </button>
              <button
                onClick={() => handleNavClick('reserve-access')}
                className='w-full bg-linear-to-r from-[#0066FF] to-[#0052cc] text-white font-semibold py-3 rounded-full text-sm active:scale-95 transition-all'
              >
                Secure Your Seat
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
