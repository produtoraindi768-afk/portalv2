/**
 * Sistema de cache para players Twitch
 * Gerencia cache inteligente com LRU e TTL
 */

interface CachedPlayer {
  channel: string
  iframe: HTMLIFrameElement
  lastUsed: number
  createdAt: number
  isReady: boolean
  priority: number
}

interface CacheStats {
  hits: number
  misses: number
  evictions: number
  totalCreated: number
}

class PlayerCache {
  private cache = new Map<string, CachedPlayer>()
  private maxSize: number
  private ttl: number // Time to live em ms
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    evictions: 0,
    totalCreated: 0
  }

  constructor(maxSize = 5, ttl = 10 * 60 * 1000) { // 10 minutos padrão
    this.maxSize = maxSize
    this.ttl = ttl
    
    // Limpeza automática a cada 2 minutos
    setInterval(() => this.cleanup(), 2 * 60 * 1000)
  }

  /**
   * Buscar player do cache
   */
  get(channel: string): HTMLIFrameElement | null {
    const cached = this.cache.get(channel)
    
    if (!cached) {
      this.stats.misses++
      return null
    }

    // Verificar se expirou
    if (Date.now() - cached.createdAt > this.ttl) {
      this.remove(channel)
      this.stats.misses++
      return null
    }

    // Atualizar último uso
    cached.lastUsed = Date.now()
    this.stats.hits++
    
    return cached.iframe
  }

  /**
   * Adicionar player ao cache
   */
  set(channel: string, iframe: HTMLIFrameElement, priority = 0): void {
    // Remover se já existe
    if (this.cache.has(channel)) {
      this.remove(channel)
    }

    // Verificar limite de tamanho
    if (this.cache.size >= this.maxSize) {
      this.evictLRU()
    }

    const cached: CachedPlayer = {
      channel,
      iframe,
      lastUsed: Date.now(),
      createdAt: Date.now(),
      isReady: false,
      priority
    }

    this.cache.set(channel, cached)
    this.stats.totalCreated++
  }

  /**
   * Remover player do cache
   */
  remove(channel: string): boolean {
    const cached = this.cache.get(channel)
    if (cached) {
      // Remover iframe do DOM se ainda estiver anexado
      if (cached.iframe.parentNode) {
        cached.iframe.parentNode.removeChild(cached.iframe)
      }
      this.cache.delete(channel)
      return true
    }
    return false
  }

  /**
   * Marcar player como pronto
   */
  markReady(channel: string): void {
    const cached = this.cache.get(channel)
    if (cached) {
      cached.isReady = true
    }
  }

  /**
   * Verificar se player está pronto
   */
  isReady(channel: string): boolean {
    const cached = this.cache.get(channel)
    return cached?.isReady ?? false
  }

  /**
   * Remover player menos usado (LRU)
   */
  private evictLRU(): void {
    let oldestChannel = ''
    let oldestTime = Date.now()
    let lowestPriority = Infinity

    // Encontrar candidato para remoção
    // Prioridade: menor priority primeiro, depois LRU
    for (const [channel, cached] of this.cache.entries()) {
      if (cached.priority < lowestPriority || 
          (cached.priority === lowestPriority && cached.lastUsed < oldestTime)) {
        oldestChannel = channel
        oldestTime = cached.lastUsed
        lowestPriority = cached.priority
      }
    }

    if (oldestChannel) {
      this.remove(oldestChannel)
      this.stats.evictions++
    }
  }

  /**
   * Limpeza automática de players expirados
   */
  private cleanup(): void {
    const now = Date.now()
    const toRemove: string[] = []

    for (const [channel, cached] of this.cache.entries()) {
      if (now - cached.createdAt > this.ttl) {
        toRemove.push(channel)
      }
    }

    toRemove.forEach(channel => this.remove(channel))
  }

  /**
   * Limpar todo o cache
   */
  clear(): void {
    for (const channel of this.cache.keys()) {
      this.remove(channel)
    }
    this.cache.clear()
  }

  /**
   * Obter estatísticas do cache
   */
  getStats(): CacheStats & {
    size: number
    hitRate: number
    channels: string[]
  } {
    const total = this.stats.hits + this.stats.misses
    return {
      ...this.stats,
      size: this.cache.size,
      hitRate: total > 0 ? this.stats.hits / total : 0,
      channels: Array.from(this.cache.keys())
    }
  }

  /**
   * Definir prioridade de um player
   */
  setPriority(channel: string, priority: number): void {
    const cached = this.cache.get(channel)
    if (cached) {
      cached.priority = priority
    }
  }

  /**
   * Obter todos os players prontos
   */
  getReadyPlayers(): string[] {
    return Array.from(this.cache.entries())
      .filter(([_, cached]) => cached.isReady)
      .map(([channel]) => channel)
  }

  /**
   * Preload inteligente baseado em padrões de uso
   */
  suggestPreload(recentChannels: string[], maxSuggestions = 3): string[] {
    const suggestions: string[] = []
    const cached = new Set(this.cache.keys())

    // Sugerir canais recentes que não estão em cache
    for (const channel of recentChannels) {
      if (!cached.has(channel) && suggestions.length < maxSuggestions) {
        suggestions.push(channel)
      }
    }

    return suggestions
  }
}

// Instância singleton do cache
export const playerCache = new PlayerCache()

// Utilitários para debugging
export const debugPlayerCache = () => {
  if (process.env.NODE_ENV === 'development') {
    console.log('Player Cache Stats:', playerCache.getStats())
  }
}

// Hook para usar o cache
export const usePlayerCache = () => {
  return {
    get: (channel: string) => playerCache.get(channel),
    set: (channel: string, iframe: HTMLIFrameElement, priority?: number) => 
      playerCache.set(channel, iframe, priority),
    remove: (channel: string) => playerCache.remove(channel),
    markReady: (channel: string) => playerCache.markReady(channel),
    isReady: (channel: string) => playerCache.isReady(channel),
    getStats: () => playerCache.getStats(),
    clear: () => playerCache.clear()
  }
}
