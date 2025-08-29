"use client"

import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Play, Users } from 'lucide-react'
import type { StreamerDoc } from '@/hooks/useStreamers'

interface StreamPreviewProps {
  streamer: StreamerDoc
  containerStyle: React.CSSProperties
  isVisible?: boolean
  onClick?: () => void
}

export function StreamPreview({
  streamer,
  containerStyle,
  isVisible = true,
  onClick
}: StreamPreviewProps) {
  const [mounted, setMounted] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [isClicked, setIsClicked] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleClick = () => {
    if (onClick && !isClicked) {
      setIsClicked(true)
      
      // Feedback tátil
      if ('vibrate' in navigator) {
        navigator.vibrate(75)
      }
      
      // Reset click state
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
      role="button"
      tabIndex={0}
      aria-label={`Assistir stream de ${streamer.name}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleClick()
        }
      }}
    >
      <div className={cn(
        "relative w-full h-full bg-gradient-to-br from-muted/80 via-muted/60 to-background/90 rounded-lg border-2 transition-all duration-300 shadow-lg overflow-hidden",
        "border-transparent group-hover:border-primary/60 group-hover:shadow-xl group-hover:shadow-primary/20",
        isClicked && "border-primary/80 shadow-2xl shadow-primary/40"
      )}>
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-background/50" />

        {/* Streamer avatar como background */}
        {streamer.avatarUrl && (
          <div className="absolute inset-0">
            <img
              src={streamer.avatarUrl}
              alt={streamer.name}
              className="w-full h-full object-cover opacity-40 blur-sm scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/50 to-background/30" />
          </div>
        )}

        {/* Content overlay */}
        <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-4">
          {/* Play icon */}
          <div className={cn(
            "mb-3 p-3 rounded-full bg-primary/20 backdrop-blur-sm border border-primary/30 transition-all duration-300",
            isHovered && !isClicked ? "scale-110 bg-primary/30" : "scale-100",
            isClicked && "scale-125 bg-primary/40"
          )}>
            <Play className={cn(
              "w-6 h-6 text-primary-foreground transition-all duration-300",
              isHovered ? "text-primary" : "text-primary-foreground",
              isClicked && "scale-110"
            )} />
          </div>

          {/* Streamer info */}
          <div className="text-center space-y-1">
            {/* Avatar pequeno */}
            {streamer.avatarUrl && (
              <div className="w-10 h-10 mx-auto mb-2 rounded-full overflow-hidden border-2 border-primary/40">
                <img
                  src={streamer.avatarUrl}
                  alt={streamer.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <h4 className={cn(
              "font-semibold text-base text-foreground truncate max-w-[120px] transition-colors duration-300",
              isHovered && "text-primary"
            )}>
              {streamer.name}
            </h4>

            {/* Category badge */}
            {streamer.category && (
              <Badge 
                variant="secondary" 
                className="text-xs px-2 py-0.5 bg-background/60 backdrop-blur-sm"
              >
                {streamer.category}
              </Badge>
            )}

            {/* Viewer count */}
            {streamer.viewerCount && (
              <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mt-1">
                <Users className="w-3 h-3" />
                <span>{streamer.viewerCount.toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>

        {/* Hover overlay */}
        <div className={cn(
          "absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 transition-all duration-300 rounded-lg",
          isHovered ? "opacity-100" : "opacity-0",
          isClicked && "from-primary/40 to-primary/10"
        )} />

        {/* Online indicator */}
        {streamer.isOnline && (
          <div className="absolute top-3 right-3 z-20">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs text-green-400 font-medium">LIVE</span>
            </div>
          </div>
        )}

        {/* Featured badge */}
        {streamer.isFeatured && (
          <div className="absolute top-3 left-3 z-20">
            <Badge className="text-xs bg-primary/90 text-primary-foreground">
              Destaque
            </Badge>
          </div>
        )}
      </div>
    </div>
  )

  return createPortal(previewContent, document.body)
}