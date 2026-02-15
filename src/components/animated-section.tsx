'use client'

import { useEffect, useRef, useState } from 'react'
import type React from 'react'
import { cn } from '@/lib/utils'

type AnimatedSectionVariant = 'fade-up' | 'fade-in'

interface AnimatedSectionProps
  extends React.HTMLAttributes<HTMLDivElement> {
  variant?: AnimatedSectionVariant
  delay?: number
}

export const AnimatedSection: React.FC<AnimatedSectionProps> = ({
  children,
  className,
  variant = 'fade-up',
  delay = 0,
  ...props
}) => {
  const ref = useRef<HTMLDivElement | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.unobserve(entry.target)
        }
      })
    }, { threshold: 0.1 })

    observer.observe(node)

    return () => {
      observer.disconnect()
    }
  }, [])

  const baseClasses =
    'transition-transform transition-opacity duration-400 ease-out will-change-transform will-change-opacity'

  const hiddenClasses =
    variant === 'fade-up' ? 'translate-y-4 opacity-0' : 'opacity-0'

  const visibleClasses = 'translate-y-0 opacity-100'

  return (
    <div
      ref={ref}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      className={cn(
        baseClasses,
        isVisible ? visibleClasses : hiddenClasses,
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export default AnimatedSection
