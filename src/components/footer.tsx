'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Send } from 'lucide-react'
import { FaTwitter, FaLinkedinIn, FaInstagram } from 'react-icons/fa'
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
    { label: 'JaaS Activation Pack', sectionId: 'activation-pack' },
    { label: 'Launchpad', sectionId: 'launchpad' },
    { label: 'Payment Options', sectionId: 'payment-options' },
  ],
  Company: [
    { label: 'About Trila x JaaS', sectionId: 'about' },
    { label: 'Our Team', sectionId: 'team-section' },
    { label: 'Testimonials', sectionId: 'testimonials' },
    { label: 'Partners', sectionId: null },
    { label: 'Careers', sectionId: null },
    { label: 'Press & Media', sectionId: null },
  ],
  Support: [
    { label: 'Help Center', sectionId: 'contact' },
    { label: 'Contact Us', sectionId: 'contact' },
    { label: 'Terms of Service', sectionId: null },
    { label: 'Privacy Policy', sectionId: null },
    { label: 'Refund Policy', sectionId: null },
  ],
}

const socials = [
  { icon: FaTwitter, href: 'https://x.com/Trila_inc', label: 'Twitter' },
  {
    icon: FaLinkedinIn,
    href: 'https://www.linkedin.com/company/trilainc/',
    label: 'LinkedIn',
  },
  {
    icon: FaInstagram,
    href: 'https://www.instagram.com/trila_inc/',
    label: 'Instagram',
  },
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
      className='relative bg-[#060d19] border-t border-white/5 w-full overflow-hidden'
    >
      {/* Gradient top line */}
      <div className='absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-[#0066FF]/30 to-transparent' />

      {/* Subtle top glow */}
      <div className='absolute top-0 left-1/2 -translate-x-1/2 w-150 h-30 bg-[#2563eb]/5 blur-[80px] pointer-events-none' />

      {/* Main Footer Content */}
      <div className='max-w-7xl mx-auto px-6 lg:px-8 pt-16 pb-10'>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16'>
          {/* Col 1-2 — Brand */}
          <div className='lg:col-span-2 flex flex-col gap-5'>
            {/* Logo scrolls to top */}
            <button
              onClick={() => scrollTo('hero')}
              className='inline-block w-fit focus:outline-none'
              aria-label='Back to top'
            >
              <div className='rounded-md px-3 py-1.5'>
                <Image
                  src='/logo.png'
                  alt='Trila Logo'
                  width={120}
                  height={120}
                  className='object-cover'
                />
              </div>
            </button>

            {/* Tagline */}
            <p className='text-[13.5px] text-white/40 leading-relaxed max-w-sm'>
              Trila is a pioneer real estate infrastructure company empowering
              the new generation of entrepreneurs and developers at global scale
              with fractional ownership, short-term rentals (STR), and
              Joint-Venture-as-a-Service (JaaS). Serving 200,000+ developers,
              startups, HNWI &amp; organizations worldwide.
            </p>

            {/* Email subscribe */}
            <form onSubmit={handleSubmit} className='relative max-w-sm'>
              <input
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder='Enter your email'
                required
                className='w-full bg-white/5 border border-white/10 rounded-xl pl-4 pr-12 py-3 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-[#0066FF]/50 transition-colors duration-200'
              />
              <button
                type='submit'
                aria-label='Subscribe'
                className='absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-linear-to-r from-[#0066FF] to-[#0052cc] hover:from-[#0052cc] hover:to-[#003d99] flex items-center justify-center shrink-0 transition-all duration-200 active:scale-95'
              >
                <Send size={13} className='text-white' />
              </button>
            </form>
          </div>

          {/* Cols 3-5 — Link Groups */}
          {Object.entries(footerLinks).map(([group, links]) => (
            <div key={group} className='flex flex-col gap-4'>
              <h4 className='text-white font-semibold text-sm tracking-wide'>
                {group}
              </h4>
              <ul className='flex flex-col gap-3'>
                {links.map((link) => (
                  <li key={link.label}>
                    {link.sectionId ? (
                      <button
                        onClick={() => handleLinkClick(link.sectionId)}
                        className='text-sm text-white/35 hover:text-white/70 transition-colors duration-200 focus:outline-none text-left'
                      >
                        {link.label}
                      </button>
                    ) : (
                      <Link
                        href='#'
                        className='text-sm text-white/35 hover:text-white/70 transition-colors duration-200'
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
                {/* Contact details beneath Support */}
                {group === 'Support' && (
                  <div className='mt-3 flex flex-col gap-2'>
                    <a
                      href='mailto:masterclass@trila.pro'
                      className='text-sm text-white/35 hover:text-white/70 transition-colors duration-200'
                    >
                      masterclass@trila.pro
                    </a>
                    <a
                      href='https://wa.me/2347064000854'
                      target='_blank'
                      rel='noopener noreferrer'
                      className='text-sm text-white/35 hover:text-white/70 transition-colors duration-200'
                    >
                      +234 7064000854
                    </a>
                  </div>
                )}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className='border-t border-white/5' />

      {/* Bottom bar */}
      <div className='max-w-7xl mx-auto px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4'>
        <p className='text-xs text-white/20 text-center sm:text-left'>
          © 2026 Trila. All rights reserved. Pioneer real estate infrastructure
          — empowering the next generation.
        </p>

        {/* Social Icons */}
        <div className='flex items-center gap-4'>
          {socials.map(({ icon: Icon, href, label }) => (
            <a
              key={label}
              href={href}
              target='_blank'
              rel='noopener noreferrer'
              aria-label={label}
              className='w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/30 hover:text-white transition-all duration-200'
            >
              <Icon size={14} />
            </a>
          ))}
        </div>
      </div>
    </footer>
  )
}
