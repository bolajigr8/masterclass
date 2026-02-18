'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Send } from 'lucide-react'
import { FaTwitter, FaLinkedinIn, FaInstagram, FaYoutube } from 'react-icons/fa'
import { useSmoothScroll } from '@/hooks/useSmoothScroll'

// Map each footer link to its section ID (null = external page)
const footerLinks: Record<
  string,
  { label: string; sectionId: string | null }[]
> = {
  Programmes: [
    { label: 'Live Masterclass', sectionId: 'programme' },
    { label: 'Virtual Series', sectionId: 'programme' },
    { label: 'Private Consulting', sectionId: 'reserve-access' },
    { label: 'Trila University', sectionId: 'programme' },
    { label: 'JaaS Certification', sectionId: 'programme' },
  ],
  Company: [
    { label: 'About Trila', sectionId: 'meet-the-experts' },
    { label: 'Our Team', sectionId: 'meet-the-experts' },
    { label: 'Careers', sectionId: null },
    { label: 'Press & Media', sectionId: null },
    { label: 'Partners', sectionId: null },
  ],
  Support: [
    { label: 'Help Center', sectionId: 'contact' },
    { label: 'Terms of Service', sectionId: null },
    { label: 'Privacy Policy', sectionId: null },
    { label: 'Refund Policy', sectionId: null },
    { label: 'Contact Us', sectionId: 'contact' },
  ],
}

const socials = [
  { icon: FaTwitter, href: 'https://twitter.com', label: 'Twitter' },
  { icon: FaLinkedinIn, href: 'https://linkedin.com', label: 'LinkedIn' },
  { icon: FaInstagram, href: 'https://instagram.com', label: 'Instagram' },
  { icon: FaYoutube, href: 'https://youtube.com', label: 'YouTube' },
]

export default function Footer() {
  const [email, setEmail] = useState('')
  const { scrollTo } = useSmoothScroll()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setEmail('')
  }

  const handleLinkClick = (sectionId: string | null) => {
    if (sectionId) scrollTo(sectionId)
  }

  return (
    <footer
      id='contact'
      className='relative bg-[#030810] border-t border-white/6 w-full overflow-hidden'
    >
      {/* Subtle top glow */}
      <div className='absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[120px] bg-[#2563eb]/5 blur-[80px] pointer-events-none' />

      {/* Main Footer Content */}
      <div className='max-w-[1280px] mx-auto px-6 lg:px-8 pt-16 pb-10'>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8'>
          {/* Col 1 — Brand */}
          <div className='flex flex-col gap-5'>
            {/* Logo scrolls to top */}
            <button
              onClick={() => scrollTo('hero')}
              className='inline-block w-fit focus:outline-none'
              aria-label='Back to top'
            >
              <div className='bg-white rounded-md px-3 py-1.5'>
                <Image
                  src='/logo.png'
                  alt='Trila Logo'
                  width={60}
                  height={24}
                  className='h-5 w-auto'
                />
              </div>
            </button>

            {/* Tagline */}
            <p className='text-[13.5px] text-white/40 leading-relaxed max-w-[240px]'>
              Democratizing access to premium real estate through
              Joint-Venture-as-a-Service and tokenized ownership.
            </p>

            {/* Email subscribe */}
            <form
              onSubmit={handleSubmit}
              className='flex items-center gap-2 bg-[#0d1a35]/80 border border-white/10 rounded-xl px-4 py-2.5 focus-within:border-[#2563eb]/40 transition-colors duration-200'
            >
              <input
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder='Enter your email'
                required
                className='flex-1 bg-transparent text-[13px] text-white placeholder:text-white/30 focus:outline-none min-w-0'
              />
              <button
                type='submit'
                aria-label='Subscribe'
                className='w-8 h-8 rounded-lg bg-[#2563eb] hover:bg-[#1d4ed8] flex items-center justify-center flex-shrink-0 transition-all duration-200 hover:shadow-[0_0_14px_rgba(37,99,235,0.5)] active:scale-95'
              >
                <Send size={13} className='text-white' />
              </button>
            </form>
          </div>

          {/* Cols 2-4 — Link Groups */}
          {Object.entries(footerLinks).map(([group, links]) => (
            <div key={group} className='flex flex-col gap-4'>
              <h4 className='text-white font-bold text-[15px]'>{group}</h4>
              <ul className='flex flex-col gap-3'>
                {links.map((link) => (
                  <li key={link.label}>
                    {link.sectionId ? (
                      <button
                        onClick={() => handleLinkClick(link.sectionId)}
                        className='text-[13.5px] text-white/45 hover:text-white/80 transition-colors duration-200 focus:outline-none text-left'
                      >
                        {link.label}
                      </button>
                    ) : (
                      <Link
                        href='#'
                        className='text-[13.5px] text-white/45 hover:text-white/80 transition-colors duration-200'
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className='border-t border-white/6' />

      {/* Bottom bar */}
      <div className='max-w-[1280px] mx-auto px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4'>
        <p className='text-[12.5px] text-white/30 text-center sm:text-left'>
          © 2026 Trila. All rights reserved. Built for the next generation of
          global landlords.
        </p>

        {/* Social Icons */}
        <div className='flex items-center gap-2.5'>
          {socials.map(({ icon: Icon, href, label }) => (
            <a
              key={label}
              href={href}
              target='_blank'
              rel='noopener noreferrer'
              aria-label={label}
              className='w-9 h-9 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 flex items-center justify-center text-white/45 hover:text-white transition-all duration-200'
            >
              <Icon size={14} />
            </a>
          ))}
        </div>
      </div>
    </footer>
  )
}
