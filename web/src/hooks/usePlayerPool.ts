/**
 * Hook para pool de players Twitch
 * Reutiliza iframes para evitar recriação custosa
 */

import { useState, useRef, useCallback, useEffect } from 'react'

interface PooledPlayer {
  id: string
  iframe: HTMLIFrameElement
  isInUse: boolean
  currentChannel: string | null
  lastUsed: number
  container: HTMLDivElement
}

interface UsePlayerPoolOptions {
  poolSize?: number
  reuseDelay?: number
  enabled?: boolean
}

export function usePlayerPool(options: UsePlayerPoolOptions = {}) {
  const {
    poolSize = 5,
    reuseDelay = 1000,
    enabled = true
  } = options

  const [pool, setPool] = useState<PooledPlayer[]>([])
  const poolRef = useRef<PooledPlayer[]>([])
  const nextIdRef = useRef(0)

  // Sincronizar ref com state
  useEffect(() => {
    poolRef.current = pool
  }, [pool])

  // Função para criar URL do embed
  const createEmbedUrl = useCallback((channel: string) => {
    const params = new URLSearchParams({
      channel: channel,
      autoplay: 'false',
      muted: 'true',
      controls: 'true',
      playsinline: 'true',
      'disable-ads': 'true',
      allowfullscreen: 'true'
    })

    const parents = ['localhost']
    if (typeof window !== 'undefined' && window.location.hostname && window.location.hostname !== 'localhost') {
      parents.push(window.location.hostname)
    }
    parents.forEach(parent => params.append('parent', parent))

    return `https://player.twitch.tv/?${params.toString()}`
  }, [])

  // Função para criar novo player
  const createPlayer = useCallback((channel: string): PooledPlayer => {
    const id = `player-${nextIdRef.current++}`
    
    // Criar container
    const container = document.createElement('div')
    container.className = 'player-container'
    container.style.width = '100%'
    container.style.height = '100%'
    container.style.position = 'relative'

    // Criar iframe
    const iframe = document.createElement('iframe')
    iframe.src = createEmbedUrl(channel)
    iframe.className = 'w-full h-full block'
    iframe.frameBorder = '0'
    iframe.allowFullscreen = true
    iframe.style.border = 'none'

    container.appendChild(iframe)

    return {
      id,
      iframe,
      container,
      isInUse: false,
      currentChannel: channel,
      lastUsed: Date.now()
    }
  }, [createEmbedUrl])

  // Função para obter player do pool
  const getPlayer = useCallback((channel: string): PooledPlayer => {
    if (!enabled) {
      return createPlayer(channel)
    }

    // Procurar player disponível com o mesmo canal
    let availablePlayer = poolRef.current.find(
      player => !player.isInUse && player.currentChannel === channel
    )

    if (availablePlayer) {
      availablePlayer.isInUse = true
      availablePlayer.lastUsed = Date.now()
      return availablePlayer
    }

    // Procurar player disponível para reutilizar
    availablePlayer = poolRef.current.find(player => !player.isInUse)

    if (availablePlayer) {
      // Reutilizar player existente
      availablePlayer.iframe.src = createEmbedUrl(channel)
      availablePlayer.currentChannel = channel
      availablePlayer.isInUse = true
      availablePlayer.lastUsed = Date.now()
      return availablePlayer
    }

    // Criar novo player se pool não está cheio
    if (poolRef.current.length < poolSize) {
      const newPlayer = createPlayer(channel)
      newPlayer.isInUse = true
      
      setPool(prev => [...prev, newPlayer])
      return newPlayer
    }

    // Pool cheio - reutilizar o menos usado
    const leastUsed = poolRef.current.reduce((oldest, current) => 
      current.lastUsed < oldest.lastUsed ? current : oldest
    )

    leastUsed.iframe.src = createEmbedUrl(channel)
    leastUsed.currentChannel = channel
    leastUsed.isInUse = true
    leastUsed.lastUsed = Date.now()

    return leastUsed
  }, [enabled, poolSize, createPlayer, createEmbedUrl])

  // Função para liberar player
  const releasePlayer = useCallback((playerId: string) => {
    setTimeout(() => {
      setPool(prev => prev.map(player => 
        player.id === playerId 
          ? { ...player, isInUse: false }
          : player
      ))
    }, reuseDelay)
  }, [reuseDelay])

  // Função para limpar pool
  const clearPool = useCallback(() => {
    poolRef.current.forEach(player => {
      if (player.container.parentNode) {
        player.container.parentNode.removeChild(player.container)
      }
    })
    setPool([])
    nextIdRef.current = 0
  }, [])

  // Função para obter estatísticas do pool
  const getPoolStats = useCallback(() => {
    const inUse = poolRef.current.filter(p => p.isInUse).length
    const available = poolRef.current.length - inUse
    
    return {
      total: poolRef.current.length,
      inUse,
      available,
      maxSize: poolSize
    }
  }, [poolSize])

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      clearPool()
    }
  }, [clearPool])

  return {
    getPlayer,
    releasePlayer,
    clearPool,
    getPoolStats,
    poolSize: pool.length
  }
}

/**
 * Hook React para usar player do pool em componentes
 */
export function usePooledPlayer(channel: string | null, containerRef: React.RefObject<HTMLDivElement>) {
  const { getPlayer, releasePlayer } = usePlayerPool()
  const [currentPlayer, setCurrentPlayer] = useState<PooledPlayer | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Efeito para trocar player quando canal muda
  useEffect(() => {
    if (!channel || !containerRef.current) {
      // Liberar player atual se não há canal
      if (currentPlayer) {
        releasePlayer(currentPlayer.id)
        setCurrentPlayer(null)
      }
      return
    }

    setIsLoading(true)

    // Obter novo player do pool
    const player = getPlayer(channel)
    
    // Remover player anterior do DOM
    if (currentPlayer && currentPlayer.container.parentNode) {
      currentPlayer.container.parentNode.removeChild(currentPlayer.container)
      releasePlayer(currentPlayer.id)
    }

    // Adicionar novo player ao DOM
    containerRef.current.appendChild(player.container)
    setCurrentPlayer(player)

    // Handler para quando iframe carrega
    const handleLoad = () => {
      setIsLoading(false)
    }

    player.iframe.addEventListener('load', handleLoad, { once: true })

    // Timeout de fallback
    const timeout = setTimeout(() => {
      setIsLoading(false)
    }, 2000)

    return () => {
      clearTimeout(timeout)
      player.iframe.removeEventListener('load', handleLoad)
    }
  }, [channel, containerRef, getPlayer, releasePlayer, currentPlayer])

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      if (currentPlayer) {
        releasePlayer(currentPlayer.id)
      }
    }
  }, [currentPlayer, releasePlayer])

  return {
    isLoading,
    playerId: currentPlayer?.id || null
  }
}
