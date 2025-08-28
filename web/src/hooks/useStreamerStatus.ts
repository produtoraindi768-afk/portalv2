/**
 * Hook para gerenciar status de streamers sem API externa
 * Usa apenas dados do Firestore e permite atualizações manuais
 */

import { useState, useEffect, useCallback } from 'react'
import { useStreamers } from './useStreamers'

interface StreamerStatus {
  isOnline: boolean
  lastUpdated: number
  platform: string
}

interface UseStreamerStatusReturn {
  getStreamerStatus: (streamerId: string) => StreamerStatus | null
  updateStreamerStatus: (streamerId: string, isOnline: boolean) => void
  refreshStatuses: () => void
  isLoading: boolean
}

export function useStreamerStatus(): UseStreamerStatusReturn {
  const { streamers, loading: streamersLoading } = useStreamers()
  const [statusMap, setStatusMap] = useState<Record<string, StreamerStatus>>({})
  const [isLoading, setIsLoading] = useState(false)

  // Inicializar status map com dados do Firestore
  useEffect(() => {
    if (!streamersLoading && streamers.length > 0) {
      const initialStatusMap: Record<string, StreamerStatus> = {}
      
      streamers.forEach(streamer => {
        initialStatusMap[streamer.id] = {
          isOnline: Boolean(streamer.isOnline),
          lastUpdated: Date.now(),
          platform: streamer.platform || 'unknown'
        }
      })
      
      setStatusMap(initialStatusMap)
    }
  }, [streamers, streamersLoading])

  // Função para obter status de um streamer
  const getStreamerStatus = useCallback((streamerId: string): StreamerStatus | null => {
    return statusMap[streamerId] || null
  }, [statusMap])

  // Função para atualizar status manualmente
  const updateStreamerStatus = useCallback((streamerId: string, isOnline: boolean) => {
    setStatusMap(prev => ({
      ...prev,
      [streamerId]: {
        ...prev[streamerId],
        isOnline,
        lastUpdated: Date.now()
      }
    }))
  }, [])

  // Função para refresh dos status (recarrega do Firestore)
  const refreshStatuses = useCallback(() => {
    setIsLoading(true)
    
    // Simular um pequeno delay para UX
    setTimeout(() => {
      if (streamers.length > 0) {
        const refreshedStatusMap: Record<string, StreamerStatus> = {}
        
        streamers.forEach(streamer => {
          refreshedStatusMap[streamer.id] = {
            isOnline: Boolean(streamer.isOnline),
            lastUpdated: Date.now(),
            platform: streamer.platform || 'unknown'
          }
        })
        
        setStatusMap(refreshedStatusMap)
      }
      setIsLoading(false)
    }, 500)
  }, [streamers])

  return {
    getStreamerStatus,
    updateStreamerStatus,
    refreshStatuses,
    isLoading: isLoading || streamersLoading
  }
}

/**
 * Hook simplificado para um único streamer
 */
export function useSingleStreamerStatus(streamerId: string) {
  const { getStreamerStatus, updateStreamerStatus } = useStreamerStatus()
  
  const status = getStreamerStatus(streamerId)
  
  const toggleStatus = useCallback(() => {
    if (status) {
      updateStreamerStatus(streamerId, !status.isOnline)
    }
  }, [streamerId, status, updateStreamerStatus])

  return {
    isOnline: status?.isOnline ?? false,
    lastUpdated: status?.lastUpdated ?? 0,
    platform: status?.platform ?? 'unknown',
    toggleStatus
  }
}

/**
 * Hook para verificar se um streamer está online baseado apenas no Firestore
 */
export function useIsStreamerOnline(streamerId: string): boolean {
  const { getStreamerStatus } = useStreamerStatus()
  const status = getStreamerStatus(streamerId)
  return status?.isOnline ?? false
}

/**
 * Utilitário para simular mudanças de status (para testes)
 */
export function createMockStatusUpdater() {
  const { updateStreamerStatus } = useStreamerStatus()
  
  return {
    setOnline: (streamerId: string) => updateStreamerStatus(streamerId, true),
    setOffline: (streamerId: string) => updateStreamerStatus(streamerId, false),
    toggle: (streamerId: string, currentStatus: boolean) => updateStreamerStatus(streamerId, !currentStatus)
  }
}
