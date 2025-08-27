"use client"

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { cn } from '@/lib/utils'

interface TwitchPlayerProps {
  channel: string | null
  isVisible: boolean
  containerStyle: React.CSSProperties
  onPlayerReady?: (isReady: boolean) => void
  isPersistent?: boolean
  autoplay?: boolean
  muted?: boolean
}

export function TwitchPlayer({
  channel,
  isVisible,
  containerStyle,
  onPlayerReady,
  isPersistent = false,
  autoplay = true,
  muted = true
}: TwitchPlayerProps) {
  const [mounted, setMounted] = useState(false)
  const [iframeKey, setIframeKey] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isPlayerReady, setIsPlayerReady] = useState(false)
  const [previousChannel, setPreviousChannel] = useState<string | null>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Forçar remontagem quando canal muda
  useEffect(() => {
    if (channel && mounted && channel !== previousChannel) {
      setIsLoading(true)
      setIsPlayerReady(false)
      onPlayerReady?.(false)

      // Atualizar iframe key para forçar remontagem
      setIframeKey(prev => prev + 1)
      setPreviousChannel(channel)

      // Timeout para loading
      const loadTimeout = setTimeout(() => {
        setIsLoading(false)
      }, 800)

      return () => clearTimeout(loadTimeout)
    }
  }, [channel, mounted, previousChannel, onPlayerReady])

  // URL do embed
  const embedUrl = React.useMemo(() => {
    if (!channel || !mounted) return null

    const params = new URLSearchParams({
      channel: channel,
      autoplay: autoplay ? 'true' : 'false',
      muted: muted ? 'true' : 'false',
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
  }, [channel, mounted, autoplay, muted])

  // Handler para quando iframe carrega
  const handleIframeLoad = useCallback(() => {
    setTimeout(() => {
      setIsLoading(false)
      setIsPlayerReady(true)
      onPlayerReady?.(true)
    }, 300)

    // Trigger autoplay se habilitado
    if (autoplay && iframeRef.current) {
      const triggerAutoplay = () => {
        try {
          iframeRef.current?.click()
          iframeRef.current?.contentWindow?.postMessage(
            '{"event":"command","func":"play","args":""}', 
            '*'
          )
        } catch (e) {
          // Ignore cross-origin errors
        }
      }

      triggerAutoplay()
      setTimeout(triggerAutoplay, 500)
    }
  }, [autoplay, onPlayerReady])

  if (!mounted || !channel || !embedUrl) return null

  const playerContent = (
    <div
      className={cn(
        "fixed z-40 transition-all duration-500 ease-in-out",
        isVisible ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      )}
      style={containerStyle}
    >
      <AspectRatio ratio={16 / 9} className="w-full h-full relative">
        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center rounded-lg">
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="text-sm text-muted-foreground animate-pulse">
                Carregando stream...
              </span>
            </div>
          </div>
        )}
        
        <iframe
          ref={iframeRef}
          key={`${isPersistent ? 'persistent' : 'preview'}-${channel}-${iframeKey}`}
          src={embedUrl}
          className={cn(
            "w-full h-full block relative transition-all duration-500 ease-in-out",
            isVisible && !isLoading ? "opacity-100 scale-100" : "opacity-0 scale-95"
          )}
          frameBorder="0"
          allowFullScreen
          scrolling="no"
          title={`${channel} - Twitch Stream`}
          allow="autoplay; fullscreen; encrypted-media"
          onLoad={handleIframeLoad}
        />
      </AspectRatio>
    </div>
  )

  return createPortal(playerContent, document.body)
}