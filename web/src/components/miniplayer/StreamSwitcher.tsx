"use client"

import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Tooltip, 
  TooltipContent, 
  TooltipTrigger 
} from '@/components/animate-ui/components/tooltip'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ChevronDown, Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { StreamSwitcherProps } from '@/lib/miniplayer-types'

export function StreamSwitcher({
  streamers,
  currentIndex,
  onStreamChange,
  className,
  isMinimized
}: StreamSwitcherProps) {
  const currentStreamer = streamers[currentIndex]

  if (!currentStreamer || streamers.length <= 1) {
    return null
  }

  return (
    <div className={cn("flex items-center min-w-0", className)}>
      {/* Barra compacta de avatares quando há múltiplos streamers */}
      {streamers.length > 1 && (
        <div className="flex items-center gap-3 mr-2">
          {/* Exibir no máximo 3 avatares no topo */}
          {streamers.slice(0, 3).map((streamer, index) => {
            const isActive = index === currentIndex
            const isOnline = streamer.isOnline

            return (
              <Tooltip key={streamer.id} side="bottom" sideOffset={8}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "h-6 w-6 p-0 rounded-full relative",
                      {
                        "ring-2 ring-primary ring-offset-1 ring-offset-background": isActive,
                        "opacity-60": !isOnline && !isActive
                      }
                    )}
                    onClick={() => onStreamChange(index)}
                  >
                    <Avatar className="h-5 w-5">
                      <AvatarImage
                        src={streamer.avatarUrl}
                        alt={streamer.name}
                      />
                      <AvatarFallback className="text-xs">
                        {streamer.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>



                    {/* Indicador online */}
                    {isOnline && (
                      <div className="absolute -bottom-0.5 -right-0.5 h-2 w-2 bg-green-500 rounded-full border border-background animate-pulse" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-center">
                    <p className="font-medium">{streamer.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {streamer.category}
                    </p>
                    <div className="flex items-center justify-center gap-1 mt-1">
                      <Badge
                        variant={isOnline ? "default" : "outline"}
                        className="h-4 text-xs px-1"
                      >
                        {isOnline ? 'Ao vivo' : 'Offline'}
                      </Badge>
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            )
          })}

          {/* Indicador +N quando houver mais que 3 */}
          {streamers.length > 3 && (
            <Tooltip side="bottom" sideOffset={8}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-[10px] font-semibold"
                  aria-label={`Mais ${streamers.length - 3} streamers`}
                >
                  +{streamers.length - 3}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Mais {streamers.length - 3} streamers</p>
              </TooltipContent>
            </Tooltip>
          )}

          {/* Mantido: seleção completa via menu (abaixo, com Chevron). */}
          {false && streamers.length > 4 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center justify-center">
                        <span className="text-xs font-medium">
                          +{streamers.length - 4}
                        </span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>Ver mais streamers</p>
                    </TooltipContent>
                  </Tooltip>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {streamers.slice(4).map((streamer, index) => {
                  const actualIndex = index + 4
                  const isActive = actualIndex === currentIndex

                  return (
                    <DropdownMenuItem
                      key={streamer.id}
                      onClick={() => onStreamChange(actualIndex)}
                      className={cn({
                        "bg-accent": isActive
                      })}
                    >
                      <div className="flex items-center gap-2 w-full">
                        <div className="relative">
                          <Avatar className="h-6 w-6">
                            <AvatarImage
                              src={streamer.avatarUrl}
                              alt={streamer.name}
                            />
                            <AvatarFallback className="text-xs">
                              {streamer.name.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          {streamer.isOnline && (
                            <div className="absolute -bottom-0.5 -right-0.5 h-2 w-2 bg-green-500 rounded-full border border-background" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1">
                            <p className="text-sm font-medium truncate">
                              {streamer.name}
                            </p>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {streamer.category} • {streamer.isOnline ? 'Ao vivo' : 'Offline'}
                          </p>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  )
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      )}

      {/* Informações do streamer atual */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          {!isMinimized && (
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <p className="text-sm font-medium text-card-foreground truncate">
                  {currentStreamer.name}
                </p>
                {currentStreamer.isOnline && (
                  <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                )}
              </div>
              {currentStreamer.category && (
                <p className="text-xs text-muted-foreground truncate">
                  {currentStreamer.category}
                </p>
              )}
            </div>
          )}

          {/* Dropdown para trocar streamer no modo compacto */}
          {streamers.length > 1 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {streamers.map((streamer, index) => {
                  const isActive = index === currentIndex

                  return (
                    <DropdownMenuItem
                      key={streamer.id}
                      onClick={() => onStreamChange(index)}
                      className={cn({
                        "bg-accent": isActive
                      })}
                    >
                      <div className="flex items-center gap-2 w-full">
                        <div className="relative">
                          <Avatar className="h-6 w-6">
                            <AvatarImage
                              src={streamer.avatarUrl}
                              alt={streamer.name}
                            />
                            <AvatarFallback className="text-xs">
                              {streamer.name.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          {streamer.isOnline && (
                            <div className="absolute -bottom-0.5 -right-0.5 h-2 w-2 bg-green-500 rounded-full border border-background" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1">
                            <p className="text-sm font-medium truncate">
                              {streamer.name}
                            </p>
                            {streamer.isFeatured && (
                              <Star className="h-3 w-3 text-yellow-500 fill-current" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {streamer.category} • {streamer.isOnline ? 'Ao vivo' : 'Offline'}
                          </p>
                        </div>
                        {isActive && (
                          <div className="h-2 w-2 bg-primary rounded-full" />
                        )}
                      </div>
                    </DropdownMenuItem>
                  )
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </div>
  )
}