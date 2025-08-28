/**
 * Hook para preload de players Twitch
 * Carrega players em background para troca instantânea
 */

import { useState, useEffect, useRef, useCallback } from 'react'

interface PreloadedPlayer {
  channel: string
  iframe: HTMLIFrameElement
  isReady: boolean
  lastUsed: number
}

interface UsePlayerPreloadOptions {
  maxPreloaded?: number
  preloadDelay?: number
  enabled?: boolean
  enableIntersectionObserver?: boolean
  enableMemoryOptimization?: boolean
}

export function usePlayerPreload(options: UsePlayerPreloadOptions = {}) {
  const {
    maxPreloaded = 3,
    preloadDelay = 1000,
    enabled = true,
    enableIntersectionObserver = true,
    enableMemoryOptimization = true
  } = options

  const [preloadedPlayers, setPreloadedPlayers] = useState<Map<string, PreloadedPlayer>>(new Map())
  const preloadTimeoutRef = useRef<NodeJS.Timeout>()
  const containerRef = useRef<HTMLDivElement>()
  const intersectionObserverRef = useRef<IntersectionObserver>()
  const memoryCleanupIntervalRef = useRef<NodeJS.Timeout>()

  // Criar container invisível para preload
  useEffect(() => {
    if (!enabled) return

    const container = document.createElement('div')
    container.style.position = 'absolute'
    container.style.top = '-9999px'
    container.style.left = '-9999px'
    container.style.width = '1px'
    container.style.height = '1px'
    container.style.overflow = 'hidden'
    container.style.visibility = 'hidden'
    container.id = 'twitch-preload-container'
    
    document.body.appendChild(container)
    containerRef.current = container

    return () => {
      if (container.parentNode) {
        container.parentNode.removeChild(container)
      }
    }
  }, [enabled])

  // Função para criar URL do embed otimizada
  const createEmbedUrl = useCallback((channel: string) => {
    const params = new URLSearchParams({
      channel: channel,
      autoplay: 'false',
      muted: 'true',
      controls: 'false', // Sem controles para preload
      playsinline: 'true',
      'disable-ads': 'true',
      allowfullscreen: 'false' // Sem fullscreen para preload
    })

    // Parents otimizados
    const parents = ['localhost']
    if (typeof window !== 'undefined' && window.location.hostname && window.location.hostname !== 'localhost') {
      parents.push(window.location.hostname)
    }
    parents.forEach(parent => params.append('parent', parent))

    return `https://player.twitch.tv/?${params.toString()}`
  }, [])

  // Função para preload de um canal
  const preloadChannel = useCallback((channel: string) => {
    if (!enabled || !containerRef.current || !channel) return

    setPreloadedPlayers(prevPlayers => {
      // Verificar se já está preloaded
      if (prevPlayers.has(channel)) {
        // Atualizar timestamp de uso
        const player = prevPlayers.get(channel)!
        player.lastUsed = Date.now()
        return prevPlayers
      }

      const newMap = new Map(prevPlayers)

      // Verificar limite de players preloaded
      if (newMap.size >= maxPreloaded) {
        // Remover o player menos usado
        let oldestChannel = ''
        let oldestTime = Date.now()

        newMap.forEach((player, ch) => {
          if (player.lastUsed < oldestTime) {
            oldestTime = player.lastUsed
            oldestChannel = ch
          }
        })

        if (oldestChannel) {
          const oldPlayer = newMap.get(oldestChannel)
          if (oldPlayer?.iframe.parentNode) {
            oldPlayer.iframe.parentNode.removeChild(oldPlayer.iframe)
          }
          newMap.delete(oldestChannel)
        }
      }

      return newMap
    })

    // Criar novo iframe para preload
    const iframe = document.createElement('iframe')
    iframe.src = createEmbedUrl(channel)
    iframe.width = '320'
    iframe.height = '180'
    iframe.frameBorder = '0'
    iframe.style.border = 'none'
    iframe.style.width = '320px'
    iframe.style.height = '180px'

    // Handler para quando iframe carrega
    const handleLoad = () => {
      setPreloadedPlayers(prev => {
        const newMap = new Map(prev)
        const player = newMap.get(channel)
        if (player) {
          player.isReady = true
        }
        return newMap
      })
    }

    iframe.addEventListener('load', handleLoad)
    if (containerRef.current) {
      containerRef.current.appendChild(iframe)
    }

    // Adicionar ao mapa
    const newPlayer: PreloadedPlayer = {
      channel,
      iframe,
      isReady: false,
      lastUsed: Date.now()
    }

    setPreloadedPlayers(prev => new Map(prev).set(channel, newPlayer))
  }, [enabled, maxPreloaded, createEmbedUrl])

  // Função para obter player preloaded
  const getPreloadedPlayer = useCallback((channel: string): HTMLIFrameElement | null => {
    let result: HTMLIFrameElement | null = null
    setPreloadedPlayers(prev => {
      const player = prev.get(channel)
      if (player && player.isReady) {
        player.lastUsed = Date.now()
        result = player.iframe
      }
      return prev
    })
    return result
  }, [])

  // Função para preload com delay
  const schedulePreload = useCallback((channels: string[]) => {
    if (!enabled || channels.length === 0) return

    if (preloadTimeoutRef.current) {
      clearTimeout(preloadTimeoutRef.current)
    }

    preloadTimeoutRef.current = setTimeout(() => {
      channels.forEach((channel, index) => {
        setTimeout(() => {
          preloadChannel(channel)
        }, index * 200) // Espaçar preloads para não sobrecarregar
      })
    }, preloadDelay)
  }, [enabled, preloadDelay, preloadChannel])

  // Função para limpar preloads
  const clearPreloads = useCallback(() => {
    setPreloadedPlayers(prevPlayers => {
      prevPlayers.forEach(player => {
        if (player.iframe.parentNode) {
          player.iframe.parentNode.removeChild(player.iframe)
        }
      })
      return new Map()
    })
  }, [])

  // Sistema de limpeza automática de memória
  useEffect(() => {
    if (!enableMemoryOptimization) return

    const cleanupInterval = setInterval(() => {
      setPreloadedPlayers(prevPlayers => {
        const now = Date.now()
        const maxAge = 5 * 60 * 1000 // 5 minutos
        const newMap = new Map(prevPlayers)

        for (const [channel, player] of newMap.entries()) {
          if (now - player.lastUsed > maxAge) {
            if (player.iframe.parentNode) {
              player.iframe.parentNode.removeChild(player.iframe)
            }
            newMap.delete(channel)
          }
        }

        return newMap
      })
    }, 60000) // Verificar a cada minuto

    memoryCleanupIntervalRef.current = cleanupInterval
    return () => clearInterval(cleanupInterval)
  }, [enableMemoryOptimization])

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      if (preloadTimeoutRef.current) {
        clearTimeout(preloadTimeoutRef.current)
      }
      if (memoryCleanupIntervalRef.current) {
        clearInterval(memoryCleanupIntervalRef.current)
      }
      if (intersectionObserverRef.current) {
        intersectionObserverRef.current.disconnect()
      }
      clearPreloads()
    }
  }, [clearPreloads])

  const isChannelPreloaded = useCallback((channel: string) => {
    return preloadedPlayers.has(channel) && preloadedPlayers.get(channel)?.isReady
  }, [preloadedPlayers])

  return {
    preloadChannel,
    schedulePreload,
    getPreloadedPlayer,
    clearPreloads,
    preloadedCount: preloadedPlayers.size,
    isChannelPreloaded
  }
}

/**
 * Hook simplificado para preload automático baseado em lista de streamers
 */
export function useAutoPreload(streamers: any[], selectedIndex: number = 0) {
  const { schedulePreload, getPreloadedPlayer, isChannelPreloaded } = usePlayerPreload()

  // Validação de entrada
  const validStreamers = Array.isArray(streamers) ? streamers : []
  const validSelectedIndex = Math.max(0, Math.min(selectedIndex, validStreamers.length - 1))

  // Preload automático dos próximos streamers
  useEffect(() => {
    if (validStreamers.length === 0) return

    const channelsToPreload: string[] = []

    // Preload próximo e anterior apenas se há mais de 1 streamer
    if (validStreamers.length > 1) {
      const nextIndex = (validSelectedIndex + 1) % validStreamers.length
      const prevIndex = validSelectedIndex === 0 ? validStreamers.length - 1 : validSelectedIndex - 1

      // Verificar se os índices são válidos
      const indicesToPreload = [nextIndex, prevIndex].filter(index =>
        index >= 0 && index < validStreamers.length && index !== validSelectedIndex
      )

      indicesToPreload.forEach(index => {
        const streamer = validStreamers[index]
        if (streamer?.twitchChannel) {
          channelsToPreload.push(streamer.twitchChannel)
        }
      })
    }

    if (channelsToPreload.length > 0) {
      schedulePreload(channelsToPreload)
    }
  }, [validStreamers, validSelectedIndex, schedulePreload])

  return {
    getPreloadedPlayer,
    isChannelPreloaded
  }
}
