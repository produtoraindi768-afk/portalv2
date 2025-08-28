/**
 * Otimizador para conexões WebSocket
 * Resolve problemas de conexões pending e timeout
 */

interface WebSocketConfig {
  url: string
  protocols?: string[]
  timeout?: number
  reconnectInterval?: number
  maxReconnectAttempts?: number
}

interface WebSocketState {
  connection: WebSocket | null
  isConnecting: boolean
  reconnectAttempts: number
  lastConnectTime: number
}

class WebSocketOptimizer {
  private connections = new Map<string, WebSocketState>()
  private readonly DEFAULT_TIMEOUT = 5000 // 5 segundos
  private readonly DEFAULT_RECONNECT_INTERVAL = 2000 // 2 segundos
  private readonly MAX_RECONNECT_ATTEMPTS = 3

  /**
   * Criar conexão WebSocket otimizada
   */
  async createOptimizedConnection(
    key: string, 
    config: WebSocketConfig
  ): Promise<WebSocket> {
    const existingState = this.connections.get(key)
    
    // Se já existe conexão ativa, retornar
    if (existingState?.connection?.readyState === WebSocket.OPEN) {
      return existingState.connection
    }

    // Se está conectando, aguardar
    if (existingState?.isConnecting) {
      return this.waitForConnection(key, config.timeout || this.DEFAULT_TIMEOUT)
    }

    return this.establishConnection(key, config)
  }

  private async establishConnection(
    key: string, 
    config: WebSocketConfig
  ): Promise<WebSocket> {
    const state: WebSocketState = {
      connection: null,
      isConnecting: true,
      reconnectAttempts: 0,
      lastConnectTime: Date.now()
    }

    this.connections.set(key, state)

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        state.isConnecting = false
        this.connections.delete(key)
        reject(new Error(`WebSocket connection timeout after ${config.timeout || this.DEFAULT_TIMEOUT}ms`))
      }, config.timeout || this.DEFAULT_TIMEOUT)

      try {
        const ws = new WebSocket(config.url, config.protocols)
        state.connection = ws

        // Otimizações de conexão
        ws.binaryType = 'arraybuffer' // Mais eficiente para dados binários

        ws.onopen = () => {
          clearTimeout(timeout)
          state.isConnecting = false
          state.reconnectAttempts = 0
          console.log(`✅ WebSocket connected: ${key}`)
          resolve(ws)
        }

        ws.onclose = (event) => {
          clearTimeout(timeout)
          state.isConnecting = false
          
          console.log(`🔌 WebSocket closed: ${key} (code: ${event.code})`)
          
          // Auto-reconectar se não foi fechamento intencional
          if (event.code !== 1000 && state.reconnectAttempts < this.MAX_RECONNECT_ATTEMPTS) {
            this.scheduleReconnect(key, config)
          } else {
            this.connections.delete(key)
          }
        }

        ws.onerror = (error) => {
          clearTimeout(timeout)
          state.isConnecting = false
          console.error(`❌ WebSocket error: ${key}`, error)
          
          // Tentar reconectar em caso de erro
          if (state.reconnectAttempts < this.MAX_RECONNECT_ATTEMPTS) {
            this.scheduleReconnect(key, config)
          } else {
            this.connections.delete(key)
            reject(error)
          }
        }

      } catch (error) {
        clearTimeout(timeout)
        state.isConnecting = false
        this.connections.delete(key)
        reject(error)
      }
    })
  }

  private async waitForConnection(key: string, timeout: number): Promise<WebSocket> {
    const startTime = Date.now()
    
    return new Promise((resolve, reject) => {
      const checkConnection = () => {
        const state = this.connections.get(key)
        
        if (state?.connection?.readyState === WebSocket.OPEN) {
          resolve(state.connection)
        } else if (Date.now() - startTime > timeout) {
          reject(new Error(`Timeout waiting for WebSocket connection: ${key}`))
        } else if (state?.isConnecting) {
          setTimeout(checkConnection, 100)
        } else {
          reject(new Error(`WebSocket connection failed: ${key}`))
        }
      }
      
      checkConnection()
    })
  }

  private scheduleReconnect(key: string, config: WebSocketConfig) {
    const state = this.connections.get(key)
    if (!state) return

    state.reconnectAttempts++
    const delay = Math.min(
      config.reconnectInterval || this.DEFAULT_RECONNECT_INTERVAL * state.reconnectAttempts,
      10000 // Max 10 segundos
    )

    console.log(`🔄 Scheduling WebSocket reconnect for ${key} in ${delay}ms (attempt ${state.reconnectAttempts})`)

    setTimeout(() => {
      this.establishConnection(key, config).catch(error => {
        console.error(`Failed to reconnect WebSocket ${key}:`, error)
      })
    }, delay)
  }

  /**
   * Fechar conexão específica
   */
  closeConnection(key: string) {
    const state = this.connections.get(key)
    if (state?.connection) {
      state.connection.close(1000) // Normal closure
    }
    this.connections.delete(key)
  }

  /**
   * Fechar todas as conexões
   */
  closeAllConnections() {
    for (const [key, state] of this.connections) {
      if (state.connection) {
        state.connection.close(1000)
      }
    }
    this.connections.clear()
  }

  /**
   * Status das conexões
   */
  getConnectionStatus() {
    const status = new Map<string, string>()
    
    for (const [key, state] of this.connections) {
      if (state.isConnecting) {
        status.set(key, 'CONNECTING')
      } else if (state.connection) {
        switch (state.connection.readyState) {
          case WebSocket.CONNECTING: status.set(key, 'CONNECTING'); break
          case WebSocket.OPEN: status.set(key, 'OPEN'); break
          case WebSocket.CLOSING: status.set(key, 'CLOSING'); break
          case WebSocket.CLOSED: status.set(key, 'CLOSED'); break
          default: status.set(key, 'UNKNOWN')
        }
      } else {
        status.set(key, 'DISCONNECTED')
      }
    }
    
    return status
  }

  /**
   * Ping/Pong para manter conexões ativas
   */
  enableKeepAlive(key: string, interval: number = 30000) {
    const state = this.connections.get(key)
    if (!state?.connection) return

    const keepAlive = setInterval(() => {
      const currentState = this.connections.get(key)
      if (currentState?.connection?.readyState === WebSocket.OPEN) {
        try {
          // Enviar ping (formato pode variar dependendo do servidor)
          currentState.connection.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }))
        } catch (error) {
          console.warn(`Failed to send keep-alive ping for ${key}:`, error)
          clearInterval(keepAlive)
        }
      } else {
        clearInterval(keepAlive)
      }
    }, interval)
  }
}

// Instância singleton
export const wsOptimizer = new WebSocketOptimizer()

// Cleanup automático no unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    wsOptimizer.closeAllConnections()
  })
}

/**
 * Hook React para WebSocket otimizado
 */
export function useOptimizedWebSocket(
  key: string, 
  url: string, 
  options: Omit<WebSocketConfig, 'url'> = {}
) {
  const [connection, setConnection] = React.useState<WebSocket | null>(null)
  const [status, setStatus] = React.useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected')

  React.useEffect(() => {
    let mounted = true

    const connect = async () => {
      try {
        setStatus('connecting')
        const ws = await wsOptimizer.createOptimizedConnection(key, { url, ...options })
        
        if (mounted) {
          setConnection(ws)
          setStatus('connected')
          
          // Enable keep-alive
          wsOptimizer.enableKeepAlive(key)
        }
      } catch (error) {
        if (mounted) {
          setStatus('error')
          console.error('WebSocket connection failed:', error)
        }
      }
    }

    connect()

    return () => {
      mounted = false
      wsOptimizer.closeConnection(key)
    }
  }, [key, url])

  return { connection, status }
}

// Debugging
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).wsOptimizer = wsOptimizer
}
