/**
 * Avatar otimizado com lazy loading e fallbacks
 */

import React, { memo } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useLazyAvatar } from '@/hooks/useLazyImage'
import { cn } from '@/lib/utils'

interface OptimizedAvatarProps {
  src?: string
  alt?: string
  fallback?: string
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showOnlineIndicator?: boolean
  isOnline?: boolean
  priority?: boolean
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
  xl: 'w-20 h-20'
}

export const OptimizedAvatar = memo<OptimizedAvatarProps>(({
  src,
  alt = '',
  fallback,
  className,
  size = 'md',
  showOnlineIndicator = false,
  isOnline = false,
  priority = false
}) => {
  const { ref, src: lazySrc, isLoaded, isLoading } = useLazyAvatar(
    src,
    '/images/default-avatar.png' // Fallback padrão
  )

  // Se for priority, carregar imediatamente
  const finalSrc = priority ? src : lazySrc

  // Gerar fallback baseado no nome se não fornecido
  const generateFallback = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const avatarFallback = fallback || generateFallback(alt || 'U')

  return (
    <div ref={ref} className="relative inline-block">
      <Avatar 
        className={cn(
          sizeClasses[size],
          'transition-all duration-300',
          isLoading && 'animate-pulse bg-muted',
          className
        )}
      >
        {finalSrc && (
          <AvatarImage
            src={finalSrc}
            alt={alt}
            className={cn(
              'object-cover transition-opacity duration-300',
              isLoaded ? 'opacity-100' : 'opacity-0'
            )}
          />
        )}
        <AvatarFallback 
          className={cn(
            'bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-medium',
            size === 'sm' && 'text-xs',
            size === 'md' && 'text-sm',
            size === 'lg' && 'text-base',
            size === 'xl' && 'text-lg'
          )}
        >
          {avatarFallback}
        </AvatarFallback>
      </Avatar>

      {/* Indicador de status online */}
      {showOnlineIndicator && (
        <div 
          className={cn(
            'absolute -bottom-0.5 -right-0.5 rounded-full border-2 border-background',
            'transition-all duration-300',
            isOnline ? 'bg-green-500' : 'bg-muted',
            size === 'sm' && 'w-3 h-3',
            size === 'md' && 'w-4 h-4',
            size === 'lg' && 'w-5 h-5',
            size === 'xl' && 'w-6 h-6'
          )}
        >
          {isOnline && (
            <div className="w-full h-full rounded-full bg-green-400 animate-ping opacity-75" />
          )}
        </div>
      )}
    </div>
  )
})

OptimizedAvatar.displayName = 'OptimizedAvatar'

/**
 * Avatar com efeito de hover otimizado
 */
export const HoverAvatar = memo<OptimizedAvatarProps & {
  hoverScale?: boolean
  hoverGlow?: boolean
}>(({
  hoverScale = true,
  hoverGlow = false,
  className,
  ...props
}) => {
  return (
    <OptimizedAvatar
      {...props}
      className={cn(
        'cursor-pointer transition-all duration-300',
        hoverScale && 'hover:scale-110',
        hoverGlow && 'hover:shadow-lg hover:shadow-primary/25',
        className
      )}
    />
  )
})

HoverAvatar.displayName = 'HoverAvatar'

/**
 * Avatar com skeleton loading
 */
export const SkeletonAvatar = memo<{
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}>(({ size = 'md', className }) => {
  return (
    <div 
      className={cn(
        sizeClasses[size],
        'rounded-full bg-gradient-to-br from-muted/50 to-muted/20 animate-pulse',
        className
      )}
    />
  )
})

SkeletonAvatar.displayName = 'SkeletonAvatar'
