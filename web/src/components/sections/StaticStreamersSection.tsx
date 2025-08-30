"use client"

import React, { useState, useEffect } from 'react'
import { collection, getDocs, query } from "firebase/firestore"
import { getClientFirestore } from "@/lib/safeFirestore"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { SmoothTransition, SmoothHover, ScrollReveal } from "@/components/ui/smooth-transitions"
import { OptimizedAvatar } from "@/components/ui/optimized-avatar"
import { useResponsive } from "@/hooks/useResponsive"
import { twitchStatusService } from "@/lib/twitch-status"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { Play, Users, Dot } from "lucide-react"

type StreamerDoc = {
  id: string
  name?: string
  platform?: string
  streamUrl?: string
  avatarUrl?: string
  category?: string
  isOnline?: boolean
  isFeatured?: boolean
  createdAt?: string
  lastStatusUpdate?: string
  viewerCount?: number
  language?: string
}

// Card de streamer Apple-inspired com componentes shadcn/ui
function StreamerCard({ 
  streamer, 
  isSelected, 
  onClick 
}: { 
  streamer: StreamerDoc
  isSelected: boolean
  onClick: () => void 
}) {
  return (
    <Card
      onClick={onClick}
      className={cn(
        // Base styling Apple-inspired com glass morphism
        "relative cursor-pointer group transition-all duration-500 ease-out",
        "bg-background/60 backdrop-blur-xl border border-border/30 rounded-3xl",
        "hover:bg-background/80 hover:border-border/50 hover:scale-[1.05]",
        "hover:shadow-xl hover:shadow-primary/20 hover:translate-y-[-6px]",
        "aspect-square w-full apple-hover apple-glass", // Classes Apple conforme especificação
        // Estado selecionado com destaque premium
        isSelected 
          ? "border-primary/60 bg-primary/12 shadow-xl shadow-primary/30 scale-[1.05] translate-y-[-6px] ring-2 ring-primary/20" 
          : "",
        // Overflow hidden para evitar cortes
        "overflow-hidden"
      )}
    >
      <CardContent className="flex flex-col items-center justify-center h-full p-2 space-y-1.5"> {/* padding e spacing reduzidos */}
        
        {/* Foto do perfil com efeitos premium */}
        <div className="relative">
          <div className={cn(
            "relative rounded-full ring-2 transition-all duration-300",
            isSelected 
              ? "ring-primary/30 shadow-lg shadow-primary/20" 
              : "ring-border/20 group-hover:ring-primary/20"
          )}>
            <Avatar className={cn(
              "transition-all duration-300 border-2 border-background",
              isSelected ? "w-8 h-8" : "w-7 h-7 group-hover:w-8 group-hover:h-8" // tamanhos muito menores
            )}>
              <AvatarImage 
                src={streamer.avatarUrl} 
                alt={streamer.name}
                className="object-cover"
              />
              <AvatarFallback className={cn(
                "font-medium text-foreground/80 bg-gradient-to-br from-muted/80 to-muted/60",
                isSelected ? "text-base" : "text-sm"
              )}>
                {streamer.name?.charAt(0).toUpperCase() || 'S'}
              </AvatarFallback>
            </Avatar>
          </div>
          
          {/* Status online premium com animação */}
          {streamer.isOnline && (
            <Badge 
              variant="outline" 
              className={cn(
                "absolute -bottom-1 -right-1 h-5 w-5 p-0 border-2 border-background",
                "bg-green-500 hover:bg-green-500 rounded-full flex items-center justify-center"
              )}
            >
              <Dot className="w-3 h-3 text-white animate-pulse" />
            </Badge>
          )}
        </div>

        {/* Separator com gradiente Apple */}
        <div className="w-8 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        
        {/* Nome do streamer com tipografia Apple */}
        <div className="text-center space-y-1">
          <h3 className={cn(
            "font-medium tracking-tight transition-all duration-300 text-sm leading-tight",
            "text-foreground/90 group-hover:text-primary",
            isSelected && "text-primary font-medium"
          )}>
            {streamer.name || 'Streamer'}
          </h3>
          
          {/* Indicador sutil de seleção */}
          {isSelected && (
            <div className="flex justify-center">
              <div className="w-1 h-1 rounded-full bg-primary animate-pulse" />
            </div>
          )}
        </div>
        
      </CardContent>
    </Card>
  )
}

// Player principal da Twitch com design Apple-inspired
function MainTwitchPlayer({ channel }: { channel: string | null }) {
  const embedUrl = React.useMemo(() => {
    if (!channel) return null

    const params = new URLSearchParams({
      channel: channel,
      autoplay: 'true',
      muted: 'false',
      controls: 'true',
      playsinline: 'true'
    })

    const parents = new Set<string>()
    if (typeof window !== 'undefined' && window.location.hostname) {
      parents.add(window.location.hostname)
    }
    parents.add('localhost')
    parents.forEach((p) => params.append('parent', p))

    return `https://player.twitch.tv/?${params.toString()}`
  }, [channel])

  if (!channel || !embedUrl) {
    return (
      <Card className="w-full h-full bg-gradient-to-br from-background/80 to-muted/30 backdrop-blur-xl border border-border/30 rounded-3xl apple-glass">
        <CardContent className="w-full h-full flex items-center justify-center p-8">
          <div className="text-center space-y-6">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
              <Play className="relative w-20 h-20 text-primary/80 mx-auto" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-medium tracking-tight text-foreground">
                Selecione um streamer
              </h3>
              <p className="text-muted-foreground font-medium text-sm">
                Escolha um card abaixo para assistir à stream
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full h-full overflow-hidden rounded-3xl border border-border/30 shadow-xl apple-glass">
      <AspectRatio ratio={16 / 9} className="w-full h-full">
        <iframe
          src={embedUrl}
          className="w-full h-full border-0"
          frameBorder="0"
          allowFullScreen
          scrolling="no"
          title={`${channel} - Twitch Stream`}
          allow="autoplay; fullscreen; encrypted-media"
        />
      </AspectRatio>
    </Card>
  )
}

export function StaticStreamersSection() {
  const [streamers, setStreamers] = useState<StreamerDoc[]>([])
  const [selectedStreamer, setSelectedStreamer] = useState<StreamerDoc | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { isMobile, isTablet, prefersReducedMotion } = useResponsive()

  // Carregar streamers do Firebase
  useEffect(() => {
    const loadStreamers = async () => {
      // DESABILITADO: StaticStreamersSection não é usado na página principal
      // Para evitar requests duplicados, retorna vazio
      console.warn('StaticStreamersSection está desabilitado para evitar requests duplicados')
      setStreamers([])
      setIsLoading(false)
      return

      try {
        const db = getClientFirestore()
        if (!db) {
          console.error('Firebase not initialized')
          setIsLoading(false)
          return
        }

        const q = query(collection(db, "streamers"))
        const querySnapshot = await getDocs(q)
        const streamersData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as StreamerDoc[]

        const featuredStreamers = streamersData.filter(s => s.isOnline && s.isFeatured)
        console.log('Loaded featured streamers:', featuredStreamers.length)

        setStreamers(featuredStreamers)

        // Selecionar primeiro streamer automaticamente
        if (featuredStreamers.length > 0) {
          setSelectedStreamer(featuredStreamers[0])
        }
      } catch (error) {
        console.error('Error loading streamers:', error)
        setStreamers([])
      } finally {
        setIsLoading(false)
      }
    }

    loadStreamers()
  }, [])

  // Loading state com design Apple-inspired
  if (isLoading) {
    return (
      <div className="w-full space-y-6"> {/* Espaçamento compacto de 12 para 6 */}
        {/* Player skeleton premium */}
        <div className="w-full flex justify-center">
          <div className="w-full max-w-5xl aspect-video"> {/* Tamanho ligeiramente maior */}
            <Skeleton className="w-full h-full rounded-3xl bg-gradient-to-br from-muted/40 to-muted/20 backdrop-blur-sm" />
          </div>
        </div>
        
        {/* Cards skeleton com ScrollArea otimizado */}
        <div className="w-full px-6"> {/* Padding lateral conforme especificação */}
          <ScrollArea className="w-full">
            <div className="flex gap-3 pb-4"> {/* Gap reduzido de 6 para 3 */}
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex-shrink-0">
                  <div className="w-20 sm:w-24 md:w-28"> {/* Tamanhos muito menores */}
                    <Skeleton className="aspect-square rounded-3xl bg-gradient-to-br from-muted/30 to-muted/10" />
                  </div>
                </div>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      </div>
    )
  }

  // Se não há streamers - estado vazio Apple-inspired
  if (streamers.length === 0) {
    return (
      <Card className="w-full min-h-[500px] bg-gradient-to-br from-background/60 to-muted/20 backdrop-blur-xl border border-border/30 rounded-3xl apple-glass">
        <CardContent className="flex items-center justify-center h-full p-12">
          <div className="text-center space-y-8 max-w-md mx-auto">
            <div className="relative">
              <div className="absolute inset-0 bg-muted-foreground/10 rounded-full blur-xl animate-pulse" />
              <Users className="relative w-24 h-24 text-muted-foreground/60 mx-auto" />
            </div>
            <div className="space-y-3">
              <h3 className="text-2xl font-medium tracking-tight text-foreground">
                Nenhum streamer online
              </h3>
              <p className="text-muted-foreground font-medium leading-relaxed">
                Não há streamers disponíveis no momento. Volte mais tarde para assistir às melhores streams da comunidade.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Canal do streamer selecionado
  const selectedChannel = selectedStreamer 
    ? twitchStatusService.extractUsernameFromTwitchUrl(selectedStreamer.streamUrl || '')
    : null

  return (
    <ScrollReveal>
      <div className="w-full space-y-12"> {/* Espaçamento generoso conforme especificação */}
      {/* Player principal no topo com design premium */}
      <div className="w-full flex justify-center px-6">
        <div className="w-full max-w-5xl aspect-video"> {/* Tamanho ligeiramente maior */}
          <MainTwitchPlayer channel={selectedChannel} />
        </div>
      </div>

      {/* Cards dos streamers com ScrollArea otimizado */}
      <div className="w-full px-6"> {/* Padding lateral conforme especificação */}
        <ScrollArea className="w-full">
          <div className="flex gap-6 pb-12"> {/* Gap maior para respiração com padding inferior generoso */}
            {streamers.map((streamer, index) => (
              <div key={streamer.id} className="flex-shrink-0 apple-hover"> {/* Classe Apple conforme especificação */}
                <div className="w-20 sm:w-24 md:w-28"> {/* Tamanhos muito menores para cards compactos */}
                  <StreamerCard
                    streamer={streamer}
                    isSelected={selectedStreamer?.id === streamer.id}
                    onClick={() => setSelectedStreamer(streamer)}
                  />
                </div>
              </div>
            ))}
            
            {/* Slots vazios premium para mostrar capacidade */}
            {Array.from({ length: Math.max(0, 8 - streamers.length) }).map((_, index) => (
              <div key={`empty-${index}`} className="flex-shrink-0">
                <div className="w-20 sm:w-24 md:w-28"> {/* tamanhos consistentes */}
                  <Card className="aspect-square bg-gradient-to-br from-muted/10 to-muted/5 backdrop-blur-sm border-2 border-dashed border-border/30 rounded-3xl transition-all duration-300 hover:border-border/50">
                    <CardContent className="flex items-center justify-center h-full">
                      <div className="text-center space-y-2">
                        <div className="w-8 h-8 rounded-full bg-muted/20 mx-auto flex items-center justify-center">
                          <Users className="w-4 h-4 text-muted-foreground/40" />
                        </div>
                        <div className="text-xs text-muted-foreground/50 font-medium">
                          Slot {streamers.length + index + 1}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      {/* Informações do streamer selecionado - design premium */}
      {selectedStreamer && (
        <Card className="mt-12 mx-6 bg-gradient-to-br from-background/80 to-primary/5 backdrop-blur-xl border border-border/30 rounded-3xl apple-glass">
          <CardContent className="text-center p-8 space-y-6">
            {/* Avatar premium do streamer selecionado */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
                <Avatar className="relative w-20 h-20 border-4 border-background shadow-xl">
                  <AvatarImage 
                    src={selectedStreamer.avatarUrl} 
                    alt={selectedStreamer.name}
                    className="object-cover"
                  />
                  <AvatarFallback className="text-xl font-medium bg-gradient-to-br from-primary/20 to-primary/10">
                    {selectedStreamer.name?.charAt(0).toUpperCase() || 'S'}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
            
            {/* Nome com tipografia Apple premium */}
            <div className="space-y-3">
              <h2 className="text-2xl font-medium tracking-tight text-foreground">
                {selectedStreamer.name}
              </h2>
              
              {/* Separator com gradiente Apple */}
              <div className="flex justify-center">
                <div className="w-20 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
              </div>
            </div>
            
            {/* Status online premium */}
            {selectedStreamer.isOnline && (
              <Badge variant="outline" className="bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-300">
                <Dot className="w-4 h-4 text-green-500 animate-pulse mr-1" />
                <span className="font-medium">Transmitindo ao vivo</span>
              </Badge>
            )}
          </CardContent>
        </Card>
      )}
      </div>
    </ScrollReveal>
  )
}