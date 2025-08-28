"use client"

import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { loadGSAP } from '@/lib/gsap-loader'

// GSAP instances (loaded dynamically)
let gsap: any = null
let ScrollTrigger: any = null

export type StreamPosition = {
  streamer: any
  position: 'left' | 'center' | 'right'
  isSelected: boolean
  containerStyle: React.CSSProperties
  gsapAnimation?: gsap.core.Timeline | null
}

export interface GSAPStreamLayoutOptions {
  enableScrollAnimations?: boolean
  animationDuration?: number
  easeType?: string
  enableParallax?: boolean
  parallaxIntensity?: number
  enableMorphing?: boolean
  enableBreathing?: boolean
  enableFloating?: boolean
}

export function useGSAPStreamLayout(options: GSAPStreamLayoutOptions = {}) {
  const {
    enableScrollAnimations = true,
    animationDuration = 0.8,
    easeType = "power2.out",
    enableParallax = true,
    parallaxIntensity = 0.3,
    enableMorphing = true,
    enableBreathing = true,
    enableFloating = true
  } = options

  const [sectionRect, setSectionRect] = useState<DOMRect | null>(null)
  const [mounted, setMounted] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)
  const playersRefs = useRef<Map<string, HTMLDivElement>>(new Map())
  const animationsRefs = useRef<Map<string, gsap.core.Timeline>>(new Map())
  const scrollTriggerRefs = useRef<Map<string, ScrollTrigger>>(new Map())

  // Garantir montagem e limpeza + carregar GSAP
  useEffect(() => {
    const initializeGSAP = async () => {
      const { gsap: gsapInstance, ScrollTrigger: scrollTriggerInstance } = await loadGSAP()
      gsap = gsapInstance
      ScrollTrigger = scrollTriggerInstance
      setMounted(true)
    }

    initializeGSAP()
    
    return () => {
      // Limpeza de todas as animações e scroll triggers
      if (gsap) {
        animationsRefs.current.forEach(timeline => timeline.kill())
        scrollTriggerRefs.current.forEach(trigger => trigger.kill())
      }
      animationsRefs.current.clear()
      scrollTriggerRefs.current.clear()
      playersRefs.current.clear()
    }
  }, [])

  // Atualizar posição da seção com GSAP otimizado
  useEffect(() => {
    if (!mounted) return

    const updateSectionRect = () => {
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect()
        setSectionRect(prevRect => {
          // Só atualizar se realmente mudou para evitar re-renders desnecessários
          if (!prevRect ||
              Math.abs(prevRect.width - rect.width) > 1 ||
              Math.abs(prevRect.height - rect.height) > 1 ||
              Math.abs(prevRect.top - rect.top) > 1 ||
              Math.abs(prevRect.left - rect.left) > 1) {
            return rect
          }
          return prevRect
        })
      }
    }

    // Observer para mudanças de layout mais eficiente
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === sectionRef.current) {
          updateSectionRect()
        }
      }
    })

    if (sectionRef.current) {
      resizeObserver.observe(sectionRef.current)
    }

    // RAF otimizado
    const rafId = requestAnimationFrame(updateSectionRect)

    // Throttled scroll handler para performance
    let scrollTimeout: NodeJS.Timeout
    const handleScroll = () => {
      clearTimeout(scrollTimeout)
      scrollTimeout = setTimeout(updateSectionRect, 16) // ~60fps
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      cancelAnimationFrame(rafId)
      clearTimeout(scrollTimeout)
      window.removeEventListener('scroll', handleScroll)
      resizeObserver.disconnect()
    }
  }, [mounted])

  // Dimensões responsivas com GSAP breakpoints
  const responsiveDimensions = useMemo(() => {
    const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1200
    
    // Mobile (< 640px): Layout vertical compacto
    if (viewportWidth < 640) {
      return {
        centerWidth: Math.min(viewportWidth - 32, 360),
        centerHeight: Math.min((viewportWidth - 32) * 9 / 16, 203),
        sideWidth: Math.min(viewportWidth - 64, 280),
        sideHeight: Math.min((viewportWidth - 64) * 9 / 16, 158),
        sideOffset: 80,
        verticalSpacing: 120,
        parallaxRange: 50,
        morphingScale: 0.05
      }
    }
    // Tablet (640px - 1024px): Layout médio
    else if (viewportWidth < 1024) {
      return {
        centerWidth: 480,
        centerHeight: 270,
        sideWidth: 400,
        sideHeight: 225,
        sideOffset: 200,
        verticalSpacing: 150,
        parallaxRange: 80,
        morphingScale: 0.08
      }
    }
    // Desktop (>= 1024px): Layout completo
    else {
      return {
        centerWidth: 720,
        centerHeight: 405,
        sideWidth: 600,
        sideHeight: 338,
        sideOffset: 300,
        verticalSpacing: 200,
        parallaxRange: 120,
        morphingScale: 0.1
      }
    }
  }, [])

  // Função para criar animações GSAP avançadas
  const createPlayerAnimation = useCallback((
    playerId: string,
    position: 'left' | 'center' | 'right',
    isSelected: boolean,
    containerStyle: React.CSSProperties
  ) => {
    const playerElement = playersRefs.current.get(playerId)
    if (!playerElement || !gsap) return null

    // Limpar animação anterior se existir
    const existingAnimation = animationsRefs.current.get(playerId)
    const existingScrollTrigger = scrollTriggerRefs.current.get(playerId)
    
    if (existingAnimation) existingAnimation.kill()
    if (existingScrollTrigger) existingScrollTrigger.kill()

    // Criar nova timeline
    const timeline = gsap.timeline({
      defaults: {
        duration: animationDuration,
        ease: easeType
      }
    })

    // Animação principal de posicionamento
    timeline.to(playerElement, {
      left: containerStyle.left,
      top: containerStyle.top,
      width: containerStyle.width,
      height: containerStyle.height,
      transform: containerStyle.transform || 'none',
      zIndex: isSelected ? 50 : 35,
      scale: isSelected ? 1 : 0.85,
      opacity: 1,
      filter: isSelected ? 'brightness(1) saturate(1)' : 'brightness(0.9) saturate(0.95)'
    })

    // Animações específicas por posição
    if (position === 'center' && isSelected) {
      // Player central - efeitos especiais
      timeline.to(playerElement, {
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.4), 0 0 40px rgba(var(--primary), 0.1)",
        borderRadius: "12px",
        duration: animationDuration * 0.5
      }, "-=0.3")

      // Breathing effect para player ativo
      if (enableBreathing) {
        timeline.to(playerElement, {
          scale: 1.02,
          duration: 2,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut"
        }, "+=0.2")
      }
    } else {
      // Players laterais - efeitos sutis
      timeline.to(playerElement, {
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)",
        borderRadius: "8px",
        duration: animationDuration * 0.3
      }, "-=0.2")
    }

    // Floating effect para todos os players
    if (enableFloating) {
      const floatingIntensity = isSelected ? 8 : 4
      timeline.to(playerElement, {
        y: `+=${floatingIntensity}`,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      }, "floating")
    }

    // Scroll-triggered parallax e morphing
    if (enableScrollAnimations && enableParallax && typeof window !== 'undefined' && ScrollTrigger) {
      const scrollTrigger = ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top bottom",
        end: "bottom top",
        scrub: 1,
        onUpdate: (trigger) => {
          const progress = trigger.progress
          const parallaxOffset = (progress - 0.5) * responsiveDimensions.parallaxRange * parallaxIntensity
          
          // Parallax baseado na posição
          const parallaxMultiplier = position === 'left' ? -1 : position === 'right' ? 1 : 0
          
          gsap.set(playerElement, {
            y: parallaxOffset * parallaxMultiplier,
            rotationY: parallaxOffset * parallaxMultiplier * 0.1, // Sutil efeito 3D
          })

          // Morphing sutil baseado no scroll
          if (enableMorphing && isSelected) {
            const morphScale = 1 + Math.sin(progress * Math.PI * 2) * responsiveDimensions.morphingScale
            gsap.set(playerElement, {
              scaleX: morphScale,
              scaleY: 1 / morphScale // Compensar para manter área
            })
          }
        }
      })

      scrollTriggerRefs.current.set(playerId, scrollTrigger)
    }

    // Micro-animações de interação
    const addInteractionAnimations = () => {
      if (!isSelected) {
        // Hover effects para players não selecionados
        playerElement.addEventListener('mouseenter', () => {
          gsap.to(playerElement, {
            scale: 0.9,
            brightness: 1.1,
            saturate: 1.1,
            duration: 0.3,
            ease: "power2.out"
          })
        })

        playerElement.addEventListener('mouseleave', () => {
          gsap.to(playerElement, {
            scale: 0.85,
            brightness: 0.9,
            saturate: 0.95,
            duration: 0.3,
            ease: "power2.out"
          })
        })
      }
    }

    // Aplicar animações de interação após a animação principal
    timeline.call(addInteractionAnimations, [], "+=0.1")

    animationsRefs.current.set(playerId, timeline)
    return timeline
  }, [
    animationDuration,
    easeType,
    enableScrollAnimations,
    enableParallax,
    enableMorphing,
    enableBreathing,
    enableFloating,
    parallaxIntensity,
    responsiveDimensions
  ])

  // Função para registrar ref de um player
  const registerPlayerRef = useCallback((playerId: string, element: HTMLDivElement | null) => {
    if (element) {
      playersRefs.current.set(playerId, element)
      
      // Configurar estilos iniciais com GSAP
      if (gsap) {
        gsap.set(element, {
          position: 'fixed',
          transformOrigin: 'center center',
          willChange: 'transform, opacity, filter',
          backfaceVisibility: 'hidden',
          perspective: 1000
        })
      }
    } else {
      playersRefs.current.delete(playerId)
      
      // Limpar animações associadas
      const animation = animationsRefs.current.get(playerId)
      const scrollTrigger = scrollTriggerRefs.current.get(playerId)
      
      if (animation) {
        animation.kill()
        animationsRefs.current.delete(playerId)
      }
      
      if (scrollTrigger) {
        scrollTrigger.kill()
        scrollTriggerRefs.current.delete(playerId)
      }
    }
  }, [])

  // Função para animar transição entre streams
  const animateStreamTransition = useCallback((
    fromStreamId: string,
    toStreamId: string,
    direction: 'left' | 'right' = 'right'
  ) => {
    const fromElement = playersRefs.current.get(fromStreamId)
    const toElement = playersRefs.current.get(toStreamId)

    if (!fromElement || !toElement) return Promise.resolve()

    // Timeline mestre para transição
    const transitionTimeline = gsap.timeline()

    // Saída do stream atual
    transitionTimeline.to(fromElement, {
      scale: 0.8,
      opacity: 0.5,
      rotationY: direction === 'right' ? -15 : 15,
      x: direction === 'right' ? -100 : 100,
      duration: animationDuration * 0.4,
      ease: "power2.in"
    })

    // Entrada do novo stream
    transitionTimeline.fromTo(toElement, 
      {
        scale: 0.8,
        opacity: 0.5,
        rotationY: direction === 'right' ? 15 : -15,
        x: direction === 'right' ? 100 : -100
      },
      {
        scale: 1,
        opacity: 1,
        rotationY: 0,
        x: 0,
        duration: animationDuration * 0.6,
        ease: "power2.out"
      },
      "-=0.2" // Overlap para suavidade
    )

    return transitionTimeline.then()
  }, [animationDuration])

  const calculatePositions = (
    streamers: any[], 
    selectedIndex: number,
    headerOffset: number = 0
  ): StreamPosition[] => {
    if (streamers.length === 0 || !sectionRect) return []

    const centerX = sectionRect.left + sectionRect.width / 2
    const centerY = sectionRect.top + sectionRect.height / 2 + headerOffset

    // Single stream
    if (streamers.length === 1) {
      const position: StreamPosition = {
        streamer: streamers[0],
        position: 'center',
        isSelected: true,
        containerStyle: {
          left: Math.max(0, centerX - responsiveDimensions.centerWidth / 2),
          top: centerY - responsiveDimensions.centerHeight / 2,
          width: responsiveDimensions.centerWidth,
          height: responsiveDimensions.centerHeight
        }
      }
      
      // Criar animação GSAP
      position.gsapAnimation = createPlayerAnimation(
        streamers[0].id,
        'center',
        true,
        position.containerStyle
      )
      
      return [position]
    }

    // Two streams
    if (streamers.length === 2) {
      const positions: StreamPosition[] = [
        {
          streamer: streamers[0],
          position: selectedIndex === 0 ? 'center' : 'left',
          isSelected: selectedIndex === 0,
          containerStyle: selectedIndex === 0 ? {
            left: Math.max(0, centerX - responsiveDimensions.centerWidth / 2),
            top: centerY - responsiveDimensions.centerHeight / 2,
            width: responsiveDimensions.centerWidth,
            height: responsiveDimensions.centerHeight
          } : {
            left: Math.max(16, centerX - responsiveDimensions.centerWidth / 2 - responsiveDimensions.sideOffset),
            top: centerY - responsiveDimensions.sideHeight / 2,
            width: responsiveDimensions.sideWidth,
            height: responsiveDimensions.sideHeight,
            transform: window.innerWidth >= 1024 ? 'scale(0.85) rotateY(5deg)' : 'scale(0.9)'
          }
        },
        {
          streamer: streamers[1],
          position: selectedIndex === 1 ? 'center' : 'right',
          isSelected: selectedIndex === 1,
          containerStyle: selectedIndex === 1 ? {
            left: Math.max(0, centerX - responsiveDimensions.centerWidth / 2),
            top: centerY - responsiveDimensions.centerHeight / 2,
            width: responsiveDimensions.centerWidth,
            height: responsiveDimensions.centerHeight
          } : {
            left: Math.min(
              sectionRect.width - responsiveDimensions.sideWidth - 16,
              centerX + responsiveDimensions.centerWidth / 2 + (responsiveDimensions.sideOffset - responsiveDimensions.sideWidth)
            ),
            top: centerY - responsiveDimensions.sideHeight / 2,
            width: responsiveDimensions.sideWidth,
            height: responsiveDimensions.sideHeight,
            transform: window.innerWidth >= 1024 ? 'scale(0.85) rotateY(-5deg)' : 'scale(0.9)'
          }
        }
      ]

      // Criar animações GSAP para cada posição
      positions.forEach(position => {
        position.gsapAnimation = createPlayerAnimation(
          position.streamer.id,
          position.position,
          position.isSelected,
          position.containerStyle
        )
      })
      
      return positions
    }

    // Three or more streams
    const leftIndex = (selectedIndex - 1 + streamers.length) % streamers.length
    const rightIndex = (selectedIndex + 1) % streamers.length

    const positions: StreamPosition[] = [
      {
        streamer: streamers[leftIndex],
        position: 'left',
        isSelected: false,
        containerStyle: {
          left: Math.max(16, centerX - responsiveDimensions.centerWidth / 2 - responsiveDimensions.sideOffset),
          top: centerY - responsiveDimensions.sideHeight / 2,
          width: responsiveDimensions.sideWidth,
          height: responsiveDimensions.sideHeight,
          transform: window.innerWidth >= 1024 ? 'scale(0.85) rotateY(5deg)' : 'scale(0.9)'
        }
      },
      {
        streamer: streamers[selectedIndex],
        position: 'center',
        isSelected: true,
        containerStyle: {
          left: Math.max(0, centerX - responsiveDimensions.centerWidth / 2),
          top: centerY - responsiveDimensions.centerHeight / 2,
          width: responsiveDimensions.centerWidth,
          height: responsiveDimensions.centerHeight
        }
      },
      {
        streamer: streamers[rightIndex],
        position: 'right',
        isSelected: false,
        containerStyle: {
          left: Math.min(
            sectionRect.width - responsiveDimensions.sideWidth - 16,
            centerX + responsiveDimensions.centerWidth / 2 + (responsiveDimensions.sideOffset - responsiveDimensions.sideWidth)
          ),
          top: centerY - responsiveDimensions.sideHeight / 2,
          width: responsiveDimensions.sideWidth,
          height: responsiveDimensions.sideHeight,
          transform: window.innerWidth >= 1024 ? 'scale(0.85) rotateY(-5deg)' : 'scale(0.9)'
        }
      }
    ]

    // Criar animações GSAP para cada posição
    positions.forEach(position => {
      position.gsapAnimation = createPlayerAnimation(
        position.streamer.id,
        position.position,
        position.isSelected,
        position.containerStyle
      )
    })

    return positions
  }

  return {
    sectionRef,
    sectionRect,
    responsiveDimensions,
    calculatePositions,
    registerPlayerRef,
    animateStreamTransition,
    createPlayerAnimation,
    mounted
  }
}