"use client"

import React from 'react'
import { Button } from '@/components/ui/button'
import { RippleButton } from '@/components/animate-ui/buttons/ripple'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, ChevronRight, Users, Eye } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { StreamerDoc } from '@/hooks/useStreamers'

interface StreamNavigationProps {
  streamers: StreamerDoc[]
  selectedIndex: number
  isTransitioning: boolean
  onPrevious: () => void
  onNext: () => void
  className?: string
}

export function StreamNavigation({
  streamers,
  selectedIndex,
  isTransitioning,
  onPrevious,
  onNext,
  className
}: StreamNavigationProps) {
  const selectedStreamer = streamers[selectedIndex]

  if (streamers.length <= 1) return null

  return (
    <div className={cn("relative w-full h-full flex items-center justify-center", className)}>
      {/* Botão anterior */}
      <Tooltip>
        <TooltipTrigger asChild>
          <RippleButton
            onClick={onPrevious}
            disabled={isTransitioning}
            variant="outline"
            size="icon"
            className={cn(
              "absolute z-50 rounded-full transition-all duration-300 backdrop-blur-sm border border-border shadow-lg",
              "left-2 sm:left-4 top-1/2 -translate-y-1/2",
              "w-10 h-10 sm:w-12 sm:h-12",
              isTransitioning 
                ? "bg-background/40 cursor-not-allowed opacity-50 scale-90" 
                : "bg-background/80 hover:bg-background active:scale-95 hover:border-primary/50"
            )}
          >
            <ChevronLeft className={cn(
              "transition-all duration-200",
              "w-4 h-4 sm:w-5 sm:h-5",
              isTransitioning ? "opacity-50" : "opacity-100"
            )} />
          </RippleButton>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p>Stream anterior</p>
        </TooltipContent>
      </Tooltip>

      {/* Botão próximo */}
      <Tooltip>
        <TooltipTrigger asChild>
          <RippleButton
            onClick={onNext}
            disabled={isTransitioning}
            variant="outline"
            size="icon"
            className={cn(
              "absolute z-50 rounded-full transition-all duration-300 backdrop-blur-sm border border-border shadow-lg",
              "right-2 sm:right-4 top-1/2 -translate-y-1/2",
              "w-10 h-10 sm:w-12 sm:h-12",
              isTransitioning 
                ? "bg-background/40 cursor-not-allowed opacity-50 scale-90" 
                : "bg-background/80 hover:bg-background active:scale-95 hover:border-primary/50"
            )}
          >
            <ChevronRight className={cn(
              "transition-all duration-200",
              "w-4 h-4 sm:w-5 sm:h-5",
              isTransitioning ? "opacity-50" : "opacity-100"
            )} />
          </RippleButton>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p>Próximo stream</p>
        </TooltipContent>
      </Tooltip>

      {/* Indicador do stream atual (mobile) */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40 md:hidden">
        {selectedStreamer && (
          <div className="bg-background/90 backdrop-blur-md rounded-full px-4 py-2 border border-border shadow-lg">
            <div className="flex items-center gap-2">
              {selectedStreamer.avatarUrl && (
                <img
                  src={selectedStreamer.avatarUrl}
                  alt={selectedStreamer.name}
                  className="w-6 h-6 rounded-full object-cover"
                />
              )}
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-medium truncate max-w-[120px]">
                  {selectedStreamer.name}
                </span>
                {selectedStreamer.viewerCount && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Eye className="w-3 h-3" />
                    <span>{selectedStreamer.viewerCount.toLocaleString()}</span>
                  </div>
                )}
              </div>
              {selectedStreamer.isOnline && (
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Indicadores de posição (desktop) */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40 hidden md:flex items-center gap-2">
        {streamers.map((_, index) => (
          <button
            key={index}
            className={cn(
              "w-2 h-2 rounded-full transition-all duration-300",
              index === selectedIndex 
                ? "bg-primary w-6" 
                : "bg-muted-foreground/40 hover:bg-muted-foreground/60"
            )}
            onClick={() => {
              // Implementar navegação direta se necessário
            }}
          />
        ))}
      </div>

      {/* Info do stream atual (desktop) */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 hidden lg:block">
        {selectedStreamer && (
          <div className="bg-background/90 backdrop-blur-md rounded-lg px-4 py-2 border border-border shadow-lg">
            <div className="flex items-center gap-3">
              {selectedStreamer.avatarUrl && (
                <img
                  src={selectedStreamer.avatarUrl}
                  alt={selectedStreamer.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
              )}
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">{selectedStreamer.name}</span>
                  {selectedStreamer.isOnline && (
                    <Badge variant="outline" className="text-xs px-2 py-0 bg-green-500/10 text-green-500 border-green-500/20">
                      LIVE
                    </Badge>
                  )}
                  {selectedStreamer.isFeatured && (
                    <Badge className="text-xs px-2 py-0">
                      Destaque
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  {selectedStreamer.category && (
                    <span>{selectedStreamer.category}</span>
                  )}
                  {selectedStreamer.viewerCount && (
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      <span>{selectedStreamer.viewerCount.toLocaleString()} espectadores</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}