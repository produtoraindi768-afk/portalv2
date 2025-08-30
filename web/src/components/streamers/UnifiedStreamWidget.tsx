"use client"

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { SectionWrapper, ContentWrapper } from '@/components/layout'
import { Typography } from '@/components/ui/typography'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { RippleButton } from '@/components/animate-ui/buttons/ripple'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { OptimizedAvatar } from '@/components/ui/optimized-avatar'
import { Badge } from '@/components/ui/badge'

import { AspectRatio } from '@/components/ui/aspect-ratio'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { SkeletonPlayer, SkeletonStreamerCard } from '@/components/ui/skeleton'
import { useMiniplPlayerContext } from '@/components/miniplayer/MiniplPlayerProvider'
import { useStreamers } from '@/hooks/useStreamers'
import { useStreamerStatus } from '@/hooks/useStreamerStatus'
import { useAutoPreload } from '@/hooks/usePlayerPreload'
import { twitchStatusService } from '@/lib/twitch-status'
import { cn } from '@/lib/utils'
import { ProgressiveBlur } from '@/components/magicui/progressive-blur'
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Users,
  Play,
  Zap
} from 'lucide-react'

interface UnifiedStreamWidgetProps {
  className?: string
  autoplay?: boolean
}

export function UnifiedStreamWidget({ className, autoplay = true }: UnifiedStreamWidgetProps) {
  const [mounted, setMounted] = useState(false)
  const [isPlayerReady, setIsPlayerReady] = useState(false)
  const [selectedStreamerId, setSelectedStreamerId] = useState<string | null>(null)
  const [iframeKey, setIframeKey] = useState(0)
  const [isPlayerLoading, setIsPlayerLoading] = useState(false)
  const [previousChannel, setPreviousChannel] = useState<string | null>(null)
  const [userHasInteracted, setUserHasInteracted] = useState(false)
  const [autoplayAttempted, setAutoplayAttempted] = useState(false)

  // Estados para drag scroll
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)

  const widgetRef = useRef<HTMLDivElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const autoplayTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  
  const {
    streamers,
    selectedIndex,
    isLoading,
    isTransitioning,
    selectedStreamer,
    nextStream,
    prevStream,
    goToStream
  } = useStreamers()

  const {
    showMiniplayer,
    isVisible: isMiniplaying,
    setMinimized,
    setActivePlayer
  } = useMiniplPlayerContext()

  // Hook para gerenciar status dos streamers
  const { getStreamerStatus } = useStreamerStatus()

  // Função para obter status atualizado de um streamer
  const getStreamerLiveStatus = useCallback((streamer: any) => {
    const status = getStreamerStatus(streamer.id)
    return status?.isOnline ?? streamer.isOnline ?? false
  }, [getStreamerStatus])

  // Hook para preload automático de players
  const { getPreloadedPlayer, isChannelPreloaded } = useAutoPreload(streamers, selectedIndex)

  // Funções para drag scroll
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return
    setIsDragging(true)
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft)
    setScrollLeft(scrollContainerRef.current.scrollLeft)
    e.preventDefault()
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return
    e.preventDefault()
    const x = e.pageX - scrollContainerRef.current.offsetLeft
    const walk = (x - startX) * 2 // Multiplicador para sensibilidade
    scrollContainerRef.current.scrollLeft = scrollLeft - walk
  }, [isDragging, startX, scrollLeft])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleMouseLeave = useCallback(() => {
    setIsDragging(false)
  }, [])

  // Touch events para mobile
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!scrollContainerRef.current) return
    setIsDragging(true)
    setStartX(e.touches[0].pageX - scrollContainerRef.current.offsetLeft)
    setScrollLeft(scrollContainerRef.current.scrollLeft)
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging || !scrollContainerRef.current) return
    const x = e.touches[0].pageX - scrollContainerRef.current.offsetLeft
    const walk = (x - startX) * 1.5 // Sensibilidade para touch
    scrollContainerRef.current.scrollLeft = scrollLeft - walk
  }, [isDragging, startX, scrollLeft])

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false)
  }, [])

  // Scroll do mouse para mobile horizontal
  const handleWheel = useCallback((e: WheelEvent) => {
    if (!scrollContainerRef.current) return
    e.preventDefault()
    scrollContainerRef.current.scrollLeft += e.deltaY
  }, [])

  // Adicionar/remover listener do wheel para mobile
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    container.addEventListener('wheel', handleWheel, { passive: false })
    return () => container.removeEventListener('wheel', handleWheel)
  }, [handleWheel])

  // Sistema de autoplay completamente silencioso
  const triggerAutoplay = useCallback(() => {
    if (!iframeRef.current || !autoplay) return

    const iframe = iframeRef.current

    // Abordagem ultra-silenciosa: simular interação humana natural
    try {
      // 1. Simular movimento do mouse sobre o iframe
      const rect = iframe.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2

      // 2. Simular sequência natural: mouseover -> mousedown -> mouseup -> click
      const events = [
        new MouseEvent('mouseover', { bubbles: true, clientX: centerX, clientY: centerY }),
        new MouseEvent('mouseenter', { bubbles: true, clientX: centerX, clientY: centerY }),
        new MouseEvent('mousedown', { bubbles: true, clientX: centerX, clientY: centerY, button: 0 }),
        new MouseEvent('mouseup', { bubbles: true, clientX: centerX, clientY: centerY, button: 0 }),
        new MouseEvent('click', { bubbles: true, clientX: centerX, clientY: centerY, button: 0 })
      ]

      // 3. Disparar eventos com micro-delays para parecer humano
      events.forEach((event, index) => {
        setTimeout(() => {
          iframe.dispatchEvent(event)
        }, index * 50) // 50ms entre cada evento
      })

      // 4. PostMessage discreto após os eventos
      setTimeout(() => {
        iframe.contentWindow?.postMessage('{"event":"command","func":"play","args":[]}', 'https://player.twitch.tv')
      }, 300)

    } catch (error) {
      // Completamente silencioso
    }

  }, [autoplay])

  useEffect(() => {
    setMounted(true)
    setActivePlayer('main')
  }, [setActivePlayer])

  useEffect(() => {
    if (selectedStreamer) {
      setSelectedStreamerId(selectedStreamer.id)
    }
  }, [selectedStreamer])

  // Detectar interação do usuário para habilitar autoplay
  useEffect(() => {
    if (!mounted || userHasInteracted) return

    const handleUserInteraction = () => {
      console.log('👆 Interação do usuário detectada')
      setUserHasInteracted(true)
      setAutoplayAttempted(false) // Reset para permitir nova tentativa
    }

    const eventTypes = ['click', 'keydown', 'touchstart']

    eventTypes.forEach(eventType => {
      document.addEventListener(eventType, handleUserInteraction, { once: true, passive: true })
    })

    return () => {
      eventTypes.forEach(eventType => {
        document.removeEventListener(eventType, handleUserInteraction)
      })
    }
  }, [mounted, userHasInteracted])



  // Observer para miniplayer
  useEffect(() => {
    const widget = widgetRef.current
    if (!widget || streamers.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        const isInView = entry.isIntersecting

        if (!isInView && selectedStreamer) {
          // Garantir que twitchChannel seja extraído corretamente
          const extractedTwitchChannel = selectedStreamer.twitchChannel ||
            (selectedStreamer.streamUrl ? twitchStatusService.extractUsernameFromTwitchUrl(selectedStreamer.streamUrl) : null)

          const streamerForMiniplayer = {
            id: selectedStreamer.id,
            name: selectedStreamer.name || '',
            platform: selectedStreamer.platform || '',
            streamUrl: selectedStreamer.streamUrl || '',
            avatarUrl: selectedStreamer.avatarUrl || '',
            category: selectedStreamer.category || '',
            isOnline: getStreamerLiveStatus(selectedStreamer),
            isFeatured: Boolean(selectedStreamer.isFeatured),
            twitchChannel: extractedTwitchChannel || undefined,
            createdAt: selectedStreamer.createdAt || '',
            lastStatusUpdate: selectedStreamer.lastStatusUpdate || ''
          }

          // Log apenas em desenvolvimento
          if (process.env.NODE_ENV === 'development') {
            console.log('🎬 Enviando streamer para miniplayer:', {
              name: streamerForMiniplayer.name,
              twitchChannel: streamerForMiniplayer.twitchChannel,
              isOnline: getStreamerLiveStatus(streamerForMiniplayer),
              platform: streamerForMiniplayer.platform
            })
          }

          showMiniplayer(streamerForMiniplayer)
          setMinimized(false, false)
        } else if (isInView && isMiniplaying) {
          setMinimized(true, false)
          setActivePlayer('main')
        }
      },
      { threshold: 0.3, rootMargin: '-50px 0px' }
    )

    observer.observe(widget)
    return () => observer.disconnect()
  }, [streamers, selectedStreamer, setMinimized, isMiniplaying, showMiniplayer, setActivePlayer])

  // Extração e gerenciamento do canal do Twitch
  const twitchChannel = React.useMemo(() => {
    if (!selectedStreamer) return null

    // Primeiro tentar twitchChannel diretamente
    if (selectedStreamer.twitchChannel) {
      return selectedStreamer.twitchChannel
    }

    // Tentar extrair do streamUrl
    if (selectedStreamer.streamUrl) {
      return twitchStatusService.extractUsernameFromTwitchUrl(selectedStreamer.streamUrl)
    }

    return null
  }, [selectedStreamer])

  // Embed URL otimizada para player principal com som ativo
  const embedUrl = React.useMemo(() => {
    if (!mounted || !twitchChannel) return null

    // URL otimizada para player principal - som ativo para melhor experiência
    const params = new URLSearchParams({
      channel: twitchChannel,
      autoplay: 'true', // Ativar autoplay para player principal
      muted: 'false', // SOM ATIVO por padrão no player principal
      controls: 'true',
      allowfullscreen: 'true',
      // Parâmetros para reduzir requisições
      'disable-ads': 'true', // Tentar desabilitar ads
      'time': '0s' // Começar do início
    })

    // Adicionar parents de forma mais eficiente
    const parents = ['localhost']
    if (typeof window !== 'undefined' && window.location.hostname && window.location.hostname !== 'localhost') {
      parents.push(window.location.hostname)
    }
    parents.forEach(parent => params.append('parent', parent))

    return `https://player.twitch.tv/?${params.toString()}`
  }, [twitchChannel, mounted])

  // Sistema de autoplay silencioso automático
  useEffect(() => {
    if (!mounted || !isPlayerReady || !embedUrl) return

    // Aguardar um tempo para o player estar totalmente carregado
    const silentAutoplayTimer = setTimeout(() => {
      // Simular interação silenciosa automaticamente
      if (!userHasInteracted) {
        setUserHasInteracted(true)
      }

      // Trigger autoplay silencioso
      triggerAutoplay()

      // Tentativas adicionais silenciosas
      setTimeout(() => triggerAutoplay(), 2000)
      setTimeout(() => triggerAutoplay(), 5000)

    }, 3000) // 3 segundos após o player estar pronto

    return () => clearTimeout(silentAutoplayTimer)
  }, [mounted, isPlayerReady, embedUrl, userHasInteracted, triggerAutoplay])

  // Sistema de autoplay invisível baseado em movimento do mouse
  useEffect(() => {
    if (!mounted || userHasInteracted) return

    let mouseMoveCount = 0
    const handleMouseMove = () => {
      mouseMoveCount++

      // Após 3 movimentos do mouse, ativar autoplay silenciosamente
      if (mouseMoveCount >= 3 && !userHasInteracted) {
        setUserHasInteracted(true)

        // Aguardar um pouco e então ativar autoplay
        setTimeout(() => {
          if (isPlayerReady) {
            triggerAutoplay()
          }
        }, 1000)

        // Remover listener após ativação
        document.removeEventListener('mousemove', handleMouseMove)
      }
    }

    document.addEventListener('mousemove', handleMouseMove, { passive: true })

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
    }
  }, [mounted, userHasInteracted, isPlayerReady, triggerAutoplay])

  // Autoplay discreto adicional quando usuário interagir
  useEffect(() => {
    if (isPlayerReady && autoplay && embedUrl && userHasInteracted) {
      // Uma única tentativa discreta após interação do usuário
      setTimeout(() => triggerAutoplay(), 1000)
    }
  }, [isPlayerReady, autoplay, embedUrl, userHasInteracted, triggerAutoplay])

  // Gerenciar mudança de canal com transição otimizada
  useEffect(() => {
    if (!twitchChannel || !mounted || twitchChannel === previousChannel) return

    // Transição imediata para melhor UX
    setIsPlayerLoading(true)
    setIsPlayerReady(false)
    setAutoplayAttempted(false)

    // Usar requestAnimationFrame para transição suave
    requestAnimationFrame(() => {
      setIframeKey(prev => prev + 1)
      setPreviousChannel(twitchChannel)

      // Timeout reduzido para loading mais rápido
      const loadTimeout = setTimeout(() => {
        setIsPlayerLoading(false)
      }, 600) // Reduzido de 1000ms para 600ms

      return () => clearTimeout(loadTimeout)
    })
  }, [twitchChannel, mounted, previousChannel])

  // Handler simples para quando iframe carrega
  const handleIframeLoad = useCallback(() => {
    setTimeout(() => {
      setIsPlayerLoading(false)
      setIsPlayerReady(true)
    }, 500)
  }, [])



  const handleFullscreen = useCallback(() => {
    if (iframeRef.current) {
      try {
        iframeRef.current.requestFullscreen?.()
      } catch (error) {
        console.log('Erro ao entrar em fullscreen:', error)
      }
    }
  }, [])

  if (isLoading) {
    return (
      <SectionWrapper className="relative">
        <ContentWrapper gap="normal">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <Typography variant="body" className="text-muted-foreground">
              Carregando streams...
            </Typography>
          </div>
        </ContentWrapper>
      </SectionWrapper>
    )
  }

  // Ocultar componente se não há streamers em destaque
  if (streamers.length === 0) {
    return null
  }

  return (
    <SectionWrapper spacing="none" className="relative">
      {/* Unified Stream Widget - Apple-inspired */}
      <div 
        ref={widgetRef}
        className={cn(
          "relative w-full max-w-6xl mx-auto",
          "bg-background/85 backdrop-blur-[24px] border border-border/30 overflow-hidden",
          "shadow-2xl shadow-black/10",
          "transition-all duration-700 ease-out",
          "apple-glass", // Classe Apple conforme especificação
          "min-h-0", // Remove altura fixa, deixa o conteúdo definir
          // Breakpoints específicos para bordas responsivas
          "rounded-xl sm:rounded-2xl md:rounded-3xl",
          className
        )}
      >


          <div className="flex flex-col lg:flex-row">
            {/* Player Principal - Responsivo */}
            <div className="w-full lg:w-[80%] relative order-1">
              <div className="px-2 py-2 sm:px-3 sm:py-3 md:px-4 md:py-3 lg:px-6 lg:py-4"> {/* Padding ultra-responsivo para maximizar iframe */}
                <AspectRatio ratio={16 / 9} className="w-full">
                  <div className="relative w-full h-full bg-muted/50 overflow-hidden border border-border/20 rounded-lg sm:rounded-xl md:rounded-2xl">
                    
                    {/* Loading State */}
                    {(isPlayerLoading || (embedUrl && !isPlayerReady)) && (
                      <div className="absolute inset-0 z-20">
                        <SkeletonPlayer
                          showControls={true}
                          className="w-full h-full rounded-2xl"
                        />
                      </div>
                    )}

                    {/* Twitch Embed */}
                    {embedUrl ? (
                      <iframe
                        ref={iframeRef}
                        key={`unified-twitch-${twitchChannel}-${iframeKey}`}
                        src={embedUrl}
                        className={cn(
                          "w-full h-full border-0 rounded-2xl transition-all duration-500 ease-in-out",
                          !isPlayerLoading && isPlayerReady ? "opacity-100 scale-100" : "opacity-0 scale-95"
                        )}
                        frameBorder="0"
                        allowFullScreen
                        title={`${selectedStreamer?.name} - Twitch Stream`}
                        onLoad={handleIframeLoad}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-muted/30 backdrop-blur-[8px] apple-glass">
                        <div className="text-center space-y-6">
                          <div className="relative">
                            <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse z-0" />
                            <Play className="relative w-16 h-16 text-primary/80 mx-auto z-10" />
                          </div>
                          <Typography variant="h4" className="text-foreground font-light tracking-tight">
                            Stream indisponível
                          </Typography>
                          <Typography variant="body" className="text-muted-foreground font-light">
                            Aguardando conexão...
                          </Typography>
                        </div>
                      </div>
                    )}
                  </div>
                </AspectRatio>

                {/* Barra de Controles Estilo YouTube */}
                <div className="flex items-center justify-between mt-2 sm:mt-3 md:mt-4 px-2 py-1.5 sm:px-3 sm:py-2 md:px-4 md:py-2 overflow-hidden">
                  {/* 👤 Seção Esquerda - Info do Streamer */}
                  {selectedStreamer && (
                    <div className="flex items-center gap-3">
                      {/* Avatar com indicador de status */}
                      <OptimizedAvatar
                        src={selectedStreamer.avatarUrl}
                        alt={selectedStreamer.name}
                        size="md"
                        showOnlineIndicator={true}
                        isOnline={getStreamerLiveStatus(selectedStreamer)}
                        className="w-10 h-10"
                      />
                      
                      {/* Layout em coluna para informações empilhadas */}
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground text-base leading-tight">
                          {selectedStreamer.name}
                        </span>
                        {getStreamerLiveStatus(selectedStreamer) && (
                          <span className="text-xs text-muted-foreground font-light">
                            Ao vivo
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 🎮 Seção Direita - Controles */}
                  <div className="flex items-center gap-3">
                    {/* Navegação: Setas prev/next agrupadas */}
                    <div className="flex items-center gap-2">
                      <RippleButton
                        onClick={prevStream}
                        disabled={streamers.length <= 1}
                        variant="ghost"
                        size="sm"
                        className="h-9 w-9 p-0 rounded-full bg-background/80 backdrop-blur-[16px] border border-border/30 transition-all duration-300 hover:bg-background hover:shadow-lg apple-hover"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </RippleButton>

                      <RippleButton
                        onClick={nextStream}
                        disabled={streamers.length <= 1}
                        variant="ghost"
                        size="sm"
                        className="h-9 w-9 p-0 rounded-full bg-background/80 backdrop-blur-[16px] border border-border/30 transition-all duration-300 hover:bg-background hover:shadow-lg apple-hover"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </RippleButton>
                    </div>

                    {/* Fullscreen: Botão separado para destaque */}
                    <RippleButton
                      onClick={handleFullscreen}
                      variant="ghost"
                      size="sm"
                      className="h-9 w-9 p-0 rounded-full bg-background/80 backdrop-blur-[16px] border border-border/30 transition-all duration-300 hover:bg-background hover:shadow-lg apple-hover"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </RippleButton>
                  </div>
                </div>
              </div>
            </div>

            {/* Lista de Streamers - Responsivo */}
            <div className="w-full lg:w-[25%] lg:border-l border-t lg:border-t-0 border-border/20 backdrop-blur-[8px] flex flex-col relative rounded-b-xl lg:rounded-b-none lg:rounded-r-xl max-h-[250px] sm:max-h-[280px] md:max-h-[320px] lg:max-h-[600px] order-2 min-w-0">
              {/* Scroll container customizado para mobile com drag */}
              <div className="lg:hidden relative">
                <div className="px-3 py-2.5 border-b border-border/20 backdrop-blur-[8px]">
                  <div className="flex items-center justify-between">
                    <Typography variant="body-sm" className="font-medium text-muted-foreground">
                      Team Streamers
                    </Typography>
                    <Badge variant="secondary" className="text-xs">
                      {streamers.length}
                    </Badge>
                  </div>
                </div>
                
                <div className="relative">
                  <div 
                    ref={scrollContainerRef}
                    className={cn(
                      "overflow-x-auto overflow-y-hidden relative",
                      "cursor-grab active:cursor-grabbing",
                      "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]",
                      "mx-0 contain-layout",
                      isDragging && "select-none"
                    )}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseLeave}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                  >
                    <div className="flex gap-2 px-3 py-3 min-w-max">
                      {streamers.map((streamer, index) => (
                        <div key={streamer.id} className="relative group flex-shrink-0">
                          <HoverCard>
                            <HoverCardTrigger asChild>
                              <button
                                onClick={() => !isDragging && goToStream(streamer.id)}
                                className={cn(
                                  "max-w-[110px] min-w-[90px] text-left p-2 rounded-lg border transition-all duration-500 ease-out",
                                  "hover:bg-muted/60 hover:shadow-lg apple-hover",
                                  selectedStreamerId === streamer.id
                                    ? "bg-primary/15 border-primary/30 shadow-md backdrop-blur-[8px]"
                                    : "bg-background/60 border-border/20 hover:border-border/40 backdrop-blur-[8px]"
                                )}
                              >
                                <div className="flex flex-col items-center gap-2">
                                  <OptimizedAvatar
                                    src={streamer.avatarUrl}
                                    alt={streamer.name}
                                    size="sm"
                                    showOnlineIndicator={true}
                                    isOnline={getStreamerLiveStatus(streamer)}
                                    className="w-7 h-7 flex-shrink-0"
                                  />
                                  
                                  <div className="flex-1 min-w-0 text-center">
                                    <div className="flex flex-col gap-0.5">
                                      <span className="font-medium text-xs truncate tracking-tight leading-tight">
                                        {streamer.name}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </button>
                            </HoverCardTrigger>
                            <HoverCardContent side="top" className="w-48 p-2">
                              <div className="flex gap-2">
                                <OptimizedAvatar
                                  src={streamer.avatarUrl}
                                  alt={streamer.name}
                                  size="sm"
                                  showOnlineIndicator={true}
                                  isOnline={getStreamerLiveStatus(streamer)}
                                  className="w-8 h-8"
                                />
                                <div className="flex-1 min-w-0 space-y-1">
                                  <div className="flex items-center gap-1.5">
                                    <h4 className="font-medium text-sm truncate">{streamer.name}</h4>
                                    {streamer.isFeatured && (
                                      <Badge variant="outline" className="text-xs px-1.5 py-0 flex-shrink-0 flex items-center gap-1">
                                        <Zap className="w-3 h-3 text-primary" />
                                        <span>SZ</span>
                                      </Badge>
                                    )}
                                  </div>
                                  
                                  {streamer.category && (
                                    <Badge variant="outline" className="text-xs px-1.5 py-0">
                                      {streamer.category}
                                    </Badge>
                                  )}
                                  
                                  {streamer.bio && (
                                    <>
                                      <Separator className="my-2" />
                                      <p className="text-xs text-muted-foreground leading-relaxed">
                                        {streamer.bio}
                                      </p>
                                    </>
                                  )}
                                </div>
                              </div>
                            </HoverCardContent>
                          </HoverCard>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Progressive Blur laterais para suavizar o corte - Mobile */}
                  <ProgressiveBlur 
                    className="left-0 top-0 bottom-0 w-8" 
                    position="both" 
                    height="100%"
                    blurLevels={[0.5, 1, 2, 4, 8]}
                  />
                  <ProgressiveBlur 
                    className="right-0 top-0 bottom-0 w-8 rotate-180" 
                    position="both" 
                    height="100%"
                    blurLevels={[0.5, 1, 2, 4, 8]}
                  />
                  
                  {/* Progressive Blur inferior para mobile */}
                  <ProgressiveBlur 
                    className="bottom-0 left-0 right-0 rounded-b-xl" 
                    position="bottom" 
                    height="16px"
                    blurLevels={[0.5, 1, 2, 4, 8, 16]}
                  />
                </div>
              </div>

              {/* Layout desktop com ScrollArea corrigido */}
              <div className="hidden lg:flex lg:flex-col lg:h-full relative">
                <div className="p-3 border-b border-border/20 backdrop-blur-[8px] lg:rounded-tr-xl flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <Typography variant="body-sm" className="font-medium text-muted-foreground">
                      Team Streamers
                    </Typography>
                    <Badge variant="secondary" className="text-xs">
                      {streamers.length}
                    </Badge>
                  </div>
                </div>

                <div className="flex-1 relative rounded-br-3xl">
                  <ScrollArea className="h-full max-h-[520px] rounded-br-3xl">
                    <div className="p-4 pr-6 pb-8 space-y-2 rounded-br-3xl">
                      {streamers.map((streamer, index) => (
                        <div key={streamer.id} className="relative group">
                          <HoverCard>
                            <HoverCardTrigger asChild>
                              <button
                                onClick={() => goToStream(streamer.id)}
                                className={cn(
                                  "w-full text-left py-3 px-4 rounded-md border transition-all duration-500 ease-out",
                                  "hover:bg-muted/60 hover:shadow-lg apple-hover",
                                  selectedStreamerId === streamer.id
                                    ? "bg-primary/15 border-primary/30 shadow-md backdrop-blur-[8px]"
                                    : "bg-background/60 border-border/20 hover:border-border/40 backdrop-blur-[8px]"
                                )}
                              >
                                <div className="flex items-center gap-3">
                                  <OptimizedAvatar
                                    src={streamer.avatarUrl}
                                    alt={streamer.name}
                                    size="md"
                                    showOnlineIndicator={true}
                                    isOnline={getStreamerLiveStatus(streamer)}
                                    className="w-10 h-10"
                                  />
                                  
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1">
                                      <span className="font-light text-base truncate tracking-tight">
                                        {streamer.name}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </button>
                            </HoverCardTrigger>
                            <HoverCardContent side="left" className="w-56 p-2">
                              <div className="flex gap-2.5">
                                <OptimizedAvatar
                                  src={streamer.avatarUrl}
                                  alt={streamer.name}
                                  size="md"
                                  showOnlineIndicator={true}
                                  isOnline={getStreamerLiveStatus(streamer)}
                                  className="w-10 h-10"
                                />
                                <div className="flex-1 min-w-0 space-y-1">
                                  <div className="flex items-center gap-1.5">
                                    <h4 className="font-medium text-sm truncate">{streamer.name}</h4>
                                    {streamer.isFeatured && (
                                      <Badge variant="outline" className="text-xs px-1.5 py-0 flex-shrink-0 flex items-center gap-1">
                                        <Zap className="w-3 h-3 text-primary" />
                                        <span>SZ</span>
                                      </Badge>
                                    )}
                                  </div>
                                  
                                  {streamer.category && (
                                    <Badge variant="outline" className="text-xs px-1.5 py-0">
                                      {streamer.category}
                                    </Badge>
                                  )}
                                  
                                  {streamer.bio && (
                                    <>
                                      <Separator className="my-2" />
                                      <p className="text-xs text-muted-foreground leading-relaxed">
                                        {streamer.bio}
                                      </p>
                                    </>
                                  )}
                                </div>
                              </div>
                            </HoverCardContent>
                          </HoverCard>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  
                  {/* Progressive Blur para suavizar o corte - Desktop */}
                  <ProgressiveBlur 
                    className="bottom-0 left-0 right-0 rounded-br-3xl" 
                    position="bottom" 
                    height="64px"
                    blurLevels={[0.5, 1, 2, 4, 8, 16, 32]}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
    </SectionWrapper>
  )
}