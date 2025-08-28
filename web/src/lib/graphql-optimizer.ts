/**
 * Otimizador para requests GraphQL
 * Implementa batching, caching e retry inteligente
 */

interface GraphQLQuery {
  query: string
  variables?: Record<string, any>
  operationName?: string
}

interface GraphQLRequest extends GraphQLQuery {
  id: string
  timestamp: number
  resolve: (data: any) => void
  reject: (error: any) => void
}

interface GraphQLBatch {
  requests: GraphQLRequest[]
  timeout: NodeJS.Timeout
}

class GraphQLOptimizer {
  private endpoint: string = '/api/graphql' // Default endpoint
  private pendingBatch: GraphQLBatch | null = null
  private readonly BATCH_TIMEOUT = 10 // 10ms para agrupar requests
  private readonly MAX_BATCH_SIZE = 10
  private requestId = 0

  // Cache para queries frequentes
  private queryCache = new Map<string, { data: any; timestamp: number; ttl: number }>()
  private readonly DEFAULT_CACHE_TTL = 30000 // 30 segundos

  /**
   * Executar query GraphQL otimizada
   */
  async query<T = any>(
    query: string, 
    variables?: Record<string, any>,
    options: {
      cache?: boolean
      cacheTtl?: number
      priority?: 'high' | 'normal' | 'low'
      timeout?: number
    } = {}
  ): Promise<T> {
    const { cache = true, cacheTtl = this.DEFAULT_CACHE_TTL, priority = 'normal', timeout = 5000 } = options

    // Verificar cache primeiro
    if (cache) {
      const cacheKey = this.getCacheKey(query, variables)
      const cached = this.queryCache.get(cacheKey)
      
      if (cached && (Date.now() - cached.timestamp) < cached.ttl) {
        console.log(`📦 GraphQL cache hit: ${cacheKey.substring(0, 50)}...`)
        return cached.data
      }
    }

    // Criar request com ID único
    const requestId = `gql_${++this.requestId}_${Date.now()}`
    
    return new Promise((resolve, reject) => {
      const request: GraphQLRequest = {
        id: requestId,
        query: query.trim(),
        variables,
        timestamp: Date.now(),
        resolve: (data) => {
          // Armazenar no cache se habilitado
          if (cache) {
            const cacheKey = this.getCacheKey(query, variables)
            this.queryCache.set(cacheKey, {
              data,
              timestamp: Date.now(),
              ttl: cacheTtl
            })
          }
          resolve(data)
        },
        reject
      }

      // Adicionar timeout específico para o request
      setTimeout(() => {
        reject(new Error(`GraphQL request timeout after ${timeout}ms`))
      }, timeout)

      // Adicionar ao batch ou executar imediatamente baseado na prioridade
      if (priority === 'high') {
        this.executeSingle(request)
      } else {
        this.addToBatch(request)
      }
    })
  }

  private getCacheKey(query: string, variables?: Record<string, any>): string {
    const cleanQuery = query.replace(/\s+/g, ' ').trim()
    const varsStr = variables ? JSON.stringify(variables) : ''
    return `${cleanQuery}:${varsStr}`
  }

  private addToBatch(request: GraphQLRequest) {
    // Se não há batch pendente, criar um novo
    if (!this.pendingBatch) {
      this.pendingBatch = {
        requests: [],
        timeout: setTimeout(() => this.executeBatch(), this.BATCH_TIMEOUT)
      }
    }

    this.pendingBatch.requests.push(request)

    // Se batch está cheio, executar imediatamente
    if (this.pendingBatch.requests.length >= this.MAX_BATCH_SIZE) {
      clearTimeout(this.pendingBatch.timeout)
      this.executeBatch()
    }
  }

  private async executeBatch() {
    if (!this.pendingBatch || this.pendingBatch.requests.length === 0) {
      return
    }

    const batch = this.pendingBatch
    this.pendingBatch = null

    console.log(`🚀 Executing GraphQL batch with ${batch.requests.length} queries`)

    try {
      // Se apenas uma query, executar como single
      if (batch.requests.length === 1) {
        await this.executeSingle(batch.requests[0])
        return
      }

      // Executar como batch
      const batchPayload = batch.requests.map(req => ({
        id: req.id,
        query: req.query,
        variables: req.variables
      }))

      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          queries: batchPayload,
          batch: true 
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const results = await response.json()

      // Resolver cada request individual
      batch.requests.forEach((request, index) => {
        const result = results[index] || results.find((r: any) => r.id === request.id)
        
        if (result?.errors) {
          request.reject(new Error(result.errors[0]?.message || 'GraphQL error'))
        } else {
          request.resolve(result?.data || result)
        }
      })

    } catch (error) {
      console.error('GraphQL batch execution failed:', error)
      
      // Rejeitar todas as queries do batch
      batch.requests.forEach(request => {
        request.reject(error)
      })
    }
  }

  private async executeSingle(request: GraphQLRequest) {
    try {
      console.log(`⚡ Executing single GraphQL query: ${request.id}`)

      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: request.query,
          variables: request.variables
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()

      if (result.errors) {
        request.reject(new Error(result.errors[0]?.message || 'GraphQL error'))
      } else {
        request.resolve(result.data)
      }

    } catch (error) {
      console.error(`GraphQL single execution failed for ${request.id}:`, error)
      request.reject(error)
    }
  }

  /**
   * Prefetch de queries comuns
   */
  async prefetch(queries: Array<{ query: string; variables?: Record<string, any> }>) {
    const prefetchPromises = queries.map(({ query, variables }) =>
      this.query(query, variables, { cache: true, priority: 'low' })
        .catch(error => {
          console.warn('Prefetch failed:', error)
          return null
        })
    )

    return Promise.allSettled(prefetchPromises)
  }

  /**
   * Invalidar cache específico ou por padrão
   */
  invalidateCache(pattern?: string | RegExp) {
    if (!pattern) {
      this.queryCache.clear()
      console.log('🗑️ GraphQL cache cleared')
      return
    }

    const keysToDelete: string[] = []
    
    for (const key of this.queryCache.keys()) {
      if (typeof pattern === 'string') {
        if (key.includes(pattern)) {
          keysToDelete.push(key)
        }
      } else if (pattern.test(key)) {
        keysToDelete.push(key)
      }
    }

    keysToDelete.forEach(key => this.queryCache.delete(key))
    console.log(`🗑️ GraphQL cache invalidated: ${keysToDelete.length} entries`)
  }

  /**
   * Estatísticas do cache
   */
  getCacheStats() {
    const now = Date.now()
    const entries = Array.from(this.queryCache.entries())
    
    return {
      totalEntries: entries.length,
      validEntries: entries.filter(([, entry]) => (now - entry.timestamp) < entry.ttl).length,
      expiredEntries: entries.filter(([, entry]) => (now - entry.timestamp) >= entry.ttl).length,
      cacheSize: JSON.stringify(Array.from(this.queryCache.values())).length
    }
  }

  /**
   * Configurar endpoint
   */
  setEndpoint(endpoint: string) {
    this.endpoint = endpoint
  }

  /**
   * Cleanup de cache expirado
   */
  cleanupExpiredCache() {
    const now = Date.now()
    const expiredKeys: string[] = []
    
    for (const [key, entry] of this.queryCache) {
      if ((now - entry.timestamp) >= entry.ttl) {
        expiredKeys.push(key)
      }
    }
    
    expiredKeys.forEach(key => this.queryCache.delete(key))
    
    if (expiredKeys.length > 0) {
      console.log(`🧹 Cleaned up ${expiredKeys.length} expired GraphQL cache entries`)
    }
  }
}

// Instância singleton
export const gqlOptimizer = new GraphQLOptimizer()

// Cleanup automático de cache a cada 5 minutos
if (typeof window !== 'undefined') {
  setInterval(() => {
    gqlOptimizer.cleanupExpiredCache()
  }, 5 * 60 * 1000)
}

/**
 * Hook React para GraphQL otimizado
 */
export function useOptimizedGraphQL<T = any>(
  query: string,
  variables?: Record<string, any>,
  options: {
    cache?: boolean
    enabled?: boolean
    refetchInterval?: number
  } = {}
) {
  const { cache = true, enabled = true, refetchInterval } = options
  
  const [data, setData] = React.useState<T | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<Error | null>(null)

  const execute = React.useCallback(async () => {
    if (!enabled || !query) return

    try {
      setLoading(true)
      setError(null)
      
      const result = await gqlOptimizer.query<T>(query, variables, { cache })
      setData(result)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [query, variables, cache, enabled])

  React.useEffect(() => {
    execute()
  }, [execute])

  // Refetch automático se configurado
  React.useEffect(() => {
    if (!refetchInterval || !enabled) return

    const interval = setInterval(execute, refetchInterval)
    return () => clearInterval(interval)
  }, [execute, refetchInterval, enabled])

  return { data, loading, error, refetch: execute }
}

// Debugging
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).gqlOptimizer = gqlOptimizer
}
