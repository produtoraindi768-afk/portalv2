"use client"

import { useCallback, useEffect, useReducer, useMemo, useState, useRef } from 'react'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { getClientFirestore } from '@/lib/safeFirestore'
import { twitchStatusService } from '@/lib/twitch-status'
import { useIsMobile } from './use-mobile'
import type {
  MiniplPlayerState,
  MiniplPlayerAction,
  StreamerForMiniplayer,
  Position,
  DockedCorner,
  SnapZone,
  UseMiniplPlayerReturn,
  MiniplPlayerLocalStorage,
  MINIPLAYER_CONFIG,
  STORAGE_KEYS
} from '@/lib/miniplayer-types'

// Import da configuração
const CONFIG: typeof MINIPLAYER_CONFIG = {
  // Dimensões do player ABERTO
  defaultSize: { width: 480, height: 270 },
  // Dimensões do player MINIMIZADO (altere para controlar a largura da barra)
  minimizedSize: { width: 220, height: 180 },
  aspectRatio: 16 / 9,
  snapToCorners: true,
  margin: 16,
  autoHide: false,
  autoHideDelay: 3000,
  twitchParentDomains: ['localhost']
}

const KEYS: typeof STORAGE_KEYS = {
  MINIPLAYER_STATE: 'miniplayer-state',
  MINIPLAYER_VERSION: '1.0.0'
}

// Estado inicial - usando função para evitar problemas no servidor
const getInitialState = (): MiniplPlayerState => ({
  position: {
    x: typeof window !== 'undefined' ? window.innerWidth - CONFIG.defaultSize.width - CONFIG.margin : 100,
    y: typeof window !== 'undefined' ? Math.max(CONFIG.margin, window.innerHeight - (CONFIG.defaultSize.height + 40) - CONFIG.margin) : CONFIG.margin
  },
  size: CONFIG.defaultSize,
  isDragging: false,
  isMinimized: false,
  isHovering: false,
  currentStreamIndex: 0,
  isMuted: true, // Começar mutado por padrão
  volume: 50,
  isVisible: false
})

// Reducer para gerenciar estado
function miniplPlayerReducer(state: MiniplPlayerState, action: MiniplPlayerAction): MiniplPlayerState {
  switch (action.type) {
    case 'SET_POSITION':
      return { ...state, position: action.payload }
    
    case 'SET_DRAGGING':
      return { ...state, isDragging: action.payload }
    
    case 'SET_MINIMIZED':
      return { 
        ...state, 
        isMinimized: action.payload,
        size: action.payload ? CONFIG.minimizedSize : CONFIG.defaultSize
      }
    
    case 'SET_HOVERING':
      return { ...state, isHovering: action.payload }
    
    case 'SET_STREAM':
      return { 
        ...state, 
        currentStreamIndex: action.payload.index,
        currentStreamId: action.payload.streamId
      }
    
    case 'SET_MUTED':
      return { ...state, isMuted: action.payload }
    
    case 'SET_VOLUME':
      return { ...state, volume: Math.max(0, Math.min(100, action.payload)) }
    
    case 'SET_VISIBLE':
      return { ...state, isVisible: action.payload }
    
    case 'SET_DOCKED_CORNER':
      return { ...state, dockedCorner: action.payload }
    
    case 'RESET_STATE':
      return { ...getInitialState(), isVisible: false }
    
    case 'LOAD_FROM_STORAGE':
      return { ...state, ...action.payload }
    
    default:
      return state
  }
}

// Utility: extrair canal do Twitch da URL
function extractTwitchChannel(streamUrl: string): string | null {
  return twitchStatusService.extractUsernameFromTwitchUrl(streamUrl)
}

// Utility: gerar domínios parent para Twitch
function getTwitchParentDomains(): string[] {
  const domains = [...CONFIG.twitchParentDomains]
  
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname
    if (!domains.includes(hostname)) {
      domains.push(hostname)
    }
  }
  
  return domains
}

export function useMiniplayer(): UseMiniplPlayerReturn {
  const [state, dispatch] = useReducer(miniplPlayerReducer, getInitialState())
  const [streamers, setStreamers] = useState<StreamerForMiniplayer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const isMobile = useIsMobile()
  
  // Throttle para mousemove durante drag
  const throttleTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const prevIsDraggingRef = useRef<boolean>(false)

  // Buscar streamers em destaque do Firestore
  const fetchFeaturedStreamers = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const db = getClientFirestore()
      if (!db) {
        setError('Firestore não disponível')
        return
      }

      // Query: apenas streamers em destaque (filtrar online no cliente para tolerar dados inconsistentes)
      const streamersQuery = query(
        collection(db, 'streamers'),
        where('isFeatured', '==', true)
      )

      const snapshot = await getDocs(streamersQuery)
      const fetchedStreamers: StreamerForMiniplayer[] = []

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
          twitchChannel: data.platform === 'twitch' ? (extractTwitchChannel(data.streamUrl) || undefined) : undefined,
          createdAt: data.createdAt || '',
          lastStatusUpdate: data.lastStatusUpdate || ''
        }

        if (streamer.name && streamer.streamUrl && streamer.isOnline) {
          fetchedStreamers.push(streamer)
        }
      })

      setStreamers(fetchedStreamers)

      // Se há streamers e nenhum está selecionado, selecionar o primeiro (todos já online)
      if (fetchedStreamers.length > 0 && !state.currentStreamId) {
        const firstOnline = fetchedStreamers[0]
        dispatch({ 
          type: 'SET_STREAM', 
          payload: { 
            index: fetchedStreamers.indexOf(firstOnline), 
            streamId: firstOnline.id 
          }
        })
      }

    } catch (err) {
      console.error('Erro ao buscar streamers:', err)
      setError('Erro ao carregar streamers')
    } finally {
      setLoading(false)
    }
  }, [])

  // Carregar estado persistido do localStorage
  const loadPersistedState = useCallback(() => {
    try {
      const saved = localStorage.getItem(KEYS.MINIPLAYER_STATE)
      if (saved) {
        const parsed: MiniplPlayerLocalStorage = JSON.parse(saved)
        
        // Validar posição para não sair da tela
        const validPosition = {
          x: Math.max(0, Math.min(window.innerWidth - CONFIG.defaultSize.width, parsed.position?.x || 0)),
          y: Math.max(0, Math.min(window.innerHeight - CONFIG.defaultSize.height, parsed.position?.y || 0))
        }

        // Forçar iniciar ABERTO e ancorado no canto inferior direito visível
        const margin = CONFIG.margin
        const headerH = 40
        const openWidth = CONFIG.defaultSize.width
        const openHeight = CONFIG.defaultSize.height
        const x = Math.max(margin, window.innerWidth - openWidth - margin)
        const y = Math.max(margin, window.innerHeight - (openHeight + headerH) - margin)

        dispatch({
          type: 'LOAD_FROM_STORAGE',
          payload: {
            position: { x, y },
            isMinimized: false,
            isMuted: parsed.isMuted ?? true,
            volume: parsed.volume ?? 50,
            currentStreamId: parsed.currentStreamId,
            dockedCorner: 'bottom-right'
          }
        })
      }
    } catch (err) {
      console.warn('Erro ao carregar estado persistido:', err)
    }
  }, [])

  // Persistir estado no localStorage
  const persistState = useCallback(() => {
    try {
      const toSave: MiniplPlayerLocalStorage = {
        position: state.position,
        isMinimized: state.isMinimized,
        isMuted: state.isMuted,
        volume: state.volume,
        currentStreamId: state.currentStreamId,
        dockedCorner: state.dockedCorner
      }

      localStorage.setItem(KEYS.MINIPLAYER_STATE, JSON.stringify(toSave))
    } catch (err) {
      console.warn('Erro ao persistir estado:', err)
    }
  }, [state])

  // Calcular zonas de snap
  const getSnapZones = useCallback((): SnapZone[] => {
    if (typeof window === 'undefined') return []

    const { innerWidth, innerHeight } = window
    const { width } = state.size
    const margin = CONFIG.margin
    const header = 40
    const visibleBodyHeight = state.isMinimized ? 0 : state.size.height
    const effectiveHeight = visibleBodyHeight + header

    return [
      {
        corner: 'top-left',
        bounds: { top: margin, left: margin, right: margin + width, bottom: margin + effectiveHeight }
      },
      {
        corner: 'top-right',
        bounds: { top: margin, left: innerWidth - width - margin, right: innerWidth - margin, bottom: margin + effectiveHeight }
      },
      {
        corner: 'bottom-left',
        bounds: { top: innerHeight - effectiveHeight - margin, left: margin, right: margin + width, bottom: innerHeight - margin }
      },
      {
        corner: 'bottom-right',
        bounds: { top: innerHeight - effectiveHeight - margin, left: innerWidth - width - margin, right: innerWidth - margin, bottom: innerHeight - margin }
      }
    ]
  }, [state.size, state.isMinimized])

  // Encontrar corner mais próximo para snap
  const findNearestCorner = useCallback((position: Position): DockedCorner => {
    if (typeof window === 'undefined') return 'top-right'

    const { innerWidth, innerHeight } = window
    const APPROX_HEADER_HEIGHT_PX = 40
    const visibleBodyHeight = state.isMinimized ? 0 : state.size.height
    const effectiveHeight = visibleBodyHeight + APPROX_HEADER_HEIGHT_PX

    const centerX = position.x + state.size.width / 2
    const centerY = position.y + effectiveHeight / 2

    const isLeft = centerX < innerWidth / 2
    const isTop = centerY < innerHeight / 2

    if (isTop && isLeft) return 'top-left'
    if (isTop && !isLeft) return 'top-right'
    if (!isTop && isLeft) return 'bottom-left'
    return 'bottom-right'
  }, [state.size, state.isMinimized])

  // Actions
  const setPosition = useCallback((position: Position) => {
    dispatch({ type: 'SET_POSITION', payload: position })
  }, [])

  const setDragging = useCallback((isDragging: boolean) => {
    dispatch({ type: 'SET_DRAGGING', payload: isDragging })
  }, [])

  const setMinimized = useCallback((isMinimized: boolean) => {
    dispatch({ type: 'SET_MINIMIZED', payload: isMinimized })
  }, [])

  const setHovering = useCallback((isHovering: boolean) => {
    dispatch({ type: 'SET_HOVERING', payload: isHovering })
  }, [])

  const setCurrentStream = useCallback((index: number) => {
    if (streamers[index]) {
      dispatch({ 
        type: 'SET_STREAM', 
        payload: { index, streamId: streamers[index].id }
      })
    }
  }, [streamers])

  const setMuted = useCallback((isMuted: boolean) => {
    dispatch({ type: 'SET_MUTED', payload: isMuted })
  }, [])

  const setVolume = useCallback((volume: number) => {
    dispatch({ type: 'SET_VOLUME', payload: volume })
  }, [])

  const setVisible = useCallback((isVisible: boolean) => {
    dispatch({ type: 'SET_VISIBLE', payload: isVisible })
  }, [])

  const snapToCorner = useCallback((corner: DockedCorner) => {
    if (typeof window === 'undefined') return

    const { innerWidth, innerHeight } = window
    const { width } = state.size
    const margin = CONFIG.margin

    // Altura efetiva do contêiner visível: header sempre presente
    // Quando minimizado, o corpo fica colapsado, então usamos apenas a altura do header (~40px)
    // Quando aberto, usamos altura do corpo + header (~40px)
    const APPROX_HEADER_HEIGHT_PX = 40
    const visibleBodyHeight = state.isMinimized ? 0 : state.size.height
    const effectiveHeight = visibleBodyHeight + APPROX_HEADER_HEIGHT_PX

    let newPosition: Position

    switch (corner) {
      case 'top-left':
        newPosition = { x: margin, y: margin }
        break
      case 'top-right':
        newPosition = { x: innerWidth - width - margin, y: margin }
        break
      case 'bottom-left':
        newPosition = { x: margin, y: innerHeight - effectiveHeight - margin }
        break
      case 'bottom-right':
        newPosition = { x: innerWidth - width - margin, y: innerHeight - effectiveHeight - margin }
        break
    }

    dispatch({ type: 'SET_POSITION', payload: newPosition })
    dispatch({ type: 'SET_DOCKED_CORNER', payload: corner })
  }, [state.size, state.isMinimized])

  const resetToDefaults = useCallback(() => {
    dispatch({ type: 'RESET_STATE' })
    localStorage.removeItem(KEYS.MINIPLAYER_STATE)
  }, [])

  // Utilities
  const getCurrentStreamer = useCallback((): StreamerForMiniplayer | undefined => {
    return streamers[state.currentStreamIndex]
  }, [streamers, state.currentStreamIndex])

  const getTwitchEmbedUrl = useCallback((): string | null => {
    const currentStreamer = getCurrentStreamer()
    if (!currentStreamer || currentStreamer.platform !== 'twitch' || !currentStreamer.twitchChannel) {
      return null
    }

    const params = new URLSearchParams({
      channel: currentStreamer.twitchChannel,
      autoplay: 'true',
      muted: state.isMuted.toString(),
      controls: 'false'
    })

    // Adicionar parent domains
    getTwitchParentDomains().forEach(domain => {
      params.append('parent', domain)
    })

    return `https://player.twitch.tv/?${params.toString()}`
  }, [getCurrentStreamer, state.isMuted])

  const canPlayStream = useCallback((): boolean => {
    const streamer = getCurrentStreamer()
    return Boolean(streamer && streamer.platform === 'twitch' && streamer.isOnline && streamer.twitchChannel)
  }, [getCurrentStreamer])

  // Effects
  // Executar carregamento inicial APENAS uma vez para evitar loops de render
  useEffect(() => {
    loadPersistedState()
    fetchFeaturedStreamers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    persistState()
  }, [persistState])

  // Auto-snap quando parar de arrastar
  useEffect(() => {
    const wasDragging = prevIsDraggingRef.current
    // Executar snap somente na transição de true -> false
    if (wasDragging && !state.isDragging && CONFIG.snapToCorners) {
      const nearestCorner = findNearestCorner(state.position)
      if (nearestCorner !== state.dockedCorner) {
        snapToCorner(nearestCorner)
      }
    }
    prevIsDraggingRef.current = state.isDragging
  }, [state.isDragging, state.position, state.dockedCorner, findNearestCorner, snapToCorner])

  // Ajustar posição no mobile
  useEffect(() => {
    if (isMobile && state.isVisible) {
      // No mobile, fixar na base da tela
      const mobilePosition: Position = {
        x: 0,
        y: window.innerHeight - (state.size.height || CONFIG.defaultSize.height)
      }
      if (state.position.x !== mobilePosition.x || state.position.y !== mobilePosition.y) {
        setPosition(mobilePosition)
      }
    }
  }, [isMobile, state.isVisible, state.size, state.position, setPosition])

  return {
    state,
    streamers,
    loading,
    error,
    setPosition,
    setDragging,
    setMinimized,
    setHovering,
    setCurrentStream,
    setMuted,
    setVolume,
    setVisible,
    snapToCorner,
    getCurrentStreamer,
    getTwitchEmbedUrl,
    canPlayStream,
    getSnapZones,
    resetToDefaults
  }
}