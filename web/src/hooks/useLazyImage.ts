/**
 * Hook otimizado para lazy loading de imagens
 * Carrega imagens apenas quando necessário e com fallbacks
 */

import { useState, useEffect, useRef, useCallback } from 'react'

interface UseLazyImageOptions {
  rootMargin?: string
  threshold?: number
  fallbackSrc?: string
  enableWebP?: boolean
  enableAVIF?: boolean
}

interface UseLazyImageReturn {
  ref: (element: HTMLElement | null) => void
  src: string | undefined
  isLoaded: boolean
  isLoading: boolean
  error: string | null
  retry: () => void
}

export function useLazyImage(
  imageSrc: string | undefined,
  options: UseLazyImageOptions = {}
): UseLazyImageReturn {
  const {
    rootMargin = '50px',
    threshold = 0.1,
    fallbackSrc,
    enableWebP = true,
    enableAVIF = true
  } = options

  const [src, setSrc] = useState<string | undefined>(undefined)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isIntersecting, setIsIntersecting] = useState(false)

  const elementRef = useRef<HTMLElement | null>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const imageRef = useRef<HTMLImageElement | null>(null)

  // Função para detectar suporte a formatos modernos
  const getSupportedFormat = useCallback(async (originalSrc: string) => {
    if (!originalSrc) return originalSrc

    // Verificar se é uma URL externa que pode ter formatos otimizados
    if (originalSrc.includes('twitch.tv') || originalSrc.includes('amazonaws.com')) {
      // Para Twitch, tentar WebP primeiro
      if (enableWebP && supportsWebP()) {
        const webpSrc = originalSrc.replace(/\.(jpg|jpeg|png)$/i, '.webp')
        if (await checkImageExists(webpSrc)) {
          return webpSrc
        }
      }
    }

    return originalSrc
  }, [enableWebP, enableAVIF])

  // Verificar suporte a WebP
  const supportsWebP = useCallback(() => {
    if (typeof window === 'undefined') return false
    const canvas = document.createElement('canvas')
    canvas.width = 1
    canvas.height = 1
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0
  }, [])

  // Verificar se imagem existe
  const checkImageExists = useCallback((url: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => resolve(true)
      img.onerror = () => resolve(false)
      img.src = url
    })
  }, [])

  // Função para carregar imagem
  const loadImage = useCallback(async (imageUrl: string) => {
    if (!imageUrl || isLoading) return

    setIsLoading(true)
    setError(null)

    try {
      // Tentar formato otimizado primeiro
      const optimizedSrc = await getSupportedFormat(imageUrl)
      
      // Criar nova imagem para preload
      const img = new Image()
      imageRef.current = img

      img.onload = () => {
        setSrc(optimizedSrc)
        setIsLoaded(true)
        setIsLoading(false)
      }

      img.onerror = () => {
        // Tentar fallback se disponível
        if (fallbackSrc && optimizedSrc !== fallbackSrc) {
          img.src = fallbackSrc
        } else {
          setError('Falha ao carregar imagem')
          setIsLoading(false)
          // Usar src original como último recurso
          setSrc(imageUrl)
        }
      }

      img.src = optimizedSrc
    } catch (err) {
      setError('Erro ao processar imagem')
      setIsLoading(false)
      setSrc(imageUrl) // Fallback para src original
    }
  }, [isLoading, getSupportedFormat, fallbackSrc])

  // Função para retry
  const retry = useCallback(() => {
    if (imageSrc) {
      setError(null)
      setIsLoaded(false)
      setSrc(undefined)
      loadImage(imageSrc)
    }
  }, [imageSrc, loadImage])

  // Configurar Intersection Observer
  const ref = useCallback((element: HTMLElement | null) => {
    if (elementRef.current && observerRef.current) {
      observerRef.current.unobserve(elementRef.current)
    }

    elementRef.current = element

    if (element) {
      if (!observerRef.current) {
        observerRef.current = new IntersectionObserver(
          (entries) => {
            const [entry] = entries
            if (entry.isIntersecting) {
              setIsIntersecting(true)
              observerRef.current?.unobserve(element)
            }
          },
          {
            rootMargin,
            threshold
          }
        )
      }

      observerRef.current.observe(element)
    }
  }, [rootMargin, threshold])

  // Carregar imagem quando entrar na viewport
  useEffect(() => {
    if (isIntersecting && imageSrc && !src && !isLoading) {
      loadImage(imageSrc)
    }
  }, [isIntersecting, imageSrc, src, isLoading, loadImage])

  // Cleanup
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
      if (imageRef.current) {
        imageRef.current.onload = null
        imageRef.current.onerror = null
      }
    }
  }, [])

  return {
    ref,
    src,
    isLoaded,
    isLoading,
    error,
    retry
  }
}

/**
 * Hook simplificado para lazy loading de avatares
 */
export function useLazyAvatar(avatarUrl: string | undefined, fallbackSrc?: string) {
  return useLazyImage(avatarUrl, {
    rootMargin: '100px',
    threshold: 0.1,
    fallbackSrc,
    enableWebP: true
  })
}

/**
 * Hook para lazy loading de imagens de background
 */
export function useLazyBackground(backgroundUrl: string | undefined) {
  const { ref, src, isLoaded, isLoading } = useLazyImage(backgroundUrl, {
    rootMargin: '200px',
    threshold: 0.05,
    enableWebP: true,
    enableAVIF: true
  })

  return {
    ref,
    backgroundImage: src ? `url(${src})` : undefined,
    isLoaded,
    isLoading
  }
}
