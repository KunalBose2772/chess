'use client'

import Image from 'next/image'
import { useTheme } from './ThemeProvider'
import { useState, useEffect } from 'react'

export default function HeroBg() {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  // Don't render until client-side so we know the actual theme
  if (!mounted) return null

  return (
    <div className="absolute inset-0 z-0 pointer-events-none">
      <Image
        src={theme === 'dark' ? '/images/hero-dark.png' : '/images/hero-light.png'}
        alt="Hero Background"
        fill
        className="object-cover opacity-100"
        priority
      />
    </div>
  )
}
