'use client'

import { useEffect, useRef, useState } from 'react'

interface CountUpProps {
  value: number
  suffix?: string
  prefix?: string
  duration?: number
}

export function CountUp({
  value,
  suffix = '',
  prefix = '',
  duration = 1200,
}: CountUpProps) {
  const [display, setDisplay] = useState(0)
  const [hasAnimated, setHasAnimated] = useState(false)
  const frameRef = useRef<number | null>(null)
  const startRef = useRef<number | null>(null)
  const spanRef = useRef<HTMLSpanElement | null>(null)

  useEffect(() => {
    const node = spanRef.current
    if (!node || hasAnimated) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setHasAnimated(true)
            observer.disconnect()
          }
        })
      },
      { threshold: 0.4 },
    )

    observer.observe(node)

    return () => {
      observer.disconnect()
    }
  }, [hasAnimated])

  useEffect(() => {
    if (!hasAnimated) return

    const target = value
    const startValue = 0

    const animate = (timestamp: number) => {
      if (startRef.current === null) {
        startRef.current = timestamp
      }

      const elapsed = timestamp - startRef.current
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = startValue + (target - startValue) * eased
      setDisplay(current)

      if (progress < 1) {
        frameRef.current = window.requestAnimationFrame(animate)
      } else {
        startRef.current = null
      }
    }

    frameRef.current = window.requestAnimationFrame(animate)

    return () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current)
      }
    }
  }, [hasAnimated, value, duration])

  const decimals = Number.isInteger(value) ? 0 : 1
  const formatted = display.toLocaleString('en-NG', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })

  return <span ref={spanRef}>{prefix}{formatted}{suffix}</span>
}

export default CountUp
