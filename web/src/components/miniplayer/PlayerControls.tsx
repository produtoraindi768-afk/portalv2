"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { 
  Tooltip, 
  TooltipContent, 
  TooltipTrigger,
  TooltipProvider 
} from '@/components/animate-ui/components/tooltip'
import { Slider } from '@/components/ui/slider'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Minimize2,
  Maximize2,
  Volume2,
  VolumeX,
  X,
  ExternalLink,
  MoreVertical
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { PlayerControlsProps } from '@/lib/miniplayer-types'

export function PlayerControls({
  isMinimized,
  isMuted,
  volume,
  canShowVolumeSlider,
  onMinimizeToggle,
  onMuteToggle,
  onVolumeChange,
  onClose,
  onOpenTwitch,
  className
}: PlayerControlsProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  return (
    <TooltipProvider openDelay={500} closeDelay={150}>
      <div className={cn("flex items-center gap-1", className)}>
      {/* Controle de volume */}
      {canShowVolumeSlider ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" aria-label={isMuted ? 'Ativar som' : 'Silenciar'}>
              <Tooltip side="bottom" sideOffset={8}>
                <TooltipTrigger asChild>
                  <div>
                    {isMuted ? (
                      <VolumeX className="h-3 w-3" />
                    ) : (
                      <Volume2 className="h-3 w-3" />
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-center">
                    <p className="font-medium">{isMuted ? 'Ativar som' : 'Silenciar'}</p>
                    <p className="text-xs text-muted-foreground mt-1">Clique para ajustar volume</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-32 p-2" align="end">
            <div className="space-y-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onMuteToggle}
                className="w-full justify-start h-6 text-xs"
              >
                {isMuted ? (
                  <>
                    <VolumeX className="h-3 w-3 mr-2" />
                    Ativar som
                  </>
                ) : (
                  <>
                    <Volume2 className="h-3 w-3 mr-2" />
                    Silenciar
                  </>
                )}
              </Button>
              {!isMuted && (
                <div className="px-2">
                  <Slider
                    value={[volume]}
                    onValueChange={(values) => onVolumeChange(values[0])}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                  <div className="text-xs text-muted-foreground text-center mt-1">
                    {volume}%
                  </div>
                </div>
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        // Controle simples de mute/unmute para MVP
        <Tooltip side="bottom" sideOffset={8}>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={onMuteToggle}
              className="h-6 w-6 p-0"
              aria-label={isMuted ? 'Ativar som' : 'Silenciar'}
            >
              {isMuted ? (
                <VolumeX className="h-3 w-3" />
              ) : (
                <Volume2 className="h-3 w-3" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-center">
              <p className="font-medium">{isMuted ? 'Ativar som' : 'Silenciar'}</p>
              <p className="text-xs text-muted-foreground mt-1">Tecla M</p>
            </div>
          </TooltipContent>
        </Tooltip>
      )}

      {/* Menu de opções adicionais */}
      <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            aria-label="Mais opções"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <Tooltip side="bottom" sideOffset={8}>
              <TooltipTrigger asChild>
                <MoreVertical className="h-3 w-3" />
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-center">
                  <p className="font-medium">Mais opções</p>
                  <p className="text-xs text-muted-foreground mt-1">Controles avançados</p>
                </div>
              </TooltipContent>
            </Tooltip>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <div className="p-1 space-y-1">
            {/* Abrir no Twitch */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onOpenTwitch}
              className="w-full justify-start h-8 text-sm"
            >
              <ExternalLink className="h-3 w-3 mr-2" />
              Abrir no Twitch
            </Button>

            {/* Minimizar/Expandir */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onMinimizeToggle}
              className="w-full justify-start h-8 text-sm"
            >
              {isMinimized ? (
                <>
                  <Maximize2 className="h-3 w-3 mr-2" />
                  Expandir
                </>
              ) : (
                <>
                  <Minimize2 className="h-3 w-3 mr-2" />
                  Minimizar
                </>
              )}
            </Button>
          </div>

          <div className="border-t border-border my-1" />

          {/* Fechar */}
          <div className="p-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="w-full justify-start h-8 text-sm text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <X className="h-3 w-3 mr-2" />
              Fechar miniplayer
            </Button>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
      </div>
    </TooltipProvider>
  )
}