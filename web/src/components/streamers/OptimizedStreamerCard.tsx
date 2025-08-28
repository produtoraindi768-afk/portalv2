/**
 * Componente otimizado para card de streamer
 * Usa React.memo e otimizações de performance
 */

import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { useLazyImage } from '@/hooks/useIntersectionObserver'
import { cn } from '@/lib/utils'

interface OptimizedStreamerCardProps {
  streamer: {
    id: string
    name: string
    avatarUrl?: string
    category?: string
    platform: string
  }
  isOnline: boolean
  isSelected: boolean
  onClick: () => void
  variant?: 'compact' | 'full'
  lazyLoad?: boolean
}

// Componente de avatar otimizado
const OptimizedAvatar = React.memo<{
  src?: string
  name: string
  size: 'sm' | 'md' | 'lg'
  lazyLoad: boolean
}>(({ src, name, size, lazyLoad }) => {
  const { ref, src: lazySrc, isLoaded, onLoad, onError } = useLazyImage(src || '', lazyLoad)
  
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12', 
    lg: 'w-16 h-16'
  }

  return (
    <div ref={ref} className="relative">
      <Avatar className={sizeClasses[size]}>
        {lazySrc && (
          <AvatarImage 
            src={lazySrc} 
            alt={name}
            onLoad={onLoad}
            onError={onError}
            className={cn(
              "transition-opacity duration-300",
              isLoaded ? "opacity-100" : "opacity-0"
            )}
          />
        )}
        <AvatarFallback className={cn(
          "transition-opacity duration-300",
          isLoaded ? "opacity-0" : "opacity-100"
        )}>
          {name.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
    </div>
  )
})

OptimizedAvatar.displayName = 'OptimizedAvatar'

// Componente de status badge otimizado
const StatusBadge = React.memo<{
  isOnline: boolean
  variant?: 'default' | 'compact'
}>(({ isOnline, variant = 'default' }) => {
  const isCompact = variant === 'compact'
  
  return (
    <Badge 
      variant={isOnline ? "default" : "outline"}
      className={cn(
        "font-medium transition-colors duration-200",
        isCompact ? "text-xs px-1.5 py-0.5 h-5" : "text-sm px-2 py-1",
        isOnline 
          ? "bg-green-500/10 text-green-700 border-green-500/20 dark:bg-green-500/20 dark:text-green-400" 
          : "bg-gray-500/10 text-gray-700 border-gray-500/20 dark:bg-gray-500/20 dark:text-gray-400"
      )}
    >
      {isOnline ? 'Ao vivo' : 'Offline'}
    </Badge>
  )
})

StatusBadge.displayName = 'StatusBadge'

// Componente principal otimizado
export const OptimizedStreamerCard = React.memo<OptimizedStreamerCardProps>(({
  streamer,
  isOnline,
  isSelected,
  onClick,
  variant = 'full',
  lazyLoad = true
}) => {
  const isCompact = variant === 'compact'

  // Memoizar classes CSS
  const cardClasses = React.useMemo(() => cn(
    "group relative cursor-pointer transition-all duration-200 ease-in-out",
    "border rounded-lg hover:shadow-md",
    isCompact ? "p-2" : "p-3",
    isSelected 
      ? "border-primary bg-primary/5 shadow-sm" 
      : "border-border hover:border-primary/50 hover:bg-muted/50"
  ), [isSelected, isCompact])

  const contentClasses = React.useMemo(() => cn(
    "flex items-center gap-3",
    isCompact ? "gap-2" : "gap-3"
  ), [isCompact])

  // Handler memoizado
  const handleClick = React.useCallback(() => {
    onClick()
  }, [onClick])

  return (
    <div 
      className={cardClasses}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleClick()
        }
      }}
    >
      <div className={contentClasses}>
        {/* Avatar com indicador de status */}
        <div className="relative flex-shrink-0">
          <OptimizedAvatar
            src={streamer.avatarUrl}
            name={streamer.name}
            size={isCompact ? 'sm' : 'md'}
            lazyLoad={lazyLoad}
          />
          {isOnline && (
            <div className={cn(
              "absolute -bottom-0.5 -right-0.5 rounded-full border-2 border-background bg-green-500",
              isCompact ? "w-2.5 h-2.5" : "w-3 h-3"
            )} />
          )}
        </div>

        {/* Informações do streamer */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className={cn(
              "font-medium text-foreground truncate",
              isCompact ? "text-sm" : "text-base"
            )}>
              {streamer.name}
            </h3>
            <StatusBadge 
              isOnline={isOnline} 
              variant={isCompact ? 'compact' : 'default'} 
            />
          </div>
          
          {!isCompact && streamer.category && (
            <p className="text-xs text-muted-foreground truncate mt-1">
              {streamer.category}
            </p>
          )}
          
          {!isCompact && (
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                {streamer.platform}
              </Badge>
            </div>
          )}
        </div>
      </div>

      {/* Indicador de seleção */}
      {isSelected && (
        <div className="absolute inset-0 border-2 border-primary rounded-lg pointer-events-none" />
      )}
    </div>
  )
})

OptimizedStreamerCard.displayName = 'OptimizedStreamerCard'

// Hook para otimizar lista de streamers
export function useOptimizedStreamerList(streamers: any[], getStatus: (id: string) => boolean) {
  return React.useMemo(() => {
    return streamers.map(streamer => ({
      ...streamer,
      isOnline: getStatus(streamer.id)
    }))
  }, [streamers, getStatus])
}

// Componente de lista virtualizada (para muitos streamers)
export const VirtualizedStreamerList = React.memo<{
  streamers: any[]
  selectedId?: string
  onSelect: (streamer: any) => void
  getStatus: (id: string) => boolean
  itemHeight?: number
  maxHeight?: number
}>(({ 
  streamers, 
  selectedId, 
  onSelect, 
  getStatus, 
  itemHeight = 80,
  maxHeight = 400 
}) => {
  const optimizedStreamers = useOptimizedStreamerList(streamers, getStatus)
  
  // Para listas pequenas, renderizar normalmente
  if (streamers.length <= 10) {
    return (
      <div className="space-y-2">
        {optimizedStreamers.map(streamer => (
          <OptimizedStreamerCard
            key={streamer.id}
            streamer={streamer}
            isOnline={streamer.isOnline}
            isSelected={selectedId === streamer.id}
            onClick={() => onSelect(streamer)}
            variant="compact"
          />
        ))}
      </div>
    )
  }

  // Para listas grandes, implementar virtualização simples
  const [visibleRange, setVisibleRange] = React.useState({ start: 0, end: 10 })
  
  const handleScroll = React.useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop
    const start = Math.floor(scrollTop / itemHeight)
    const end = Math.min(start + Math.ceil(maxHeight / itemHeight) + 2, streamers.length)
    
    setVisibleRange({ start, end })
  }, [itemHeight, maxHeight, streamers.length])

  const visibleStreamers = optimizedStreamers.slice(visibleRange.start, visibleRange.end)

  return (
    <div 
      className="overflow-auto"
      style={{ maxHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: streamers.length * itemHeight, position: 'relative' }}>
        <div 
          style={{ 
            transform: `translateY(${visibleRange.start * itemHeight}px)`,
            position: 'absolute',
            width: '100%'
          }}
        >
          {visibleStreamers.map((streamer, index) => (
            <div key={streamer.id} style={{ height: itemHeight }}>
              <OptimizedStreamerCard
                streamer={streamer}
                isOnline={streamer.isOnline}
                isSelected={selectedId === streamer.id}
                onClick={() => onSelect(streamer)}
                variant="compact"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
})

VirtualizedStreamerList.displayName = 'VirtualizedStreamerList'
