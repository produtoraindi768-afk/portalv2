/**
 * Componente para gerenciar status de streamers manualmente
 * Útil para simular streamers online/offline sem API externa
 */

"use client"

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useStreamers } from '@/hooks/useStreamers'
import { useStreamerStatus } from '@/hooks/useStreamerStatus'
import { RefreshCw, Power, PowerOff, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

export function StreamerStatusManager() {
  const { streamers, loading: streamersLoading } = useStreamers()
  const { getStreamerStatus, updateStreamerStatus, refreshStatuses, isLoading } = useStreamerStatus()

  if (streamersLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gerenciador de Status</CardTitle>
          <CardDescription>Carregando streamers...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const handleToggleStatus = (streamerId: string, currentStatus: boolean) => {
    updateStreamerStatus(streamerId, !currentStatus)
  }

  const handleSetAllOnline = () => {
    streamers.forEach(streamer => {
      updateStreamerStatus(streamer.id, true)
    })
  }

  const handleSetAllOffline = () => {
    streamers.forEach(streamer => {
      updateStreamerStatus(streamer.id, false)
    })
  }

  const onlineCount = streamers.filter(streamer => {
    const status = getStreamerStatus(streamer.id)
    return status?.isOnline
  }).length

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Gerenciador de Status
            </CardTitle>
            <CardDescription>
              Gerencie o status online/offline dos streamers manualmente
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-sm">
              {onlineCount}/{streamers.length} online
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshStatuses}
              disabled={isLoading}
            >
              <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Controles globais */}
        <div className="flex gap-2 p-3 bg-muted/50 rounded-lg">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSetAllOnline}
            className="flex-1"
          >
            <Power className="w-4 h-4 mr-2" />
            Todos Online
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSetAllOffline}
            className="flex-1"
          >
            <PowerOff className="w-4 h-4 mr-2" />
            Todos Offline
          </Button>
        </div>

        {/* Lista de streamers */}
        <div className="space-y-2">
          {streamers.map(streamer => {
            const status = getStreamerStatus(streamer.id)
            const isOnline = status?.isOnline ?? false
            
            return (
              <div
                key={streamer.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={streamer.avatar} alt={streamer.name} />
                      <AvatarFallback>
                        {streamer.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {isOnline && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                    )}
                  </div>
                  
                  <div>
                    <div className="font-medium">{streamer.name}</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {streamer.platform}
                      </Badge>
                      {status?.lastUpdated && (
                        <span className="text-xs">
                          Atualizado: {new Date(status.lastUpdated).toLocaleTimeString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge 
                    variant={isOnline ? "default" : "outline"}
                    className={cn(
                      "text-xs",
                      isOnline 
                        ? "bg-green-500/10 text-green-700 border-green-500/20" 
                        : "bg-gray-500/10 text-gray-700 border-gray-500/20"
                    )}
                  >
                    {isOnline ? 'Online' : 'Offline'}
                  </Badge>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleStatus(streamer.id, isOnline)}
                    className={cn(
                      "w-20",
                      isOnline 
                        ? "hover:bg-red-50 hover:border-red-200 hover:text-red-700" 
                        : "hover:bg-green-50 hover:border-green-200 hover:text-green-700"
                    )}
                  >
                    {isOnline ? (
                      <>
                        <PowerOff className="w-3 h-3 mr-1" />
                        Off
                      </>
                    ) : (
                      <>
                        <Power className="w-3 h-3 mr-1" />
                        On
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )
          })}
        </div>

        {streamers.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum streamer encontrado</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * Componente compacto para mostrar status geral
 */
export function StreamerStatusSummary() {
  const { streamers } = useStreamers()
  const { getStreamerStatus } = useStreamerStatus()

  const onlineCount = streamers.filter(streamer => {
    const status = getStreamerStatus(streamer.id)
    return status?.isOnline
  }).length

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <div className="w-2 h-2 bg-green-500 rounded-full" />
      <span>{onlineCount} de {streamers.length} streamers online</span>
    </div>
  )
}
