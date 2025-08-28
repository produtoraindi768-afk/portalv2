/**
 * Hook avançado para responsividade
 * Detecta breakpoints, orientação e características do dispositivo
 */

import { useState, useEffect, useCallback } from 'react'

interface BreakpointConfig {
  sm: number
  md: number
  lg: number
  xl: number
  '2xl': number
}

interface DeviceInfo {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  isTouch: boolean
  orientation: 'portrait' | 'landscape'
  pixelRatio: number
  viewportWidth: number
  viewportHeight: number
  breakpoint: keyof BreakpointConfig | 'xs'
}

interface ResponsiveState extends DeviceInfo {
  isSmallScreen: boolean
  isMediumScreen: boolean
  isLargeScreen: boolean
  isExtraLargeScreen: boolean
  canHover: boolean
  prefersReducedMotion: boolean
}

const defaultBreakpoints: BreakpointConfig = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
}

export function useResponsive(customBreakpoints?: Partial<BreakpointConfig>): ResponsiveState {
  const breakpoints = { ...defaultBreakpoints, ...customBreakpoints }
  
  const [state, setState] = useState<ResponsiveState>(() => {
    if (typeof window === 'undefined') {
      return {
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        isTouch: false,
        orientation: 'landscape',
        pixelRatio: 1,
        viewportWidth: 1024,
        viewportHeight: 768,
        breakpoint: 'lg',
        isSmallScreen: false,
        isMediumScreen: false,
        isLargeScreen: true,
        isExtraLargeScreen: false,
        canHover: true,
        prefersReducedMotion: false
      }
    }

    return getDeviceInfo(breakpoints)
  })

  const updateState = useCallback(() => {
    setState(getDeviceInfo(breakpoints))
  }, [breakpoints])

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Atualizar estado inicial
    updateState()

    // Event listeners
    const mediaQueryLists: MediaQueryList[] = []
    
    // Breakpoints
    Object.values(breakpoints).forEach(width => {
      const mql = window.matchMedia(`(min-width: ${width}px)`)
      mql.addEventListener('change', updateState)
      mediaQueryLists.push(mql)
    })

    // Orientação
    const orientationMql = window.matchMedia('(orientation: portrait)')
    orientationMql.addEventListener('change', updateState)
    mediaQueryLists.push(orientationMql)

    // Hover capability
    const hoverMql = window.matchMedia('(hover: hover)')
    hoverMql.addEventListener('change', updateState)
    mediaQueryLists.push(hoverMql)

    // Reduced motion
    const motionMql = window.matchMedia('(prefers-reduced-motion: reduce)')
    motionMql.addEventListener('change', updateState)
    mediaQueryLists.push(motionMql)

    // Resize
    window.addEventListener('resize', updateState, { passive: true })

    return () => {
      mediaQueryLists.forEach(mql => {
        mql.removeEventListener('change', updateState)
      })
      window.removeEventListener('resize', updateState)
    }
  }, [updateState])

  return state
}

function getDeviceInfo(breakpoints: BreakpointConfig): ResponsiveState {
  if (typeof window === 'undefined') {
    return {
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      isTouch: false,
      orientation: 'landscape',
      pixelRatio: 1,
      viewportWidth: 1024,
      viewportHeight: 768,
      breakpoint: 'lg',
      isSmallScreen: false,
      isMediumScreen: false,
      isLargeScreen: true,
      isExtraLargeScreen: false,
      canHover: true,
      prefersReducedMotion: false
    }
  }

  const width = window.innerWidth
  const height = window.innerHeight
  const pixelRatio = window.devicePixelRatio || 1

  // Determinar breakpoint
  let breakpoint: keyof BreakpointConfig | 'xs' = 'xs'
  if (width >= breakpoints['2xl']) breakpoint = '2xl'
  else if (width >= breakpoints.xl) breakpoint = 'xl'
  else if (width >= breakpoints.lg) breakpoint = 'lg'
  else if (width >= breakpoints.md) breakpoint = 'md'
  else if (width >= breakpoints.sm) breakpoint = 'sm'

  // Detectar tipo de dispositivo
  const isMobile = width < breakpoints.md
  const isTablet = width >= breakpoints.md && width < breakpoints.lg
  const isDesktop = width >= breakpoints.lg

  // Detectar touch
  const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0

  // Orientação
  const orientation = height > width ? 'portrait' : 'landscape'

  // Media queries
  const canHover = window.matchMedia('(hover: hover)').matches
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  return {
    isMobile,
    isTablet,
    isDesktop,
    isTouch,
    orientation,
    pixelRatio,
    viewportWidth: width,
    viewportHeight: height,
    breakpoint,
    isSmallScreen: breakpoint === 'xs' || breakpoint === 'sm',
    isMediumScreen: breakpoint === 'md',
    isLargeScreen: breakpoint === 'lg',
    isExtraLargeScreen: breakpoint === 'xl' || breakpoint === '2xl',
    canHover,
    prefersReducedMotion
  }
}

/**
 * Hook para detectar mudanças de breakpoint
 */
export function useBreakpoint(breakpoint: keyof BreakpointConfig) {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const width = defaultBreakpoints[breakpoint]
    const mediaQuery = window.matchMedia(`(min-width: ${width}px)`)
    
    setMatches(mediaQuery.matches)

    const handler = (e: MediaQueryListEvent) => setMatches(e.matches)
    mediaQuery.addEventListener('change', handler)

    return () => mediaQuery.removeEventListener('change', handler)
  }, [breakpoint])

  return matches
}

/**
 * Hook para detectar orientação
 */
export function useOrientation() {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('landscape')

  useEffect(() => {
    if (typeof window === 'undefined') return

    const updateOrientation = () => {
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape')
    }

    updateOrientation()
    window.addEventListener('resize', updateOrientation, { passive: true })

    return () => window.removeEventListener('resize', updateOrientation)
  }, [])

  return orientation
}

/**
 * Hook para detectar capacidade de hover
 */
export function useHover() {
  const [canHover, setCanHover] = useState(true)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia('(hover: hover)')
    setCanHover(mediaQuery.matches)

    const handler = (e: MediaQueryListEvent) => setCanHover(e.matches)
    mediaQuery.addEventListener('change', handler)

    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  return canHover
}

/**
 * Hook para detectar preferência de movimento reduzido
 */
export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
    mediaQuery.addEventListener('change', handler)

    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  return prefersReducedMotion
}
