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
import { StreamSwitcher } from '@/components/miniplayer/StreamSwitcher'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Minimize2, Maximize2, ExternalLink, Move } from 'lucide-react'

export function FloatingMiniplayer({ className, onClose, onOpenTwitch, selectedStreamer }: MiniplPlayerProps) {
  // Variáveis de estilo do topo por estado
  const OPEN_HEADER_HEIGHT_PX = 48
  const MINIMIZED_HEADER_HEIGHT_PX = 38
  const OPEN_HEADER_HAS_BORDER = true
  const MINIMIZED_HEADER_HAS_BORDER = true
  const OPEN_CARD_HAS_BORDER = true
  const MINIMIZED_CARD_HAS_BORDER = false
  const {
    isVisible,
    hideMiniplayer,
    streamers: contextStreamers,
    selectedStreamer: contextSelectedStreamer,
    switchStreamer,
    loading: contextLoading
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

  // Garantir que o portal só renderize no cliente
  useEffect(() => {
    setMounted(true)
  }, [])

  // Forçar iniciar ABERTO na primeira montagem visível
  useEffect(() => {
    if (mounted && isVisible && !hasForcedOpenRef.current) {
      hasForcedOpenRef.current = true
      setMinimized(false)
    }
  }, [mounted, isVisible, setMinimized])

  // Usar dados do contexto
  const streamers = contextStreamers
  const loading = contextLoading
  const activeStreamer = selectedStreamer || contextSelectedStreamer || (streamers.length > 0 ? streamers[0] : null)
  
  const embedUrl = React.useMemo(() => {
    if (!activeStreamer || activeStreamer.platform !== 'twitch' || !activeStreamer.twitchChannel) {
      return null
    }
    const params = new URLSearchParams({
      channel: activeStreamer.twitchChannel,
      autoplay: 'true',
      muted: state.isMuted.toString(),
      // Deixe os controles padrão do player Twitch (evita bloqueios de autoplay em alguns navegadores)
      // e melhora UX para pausar/mutar rápido
      controls: 'true'
    })
    const parents = new Set<string>()
    if (typeof window !== 'undefined' && window.location.hostname) {
      parents.add(window.location.hostname)
    }
    parents.add('localhost')
    parents.forEach((p) => params.append('parent', p))
    return `https://player.twitch.tv/?${params.toString()}`
  }, [activeStreamer, state.isMuted])

  const canPlay = Boolean(activeStreamer && activeStreamer.platform === 'twitch' && activeStreamer.isOnline && activeStreamer.twitchChannel)

  // Atualiza a altura conforme estado (aberto/minimizado)
  useEffect(() => {
    setHeaderHeight(state.isMinimized ? MINIMIZED_HEADER_HEIGHT_PX : OPEN_HEADER_HEIGHT_PX)
  }, [state.isMinimized])

  // Handlers para arrastar
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Não permitir arrastar quando minimizado (posição fixa no rodapé)
    if (state.isMinimized) return
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
  }, [setDragging])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragRef.current.isDragging) return

    e.preventDefault()

    const newPosition: Position = {
      x: e.clientX - dragRef.current.offset.x,
      y: e.clientY - dragRef.current.offset.y
    }

    // Aplicar limites da tela
    const margin = 16 // CONFIG.margin
    const maxX = window.innerWidth - state.size.width - margin
    const visibleBodyHeight = (state.isMinimized ? 0 : state.size.height)
    const maxY = window.innerHeight - (visibleBodyHeight + headerHeight) - margin

    newPosition.x = Math.max(margin, Math.min(maxX, newPosition.x))
    newPosition.y = Math.max(margin, Math.min(maxY, newPosition.y))

    setPosition(newPosition)
  }, [state.size, setPosition])

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
    if (state.isMinimized) return
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
  }, [setDragging])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!dragRef.current.isDragging) return

    e.preventDefault()

    const touch = e.touches[0]
    const newPosition: Position = {
      x: touch.clientX - dragRef.current.offset.x,
      y: touch.clientY - dragRef.current.offset.y
    }

    // Aplicar limites da tela
    const margin = 16
    const maxX = window.innerWidth - state.size.width - margin
    const visibleBodyHeight = (state.isMinimized ? 0 : state.size.height)
    const maxY = window.innerHeight - (visibleBodyHeight + headerHeight) - margin

    newPosition.x = Math.max(margin, Math.min(maxX, newPosition.x))
    newPosition.y = Math.max(margin, Math.min(maxY, newPosition.y))

    setPosition(newPosition)
  }, [state.size, setPosition])

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
    setMinimized(true)
    // Re-medida do header após minimizar
    setTimeout(() => {
      const h = headerRef.current?.offsetHeight
      if (h) setHeaderHeight(h)
    }, 0)
  }, [activeStreamer, onOpenTwitch, setMinimized])

  const handleMinimizeToggle = useCallback(() => {
    const next = !state.isMinimized
    setMinimized(next)
    // Ao restaurar, posicionar ancorado ao canto inferior direito respeitando o tamanho aberto
    if (!next) {
      setTimeout(() => {
        const margin = GLOBAL_MINIPLAYER_CONFIG.margin
        const openWidth = GLOBAL_MINIPLAYER_CONFIG.defaultSize.width
        const openHeight = GLOBAL_MINIPLAYER_CONFIG.defaultSize.height
        const headerH = OPEN_HEADER_HEIGHT_PX
        const xCandidate = window.innerWidth - openWidth - margin
        const yCandidate = window.innerHeight - (openHeight + headerH) - margin
        const x = Math.max(margin, xCandidate)
        const y = Math.max(margin, yCandidate)
        setPosition({ x, y })
      }, 0)
    }
    // Re-medida assíncrona após transição de estado para ajustar altura do header corretamente
    setTimeout(() => {
      const h = headerRef.current?.offsetHeight
      if (h) setHeaderHeight(h)
    }, 0)
  }, [state.isMinimized, setMinimized])

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

  // Não renderizar se não montado ou não visível (permitir loading)
  if (!mounted || !isVisible) {
    console.log('FloatingMiniplayer not rendering:', { mounted, isVisible, loading })
    return null
  }
  // Permitir renderização sem streamer ativo; placeholder será exibido abaixo

  console.log('FloatingMiniplayer rendering with:', {
    streamersCount: streamers.length,
    activeStreamer: activeStreamer?.name,
    selectedStreamer: selectedStreamer?.name,
    contextSelectedStreamer: contextSelectedStreamer?.name
  })

  const playerContent = (
    <div
      ref={containerRef}
              className={cn(
          "fixed z-50 transition-all duration-200 shadow-2xl",
          {
            "transition-none": state.isDragging
          },
          className
        )}
      style={
        state.isMinimized
          ? {
              right: GLOBAL_MINIPLAYER_CONFIG.margin,
              bottom: GLOBAL_MINIPLAYER_CONFIG.margin,
              width: state.size.width,
              pointerEvents: 'auto'
            }
          : {
              left: state.position.x,
              top: state.position.y,
              width: state.size.width,
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
        "group relative bg-card border-border h-full w-full overflow-hidden py-0 gap-0",
        state.isMinimized ? (MINIMIZED_CARD_HAS_BORDER ? "border" : "border-0") : (OPEN_CARD_HAS_BORDER ? "border" : "border-0"),
        state.isMinimized && "rounded-full"
      )}> 
        {/* Header arrastável */}
        <CardHeader
          className={cn(
            // Header sempre visível (sem esconder em hover)
            "p-2 pr-12 pl-3 pb-0",
            isMobile ? "cursor-move" : "cursor-grab active:cursor-grabbing",
            state.isMinimized
              ? (MINIMIZED_HEADER_HAS_BORDER ? "border-b" : "border-b-0")
              : (OPEN_HEADER_HAS_BORDER ? "border-b" : "border-b-0"),
            "flex-row items-center justify-between space-y-0"
          )}
          style={{ height: headerHeight }}
          ref={headerRef}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          {/* Stream switcher - só mostrar se houver múltiplos streamers */}
          {streamers.length > 1 && (
            <StreamSwitcher
              streamers={streamers}
              currentIndex={streamers.findIndex(s => s.id === activeStreamer?.id)}
              onStreamChange={(index: number) => {
                if (streamers[index]) {
                  switchStreamer(streamers[index])
                }
              }}
              className="flex-1"
              isMinimized={state.isMinimized}
            />
          )}

          {/* Título do streamer quando não minimizado */}
          {!state.isMinimized && streamers.length === 1 && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-card-foreground truncate">
                {activeStreamer?.name}
              </p>
              {activeStreamer?.category && (
                <p className="text-xs text-muted-foreground truncate">
                  {activeStreamer.category}
                </p>
              )}
            </div>
          )}

          {/* Indicador compacto removido: em modo minimizado usamos apenas o StreamSwitcher (3 avatares +N) */}

          {/* Ações rápidas no topo direito: Minimizar e Abrir no Twitch */}
          <div
            className={cn(
              "absolute top-2 right-2 z-10 flex items-center gap-1"
            )}
          >
            {/* Indicador de drag no mobile */}
            {isMobile && !state.isMinimized && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center justify-center h-6 w-6 text-muted-foreground">
                    <Move className="h-3 w-3" />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Arraste para mover</p>
                </TooltipContent>
              </Tooltip>
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  aria-label={state.isMinimized ? 'Restaurar miniplayer' : 'Minimizar e rodar em segundo plano'}
                  onClick={handleMinimizeToggle}
                >
                  {state.isMinimized ? (
                    <Maximize2 className="h-3 w-3" />
                  ) : (
                    <Minimize2 className="h-3 w-3" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>{state.isMinimized ? 'Restaurar' : 'Minimizar (executar em segundo plano)'}</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  aria-label="Abrir stream em nova aba"
                  onClick={handleOpenTwitch}
                >
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Abrir no Twitch</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </CardHeader>

        {/* Conteúdo do player (permanece montado mesmo minimizado) */}
        <CardContent className={cn('p-0 flex-1', state.isMinimized && 'h-0 overflow-hidden')}> 
          <div className={cn('relative', state.isMinimized && 'h-0 overflow-hidden')} style={!state.isMinimized ? { height: state.size.height } : undefined}> 
            <AspectRatio ratio={16 / 9}>
              {canPlay && embedUrl ? (
                <iframe
                  key={activeStreamer?.id}
                  src={embedUrl}
                  className={cn('w-full h-full block', state.isMinimized && 'absolute -left-[10000px] top-auto w-[1px] h-[1px] opacity-0 pointer-events-none')}
                  frameBorder="0"
                  allowFullScreen
                  scrolling="no"
                  title={`${activeStreamer?.name} - Twitch Stream`}
                  allow="autoplay; fullscreen"
                />
              ) : (
                // Placeholder quando stream está offline ou não há streamers
                <div className="flex items-center justify-center h-full bg-muted/50 text-muted-foreground">
                  <div className="text-center space-y-2">
                    {activeStreamer?.avatarUrl ? (
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
                    <div>
                      <p className="font-medium">{activeStreamer?.name || 'Miniplayer'}</p>
                      <p className="text-sm">
                        {streamers.length === 0
                          ? 'Nenhum streamer disponível'
                          : activeStreamer?.isOnline ? 'Carregando...' : 'Offline'}
                      </p>
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
    <div 
      className="fixed inset-0 pointer-events-none z-40"
      style={{ pointerEvents: 'none' }}
    >
      {playerContent}
    </div>,
    document.body
  )
}