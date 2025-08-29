"use client"

import { useState, useEffect, useCallback } from 'react'
import { collection, getDocs, query } from "firebase/firestore"
import { getClientFirestore } from "@/lib/safeFirestore"
import { twitchStatusService } from "@/lib/twitch-status"

export type StreamerDoc = {
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
  twitchChannel?: string
  bio?: string
}

export function useStreamers() {
  const [streamers, setStreamers] = useState<StreamerDoc[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null)

  // Carregar streamers do Firebase
  useEffect(() => {
    const loadStreamers = async () => {
      const db = getClientFirestore()
      if (!db) {
        setIsLoading(false)
        return
      }

      try {
        const q = query(collection(db, "streamers"))
        const snap = await getDocs(q)
        const data: StreamerDoc[] = snap.docs.map((doc) => {
          const raw = doc.data() as Record<string, unknown>
          const streamUrl = typeof raw.streamUrl === "string" ? raw.streamUrl : ""
          const twitchChannel = raw.platform === 'twitch' && streamUrl
            ? twitchStatusService.extractUsernameFromTwitchUrl(streamUrl) || undefined
            : undefined

          return {
            id: doc.id,
            name: typeof raw.name === "string" ? raw.name : "",
            platform: typeof raw.platform === "string" ? raw.platform.toLowerCase() : "",
            streamUrl,
            avatarUrl: typeof raw.avatarUrl === "string" ? raw.avatarUrl : "",
            category: typeof raw.category === "string" ? raw.category : "",
            isOnline: Boolean(raw.isOnline),
            isFeatured: Boolean(raw.isFeatured),
            createdAt: typeof raw.createdAt === "string" ? raw.createdAt : undefined,
            lastStatusUpdate: typeof raw.lastStatusUpdate === "string" ? raw.lastStatusUpdate : undefined,
            viewerCount: typeof raw.viewerCount === "number" ? raw.viewerCount : Math.floor(Math.random() * 500) + 50,
            language: typeof raw.language === "string" ? raw.language : "Português",
            twitchChannel,
            bio: typeof raw.bio === "string" ? raw.bio : undefined
          }
        })
        
        const featuredStreamers = data.filter(s => s.isFeatured)
        const sortedStreamers = featuredStreamers.sort((a, b) => {
          // Priorizar streamers online
          if (a.isOnline && !b.isOnline) return -1
          if (!a.isOnline && b.isOnline) return 1
          return 0
        })
        
        setStreamers(sortedStreamers)
        
        // Selecionar primeiro streamer featured
        const featuredIndex = sortedStreamers.findIndex(s => s.isFeatured)
        if (featuredIndex !== -1) {
          setSelectedIndex(featuredIndex)
        }
      } catch (error) {
        console.error('Erro ao carregar streamers:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadStreamers()
  }, [])

  // Navegação entre streamers
  const navigateToStream = useCallback((direction: 'next' | 'prev' | number) => {
    if (isTransitioning) return

    // Feedback tátil para dispositivos móveis
    if ('vibrate' in navigator) {
      navigator.vibrate(50)
    }
    
    setIsTransitioning(true)
    
    if (typeof direction === 'number') {
      // Ir para índice específico
      setSelectedIndex(direction)
      setSlideDirection(direction > selectedIndex ? 'right' : 'left')
    } else {
      // Navegação sequencial
      setSlideDirection(direction === 'next' ? 'right' : 'left')
      
      setTimeout(() => {
        setSelectedIndex((prev) => 
          direction === 'next' 
            ? (prev + 1) % streamers.length
            : (prev - 1 + streamers.length) % streamers.length
        )
      }, 100)
    }
    
    // Reset transition state
    setTimeout(() => {
      setIsTransitioning(false)
      setSlideDirection(null)
    }, 1200)
  }, [isTransitioning, selectedIndex, streamers.length])

  const nextStream = useCallback(() => {
    navigateToStream('next')
  }, [navigateToStream])

  const prevStream = useCallback(() => {
    navigateToStream('prev')
  }, [navigateToStream])

  const goToStream = useCallback((streamerId: string) => {
    const targetIndex = streamers.findIndex(s => s.id === streamerId)
    if (targetIndex !== -1 && targetIndex !== selectedIndex) {
      navigateToStream(targetIndex)
    }
  }, [navigateToStream, streamers, selectedIndex])

  return {
    streamers,
    selectedIndex,
    isLoading,
    isTransitioning,
    slideDirection,
    selectedStreamer: streamers[selectedIndex] || null,
    nextStream,
    prevStream,
    goToStream
  }
}