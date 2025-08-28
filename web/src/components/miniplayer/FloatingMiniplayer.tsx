"use client"

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { useMiniplayer } from '@/hooks/use-miniplayer'
import { useMiniplPlayerContext } from './MiniplPlayerProvider'
import { useIsMobile } from '@/hooks/use-mobile'
import { cn } from '@/lib/utils'
import type { MiniplPlayerProps, Position } from '@/lib/miniplayer-types'
import { MINIPLAYER_CONFIG as GLOBAL_MINIPLAYER_CONFIG } from '@/lib/miniplayer-types'

// Configurações específicas para mobile (deve corresponder ao hook)
const MOBILE_CONFIG = {
  margin: 12,
  defaultSize: { width: 320, height: 180 },
  minimizedSize: { width: 240, height: 40 } // Ajustado para formato de pílula mobile
}
import { StreamSwitcher } from '@/components/miniplayer/StreamSwitcher'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { 
  Tooltip, 
  TooltipContent, 
  TooltipTrigger,
  TooltipProvider 
} from '@/components/animate-ui/components/tooltip'
import { Skeleton } from '@/components/ui/skeleton'
import { Minimize2, Maximize2, ExternalLink, Move } from 'lucide-react'

export function FloatingMiniplayer({ className, onClose, onOpenTwitch }: Omit<MiniplPlayerProps, 'selectedStreamer'>) {
  // Variáveis de estilo do topo por estado
  const OPEN_HEADER_HEIGHT_PX = 48
  const MINIMIZED_HEADER_HEIGHT_PX = 40 // Ajustado para formato de pílula
  const OPEN_HEADER_HAS_BORDER = true
  const MINIMIZED_HEADER_HAS_BORDER = false // Sem borda no modo minimizado para pílula
  const OPEN_CARD_HAS_BORDER = true
  const MINIMIZED_CARD_HAS_BORDER = false
  const {
    isVisible,
    hideMiniplayer,
    streamers: contextStreamers,
    selectedStreamer: contextSelectedStreamer,
    switchStreamer,
    loading: contextLoading,
    isMinimized: contextIsMinimized,
    setMinimized: contextSetMinimized,
    forceMinimized: contextForceMinimized,
    activePlayer
  } = useMiniplPlayerContext()
  
  const {
    state,
    setPosition,
    setDragging,
    setMinimized,
    setHovering,
    setMuted,
    setVolume,
    setVisible,
    snapToCorner
  } = useMiniplayer()

  const isMobile = useIsMobile()
  const containerRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [headerHeight, setHeaderHeight] = useState<number>(OPEN_HEADER_HEIGHT_PX)
  const dragRef = useRef<{
    isDragging: boolean
    startPos: Position
    offset: Position
  }>({
    isDragging: false,
    startPos: { x: 0, y: 0 },
    offset: { x: 0, y: 0 }
  })

  const [mounted, setMounted] = useState(false)
  const hasForcedOpenRef = useRef(false)

  // Usar dados do contexto
  const streamers = contextStreamers
  const loading = contextLoading

  // Garantir que o portal só renderize no cliente
  useEffect(() => {
    setMounted(true)
  }, [])

  // Forçar iniciar ABERTO na primeira montagem visível
  useEffect(() => {
    if (mounted && isVisible && !hasForcedOpenRef.current) {
      hasForcedOpenRef.current = true
      contextSetMinimized(false, false) // false = automático (não é ação manual)

      // Garantir que sempre comece com o streamer em destaque
      if (streamers.length > 0 && !contextSelectedStreamer) {
        const featuredStreamer = streamers.find(s => s.isFeatured)
        if (featuredStreamer) {
          switchStreamer(featuredStreamer)
        }
      }
    }
  }, [mounted, isVisible, contextSetMinimized, streamers, contextSelectedStreamer, switchStreamer])

  // Priorizar o streamer selecionado do contexto (vindo da StreamersSection) sobre streamers do hook
  // Se não houver streamer selecionado, buscar o primeiro streamer em destaque
  const activeStreamer = contextSelectedStreamer || 
    (streamers.length > 0 ? streamers.find(s => s.isFeatured) || streamers[0] : null)

  const embedUrl = React.useMemo(() => {
    if (!activeStreamer || activeStreamer.platform !== 'twitch' || !activeStreamer.twitchChannel) {
      return null
    }
    
    // Usar URL estável - sempre com autoplay
    // Começar mutado para garantir autoplay, mas permitir controle via interface
    const params = new URLSearchParams({
      channel: activeStreamer.twitchChannel,
      autoplay: 'true',
      muted: 'true', // Sempre começar mutado para garantir autoplay
      // Deixe os controles padrão do player Twitch (evita bloqueios de autoplay em alguns navegadores)
      // e melhora UX para pausar/mutar rápido
      controls: 'true',
      playsinline: 'true'
    })
    const parents = new Set<string>()
    if (typeof window !== 'undefined' && window.location.hostname) {
      parents.add(window.location.hostname)
    }
    parents.add('localhost')
    parents.forEach((p) => params.append('parent', p))
    const finalUrl = `https://player.twitch.tv/?${params.toString()}`
    return finalUrl
  }, [activeStreamer])

  const canPlay = Boolean(activeStreamer && activeStreamer.platform === 'twitch' && activeStreamer.isOnline && activeStreamer.twitchChannel)

  // Debug logs para miniplayer (comentado para produção)
  React.useEffect(() => {
    if (activeStreamer && process.env.NODE_ENV === 'development') {
      // console.log('🎬 Miniplayer Debug:', {
      //   name: activeStreamer.name,
      //   platform: activeStreamer.platform,
      //   isOnline: activeStreamer.isOnline,
      //   twitchChannel: activeStreamer.twitchChannel,
      //   embedUrl: embedUrl ? 'Generated' : 'NULL'
      // })
    }
  }, [activeStreamer, canPlay, embedUrl])
  
  // Atualiza a altura conforme estado (aberto/minimizado)
  useEffect(() => {
    setHeaderHeight(contextIsMinimized ? MINIMIZED_HEADER_HEIGHT_PX : OPEN_HEADER_HEIGHT_PX)
  }, [contextIsMinimized])

  // Calcular tamanho baseado no estado de minimização
  const getCurrentSize = useCallback(() => {
    const config = isMobile ? MOBILE_CONFIG : GLOBAL_MINIPLAYER_CONFIG
    const baseSize = contextIsMinimized ? config.minimizedSize : config.defaultSize
    
    // Para o modo minimizado, garantir que a altura inclua o header
    if (contextIsMinimized) {
      return {
        width: baseSize.width,
        height: baseSize.height + MINIMIZED_HEADER_HEIGHT_PX
      }
    }
    
    return baseSize
  }, [contextIsMinimized, isMobile])

  const currentSize = getCurrentSize()

  // Handlers para arrastar
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Não permitir arrastar quando minimizado (posição fixa no rodapé)
    if (contextIsMinimized) return
    // Só permitir drag pelo header, não pelos botões
    const target = e.target as HTMLElement
    if (target.closest('button') || target.closest('iframe') || target.closest('svg')) {
      return
    }

    e.preventDefault()
    
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return

    dragRef.current = {
      isDragging: true,
      startPos: { x: e.clientX, y: e.clientY },
      offset: {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      }
    }

    setDragging(true)
    document.body.style.userSelect = 'none'
    document.body.style.cursor = 'grabbing'
  }, [setDragging, contextIsMinimized])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragRef.current.isDragging) return

    e.preventDefault()

    const newPosition: Position = {
      x: e.clientX - dragRef.current.offset.x,
      y: e.clientY - dragRef.current.offset.y
    }

    // Aplicar limites da tela
    const margin = isMobile ? MOBILE_CONFIG.margin : 16
    const maxX = window.innerWidth - currentSize.width - margin
    const visibleBodyHeight = (contextIsMinimized ? 0 : currentSize.height)
    const maxY = window.innerHeight - (visibleBodyHeight + headerHeight) - margin

    newPosition.x = Math.max(margin, Math.min(maxX, newPosition.x))
    newPosition.y = Math.max(margin, Math.min(maxY, newPosition.y))

    setPosition(newPosition)
  }, [state.size, setPosition, isMobile, currentSize, contextIsMinimized, headerHeight])

  const handleMouseUp = useCallback(() => {
    if (!dragRef.current.isDragging) return

    dragRef.current.isDragging = false
    setDragging(false)
    document.body.style.userSelect = ''
    document.body.style.cursor = ''
  }, [setDragging])

  // Handlers para touch events (mobile)
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    // Não permitir arrastar quando minimizado
    if (contextIsMinimized) return
    // Só permitir drag pelo header, não pelos botões
    const target = e.target as HTMLElement
    if (target.closest('button') || target.closest('iframe') || target.closest('svg')) {
      return
    }

    e.preventDefault()
    
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return

    const touch = e.touches[0]
    dragRef.current = {
      isDragging: true,
      startPos: { x: touch.clientX, y: touch.clientY },
      offset: {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      }
    }

    setDragging(true)
    document.body.style.userSelect = 'none'
  }, [setDragging, contextIsMinimized])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!dragRef.current.isDragging) return

    e.preventDefault()

    const touch = e.touches[0]
    const newPosition: Position = {
      x: touch.clientX - dragRef.current.offset.x,
      y: touch.clientY - dragRef.current.offset.y
    }

    // Aplicar limites da tela
    const margin = isMobile ? MOBILE_CONFIG.margin : 16
    const maxX = window.innerWidth - currentSize.width - margin
    const visibleBodyHeight = (contextIsMinimized ? 0 : currentSize.height)
    const maxY = window.innerHeight - (visibleBodyHeight + headerHeight) - margin

    newPosition.x = Math.max(margin, Math.min(maxX, newPosition.x))
    newPosition.y = Math.max(margin, Math.min(maxY, newPosition.y))

    setPosition(newPosition)
  }, [state.size, setPosition, isMobile, currentSize, contextIsMinimized, headerHeight])

  const handleTouchEnd = useCallback(() => {
    if (!dragRef.current.isDragging) return

    dragRef.current.isDragging = false
    setDragging(false)
    document.body.style.userSelect = ''
  }, [setDragging])

  // Adicionar/remover event listeners para drag
  useEffect(() => {
    if (state.isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.addEventListener('touchmove', handleTouchMove, { passive: false })
      document.addEventListener('touchend', handleTouchEnd)
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
        document.removeEventListener('touchmove', handleTouchMove)
        document.removeEventListener('touchend', handleTouchEnd)
      }
    }
  }, [state.isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd])

  // Handlers de controle
  const handleClose = useCallback(() => {
    hideMiniplayer()
    setVisible(false)
    onClose?.()
  }, [hideMiniplayer, setVisible, onClose])

  const handleOpenTwitch = useCallback(() => {
    if (!activeStreamer) return
    // Abrir a aba via callback do provider (evita duplicar janelas)
    const hasChannel = Boolean(activeStreamer.twitchChannel)
    const openUrl = hasChannel
      ? `https://www.twitch.tv/${activeStreamer.twitchChannel}`
      : activeStreamer.streamUrl
    const callbackUrl = hasChannel
      ? `https://twitch.tv/${activeStreamer.twitchChannel}`
      : activeStreamer.streamUrl
    if (openUrl) {
      window.open(openUrl, '_blank', 'noopener,noreferrer')
    }
    onOpenTwitch?.(callbackUrl || '')
    // Minimizar imediatamente após abrir (o estilo cuidará de posicionar no rodapé direito)
    contextForceMinimized(true) // Forçar minimização após abrir Twitch
    // Re-medida do header após minimizar
    setTimeout(() => {
      const h = headerRef.current?.offsetHeight
      if (h) setHeaderHeight(h)
    }, 0)
  }, [activeStreamer, onOpenTwitch, setMinimized])

  const handleMinimizeToggle = useCallback(() => {
    // Permitir toggle manual sempre - usuário tem controle total
    const next = !contextIsMinimized

    // Log para debug
    console.log(`[FloatingMiniplayer] handleMinimizeToggle: ${next ? 'minimizando' : 'expandindo'}`)

    // Usar forceMinimized para garantir que a ação manual sempre funcione
    // Esta função define hasManualMinimizePreference como true
    contextForceMinimized(next)

    // Se estiver expandindo (next = false), posicionar no canto
    if (!next) {
      setTimeout(() => {
        const config = isMobile ? MOBILE_CONFIG : GLOBAL_MINIPLAYER_CONFIG
        const margin = config.margin
        const openWidth = config.defaultSize.width
        const openHeight = config.defaultSize.height
        const headerH = OPEN_HEADER_HEIGHT_PX
        const xCandidate = window.innerWidth - openWidth - margin
        const yCandidate = window.innerHeight - (openHeight + headerH) - margin
        const x = Math.max(margin, xCandidate)
        const y = Math.max(margin, yCandidate)
        setPosition({ x, y })
      }, 0)
    }

    // Re-medida assíncrona após transição de estado
    setTimeout(() => {
      const h = headerRef.current?.offsetHeight
      if (h) setHeaderHeight(h)
    }, 0)
  }, [contextIsMinimized, contextForceMinimized, isMobile, setPosition])

  // Handlers de hover para controles
  const handleMouseEnter = useCallback(() => {
    setHovering(true)
  }, [setHovering])

  const handleMouseLeave = useCallback(() => {
    setHovering(false)
  }, [setHovering])

  // Keyboard handler para acessibilidade
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClose()
    }
  }, [handleClose])

  // Debug logs para troubleshoot
  React.useEffect(() => {
    console.log('[FloatingMiniplayer] Debug:', {
      mounted,
      isVisible,
      contextIsVisible: isVisible,
      pathname: typeof window !== 'undefined' ? window.location.pathname : 'unknown'
    })
  }, [mounted, isVisible])

  // Não renderizar se não montado ou não visível (permitir loading)
  if (!mounted || !isVisible) {
    return null
  }
  // Permitir renderização sem streamer ativo; placeholder será exibido abaixo

  const playerContent = (
    <div
      ref={containerRef}
              className={cn(
          "fixed z-50 transition-all duration-100 shadow-2xl", // Transição mais rápida: 100ms
          {
            "transition-none": state.isDragging
          },
          className
        )}
      style={
        contextIsMinimized
          ? {
              right: Math.max(MOBILE_CONFIG.margin, isMobile ? MOBILE_CONFIG.margin : GLOBAL_MINIPLAYER_CONFIG.margin),
              bottom: Math.max(MOBILE_CONFIG.margin, isMobile ? MOBILE_CONFIG.margin : GLOBAL_MINIPLAYER_CONFIG.margin),
              width: Math.min(currentSize.width, window.innerWidth - (isMobile ? MOBILE_CONFIG.margin : GLOBAL_MINIPLAYER_CONFIG.margin) * 2),
              height: 40, // Altura fixa para formato de pílula perfeito
              pointerEvents: 'auto',
              maxWidth: `calc(100vw - ${(isMobile ? MOBILE_CONFIG.margin : GLOBAL_MINIPLAYER_CONFIG.margin) * 2}px)`,
              maxHeight: `calc(100vh - ${(isMobile ? MOBILE_CONFIG.margin : GLOBAL_MINIPLAYER_CONFIG.margin) * 2}px)`
            }
          : {
              left: state.position.x,
              top: state.position.y,
              width: currentSize.width,
              height: currentSize.height + headerHeight, // Adicionar altura do header
              pointerEvents: 'auto'
            }
      }
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
      role="dialog"
      aria-label={`Miniplayer: ${activeStreamer?.name || 'Stream'}`}
      aria-modal="false"
    >
      <Card className={cn(
        "group relative bg-card border-border h-full w-full overflow-hidden py-0 gap-0 transition-all duration-100", // Transição mais rápida
        contextIsMinimized ? (MINIMIZED_CARD_HAS_BORDER ? "border" : "border-0") : (OPEN_CARD_HAS_BORDER ? "border" : "border-b-0"),
        contextIsMinimized && "rounded-full shadow-lg border-0"
      )}> 
        {/* Header arrastável */}
        <CardHeader
          className={cn(
            // Header sempre visível (sem esconder em hover)
            contextIsMinimized ? "p-2 pr-14 pl-3 pb-0" : "p-2 pr-12 pl-3 pb-0",
            isMobile ? "cursor-move" : "cursor-grab active:cursor-grabbing",
            contextIsMinimized
              ? (MINIMIZED_HEADER_HAS_BORDER ? "border-b" : "border-b-0")
              : (OPEN_HEADER_HAS_BORDER ? "border-b" : "border-b-0"),
            "flex-row items-center justify-between space-y-0 transition-all duration-100", // Transição mais rápida
            contextIsMinimized && "bg-card/95 backdrop-blur-sm h-10" // Altura fixa de 40px
          )}
          style={{ height: contextIsMinimized ? 40 : headerHeight }}
          ref={headerRef}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          {/* Stream switcher - só mostrar se houver múltiplos streamers E não houver selectedStreamer específico */}
          {streamers.length > 1 && !contextSelectedStreamer && (
            <StreamSwitcher
              streamers={streamers}
              currentIndex={streamers.findIndex(s => s.id === activeStreamer?.id)}
              onStreamChange={(index: number) => {
                if (streamers[index]) {
                  switchStreamer(streamers[index])
                }
              }}
              className="flex-1 transition-all duration-100" // Transição mais rápida
              isMinimized={contextIsMinimized}
            />
          )}

          {/* Título do streamer quando não minimizado */}
          {!contextIsMinimized && (streamers.length === 1 || contextSelectedStreamer) && (
            <div className="flex-1 min-w-0 flex items-center gap-2 transition-all duration-100"> {/* Transição mais rápida */}
              {/* Avatar do streamer */}
              {activeStreamer?.avatarUrl && (
                <img
                  src={activeStreamer.avatarUrl}
                  alt={activeStreamer.name}
                  className="w-6 h-6 rounded-full object-cover border border-border flex-shrink-0 transition-all duration-100" // Transição mais rápida
                />
              )}
              {/* Informações do streamer */}
              <div className="flex-1 min-w-0 transition-all duration-100"> {/* Transição mais rápida */}
                <p className="text-sm font-medium text-card-foreground truncate">
                  {activeStreamer?.name}
                </p>
                {activeStreamer?.category && (
                  <p className="text-xs text-muted-foreground truncate">
                    {activeStreamer.category}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Conteúdo do streamer quando minimizado */}
          {contextIsMinimized && activeStreamer && (
            <div className="flex-1 min-w-0 flex items-center gap-2 transition-all duration-100"> {/* Transição mais rápida */}
              {/* Avatar do streamer no modo minimizado */}
              {activeStreamer.avatarUrl && (
                <img
                  src={activeStreamer.avatarUrl}
                  alt={activeStreamer.name}
                  className="w-6 h-6 rounded-full object-cover border border-border flex-shrink-0 transition-all duration-100" // Transição mais rápida
                />
              )}
              {/* Nome do streamer no modo minimizado */}
              <div className="flex-1 min-w-0 transition-all duration-100"> {/* Transição mais rápida */}
                <p className="text-sm font-medium text-card-foreground truncate">
                  {activeStreamer.name}
                </p>
              </div>
            </div>
          )}

          {/* Ações rápidas no topo direito: Minimizar e Abrir no Twitch */}
          <div
            className={cn(
              "absolute z-10 flex items-center gap-1",
              contextIsMinimized ? "top-2 right-3" : "top-2 right-2"
            )}
          >
            {/* Indicador de drag no mobile */}
            {isMobile && !contextIsMinimized && (
              <Tooltip side="bottom" sideOffset={8}>
                <TooltipTrigger asChild>
                  <div className="flex items-center justify-center h-6 w-6 text-muted-foreground transition-all duration-100"> {/* Transição mais rápida */}
                    <Move className="h-3 w-3" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-center">
                    <p className="font-medium">Arraste para mover</p>
                    <p className="text-xs text-muted-foreground mt-1">Posicione onde preferir</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            )}
            <Tooltip side="bottom" sideOffset={8}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    contextIsMinimized ? "h-6 w-6 p-0" : "h-6 w-6 p-0",
                    contextIsMinimized && "hover:bg-accent/50",
                    "transition-all duration-100" // Transição mais rápida
                  )}
                  aria-label={contextIsMinimized ? 'Restaurar miniplayer' : 'Minimizar e rodar em segundo plano'}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleMinimizeToggle()
                  }}
                >
                  {contextIsMinimized ? (
                    <Maximize2 className={cn(contextIsMinimized ? "h-3 w-3" : "h-3 w-3")} />
                  ) : (
                    <Minimize2 className={cn(contextIsMinimized ? "h-3 w-3" : "h-3 w-3")} />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-center">
                  <p className="font-medium">{contextIsMinimized ? 'Expandir player' : 'Minimizar player'}</p>
                  <p className="text-xs text-muted-foreground mt-1">{contextIsMinimized ? 'Clique para expandir' : 'Tecla ESC'}</p>
                </div>
              </TooltipContent>
            </Tooltip>

            <Tooltip side="bottom" sideOffset={8}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    contextIsMinimized ? "h-6 w-6 p-0" : "h-6 w-6 p-0",
                    contextIsMinimized && "hover:bg-accent/50",
                    "transition-all duration-100" // Transição mais rápida
                  )}
                  aria-label="Abrir stream em nova aba"
                  onClick={handleOpenTwitch}
                >
                  <ExternalLink className={cn(contextIsMinimized ? "h-3 w-3" : "h-3 w-3")} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-center">
                  <p className="font-medium">Abrir no Twitch</p>
                  <p className="text-xs text-muted-foreground mt-1">Chat e funcionalidades completas</p>
                </div>
              </TooltipContent>
            </Tooltip>
          </div>
        </CardHeader>

        {/* Conteúdo do player (permanece montado mesmo minimizado) */}
        <CardContent className={cn(
          'p-0 flex-1 transition-all duration-100', // Transição mais rápida
          contextIsMinimized ? 'h-0 overflow-hidden opacity-0' : 'opacity-100'
        )}> 
          <div className={cn(
            'relative transition-all duration-100', // Transição mais rápida
            contextIsMinimized ? 'h-0 overflow-hidden' : 'h-full'
          )} style={
            !contextIsMinimized 
              ? { height: currentSize.height } 
              : { height: 0, overflow: 'hidden' }
          }>
            <AspectRatio ratio={16 / 9} className={cn(
              "transition-all duration-100", // Transição mais rápida
              contextIsMinimized && "h-0 overflow-hidden"
            )}>
              {canPlay && embedUrl ? (
                <iframe
                  key={`${activeStreamer?.id}-${activeStreamer?.twitchChannel}`}
                  src={embedUrl}
                  className={cn(
                    'w-full h-full block transition-all duration-100', // Transição mais rápida
                    contextIsMinimized 
                      ? 'absolute -left-[10000px] top-auto w-[320px] h-[180px] opacity-0 pointer-events-none' // Mantém tamanho real mas fora da tela
                      : 'relative opacity-100'
                  )}
                  frameBorder="0"
                  allowFullScreen
                  scrolling="no"
                  title={`${activeStreamer?.name} - Twitch Stream`}
                  allow="autoplay; fullscreen; encrypted-media"
                  ref={iframeRef}
                />
              ) : (
                // Placeholder quando stream está offline ou não há streamers
                <div className={cn(
                  "flex items-center justify-center h-full bg-muted/50 text-muted-foreground transition-all duration-100", // Transição mais rápida
                  contextIsMinimized && "opacity-0"
                )}>
                  <div className="text-center space-y-4 w-full px-4">
                    {/* Avatar skeleton */}
                    {loading ? (
                      <div className="flex justify-center">
                        <Skeleton className="w-16 h-16 rounded-full" />
                      </div>
                    ) : activeStreamer?.avatarUrl ? (
                      <img
                        src={activeStreamer.avatarUrl}
                        alt={activeStreamer.name}
                        className="w-16 h-16 rounded-full mx-auto"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full mx-auto bg-muted flex items-center justify-center">
                        📺
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      {/* Nome skeleton */}
                      {loading ? (
                        <Skeleton className="h-5 w-32 mx-auto" />
                      ) : (
                        <p className="font-medium">{activeStreamer?.name || 'Miniplayer'}</p>
                      )}
                      
                      {/* Status skeleton */}
                      {loading ? (
                        <Skeleton className="h-4 w-24 mx-auto" />
                      ) : (
                        <p className="text-sm">
                          {streamers.length === 0
                            ? 'Nenhum streamer disponível'
                            : activeStreamer?.isOnline ? 'Carregando...' : 'Offline'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </AspectRatio>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  // Renderizar via portal no body
  return createPortal(
    <TooltipProvider openDelay={300} closeDelay={150}>
      <div 
        className="fixed inset-0 pointer-events-none z-40"
        style={{ pointerEvents: 'none' }}
      >
        {playerContent}
      </div>
    </TooltipProvider>,
    document.body
  )
}