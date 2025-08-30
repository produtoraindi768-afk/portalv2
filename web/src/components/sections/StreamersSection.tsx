"use client"

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { collection, getDocs, query } from "firebase/firestore"
import { getClientFirestore } from "@/lib/safeFirestore"
import { Badge } from "@/components/ui/badge"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { useMiniplPlayerContext } from '@/components/miniplayer/MiniplPlayerProvider'
import { useHeaderHeight } from '@/contexts/HeaderHeightContext'
import { ChevronLeft, ChevronRight } from "lucide-react"
import { twitchStatusService } from "@/lib/twitch-status"
import { cn } from "@/lib/utils"
import { SectionWrapper, PageWrapper, ContentWrapper, Typography } from "@/components/layout"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { AppleStreamerInfo } from "@/components/streamers/AppleStreamerInfo"
import { StreamersSideLayout } from "@/components/streamers/StreamersSideLayout"

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

// Componente de Player Persistente que mantém o iframe sempre montado
function PersistentTwitchPlayer({
  channel,
  isVisible,
  containerStyle,
  onPlayerReady
}: {
  channel: string | null
  isVisible: boolean
  containerStyle: React.CSSProperties
  onPlayerReady?: (isReady: boolean) => void
}) {
  const [mounted, setMounted] = useState(false)
  const [iframeKey, setIframeKey] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isPlayerReady, setIsPlayerReady] = useState(false)
  const [previousChannel, setPreviousChannel] = useState<string | null>(null)
  const [preloadedChannel, setPreloadedChannel] = useState<string | null>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const preloadIframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    setMounted(true)

    // Garantir que o scroll não seja bloqueado durante o carregamento
    if (typeof window !== 'undefined') {
      document.body.style.overflowY = 'auto'
      document.documentElement.style.overflowY = 'auto'
    }
  }, [])

  // Preload system para próximo stream
  useEffect(() => {
    if (channel && mounted && channel !== preloadedChannel) {
      // Simular preload do próximo stream (não implementado completamente por limitações do Twitch embed)
      setPreloadedChannel(channel)
    }
  }, [channel, mounted, preloadedChannel])

  // Forçar remontagem do iframe quando canal muda para garantir autoplay
  useEffect(() => {
    if (channel && mounted && channel !== previousChannel) {
      // Iniciar transição
      setIsTransitioning(true)
      setIsLoading(true)
      setIsPlayerReady(false) // Reset player ready state

      // Notificar que player não está mais pronto
      onPlayerReady?.(false)

      // Fade out do player anterior (se houver)
      const startTransition = async () => {
        if (previousChannel) {
          // Pequeno delay para fade out visual
          await new Promise(resolve => setTimeout(resolve, 150))
        }

        // Atualizar o iframe
        setIframeKey(prev => prev + 1)
        setPreviousChannel(channel)

        // Aguardar um pouco para o iframe carregar (reduzido se preloadado)
        const loadDelay = preloadedChannel === channel ? 400 : 800
        setTimeout(() => {
          setIsLoading(false)
        }, loadDelay)

        // Finalizar transição
        setTimeout(() => {
          setIsTransitioning(false)
        }, loadDelay + 200)
      }
      
      startTransition()

      // Sistema de autoplay melhorado com múltiplas estratégias
      const triggerAutoplaySequence = () => {
        const triggerAutoplay = () => {
          // Estratégia 1: Eventos de interação do usuário
          const events = [
            new MouseEvent('click', { bubbles: true, cancelable: true }),
            new MouseEvent('mousedown', { bubbles: true, cancelable: true }),
            new MouseEvent('mouseup', { bubbles: true, cancelable: true }),
            new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true }), // Spacebar
            new TouchEvent('touchstart', { bubbles: true, cancelable: true })
          ]

          events.forEach(event => {
            try {
              document.dispatchEvent(event)
              if (iframeRef.current) {
                iframeRef.current.dispatchEvent(event)
                // Tentar também no contentWindow se disponível
                try {
                  iframeRef.current.contentWindow?.postMessage('{"event":"command","func":"play","args":""}', '*')
                } catch (e) {
                  // Ignore cross-origin errors
                }
              }
              // Também tentar no document body
              document.body.dispatchEvent(event)
            } catch (e) {
              // Ignore errors
            }
          })
          
          // Estratégia 2: Tentar clicar no iframe (sem focus para evitar scroll)
          if (iframeRef.current) {
            try {
              // Remover focus() para evitar scroll automático
              iframeRef.current.click()

              // Estratégia 3: Simular clique no centro do iframe
              const rect = iframeRef.current.getBoundingClientRect()
              const centerX = rect.left + rect.width / 2
              const centerY = rect.top + rect.height / 2

              const centerClickEvent = new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
                clientX: centerX,
                clientY: centerY
              })

              iframeRef.current.dispatchEvent(centerClickEvent)
            } catch (e) {
              // Ignore errors
            }
          }
        }

        // Múltiplas tentativas com delays crescentes para maximizar chances de sucesso
        triggerAutoplay()
        setTimeout(triggerAutoplay, 100)
        setTimeout(triggerAutoplay, 300)
        setTimeout(triggerAutoplay, 600)
        setTimeout(triggerAutoplay, 1000)
        setTimeout(triggerAutoplay, 1500)
        setTimeout(triggerAutoplay, 2000)
      }

      // Trigger após pequeno delay para garantir que o iframe foi montado
      setTimeout(triggerAutoplaySequence, 300)
      
      // Trigger adicional após iframe estar mais estável
      setTimeout(triggerAutoplaySequence, 800)
      
      // Trigger final para garantir
      setTimeout(triggerAutoplaySequence, 1200)
    }
  }, [channel, mounted, previousChannel, preloadedChannel])

  // URL do embed - sempre gerar se tiver canal e estiver montado
  const embedUrl = React.useMemo(() => {
    if (!channel || !mounted) {
      return null
    }

    const params = new URLSearchParams({
      channel: channel,
      autoplay: 'true',
      muted: 'false', // SOM ATIVO para player principal
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
  }, [channel, mounted])

  // Sempre montar se tiver canal
  const shouldMount = Boolean(channel && mounted)

  if (!shouldMount) return null

  const playerContent = (
    <div
      className={cn(
        "fixed z-50 transition-all duration-500 ease-in-out",
        isVisible && !isTransitioning ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        isTransitioning && "scale-95"
      )}
      style={containerStyle}
    >
      <AspectRatio ratio={16 / 9} className="w-full h-full relative">
        {/* Loading overlay do player - SÓ quando NÃO estiver em transição */}
        {isLoading && !isTransitioning && (
          <div className="absolute inset-0 z-60 bg-gradient-to-br from-background/95 via-background/90 to-background/95 backdrop-blur-md flex items-center justify-center rounded-lg border border-border/30 shadow-2xl">
            {/* Conteúdo compacto do loading do player */}
            <div className="relative z-10 flex flex-col items-center gap-4 p-6">
              {/* Spinner compacto */}
              <div className="relative">
                <div className="animate-spin rounded-full h-12 w-12 border-3 border-border/20 border-t-primary border-r-primary/60" style={{ animationDuration: '1.2s' }} />
                <div className="absolute inset-2 animate-spin rounded-full h-8 w-8 border-2 border-border/10 border-b-primary/80" style={{ animationDuration: '0.8s', animationDirection: 'reverse' }} />
                <div className="absolute inset-4 bg-primary/20 rounded-full animate-pulse" />
              </div>
              
              {/* Texto simples */}
              <div className="text-center">
                <div className="text-sm font-light text-foreground/80 animate-pulse">
                  Carregando player...
                </div>
              </div>
            </div>
          </div>
        )}
        
        {embedUrl ? (
          <iframe
            ref={iframeRef}
            key={`persistent-${channel}-${iframeKey}`} // Key que força remontagem quando canal muda
            src={embedUrl}
            className={cn(
              "w-full h-full block relative transition-all duration-700 ease-out transform-gpu",
              isVisible && !isLoading ? "opacity-100 scale-100 blur-none" : "opacity-0 scale-95 blur-sm",
              isTransitioning && "blur-md scale-98"
            )}
            frameBorder="0"
            allowFullScreen
            scrolling="no"
            title={`${channel} - Twitch Stream`}
            allow="autoplay; fullscreen; encrypted-media"
            onLoad={() => {
              // Quando iframe carrega, remover loading de forma mais suave
              setTimeout(() => {
                setIsLoading(false)
                setIsPlayerReady(true) // Marcar player como pronto
                onPlayerReady?.(true) // Notificar que player está pronto
              }, 200) // Reduzido de 300 para 200ms para resposta mais rápida

              // Trigger autoplay imediato quando iframe carrega
              const immediateAutoplay = () => {
                const events = [
                  new MouseEvent('click', { bubbles: true, cancelable: true }),
                  new MouseEvent('mousedown', { bubbles: true, cancelable: true }),
                  new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true })
                ]

                events.forEach(event => {
                  try {
                    if (iframeRef.current) {
                      iframeRef.current.dispatchEvent(event)
                      // Remover focus() para evitar scroll automático
                      iframeRef.current.click()

                      // Tentar postMessage para Twitch
                      try {
                        iframeRef.current.contentWindow?.postMessage('{"event":"command","func":"play","args":""}', '*')
                        iframeRef.current.contentWindow?.postMessage('{"event":"command","func":"setMuted","args":[false]}', '*')
                      } catch (e) {
                        // Ignore cross-origin errors
                      }
                    }
                    // Não disparar eventos globais para evitar interferência com scroll
                  } catch (e) {
                    // Ignore errors
                  }
                })
              }

              // Executar imediatamente e com delays (mais tentativas)
              immediateAutoplay()
              setTimeout(immediateAutoplay, 50)
              setTimeout(immediateAutoplay, 200)
              setTimeout(immediateAutoplay, 500)
              setTimeout(immediateAutoplay, 1000) // Tentativa adicional após 1 segundo
              setTimeout(immediateAutoplay, 2000) // Tentativa adicional após 2 segundos
            }}
          />
        ) : (
          // Placeholder quando não há embedUrl disponível
          <div className={cn(
            "w-full h-full bg-gradient-to-br from-muted/80 via-muted/60 to-background/90 flex items-center justify-center rounded-lg transition-all duration-700 ease-out border border-border/20",
            isTransitioning && "scale-95 blur-md brightness-75"
          )}>
            <div className="relative w-full h-full flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-background/50 rounded-lg" />

              <div className="absolute inset-0 flex items-center justify-center z-20">
                <svg
                  width="60"
                  height="60"
                  viewBox="0 0 60 60"
                  className="text-white drop-shadow-lg"
                >
                  <polygon
                    points="20,15 20,45 45,30"
                    fill="currentColor"
                    className="opacity-90"
                  />
                </svg>
              </div>
            </div>
          </div>
        )}
      </AspectRatio>
    </div>
  )

  return createPortal(playerContent, document.body)
}

// Componente TwitchPlayer para previews (não persistente)
function TwitchPlayerPortal({
  channel,
  isActive,
  position,
  containerStyle
}: {
  channel: string | null
  isActive: boolean
  position: 'left' | 'center' | 'right'
  containerStyle: React.CSSProperties
}) {
  const [mounted, setMounted] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  // URL idêntica ao FloatingMiniplayer
  const embedUrl = React.useMemo(() => {
    if (!channel || !mounted) {
      return null
    }

    const params = new URLSearchParams({
      channel: channel,
      autoplay: 'true',
      muted: 'true',
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
  }, [channel, mounted])

  const canPlay = Boolean(channel && mounted && isActive)

  if (!mounted || !canPlay || !embedUrl) return null

  const playerContent = (
    <div
      className="fixed z-40 pointer-events-auto"
      style={{
        ...containerStyle,
        // Garantir que o player não interfira com o scroll da página
        pointerEvents: 'auto',
        touchAction: 'none' // Evitar interferência com gestos de scroll
      }}
    >
      <AspectRatio ratio={16 / 9} className="w-full h-full">
        <iframe
          ref={iframeRef}
          key={`${channel}-${position}-${Date.now()}`}
          src={embedUrl}
          className="w-full h-full block relative opacity-100"
          frameBorder="0"
          allowFullScreen
          scrolling="no"
          title={`${channel} - Twitch Stream`}
          allow="autoplay; fullscreen; encrypted-media"
          style={{
            // Garantir que o iframe não cause scroll indesejado
            pointerEvents: 'auto',
            touchAction: 'none'
          }}
        />
      </AspectRatio>
    </div>
  )

  return createPortal(playerContent, document.body)
}

// Componente de Preview para streams não selecionadas
function StreamPreview({
  streamer,
  containerStyle,
  isVisible = true,
  onClick
}: {
  streamer: StreamerDoc
  containerStyle: React.CSSProperties
  isVisible?: boolean
  onClick?: () => void
}) {
  const [mounted, setMounted] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [isClicked, setIsClicked] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleClick = () => {
    if (onClick && !isClicked) {
      setIsClicked(true)
      // Reset click state after animation
      setTimeout(() => setIsClicked(false), 600)
      onClick()
    }
  }

  if (!mounted) return null

  const previewContent = (
    <div
      className={cn(
        "fixed z-35 transition-all duration-500 ease-out cursor-pointer group",
        isVisible ? "opacity-100 pointer-events-auto transform-gpu" : "opacity-0 pointer-events-none transform-gpu scale-90",
        isHovered && !isClicked ? "scale-105" : "scale-100",
        isClicked && "scale-110 brightness-110"
      )}
      style={{
        ...containerStyle,
        filter: isClicked ? 'brightness(1.1) saturate(1.2)' : undefined,
        // Forçar visibility para garantir que não seja cortado
        visibility: isVisible ? 'visible' : 'hidden'
      }}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={cn(
        "w-full h-full bg-gradient-to-br from-muted/80 via-muted/60 to-background/90 flex items-center justify-center rounded-lg border-2 transition-all duration-300 shadow-lg",
        "border-transparent group-hover:border-primary/60 group-hover:shadow-xl group-hover:shadow-primary/20",
        isClicked && "border-primary/80 shadow-2xl shadow-primary/40"
      )}>
        <div className="relative w-full h-full flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-background/50 rounded-lg" />

          <div className="absolute inset-0 flex items-center justify-center z-20">
            <svg
              width="60"
              height="60"
              viewBox="0 0 60 60"
              className={cn(
                "text-white drop-shadow-lg transition-all duration-300",
                isHovered && !isClicked ? "scale-110 text-primary" : "scale-100",
                isClicked && "scale-125 text-primary brightness-125"
              )}
            >
              <polygon
                points="20,15 20,45 45,30"
                fill="currentColor"
                className="opacity-90"
              />
            </svg>
          </div>
          
          {/* Overlay de hover */}
          <div className={cn(
            "absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 transition-all duration-300 rounded-lg",
            isHovered ? "opacity-100" : "opacity-0",
            isClicked && "from-primary/40 to-primary/10"
          )} />
          
          {/* Nome do streamer - REMOVIDO */}
          
        </div>
      </div>
    </div>
  )

  return createPortal(previewContent, document.body)
}

export function StreamersSection() {
  const [streamers, setStreamers] = useState<StreamerDoc[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isInView, setIsInView] = useState(false)
  const [sectionRect, setSectionRect] = useState<DOMRect | null>(null)
  const [mounted, setMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null)
  const [isMainPlayerReady, setIsMainPlayerReady] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)

  const { showMiniplayer, hideMiniplayer, isVisible: isMiniplaying, setMinimized, isMinimized, setActivePlayer, activePlayer, isMainPlayerActive } = useMiniplPlayerContext()
  const { featuredMatchesHeight, isCollapsed } = useHeaderHeight()

  // Função global para trigger de autoplay - centralizada para consistência
  const triggerGlobalAutoplay = useCallback((delay: number = 50) => {
    setTimeout(() => {
      const triggerAutoplay = () => {
        console.log('Triggering global autoplay for stream change')
        
        const mouseKeyboardEvents = [
          new MouseEvent('click', { bubbles: true, cancelable: true }),
          new MouseEvent('mousedown', { bubbles: true, cancelable: true }),
          new MouseEvent('mouseup', { bubbles: true, cancelable: true }),
          new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true }),
          new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true })
        ]
        
        // TouchEvent separado para evitar problemas de tipo
        let touchEvent: TouchEvent | null = null
        try {
          touchEvent = new TouchEvent('touchstart', { bubbles: true, cancelable: true })
        } catch (e) {
          // TouchEvent não suportado em alguns ambientes
        }
        
        [...mouseKeyboardEvents, ...(touchEvent ? [touchEvent] : [])].forEach(event => {
          try {
            // Disparar no document
            document.dispatchEvent(event)
            document.body.dispatchEvent(event)
            
            // Disparar na seção de streams
            if (sectionRef.current) {
              sectionRef.current.dispatchEvent(event)
              // Remover focus() para evitar scroll automático
              sectionRef.current.click()
            }
            
            // Tentar em todos os iframes da página (incluindo Twitch embeds)
            document.querySelectorAll('iframe').forEach(iframe => {
              try {
                iframe.dispatchEvent(event)
                // Remover focus() para evitar scroll automático
                iframe.click()

                // Estratégias específicas para Twitch
                if (iframe.src.includes('twitch.tv')) {
                  // PostMessage para comandos Twitch
                  iframe.contentWindow?.postMessage('{"event":"command","func":"play","args":""}', '*')
                  iframe.contentWindow?.postMessage('{"event":"command","func":"setMuted","args":[false]}', '*')

                  // Simular clique no centro do player
                  const rect = iframe.getBoundingClientRect()
                  const centerClickEvent = new MouseEvent('click', {
                    bubbles: true,
                    cancelable: true,
                    clientX: rect.left + rect.width / 2,
                    clientY: rect.top + rect.height / 2
                  })
                  iframe.dispatchEvent(centerClickEvent)
                }
              } catch (e) {
                // Ignore cross-origin errors
              }
            })
          } catch (e) {
            // Ignore event creation errors
          }
        })
      }
      
      // Executar múltiplas vezes com delays crescentes
      triggerAutoplay()
      setTimeout(triggerAutoplay, 100)
      setTimeout(triggerAutoplay, 300)
      setTimeout(triggerAutoplay, 600)
      setTimeout(triggerAutoplay, 1000)
    }, delay)
  }, [])

  // Callback para receber estado do player principal
  const handleMainPlayerReady = useCallback((isReady: boolean) => {
    setIsMainPlayerReady(isReady)
  }, [])

  // Garantir montagem
  useEffect(() => {
    setMounted(true)
  }, [])

  // Atualizar posição da seção
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
            console.log('Section rect updated:', rect)
            return rect
          }
          return prevRect
        })
      }
    }

    // Calcular imediatamente quando monta
    updateSectionRect()

    // Usar RAF para garantir que o layout está pronto
    const rafId = requestAnimationFrame(() => {
      updateSectionRect()
    })

    // Também tentar após um pequeno delay
    const timeoutId = setTimeout(updateSectionRect, 100)

    // Throttle para scroll e resize
    let scrollTimeout: NodeJS.Timeout
    const throttledUpdate = () => {
      clearTimeout(scrollTimeout)
      scrollTimeout = setTimeout(updateSectionRect, 16) // ~60fps
    }

    window.addEventListener('resize', throttledUpdate)
    window.addEventListener('scroll', throttledUpdate, { passive: true })

    return () => {
      cancelAnimationFrame(rafId)
      clearTimeout(timeoutId)
      clearTimeout(scrollTimeout)
      window.removeEventListener('resize', throttledUpdate)
      window.removeEventListener('scroll', throttledUpdate)
    }
  }, [mounted])

  // Também atualizar quando streamers carregarem
  useEffect(() => {
    if (streamers.length > 0 && sectionRef.current && mounted) {
      console.log('Updating section rect after streamers loaded, count:', streamers.length)

      let timeoutIds: NodeJS.Timeout[] = []

      const updateSectionRect = () => {
        const rect = sectionRef.current?.getBoundingClientRect()
        if (rect) {
          setSectionRect(prevRect => {
            // Só atualizar se realmente mudou para evitar re-renders desnecessários
            if (!prevRect ||
                Math.abs(prevRect.width - rect.width) > 1 ||
                Math.abs(prevRect.height - rect.height) > 1 ||
                Math.abs(prevRect.top - rect.top) > 1 ||
                Math.abs(prevRect.left - rect.left) > 1) {
              console.log('Section rect updated after streamers loaded:', rect)
              return rect
            }
            return prevRect
          })
        }
      }

      // Tentar várias vezes para garantir que o layout está estável
      updateSectionRect()
      timeoutIds.push(setTimeout(updateSectionRect, 50))
      timeoutIds.push(setTimeout(updateSectionRect, 200))
      timeoutIds.push(setTimeout(updateSectionRect, 500))

      return () => {
        timeoutIds.forEach(id => clearTimeout(id))
      }
    }
  }, [streamers.length, mounted]) // Usar streamers.length ao invés do array completo

  // Scroll trigger para autoplay quando seção estiver visível
  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        const isVisible = entry.isIntersecting && entry.intersectionRatio > 0.3 // Threshold mais baixo

        setIsInView(isVisible)

        if (isVisible) {
          console.log('StreamersSection in view - triggering autoplay interaction')

          // Simular interação do usuário para autoplay
          const triggerAutoplay = () => {
            const events = [
              new MouseEvent('click', { bubbles: true, cancelable: true }),
              new MouseEvent('mousedown', { bubbles: true, cancelable: true })
            ]

            events.forEach(event => {
              try {
                // Apenas disparar na seção, não globalmente para evitar interferência com scroll
                section.dispatchEvent(event)
              } catch (e) {
                // Ignore errors
              }
            })
          }

          triggerAutoplay()
          setTimeout(triggerAutoplay, 300)
        }
      },
      {
        threshold: 0.3, // Threshold mais baixo para detectar visibilidade mais cedo
        rootMargin: '0px 0px -50px 0px' // Margem menor para ativar mais cedo
      }
    )

    observer.observe(section)

    return () => observer.disconnect()
  }, [mounted]) // Adicionar mounted como dependência

  // Efeito adicional: disparar autoplay quando player fica pronto e seção já está visível
  useEffect(() => {
    if (isMainPlayerReady && isInView && sectionRef.current) {
      console.log('Player ready and section in view - triggering delayed autoplay')

      const triggerDelayedAutoplay = () => {
        const events = [
          new MouseEvent('click', { bubbles: true, cancelable: true }),
          new MouseEvent('mousedown', { bubbles: true, cancelable: true })
        ]

        events.forEach(event => {
          try {
            sectionRef.current?.dispatchEvent(event)
          } catch (e) {
            // Ignore errors
          }
        })
      }

      // Disparar com delay para garantir que o player está totalmente carregado
      setTimeout(triggerDelayedAutoplay, 500)
      setTimeout(triggerDelayedAutoplay, 1000)
    }
  }, [isMainPlayerReady, isInView]) // Disparar quando player fica pronto OU seção fica visível

  // Sistema de autoplay global - ativa com qualquer interação do usuário
  useEffect(() => {
    if (!mounted || !isMainPlayerReady) return

    const handleUserInteraction = () => {
      console.log('User interaction detected - triggering global autoplay')

      const triggerGlobalAutoplay = () => {
        // Tentar em todos os iframes Twitch da página
        document.querySelectorAll('iframe').forEach(iframe => {
          try {
            if (iframe.src.includes('twitch.tv')) {
              iframe.click()
              iframe.contentWindow?.postMessage('{"event":"command","func":"play","args":""}', '*')
              iframe.contentWindow?.postMessage('{"event":"command","func":"setMuted","args":[false]}', '*')
            }
          } catch (e) {
            // Ignore cross-origin errors
          }
        })
      }

      triggerGlobalAutoplay()

      // Remover listeners após primeira interação
      document.removeEventListener('click', handleUserInteraction)
      document.removeEventListener('keydown', handleUserInteraction)
      document.removeEventListener('touchstart', handleUserInteraction)
    }

    // Adicionar listeners para qualquer interação do usuário
    document.addEventListener('click', handleUserInteraction, { once: true, passive: true })
    document.addEventListener('keydown', handleUserInteraction, { once: true, passive: true })
    document.addEventListener('touchstart', handleUserInteraction, { once: true, passive: true })

    return () => {
      document.removeEventListener('click', handleUserInteraction)
      document.removeEventListener('keydown', handleUserInteraction)
      document.removeEventListener('touchstart', handleUserInteraction)
    }
  }, [mounted, isMainPlayerReady])

  // Carregar streamers
  useEffect(() => {
    const loadStreamers = async () => {
      const db = getClientFirestore()
      if (!db) return

      const q = query(collection(db, "streamers"))
      const snap = await getDocs(q)
      const data: StreamerDoc[] = snap.docs.map((doc) => {
        const raw = doc.data() as Record<string, unknown>
        return {
          id: doc.id,
          name: typeof raw.name === "string" ? raw.name : "",
          platform: typeof raw.platform === "string" ? raw.platform.toLowerCase() : "",
          streamUrl: typeof raw.streamUrl === "string" ? raw.streamUrl : "",
          avatarUrl: typeof raw.avatarUrl === "string" ? raw.avatarUrl : "",
          category: typeof raw.category === "string" ? raw.category : "",
          isOnline: Boolean(raw.isOnline),
          isFeatured: Boolean(raw.isFeatured),
          createdAt: typeof raw.createdAt === "string" ? raw.createdAt : undefined,
          lastStatusUpdate: typeof raw.lastStatusUpdate === "string" ? raw.lastStatusUpdate : undefined,
          viewerCount: typeof raw.viewerCount === "number" ? raw.viewerCount : Math.floor(Math.random() * 500) + 50,
          language: typeof raw.language === "string" ? raw.language : "Português",
        }
      })
      
      const onlineStreamers = data.filter(s => s.isOnline)
      const sortedStreamers = onlineStreamers.sort((a, b) => {
        if (a.isFeatured && !b.isFeatured) return -1
        if (!a.isFeatured && b.isFeatured) return 1
        return 0
      })
      
      setStreamers(sortedStreamers)
      
      const featuredIndex = sortedStreamers.findIndex(s => s.isFeatured)
      if (featuredIndex !== -1) {
        setSelectedIndex(featuredIndex)
      }
      
      // Finalizar loading
      setIsLoading(false)
    }

    loadStreamers()
  }, [])

  // Configurar player ativo
  useEffect(() => {
    setActivePlayer('main')
  }, [setActivePlayer])

  // Observer de scroll para miniplayer
  useEffect(() => {
    const section = sectionRef.current
    if (!section || streamers.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        const isInStreamersSection = entry.isIntersecting

        if (!isInStreamersSection && streamers[selectedIndex]) {
          // Usuário saiu da seção de streams (scroll down) - ativar miniplayer EXPANDIDO
          console.log('User scrolled down - activating miniplayer expanded')
          const currentStreamer = streamers[selectedIndex]
          const streamerForMiniplayer = {
            id: currentStreamer.id,
            name: currentStreamer.name || '',
            platform: currentStreamer.platform || '',
            streamUrl: currentStreamer.streamUrl || '',
            avatarUrl: currentStreamer.avatarUrl || '',
            category: currentStreamer.category || '',
            isOnline: Boolean(currentStreamer.isOnline),
            isFeatured: Boolean(currentStreamer.isFeatured),
            twitchChannel: currentStreamer.platform === 'twitch' && currentStreamer.streamUrl
              ? twitchStatusService.extractUsernameFromTwitchUrl(currentStreamer.streamUrl) || undefined
              : undefined,
            createdAt: currentStreamer.createdAt || '',
            lastStatusUpdate: currentStreamer.lastStatusUpdate || ''
          }

          showMiniplayer(streamerForMiniplayer)
          // Mostrar o miniplayer expandido no canto inferior direito (false = automático)
          // Só expandir automaticamente se não houver preferência manual do usuário
          setMinimized(false, false)
        } else if (isInStreamersSection && isMiniplaying) {
          // Usuário voltou para a seção de streams (scroll up) - minimizar miniplayer e reativar player principal
          console.log('User scrolled up to streams section - minimizing miniplayer and activating main player')
          // Minimizar miniplayer quando volta para a seção (false = automático)
          // Só minimizar automaticamente se não houver preferência manual do usuário
          setMinimized(true, false)
          setActivePlayer('main') // Garantir que player principal seja ativo

          // Trigger autoplay quando usuário volta para a seção
          setTimeout(() => {
            const triggerReturnAutoplay = () => {
              const events = [
                new MouseEvent('click', { bubbles: true, cancelable: true }),
                new MouseEvent('mousedown', { bubbles: true, cancelable: true })
              ]

              events.forEach(event => {
                try {
                  if (sectionRef.current) {
                    sectionRef.current.dispatchEvent(event)
                  }
                  // Tentar em todos os iframes da página
                  document.querySelectorAll('iframe').forEach(iframe => {
                    try {
                      if (iframe.src.includes('twitch.tv')) {
                        iframe.dispatchEvent(event)
                        iframe.click()
                        iframe.contentWindow?.postMessage('{"event":"command","func":"play","args":""}', '*')
                        iframe.contentWindow?.postMessage('{"event":"command","func":"setMuted","args":[false]}', '*')
                      }
                    } catch (e) {
                      // Ignore cross-origin errors
                    }
                  })
                } catch (e) {
                  // Ignore errors
                }
              })
            }

            triggerReturnAutoplay()
            setTimeout(triggerReturnAutoplay, 500)
          }, 300)
        }
      },
      { threshold: 0.3, rootMargin: '-100px 0px' }
    )

    observer.observe(section)
    return () => observer.disconnect()
  }, [streamers, selectedIndex, setMinimized, isMiniplaying, isMinimized, showMiniplayer, hideMiniplayer, setActivePlayer])

  // Atualizar miniplayer quando seleção mudar
  useEffect(() => {
    if (isMiniplaying && streamers[selectedIndex]) {
      const currentStreamer = streamers[selectedIndex]
      const streamerForMiniplayer = {
        id: currentStreamer.id,
        name: currentStreamer.name || '',
        platform: currentStreamer.platform || '',
        streamUrl: currentStreamer.streamUrl || '',
        avatarUrl: currentStreamer.avatarUrl || '',
        category: currentStreamer.category || '',
        isOnline: Boolean(currentStreamer.isOnline),
        isFeatured: Boolean(currentStreamer.isFeatured),
        twitchChannel: currentStreamer.platform === 'twitch' && currentStreamer.streamUrl
          ? twitchStatusService.extractUsernameFromTwitchUrl(currentStreamer.streamUrl) || undefined
          : undefined,
        createdAt: currentStreamer.createdAt || '',
        lastStatusUpdate: currentStreamer.lastStatusUpdate || ''
      }
      
      showMiniplayer(streamerForMiniplayer)
    }
  }, [selectedIndex, streamers, showMiniplayer, isMiniplaying])

  // Simular interação do usuário sempre que selectedIndex mudar para garantir autoplay
  useEffect(() => {
    // Reset do estado do player principal quando selectedIndex muda
    setIsMainPlayerReady(false)

    if (streamers.length > 0 && mounted) {
      console.log('Stream selection changed - triggering autoplay interaction for selectedIndex:', selectedIndex)

      // Usar a função global de autoplay
      triggerGlobalAutoplay(100)

      // Trigger adicional após um tempo para garantir
      triggerGlobalAutoplay(500)
    }
  }, [selectedIndex, streamers, mounted, triggerGlobalAutoplay])

  // Calcular streams visíveis e suas posições com responsividade (memoizado para evitar recriações)
  const visibleStreams = React.useMemo(() => {
    // Calcular offset dinâmico: só adicionar altura quando expandido
    const dynamicOffset = isCollapsed ? 0 : featuredMatchesHeight

    if (streamers.length === 0) {
      return []
    }

    // Sistema responsivo: calcular dimensões baseado no viewport
    const getResponsiveDimensions = () => {
      const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1200
      
      // Mobile (< 640px): Layout vertical compacto
      if (viewportWidth < 640) {
        return {
          centerWidth: Math.min(viewportWidth - 32, 360), // Margem 16px cada lado
          centerHeight: Math.min((viewportWidth - 32) * 9 / 16, 203), // Aspect ratio 16:9
          sideWidth: Math.min(viewportWidth - 64, 280),
          sideHeight: Math.min((viewportWidth - 64) * 9 / 16, 158),
          sideOffset: 80, // Reduzido para mobile
          verticalSpacing: 120
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
          verticalSpacing: 150
        }
      }
      // Desktop (>= 1024px): Layout original
      else {
        return {
          centerWidth: 720,
          centerHeight: 405,
          sideWidth: 600,
          sideHeight: 338,
          sideOffset: 300,
          verticalSpacing: 200
        }
      }
    }

    const dimensions = getResponsiveDimensions()
    
    // Fallback se sectionRect não estiver disponível
    if (!sectionRect) {
      console.log('No sectionRect available, using fallback positioning')
      const fallbackRect = {
        left: 0,
        top: 0,
        width: typeof window !== 'undefined' ? window.innerWidth : 1200,
        height: typeof window !== 'undefined' && window.innerWidth < 640 ? 240 : 
               typeof window !== 'undefined' && window.innerWidth < 1024 ? 320 : 480
      }
      
      if (streamers.length === 1) {
        return [{ 
          streamer: streamers[0], 
          position: 'center' as const, 
          isSelected: true,
          containerStyle: {
            left: Math.max(0, fallbackRect.width / 2 - dimensions.centerWidth / 2),
            top: Math.max(0, 100), // Top responsivo
            width: dimensions.centerWidth,
            height: dimensions.centerHeight
          }
        }]
      }
      
      if (streamers.length >= 2) {
        const centerX = fallbackRect.width / 2
        const centerY = fallbackRect.height / 2
        const leftIndex = (selectedIndex - 1 + streamers.length) % streamers.length
        const rightIndex = (selectedIndex + 1) % streamers.length

        // Corrigir cálculo de posição da direita no fallback também
        const leftPosition = Math.max(16, centerX - dimensions.centerWidth / 2 - dimensions.sideOffset)
        const rightBasePosition = centerX + dimensions.centerWidth / 2 + dimensions.sideOffset - dimensions.sideWidth
        const rightPosition = Math.max(16, Math.min(fallbackRect.width - dimensions.sideWidth - 16, rightBasePosition))

        return [
          {
            streamer: streamers[leftIndex],
            position: 'left' as const,
            isSelected: false,
            containerStyle: {
              left: leftPosition,
              top: centerY - dimensions.sideHeight / 2 + 100,
              width: dimensions.sideWidth,
              height: dimensions.sideHeight,
              transform: window.innerWidth >= 1024 ? 'scale(0.85) rotateY(5deg)' : 'scale(0.9)'
            }
          },
          {
            streamer: streamers[selectedIndex],
            position: 'center' as const,
            isSelected: true,
            containerStyle: {
              left: Math.max(0, centerX - dimensions.centerWidth / 2),
              top: centerY - dimensions.centerHeight / 2 + 100,
              width: dimensions.centerWidth,
              height: dimensions.centerHeight
            }
          },
          {
            streamer: streamers[rightIndex],
            position: 'right' as const,
            isSelected: false,
            containerStyle: {
              left: rightPosition,
              top: centerY - dimensions.sideHeight / 2 + 100,
              width: dimensions.sideWidth,
              height: dimensions.sideHeight,
              transform: window.innerWidth >= 1024 ? 'scale(0.85) rotateY(-5deg)' : 'scale(0.9)'
            }
          }
        ]
      }
      
      return []
    }
    
    if (streamers.length === 1) {
      return [{ 
        streamer: streamers[0], 
        position: 'center' as const, 
        isSelected: true,
        containerStyle: {
          left: Math.max(0, sectionRect.left + sectionRect.width / 2 - dimensions.centerWidth / 2),
          top: sectionRect.top + sectionRect.height / 2 - dimensions.centerHeight / 2 + dynamicOffset,
          width: dimensions.centerWidth,
          height: dimensions.centerHeight
        }
      }]
    }
    
    if (streamers.length === 2) {
      const centerX = sectionRect.left + sectionRect.width / 2
      const centerY = sectionRect.top + sectionRect.height / 2 + dynamicOffset
      
      // Calcular posições para 2 streams de forma consistente
      const leftPosition = Math.max(16, centerX - dimensions.centerWidth / 2 - dimensions.sideOffset)
      const rightBasePosition = centerX + dimensions.centerWidth / 2 + dimensions.sideOffset - dimensions.sideWidth
      const rightPosition = Math.max(16, Math.min(window.innerWidth - dimensions.sideWidth - 16, rightBasePosition))
      
      return [
        {
          streamer: streamers[0],
          position: selectedIndex === 0 ? 'center' as const : 'left' as const,
          isSelected: selectedIndex === 0,
          containerStyle: selectedIndex === 0 ? {
            left: Math.max(0, centerX - dimensions.centerWidth / 2),
            top: centerY - dimensions.centerHeight / 2,
            width: dimensions.centerWidth,
            height: dimensions.centerHeight
          } : {
            left: leftPosition,
            top: centerY - dimensions.sideHeight / 2,
            width: dimensions.sideWidth,
            height: dimensions.sideHeight,
            transform: window.innerWidth >= 1024 ? 'scale(0.85) rotateY(5deg)' : 'scale(0.9)'
          }
        },
        {
          streamer: streamers[1],
          position: selectedIndex === 1 ? 'center' as const : 'right' as const,
          isSelected: selectedIndex === 1,
          containerStyle: selectedIndex === 1 ? {
            left: Math.max(0, centerX - dimensions.centerWidth / 2),
            top: centerY - dimensions.centerHeight / 2,
            width: dimensions.centerWidth,
            height: dimensions.centerHeight
          } : {
            left: rightPosition,
            top: centerY - dimensions.sideHeight / 2,
            width: dimensions.sideWidth,
            height: dimensions.sideHeight,
            transform: window.innerWidth >= 1024 ? 'scale(0.85) rotateY(-5deg)' : 'scale(0.9)'
          }
        }
      ]
    }

    // Para 3+ streams
    const centerX = sectionRect.left + sectionRect.width / 2
    const centerY = sectionRect.top + sectionRect.height / 2 + dynamicOffset
    const leftIndex = (selectedIndex - 1 + streamers.length) % streamers.length
    const rightIndex = (selectedIndex + 1) % streamers.length

    // Calcular posições garantindo que fiquem visíveis na viewport
    const viewportWidth = window.innerWidth
    const leftPosition = Math.max(16, centerX - dimensions.centerWidth / 2 - dimensions.sideOffset)
    
    // CORRIGIDO: Calcular posição da direita sem usar Math.min que estava limitando incorretamente
    const rightBasePosition = centerX + dimensions.centerWidth / 2 + dimensions.sideOffset - dimensions.sideWidth
    const rightPosition = Math.max(16, Math.min(viewportWidth - dimensions.sideWidth - 16, rightBasePosition))

    return [
      {
        streamer: streamers[leftIndex],
        position: 'left' as const,
        isSelected: false,
        containerStyle: {
          left: leftPosition,
          top: centerY - dimensions.sideHeight / 2,
          width: dimensions.sideWidth,
          height: dimensions.sideHeight,
          transform: window.innerWidth >= 1024 ? 'scale(0.85) rotateY(5deg)' : 'scale(0.9)'
        }
      },
      {
        streamer: streamers[selectedIndex],
        position: 'center' as const,
        isSelected: true,
        containerStyle: {
          left: Math.max(0, centerX - dimensions.centerWidth / 2),
          top: centerY - dimensions.centerHeight / 2,
          width: dimensions.centerWidth,
          height: dimensions.centerHeight
        }
      },
      {
        streamer: streamers[rightIndex],
        position: 'right' as const,
        isSelected: false,
        containerStyle: {
          left: rightPosition,
          top: centerY - dimensions.sideHeight / 2,
          width: dimensions.sideWidth,
          height: dimensions.sideHeight,
          transform: window.innerWidth >= 1024 ? 'scale(0.85) rotateY(-5deg)' : 'scale(0.9)'
        }
      }
    ]
  }, [streamers, selectedIndex, sectionRect, featuredMatchesHeight, isCollapsed])

  // Calcular visibilidade do player principal
  // Player principal é visível quando é o player ativo OU quando miniplayer está minimizado
  const isMainPlayerVisible = activePlayer === 'main' || (isMiniplaying && isMinimized)

  // Previews devem ser visíveis sempre que não estiver em transição e houver múltiplos streams
  const shouldShowPreviews = !isTransitioning && streamers.length > 1

  // Debug: verificar se visibleStreams está sendo calculado
  useEffect(() => {
    console.log('=== DEBUG STREAMERS SECTION ===')
    console.log('visibleStreams:', visibleStreams.length, 'streamers total:', streamers.length, 'selectedIndex:', selectedIndex)
    console.log('sectionRect:', sectionRect)
    console.log('shouldShowPreviews:', shouldShowPreviews)
    console.log('viewport width:', typeof window !== 'undefined' ? window.innerWidth : 'N/A')
    
    visibleStreams.forEach((stream, index) => {
      const rightEdge = (stream.containerStyle.left || 0) + (stream.containerStyle.width || 0)
      console.log(`Stream ${index} [${stream.position.toUpperCase()}]:`, {
        name: stream.streamer.name,
        isSelected: stream.isSelected,
        left: Math.round(stream.containerStyle.left || 0),
        width: Math.round(stream.containerStyle.width || 0),
        rightEdge: Math.round(rightEdge),
        isVisible: rightEdge > 0 && (stream.containerStyle.left || 0) < (typeof window !== 'undefined' ? window.innerWidth : 1200)
      })
    })
    console.log('===============================')
  }, [visibleStreams, streamers.length, selectedIndex, sectionRect, shouldShowPreviews])

  const nextStream = () => {
    // Prevenir cliques rápidos durante transição
    if (isTransitioning) return
    
    // Feedback tátil para dispositivos móveis
    if ('vibrate' in navigator) {
      navigator.vibrate(50)
    }
    
    setIsTransitioning(true)
    setSlideDirection('right') // Indica movimento para a direita
    
    // Adicionar pequeno delay para feedback visual
    setTimeout(() => {
      setSelectedIndex((prev) => (prev + 1) % streamers.length)
      
      // Sistema de autoplay melhorado para navegação
      setTimeout(() => {
        const triggerAutoplay = () => {
          const events = [
            new MouseEvent('click', { bubbles: true, cancelable: true }),
            new MouseEvent('mousedown', { bubbles: true, cancelable: true }),
            new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true }),
            new TouchEvent('touchstart', { bubbles: true, cancelable: true })
          ]
          
          events.forEach(event => {
            try {
              // Não disparar eventos globais para evitar interferência com scroll
              if (sectionRef.current) {
                sectionRef.current.dispatchEvent(event)
                // Remover focus() para evitar scroll automático
                sectionRef.current.click()
              }
              // Tentar em todos os iframes da página
              document.querySelectorAll('iframe').forEach(iframe => {
                try {
                  iframe.dispatchEvent(event)
                  // Remover focus() para evitar scroll automático
                  iframe.click()
                  // Tentar postMessage para Twitch
                  iframe.contentWindow?.postMessage('{"event":"command","func":"play","args":""}', '*')
                } catch (e) {
                  // Ignore cross-origin errors
                }
              })
            } catch (e) {
              // Ignore errors
            }
          })
        }
        
        // Múltiplas tentativas para garantir autoplay
        triggerAutoplay()
        setTimeout(triggerAutoplay, 100)
        setTimeout(triggerAutoplay, 300)
        setTimeout(triggerAutoplay, 600)
      }, 50)
      
      // Reset transition state
      setTimeout(() => {
        setIsTransitioning(false)
        setSlideDirection(null)
      }, 1200)
    }, 100)
  }

  const prevStream = () => {
    // Prevenir cliques rápidos durante transição
    if (isTransitioning) return
    
    // Feedback tátil para dispositivos móveis
    if ('vibrate' in navigator) {
      navigator.vibrate(50)
    }
    
    setIsTransitioning(true)
    setSlideDirection('left') // Indica movimento para a esquerda
    
    // Adicionar pequeno delay para feedback visual
    setTimeout(() => {
      setSelectedIndex((prev) => (prev - 1 + streamers.length) % streamers.length)
      
      // Sistema de autoplay melhorado para navegação
      setTimeout(() => {
        const triggerAutoplay = () => {
          const events = [
            new MouseEvent('click', { bubbles: true, cancelable: true }),
            new MouseEvent('mousedown', { bubbles: true, cancelable: true }),
            new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true }),
            new TouchEvent('touchstart', { bubbles: true, cancelable: true })
          ]
          
          events.forEach(event => {
            try {
              // Não disparar eventos globais para evitar interferência com scroll
              if (sectionRef.current) {
                sectionRef.current.dispatchEvent(event)
                // Remover focus() para evitar scroll automático
                sectionRef.current.click()
              }
              // Tentar em todos os iframes da página
              document.querySelectorAll('iframe').forEach(iframe => {
                try {
                  iframe.dispatchEvent(event)
                  // Remover focus() para evitar scroll automático
                  iframe.click()
                  // Tentar postMessage para Twitch
                  iframe.contentWindow?.postMessage('{"event":"command","func":"play","args":""}', '*')
                } catch (e) {
                  // Ignore cross-origin errors
                }
              })
            } catch (e) {
              // Ignore errors
            }
          })
        }
        
        // Múltiplas tentativas para garantir autoplay
        triggerAutoplay()
        setTimeout(triggerAutoplay, 100)
        setTimeout(triggerAutoplay, 300)
        setTimeout(triggerAutoplay, 600)
      }, 50)
      
      // Reset transition state
      setTimeout(() => {
        setIsTransitioning(false)
        setSlideDirection(null)
      }, 1200)
    }, 100)
  }

  const goToStream = (streamerId: string) => {
    // Prevenir cliques rápidos durante transição
    if (isTransitioning) return
    
    const targetIndex = streamers.findIndex(s => s.id === streamerId)
    if (targetIndex !== -1 && targetIndex !== selectedIndex) {
      console.log('Going to stream:', streamerId, 'index:', targetIndex)
      
      // Feedback tátil para dispositivos móveis
      if ('vibrate' in navigator) {
        navigator.vibrate(75) // Vibração um pouco mais longa para seleção direta
      }
      
      setIsTransitioning(true)
      
      // Garantir que o player principal seja ativo
      setActivePlayer('main')
      
      // Se miniplayer estiver ativo, minimizá-lo para dar foco ao player principal
      if (isMiniplaying) {
        setMinimized(true, false) // false = automático (não é ação manual)
      }
      
      // Adicionar pequeno delay para feedback visual
      setTimeout(() => {
        setSelectedIndex(targetIndex)
        
        // Trigger autoplay IMEDIATO e agressivo para preview clicado
        const immediateAutoplay = () => {
          console.log('Immediate autoplay triggered for clicked preview')
          
          // Estratégia 1: Eventos de interação massivos
          const events = [
            new MouseEvent('click', { bubbles: true, cancelable: true }),
            new MouseEvent('mousedown', { bubbles: true, cancelable: true }),
            new MouseEvent('mouseup', { bubbles: true, cancelable: true }),
            new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true }),
            new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true })
          ]
          
          // TouchEvent separado
          try {
            events.push(new TouchEvent('touchstart', { bubbles: true, cancelable: true }) as any)
          } catch (e) {
            // TouchEvent não suportado
          }
          
          events.forEach(event => {
            try {
              // Não disparar eventos globais para evitar interferência com scroll
              if (sectionRef.current) {
                sectionRef.current.dispatchEvent(event)
                // Remover focus() para evitar scroll automático
                sectionRef.current.click()
              }
            } catch (e) {
              // Ignore errors
            }
          })
          
          // Estratégia 2: Interagir com todos os iframes Twitch (sem focus)
          document.querySelectorAll('iframe').forEach(iframe => {
            try {
              if (iframe.src.includes('twitch.tv')) {
                // Remover focus() para evitar scroll automático
                iframe.click()
                
                // Múltiplos comandos Twitch
                const twitchCommands = [
                  '{"event":"command","func":"play","args":""}',
                  '{"event":"command","func":"setMuted","args":[false]}',
                  '{"event":"command","func":"setVolume","args":[0.8]}',
                  '{"event":"listening"}',
                  '{"event":"ready"}'
                ]
                
                twitchCommands.forEach(cmd => {
                  try {
                    iframe.contentWindow?.postMessage(cmd, '*')
                  } catch (e) {
                    // Ignore cross-origin errors
                  }
                })
                
                // Clique no centro do player
                const rect = iframe.getBoundingClientRect()
                if (rect.width > 0 && rect.height > 0) {
                  const centerClickEvent = new MouseEvent('click', {
                    bubbles: true,
                    cancelable: true,
                    clientX: rect.left + rect.width / 2,
                    clientY: rect.top + rect.height / 2,
                    button: 0
                  })
                  iframe.dispatchEvent(centerClickEvent)
                  
                  // Também tentar mousedown/mouseup no centro
                  const centerMouseDown = new MouseEvent('mousedown', {
                    bubbles: true,
                    cancelable: true,
                    clientX: rect.left + rect.width / 2,
                    clientY: rect.top + rect.height / 2,
                    button: 0
                  })
                  iframe.dispatchEvent(centerMouseDown)
                  
                  setTimeout(() => {
                    const centerMouseUp = new MouseEvent('mouseup', {
                      bubbles: true,
                      cancelable: true,
                      clientX: rect.left + rect.width / 2,
                      clientY: rect.top + rect.height / 2,
                      button: 0
                    })
                    iframe.dispatchEvent(centerMouseUp)
                  }, 10)
                }
              }
            } catch (e) {
              // Ignore errors
            }
          })
        }
        
        // Executar autoplay imediatamente
        immediateAutoplay()
        
        // Múltiplas tentativas com delays curtos para preview clicado
        setTimeout(immediateAutoplay, 50)
        setTimeout(immediateAutoplay, 150)
        setTimeout(immediateAutoplay, 300)
        setTimeout(immediateAutoplay, 500)
        setTimeout(immediateAutoplay, 800)
        
        // Reset transition state
        setTimeout(() => {
          setIsTransitioning(false)
        }, 1200)
      }, 50) // Delay menor para preview clicado
    }
  }

  // Skeleton enquanto carrega streamers
  if (isLoading) {
    return (
      <div 
        className={cn(
          "relative w-full transition-all duration-300",
          "h-60 sm:h-72 md:h-80 lg:h-96 xl:h-[480px]"
        )}
      >
        {/* Skeleton do player principal */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-full max-w-4xl mx-auto px-4">
            <Skeleton className="w-full h-60 sm:h-72 md:h-80 lg:h-96 xl:h-[405px] rounded-xl" />
            
            {/* Skeleton dos controles de navegação */}
            <Skeleton className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full" />
            <Skeleton className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full" />
          </div>
        </div>
        
        {/* Skeleton dos previews laterais */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2">
          <Skeleton className="w-24 h-14 sm:w-32 sm:h-18 md:w-40 md:h-24 rounded-lg opacity-60" />
        </div>
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          <Skeleton className="w-24 h-14 sm:w-32 sm:h-18 md:w-40 md:h-24 rounded-lg opacity-60" />
        </div>
        
        {/* Skeleton de informações do streamer */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <Skeleton className="w-8 h-8 rounded-full" />
          <Skeleton className="w-32 h-4 rounded" />
          <Skeleton className="w-20 h-3 rounded" />
        </div>
      </div>
    )
  }
  
  // Se não há streamers após carregar, não mostrar nada
  if (streamers.length === 0) {
    return null
  }



  return (
    <>
      {/* 
        HIERARQUIA DE Z-INDEX OTIMIZADA (do menor para o maior):
        - z-35: Previews dos streams não selecionados
        - z-50: Player principal (PersistentTwitchPlayer) - PRIORIDADE MÁXIMA
        - z-55: Controles de navegação (setas) - PRINCIPAIS, sempre acessíveis
        - z-60: Loading overlay do player (SÓ quando NÃO em transição)
        - z-65: Box de transição quadrado - Único overlay durante transição
        
        CONFLITOS RESOLVIDOS:
        - Removida borda azul (ring) durante transição
        - Loading overlay só aparece quando NÃO está em transição
        - Box de transição é o único overlay ativo durante navegação
      */}
      
      {/* Seção container com altura responsiva - SEM bordas de transição */}
      <div 
        ref={sectionRef} 
        className={cn(
          // Altura responsiva baseada no conteúdo e breakpoints
          "relative w-full transition-all duration-300",
          // Mobile: altura compacta
          "h-60 sm:h-72 md:h-80 lg:h-96 xl:h-[480px]",
          // IMPORTANTE: Sem overflow-hidden para permitir previews fora do container
          // REMOVIDO: ring de transição para eliminar borda azul
        )}
        tabIndex={0}
        style={{ outline: 'none' }}
      >
        {/* Overlay global de transição - UNIFICADO */}
        <div className={cn(
          "absolute inset-0 transition-all duration-400 ease-out pointer-events-none",
          isTransitioning && "bg-background/5 backdrop-blur-[0.5px]"
        )} />
        
        {/* Box de transição quadrado centralizado - Único overlay ativo */}
        {isTransitioning && (
          <div className="absolute inset-0 z-[65] flex items-center justify-center pointer-events-none">
            <div className={cn(
              "relative w-20 h-20 transform transition-all duration-400 ease-out",
              "animate-floating scale-100 opacity-100"
            )}>
              {/* Container principal do box */}
              <div className="relative w-full h-full bg-gradient-to-br from-background/95 via-background/90 to-background/95 backdrop-blur-lg rounded-2xl border border-border/40 shadow-2xl overflow-hidden">
                
                {/* Efeito de brilho animado no fundo */}
                <div className="absolute inset-0 opacity-30">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/15 to-transparent animate-shimmer" />
                </div>
                
                {/* Spinner principal */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative">
                    {/* Anel externo */}
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-border/20 border-t-primary border-r-primary/60" style={{ animationDuration: '1.2s' }} />
                    {/* Anel interno */}
                    <div className="absolute inset-1 animate-spin rounded-full h-6 w-6 border-2 border-border/10 border-b-primary/80" style={{ animationDuration: '0.8s', animationDirection: 'reverse' }} />
                    {/* Centro pulsante */}
                    <div className="absolute inset-3 bg-primary/30 rounded-full animate-pulse" />
                  </div>
                </div>
                
                {/* Indicador de progresso no canto */}
                <div className="absolute bottom-1 left-1 right-1">
                  <div className="h-0.5 bg-border/30 rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full animate-loading-progress" />
                  </div>
                </div>
                
                {/* Efeito de partículas nos cantos */}
                <div className="absolute top-1 right-1 w-1 h-1 bg-primary/60 rounded-full animate-ping" style={{ animationDelay: '0s' }} />
                <div className="absolute bottom-1 left-1 w-1 h-1 bg-primary/40 rounded-full animate-ping" style={{ animationDelay: '0.5s' }} />
              </div>
              
              {/* Glow effect externo */}
              <div className="absolute inset-0 rounded-2xl bg-primary/5 blur-md scale-110 animate-pulse-soft" />
            </div>
          </div>
        )}
        
        {/* Indicador de stream ativo - REMOVIDO */}

        {/* Controles de navegação responsivos */}
        <div className="relative w-full h-full flex items-center justify-center">
          {streamers.length > 1 && (
            <>
              <button
                onClick={prevStream}
                disabled={isTransitioning}
                className={cn(
                  // Posição responsiva: mais centralizado em mobile
                  "absolute z-[55] rounded-full transition-all duration-300 backdrop-blur-sm border border-border",
                  "left-2 sm:left-4 top-1/2 -translate-y-1/2",
                  // Tamanho responsivo: menor em mobile
                  "p-2 sm:p-3",
                  isTransitioning 
                    ? "bg-background/40 cursor-not-allowed opacity-50 scale-90" 
                    : "bg-background/60 hover:bg-background/80 hover:scale-110 active:scale-95"
                )}
              >
                <ChevronLeft className={cn(
                  // Ícone responsivo: menor em mobile
                  "text-foreground transition-all duration-200",
                  "h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6",
                  isTransitioning && "opacity-50"
                )} />
              </button>

              <button
                onClick={nextStream}
                disabled={isTransitioning}
                className={cn(
                  // Posição responsiva: mais centralizado em mobile
                  "absolute z-[55] rounded-full transition-all duration-300 backdrop-blur-sm border border-border",
                  "right-2 sm:right-4 top-1/2 -translate-y-1/2",
                  // Tamanho responsivo: menor em mobile
                  "p-2 sm:p-3",
                  isTransitioning 
                    ? "bg-background/40 cursor-not-allowed opacity-50 scale-90" 
                    : "bg-background/60 hover:bg-background/80 hover:scale-110 active:scale-95"
                )}
              >
                <ChevronRight className={cn(
                  // Ícone responsivo: menor em mobile
                  "text-foreground transition-all duration-200",
                  "h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6",
                  isTransitioning && "opacity-50"
                )} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Player principal persistente para o streamer selecionado */}
      {streamers[selectedIndex] && mounted && (
        <PersistentTwitchPlayer
          channel={twitchStatusService.extractUsernameFromTwitchUrl(streamers[selectedIndex].streamUrl || '')}
          isVisible={isMainPlayerVisible} // Visível quando é o player ativo OU quando miniplayer está minimizado
          onPlayerReady={handleMainPlayerReady}
          containerStyle={{
            ...visibleStreams.find(s => s.isSelected)?.containerStyle || {
              left: 0,
              top: 0,
              width: 720,
              height: 405
            },
            // Adicionar efeito de slide baseado na direção
            transform: `${visibleStreams.find(s => s.isSelected)?.containerStyle?.transform || ''} ${
              isTransitioning && slideDirection
                ? slideDirection === 'right'
                  ? 'translateX(20px)'
                  : 'translateX(-20px)'
                : ''
            }`.trim(),
            // Garantir que não interfira com o scroll da página
            pointerEvents: isMainPlayerVisible ? 'auto' : 'none',
            // CORRIGIDO: Z-index mais alto que os previews para prioridade visual MÁXIMA
            zIndex: 50
          }}
        />
      )}

      {/* Previews para streams não selecionadas */}
      {visibleStreams.map(({ streamer, position, isSelected, containerStyle }) => (
        <React.Fragment key={`${streamer.id}-${position}`}>
          {!isSelected && (
            <StreamPreview
              streamer={streamer}
              containerStyle={containerStyle}
              isVisible={shouldShowPreviews}
              onClick={() => goToStream(streamer.id)}
            />
          )}
        </React.Fragment>
      ))}

      {/* Layout em colunas para múltiplos streamers */}
      <StreamersSideLayout
        streamers={streamers}
        selectedIndex={selectedIndex}
        isTransitioning={isTransitioning}
      />

      {/* Apple-style Streamer Info Card centralizado apenas para streamer único */}
      {streamers.length === 1 && streamers[selectedIndex] && !isTransitioning && (
        <AppleStreamerInfo 
          streamer={streamers[selectedIndex]}
          position="center"
          className="transform transition-all duration-500 ease-out"
        />
      )}
    </>
  )
}


