"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { ChevronLeft, ChevronRight, ChevronsUpDown, Play, Calendar, Trophy } from "lucide-react"
import { collection, getDocs, orderBy, query, where } from "firebase/firestore"

import { getClientFirestore } from "@/lib/safeFirestore"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

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
  const scrollerRef = useRef<HTMLDivElement | null>(null)
  const itemRefs = useRef<HTMLDivElement[]>([])
  const [activeIndex, setActiveIndex] = useState(0)
  const [isCollapsed, setIsCollapsed] = useState(false)

  useEffect(() => {
    // restaurar estado recolhido
    try {
      const raw = localStorage.getItem("sz.headerFeatured.collapsed")
      if (raw != null) setIsCollapsed(raw === "1")
    } catch {}

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
        const data = mapMatches(snap.docs)
        setItems(limitAndSortLiveFirst(data))
        setErrorMsg(null)
      } catch (e) {
        try {
          const snap = await getDocs(query(collection(db, "matches"), where("isFeatured", "==", true)))
          const all = mapMatches(snap.docs)
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

  const hasArrows = useMemo(() => (items?.length ?? 0) > 0, [items])

  function scrollToIndex(index: number) {
    const el = itemRefs.current[index]
    const scroller = scrollerRef.current
    if (el && scroller) {
      el.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" })
    }
    setActiveIndex(index)
  }

  function handlePrev() {
    setActiveIndex((prev) => {
      const next = prev <= 0 ? items.length - 1 : prev - 1
      queueMicrotask(() => scrollToIndex(next))
      return next
    })
  }

  function handleNext() {
    setActiveIndex((prev) => {
      const next = prev >= items.length - 1 ? 0 : prev + 1
      queueMicrotask(() => scrollToIndex(next))
      return next
    })
  }

  function onScrollUpdateActive() {
    const scroller = scrollerRef.current
    if (!scroller) return
    const centerX = scroller.clientWidth / 2
    const scrollerRect = scroller.getBoundingClientRect()
    let nearestIdx = 0
    let minDist = Number.POSITIVE_INFINITY
    itemRefs.current.forEach((child, idx) => {
      if (!child) return
      const rect = child.getBoundingClientRect()
      const childCenter = rect.left - scrollerRect.left + rect.width / 2
      const dist = Math.abs(childCenter - centerX)
      if (dist < minDist) {
        minDist = dist
        nearestIdx = idx
      }
    })
    setActiveIndex(nearestIdx)
  }

  function toggleCollapsed() {
    setIsCollapsed((prev) => {
      const next = !prev
      try {
        localStorage.setItem("sz.headerFeatured.collapsed", next ? "1" : "0")
      } catch {}
      return next
    })
  }

  return (
    <div
      className={cn(
        // Fundo unificado: usar o background do tema, sem gradiente, para manter o preto consistente
        "border-b bg-background text-card-foreground",
        isCollapsed ? "py-2" : "py-3"
      )}
    >
      <div className={cn("mx-auto flex w-full max-w-7xl items-center gap-3 px-3 lg:px-6")}>        
        <Button
          variant="outline"
          size="icon"
          className="shrink-0 rounded-full bg-background/60 hover:bg-background/80 border-border/50 shadow-sm"
          aria-pressed={isCollapsed}
          aria-label={isCollapsed ? "Expandir partidas em destaque" : "Recolher partidas em destaque"}
          onClick={toggleCollapsed}
        >
          <ChevronsUpDown className="size-4" />
        </Button>
        
        {hasArrows && (
          <Button
            variant="outline"
            size="icon"
            className="shrink-0 rounded-full bg-background/60 hover:bg-background/80 border-border/50 shadow-sm"
            aria-label="Itens anteriores"
            onClick={handlePrev}
          >
            <ChevronLeft className="size-4" />
          </Button>
        )}

        <div className="relative w-full">
          <div
            ref={scrollerRef}
            onScroll={onScrollUpdateActive}
            className="scrollbar-none -mx-2 flex w-full snap-x snap-mandatory items-stretch justify-center gap-4 overflow-x-auto px-2 scroll-smooth"
          >
          {isLoading && hasAttemptedLoad && (
            <>
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                    className={cn(
                      "snap-center rounded-2xl border bg-card/80 backdrop-blur-sm shadow-sm transition-[opacity,transform,box-shadow] duration-300 ease-out",
                      isCollapsed ? "min-w-[280px] px-4 py-2.5" : "min-w-[320px] px-5 py-4"
                    )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </div>
                  {isCollapsed ? (
                    <div className="mt-3 flex items-center gap-3">
                      <Skeleton className="h-6 w-6 rounded-full" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  ) : (
                    <div className="mt-4 space-y-3">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-4 w-36" />
                      </div>
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </>
          )}

              {!isLoading &&
                items.map((m, i) => (
                  <div
                    key={m.id}
                    ref={(el) => {
                      if (el) itemRefs.current[i] = el
                    }}
                    data-active={activeIndex === i}
                    className={cn(
                      "snap-center overflow-hidden border bg-card/80 hover:bg-card/90 backdrop-blur-sm shadow-sm hover:shadow-md",
                      // Evita 'rounded' piscando ao alternar: aplica ambas e usa máscara
                      isCollapsed ? "rounded-full min-w-[320px] px-5 py-3" : "rounded-2xl min-w-[320px] px-5 py-4",
                      activeIndex === i ? "opacity-100 scale-100 border-primary/20 shadow-md" : "opacity-90 scale-[0.98] border-border/50"
                    )}
                  >
                    {/* Versão compacta */}
                    <AnimatedCollapse open={isCollapsed}>
                      <CollapsedItem m={m} />
                    </AnimatedCollapse>

                    {/* Versão expandida */}
                    <AnimatedCollapse open={!isCollapsed}>
                      <ExpandedItem m={m} />
                    </AnimatedCollapse>
                  </div>
                ))}

          {!isLoading && items.length === 0 && (
            <div className="flex min-w-full items-center justify-center py-8 text-sm text-muted-foreground">
              {missingConfig
                ? "Firebase não configurado. Defina .env e adicione documentos em /matches."
                : errorMsg
                ? `Erro: ${errorMsg}`
                : "Sem partidas em destaque."}
            </div>
          )}
          </div>

          {/* Indicadores (dots) */}
          {!isLoading && items.length > 1 && (
            <div className="pointer-events-auto absolute -bottom-2 left-1/2 z-10 -translate-x-1/2">
              <div className="flex items-center gap-1.5 rounded-full bg-background/80 px-2 py-1.5 shadow-sm backdrop-blur-sm">
                {items.map((_, i) => (
                  <button
                    key={i}
                    aria-label={`Ir para item ${i + 1}`}
                    aria-current={activeIndex === i}
                    onClick={() => scrollToIndex(i)}
                    className={cn(
                      "h-1.5 w-1.5 rounded-full transition-all duration-300",
                      activeIndex === i ? "bg-primary w-4" : "bg-muted-foreground/40 hover:bg-muted-foreground/60"
                    )}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {hasArrows && (
          <Button
            variant="outline"
            size="icon"
            className="shrink-0 rounded-full bg-background/60 hover:bg-background/80 border-border/50 shadow-sm"
            aria-label="Próximos itens"
            onClick={handleNext}
          >
            <ChevronRight className="size-4" />
          </Button>
        )}
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

function ExpandedItem({ m }: { m: MatchDoc }) {
  const isFinished = m.status === 'finished'
  const isOngoing = m.status === 'ongoing'
  const formatDisplay = m.format?.toUpperCase() ?? 'MD1'
  
  // Determinar qual resultado usar baseado no formato
  const getCurrentResult = () => {
    if (m.format === 'MD3' && m.resultMD3) return m.resultMD3
    if (m.format === 'MD5' && m.resultMD5) return m.resultMD5
    return m.result
  }
  
  const currentResult = getCurrentResult()
  const team1Score = currentResult?.team1Score ?? 0
  const team2Score = currentResult?.team2Score ?? 0
  const scoreString = `${team1Score}:${team2Score}`
  const showSeriesScore = (formatDisplay === 'MD3' || formatDisplay === 'MD5')

  return (
    <div className="space-y-4">
      {/* Header com torneio e status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="size-4 text-muted-foreground" />
          <div className="truncate text-sm font-medium text-muted-foreground" title={m.tournamentName ?? undefined}>
            {m.tournamentName ?? "Partida"}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Status badge */}
          {m.isLive || isOngoing ? (
            <Badge variant="destructive" className="gap-1">
              <div className="size-1.5 rounded-full bg-current animate-pulse" />
              {m.isLive ? "Ao vivo" : "Em andamento"}
            </Badge>
          ) : isFinished ? (
            <Badge variant="secondary" className="gap-1">
              Finalizado
            </Badge>
          ) : (
            <Badge variant="outline" className="gap-1">
              <Calendar className="size-3" />
              {formatDateTime(m.scheduledDate)}
            </Badge>
          )}
          
          {/* Formato badge */}
          <Badge variant="outline" className="text-xs">
            {formatDisplay}
          </Badge>

          {/* Placar da série (MD3/MD5) no formato SCORE:SCORE */}
          {showSeriesScore && (
            <Badge variant="outline" className="text-xs font-mono tracking-wider">
              {scoreString}
            </Badge>
          )}
        </div>
      </div>

      <Separator />

      {/* Times com layout flexível para garantir nomes completos */}
      <div className="flex items-center gap-2">
        <div className="flex-1 min-w-0">
          <TeamPill
            side="left"
            name={m.team1?.tag ?? m.team1?.name ?? "Time 1"}
            avatarUrl={m.team1?.logo ?? m.team1?.avatar ?? null}
            score={team1Score}
            showScore={showSeriesScore}
          />
        </div>

        <div className="rounded-md bg-muted/50 px-2 py-1 text-[10px] font-medium text-muted-foreground shrink-0">VS</div>

        <div className="flex-1 min-w-0">
          <TeamPill
            side="right"
            name={m.team2?.tag ?? m.team2?.name ?? "Time 2"}
            avatarUrl={m.team2?.logo ?? m.team2?.avatar ?? null}
            score={team2Score}
            showScore={showSeriesScore}
          />
        </div>
      </div>

      {/* Footer com jogo e resultado final */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Play className="size-3" />
          {m.game ?? "Jogo"}
        </div>
        
        {isFinished && currentResult?.winner && (
          <div className="flex items-center gap-1">
            <span className="text-xs font-medium text-primary">
              Vencedor: {currentResult.winner === 'team1' ? (m.team1?.tag ?? m.team1?.name) : (m.team2?.tag ?? m.team2?.name)}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * AnimatedCollapse: colapsador/expansor com animação "slide down/up" usando
 * transições somente-CSS para manter fluidez e evitar layout shift. A técnica
 * anima height/opacity/translate e usa um wrapper com overflow-hidden.
 */
function AnimatedCollapse({ open, children }: { open: boolean; children: React.ReactNode }) {
  return (
    <div
      data-open={open}
      className={cn(
        "overflow-hidden transition-[grid-template-rows] duration-400 ease-out grid",
        open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
      )}
    >
      <div
        className={cn(
          "min-h-0 overflow-hidden transition-all duration-400 ease-out",
          open ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1"
        )}
      >
        {children}
      </div>
    </div>
  )
}



function CollapsedItem({ m }: { m: MatchDoc }) {
  const team1Name = m.team1?.tag ?? m.team1?.name ?? "Time 1"
  const team2Name = m.team2?.tag ?? m.team2?.name ?? "Time 2"
  const formatDisplay = m.format?.toUpperCase() ?? 'MD1'
  const showSeriesScore = formatDisplay === 'MD3' || formatDisplay === 'MD5'
  const currentResult = (() => {
    if (m.format === 'MD3' && m.resultMD3) return m.resultMD3
    if (m.format === 'MD5' && m.resultMD5) return m.resultMD5
    return m.result
  })()
  const t1 = currentResult?.team1Score ?? 0
  const t2 = currentResult?.team2Score ?? 0

  return (
    <div className="flex items-center justify-between gap-4 text-[15px]">
             {/* Layout alinhado: TEAM SCORE VS SCORE TEAM */}
       <div className="flex min-w-0 flex-1 items-center">
         {/* Time 1 */}
          <div className="flex items-center gap-2.5 min-w-0">
            <Avatar className="size-7 ring-1 ring-border/50 shrink-0">
             {m.team1?.logo || m.team1?.avatar ? (
               <AvatarImage src={(m.team1.logo ?? m.team1.avatar)!} alt={team1Name} />
             ) : (
               <AvatarFallback className="text-xs bg-primary/10">{team1Name.slice(0, 1)}</AvatarFallback>
             )}
           </Avatar>
            <span className="text-base font-medium whitespace-nowrap" title={team1Name}>
             {team1Name}
           </span>
         </div>

         {/* Score 1 + VS + Score 2 - centralizados */}
          <div className="flex items-center gap-1.5 mx-auto">
           {showSeriesScore ? (
              <span className="shrink-0 rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[11px] font-semibold font-mono leading-none text-primary">
               {t1}
             </span>
           ) : (
             <span className="w-4"></span>
           )}
            <span className="shrink-0 text-[10px] font-semibold text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded-full">
             VS
           </span>
           {showSeriesScore ? (
              <span className="shrink-0 rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[11px] font-semibold font-mono leading-none text-primary">
               {t2}
             </span>
           ) : (
             <span className="w-4"></span>
           )}
         </div>

         {/* Time 2 */}
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-base font-medium whitespace-nowrap" title={team2Name}>
             {team2Name}
           </span>
            <Avatar className="size-7 ring-1 ring-border/50 shrink-0">
             {m.team2?.logo || m.team2?.avatar ? (
               <AvatarImage src={(m.team2.logo ?? m.team2.avatar)!} alt={team2Name} />
             ) : (
               <AvatarFallback className="text-xs bg-primary/10">{team2Name.slice(0, 1)}</AvatarFallback>
             )}
           </Avatar>
         </div>
       </div>

      {/* Lado direito: status ao vivo (design) */}
      {m.isLive && (
        <div className="shrink-0 inline-flex items-center gap-1.5 rounded-full border border-destructive/30 bg-destructive/10 px-2 py-1">
          <span className="relative inline-flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-destructive"></span>
          </span>
          <span className="text-[11px] font-semibold text-destructive">Ao vivo</span>
        </div>
      )}
    </div>
  )
}

/** Pílula do time usada no modo expandido */
function TeamPill({
  side,
  name,
  avatarUrl,
  score,
  showScore,
}: {
  side: 'left' | 'right'
  name: string
  avatarUrl: string | null
  score?: number
  showScore?: boolean
}) {
  return (
    <div className={cn(
      'flex items-center justify-between gap-1 rounded-full border border-border/50 bg-muted/40 px-3 py-2 w-full',
      side === 'right' ? 'flex-row-reverse text-right' : 'text-left'
    )}>
      <div className={cn('flex items-center gap-2 flex-1', side === 'right' ? 'flex-row-reverse' : undefined)}>
        <Avatar className="size-6 ring-1 ring-border/50 shrink-0">
          {avatarUrl ? (
            <AvatarImage src={avatarUrl} alt={name} />
          ) : (
            <AvatarFallback className="text-xs bg-primary/10">{name.slice(0, 1)}</AvatarFallback>
          )}
        </Avatar>
        <span className="text-sm font-medium whitespace-nowrap" title={name}>
          {name}
        </span>
      </div>

      {showScore && (
        <span className="shrink-0 rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-xs font-semibold font-mono leading-none text-primary">
          {typeof score === 'number' ? score : 0}
        </span>
      )}
    </div>
  )
}

/** Linha compacta com placar do formato: TEAM1 0 VS 0 TEAM2 */
function SeriesScoreRow({
  team1Name,
  team1Score,
  team2Name,
  team2Score,
}: {
  team1Name: string
  team1Score: number
  team2Name: string
  team2Score: number
}) {
  return (
    <div className="mt-2 flex items-center justify-between text-sm">
      <div className="inline-flex items-center gap-2">
        <span className="font-medium text-foreground">{team1Name}</span>
        <span className="rounded-md bg-muted/60 px-2 py-0.5 font-mono text-foreground">{team1Score}</span>
      </div>

      <div className="rounded-md bg-muted/50 px-3 py-0.5 text-xs font-medium text-muted-foreground">VS</div>

      <div className="inline-flex items-center gap-2">
        <span className="rounded-md bg-muted/60 px-2 py-0.5 font-mono text-foreground">{team2Score}</span>
        <span className="font-medium text-foreground">{team2Name}</span>
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

export default HeaderFeaturedMatchesTab


