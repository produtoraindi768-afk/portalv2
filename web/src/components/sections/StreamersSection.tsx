"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { collection, getDocs, query, where } from "firebase/firestore"
import { getClientFirestore } from "@/lib/safeFirestore"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BlookieEmbed } from "@/components/blookie/BlookieEmbed"
import { useMiniplPlayerControl } from "@/components/miniplayer/MiniplPlayerProvider"
import { Play, ChevronLeft, ChevronRight, Volume2, VolumeX } from "lucide-react"
import { twitchStatusService } from "@/lib/twitch-status"

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

export function StreamersSection() {
  const [items, setItems] = useState<StreamerDoc[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isMuted, setIsMuted] = useState(true)
  const [isMiniplaying, setIsMiniplaying] = useState(false)
  const { selectedStreamer, showMiniplayer, hideMiniplayer, setMinimized } = useMiniplPlayerControl()
  const sectionRef = useRef<HTMLDivElement>(null)

  // Não filtrar streamers - usar todos os streamers disponíveis
  const filteredItems = items

  useEffect(() => {
    const db = getClientFirestore()
    if (!db) return
    ;(async () => {
      // Buscar todos os streamers primeiro, depois filtrar no cliente
      // Isso evita problemas com case sensitivity
      const q = query(collection(db, "streamers"))
      const snap = await getDocs(q)
      const data: StreamerDoc[] = snap.docs.map((d) => {
        const raw = d.data() as Record<string, unknown>
        const streamer = {
          id: d.id,
          name: typeof raw.name === "string" ? raw.name : "",
          platform: typeof raw.platform === "string" ? raw.platform.toLowerCase() : "",
          streamUrl: typeof raw.streamUrl === "string" ? raw.streamUrl : "",
          avatarUrl: typeof raw.avatarUrl === "string" ? raw.avatarUrl : "",
          category: typeof raw.category === "string" ? raw.category : "",
          isOnline: Boolean(raw.isOnline),
          isFeatured: Boolean(raw.isFeatured),
          createdAt: typeof raw.createdAt === "string" ? raw.createdAt : undefined,
          lastStatusUpdate: typeof raw.lastStatusUpdate === "string" ? raw.lastStatusUpdate : undefined,
          viewerCount: typeof raw.viewerCount === "number" ? raw.viewerCount : Math.floor(Math.random() * 500) + 50,
          language: typeof raw.language === "string" ? raw.language : "Português",
        }
        
        return streamer
      })
      
      // Filtrar apenas streamers online no cliente
      const onlineStreamers = data.filter(s => s.isOnline)
      
      // Ordenar streamers: primeiro os em destaque, depois os demais
      const sortedStreamers = onlineStreamers.sort((a, b) => {
        if (a.isFeatured && !b.isFeatured) return -1
        if (!a.isFeatured && b.isFeatured) return 1
        return 0
      })
      
      setItems(sortedStreamers)
      
      // Sempre selecionar o streamer marcado como isFeatured: true
      const featuredIndex = sortedStreamers.findIndex(s => s.isFeatured)
      if (featuredIndex !== -1) {
        setSelectedIndex(featuredIndex)
      }
    })()
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    ;(async () => {
      for (const s of items) {
        if (s.platform?.toLowerCase() === "twitch" && s.streamUrl) {
          try {
            const channel = new URL(s.streamUrl).pathname.replace("/", "")
            if (!channel) continue
            await fetch(`/api/twitch/live?channel=${encodeURIComponent(channel)}`, {
              signal: controller.signal,
              cache: "no-store",
            })
          } catch {}
        }
      }
    })()
    return () => controller.abort()
  }, [items])

  // Função para atualizar o player flutuante
  const updateMiniplayer = useCallback((shouldShow: boolean) => {
    if (shouldShow && filteredItems[selectedIndex] && !isMiniplaying) {
      const currentStreamer = filteredItems[selectedIndex]
      const streamerForMiniplayer = {
        id: currentStreamer.id,
        name: currentStreamer.name || '',
        platform: currentStreamer.platform || '',
        streamUrl: currentStreamer.streamUrl || '',
        avatarUrl: currentStreamer.avatarUrl || '',
        category: currentStreamer.category || '',
        isOnline: Boolean(currentStreamer.isOnline),
        isFeatured: Boolean(currentStreamer.isFeatured),
        twitchChannel: currentStreamer.platform === 'twitch' && currentStreamer.streamUrl
          ? twitchStatusService.extractUsernameFromTwitchUrl(currentStreamer.streamUrl) || undefined
          : undefined,
        createdAt: currentStreamer.createdAt || '',
        lastStatusUpdate: currentStreamer.lastStatusUpdate || ''
      }
      showMiniplayer(streamerForMiniplayer)
      setIsMiniplaying(true)
    }
    // Remover a parte que esconde o player - agora ele apenas minimiza
  }, [filteredItems, selectedIndex, isMiniplaying, showMiniplayer])

  // Observador de scroll para controlar o player flutuante
  useEffect(() => {
    const section = sectionRef.current
    if (!section || filteredItems.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        // Se a seção está visível = minimizar, se não está visível = expandir
        const isInStreamersSection = entry.isIntersecting
        
        if (!isMiniplaying) {
          // Se o player não está ativo e saiu da seção, ativar o player expandido
          if (!isInStreamersSection) {
            updateMiniplayer(true)
            setMinimized(false) // Garantir que inicia expandido
          }
        } else {
          // Se o player já está ativo, sempre controlar o estado minimizado baseado na seção
          setMinimized(isInStreamersSection) 
          // Quando volta para a seção: minimizar (stream já sendo exibida na seção principal)
          // Quando sai da seção: expandir (precisa do player flutuante)
        }
      },
      {
        threshold: 0.1,
        rootMargin: '-50px 0px'
      }
    )

    observer.observe(section)

    return () => {
      observer.disconnect()
    }
  }, [filteredItems, updateMiniplayer, isMiniplaying, setMinimized])

  // Atualizar player flutuante quando a seleção mudar
  useEffect(() => {
    // Só atualizar se o miniplayer estiver ativo e houver um streamer selecionado
    if (isMiniplaying && filteredItems[selectedIndex]) {
      const currentStreamer = filteredItems[selectedIndex]
      const streamerForMiniplayer = {
        id: currentStreamer.id,
        name: currentStreamer.name || '',
        platform: currentStreamer.platform || '',
        streamUrl: currentStreamer.streamUrl || '',
        avatarUrl: currentStreamer.avatarUrl || '',
        category: currentStreamer.category || '',
        isOnline: Boolean(currentStreamer.isOnline),
        isFeatured: Boolean(currentStreamer.isFeatured),
        twitchChannel: currentStreamer.platform === 'twitch' && currentStreamer.streamUrl
          ? twitchStatusService.extractUsernameFromTwitchUrl(currentStreamer.streamUrl) || undefined
          : undefined,
        createdAt: currentStreamer.createdAt || '',
        lastStatusUpdate: currentStreamer.lastStatusUpdate || ''
      }
      
      showMiniplayer(streamerForMiniplayer)
    }
  }, [selectedIndex, filteredItems, showMiniplayer, isMiniplaying])

  const nextStream = () => {
    setSelectedIndex((prev) => (prev + 1) % filteredItems.length)
  }

  const prevStream = () => {
    setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length)
  }

  if (filteredItems.length === 0) {
    return null
  }

  // Sempre mostrar exatamente 3 players
  const getVisibleStreams = () => {
    if (filteredItems.length === 0) return []
    if (filteredItems.length === 1) {
      return [{
        streamer: filteredItems[0],
        position: 'center' as const,
        isSelected: true
      }]
    }
    if (filteredItems.length === 2) {
      return [
        {
          streamer: filteredItems[0],
          position: selectedIndex === 0 ? 'center' as const : 'left' as const,
          isSelected: selectedIndex === 0
        },
        {
          streamer: filteredItems[1],
          position: selectedIndex === 1 ? 'center' as const : 'right' as const,
          isSelected: selectedIndex === 1
        }
      ]
    }

    // Para 3 ou mais streams, sempre mostrar 3
    const streams = []
    const totalItems = filteredItems.length

    // Stream da esquerda (anterior ao selecionado)
    const leftIndex = (selectedIndex - 1 + totalItems) % totalItems
    streams.push({
      streamer: filteredItems[leftIndex],
      position: 'left' as const,
      isSelected: false
    })

    // Stream central (selecionada)
    streams.push({
      streamer: filteredItems[selectedIndex],
      position: 'center' as const,
      isSelected: true
    })

    // Stream da direita (próxima ao selecionado)
    const rightIndex = (selectedIndex + 1) % totalItems
    streams.push({
      streamer: filteredItems[rightIndex],
      position: 'right' as const,
      isSelected: false
    })

    return streams
  }

  const visibleStreams = getVisibleStreams()

  return (
    <div ref={sectionRef} className="relative w-full h-[480px] bg-black overflow-hidden">
      {/* Fundo preto sólido igual à seção de notícias */}
      <div className="absolute inset-0 bg-black" />
      
      {/* Container das streams */}
      <div className="relative w-full h-full flex items-center justify-center">
        
        {/* Renderizar os 3 players */}
        {visibleStreams.map(({ streamer, position, isSelected }, index) => (
          <StreamCard
            key={`${streamer.id}-${position}`}
            streamer={streamer}
            position={position}
            isSelected={isSelected}
            onClick={() => {
              if (!isSelected) {
                const newIndex = filteredItems.findIndex(s => s.id === streamer.id)
                setSelectedIndex(newIndex)
              }
            }}
            isMuted={isMuted}
            onToggleMute={() => setIsMuted(!isMuted)}
          />
        ))}

        {/* Navegação com animações premium */}
        {filteredItems.length > 1 && (
          <>
            <button
              onClick={prevStream}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-50 bg-background/60 hover:bg-background/80 rounded-full p-3 transition-all duration-300 hover:scale-110 hover:-translate-x-1 group backdrop-blur-sm border border-border hover:border-primary/50"
            >
              <ChevronLeft className="h-6 w-6 text-foreground transition-all duration-300 group-hover:text-primary group-hover:scale-110" />
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/0 to-secondary/0 group-hover:from-primary/20 group-hover:to-secondary/20 transition-all duration-300" />
            </button>

            <button
              onClick={nextStream}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-50 bg-background/60 hover:bg-background/80 rounded-full p-3 transition-all duration-300 hover:scale-110 hover:translate-x-1 group backdrop-blur-sm border border-border hover:border-primary/50"
            >
              <ChevronRight className="h-6 w-6 text-foreground transition-all duration-300 group-hover:text-primary group-hover:scale-110" />
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/0 to-secondary/0 group-hover:from-primary/20 group-hover:to-secondary/20 transition-all duration-300" />
            </button>
          </>
        )}
      </div>

      {/* Indicadores de posição premium */}
      {filteredItems.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50">
          <div className="flex gap-3 bg-background/40 backdrop-blur-md rounded-full px-4 py-2 border border-border">
            {filteredItems.map((_, index) => (
              <button
                key={index}
                onClick={() => setSelectedIndex(index)}
                className={`relative transition-all duration-500 ease-out ${
                  index === selectedIndex 
                    ? 'w-8 h-3 bg-primary rounded-full scale-125' 
                    : 'w-3 h-3 bg-muted-foreground rounded-full hover:bg-foreground hover:scale-110'
                }`}
              >
                {/* Glow effect para o indicador ativo */}
                {index === selectedIndex && (
                  <div className="absolute inset-0 bg-primary rounded-full blur animate-pulse opacity-50" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function StreamCard({
  streamer,
  position,
  isSelected,
  onClick,
  isMuted,
  onToggleMute
}: {
  streamer: StreamerDoc
  position: 'left' | 'center' | 'right'
  isSelected: boolean
  onClick: () => void
  isMuted: boolean
  onToggleMute: () => void
}) {
  // Calcular posição e escala baseado na posição
  const getTransform = () => {
    switch (position) {
      case 'center':
        return 'translateX(0%) translateY(0%) scale(1) rotateY(0deg)'
      case 'left':
        return 'translateX(-85%) translateY(0%) scale(0.85) rotateY(5deg)'
      case 'right':
        return 'translateX(85%) translateY(0%) scale(0.85) rotateY(-5deg)'
      default:
        return 'translateX(0%) translateY(0%) scale(1) rotateY(0deg)'
    }
  }

  const getZIndex = () => {
    return isSelected ? 40 : 35
  }

  // Animação de entrada staggered
  const getAnimationDelay = () => {
    switch (position) {
      case 'left': return '0ms'
      case 'center': return '100ms'
      case 'right': return '200ms'
      default: return '0ms'
    }
  }

  return (
    <div
      className={`absolute transition-all duration-700 ease-out cursor-pointer hover:scale-105 ${
        isSelected ? 'drop-shadow-2xl' : 'drop-shadow-lg hover:drop-shadow-xl'
      }`}
      style={{
        transform: getTransform(),
        zIndex: getZIndex(),
        animationDelay: getAnimationDelay(),
        transformStyle: 'preserve-3d',
        perspective: '1000px',
      }}
      onClick={!isSelected ? onClick : undefined}
    >
      {/* Container da stream com animações avançadas */}
      <div className={`relative rounded-lg overflow-hidden border-2 transition-all duration-700 ease-out ${
        isSelected 
          ? 'border-primary w-[720px] h-[405px] shadow-primary/20 shadow-2xl' 
          : 'border-border w-[600px] h-[338px] hover:border-primary/50 hover:shadow-lg'
      }`}>
        
        {/* Fundo preto para evitar transparência */}
        <div className="absolute inset-0 bg-black transition-opacity duration-500" />
        
        {/* Glow effect para o player selecionado */}
        {isSelected && (
          <div className="absolute -inset-1 bg-gradient-to-r from-primary via-secondary to-accent rounded-lg blur opacity-20 animate-pulse" />
        )}
        
        {/* Player da stream */}
        {isSelected ? (
          <iframe
            key={`${streamer.id}-live`}
            title={`Stream: ${streamer.name}`}
            src={`https://player.twitch.tv/?channel=${encodeURIComponent(
              twitchStatusService.extractUsernameFromTwitchUrl(streamer.streamUrl || '') || ''
            )}&parent=${typeof window !== "undefined" ? window.location.hostname : "localhost"}&muted=${isMuted}&controls=false&autoplay=true`}
            className="absolute inset-0 w-full h-full bg-black transition-opacity duration-500"
            frameBorder="0"
            allow="autoplay; fullscreen"
            loading="lazy"
          />
        ) : (
          // Preview estático para streams não selecionadas
          <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-muted/80 via-muted/60 to-background/90 flex items-center justify-center">
            {/* Preview da thumbnail da stream */}
            <div className="relative w-full h-full flex items-center justify-center">
              {/* Fundo com gradiente suave */}
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-background/50" />
              
              {/* Ícone de play simples e elegante */}
              <div className="absolute inset-0 flex items-center justify-center z-20">
                <div className="relative">
                  {/* Ícone de play triangular simples */}
                  <svg 
                    width="60" 
                    height="60" 
                    viewBox="0 0 60 60" 
                    className="text-white drop-shadow-lg hover:scale-110 transition-transform duration-300"
                  >
                    <polygon 
                      points="20,15 20,45 45,30" 
                      fill="currentColor"
                      className="opacity-90"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Badge EM DIRETO com animação */}
        <div className="absolute top-3 left-3 z-10 animate-pulse">
          <Badge variant="destructive" className="text-xs font-bold px-2 py-1 transition-all duration-300 hover:scale-110">
            EM DIRETO
          </Badge>
        </div>

        {/* Informações do streamer - apenas no card selecionado */}
        {isSelected && (
          <div className="absolute top-3 right-3 z-10 bg-background/80 backdrop-blur-sm rounded-lg p-2 text-foreground max-w-[200px] transition-all duration-500 ease-out animate-in slide-in-from-right-5 fade-in border border-border">
            <div className="flex items-center gap-2">
              {streamer.avatarUrl && (
                <img
                  src={streamer.avatarUrl}
                  alt={streamer.name}
                  className="w-8 h-8 rounded-full object-cover transition-transform duration-300 hover:scale-110"
                />
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm text-foreground truncate transition-colors duration-300">
                  {streamer.name}
                </h3>
              </div>
            </div>
            <div className="mt-1">
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5 transition-all duration-300 hover:scale-105 bg-primary text-primary-foreground hover:bg-primary/90">
                {streamer.category || 'Geral'}
              </Badge>
            </div>
          </div>
        )}

        {/* Controles - apenas no card selecionado */}
        {isSelected && (
          <div className="absolute bottom-3 left-3 right-3 z-10 animate-in slide-in-from-bottom-5 fade-in duration-500">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onToggleMute()
                  }}
                  className="bg-background/60 hover:bg-background/80 rounded-full p-1.5 transition-all duration-300 hover:scale-110 hover:rotate-12 border border-border"
                >
                  {isMuted ? (
                    <VolumeX className="h-4 w-4 text-foreground transition-transform duration-200" />
                  ) : (
                    <Volume2 className="h-4 w-4 text-foreground transition-transform duration-200" />
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Nome do streamer para cards não selecionados - REMOVIDO */}
        {/* {!isSelected && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/80 to-transparent p-2 z-10 transition-all duration-300 hover:from-background/90">
            <p className="text-foreground text-sm font-medium truncate transition-colors duration-300">
              {streamer.name}
            </p>
            <p className="text-muted-foreground text-xs transition-colors duration-300">
              {streamer.viewerCount?.toLocaleString()} espectadores
            </p>
          </div>
        )} */}

        {/* Overlay de hover para cards não selecionados com gradiente animado */}
        {!isSelected && (
          <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-secondary/0 to-accent/0 hover:from-primary/10 hover:via-secondary/10 hover:to-accent/10 transition-all duration-500 z-10" />
        )}

        {/* Indicador de seleção animado */}
        {isSelected && (
          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary via-secondary to-accent rounded-lg opacity-20 animate-pulse" />
        )}
      </div>
    </div>
  )
}


