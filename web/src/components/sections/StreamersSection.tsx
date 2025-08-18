"use client"

import React, { useState, useEffect, useRef } from 'react'
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
  containerStyle
}: {
  channel: string | null
  isVisible: boolean
  containerStyle: React.CSSProperties
}) {
  const [mounted, setMounted] = useState(false)
  const [iframeKey, setIframeKey] = useState(0)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Forçar remontagem do iframe quando canal muda para garantir autoplay
  useEffect(() => {
    if (channel && mounted) {
      setIframeKey(prev => prev + 1)

      // Trigger de autoplay após mudança de canal - versão melhorada
      const triggerAutoplaySequence = () => {
        const triggerAutoplay = () => {
          const events = [
            new MouseEvent('click', { bubbles: true, cancelable: true }),
            new MouseEvent('mousedown', { bubbles: true, cancelable: true }),
            new MouseEvent('mouseup', { bubbles: true, cancelable: true })
          ]

          events.forEach(event => {
            try {
              document.dispatchEvent(event)
              if (iframeRef.current) {
                iframeRef.current.dispatchEvent(event)
              }
              // Também tentar no document body
              document.body.dispatchEvent(event)
            } catch (e) {
              // Ignore errors
            }
          })
        }

        // Múltiplas tentativas com delays crescentes para maximizar chances de sucesso
        triggerAutoplay()
        setTimeout(triggerAutoplay, 50)
        setTimeout(triggerAutoplay, 150)
        setTimeout(triggerAutoplay, 300)
        setTimeout(triggerAutoplay, 500)
        setTimeout(triggerAutoplay, 1000)
      }

      // Trigger após pequeno delay para garantir que o iframe foi montado
      setTimeout(triggerAutoplaySequence, 100)
      
      // Trigger adicional após iframe estar mais estável
      setTimeout(triggerAutoplaySequence, 500)
    }
  }, [channel, mounted])

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
        "fixed z-40 transition-all duration-300",
        isVisible ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      )}
      style={containerStyle}
    >
      <AspectRatio ratio={16 / 9} className="w-full h-full">
        {embedUrl ? (
          <iframe
            ref={iframeRef}
            key={`persistent-${channel}-${iframeKey}`} // Key que força remontagem quando canal muda
            src={embedUrl}
            className={cn(
              "w-full h-full block relative transition-opacity duration-300",
              isVisible ? "opacity-100" : "opacity-0"
            )}
            frameBorder="0"
            allowFullScreen
            scrolling="no"
            title={`${channel} - Twitch Stream`}
            allow="autoplay; fullscreen; encrypted-media"
          />
        ) : (
          // Placeholder quando não há embedUrl disponível
          <div className="w-full h-full bg-gradient-to-br from-muted/80 via-muted/60 to-background/90 flex items-center justify-center rounded-lg">
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

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const previewContent = (
    <div
      className={cn(
        "fixed z-30 transition-all duration-300 cursor-pointer group",
        isVisible ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        isHovered ? "scale-105" : "scale-100"
      )}
      style={containerStyle}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="w-full h-full bg-gradient-to-br from-muted/80 via-muted/60 to-background/90 flex items-center justify-center rounded-lg border-2 border-transparent group-hover:border-primary/60 transition-all duration-300 shadow-lg group-hover:shadow-xl group-hover:shadow-primary/20">
        <div className="relative w-full h-full flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-background/50 rounded-lg" />

          <div className="absolute inset-0 flex items-center justify-center z-20">
            <svg
              width="60"
              height="60"
              viewBox="0 0 60 60"
              className={cn(
                "text-white drop-shadow-lg transition-all duration-300",
                isHovered ? "scale-110 text-primary" : "scale-100"
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
            "absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 transition-opacity duration-300 rounded-lg",
            isHovered ? "opacity-100" : "opacity-0"
          )} />
          
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
  const sectionRef = useRef<HTMLDivElement>(null)

  const { showMiniplayer, hideMiniplayer, isVisible: isMiniplaying, setMinimized, isMinimized, setActivePlayer, activePlayer, isMainPlayerActive } = useMiniplPlayerContext()
  const { featuredMatchesHeight, isCollapsed } = useHeaderHeight()

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
          // Usuário saiu da seção de streams (scroll down) - ativar miniplayer
          console.log('User scrolled down - activating miniplayer')
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
          setMinimized(false) // Mostrar o miniplayer aberto
        } else if (isInStreamersSection && isMiniplaying) {
          // Usuário voltou para a seção de streams (scroll up) - minimizar miniplayer e reativar player principal
          console.log('User scrolled up to streams section - minimizing miniplayer and activating main player')
          setMinimized(true) // Minimizar miniplayer
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
    if (streamers.length > 0 && mounted) {
      console.log('Stream selection changed - triggering autoplay interaction for selectedIndex:', selectedIndex)
      
      // Simular interação do usuário para autoplay
      const triggerAutoplay = () => {
        const events = [
          new MouseEvent('click', { bubbles: true, cancelable: true }),
          new MouseEvent('mousedown', { bubbles: true, cancelable: true }),
          new TouchEvent('touchstart', { bubbles: true, cancelable: true })
        ]
        
        events.forEach(event => {
          try {
            document.dispatchEvent(event)
            if (sectionRef.current) {
              sectionRef.current.dispatchEvent(event)
            }
          } catch (e) {
            // Ignore errors for TouchEvent in environments that don't support it
          }
        })
      }

      // Trigger imediato e alguns delays para garantir
      triggerAutoplay()
      setTimeout(triggerAutoplay, 100)
      setTimeout(triggerAutoplay, 300)
    }
  }, [selectedIndex, streamers, mounted])

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
    setSelectedIndex((prev) => (prev + 1) % streamers.length)
    
    // Simular interação imediata para garantir autoplay na mudança
    setTimeout(() => {
      const triggerAutoplay = () => {
        const events = [
          new MouseEvent('click', { bubbles: true, cancelable: true }),
          new MouseEvent('mousedown', { bubbles: true, cancelable: true })
        ]
        
        events.forEach(event => {
          try {
            document.dispatchEvent(event)
            if (sectionRef.current) {
              sectionRef.current.dispatchEvent(event)
            }
          } catch (e) {
            // Ignore errors
          }
        })
      }
      triggerAutoplay()
    }, 10)
  }

  const prevStream = () => {
    setSelectedIndex((prev) => (prev - 1 + streamers.length) % streamers.length)
    
    // Simular interação imediata para garantir autoplay na mudança
    setTimeout(() => {
      const triggerAutoplay = () => {
        const events = [
          new MouseEvent('click', { bubbles: true, cancelable: true }),
          new MouseEvent('mousedown', { bubbles: true, cancelable: true })
        ]
        
        events.forEach(event => {
          try {
            document.dispatchEvent(event)
            if (sectionRef.current) {
              sectionRef.current.dispatchEvent(event)
            }
          } catch (e) {
            // Ignore errors
          }
        })
      }
      triggerAutoplay()
    }, 10)
  }

  const goToStream = (streamerId: string) => {
    const targetIndex = streamers.findIndex(s => s.id === streamerId)
    if (targetIndex !== -1 && targetIndex !== selectedIndex) {
      console.log('Going to stream:', streamerId, 'index:', targetIndex)
      setSelectedIndex(targetIndex)
      
      // Simular interação imediata para garantir autoplay na mudança
      setTimeout(() => {
        const triggerAutoplay = () => {
          const events = [
            new MouseEvent('click', { bubbles: true, cancelable: true }),
            new MouseEvent('mousedown', { bubbles: true, cancelable: true })
          ]
          
          events.forEach(event => {
            try {
              document.dispatchEvent(event)
              if (sectionRef.current) {
                sectionRef.current.dispatchEvent(event)
              }
            } catch (e) {
              // Ignore errors
            }
          })
        }
        triggerAutoplay()
      }, 10)
    }
  }

  if (streamers.length === 0) {
    return null
  }

  // Calcular visibilidade do player principal
  // Player principal é visível quando é o player ativo OU quando miniplayer está minimizado
  const isMainPlayerVisible = activePlayer === 'main' || (isMiniplaying && isMinimized)



  return (
    <>
      {/* Seção container (apenas estrutural) */}
      <div 
        ref={sectionRef} 
        className="relative w-full h-[480px] bg-black overflow-hidden"
        tabIndex={0}
        style={{ outline: 'none' }}
      >
        <div className="absolute inset-0 bg-black" />
        
        {/* Controles de navegação */}
        <div className="relative w-full h-full flex items-center justify-center">
          {streamers.length > 1 && (
            <>
              <button
                onClick={prevStream}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-50 bg-background/60 hover:bg-background/80 rounded-full p-3 transition-all duration-300 hover:scale-110 backdrop-blur-sm border border-border"
              >
                <ChevronLeft className="h-6 w-6 text-foreground" />
              </button>

              <button
                onClick={nextStream}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-50 bg-background/60 hover:bg-background/80 rounded-full p-3 transition-all duration-300 hover:scale-110 backdrop-blur-sm border border-border"
              >
                <ChevronRight className="h-6 w-6 text-foreground" />
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
          containerStyle={
            visibleStreams.find(s => s.isSelected)?.containerStyle || {
              left: 0,
              top: 0,
              width: 720,
              height: 405
            }
          }
        />
      )}

      {/* Previews para streams não selecionadas */}
      {visibleStreams.map(({ streamer, position, isSelected, containerStyle }) => (
        <React.Fragment key={`${streamer.id}-${position}`}>
          {!isSelected && (
            <StreamPreview
              streamer={streamer}
              containerStyle={containerStyle}
              isVisible={isMainPlayerVisible}
              onClick={() => goToStream(streamer.id)}
            />
          )}
        </React.Fragment>
      ))}
    </>
  )
}


