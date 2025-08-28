"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { collection, getDocs, query } from "firebase/firestore"
import { getClientFirestore } from "@/lib/safeFirestore"
import { useMiniplPlayerContext } from '@/components/miniplayer/MiniplPlayerProvider'
import { useHeaderHeight } from '@/contexts/HeaderHeightContext'
import { ChevronLeft, ChevronRight } from "lucide-react"
import { twitchStatusService } from "@/lib/twitch-status"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
// Componentes GSAP
import { useGSAPStreamLayout } from "@/hooks/useGSAPStreamLayout"
import { GSAPTwitchPlayer } from "@/components/streamers/GSAPTwitchPlayer"

type StreamerDoc = {
  id: string
  name?: string
  platform?: string
  streamUrl?: string
  avatarUrl?: string
  category?: string
  isOnline?: boolean
  isFeatured?: boolean
  createdAt?: string
  lastStatusUpdate?: string
  viewerCount?: number
  language?: string
}

interface GSAPStreamersProps {
  enableAdvancedAnimations?: boolean
  animationSettings?: {
    duration?: number
    ease?: string
    enableParallax?: boolean
    parallaxIntensity?: number
    enableBreathing?: boolean
    enableFloating?: boolean
    enableMorphing?: boolean
  }
}

export function GSAPStreamersSection({ 
  enableAdvancedAnimations = true,
  animationSettings = {}
}: GSAPStreamersProps) {
  const {
    duration = 0.8,
    ease = "power2.out",
    enableParallax = true,
    parallaxIntensity = 0.3,
    enableBreathing = true,
    enableFloating = true,
    enableMorphing = true
  } = animationSettings

  // Estados principais
  const [streamers, setStreamers] = useState<StreamerDoc[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null)
  const [mounted, setMounted] = useState(false)

  // Contexts
  const { featuredMatchesHeight } = useHeaderHeight()
  const { 
    activePlayer, 
    setActivePlayer, 
    isMinimized, 
    setMinimized 
  } = useMiniplPlayerContext()

  // Hook GSAP customizado
  const {
    sectionRef,
    sectionRect,
    responsiveDimensions,
    registerPlayerRef,
    animateStreamTransition,
    mounted: layoutMounted
  } = useGSAPStreamLayout({
    enableScrollAnimations: enableAdvancedAnimations,
    animationDuration: duration,
    easeType: ease,
    enableParallax,
    parallaxIntensity,
    enableMorphing,
    enableBreathing,
    enableFloating
  })

  // Setup inicial
  useEffect(() => {
    setMounted(true)
  }, [])

  // Carregar streamers do Firebase
  useEffect(() => {
    const loadStreamers = async () => {
      if (!mounted) return

      // DESABILITADO: GSAPStreamersSection não é usado na página principal
      // Para evitar requests duplicados, retorna vazio
      console.warn('GSAPStreamersSection está desabilitado para evitar requests duplicados')
      setStreamers([])
      setIsLoading(false)
      return

      try {
        const db = getClientFirestore()
        if (!db) {
          console.error('Firebase not initialized')
          setIsLoading(false)
          return
        }

        const q = query(collection(db, "streamers"))
        const querySnapshot = await getDocs(q)
        const streamersData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as StreamerDoc[]

        console.log('Loaded streamers for GSAP:', streamersData.length)
        setStreamers(streamersData.filter(s => s.isOnline && s.isFeatured))
      } catch (error) {
        console.error('Error loading streamers:', error)
        setStreamers([])
      } finally {
        setIsLoading(false)
      }
    }

    loadStreamers()
  }, [mounted])

  // Calcular posições dos streams
  const visibleStreams = React.useMemo(() => {
    if (streamers.length === 0 || !sectionRect || !layoutMounted) return []

    const centerX = sectionRect.left + sectionRect.width / 2
    const centerY = sectionRect.top + sectionRect.height / 2 + (featuredMatchesHeight || 0)

    // Stream único
    if (streamers.length === 1) {
      return [{
        streamer: streamers[0],
        position: 'center' as const,
        isSelected: true,
        containerStyle: {
          left: Math.max(0, centerX - responsiveDimensions.centerWidth / 2),
          top: centerY - responsiveDimensions.centerHeight / 2,
          width: responsiveDimensions.centerWidth,
          height: responsiveDimensions.centerHeight
        }
      }]
    }

    // Dois streams
    if (streamers.length === 2) {
      const leftPosition = Math.max(16, centerX - responsiveDimensions.centerWidth / 2 - responsiveDimensions.sideOffset)
      const rightPosition = Math.min(
        (sectionRect?.width || window.innerWidth) - responsiveDimensions.sideWidth - 16,
        centerX + responsiveDimensions.centerWidth / 2 + responsiveDimensions.sideOffset - responsiveDimensions.sideWidth
      )

      return [
        {
          streamer: streamers[0],
          position: selectedIndex === 0 ? 'center' as const : 'left' as const,
          isSelected: selectedIndex === 0,
          containerStyle: selectedIndex === 0 ? {
            left: Math.max(0, centerX - responsiveDimensions.centerWidth / 2),
            top: centerY - responsiveDimensions.centerHeight / 2,
            width: responsiveDimensions.centerWidth,
            height: responsiveDimensions.centerHeight
          } : {
            left: leftPosition,
            top: centerY - responsiveDimensions.sideHeight / 2,
            width: responsiveDimensions.sideWidth,
            height: responsiveDimensions.sideHeight,
            transform: window.innerWidth >= 1024 ? 'scale(0.85) rotateY(5deg)' : 'scale(0.9)'
          }
        },
        {
          streamer: streamers[1],
          position: selectedIndex === 1 ? 'center' as const : 'right' as const,
          isSelected: selectedIndex === 1,
          containerStyle: selectedIndex === 1 ? {
            left: Math.max(0, centerX - responsiveDimensions.centerWidth / 2),
            top: centerY - responsiveDimensions.centerHeight / 2,
            width: responsiveDimensions.centerWidth,
            height: responsiveDimensions.centerHeight
          } : {
            left: rightPosition,
            top: centerY - responsiveDimensions.sideHeight / 2,
            width: responsiveDimensions.sideWidth,
            height: responsiveDimensions.sideHeight,
            transform: window.innerWidth >= 1024 ? 'scale(0.85) rotateY(-5deg)' : 'scale(0.9)'
          }
        }
      ]
    }

    // Três ou mais streams
    const leftIndex = (selectedIndex - 1 + streamers.length) % streamers.length
    const rightIndex = (selectedIndex + 1) % streamers.length
    const viewportWidth = window.innerWidth

    const leftPosition = Math.max(16, centerX - responsiveDimensions.centerWidth / 2 - responsiveDimensions.sideOffset)
    const rightBasePosition = centerX + responsiveDimensions.centerWidth / 2 + responsiveDimensions.sideOffset - responsiveDimensions.sideWidth
    const rightPosition = Math.max(16, Math.min(viewportWidth - responsiveDimensions.sideWidth - 16, rightBasePosition))

    return [
      {
        streamer: streamers[leftIndex],
        position: 'left' as const,
        isSelected: false,
        containerStyle: {
          left: leftPosition,
          top: centerY - responsiveDimensions.sideHeight / 2,
          width: responsiveDimensions.sideWidth,
          height: responsiveDimensions.sideHeight,
          transform: window.innerWidth >= 1024 ? 'scale(0.85) rotateY(5deg)' : 'scale(0.9)'
        }
      },
      {
        streamer: streamers[selectedIndex],
        position: 'center' as const,
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
        position: 'right' as const,
        isSelected: false,
        containerStyle: {
          left: rightPosition,
          top: centerY - responsiveDimensions.sideHeight / 2,
          width: responsiveDimensions.sideWidth,
          height: responsiveDimensions.sideHeight,
          transform: window.innerWidth >= 1024 ? 'scale(0.85) rotateY(-5deg)' : 'scale(0.9)'
        }
      }
    ]
  }, [streamers, selectedIndex, sectionRect, featuredMatchesHeight, responsiveDimensions, layoutMounted])

  // Navegação com animações GSAP
  const nextStream = useCallback(async () => {
    if (isTransitioning || streamers.length <= 1) return

    // Feedback tátil
    if ('vibrate' in navigator) {
      navigator.vibrate(50)
    }

    setIsTransitioning(true)
    setSlideDirection('right')

    const currentStreamId = streamers[selectedIndex]?.id
    const nextIndex = (selectedIndex + 1) % streamers.length
    const nextStreamId = streamers[nextIndex]?.id

    // Animar transição com GSAP
    if (enableAdvancedAnimations && currentStreamId && nextStreamId) {
      await animateStreamTransition(currentStreamId, nextStreamId, 'right')
    }

    setTimeout(() => {
      setSelectedIndex(nextIndex)
      
      setTimeout(() => {
        setIsTransitioning(false)
        setSlideDirection(null)
      }, 100)
    }, enableAdvancedAnimations ? 200 : 50)
  }, [isTransitioning, streamers, selectedIndex, animateStreamTransition, enableAdvancedAnimations])

  const prevStream = useCallback(async () => {
    if (isTransitioning || streamers.length <= 1) return

    if ('vibrate' in navigator) {
      navigator.vibrate(50)
    }

    setIsTransitioning(true)
    setSlideDirection('left')

    const currentStreamId = streamers[selectedIndex]?.id
    const prevIndex = (selectedIndex - 1 + streamers.length) % streamers.length
    const prevStreamId = streamers[prevIndex]?.id

    if (enableAdvancedAnimations && currentStreamId && prevStreamId) {
      await animateStreamTransition(currentStreamId, prevStreamId, 'left')
    }

    setTimeout(() => {
      setSelectedIndex(prevIndex)
      
      setTimeout(() => {
        setIsTransitioning(false)
        setSlideDirection(null)
      }, 100)
    }, enableAdvancedAnimations ? 200 : 50)
  }, [isTransitioning, streamers, selectedIndex, animateStreamTransition, enableAdvancedAnimations])

  const goToStream = useCallback(async (streamerId: string) => {
    if (isTransitioning) return

    const targetIndex = streamers.findIndex(s => s.id === streamerId)
    if (targetIndex !== -1 && targetIndex !== selectedIndex) {
      if ('vibrate' in navigator) {
        navigator.vibrate(75)
      }

      setIsTransitioning(true)
      setActivePlayer('main')

      const currentStreamId = streamers[selectedIndex]?.id
      const targetStreamId = streamers[targetIndex]?.id
      const direction = targetIndex > selectedIndex ? 'right' : 'left'

      if (enableAdvancedAnimations && currentStreamId && targetStreamId) {
        await animateStreamTransition(currentStreamId, targetStreamId, direction)
      }

      setTimeout(() => {
        setSelectedIndex(targetIndex)
        
        setTimeout(() => {
          setIsTransitioning(false)
        }, 100)
      }, enableAdvancedAnimations ? 200 : 50)
    }
  }, [isTransitioning, streamers, selectedIndex, setActivePlayer, animateStreamTransition, enableAdvancedAnimations])

  // Skeleton de carregamento
  if (isLoading || !mounted || !layoutMounted) {
    return (
      <div className="relative w-full h-60 sm:h-72 md:h-80 lg:h-96 xl:h-[480px]">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-full max-w-4xl mx-auto px-4">
            <Skeleton className="w-full h-60 sm:h-72 md:h-80 lg:h-96 xl:h-[405px] rounded-xl" />
            <Skeleton className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full" />
            <Skeleton className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full" />
          </div>
        </div>
      </div>
    )
  }

  if (streamers.length === 0) {
    return null
  }

  return (
    <>
      {/* Container da seção */}
      <div 
        ref={sectionRef} 
        className={cn(
          "relative w-full transition-all duration-300",
          "h-60 sm:h-72 md:h-80 lg:h-96 xl:h-[480px]"
        )}
        tabIndex={0}
        style={{ outline: 'none' }}
      >
        {/* Overlay de transição com animação GSAP */}
        {isTransitioning && enableAdvancedAnimations && (
          <div 
            className="absolute inset-0 z-[65] flex items-center justify-center pointer-events-none"
            ref={(el) => {
              if (el) {
                gsap.fromTo(el, 
                  { opacity: 0, scale: 0.8 },
                  { 
                    opacity: 1, 
                    scale: 1, 
                    duration: 0.3,
                    ease: "power2.out"
                  }
                )
              }
            }}
          >
            <div className="relative w-20 h-20">
              <div className="relative w-full h-full bg-gradient-to-br from-background/95 via-background/90 to-background/95 backdrop-blur-lg rounded-2xl border border-border/40 shadow-2xl overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div 
                    className="w-8 h-8 border-2 border-border/20 border-t-primary rounded-full"
                    ref={(el) => {
                      if (el) {
                        gsap.to(el, {
                          rotation: 360,
                          duration: 1,
                          repeat: -1,
                          ease: "none"
                        })
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Controles de navegação */}
        <div className="relative w-full h-full flex items-center justify-center">
          {streamers.length > 1 && (
            <>
              <button
                onClick={prevStream}
                disabled={isTransitioning}
                className={cn(
                  "absolute z-[55] rounded-full transition-all duration-300 backdrop-blur-sm border border-border",
                  "left-2 sm:left-4 top-1/2 -translate-y-1/2 p-2 sm:p-3",
                  isTransitioning 
                    ? "bg-background/40 cursor-not-allowed opacity-50 scale-90" 
                    : "bg-background/60 hover:bg-background/80 hover:scale-110 active:scale-95"
                )}
              >
                <ChevronLeft className={cn(
                  "text-foreground transition-all duration-200",
                  "h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6",
                  isTransitioning && "opacity-50"
                )} />
              </button>

              <button
                onClick={nextStream}
                disabled={isTransitioning}
                className={cn(
                  "absolute z-[55] rounded-full transition-all duration-300 backdrop-blur-sm border border-border",
                  "right-2 sm:right-4 top-1/2 -translate-y-1/2 p-2 sm:p-3",
                  isTransitioning 
                    ? "bg-background/40 cursor-not-allowed opacity-50 scale-90" 
                    : "bg-background/60 hover:bg-background/80 hover:scale-110 active:scale-95"
                )}
              >
                <ChevronRight className={cn(
                  "text-foreground transition-all duration-200",
                  "h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6",
                  isTransitioning && "opacity-50"
                )} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Players GSAP */}
      {visibleStreams.map(({ streamer, position, isSelected, containerStyle }) => (
        <GSAPTwitchPlayer
          key={`gsap-${streamer.id}-${position}`}
          channel={twitchStatusService.extractUsernameFromTwitchUrl(streamer.streamUrl || '')}
          isVisible={!isTransitioning}
          isSelected={isSelected}
          position={position}
          containerStyle={containerStyle}
          onPlayerRef={registerPlayerRef}
          isPersistent={isSelected}
          enableGSAPAnimations={enableAdvancedAnimations}
          animationOptions={{
            duration,
            ease,
            enableParallax,
            enableBreathing,
            enableFloating,
            enableMorphing
          }}
        />
      ))}
    </>
  )
}