'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { X, Menu, Play } from 'lucide-react'
import { useSmoothScroll } from '@/hooks/useSmoothScroll'

const navLinks = [
  { label: 'Programme', sectionId: 'programme' },
  { label: 'Pricing', sectionId: 'pricing' },
  { label: 'Testimonials', sectionId: 'testimonials' },
  { label: 'Contact', sectionId: 'contact' },
]

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { scrollTo } = useSmoothScroll()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const handleNavClick = (sectionId: string) => {
    // Delay scroll slightly on mobile so the drawer finishes closing first
    const delay = isOpen ? 320 : 0
    setIsOpen(false)
    setTimeout(() => scrollTo(sectionId), delay)
  }

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-[#080d1a]/90 backdrop-blur-xl border-b border-white/5 shadow-[0_4px_30px_rgba(0,0,0,0.4)]'
            : 'bg-transparent'
        }`}
      >
        <div className='max-w-[1280px] mx-auto px-6 lg:px-8'>
          <div className='flex items-center justify-between h-[68px]'>
            {/* Logo — scrolls to top */}
            <button
              onClick={() => scrollTo('hero')}
              className='flex-shrink-0 focus:outline-none'
              aria-label='Go to top'
            >
              <div className='bg-white rounded-md px-3 py-1.5 flex items-center'>
                <Image
                  src='/logo.png'
                  alt='Logo'
                  width={60}
                  height={24}
                  className='h-5 w-auto'
                />
              </div>
            </button>

            {/* Desktop Nav Links */}
            <div className='hidden lg:flex items-center gap-8'>
              {navLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={() => handleNavClick(link.sectionId)}
                  className='text-[15px] text-white/80 hover:text-white font-medium transition-colors duration-200 focus:outline-none'
                >
                  {link.label}
                </button>
              ))}
            </div>

            {/* Desktop CTA */}
            <div className='hidden lg:flex items-center gap-4'>
              <Link
                href='/signin'
                className='text-[15px] text-white/80 hover:text-white font-medium transition-colors duration-200'
              >
                Sign In
              </Link>
              <button
                onClick={() => handleNavClick('reserve-access')}
                className='bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-[15px] font-semibold px-5 py-2.5 rounded-full transition-all duration-200 hover:shadow-[0_0_20px_rgba(37,99,235,0.5)] active:scale-95 focus:outline-none'
              >
                Secure Your Seat
              </button>
            </div>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setIsOpen(true)}
              className='lg:hidden p-2 text-white transition-opacity hover:opacity-70 focus:outline-none'
              aria-label='Open menu'
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Overlay */}
      <div
        onClick={() => setIsOpen(false)}
        className={`fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          isOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Mobile Drawer */}
      <div
        className={`fixed top-0 left-0 bottom-0 z-[70] w-full max-w-[360px] bg-[#080d1a] border-r border-white/10 flex flex-col transition-transform duration-300 ease-in-out lg:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className='flex items-center justify-between px-5 h-[68px] border-b border-white/10'>
          <button
            onClick={() => handleNavClick('hero')}
            className='focus:outline-none'
          >
            <div className='bg-white rounded-md px-3 py-1.5'>
              <Image
                src='/logo.png'
                alt='Logo'
                width={60}
                height={24}
                className='h-5 w-auto'
              />
            </div>
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className='p-2 text-white/70 hover:text-white transition-colors focus:outline-none'
            aria-label='Close menu'
          >
            <X size={22} />
          </button>
        </div>

        {/* Drawer Nav Links */}
        <div className='flex flex-col px-5 pt-6 gap-1'>
          {navLinks.map((link, i) => (
            <button
              key={link.label}
              onClick={() => handleNavClick(link.sectionId)}
              style={{ transitionDelay: isOpen ? `${i * 60}ms` : '0ms' }}
              className={`text-[18px] font-semibold text-white py-3 border-b border-white/10 text-left transition-all duration-300 hover:text-[#2563eb] focus:outline-none ${
                isOpen
                  ? 'opacity-100 translate-x-0'
                  : 'opacity-0 -translate-x-4'
              }`}
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* Drawer Bottom */}
        <div className='mt-auto px-5 pb-8 flex flex-col gap-3'>
          <div className='border-t border-white/10 pt-5 mb-1'>
            <Link
              href='/signin'
              onClick={() => setIsOpen(false)}
              className='text-[15px] text-white/70 hover:text-white font-medium transition-colors'
            >
              Sign In
            </Link>
          </div>
          <button
            onClick={() => handleNavClick('reserve-access')}
            className='flex items-center justify-center gap-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-[15px] font-bold px-5 py-3.5 rounded-full transition-all duration-200 hover:shadow-[0_0_20px_rgba(37,99,235,0.5)] focus:outline-none'
          >
            Secure Your Seat
          </button>
          <button
            onClick={() => handleNavClick('reserve-access')}
            className='flex items-center justify-center gap-2.5 bg-white/10 hover:bg-white/15 border border-white/20 text-white text-[15px] font-semibold px-5 py-3.5 rounded-full transition-all duration-200 focus:outline-none'
          >
            <Play size={13} className='fill-[#f59e0b] text-[#f59e0b]' />
            Book Private Consulting Call
          </button>
        </div>
      </div>
    </>
  )
}
