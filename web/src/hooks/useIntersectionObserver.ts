/**
 * Hook para Intersection Observer
 * Detecta quando elementos entram/saem da viewport
 */

import { useEffect, useRef, useState, useCallback } from 'react'

interface UseIntersectionObserverOptions {
  threshold?: number | number[]
  rootMargin?: string
  enabled?: boolean
}

export function useIntersectionObserver(
  options: UseIntersectionObserverOptions = {}
) {
  const {
    threshold = 0.1,
    rootMargin = '50px',
    enabled = true
  } = options

  const [isIntersecting, setIsIntersecting] = useState(false)
  const [hasIntersected, setHasIntersected] = useState(false)
  const targetRef = useRef<HTMLElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)

  const observe = useCallback((element: HTMLElement) => {
    if (!enabled || !element) return

    if (observerRef.current) {
      observerRef.current.disconnect()
    }

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        const isVisible = entry.isIntersecting
        setIsIntersecting(isVisible)
        
        if (isVisible && !hasIntersected) {
          setHasIntersected(true)
        }
      },
      {
        threshold,
        rootMargin
      }
    )

    observerRef.current.observe(element)
    targetRef.current = element
  }, [enabled, threshold, rootMargin, hasIntersected])

  const disconnect = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect()
      observerRef.current = null
    }
  }, [])

  useEffect(() => {
    return () => {
      disconnect()
    }
  }, [disconnect])

  return {
    observe,
    disconnect,
    isIntersecting,
    hasIntersected,
    targetRef
  }
}

/**
 * Hook para lazy loading de componentes
 */
export function useLazyLoad(enabled: boolean = true) {
  const { observe, isIntersecting, hasIntersected } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '100px', // Carregar 100px antes de entrar na viewport
    enabled
  })

  const [shouldLoad, setShouldLoad] = useState(!enabled)

  useEffect(() => {
    if (enabled && hasIntersected) {
      setShouldLoad(true)
    }
  }, [enabled, hasIntersected])

  const ref = useCallback((element: HTMLElement | null) => {
    if (element && enabled) {
      observe(element)
    }
  }, [observe, enabled])

  return {
    ref,
    shouldLoad,
    isVisible: isIntersecting,
    hasBeenVisible: hasIntersected
  }
}

/**
 * Hook para lazy loading de imagens
 */
export function useLazyImage(src: string, enabled: boolean = true) {
  const [imageSrc, setImageSrc] = useState<string | undefined>(enabled ? undefined : src)
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  
  const { ref, shouldLoad } = useLazyLoad(enabled)

  useEffect(() => {
    if (shouldLoad && !imageSrc && src) {
      setImageSrc(src)
    }
  }, [shouldLoad, imageSrc, src])

  const handleLoad = useCallback(() => {
    setIsLoaded(true)
    setHasError(false)
  }, [])

  const handleError = useCallback(() => {
    setHasError(true)
    setIsLoaded(false)
  }, [])

  return {
    ref,
    src: imageSrc,
    isLoaded,
    hasError,
    shouldLoad,
    onLoad: handleLoad,
    onError: handleError
  }
}

/**
 * Hook para lazy loading de players/iframes
 */
export function useLazyPlayer(enabled: boolean = true) {
  const { ref, shouldLoad, isVisible, hasBeenVisible } = useLazyLoad(enabled)
  const [isPlayerReady, setIsPlayerReady] = useState(false)

  // Reset player ready quando sai de vista (opcional)
  useEffect(() => {
    if (!isVisible && hasBeenVisible) {
      // Opcional: resetar player quando sai de vista
      // setIsPlayerReady(false)
    }
  }, [isVisible, hasBeenVisible])

  const handlePlayerReady = useCallback(() => {
    setIsPlayerReady(true)
  }, [])

  return {
    ref,
    shouldLoadPlayer: shouldLoad,
    isPlayerVisible: isVisible,
    isPlayerReady,
    hasPlayerBeenVisible: hasBeenVisible,
    onPlayerReady: handlePlayerReady
  }
}

/**
 * Hook para detectar se elemento está próximo da viewport
 */
export function useNearViewport(distance: string = '200px') {
  const { observe, isIntersecting } = useIntersectionObserver({
    rootMargin: distance,
    threshold: 0
  })

  const [isNear, setIsNear] = useState(false)

  useEffect(() => {
    if (isIntersecting) {
      setIsNear(true)
    }
  }, [isIntersecting])

  const ref = useCallback((element: HTMLElement | null) => {
    if (element) {
      observe(element)
    }
  }, [observe])

  return {
    ref,
    isNear,
    isInViewport: isIntersecting
  }
}
