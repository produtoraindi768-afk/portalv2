"use client"

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { cn } from '@/lib/utils'
import { loadGSAP } from '@/lib/gsap-loader'

// GSAP instance (loaded dynamically)
let gsap: any = null

interface GSAPTwitchPlayerProps {
  channel: string | null
  isVisible: boolean
  isSelected: boolean
  position: 'left' | 'center' | 'right'
  containerStyle: React.CSSProperties
  onPlayerReady?: (isReady: boolean) => void
  onPlayerRef?: (playerId: string, element: HTMLDivElement | null) => void
  isPersistent?: boolean
  autoplay?: boolean
  muted?: boolean
  enableGSAPAnimations?: boolean
  animationOptions?: {
    duration?: number
    ease?: string
    enableParallax?: boolean
    enableBreathing?: boolean
    enableFloating?: boolean
    enableMorphing?: boolean
  }
}

export function GSAPTwitchPlayer({
  channel,
  isVisible,
  isSelected,
  position,
  containerStyle,
  onPlayerReady,
  onPlayerRef,
  isPersistent = false,
  autoplay = true,
  muted = true,
  enableGSAPAnimations = true,
  animationOptions = {}
}: GSAPTwitchPlayerProps) {
  const {
    duration = 0.8,
    ease = "power2.out",
    enableParallax = true,
    enableBreathing = true,
    enableFloating = true,
    enableMorphing = true
  } = animationOptions

  const [mounted, setMounted] = useState(false)
  const [iframeKey, setIframeKey] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isPlayerReady, setIsPlayerReady] = useState(false)
  const [previousChannel, setPreviousChannel] = useState<string | null>(null)
  
  const containerRef = useRef<HTMLDivElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const animationRef = useRef<gsap.core.Timeline | null>(null)
  const playerId = `player-${channel}-${position}`

  // Setup inicial + carregar GSAP
  useEffect(() => {
    const initializeGSAP = async () => {
      const { gsap: gsapInstance } = await loadGSAP()
      gsap = gsapInstance
      setMounted(true)
    }
    
    initializeGSAP()
    
    return () => {
      // Limpeza das animações
      if (animationRef.current) {
        animationRef.current.kill()
      }
    }
  }, [])

  // Registrar ref do player no hook pai
  useEffect(() => {
    if (onPlayerRef && containerRef.current) {
      onPlayerRef(playerId, containerRef.current)
    }
    
    return () => {
      if (onPlayerRef) {
        onPlayerRef(playerId, null)
      }
    }
  }, [playerId, onPlayerRef])

  // Forçar remontagem quando canal muda
  useEffect(() => {
    if (channel && mounted && channel !== previousChannel) {
      setIsLoading(true)
      setIsPlayerReady(false)
      onPlayerReady?.(false)

      setIframeKey(prev => prev + 1)
      setPreviousChannel(channel)

      // Animar entrada do novo player
      if (enableGSAPAnimations && containerRef.current && gsap) {
        const timeline = gsap.timeline()
        
        // Fade out rápido
        timeline.to(containerRef.current, {
          opacity: 0.3,
          scale: 0.95,
          duration: 0.2,
          ease: "power2.in"
        })
        
        // Fade in com efeitos
        timeline.to(containerRef.current, {
          opacity: 1,
          scale: 1,
          duration: duration * 0.6,
          ease: ease,
          onComplete: () => {
            setIsLoading(false)
          }
        })

        animationRef.current = timeline
      } else {
        setTimeout(() => setIsLoading(false), 300)
      }
    }
  }, [channel, mounted, previousChannel, enableGSAPAnimations, duration, ease, onPlayerReady])

  // Animações de posição e estado
  useEffect(() => {
    if (!enableGSAPAnimations || !containerRef.current || !mounted || !gsap) return

    // Limpar animação anterior
    if (animationRef.current) {
      animationRef.current.kill()
    }

    const element = containerRef.current
    const timeline = gsap.timeline({
      defaults: {
        duration,
        ease
      }
    })

    // Animação principal de posicionamento
    timeline.to(element, {
      left: containerStyle.left,
      top: containerStyle.top,
      width: containerStyle.width,
      height: containerStyle.height,
      zIndex: isSelected ? 50 : 35,
      opacity: isVisible ? 1 : 0
    })

    // Efeitos específicos por estado
    if (isSelected && position === 'center') {
      // Player central ativo - efeitos especiais
      timeline.to(element, {
        scale: 1,
        filter: 'brightness(1) saturate(1) contrast(1.05)',
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.4), 0 0 40px rgba(var(--primary), 0.1)",
        borderRadius: "12px",
        duration: duration * 0.7
      }, "-=0.3")

      // Breathing effect
      if (enableBreathing) {
        timeline.to(element, {
          scale: 1.015,
          duration: 2.5,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut"
        }, "breathing")
      }

      // Floating effect
      if (enableFloating) {
        timeline.to(element, {
          y: "+=6px",
          duration: 3.5,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut"
        }, "floating")
      }

    } else {
      // Players laterais - efeitos sutis
      const sideScale = position === 'left' || position === 'right' ? 0.85 : 1
      
      timeline.to(element, {
        scale: sideScale,
        filter: 'brightness(0.92) saturate(0.95)',
        boxShadow: "0 15px 30px -10px rgba(0, 0, 0, 0.3)",
        borderRadius: "8px",
        transform: containerStyle.transform || 'none',
        duration: duration * 0.5
      }, "-=0.2")

      // Floating sutil para players laterais
      if (enableFloating) {
        timeline.to(element, {
          y: "+=3px",
          duration: 4,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut"
        }, "floating")
      }
    }

    // Micro-animações de hover
    const addHoverEffects = () => {
      if (!isSelected) {
        const handleMouseEnter = () => {
          gsap.to(element, {
            scale: (position === 'center' ? 1 : 0.85) + 0.05,
            filter: 'brightness(1.05) saturate(1.05)',
            duration: 0.3,
            ease: "power2.out"
          })
        }

        const handleMouseLeave = () => {
          gsap.to(element, {
            scale: position === 'center' ? 1 : 0.85,
            filter: 'brightness(0.92) saturate(0.95)',
            duration: 0.3,
            ease: "power2.out"
          })
        }

        element.addEventListener('mouseenter', handleMouseEnter)
        element.addEventListener('mouseleave', handleMouseLeave)
      }
    }

    timeline.call(() => {
      addHoverEffects()
    }, [], "+=0.1")
    animationRef.current = timeline

    return () => {
      if (animationRef.current) {
        animationRef.current.kill()
      }
    }
  }, [
    containerStyle,
    isSelected,
    isVisible,
    position,
    enableGSAPAnimations,
    enableBreathing,
    enableFloating,
    duration,
    ease,
    mounted
  ])

  // Gerar URL do embed
  const embedUrl = React.useMemo(() => {
    if (!channel || !mounted) return null

    const params = new URLSearchParams({
      channel: channel,
      autoplay: autoplay.toString(),
      muted: muted.toString(),
      controls: 'true',
      playsinline: 'true'
    })

    const parents = new Set<string>()
    if (typeof window !== 'undefined' && window.location.hostname) {
      parents.add(window.location.hostname)
    }
    parents.add('localhost')
    parents.forEach((p) => params.append('parent', p))
    
    return `https://player.twitch.tv/?${params.toString()}`
  }, [channel, autoplay, muted, mounted])

  // Handler de carregamento do iframe
  const handleIframeLoad = useCallback(() => {
    console.log(`GSAP Player loaded: ${channel}`)
    setIsLoading(false)
    setIsPlayerReady(true)
    onPlayerReady?.(true)

    // Animação de entrada suave após carregamento
    if (enableGSAPAnimations && iframeRef.current && gsap) {
      gsap.fromTo(iframeRef.current,
        {
          opacity: 0,
          scale: 0.95,
          filter: 'blur(2px)'
        },
        {
          opacity: 1,
          scale: 1,
          filter: 'blur(0px)',
          duration: 0.6,
          ease: "power2.out"
        }
      )
    }
  }, [channel, onPlayerReady, enableGSAPAnimations])

  if (!mounted || !channel || !embedUrl) return null

  const playerContent = (
    <div
      ref={containerRef}
      className={cn(
        "fixed transition-none", // Remover transitions CSS para usar GSAP
        isVisible ? "pointer-events-auto" : "pointer-events-none"
      )}
      style={{
        // Estilos iniciais - GSAP vai animar
        position: 'fixed',
        left: containerStyle.left,
        top: containerStyle.top,
        width: containerStyle.width,
        height: containerStyle.height,
        zIndex: isSelected ? 50 : 35,
        // GSAP vai gerenciar transforms
        willChange: 'transform, opacity, filter',
        backfaceVisibility: 'hidden'
      }}
    >
      <AspectRatio ratio={16 / 9} className="w-full h-full relative">
        {/* Loading overlay otimizado */}
        {isLoading && (
          <div className={cn(
            "absolute inset-0 z-10 flex items-center justify-center rounded-lg",
            "bg-gradient-to-br from-background/95 via-background/90 to-background/95 backdrop-blur-md",
            "border border-border/30 shadow-2xl"
          )}>
            <div className="flex flex-col items-center gap-3">
              {/* Spinner GSAP animado */}
              <div 
                className="w-8 h-8 border-2 border-border/20 border-t-primary rounded-full"
                ref={(el) => {
                  if (el && enableGSAPAnimations && gsap) {
                    gsap.to(el, {
                      rotation: 360,
                      duration: 1,
                      repeat: -1,
                      ease: "none"
                    })
                  }
                }}
              />
              <span className="text-sm text-muted-foreground">
                Carregando stream...
              </span>
            </div>
          </div>
        )}
        
        <iframe
          ref={iframeRef}
          key={`gsap-${isPersistent ? 'persistent' : 'preview'}-${channel}-${iframeKey}`}
          src={embedUrl}
          className="w-full h-full block relative"
          frameBorder="0"
          allowFullScreen
          scrolling="no"
          title={`${channel} - Twitch Stream (GSAP)`}
          allow="autoplay; fullscreen; encrypted-media"
          onLoad={handleIframeLoad}
          style={{
            opacity: isLoading ? 0 : 1,
            transition: enableGSAPAnimations ? 'none' : 'opacity 0.3s ease'
          }}
        />
      </AspectRatio>
    </div>
  )

  return createPortal(playerContent, document.body)
}