"use client"

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react'
import { getClientFirestore } from '@/lib/safeFirestore'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { TooltipProvider } from '@/components/ui/tooltip'
import { FloatingMiniplayer } from './FloatingMiniplayer'

export interface StreamerForMiniplayer {
  id: string
  name: string
  platform: string
  streamUrl: string
  avatarUrl: string
  category: string
  isOnline: boolean
  isFeatured: boolean
  twitchChannel?: string
  createdAt: string
  lastStatusUpdate: string
}

// Tipo para controlar qual player está ativo
export type ActivePlayerType = 'main' | 'miniplayer' | 'none'

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
  // Novos campos para coordenação de players
  activePlayer: ActivePlayerType
  setActivePlayer: (player: ActivePlayerType) => void
  isMainPlayerActive: boolean
}

const MiniplPlayerContext = createContext<MiniplPlayerContextValue | undefined>(undefined)

export function useMiniplPlayerContext() {
  const context = useContext(MiniplPlayerContext)
  if (!context) {
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
  
  // Novo estado para coordenação de players
  const [activePlayer, setActivePlayerState] = useState<ActivePlayerType>('main')

  const showMiniplayer = useCallback((streamer?: StreamerForMiniplayer) => {
    if (streamer) {
      setSelectedStreamer(streamer)
    }
    setIsVisible(true)
    // Quando miniplayer é mostrado, ele se torna o player ativo
    setActivePlayerState('miniplayer')
  }, [])

  const hideMiniplayer = useCallback(() => {
    setIsVisible(false)
    // Quando miniplayer é escondido, o player principal volta a ser ativo
    setActivePlayerState('main')
    // Não limpar o streamer selecionado para manter a seleção quando reativar
    // setSelectedStreamer(null) // Comentado para manter a seleção
  }, [])

  const toggleMiniplayer = useCallback(() => {
    if (isVisible) {
      hideMiniplayer()
    } else {
      showMiniplayer()
    }
  }, [isVisible, hideMiniplayer, showMiniplayer])

  const setMinimized = useCallback((minimized: boolean) => {
    setIsMinimizedState(minimized)
    // Quando miniplayer é minimizado, o player principal volta a ser ativo
    // Quando miniplayer é expandido, ele se torna ativo
    if (minimized) {
      setActivePlayerState('main')
    } else if (isVisible) {
      setActivePlayerState('miniplayer')
    }
  }, [isVisible])

  const switchStreamer = useCallback((streamer: StreamerForMiniplayer) => {
    setSelectedStreamer(streamer)
    // Quando mudamos de streamer no miniplayer, ele se torna ativo
    if (isVisible) {
      setActivePlayerState('miniplayer')
    }
  }, [isVisible])

  const setActivePlayer = useCallback((player: ActivePlayerType) => {
    setActivePlayerState(player)
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
  }, [])
    
  useEffect(() => {
    const fetchFeaturedStreamers = async () => {
      try {
        const db = getClientFirestore()
        if (!db) return
        
        // Query para streamers em destaque e online
        const q = query(
          collection(db, 'streamers'),
          where('isFeatured', '==', true),
          where('isOnline', '==', true)
        )
        
        const querySnapshot = await getDocs(q)
        
        const featuredStreamers: StreamerForMiniplayer[] = querySnapshot.docs.map(doc => {
          const data = doc.data()
          return {
            id: doc.id,
            name: data.name || '',
            platform: data.platform || '',
            streamUrl: data.streamUrl || '',
            avatarUrl: data.avatarUrl || '',
            category: data.category || '',
            isOnline: Boolean(data.isOnline),
            isFeatured: Boolean(data.isFeatured),
            twitchChannel: data.platform === 'twitch' && data.streamUrl 
              ? data.streamUrl.split('/').pop() || undefined 
              : undefined,
            createdAt: data.createdAt || '',
            lastStatusUpdate: data.lastStatusUpdate || ''
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
    loading,
    // Novos valores para coordenação
    activePlayer,
    setActivePlayer,
    isMainPlayerActive: activePlayer === 'main'
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

// Hook para componentes que querem controlar o miniplayer externamente
export function useMiniplPlayerControl() {
  return useMiniplPlayerContext()
}