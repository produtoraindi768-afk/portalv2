"use client"

import React, { useEffect, useCallback } from 'react'
import { SectionWrapper, ContentWrapper, Typography } from '@/components/layout'
import { Separator } from '@/components/ui/separator'
import { useMiniplPlayerContext } from '@/components/miniplayer/MiniplPlayerProvider'
import { useHeaderHeight } from '@/contexts/HeaderHeightContext'
import { TwitchPlayer } from '@/components/streamers/TwitchPlayer'
import { StreamPreview } from '@/components/streamers/StreamPreview'
import { StreamNavigation } from '@/components/streamers/StreamNavigation'
import { useStreamers } from '@/hooks/useStreamers'
import { useStreamLayout } from '@/hooks/useStreamLayout'
import { cn } from '@/lib/utils'

export function StreamersSection() {
  const {
    streamers,
    selectedIndex,
    isLoading,
    isTransitioning,
    slideDirection,
    selectedStreamer,
    nextStream,
    prevStream,
    goToStream
  } = useStreamers()

  const {
    sectionRef,
    calculatePositions,
    mounted
  } = useStreamLayout()

  const {
    showMiniplayer,
    isVisible: isMiniplaying,
    setMinimized,
    isMinimized,
    setActivePlayer,
    activePlayer
  } = useMiniplPlayerContext()

  const { featuredMatchesHeight, isCollapsed } = useHeaderHeight()

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

        if (!isInStreamersSection && selectedStreamer) {
          // Usuário saiu da seção - ativar miniplayer expandido
          const streamerForMiniplayer = {
            id: selectedStreamer.id,
            name: selectedStreamer.name || '',
            platform: selectedStreamer.platform || '',
            streamUrl: selectedStreamer.streamUrl || '',
            avatarUrl: selectedStreamer.avatarUrl || '',
            category: selectedStreamer.category || '',
            isOnline: Boolean(selectedStreamer.isOnline),
            isFeatured: Boolean(selectedStreamer.isFeatured),
            twitchChannel: selectedStreamer.twitchChannel,
            createdAt: selectedStreamer.createdAt || '',
            lastStatusUpdate: selectedStreamer.lastStatusUpdate || ''
          }

          showMiniplayer(streamerForMiniplayer)
          setMinimized(false, false) // Expandido automaticamente
        } else if (isInStreamersSection && isMiniplaying) {
          // Usuário voltou para a seção - minimizar miniplayer
          setMinimized(true, false) // Minimizado automaticamente
          setActivePlayer('main')
        }
      },
      { threshold: 0.3, rootMargin: '-100px 0px' }
    )

    observer.observe(section)
    return () => observer.disconnect()
  }, [streamers, selectedStreamer, setMinimized, isMiniplaying, isMinimized, showMiniplayer, setActivePlayer])

  // Atualizar miniplayer quando seleção mudar
  useEffect(() => {
    if (isMiniplaying && selectedStreamer) {
      const streamerForMiniplayer = {
        id: selectedStreamer.id,
        name: selectedStreamer.name || '',
        platform: selectedStreamer.platform || '',
        streamUrl: selectedStreamer.streamUrl || '',
        avatarUrl: selectedStreamer.avatarUrl || '',
        category: selectedStreamer.category || '',
        isOnline: Boolean(selectedStreamer.isOnline),
        isFeatured: Boolean(selectedStreamer.isFeatured),
        twitchChannel: selectedStreamer.twitchChannel,
        createdAt: selectedStreamer.createdAt || '',
        lastStatusUpdate: selectedStreamer.lastStatusUpdate || ''
      }
      
      showMiniplayer(streamerForMiniplayer)
    }
  }, [selectedIndex, selectedStreamer, showMiniplayer, isMiniplaying])

  // Calcular posições dos streams
  const dynamicOffset = isCollapsed ? 0 : featuredMatchesHeight
  const visibleStreams = calculatePositions(streamers, selectedIndex, dynamicOffset)

  // Estado do player principal
  const isMainPlayerVisible = activePlayer === 'main' || (isMiniplaying && isMinimized)

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

  if (streamers.length === 0) {
    return (
      <SectionWrapper className="relative">
        <ContentWrapper gap="normal">
          <div className="text-center py-12">
            <Typography variant="h3" className="mb-4">
              Nenhum stream disponível
            </Typography>
            <Typography variant="body" className="text-muted-foreground">
              Não há streamers online no momento. Volte mais tarde!
            </Typography>
          </div>
        </ContentWrapper>
      </SectionWrapper>
    )
  }

  return (
    <SectionWrapper className="relative overflow-hidden">
      {/* Título da seção */}
      <ContentWrapper gap="tight" className="mb-6">
        <div className="text-center">
          <Typography variant="h2" className="mb-2">
            Streams ao Vivo
          </Typography>
          <Typography variant="body" className="text-muted-foreground">
            Assista aos melhores jogadores em ação
          </Typography>
        </div>
      </ContentWrapper>

      <Separator className="bg-border/40 mb-8" />

      {/* Container do player */}
      <div 
        ref={sectionRef} 
        className={cn(
          "relative w-full overflow-hidden transition-all duration-300",
          // Altura responsiva seguindo padrões do design system
          "h-60 sm:h-72 md:h-80 lg:h-96 xl:h-[480px]",
          isTransitioning && "ring-2 ring-primary/20 ring-offset-2 ring-offset-background"
        )}
        role="region"
        aria-label="Streams ao vivo"
        tabIndex={0}
        style={{ outline: 'none' }}
      >
        {/* Overlay de transição */}
        <div className={cn(
          "absolute inset-0 transition-all duration-300 z-20",
          isTransitioning ? "bg-black/20" : "bg-transparent"
        )} />
        
        {/* Indicador de transição */}
        {isTransitioning && (
          <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
            <div className="bg-background/90 backdrop-blur-sm rounded-lg px-4 py-2 border border-border shadow-lg">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                <Typography variant="caption" className="text-foreground">
                  Trocando stream...
                </Typography>
              </div>
            </div>
          </div>
        )}

        {/* Controles de navegação */}
        <StreamNavigation
          streamers={streamers}
          selectedIndex={selectedIndex}
          isTransitioning={isTransitioning}
          onPrevious={prevStream}
          onNext={nextStream}
        />
      </div>

      {/* Player principal */}
      {selectedStreamer && mounted && (
        <TwitchPlayer
          channel={selectedStreamer.twitchChannel || null}
          isVisible={isMainPlayerVisible}
          isPersistent={true}
          containerStyle={{
            ...visibleStreams.find(s => s.isSelected)?.containerStyle || {
              left: 0,
              top: 0,
              width: 720,
              height: 405
            },
            // Efeito de slide baseado na direção
            transform: `${visibleStreams.find(s => s.isSelected)?.containerStyle?.transform || ''} ${
              isTransitioning && slideDirection
                ? slideDirection === 'right'
                  ? 'translateX(20px)'
                  : 'translateX(-20px)'
                : ''
            }`.trim(),
            pointerEvents: isMainPlayerVisible ? 'auto' : 'none'
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
              isVisible={!isTransitioning}
              onClick={() => goToStream(streamer.id)}
            />
          )}
        </React.Fragment>
      ))}

      {/* Estatísticas da seção (opcional) */}
      <ContentWrapper gap="tight" className="mt-8">
        <div className="text-center">
          <Typography variant="caption" className="text-muted-foreground">
            {streamers.length} {streamers.length === 1 ? 'streamer online' : 'streamers online'}
            {streamers.filter(s => s.isFeatured).length > 0 && (
              <> • {streamers.filter(s => s.isFeatured).length} em destaque</>
            )}
          </Typography>
        </div>
      </ContentWrapper>

      <Separator className="bg-border/30 mt-8" />
    </SectionWrapper>
  )
}