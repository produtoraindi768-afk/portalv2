"use client"

import { useEffect, useState, useRef } from "react"
import { collection, getDocs, orderBy, query, where } from "firebase/firestore"

import { getClientFirestore } from "@/lib/safeFirestore"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useHeaderHeight } from "@/contexts/HeaderHeightContext"
import { Skeleton } from "@/components/ui/skeleton"

type TeamInfo = {
  id?: string
  name?: string
  tag?: string
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
  isBye?: boolean
  isLive?: boolean
  team1?: TeamInfo
  team2?: TeamInfo
  status?: 'scheduled' | 'ongoing' | 'finished'
  result?: {
    team1Score: number
    team2Score: number
    winner: null | 'team1' | 'team2'
  }
  resultMD3?: {
    team1Score: number
    team2Score: number
    winner: string | null
  }
  resultMD5?: {
    team1Score: number
    team2Score: number
    winner: string | null
  }
}

export function HeaderFeaturedMatchesTab() {
  const [items, setItems] = useState<MatchDoc[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasAttemptedLoad, setHasAttemptedLoad] = useState(false)
  const [missingConfig, setMissingConfig] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const containerRef = useRef<HTMLDivElement>(null)
  const { setFeaturedMatchesHeight } = useHeaderHeight()

  useEffect(() => {
    const db = getClientFirestore()
    if (!db) {
      setMissingConfig(true)
      setIsLoading(false)
      setHasAttemptedLoad(true)
      return
    }

    const loadMatches = async () => {
      const nowIso = new Date().toISOString()
      try {
        const q = query(
          collection(db, "matches"),
          where("isFeatured", "==", true),
          where("scheduledDate", ">=", nowIso),
          orderBy("scheduledDate", "asc")
        )
        const snap = await getDocs(q)
        const data = mapMatches(snap.docs).filter(match => !match.isBye)
        setItems(limitAndSortLiveFirst(data))
        setErrorMsg(null)
      } catch (e) {
        try {
          const snap = await getDocs(query(collection(db, "matches"), where("isFeatured", "==", true)))
          const all = mapMatches(snap.docs).filter(match => !match.isBye)
          const future = all
            .filter((m) => (m.scheduledDate ? m.scheduledDate >= nowIso : false))
            .sort((a, b) => (a.scheduledDate ?? "").localeCompare(b.scheduledDate ?? ""))
          setItems(limitAndSortLiveFirst(future))
          setErrorMsg(null)
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Erro ao carregar partidas"
          setErrorMsg(msg)
        }
      } finally {
        setIsLoading(false)
        setHasAttemptedLoad(true)
      }
    }

    // Usar setTimeout mínimo para evitar skeleton flash em loads rápidos
    const id = setTimeout(() => {
      if (!hasAttemptedLoad) {
        loadMatches()
      }
    }, 100)

    // Cleanup
    return () => {
      clearTimeout(id)
    }
  }, [])





  // Monitorar altura do componente e reportar mudanças
  useEffect(() => {
    if (isLoading || items.length === 0) {
      // Reportar altura 0 quando não renderizado
      setFeaturedMatchesHeight(0)
      return
    }

    const updateHeight = () => {
      if (containerRef.current) {
        const height = containerRef.current.offsetHeight
        setFeaturedMatchesHeight(height)
      }
    }

    // Atualizar altura imediatamente
    updateHeight()

    // Atualizar altura após mudanças de estado
    const timeoutId = setTimeout(updateHeight, 100)

    return () => clearTimeout(timeoutId)
  }, [items.length, setFeaturedMatchesHeight, isLoading])

  // Skeleton durante loading seguindo design system padronizado
  if (isLoading) {
    return (
      <div
        ref={containerRef}
        className="border-b bg-background text-card-foreground relative z-[60] py-4"
      >
        <div className="mx-auto flex w-full max-w-7xl items-center justify-center px-3 lg:px-6">
          <div className="flex w-full items-stretch justify-center gap-4">
            <FeaturedMatchCardSkeleton />
          </div>
        </div>
      </div>
    )
  }
  
  // Não renderizar nada se não há partidas após carregar
  if (items.length === 0) {
    return null
  }

  return (
    <div
      ref={containerRef}
      className="border-b bg-background text-card-foreground relative z-[60] py-4"
    >
      <div className="mx-auto flex w-full max-w-7xl items-center justify-center px-3 lg:px-6">
        <div className="flex w-full items-stretch justify-center gap-4">
          {items.map((m: MatchDoc) => (
            <FeaturedMatchCard key={m.id} match={m} />
          ))}
        </div>
      </div>
    </div>
  )
}

function FeaturedMatchCard({ match }: { match: MatchDoc }) {
  const team1Name = match.team1?.name ?? "Time 1"
  const team2Name = match.team2?.name ?? "Time 2"
  const team1Logo = match.team1?.logo ?? match.team1?.avatar
  const team2Logo = match.team2?.logo ?? match.team2?.avatar

  // Formatação da data e hora
  const formatMatchDateTime = (dateStr?: string) => {
    if (!dateStr) return { day: "TUESDAY", time: "7:00 PM - 4:00 AM CET" }

    try {
      const date = new Date(dateStr)
      const day = date.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase()
      const timeStart = date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
      const timeEnd = new Date(date.getTime() + 9 * 60 * 60 * 1000).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
      const time = `${timeStart} - ${timeEnd} CET`

      return { day, time }
    } catch {
      return { day: "TUESDAY", time: "7:00 PM - 4:00 AM CET" }
    }
  }

  const { day, time } = formatMatchDateTime(match.scheduledDate)
  const tournamentName = match.tournamentName ?? "CALL OF DUTY LIVE STREAM"

  return (
    <div className="relative min-w-[700px] max-w-[900px] w-full">
      {/* Card principal com fundo escuro e borda verde neon */}
      <div className="relative bg-card/95 backdrop-blur-sm rounded-lg border-2 border-primary shadow-lg shadow-primary/20 p-6">

        {/* Header com dia da semana */}
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <div className="bg-primary text-primary-foreground px-6 py-1 rounded-md text-sm font-bold tracking-wide">
            {day}
          </div>
        </div>

        {/* Informações de stream */}
        <div className="flex justify-between items-start mb-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="font-medium">STREAM ON:</span>
            <div className="flex gap-1">
              <div className="w-4 h-4 bg-primary/30 rounded-sm border border-primary/50"></div>
              <div className="w-4 h-4 bg-primary/30 rounded-sm border border-primary/50"></div>
              <div className="w-4 h-4 bg-primary/30 rounded-sm border border-primary/50"></div>
              <div className="w-4 h-4 bg-primary/30 rounded-sm border border-primary/50"></div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-bold text-foreground">{tournamentName}</div>
          </div>
        </div>

        {/* Layout principal da partida */}
        <div className="flex items-center justify-between gap-8">

          {/* Time 1 */}
          <div className="flex items-center gap-4 flex-1">
            <div className="relative">
              <div className="w-20 h-20 border-2 border-primary rounded-lg p-2 bg-muted/50">
                <Avatar className="w-full h-full">
                  {team1Logo ? (
                    <AvatarImage src={team1Logo} alt={team1Name} />
                  ) : (
                    <AvatarFallback className="text-xl font-bold bg-primary/20 text-primary border border-primary/30">
                      {team1Name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  )}
                </Avatar>
              </div>
            </div>
            <div className="text-left">
              <div className="text-xl font-bold text-foreground tracking-wide">{team1Name}</div>
            </div>
          </div>

          {/* VS e horário central */}
          <div className="flex flex-col items-center gap-3 min-w-[140px]">
            <div className="text-3xl font-bold text-foreground tracking-wider">V/S</div>
            <div className="bg-primary text-primary-foreground px-6 py-2 rounded-md text-sm font-bold text-center tracking-wide">
              {time}
            </div>
          </div>

          {/* Time 2 */}
          <div className="flex items-center gap-4 flex-1 flex-row-reverse">
            <div className="relative">
              <div className="w-20 h-20 border-2 border-primary rounded-lg p-2 bg-muted/50">
                <Avatar className="w-full h-full">
                  {team2Logo ? (
                    <AvatarImage src={team2Logo} alt={team2Name} />
                  ) : (
                    <AvatarFallback className="text-xl font-bold bg-primary/20 text-primary border border-primary/30">
                      {team2Name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  )}
                </Avatar>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-foreground tracking-wide">{team2Name}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

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
      tag: typeof team1Raw.tag === "string" ? team1Raw.tag : "",
      logo: (team1Raw.logo as string | null) ?? null,
      avatar: (team1Raw.avatar as string | null) ?? null,
    }
    const team2: TeamInfo = {
      id: typeof team2Raw.id === "string" ? team2Raw.id : undefined,
      name: typeof team2Raw.name === "string" ? team2Raw.name : "",
      tag: typeof team2Raw.tag === "string" ? team2Raw.tag : "",
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
        isBye: Boolean(raw.isBye),
        isLive: typeof (raw as Record<string, unknown>).isLive === "boolean" ? ((raw as Record<string, unknown>).isLive as boolean) : false,
        status: typeof raw.status === "string" ? raw.status as 'scheduled' | 'ongoing' | 'finished' : undefined,
        team1,
        team2,
        result: raw.result as { team1Score: number; team2Score: number; winner: null | 'team1' | 'team2' } | undefined,
        resultMD3: raw.resultMD3 as { team1Score: number; team2Score: number; winner: string | null } | undefined,
        resultMD5: raw.resultMD5 as { team1Score: number; team2Score: number; winner: string | null } | undefined,
      }
  })
}

function limitAndSortLiveFirst(items: MatchDoc[]): MatchDoc[] {
  const MAX = 3
  const sorted = [...items].sort((a, b) => Number(b.isLive) - Number(a.isLive))
  return sorted.slice(0, MAX)
}

// Skeleton Component mais simples e responsivo
function FeaturedMatchCardSkeleton() {
  return (
    <div className="w-full max-w-3xl">
      {/* Card principal */}
      <div className="bg-card/95 backdrop-blur-sm rounded-lg border border-border shadow-lg p-4 sm:p-6">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-32" />
        </div>

        {/* Layout principal da partida */}
        <div className="flex items-center justify-between gap-4">
          {/* Time 1 */}
          <div className="flex items-center gap-3 flex-1">
            <Skeleton className="h-16 w-16 rounded-lg" />
            <Skeleton className="h-5 w-24" />
          </div>

          {/* VS e horário central */}
          <div className="flex flex-col items-center gap-2">
            <Skeleton className="h-6 w-8" />
            <Skeleton className="h-8 w-20 rounded-md" />
          </div>

          {/* Time 2 */}
          <div className="flex items-center gap-3 flex-1 flex-row-reverse">
            <Skeleton className="h-16 w-16 rounded-lg" />
            <Skeleton className="h-5 w-24" />
          </div>
        </div>
      </div>
    </div>
  )
}












export default HeaderFeaturedMatchesTab


