'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { Send, Mail, Phone, MapPin, Play, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import type { ProductType } from '@/lib/validations'
import EnrollmentModal from './enrollment-modal'

const formats: { label: string; product: ProductType }[] = [
  { label: 'Live In-Person', product: 'Signature Live Masterclass' },
  { label: 'Virtual Zoom', product: 'Virtual Masterclass' },
  { label: '1-on-1 Consulting', product: 'Private JaaS Consulting' },
]

const contactInfo = [
  {
    icon: Mail,
    label: 'Email',
    value: 'masterclass@trila.pro',
    href: 'masterclass@trila.pro',
  },
  {
    icon: Phone,
    label: 'WhatsApp',
    value: '+234 800 TRILA GO',
    href: 'https://wa.me/2348001',
  },
  {
    icon: MapPin,
    label: 'Headquarters',
    value: 'Lagos, Nigeria · Dubai, UAE',
    href: null,
  },
]

export default function ReserveAccess() {
  const [visible, setVisible] = useState(false)
  const [selectedFormat, setSelectedFormat] = useState(formats[0])
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const [localName, setLocalName] = useState('')
  const [localEmail, setLocalEmail] = useState('')
  const [localPhone, setLocalPhone] = useState('')
  const [localCity, setLocalCity] = useState('')
  const [localGoals, setLocalGoals] = useState('')

  // Modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  // Stored after successful pre-registration so the modal doesn't re-register
  const [preRegisteredRef, setPreRegisteredRef] = useState<string | undefined>(
    undefined,
  )

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true)
      },
      { threshold: 0.08 },
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Basic client-side guard before hitting the API
    const cleanPhone = localPhone.replace(/\s+/g, '')
    if (!localName.trim() || localName.trim().length < 2) {
      toast.error('Please enter your full name')
      return
    }
    if (!localEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(localEmail)) {
      toast.error('Please enter a valid email address')
      return
    }
    if (!cleanPhone || cleanPhone.length < 10) {
      toast.error('Please enter a valid phone number (at least 10 digits)')
      return
    }

    setIsSubmitting(true)
    setPreRegisteredRef(undefined)

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: localName.trim(),
          email: localEmail.trim().toLowerCase(),
          phone: cleanPhone,
          city: localCity.trim() || undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (res.status === 409) {
          toast.error('Email already registered', {
            description:
              'This email is already enrolled. Please use a different email or contact support.',
            duration: 7000,
          })
        } else {
          toast.error('Registration failed', {
            description: data.error || 'Please try again.',
            duration: 5000,
          })
        }
        return
      }

      // Registration succeeded — store the reference and open the modal
      setPreRegisteredRef(data.enrollmentReference)
      setModalOpen(true)
    } catch {
      toast.error('Something went wrong', {
        description: 'Please check your connection and try again.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <section
        ref={ref}
        id='reserve-access'
        className='relative bg-[#050b18] w-full py-20 lg:py-28 px-5 overflow-hidden'
      >
        {/* Background glow */}
        <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-175 h-125 bg-[#2563eb]/5 rounded-full blur-[160px] pointer-events-none' />

        <div className='max-w-275 mx-auto'>
          {/* Header */}
          <div
            className={`text-center mb-12 transition-all duration-700 ${
              visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
          >
            <div className='inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-[#0d1a2e]/80 backdrop-blur-sm mb-8'>
              <span className='w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0' />
              <span className='text-[11px] font-bold tracking-[0.15em] text-white/70 uppercase'>
                Limited Capacity — Filling Fast
              </span>
            </div>

            <h2
              className='font-extrabold text-white leading-tight'
              style={{ fontSize: 'clamp(28px, 4.5vw, 52px)' }}
            >
              Spots for 2026 Masterclass Are
              <br />
              <span className='text-[#2563eb]'>Extremely Limited</span>
            </h2>
            <p className='mt-4 text-[15px] text-white/50 max-w-120 mx-auto leading-relaxed'>
              Secure your place now. Our masterclasses consistently sell out
              weeks before the event date.
            </p>
          </div>

          {/* Two-column layout */}
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-5'>
            {/* Left — Form */}
            <div
              className={`rounded-2xl border border-white/8 bg-[#0b1628]/80 p-6 sm:p-8 transition-all duration-700 ${
                visible
                  ? 'opacity-100 translate-x-0'
                  : 'opacity-0 -translate-x-8'
              }`}
              style={{ transitionDelay: '200ms' }}
            >
              <h3 className='text-white font-bold text-[18px] mb-1'>
                Reserve Your Spot
              </h3>
              <p className='text-white/45 text-[13px] mb-6'>
                Fill in your details below and we'll take you to secure payment.
              </p>

              <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
                {/* Row 1: Name + Email */}
                <div className='grid grid-cols-2 gap-3'>
                  <input
                    type='text'
                    placeholder='Full Name'
                    required
                    value={localName}
                    onChange={(e) => setLocalName(e.target.value)}
                    className='col-span-1 bg-[#0d1a35] border border-white/10 hover:border-white/20 focus:border-[#2563eb]/60 focus:outline-none rounded-xl px-4 py-3 text-[13.5px] text-white placeholder:text-white/30 transition-colors duration-200'
                  />
                  <input
                    type='email'
                    placeholder='Email Address'
                    required
                    value={localEmail}
                    onChange={(e) => setLocalEmail(e.target.value)}
                    className='col-span-1 bg-[#0d1a35] border border-white/10 hover:border-white/20 focus:border-[#2563eb]/60 focus:outline-none rounded-xl px-4 py-3 text-[13.5px] text-white placeholder:text-white/30 transition-colors duration-200'
                  />
                </div>

                {/* Row 2: Phone + City */}
                <div className='grid grid-cols-2 gap-3'>
                  <input
                    type='tel'
                    placeholder='Phone / WhatsApp'
                    value={localPhone}
                    onChange={(e) => setLocalPhone(e.target.value)}
                    className='col-span-1 bg-[#0d1a35] border border-white/10 hover:border-white/20 focus:border-[#2563eb]/60 focus:outline-none rounded-xl px-4 py-3 text-[13.5px] text-white placeholder:text-white/30 transition-colors duration-200'
                  />
                  <input
                    type='text'
                    placeholder='City of Interest'
                    value={localCity}
                    onChange={(e) => setLocalCity(e.target.value)}
                    className='col-span-1 bg-[#0d1a35] border border-white/10 hover:border-white/20 focus:border-[#2563eb]/60 focus:outline-none rounded-xl px-4 py-3 text-[13.5px] text-white placeholder:text-white/30 transition-colors duration-200'
                  />
                </div>

                {/* Format Toggle */}
                <div>
                  <p className='text-white/40 text-[12px] font-medium mb-2.5'>
                    Preferred Format
                  </p>
                  <div className='flex items-center gap-2 flex-wrap'>
                    {formats.map((fmt) => (
                      <button
                        key={fmt.label}
                        type='button'
                        onClick={() => setSelectedFormat(fmt)}
                        className={`px-4 py-2 rounded-full text-[12.5px] font-semibold border transition-all duration-200 ${
                          selectedFormat.label === fmt.label
                            ? 'bg-[#2563eb] border-[#2563eb] text-white'
                            : 'border-white/15 bg-white/5 text-white/50 hover:text-white hover:border-white/30'
                        }`}
                      >
                        {fmt.label}
                      </button>
                    ))}
                  </div>
                  {/* Show which product is selected */}
                  <p className='mt-2 text-[11px] text-white/25'>
                    →{' '}
                    <span className='text-white/40'>
                      {selectedFormat.product}
                    </span>
                  </p>
                </div>

                {/* Goals */}
                <textarea
                  placeholder='Tell us about your goals or project (optional)'
                  rows={3}
                  value={localGoals}
                  onChange={(e) => setLocalGoals(e.target.value)}
                  className='bg-[#0d1a35] border border-white/10 hover:border-white/20 focus:border-[#2563eb]/60 focus:outline-none rounded-xl px-4 py-3 text-[13.5px] text-white placeholder:text-white/30 resize-none transition-colors duration-200'
                />

                {/* Submit — validates, registers, then opens modal */}
                <button
                  type='submit'
                  disabled={isSubmitting}
                  className='group flex items-center justify-center gap-2.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold text-[14.5px] px-6 py-3.5 rounded-xl transition-all duration-300 hover:shadow-[0_0_28px_rgba(37,99,235,0.45)] active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-[#2563eb]/50'
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={15} className='animate-spin' />
                      Checking details…
                    </>
                  ) : (
                    <>
                      Reserve My Spot
                      <Send
                        size={15}
                        className='transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5'
                      />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Right — Video + Contact */}
            <div
              className={`flex flex-col gap-4 transition-all duration-700 ${
                visible
                  ? 'opacity-100 translate-x-0'
                  : 'opacity-0 translate-x-8'
              }`}
              style={{ transitionDelay: '320ms' }}
            >
              {/* Video Thumbnail */}
              <div
                className='relative rounded-2xl overflow-hidden cursor-pointer group'
                style={{ aspectRatio: '16/9' }}
                onClick={() => setIsVideoPlaying(true)}
              >
                <Image
                  src='/femi.jpg'
                  alt='Intro Video'
                  fill
                  className='object-cover object-top transition-transform duration-500 group-hover:scale-105'
                />
                <div className='absolute inset-0 bg-[#050b18]/50 group-hover:bg-[#050b18]/40 transition-colors duration-300' />
                <div className='absolute inset-0 flex items-center justify-center'>
                  <div className='w-16 h-16 rounded-full bg-[#2563eb] flex items-center justify-center shadow-[0_0_40px_rgba(37,99,235,0.6)] group-hover:scale-110 transition-transform duration-300'>
                    <Play size={24} className='text-white fill-white ml-1' />
                  </div>
                </div>
                <div className='absolute bottom-4 left-4'>
                  <p className='text-white font-semibold text-[13px]'>
                    Watch 3-min Intro Video
                  </p>
                </div>
              </div>

              {/* Contact Info Cards */}
              <div className='flex flex-col gap-3'>
                {contactInfo.map((item) => {
                  const Icon = item.icon
                  const content = (
                    <div
                      className={`flex items-center gap-4 px-5 py-4 rounded-xl border border-white/8 bg-[#0b1628]/80 hover:border-white/15 hover:bg-[#0d1a35]/80 transition-all duration-300 ${
                        item.href ? 'cursor-pointer' : 'cursor-default'
                      }`}
                    >
                      <div className='w-9 h-9 rounded-lg bg-[#1a2a4a] flex items-center justify-center shrink-0'>
                        <Icon size={16} className='text-[#4a9eff]' />
                      </div>
                      <div>
                        <p className='text-white/40 text-[11px] font-medium uppercase tracking-wide'>
                          {item.label}
                        </p>
                        <p className='text-white font-semibold text-[14px]'>
                          {item.value}
                        </p>
                      </div>
                    </div>
                  )

                  return item.href ? (
                    <a
                      key={item.label}
                      href={item.href}
                      target='_blank'
                      rel='noopener noreferrer'
                    >
                      {content}
                    </a>
                  ) : (
                    <div key={item.label}>{content}</div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enrollment Modal — pre-filled with form data, product, and pre-registered reference */}
      <EnrollmentModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setPreRegisteredRef(undefined)
        }}
        initialProduct={selectedFormat.product}
        initialEnrollmentReference={preRegisteredRef}
        initialFormData={{
          name: localName,
          email: localEmail,
          phone: localPhone,
          city: localCity,
        }}
      />
    </>
  )
}
