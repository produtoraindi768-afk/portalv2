"use client"

import { useEffect, useState } from "react"
import AppleHeroSection from "./AppleHeroSection"
import AppleHeroSectionCompact from "./AppleHeroSectionCompact"

/**
 * Componente responsivo que alterna entre as versões completa e compacta do hero
 * baseado no tamanho da tela para otimizar o espaço em dispositivos móveis
 */
export default function ResponsiveAppleHero() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768) // md breakpoint
    }

    // Check initial screen size
    checkScreenSize()

    // Add event listener for window resize
    window.addEventListener('resize', checkScreenSize)

    // Cleanup event listener
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  // Render compact version for mobile, full version for desktop
  return isMobile ? <AppleHeroSectionCompact /> : <AppleHeroSection />
}