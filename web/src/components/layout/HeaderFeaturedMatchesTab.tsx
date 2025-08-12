"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { ChevronLeft, ChevronRight, ChevronsUpDown } from "lucide-react"
import { collection, getDocs, orderBy, query, where } from "firebase/firestore"

import { getClientFirestore } from "@/lib/safeFirestore"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"

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
  isLive?: boolean
  team1?: TeamInfo
  team2?: TeamInfo
}

export function HeaderFeaturedMatchesTab() {
  const [items, setItems] = useState<MatchDoc[]>([])
  const [isLoading, setIsLoading] = useState(true)
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
      return
    }
    ;(async () => {
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
      }
    })()
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
      const next = Math.max(prev - 1, 0)
      queueMicrotask(() => scrollToIndex(next))
      return next
    })
  }

  function handleNext() {
    setActiveIndex((prev) => {
      const last = Math.max(items.length - 1, 0)
      const next = Math.min(prev + 1, last)
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
        "border-b border-t bg-card/50 text-card-foreground backdrop-blur supports-[backdrop-filter]:bg-card/50",
        isCollapsed ? "" : ""
      )}
    >
      <div className={cn("mx-auto flex w-full max-w-7xl items-center gap-2 px-2 lg:px-4", isCollapsed ? "py-1" : "py-2")}>        
        <Button
          variant="outline"
          size="icon"
          className="shrink-0 rounded-full bg-background/30 hover:bg-background/50"
          aria-pressed={isCollapsed}
          aria-label={isCollapsed ? "Expandir partidas em destaque" : "Recolher partidas em destaque"}
          onClick={toggleCollapsed}
        >
          <ChevronsUpDown className="size-5" />
        </Button>
        {hasArrows && (
          <Button
            variant="outline"
            size="icon"
            className="shrink-0 rounded-full bg-background/30 hover:bg-background/50"
            aria-label="Itens anteriores"
            onClick={handlePrev}
          >
            <ChevronLeft className="size-5" />
          </Button>
        )}

        <div className="relative w-full">
          <div
            ref={scrollerRef}
            onScroll={onScrollUpdateActive}
            className="scrollbar-none -mx-1 flex w-full snap-x snap-mandatory items-stretch justify-center gap-3 overflow-x-auto px-1 scroll-smooth"
          >
          {isLoading && (
            <>
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "snap-center rounded-xl border bg-card transition-all duration-700 ease-in-out",
                    isCollapsed ? "min-w-[260px] px-3 py-2" : "min-w-[300px] px-4 py-3"
                  )}
                >
                  <div className="flex items-center justify-between gap-3 text-xs">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  {isCollapsed ? (
                    <div className="mt-2 flex items-center gap-2 text-sm">
                      <Skeleton className="h-5 w-5 rounded-full" />
                      <Skeleton className="h-4 w-40" />
                    </div>
                  ) : (
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-6 w-6 rounded-full" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-6 w-6 rounded-full" />
                        <Skeleton className="h-4 w-28" />
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
                  "snap-center rounded-xl border bg-card transition-all duration-700 ease-in-out",
                  isCollapsed ? "min-w-[260px] px-3 py-2" : "min-w-[300px] px-4 py-3",
                  activeIndex === i ? "opacity-100 scale-100" : "opacity-80 scale-[0.98]"
                )}
              >
                {isCollapsed ? (
                  <CollapsedItem m={m} />
                ) : (
                  <ExpandedItem m={m} />
                )}
              </div>
            ))}

          {!isLoading && items.length === 0 && (
            <div className="flex min-w-full items-center justify-center py-6 text-sm text-muted-foreground">
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
            <div className="pointer-events-auto absolute bottom-1 left-1/2 z-10 -translate-x-1/2">
              <div className="flex items-center gap-2">
                {items.map((_, i) => (
                  <button
                    key={i}
                    aria-label={`Ir para item ${i + 1}`}
                    aria-current={activeIndex === i}
                    onClick={() => scrollToIndex(i)}
                    className={cn(
                      "h-2 w-2 rounded-full transition-colors",
                      activeIndex === i ? "bg-primary" : "bg-muted"
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
            className="shrink-0 rounded-full bg-background/30 hover:bg-background/50"
            aria-label="Próximos itens"
            onClick={handleNext}
          >
            <ChevronRight className="size-5" />
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
      isLive: Boolean((raw as any).isLive),
      team1,
      team2,
    }
  })
}

function limitAndSortLiveFirst(items: MatchDoc[]): MatchDoc[] {
  const MAX = 3
  const sorted = [...items].sort((a, b) => Number(b.isLive) - Number(a.isLive))
  return sorted.slice(0, MAX)
}

function TeamRow({ name, avatarUrl }: { name: string; avatarUrl: string | null }) {
  const initial = name?.[0]?.toUpperCase() ?? "?"
  return (
    <div className="flex items-center gap-2">
      <Avatar className="size-6">
        {avatarUrl ? (
          <AvatarImage src={avatarUrl} alt={name} />
        ) : (
          <AvatarFallback className="text-xs">{initial}</AvatarFallback>
        )}
      </Avatar>
      <div className="truncate text-sm font-medium" title={name}>
        {name}
      </div>
    </div>
  )
}

function ExpandedItem({ m }: { m: MatchDoc }) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3 text-xs">
        <div className="truncate text-muted-foreground" title={m.tournamentName ?? undefined}>
          {m.tournamentName ?? "Partida"}
        </div>
        {m.isLive ? (
          <div className="font-medium text-destructive">Ao vivo</div>
        ) : (
          <div className="font-medium text-primary">{formatDateTime(m.scheduledDate)}</div>
        )}
      </div>

      <div className="mt-3 space-y-2">
        <TeamRow name={m.team1?.name ?? "Time 1"} avatarUrl={m.team1?.logo ?? m.team1?.avatar ?? null} />
        <TeamRow name={m.team2?.name ?? "Time 2"} avatarUrl={m.team2?.logo ?? m.team2?.avatar ?? null} />
      </div>

      <div className="mt-3 text-xs text-muted-foreground">
        {(m.format ?? "").toUpperCase()} {m.game ? `• ${m.game}` : ""}
      </div>
    </div>
  )
}

function CollapsedItem({ m }: { m: MatchDoc }) {
  const team1Name = m.team1?.name ?? "Time 1"
  const team2Name = m.team2?.name ?? "Time 2"
  const title = `${team1Name} vs ${team2Name}`
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        {/* Time 1 */}
        <div className="flex min-w-0 items-center gap-2">
          <Avatar className="size-5">
            {m.team1?.logo || m.team1?.avatar ? (
              <AvatarImage src={(m.team1.logo ?? m.team1.avatar)!} alt={team1Name} />
            ) : (
              <AvatarFallback className="text-[10px]">{team1Name.slice(0, 1)}</AvatarFallback>
            )}
          </Avatar>
          <div className="truncate text-sm max-w-[8rem]" title={team1Name}>
            {team1Name}
          </div>
        </div>
        {/* Espaço para placar (hoje VS) */}
        <div className="w-10 shrink-0 text-center text-xs text-muted-foreground">vs</div>
        {/* Time 2 com avatar à direita */}
        <div className="flex min-w-0 items-center gap-2">
          <div className="truncate text-sm max-w-[8rem]" title={team2Name}>
            {team2Name}
          </div>
          <Avatar className="size-5">
            {m.team2?.logo || m.team2?.avatar ? (
              <AvatarImage src={(m.team2.logo ?? m.team2.avatar)!} alt={team2Name} />
            ) : (
              <AvatarFallback className="text-[10px]">{team2Name.slice(0, 1)}</AvatarFallback>
            )}
          </Avatar>
        </div>
      </div>
      {m.isLive ? (
        <div className="text-xs font-medium text-destructive">Ao vivo</div>
      ) : (
        <div className="text-xs font-medium text-primary">{formatDateTime(m.scheduledDate)}</div>
      )}
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


