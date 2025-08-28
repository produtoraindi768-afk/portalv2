/**
 * Sistema de cache inteligente para requests da API
 * Reduz latência e múltiplos requests desnecessários
 */

interface CacheEntry<T = any> {
  data: T
  timestamp: number
  ttl: number
  key: string
}

interface RequestOptions {
  ttl?: number // Time to live em ms (padrão: 5 minutos)
  forceRefresh?: boolean
  retries?: number
}

class RequestCache {
  private cache = new Map<string, CacheEntry>()
  private pendingRequests = new Map<string, Promise<any>>()
  
  // TTL padrão: 5 minutos para dados de streamers
  private readonly DEFAULT_TTL = 5 * 60 * 1000
  
  /**
   * Cache com deduplicação de requests
   */
  async get<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: RequestOptions = {}
  ): Promise<T> {
    const { ttl = this.DEFAULT_TTL, forceRefresh = false, retries = 2 } = options

    // Verificar se já existe request pendente
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key)!
    }

    // Verificar cache existente
    if (!forceRefresh) {
      const cached = this.cache.get(key)
      if (cached && (Date.now() - cached.timestamp) < cached.ttl) {
        return cached.data
      }
    }

    // Criar request com retry automático
    const requestPromise = this.executeWithRetry(fetcher, retries)
      .then(data => {
        // Armazenar no cache
        this.cache.set(key, {
          data,
          timestamp: Date.now(),
          ttl,
          key
        })
        
        // Remover da lista de pendentes
        this.pendingRequests.delete(key)
        
        return data
      })
      .catch(error => {
        // Remover da lista de pendentes em caso de erro
        this.pendingRequests.delete(key)
        throw error
      })

    // Armazenar request pendente
    this.pendingRequests.set(key, requestPromise)
    
    return requestPromise
  }

  /**
   * Executa request com retry automático
   */
  private async executeWithRetry<T>(
    fetcher: () => Promise<T>, 
    retries: number
  ): Promise<T> {
    let lastError: Error

    for (let i = 0; i <= retries; i++) {
      try {
        const result = await fetcher()
        return result
      } catch (error) {
        lastError = error as Error
        
        // Se não é a última tentativa, aguardar antes do próximo retry
        if (i < retries) {
          const delay = Math.min(1000 * Math.pow(2, i), 5000) // Exponential backoff, max 5s
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
    }

    throw lastError!
  }

  /**
   * Invalidar cache por chave ou padrão
   */
  invalidate(keyOrPattern: string | RegExp): void {
    if (typeof keyOrPattern === 'string') {
      this.cache.delete(keyOrPattern)
      this.pendingRequests.delete(keyOrPattern)
    } else {
      // Invalidar por padrão regex
      for (const [key] of this.cache) {
        if (keyOrPattern.test(key)) {
          this.cache.delete(key)
          this.pendingRequests.delete(key)
        }
      }
    }
  }

  /**
   * Limpar cache expirado
   */
  cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.cache) {
      if ((now - entry.timestamp) > entry.ttl) {
        this.cache.delete(key)
      }
    }
  }

  /**
   * Obter estatísticas do cache
   */
  getStats() {
    return {
      cacheSize: this.cache.size,
      pendingRequests: this.pendingRequests.size,
      entries: Array.from(this.cache.values()).map(entry => ({
        key: entry.key,
        age: Date.now() - entry.timestamp,
        ttl: entry.ttl
      }))
    }
  }

  /**
   * Prefetch - carregar dados antecipadamente
   */
  async prefetch<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: RequestOptions = {}
  ): Promise<void> {
    // Só prefetch se não estiver no cache ou pendente
    if (!this.cache.has(key) && !this.pendingRequests.has(key)) {
      try {
        await this.get(key, fetcher, { ...options, ttl: options.ttl || this.DEFAULT_TTL })
      } catch (error) {
        // Ignorar erros em prefetch
        console.warn(`Prefetch failed for ${key}:`, error)
      }
    }
  }
}

// Instância singleton
export const requestCache = new RequestCache()

// Cleanup automático a cada 10 minutos
if (typeof window !== 'undefined') {
  setInterval(() => {
    requestCache.cleanup()
  }, 10 * 60 * 1000)
}

/**
 * Hook para requests com cache
 */
export function useCachedRequest<T>(
  key: string,
  fetcher: () => Promise<T>,
  options?: RequestOptions
) {
  return requestCache.get(key, fetcher, options)
}

/**
 * Utilitários para Firebase com cache
 */
export const cachedFirebaseUtils = {
  /**
   * Buscar streamers em destaque com cache
   */
  async getFeaturedStreamers() {
    return requestCache.get(
      'featured-streamers',
      async () => {
        const { getClientFirestore } = await import('@/lib/safeFirestore')
        const { collection, query, where, getDocs } = await import('firebase/firestore')
        
        const db = getClientFirestore()
        if (!db) throw new Error('Firestore not available')
        
        const streamersQuery = query(
          collection(db, 'streamers'),
          where('isFeatured', '==', true)
        )
        
        const snapshot = await getDocs(streamersQuery)
        return snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      },
      { ttl: 2 * 60 * 1000 } // 2 minutos para dados críticos
    )
  },

  /**
   * Buscar todos os streamers com cache
   */
  async getAllStreamers() {
    return requestCache.get(
      'all-streamers',
      async () => {
        const { getClientFirestore } = await import('@/lib/safeFirestore')
        const { collection, getDocs } = await import('firebase/firestore')
        
        const db = getClientFirestore()
        if (!db) throw new Error('Firestore not available')
        
        const snapshot = await getDocs(collection(db, 'streamers'))
        return snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      },
      { ttl: 5 * 60 * 1000 } // 5 minutos
    )
  }
}
