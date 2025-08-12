"use client"

import { useEffect, useState } from "react"
import { collection, getDocs, orderBy, query, where } from "firebase/firestore"
import { getClientFirestore } from "@/lib/safeFirestore"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { BlookieEmbed } from "@/components/blookie/BlookieEmbed"

type TeamInfo = {
  id?: string
  name?: string
  logo?: string | null
  avatar?: string | null
}

type MatchDoc = {
  id: string
  tournamentName?: string
  scheduledDate?: string
  format?: string
  game?: string
  isFeatured?: boolean
  team1?: TeamInfo
  team2?: TeamInfo
  youtubeVideoId?: string // opcional, se existir no documento
}

export function FeaturedMatchesSection() {
  const [items, setItems] = useState<MatchDoc[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [missingConfig, setMissingConfig] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    const db = getClientFirestore()
    if (!db) {
      setMissingConfig(true)
      setIsLoading(false)
      return
    }
    ;(async () => {
      const nowIso = new Date().toISOString()
      try {
        // Preferir filtrar partidas futuras e ordenar na consulta
        const q = query(
          collection(db, "matches"),
          where("isFeatured", "==", true),
          where("scheduledDate", ">=", nowIso),
          orderBy("scheduledDate", "asc")
        )
        const snap = await getDocs(q)
        const data = mapMatches(snap.docs)
        setItems(data)
        setErrorMsg(null)
      } catch (e) {
        try {
          // Fallback sem índice composto: buscar apenas isFeatured e ordenar/filtrar no cliente
          const snap = await getDocs(query(collection(db, "matches"), where("isFeatured", "==", true)))
          const all = mapMatches(snap.docs)
          const future = all
            .filter((m) => (m.scheduledDate ? m.scheduledDate >= nowIso : false))
            .sort((a, b) => (a.scheduledDate ?? "").localeCompare(b.scheduledDate ?? ""))
          setItems(future)
          setErrorMsg(null)
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Erro ao carregar partidas"
          setErrorMsg(msg)
        }
      } finally {
        setIsLoading(false)
      }
    })()
  }, [])

  function mapMatches(
    docs: Array<{ id: string; data: () => Record<string, unknown> }>
  ): MatchDoc[] {
    return docs.map((d) => {
      const raw = d.data() as Record<string, unknown>
      const team1Raw = (raw.team1 ?? {}) as Record<string, unknown>
      const team2Raw = (raw.team2 ?? {}) as Record<string, unknown>
      const team1: TeamInfo = {
        id: typeof team1Raw.id === "string" ? team1Raw.id : undefined,
        name: typeof team1Raw.name === "string" ? team1Raw.name : "",
        logo: (team1Raw.logo as string | null) ?? null,
        avatar: (team1Raw.avatar as string | null) ?? null,
      }
      const team2: TeamInfo = {
        id: typeof team2Raw.id === "string" ? team2Raw.id : undefined,
        name: typeof team2Raw.name === "string" ? team2Raw.name : "",
        logo: (team2Raw.logo as string | null) ?? null,
        avatar: (team2Raw.avatar as string | null) ?? null,
      }
      return {
        id: d.id,
        tournamentName: typeof raw.tournamentName === "string" ? raw.tournamentName : undefined,
        scheduledDate: typeof raw.scheduledDate === "string" ? raw.scheduledDate : undefined,
        format: typeof raw.format === "string" ? raw.format : undefined,
        game: typeof raw.game === "string" ? raw.game : undefined,
        isFeatured: Boolean(raw.isFeatured),
        team1,
        team2,
        youtubeVideoId: typeof raw.youtubeVideoId === "string" ? (raw.youtubeVideoId as string) : undefined,
      }
    })
  }

  return (
    <section className="py-16 lg:py-32">
      <div className="mx-auto w-full max-w-2xl px-6 lg:max-w-7xl">
        <Card>
          <CardHeader>
            <CardTitle>Partidas em Destaque</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {isLoading && (
                <>
                  {Array.from({ length: 3 }).map((_, idx) => (
                    <div key={idx} className="rounded-xl border p-4">
                      <div className="flex items-center justify-between gap-3">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                      <div className="mt-4 space-y-3">
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-8 w-8 rounded-full" />
                          <Skeleton className="h-4 w-40" />
                        </div>
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-8 w-8 rounded-full" />
                          <Skeleton className="h-4 w-36" />
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}

              {!isLoading &&
                items.map((m) => {
                  const title = `${m.team1?.name ?? ""} vs ${m.team2?.name ?? ""}`.trim()
                  if (m.youtubeVideoId) {
                    return (
                      <BlookieEmbed
                        key={m.id}
                        src={process.env.NEXT_PUBLIC_BLOOKIE_SCRIPT_URL ?? ""}
                        attributes={{
                          type: "match-highlight",
                          title,
                          video: m.youtubeVideoId,
                          tournament: m.tournamentName ?? "",
                          date: m.scheduledDate ?? "",
                          format: m.format ?? "",
                          game: m.game ?? "",
                        }}
                      />
                    )
                  }
                  return (
                    <div key={m.id} className="bg-card text-card-foreground rounded-xl border p-4">
                      <div className="flex items-center justify-between gap-3 text-xs">
                        <div className="text-muted-foreground truncate" title={m.tournamentName ?? undefined}>
                          {m.tournamentName ?? "Partida"}
                        </div>
                        <div className="text-primary font-medium">
                          {formatDateTime(m.scheduledDate)}
                        </div>
                      </div>

                      <div className="mt-4 space-y-3">
                        <TeamRow name={m.team1?.name ?? "Time 1"} avatarUrl={m.team1?.logo ?? m.team1?.avatar ?? null} />
                        <TeamRow name={m.team2?.name ?? "Time 2"} avatarUrl={m.team2?.logo ?? m.team2?.avatar ?? null} />
                      </div>

                      <div className="text-muted-foreground mt-4 text-xs">
                        {(m.format ?? "").toUpperCase()} {m.game ? `• ${m.game}` : ""}
                      </div>
                    </div>
                  )
                })}

              {!isLoading && items.length === 0 && (
                <div className="text-muted-foreground col-span-full text-center py-8">
                  {missingConfig
                    ? "Firebase não configurado. Defina as variáveis .env e adicione documentos em /matches."
                    : errorMsg
                    ? `Erro: ${errorMsg}`
                    : "Sem partidas em destaque."}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

function TeamRow({ name, avatarUrl }: { name: string; avatarUrl: string | null }) {
  const initial = name?.[0]?.toUpperCase() ?? "?"
  return (
    <div className="flex items-center gap-3">
      <Avatar className="size-8">
        {avatarUrl ? (
          <AvatarImage src={avatarUrl} alt={name} />
        ) : (
          <AvatarFallback>{initial}</AvatarFallback>
        )}
      </Avatar>
      <div className="truncate text-sm font-medium" title={name}>
        {name}
      </div>
    </div>
  )
}

function formatDateTime(iso?: string) {
  if (!iso) return ""
  const d = new Date(iso)
  const date = d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })
  const time = d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", hour12: false })
  return `${date} - ${time}`
}


