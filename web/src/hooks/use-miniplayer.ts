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
  minimizedSize: { width: 300, height: 40 }, // Ajustado para formato de pílula perfeito
  aspectRatio: 16 / 9,
  snapToCorners: true,
  margin: 16,
  autoHide: false,
  autoHideDelay: 3000,
  twitchParentDomains: ['localhost']
}

// Configurações específicas para mobile
const MOBILE_CONFIG = {
  defaultSize: { width: 320, height: 180 }, // Menor no mobile
  minimizedSize: { width: 240, height: 40 }, // Tamanho ajustado para pílula mobile
  margin: 12 // Margem menor no mobile
}

const KEYS: typeof STORAGE_KEYS = {
  MINIPLAYER_STATE: 'miniplayer-state',
  MINIPLAYER_VERSION: '1.0.0'
}

// Estado inicial - usando função para evitar problemas no servidor
const getInitialState = (isMobile: boolean = false): MiniplPlayerState => {
  const config = isMobile ? MOBILE_CONFIG : CONFIG
  return {
    position: {
      x: typeof window !== 'undefined' ? window.innerWidth - config.defaultSize.width - config.margin : 100,
      y: typeof window !== 'undefined' ? Math.max(config.margin, window.innerHeight - (config.defaultSize.height + 40) - config.margin) : config.margin
    },
    size: config.defaultSize,
    isDragging: false,
    isMinimized: false,
    isHovering: false,
    currentStreamIndex: 0,
    isMuted: true, // Começar mutado por padrão
    volume: 50,
    isVisible: false
  }
}

// Reducer para gerenciar estado
function miniplPlayerReducer(state: MiniplPlayerState, action: MiniplPlayerAction, isMobile: boolean = false): MiniplPlayerState {
  const config = isMobile ? MOBILE_CONFIG : CONFIG
  
  switch (action.type) {
    case 'SET_POSITION':
      return { ...state, position: action.payload }
    
    case 'SET_DRAGGING':
      return { ...state, isDragging: action.payload }
    
    case 'SET_MINIMIZED':
      return { 
        ...state, 
        isMinimized: action.payload,
        size: action.payload ? {
          ...config.minimizedSize,
          height: config.minimizedSize.height + 40 // Adicionar altura do header minimizado (ajustado para 40px)
        } : config.defaultSize
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
      return { ...getInitialState(isMobile), isVisible: false }
    
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
  const isMobile = useIsMobile()
  const [state, dispatch] = useReducer(
    (state: MiniplPlayerState, action: MiniplPlayerAction) => miniplPlayerReducer(state, action, isMobile),
    getInitialState(isMobile)
  )
  const [streamers, setStreamers] = useState<StreamerForMiniplayer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
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

      // Ordenar streamers: primeiro os em destaque, depois os demais
      const sortedStreamers = fetchedStreamers.sort((a, b) => {
        if (a.isFeatured && !b.isFeatured) return -1
        if (!a.isFeatured && b.isFeatured) return 1
        return 0
      })

      setStreamers(sortedStreamers)

      // Sempre selecionar o streamer marcado como isFeatured: true quando disponível
      if (sortedStreamers.length > 0) {
        // Priorizar streamer em destaque
        const featuredStreamer = sortedStreamers.find(s => s.isFeatured)
        const streamerToSelect = featuredStreamer || sortedStreamers[0]
        
        // Só atualizar se não houver streamer selecionado ou se for diferente
        if (!state.currentStreamId || state.currentStreamId !== streamerToSelect.id) {
          dispatch({ 
            type: 'SET_STREAM', 
            payload: { 
              index: sortedStreamers.indexOf(streamerToSelect), 
              streamId: streamerToSelect.id 
            }
          })
        }
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
        
        const config = isMobile ? MOBILE_CONFIG : CONFIG
        
        // Validar posição para não sair da tela
        const validPosition = {
          x: Math.max(0, Math.min(window.innerWidth - config.defaultSize.width, parsed.position?.x || 0)),
          y: Math.max(0, Math.min(window.innerHeight - config.defaultSize.height, parsed.position?.y || 0))
        }

        // Forçar iniciar ABERTO e ancorado no canto inferior direito visível
        const margin = config.margin
        const headerH = 40
        const openWidth = config.defaultSize.width
        const openHeight = config.defaultSize.height
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
  }, [isMobile])

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
    const config = isMobile ? MOBILE_CONFIG : CONFIG
    const margin = config.margin
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
  }, [state.size, state.isMinimized, isMobile])

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
    const config = isMobile ? MOBILE_CONFIG : CONFIG
    const margin = config.margin

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
  }, [state.size, state.isMinimized, isMobile])

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

  // Ajustar posição inicial no mobile para ser mais acessível
  useEffect(() => {
    if (isMobile && state.isVisible && !state.isMinimized) {
      // No mobile, posicionar inicialmente no canto inferior direito
      const margin = MOBILE_CONFIG.margin
      const mobilePosition: Position = {
        x: window.innerWidth - state.size.width - margin,
        y: window.innerHeight - (state.size.height + 40) - margin // 40px para o header
      }
      // Só ajustar se a posição atual estiver muito fora da tela
      if (state.position.x < 0 || state.position.y < 0 || 
          state.position.x > window.innerWidth || 
          state.position.y > window.innerHeight) {
        setPosition(mobilePosition)
      }
    }
  }, [isMobile, state.isVisible, state.isMinimized, state.size, state.position, setPosition])

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