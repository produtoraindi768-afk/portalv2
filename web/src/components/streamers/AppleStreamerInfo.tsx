"use client"

import { Badge } from "@/components/ui/badge"
import { Typography } from "@/components/layout"
import { Users, Eye } from "lucide-react"
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

interface AppleStreamerInfoProps {
  streamer: StreamerDoc
  className?: string
  position?: 'left' | 'right' | 'center'
}

export function AppleStreamerInfo({ streamer, className, position = 'center' }: AppleStreamerInfoProps) {
  if (!streamer) return null

  // Definir posicionamento baseado na prop position
  const getPositionClasses = () => {
    switch (position) {
      case 'left':
        return {
          container: "fixed top-1/2 left-4 md:left-6 -translate-y-1/2 z-[52] max-w-xs w-60",
          direction: "flex-col items-start text-left"
        }
      case 'right':
        return {
          container: "fixed top-1/2 right-4 md:right-6 -translate-y-1/2 z-[52] max-w-xs w-60",
          direction: "flex-col items-end text-right"
        }
      default: // center
        return {
          container: "absolute bottom-6 left-1/2 -translate-x-1/2 z-[52] max-w-sm mx-auto",
          direction: "flex-col items-center text-center"
        }
    }
  }

  const { container, direction } = getPositionClasses()

  return (
    <div className={cn(
      // Posicionamento dinâmico baseado na prop
      container,
      // Apple-style glass morphism
      "bg-background/80 backdrop-blur-xl border border-border/20 rounded-2xl",
      // Apple-style shadow and hover effects  
      "shadow-lg hover:shadow-xl transition-all duration-500 ease-out",
      // Layout
      "px-6 py-4",
      className
    )}>
      {/* Streamer Information */}
      <div className={cn("flex gap-3", direction)}>
        {/* Avatar and Status */}
        <div className="relative">
          {streamer.avatarUrl ? (
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={streamer.avatarUrl}
                alt={streamer.name || "Streamer"}
                className="w-12 h-12 rounded-full object-cover border-2 border-border/30 transition-all duration-300 hover:border-primary/50"
              />
              {/* Online status indicator */}
              {streamer.isOnline && (
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-background animate-pulse" />
              )}
            </div>
          ) : (
            <div className="w-12 h-12 rounded-full bg-muted/50 border-2 border-border/30 flex items-center justify-center">
              <Users className="w-6 h-6 text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Streamer Name - Apple typography */}
        <div className={cn("space-y-1", position === 'center' ? 'text-center' : position === 'left' ? 'text-left' : 'text-right')}>
          <Typography 
            variant="h4" 
            className="font-medium tracking-tight leading-tight text-foreground hover:text-primary transition-colors duration-300"
            maxWidth="none"
          >
            {streamer.name || 'Streamer Desconhecido'}
          </Typography>
          
          {/* Category and Stats */}
          <div className={cn(
            "flex items-center gap-3 text-xs",
            position === 'center' ? 'justify-center' : position === 'left' ? 'justify-start' : 'justify-end'
          )}>
            {/* Category Badge */}
            {streamer.category && (
              <Badge 
                variant="secondary" 
                className="rounded-full px-2 py-1 text-xs font-light tracking-wide bg-muted/40 border-0 hover:bg-primary/10 hover:text-primary transition-colors duration-300"
              >
                {streamer.category}
              </Badge>
            )}
            
            {/* Viewer Count */}
            {streamer.viewerCount && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <Eye className="w-3 h-3" />
                <Typography variant="caption" className="font-light">
                  {streamer.viewerCount.toLocaleString()}
                </Typography>
              </div>
            )}
          </div>
        </div>



        {/* Apple-style subtle separator */}
        <div className="w-8 h-px bg-gradient-to-r from-transparent via-border/40 to-transparent" />

        {/* Platform indicator */}
        <Typography 
          variant="caption" 
          className="font-light text-muted-foreground/70 tracking-wide uppercase text-xs"
        >
          {streamer.platform === 'twitch' ? 'Twitch' : streamer.platform || 'Plataforma'}
        </Typography>
      </div>

      {/* Apple-style glow effect on hover */}
      <div className="absolute inset-0 rounded-2xl bg-primary/5 opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
    </div>
  )
}