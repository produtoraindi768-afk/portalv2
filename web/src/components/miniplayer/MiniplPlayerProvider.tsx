"use client"

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { getClientFirestore } from '@/lib/safeFirestore'
import { twitchStatusService } from '@/lib/twitch-status'
import { FloatingMiniplayer } from './FloatingMiniplayer'
import { TooltipProvider } from '@/components/ui/tooltip'

import type { StreamerForMiniplayer } from '@/lib/miniplayer-types'

interface MiniplPlayerContextValue {
  isVisible: boolean
  showMiniplayer: (streamer?: StreamerForMiniplayer) => void
  hideMiniplayer: () => void
  toggleMiniplayer: () => void
  setMinimized: (minimized: boolean) => void
  isMinimized: boolean
  streamers: StreamerForMiniplayer[]
  selectedStreamer: StreamerForMiniplayer | null
  switchStreamer: (streamer: StreamerForMiniplayer) => void
  loading: boolean
}

const MiniplPlayerContext = createContext<MiniplPlayerContextValue | undefined>(undefined)

export function useMiniplPlayerContext() {
  const context = useContext(MiniplPlayerContext)
  if (context === undefined) {
    throw new Error('useMiniplPlayerContext must be used within a MiniplPlayerProvider')
  }
  return context
}

interface MiniplPlayerProviderProps {
  children?: React.ReactNode
}

export function MiniplPlayerProvider({ children }: MiniplPlayerProviderProps = {}) {
  const [isVisible, setIsVisible] = useState(false) // Iniciar OCULTO
  const [selectedStreamer, setSelectedStreamer] = useState<StreamerForMiniplayer | null>(null)
  const [hasAutoShown, setHasAutoShown] = useState(true) // Desabilitar auto-show permanentemente
  const [streamers, setStreamers] = useState<StreamerForMiniplayer[]>([])
  const [loading, setLoading] = useState(false) // Não precisa loading se não vai auto-mostrar
  const [isMinimizedState, setIsMinimizedState] = useState(false) // Controlar a minimização

  const showMiniplayer = useCallback((streamer?: StreamerForMiniplayer) => {
    if (streamer) {
      setSelectedStreamer(streamer)
    }
    setIsVisible(true)
  }, [])

  const hideMiniplayer = useCallback(() => {
    setIsVisible(false)
    // Não limpar o streamer selecionado para manter a seleção quando reativar
    // setSelectedStreamer(null) // Comentado para manter a seleção
  }, [])

  const toggleMiniplayer = useCallback(() => {
    setIsVisible(prev => !prev)
  }, [])

  const setMinimized = useCallback((minimized: boolean) => {
    setIsMinimizedState(minimized)
  }, [])

  const switchStreamer = useCallback((streamer: StreamerForMiniplayer) => {
    setSelectedStreamer(streamer)
  }, [])

  const handleClose = useCallback(() => {
    hideMiniplayer()
  }, [hideMiniplayer])

  const handleOpenTwitch = useCallback((streamUrl: string) => {
    if (streamUrl) {
      window.open(streamUrl, '_blank', 'noopener,noreferrer')
    }
  }, [])

  // Buscar streamers desabilitado - miniplayer controlado apenas pela StreamersSection
  useEffect(() => {
    // Auto-show desabilitado - player flutuante apenas sob demanda
    setLoading(false)
    setHasAutoShown(true)
    
    // Buscar streamers em destaque para seleção inicial
    const fetchFeaturedStreamers = async () => {
      try {
        const db = getClientFirestore()
        if (!db) return
        
        const streamersQuery = query(
          collection(db, 'streamers'),
          where('isFeatured', '==', true)
        )
        
        const snapshot = await getDocs(streamersQuery)
        const featuredStreamers: StreamerForMiniplayer[] = []
        
        snapshot.forEach((doc) => {
          const data = doc.data()
          const streamer: StreamerForMiniplayer = {
            id: doc.id,
            name: data.name || '',
            platform: data.platform || '',
            streamUrl: data.streamUrl || '',
            avatarUrl: data.avatarUrl || '',
            category: data.category || '',
            isOnline: typeof data.isOnline === 'boolean' ? data.isOnline : String(data.isOnline).toLowerCase() === 'true' || data.isOnline === 1,
            isFeatured: typeof data.isFeatured === 'boolean' ? data.isFeatured : String(data.isFeatured).toLowerCase() === 'true' || data.isFeatured === 1,
            twitchChannel: data.platform === 'twitch' ? (twitchStatusService.extractUsernameFromTwitchUrl(data.streamUrl) || undefined) : undefined,
            createdAt: data.createdAt || '',
            lastStatusUpdate: data.lastStatusUpdate || ''
          }
          
          if (streamer.name && streamer.streamUrl && streamer.isOnline) {
            featuredStreamers.push(streamer)
          }
        })
        
        setStreamers(featuredStreamers)
        
        // Ordenar streamers: primeiro os em destaque, depois os demais
        const sortedStreamers = featuredStreamers.sort((a, b) => {
          if (a.isFeatured && !b.isFeatured) return -1
          if (!a.isFeatured && b.isFeatured) return 1
          return 0
        })
        
        setStreamers(sortedStreamers)
        
        // Selecionar o primeiro streamer em destaque disponível
        if (sortedStreamers.length > 0 && !selectedStreamer) {
          setSelectedStreamer(sortedStreamers[0])
        }
      } catch (err) {
        console.warn('Erro ao buscar streamers em destaque:', err)
      }
    }
    
    fetchFeaturedStreamers()
  }, [selectedStreamer])

  const contextValue: MiniplPlayerContextValue = {
    isVisible,
    showMiniplayer,
    hideMiniplayer,
    toggleMiniplayer,
    setMinimized,
    isMinimized: isMinimizedState,
    streamers,
    selectedStreamer,
    switchStreamer,
    loading
  }

  return (
    <MiniplPlayerContext.Provider value={contextValue}>
      {children}
      <TooltipProvider>
        <FloatingMiniplayer
          onClose={handleClose}
          onOpenTwitch={handleOpenTwitch}
        />
      </TooltipProvider>
    </MiniplPlayerContext.Provider>
  )
}

// Hook para componentes que querem controlar o miniplayer externalmente
export function useMiniplPlayerControl() {
  return useMiniplPlayerContext()
}

// Export default para facilitar importação
export default MiniplPlayerProvider