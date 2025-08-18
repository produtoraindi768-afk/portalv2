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
          
          // Estratégia 2: Tentar focar e clicar no iframe
          if (iframeRef.current) {
            try {
              iframeRef.current.focus()
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

  // Sempre montar se tiver canal
  const shouldMount = Boolean(channel && mounted)

  if (!shouldMount) return null

  const playerContent = (
    <div
      className={cn(
        "fixed z-40 transition-all duration-500 ease-in-out",
        isVisible && !isTransitioning ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        isTransitioning && "scale-95"
      )}
      style={containerStyle}
    >
      <AspectRatio ratio={16 / 9} className="w-full h-full relative">
        {/* Loading overlay durante transição */}
        {isLoading && (
          <div className="absolute inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center rounded-lg">
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="text-sm text-muted-foreground animate-pulse">Carregando stream...</span>
            </div>
          </div>
        )}
        
        {embedUrl ? (
          <iframe
            ref={iframeRef}
            key={`persistent-${channel}-${iframeKey}`} // Key que força remontagem quando canal muda
            src={embedUrl}
            className={cn(
              "w-full h-full block relative transition-all duration-500 ease-in-out",
              isVisible && !isLoading ? "opacity-100 scale-100" : "opacity-0 scale-95",
              isTransitioning && "blur-sm"
            )}
            frameBorder="0"
            allowFullScreen
            scrolling="no"
            title={`${channel} - Twitch Stream`}
            allow="autoplay; fullscreen; encrypted-media"
            onLoad={() => {
              // Quando iframe carrega, remover loading mais rapidamente
              setTimeout(() => {
                setIsLoading(false)
                setIsPlayerReady(true) // Marcar player como pronto
                onPlayerReady?.(true) // Notificar que player está pronto
              }, 300)

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
                      iframeRef.current.focus()
                      iframeRef.current.click()

                      // Tentar postMessage para Twitch
                      try {
                        iframeRef.current.contentWindow?.postMessage('{"event":"command","func":"play","args":""}', '*')
                      } catch (e) {
                        // Ignore cross-origin errors
                      }
                    }
                    document.dispatchEvent(event)
                  } catch (e) {
                    // Ignore errors
                  }
                })
              }

              // Executar imediatamente e com delays
              immediateAutoplay()
              setTimeout(immediateAutoplay, 50)
              setTimeout(immediateAutoplay, 200)
              setTimeout(immediateAutoplay, 500)
            }}
          />
        ) : (
          // Placeholder quando não há embedUrl disponível
          <div className={cn(
            "w-full h-full bg-gradient-to-br from-muted/80 via-muted/60 to-background/90 flex items-center justify-center rounded-lg transition-all duration-500",
            isTransitioning && "scale-95 blur-sm"
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
      style={containerStyle}
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
        "fixed z-30 transition-all duration-500 ease-out cursor-pointer group",
        isVisible ? "opacity-100 pointer-events-auto transform-gpu" : "opacity-0 pointer-events-none transform-gpu scale-90",
        isHovered && !isClicked ? "scale-105" : "scale-100",
        isClicked && "scale-110 brightness-110"
      )}
      style={{
        ...containerStyle,
        filter: isClicked ? 'brightness(1.1) saturate(1.2)' : undefined
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
              sectionRef.current.focus()
              sectionRef.current.click()
            }
            
            // Tentar em todos os iframes da página (incluindo Twitch embeds)
            document.querySelectorAll('iframe').forEach(iframe => {
              try {
                iframe.dispatchEvent(event)
                iframe.focus()
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
        setSectionRect(rect)
        console.log('Section rect updated:', rect)
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

    window.addEventListener('resize', updateSectionRect)
    window.addEventListener('scroll', updateSectionRect)
    
    return () => {
      cancelAnimationFrame(rafId)
      clearTimeout(timeoutId)
      window.removeEventListener('resize', updateSectionRect)
      window.removeEventListener('scroll', updateSectionRect)
    }
  }, [mounted])

  // Também atualizar quando streamers carregarem
  useEffect(() => {
    if (streamers.length > 0 && sectionRef.current && mounted) {
      console.log('Updating section rect after streamers loaded, count:', streamers.length)
      const updateSectionRect = () => {
        const rect = sectionRef.current?.getBoundingClientRect()
        if (rect) {
          setSectionRect(rect)
          console.log('Section rect updated after streamers loaded:', rect)
        }
      }
      
      // Tentar várias vezes para garantir que o layout está estável
      updateSectionRect()
      setTimeout(updateSectionRect, 50)
      setTimeout(updateSectionRect, 200)
      setTimeout(updateSectionRect, 500)
    }
  }, [streamers, mounted])

  // Scroll trigger para autoplay quando seção estiver visível
  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        const isVisible = entry.isIntersecting && entry.intersectionRatio > 0.5
        
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
                document.dispatchEvent(event)
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
        threshold: 0.5,
        rootMargin: '0px 0px -100px 0px'
      }
    )

    observer.observe(section)
    
    return () => observer.disconnect()
  }, [])

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
          setMinimized(false) // Mostrar o miniplayer expandido no canto inferior direito
        } else if (isInStreamersSection && isMiniplaying) {
          // Usuário voltou para a seção de streams (scroll up) - minimizar miniplayer e reativar player principal
          console.log('User scrolled up to streams section - minimizing miniplayer and activating main player')
          setMinimized(true) // Minimizar miniplayer quando volta para a seção
          setActivePlayer('main') // Garantir que player principal seja ativo
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

  // Calcular streams visíveis e suas posições (memoizado para evitar recriações)
  const visibleStreams = React.useMemo(() => {
    // Calcular offset dinâmico: só adicionar altura quando expandido
    const dynamicOffset = isCollapsed ? 0 : featuredMatchesHeight

    if (streamers.length === 0) {
      return []
    }
    // Fallback se sectionRect não estiver disponível
    if (!sectionRect) {
      console.log('No sectionRect available, using fallback positioning')
      const fallbackRect = {
        left: 0,
        top: 0,
        width: typeof window !== 'undefined' ? window.innerWidth : 1200,
        height: 480
      }
      
      if (streamers.length === 1) {
        return [{ 
          streamer: streamers[0], 
          position: 'center' as const, 
          isSelected: true,
          containerStyle: {
            left: fallbackRect.width / 2 - 360,
            top: 100, // Top fixo para fallback
            width: 720,
            height: 405
          }
        }]
      }
      
      if (streamers.length >= 2) {
        const centerX = fallbackRect.width / 2
        const centerY = 240 // Centro da seção 480px
        const leftIndex = (selectedIndex - 1 + streamers.length) % streamers.length
        const rightIndex = (selectedIndex + 1) % streamers.length

        return [
          {
            streamer: streamers[leftIndex],
            position: 'left' as const,
            isSelected: false,
            containerStyle: {
              left: centerX - 360 - 300,
              top: centerY - 169 + 100,
              width: 600,
              height: 338,
              transform: 'scale(0.85) rotateY(5deg)'
            }
          },
          {
            streamer: streamers[selectedIndex],
            position: 'center' as const,
            isSelected: true,
            containerStyle: {
              left: centerX - 360,
              top: centerY - 202.5 + 100,
              width: 720,
              height: 405
            }
          },
          {
            streamer: streamers[rightIndex],
            position: 'right' as const,
            isSelected: false,
            containerStyle: {
              left: centerX + 60,
              top: centerY - 169 + 100,
              width: 600,
              height: 338,
              transform: 'scale(0.85) rotateY(-5deg)'
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
          left: sectionRect.left + sectionRect.width / 2 - 360,
          top: sectionRect.top + sectionRect.height / 2 - 202.5 + dynamicOffset,
          width: 720,
          height: 405
        }
      }]
    }
    
    if (streamers.length === 2) {
      const centerX = sectionRect.left + sectionRect.width / 2
      const centerY = sectionRect.top + sectionRect.height / 2 + dynamicOffset
      
      return [
        {
          streamer: streamers[0],
          position: selectedIndex === 0 ? 'center' as const : 'left' as const,
          isSelected: selectedIndex === 0,
          containerStyle: selectedIndex === 0 ? {
            left: centerX - 360,
            top: centerY - 202.5,
            width: 720,
            height: 405
          } : {
            left: centerX - 360 - 300,
            top: centerY - 169,
            width: 600,
            height: 338,
            transform: 'scale(0.85) rotateY(5deg)'
          }
        },
        {
          streamer: streamers[1],
          position: selectedIndex === 1 ? 'center' as const : 'right' as const,
          isSelected: selectedIndex === 1,
          containerStyle: selectedIndex === 1 ? {
            left: centerX - 360,
            top: centerY - 202.5,
            width: 720,
            height: 405
          } : {
            left: centerX + 60,
            top: centerY - 169,
            width: 600,
            height: 338,
            transform: 'scale(0.85) rotateY(-5deg)'
          }
        }
      ]
    }

    // Para 3+ streams
    const centerX = sectionRect.left + sectionRect.width / 2
    const centerY = sectionRect.top + sectionRect.height / 2 + dynamicOffset
    const leftIndex = (selectedIndex - 1 + streamers.length) % streamers.length
    const rightIndex = (selectedIndex + 1) % streamers.length

    return [
      {
        streamer: streamers[leftIndex],
        position: 'left' as const,
        isSelected: false,
        containerStyle: {
          left: centerX - 360 - 300,
          top: centerY - 169,
          width: 600,
          height: 338,
          transform: 'scale(0.85) rotateY(5deg)'
        }
      },
      {
        streamer: streamers[selectedIndex],
        position: 'center' as const,
        isSelected: true,
        containerStyle: {
          left: centerX - 360,
          top: centerY - 202.5,
          width: 720,
          height: 405
        }
      },
      {
        streamer: streamers[rightIndex],
        position: 'right' as const,
        isSelected: false,
        containerStyle: {
          left: centerX + 60,
          top: centerY - 169,
          width: 600,
          height: 338,
          transform: 'scale(0.85) rotateY(-5deg)'
        }
      }
    ]
  }, [streamers, selectedIndex, sectionRect, featuredMatchesHeight, isCollapsed])

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
              document.dispatchEvent(event)
              if (sectionRef.current) {
                sectionRef.current.dispatchEvent(event)
                sectionRef.current.focus()
                sectionRef.current.click()
              }
              // Tentar em todos os iframes da página
              document.querySelectorAll('iframe').forEach(iframe => {
                try {
                  iframe.dispatchEvent(event)
                  iframe.focus()
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
              document.dispatchEvent(event)
              if (sectionRef.current) {
                sectionRef.current.dispatchEvent(event)
                sectionRef.current.focus()
                sectionRef.current.click()
              }
              // Tentar em todos os iframes da página
              document.querySelectorAll('iframe').forEach(iframe => {
                try {
                  iframe.dispatchEvent(event)
                  iframe.focus()
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
        setMinimized(true)
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
              // Disparar em múltiplos elementos
              document.dispatchEvent(event)
              document.body.dispatchEvent(event)
              window.dispatchEvent(event)
              
              if (sectionRef.current) {
                sectionRef.current.dispatchEvent(event)
                sectionRef.current.focus()
                sectionRef.current.click()
              }
            } catch (e) {
              // Ignore errors
            }
          })
          
          // Estratégia 2: Focar e interagir com todos os iframes Twitch
          document.querySelectorAll('iframe').forEach(iframe => {
            try {
              if (iframe.src.includes('twitch.tv')) {
                iframe.focus()
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

  if (streamers.length === 0) {
    return null
  }

  // Calcular visibilidade do player principal
  // Player principal é visível quando é o player ativo OU quando miniplayer está minimizado
  const isMainPlayerVisible = activePlayer === 'main' || (isMiniplaying && isMinimized)

  // Previews só devem ser visíveis quando o player principal estiver pronto E visível
  const shouldShowPreviews = isMainPlayerVisible && isMainPlayerReady && !isTransitioning



  return (
    <>
      {/* Seção container (apenas estrutural) */}
      <div 
        ref={sectionRef} 
        className={cn(
          "relative w-full h-[480px] bg-black overflow-hidden transition-all duration-300",
          isTransitioning && "ring-2 ring-primary/20 ring-offset-2 ring-offset-background"
        )}
        tabIndex={0}
        style={{ outline: 'none' }}
      >
        <div className={cn(
          "absolute inset-0 bg-black transition-all duration-300",
          isTransitioning && "bg-black/90"
        )} />
        
        {/* Indicador de transição */}
        {isTransitioning && (
          <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
            <div className="bg-background/90 backdrop-blur-sm rounded-lg px-4 py-2 border border-border shadow-lg">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                <span className="text-sm text-foreground">Trocando stream...</span>
              </div>
            </div>
          </div>
        )}
        
        {/* Indicador de stream ativo - REMOVIDO */}

        {/* Controles de navegação */}
        <div className="relative w-full h-full flex items-center justify-center">
          {streamers.length > 1 && (
            <>
              <button
                onClick={prevStream}
                disabled={isTransitioning}
                className={cn(
                  "absolute left-4 top-1/2 -translate-y-1/2 z-50 rounded-full p-3 transition-all duration-300 backdrop-blur-sm border border-border",
                  isTransitioning 
                    ? "bg-background/40 cursor-not-allowed opacity-50 scale-90" 
                    : "bg-background/60 hover:bg-background/80 hover:scale-110 active:scale-95"
                )}
              >
                <ChevronLeft className={cn(
                  "h-6 w-6 text-foreground transition-all duration-200",
                  isTransitioning && "opacity-50"
                )} />
              </button>

              <button
                onClick={nextStream}
                disabled={isTransitioning}
                className={cn(
                  "absolute right-4 top-1/2 -translate-y-1/2 z-50 rounded-full p-3 transition-all duration-300 backdrop-blur-sm border border-border",
                  isTransitioning 
                    ? "bg-background/40 cursor-not-allowed opacity-50 scale-90" 
                    : "bg-background/60 hover:bg-background/80 hover:scale-110 active:scale-95"
                )}
              >
                <ChevronRight className={cn(
                  "h-6 w-6 text-foreground transition-all duration-200",
                  isTransitioning && "opacity-50"
                )} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Player principal persistente para o streamer selecionado */}
      {streamers[selectedIndex] && (
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
            }`.trim()
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
    </>
  )
}


