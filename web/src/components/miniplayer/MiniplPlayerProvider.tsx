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
  const [isVisible, setIsVisible] = useState(true)
  const [selectedStreamer, setSelectedStreamer] = useState<StreamerForMiniplayer | null>(null)
  const [hasAutoShown, setHasAutoShown] = useState(false)
  const [streamers, setStreamers] = useState<StreamerForMiniplayer[]>([])
  const [loading, setLoading] = useState(true)

  const showMiniplayer = useCallback((streamer?: StreamerForMiniplayer) => {
    console.log('MiniplPlayerProvider: showMiniplayer called', streamer ? `with ${streamer.name}` : 'without specific streamer')
    if (streamer) {
      setSelectedStreamer(streamer)
    }
    setIsVisible(true)
  }, [])

  const hideMiniplayer = useCallback(() => {
    console.log('MiniplPlayerProvider: hideMiniplayer called')
    setIsVisible(false)
    setSelectedStreamer(null) // Limpar streamer selecionado
  }, [])

  const toggleMiniplayer = useCallback(() => {
    console.log('MiniplPlayerProvider: toggleMiniplayer called')
    setIsVisible(prev => !prev)
  }, [])

  const switchStreamer = useCallback((streamer: StreamerForMiniplayer) => {
    console.log('MiniplPlayerProvider: switching to streamer', streamer.name)
    setSelectedStreamer(streamer)
  }, [])

  const handleClose = useCallback(() => {
    hideMiniplayer()
  }, [hideMiniplayer])

  const handleOpenTwitch = useCallback((streamUrl: string) => {
    console.log('Opening Twitch stream:', streamUrl)
    if (streamUrl) {
      window.open(streamUrl, '_blank', 'noopener,noreferrer')
    }
  }, [])

  // Garantir visibilidade ao montar (auto-open no refresh)
  useEffect(() => {
    setIsVisible(true)
  }, [])

  // Buscar streamers e exibir automaticamente o primeiro ao iniciar
  useEffect(() => {
    if (hasAutoShown) return // Evitar múltiplas execuções

    const showFallbackMiniplayer = () => {
      // Requisito: não exibir nada se não houver destaque no banco.
      console.log('MiniplPlayerProvider: Fallback desativado — miniplayer oculto por ausência de destaques')
      setStreamers([])
      setSelectedStreamer(null)
      setIsVisible(false)
      setLoading(false)
      setHasAutoShown(true)
    }

    const parseBoolean = (value: unknown): boolean => {
      if (typeof value === 'boolean') return value
      if (typeof value === 'string') return value.toLowerCase() === 'true' || value === '1' || value.toLowerCase() === 'yes' || value.toLowerCase() === 'on'
      if (typeof value === 'number') return value === 1
      return false
    }

    const fetchAndAutoShow = async () => {
      try {
        console.log('MiniplPlayerProvider: Iniciando busca automática de streamers em destaque...')
        
        const db = getClientFirestore()
        if (!db) {
          console.warn('MiniplPlayerProvider: Firebase não configurado — miniplayer permanecerá oculto')
          // Não exibir fallback; manter oculto
          setStreamers([])
          setSelectedStreamer(null)
          setIsVisible(false)
          setLoading(false)
          setHasAutoShown(true)
          return
        }

        // Query para streamers em destaque
        // O filtro de "online" será aplicado no cliente para tolerar dados gravados como string/number
        const streamersQuery = query(
          collection(db, 'streamers'),
          where('isFeatured', '==', true)
        )

        const snapshot = await getDocs(streamersQuery)
        console.log('MiniplPlayerProvider: Query resultado:', snapshot.size, 'streamers encontrados')
        
        if (snapshot.empty) {
          console.warn('MiniplPlayerProvider: Nenhum streamer em destaque encontrado — manter miniplayer aberto com placeholder')
          setStreamers([])
          setSelectedStreamer(null)
          setLoading(false)
          setHasAutoShown(true)
          return
        }

        // Buscar o primeiro streamer online ou o primeiro disponível
        const streamers: StreamerForMiniplayer[] = []
        snapshot.forEach((doc) => {
          const data = doc.data()
          const streamer: StreamerForMiniplayer = {
            id: doc.id,
            name: data.name || '',
            platform: typeof data.platform === 'string' ? data.platform.toLowerCase() : '',
            streamUrl: data.streamUrl || '',
            avatarUrl: data.avatarUrl || '',
            category: data.category || '',
            isOnline: parseBoolean(data.isOnline),
            isFeatured: parseBoolean(data.isFeatured),
            twitchChannel: (typeof data.platform === 'string' ? data.platform.toLowerCase() : '') === 'twitch' && typeof data.streamUrl === 'string'
              ? (twitchStatusService.extractUsernameFromTwitchUrl(data.streamUrl) || undefined)
              : undefined,
            createdAt: data.createdAt || '',
            lastStatusUpdate: data.lastStatusUpdate || ''
          }
          // Apenas online
          if (streamer.isOnline) {
            streamers.push(streamer)
          }
          console.log('MiniplPlayerProvider: Streamer carregado:', streamer.name, 'online:', streamer.isOnline)
        })

        // Armazenar lista de streamers (já filtrados como online)
        setStreamers(streamers)
        setLoading(false)

        if (streamers.length > 0) {
          // Todos já são online; escolher o primeiro
          const firstOnline = streamers[0]
          
          console.log('MiniplPlayerProvider: Auto-showing miniplayer with', firstOnline.name)
          setSelectedStreamer(firstOnline)
          setIsVisible(true)
          setHasAutoShown(true)
        } else {
          console.warn('MiniplPlayerProvider: Lista de streamers vazia após processamento — manter miniplayer aberto com placeholder')
          setStreamers([])
          setSelectedStreamer(null)
          setHasAutoShown(true)
        }
      } catch (error) {
        console.error('Error fetching streamers for auto-show:', error)
        console.log('MiniplPlayerProvider: Manter miniplayer aberto com placeholder (erro no fetch)')
        setStreamers([])
        setSelectedStreamer(null)
        setLoading(false)
        setHasAutoShown(true)
      }
    }

    // Pequeno delay para garantir que a página carregou
    const timer = setTimeout(fetchAndAutoShow, 1000)
    return () => clearTimeout(timer)
  }, [hasAutoShown])

  const contextValue: MiniplPlayerContextValue = {
    isVisible,
    showMiniplayer,
    hideMiniplayer,
    toggleMiniplayer,
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
          selectedStreamer={selectedStreamer}
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