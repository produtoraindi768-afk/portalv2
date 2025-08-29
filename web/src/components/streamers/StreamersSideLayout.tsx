"use client"

import { AppleStreamerInfo } from "@/components/streamers/AppleStreamerInfo"

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

interface StreamersSideLayoutProps {
  streamers: StreamerDoc[]
  selectedIndex: number
  isTransitioning?: boolean
}

export function StreamersSideLayout({ 
  streamers, 
  selectedIndex, 
  isTransitioning = false 
}: StreamersSideLayoutProps) {
  // Só renderizar se tiver pelo menos 2 streamers e não estiver em transição
  if (streamers.length < 2 || isTransitioning) return null

  const currentStreamer = streamers[selectedIndex]
  const leftIndex = (selectedIndex - 1 + streamers.length) % streamers.length
  const rightIndex = (selectedIndex + 1) % streamers.length
  
  const leftStreamer = streamers[leftIndex]
  const rightStreamer = streamers[rightIndex]

  return (
    <>
      {/* Layout responsivo: mobile usa bottom, desktop usa sides */}
      <div className="block lg:hidden">
        {/* Mobile: Cards na parte inferior em linha */}
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[52] flex gap-3">
          {leftStreamer && (
            <AppleStreamerInfo
              streamer={leftStreamer}
              position="center"
              className="transform transition-all duration-500 ease-out scale-75"
            />
          )}
          {rightStreamer && (
            <AppleStreamerInfo
              streamer={rightStreamer}
              position="center"
              className="transform transition-all duration-500 ease-out scale-75"
            />
          )}
        </div>
      </div>

      {/* Desktop: Cards nas laterais */}
      <div className="hidden lg:block">
        {/* Streamer da esquerda */}
        {leftStreamer && (
          <AppleStreamerInfo
            streamer={leftStreamer}
            position="left"
            className="transform transition-all duration-500 ease-out hover:translate-x-1"
          />
        )}

        {/* Streamer da direita */}
        {rightStreamer && (
          <AppleStreamerInfo
            streamer={rightStreamer}
            position="right"
            className="transform transition-all duration-500 ease-out hover:-translate-x-1"
          />
        )}
      </div>
    </>
  )
}