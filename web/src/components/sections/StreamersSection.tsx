"use client"

import { useEffect, useState } from "react"
import { collection, getDocs, query, where } from "firebase/firestore"
import { getClientFirestore } from "@/lib/safeFirestore"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BlookieEmbed } from "@/components/blookie/BlookieEmbed"
import { useMiniplPlayerControl } from "@/components/miniplayer/MiniplPlayerProvider"
import { Play, ExternalLink, Star } from "lucide-react"
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
}

export function StreamersSection() {
  const [items, setItems] = useState<StreamerDoc[]>([])

  useEffect(() => {
    const db = getClientFirestore()
    if (!db) return
    ;(async () => {
      // Somente em destaque E online
      const q = query(
        collection(db, "streamers"),
        where("isFeatured", "==", true),
        where("isOnline", "==", true)
      )
      const snap = await getDocs(q)
      const data: StreamerDoc[] = snap.docs.map((d) => {
        const raw = d.data() as Record<string, unknown>
        return {
          id: d.id,
          name: typeof raw.name === "string" ? raw.name : "",
          platform: typeof raw.platform === "string" ? raw.platform : "",
          streamUrl: typeof raw.streamUrl === "string" ? raw.streamUrl : "",
          avatarUrl: typeof raw.avatarUrl === "string" ? raw.avatarUrl : "",
          category: typeof raw.category === "string" ? raw.category : "",
          isOnline: Boolean(raw.isOnline),
          isFeatured: Boolean(raw.isFeatured),
          createdAt: typeof raw.createdAt === "string" ? raw.createdAt : undefined,
          lastStatusUpdate: typeof raw.lastStatusUpdate === "string" ? raw.lastStatusUpdate : undefined,
        }
      })
      setItems(data)
    })()
  }, [])

  // Opcional: refresh de status via API (quando sem Cloud Function)
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
            // A UI não muda aqui; Firestore deve ser a fonte de verdade.
          } catch {}
        }
      }
    })()
    return () => controller.abort()
  }, [items])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Streamers em Destaque</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((s) => (
            <StreamerCard key={s.id} streamer={s} />
          ))}
          {items.length === 0 && (
            <div className="text-muted-foreground col-span-full text-center py-8">
              Sem streamers em destaque.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Componente individual para cada streamer
function StreamerCard({ streamer }: { streamer: StreamerDoc }) {
  const { showMiniplayer } = useMiniplPlayerControl()

  const handlePlayInMiniplayer = () => {
    // Converter StreamerDoc para StreamerForMiniplayer e mostrar o miniplayer
    const streamerForMiniplayer = {
      id: streamer.id,
      name: streamer.name || '',
      platform: streamer.platform || '',
      streamUrl: streamer.streamUrl || '',
      avatarUrl: streamer.avatarUrl || '',
      category: streamer.category || '',
      isOnline: Boolean(streamer.isOnline),
      isFeatured: Boolean(streamer.isFeatured),
      twitchChannel: streamer.platform?.toLowerCase() === 'twitch' && streamer.streamUrl
        ? twitchStatusService.extractUsernameFromTwitchUrl(streamer.streamUrl) || undefined
        : undefined,
      createdAt: streamer.createdAt || '',
      lastStatusUpdate: streamer.lastStatusUpdate || ''
    }
    
    showMiniplayer(streamerForMiniplayer)
  }

  const handleOpenTwitch = () => {
    if (streamer.streamUrl) {
      window.open(streamer.streamUrl, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <div className="space-y-3">
      {streamer.isOnline && streamer.platform?.toLowerCase() === "twitch" && streamer.streamUrl ? (
        <div className="group relative aspect-video w-full overflow-hidden rounded-lg border bg-muted">
          {/* Preview do iframe para streams online */}
          <iframe
            title={`Preview: ${streamer.name}`}
            src={`https://player.twitch.tv/?channel=${encodeURIComponent(
              twitchStatusService.extractUsernameFromTwitchUrl(streamer.streamUrl || '') || ''
            )}&parent=${typeof window !== "undefined" ? window.location.hostname : "localhost"}&muted=true&controls=true&autoplay=true`}
            className="h-full w-full pointer-events-none"
            frameBorder="0"
          />
          
          {/* Overlay com controles */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity space-x-2">
              <Button
                onClick={handlePlayInMiniplayer}
                size="sm"
                className="bg-primary/90 hover:bg-primary text-primary-foreground"
              >
                <Play className="h-4 w-4 mr-2" />
                Miniplayer
              </Button>
              <Button
                onClick={handleOpenTwitch}
                variant="secondary"
                size="sm"
                className="bg-background/90 hover:bg-background"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Twitch
              </Button>
            </div>
          </div>
        </div>
      ) : (
        // Fallback para BlookieEmbed quando offline
        <BlookieEmbed
          src={process.env.NEXT_PUBLIC_BLOOKIE_SCRIPT_URL ?? ""}
          attributes={{
            type: "streamer-profile",
            name: streamer.name ?? "",
            avatar: streamer.avatarUrl ?? "",
            live: String(Boolean(streamer.isOnline)),
            platform: streamer.platform ?? "",
            url: streamer.streamUrl ?? "",
            category: streamer.category ?? "",
          }}
        />
      )}

      {/* Informações do streamer */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-card-foreground truncate">
            {streamer.name}
          </h4>
          <div className="flex items-center gap-1">
            {streamer.isFeatured && (
              <Badge variant="secondary" className="text-xs">
                <Star className="h-2 w-2 mr-1" />
                Destaque
              </Badge>
            )}
            <Badge
              variant={streamer.isOnline ? "default" : "outline"}
              className="text-xs"
            >
              {streamer.isOnline ? 'Ao vivo' : 'Offline'}
            </Badge>
          </div>
        </div>
        
        {streamer.category && (
          <p className="text-sm text-muted-foreground">
            {streamer.category}
          </p>
        )}
        
        {/* Botão para abrir miniplayer quando offline */}
        {!streamer.isOnline && streamer.streamUrl && (
          <div className="flex gap-2 pt-2">
            <Button
              onClick={handlePlayInMiniplayer}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              <Play className="h-3 w-3 mr-2" />
              Ver no Miniplayer
            </Button>
            <Button
              onClick={handleOpenTwitch}
              variant="ghost"
              size="sm"
            >
              <ExternalLink className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}


