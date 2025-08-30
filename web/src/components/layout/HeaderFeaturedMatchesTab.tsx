"use client"

import { useEffect, useState, useRef, useMemo } from "react"
import { useCombinedMatches } from '@/hooks/useCombinedMatches'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useHeaderHeight } from "@/contexts/HeaderHeightContext"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Play } from "lucide-react"
import { cn } from "@/lib/utils"
import { ProgressiveBlurHorizontal } from "@/components/magicui/progressive-blur-horizontal"
import { Marquee } from "@/components/magicui/marquee"


import type { MatchData } from '@/hooks/useCombinedMatches'

export function HeaderFeaturedMatchesTab() {
  const { matches, isLoading, error } = useCombinedMatches()
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const containerRef = useRef<HTMLDivElement>(null)
  const { setFeaturedMatchesHeight } = useHeaderHeight()







  // Filter live matches
  const liveMatches = useMemo(() => {
    if (!matches || matches.length === 0) {
      console.log('HeaderFeaturedMatchesTab - No matches available')
      return []
    }

    const ongoing = matches.filter(match => match.status === 'ongoing')
    const scheduled = matches.filter(match => match.status === 'scheduled')
    const finished = matches.filter(match => match.status === 'finished')

    // Prioritize ongoing matches, then scheduled, then finished
    const prioritized = [...ongoing, ...scheduled, ...finished]
    
    console.log('HeaderFeaturedMatchesTab - Filtered matches:', {
      total: matches.length,
      ongoing: ongoing.length,
      scheduled: scheduled.length,
      finished: finished.length,
      prioritized: prioritized.length
    })
    
    return prioritized.slice(0, 10) // Limit to 10 matches
  }, [matches])

  // Update header height when matches change
  useEffect(() => {
    if (liveMatches.length > 0 && !isLoading) {
      setFeaturedMatchesHeight(120) // Height for the featured matches section
    } else {
      setFeaturedMatchesHeight(0)
    }
  }, [liveMatches.length, setFeaturedMatchesHeight, isLoading])

  // Loading state
  if (isLoading) {
    return (
      <div className="border-b bg-background text-card-foreground relative z-[60] py-4">
        <div className="relative w-full overflow-hidden">
          <div className="flex gap-3 overflow-x-auto pb-4 px-3 lg:px-6">
            {[...Array(3)].map((_, i) => (
              <FeaturedMatchCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return null
  }

  // No matches state
  if (liveMatches.length === 0) {
    return null
  }

  return (
    <div
      ref={containerRef}
      className="border-b bg-background text-card-foreground relative z-[60] py-4"
    >
      <div className="relative w-full overflow-hidden">
        <Marquee 
          pauseOnHover 
          className="[--duration:90s] [--gap:0.5rem] py-2"
        >
          {liveMatches.map((m: MatchData) => (
            <FeaturedMatchCard key={m.id} match={m} />
          ))}
        </Marquee>
        
        {/* Progressive Blur nas bordas laterais */}
        <ProgressiveBlurHorizontal 
          className="absolute top-0 left-0 bottom-0 z-20 pointer-events-none" 
          position="left" 
          width="60px md:120px"
          blurLevels={[12, 8, 6, 4, 2, 0]}
        />
        <ProgressiveBlurHorizontal 
          className="absolute top-0 right-0 bottom-0 z-20 pointer-events-none" 
          position="right" 
          width="60px md:120px"
          blurLevels={[0, 2, 4, 6, 8, 12]}
        />
      </div>
    </div>
  )
}

function FeaturedMatchCard({ match }: { match: MatchData }) {
  const team1Name = match.team1?.name ?? "Time 1"
  const team2Name = match.team2?.name ?? "Time 2"
  const team1Logo = match.team1?.logo ?? match.team1?.avatar
  const team2Logo = match.team2?.logo ?? match.team2?.avatar

  const formatMatchDateTime = (dateString?: string) => {
    if (!dateString) {
      return { day: "TBD", time: "TBD" }
    }
    
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        return { day: "TBD", time: "TBD" }
      }
      
      const day = date.toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: '2-digit' 
      })
      const time = date.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
      
      return { day, time }
    } catch {
      return { day: "TBD", time: "TBD" }
    }
  }

  const { day, time } = formatMatchDateTime(match.scheduledDate)
  const tournamentName = match.tournamentName ?? "CALL OF DUTY LIVE STREAM"

  const getStatusStyles = () => {
    if (match.status === 'ongoing') {
      return {
        border: "border-muted-foreground/30",
        bg: "bg-muted/10",
        hoverBorder: "hover:border-muted-foreground/40",
        hoverBg: "hover:bg-gradient-to-br hover:from-muted/20 hover:to-muted/15",
        indicator: true
      }
    }
    if (match.status === 'finished') {
      return {
        border: "border-muted-foreground/20",
        bg: "bg-muted/15",
        hoverBorder: "hover:border-muted-foreground/35",
        hoverBg: "hover:bg-gradient-to-br hover:from-muted/25 hover:to-muted/20",
        indicator: false
      }
    }
    return {
      border: "border-muted-foreground/15",
      bg: "bg-muted/5",
      hoverBorder: "hover:border-muted-foreground/35",
      hoverBg: "hover:bg-gradient-to-br hover:from-muted/18 hover:to-muted/12",
      indicator: false
    }
  }

  const statusStyles = getStatusStyles()

  return (
    <div className={cn(
      "group relative flex-shrink-0 select-none overflow-hidden",
      "rounded-xl border shadow-sm transition-all duration-300 ease-out",
      "hover:shadow-md hover:shadow-muted/10",
      // Mobile: largura fixa com altura automática e padding sutil
      "w-[200px] min-h-[110px] p-3 flex flex-col justify-center items-center text-center",
      // Tablet: tamanho ajustado ao conteúdo com altura automática e padding sutil
      "md:w-fit md:min-h-[120px] md:p-4 md:flex-row md:justify-center md:items-center md:text-center md:min-w-[260px]",
      // Desktop: tamanho ajustado ao conteúdo com altura automática e padding sutil
      "lg:min-h-[130px] lg:p-4 lg:min-w-[300px]",
      statusStyles.bg,
      statusStyles.border,
      statusStyles.hoverBorder,
      statusStyles.hoverBg
    )}>
      {/* Mobile Layout - Vertical Centered */}
       <div className="flex flex-col items-center justify-center gap-3 md:hidden w-full h-full">
         {/* Tournament Name */}
         <div className="text-[10px] text-muted-foreground/80 font-medium text-center leading-tight max-w-[180px] truncate">
           {tournamentName}
         </div>
         
         {/* Teams */}
         <div className="flex items-center justify-center gap-2 w-full">
           <div className="flex flex-col items-center gap-0.5">
             <Avatar className="w-6 h-6 bg-muted/8 border border-muted-foreground/15 hover:border-muted-foreground/40 hover:bg-muted/25 transition-all duration-300">
               {team1Logo ? (
                 <AvatarImage src={team1Logo} alt={team1Name} className="object-cover" />
               ) : (
                 <AvatarFallback className="bg-transparent text-muted-foreground font-bold text-[9px]">
                   {team1Name.slice(0, 2).toUpperCase()}
                 </AvatarFallback>
               )}
             </Avatar>
             <span className="text-[10px] font-medium text-foreground text-center leading-tight max-w-[60px] truncate">
               {team1Name}
             </span>
           </div>
           
           <span className="text-[11px] font-bold text-muted-foreground mx-1">×</span>
           
           <div className="flex flex-col items-center gap-0.5">
             <Avatar className="w-6 h-6 bg-muted/8 border border-muted-foreground/15 hover:border-muted-foreground/40 hover:bg-muted/25 transition-all duration-300">
               {team2Logo ? (
                 <AvatarImage src={team2Logo} alt={team2Name} className="object-cover" />
               ) : (
                 <AvatarFallback className="bg-transparent text-muted-foreground font-bold text-[9px]">
                   {team2Name.slice(0, 2).toUpperCase()}
                 </AvatarFallback>
               )}
             </Avatar>
             <span className="text-[10px] font-medium text-foreground text-center leading-tight max-w-[60px] truncate">
               {team2Name}
             </span>
           </div>
         </div>
         
         {/* Date, Time and Status */}
         <div className="flex items-center justify-center gap-1 w-full">
           <div className="px-1.5 py-0.5 bg-muted/8 border border-muted-foreground/15 rounded-lg text-[10px] font-medium text-muted-foreground">
             {time}
           </div>
           <div className="px-1.5 py-0.5 bg-muted/20 border border-muted-foreground/10 rounded-lg text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
             {day}
           </div>
           {match.status === 'ongoing' && (
             <div className="flex items-center gap-0.5 px-1.5 py-0.5 bg-muted/15 border border-muted-foreground/20 rounded-lg">
               <div className="w-1 h-1 bg-muted-foreground/60 rounded-full animate-pulse"></div>
               <span className="text-[10px] font-medium text-muted-foreground uppercase">LIVE</span>
             </div>
           )}
         </div>
       </div>

      {/* Tablet/Desktop Layout - Horizontal */}
      <div className="hidden md:flex md:flex-col lg:flex-col md:h-full md:justify-center md:items-stretch md:py-1 lg:py-1.5">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 flex-shrink-0 mb-2.5 lg:mb-3 w-full min-w-[240px] lg:min-w-[280px]">
          <div className="flex items-center gap-2">
            <div className="px-1.5 py-0.5 md:px-2 bg-muted/20 border border-muted-foreground/10 rounded-lg text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
              {day}
            </div>
            {match.status === 'ongoing' && (
              <div className="flex items-center gap-1 px-2 py-0.5 bg-muted/15 border border-muted-foreground/20 rounded-lg">
                <div className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full animate-pulse"></div>
                <span className="text-[10px] font-medium text-muted-foreground uppercase">AO VIVO</span>
              </div>
            )}
          </div>
          <div className="text-[10px] text-muted-foreground/80 font-medium text-right leading-tight w-[100px] h-[32px] overflow-hidden lg:w-[120px] lg:h-[36px] flex items-center justify-end">
            <span className="line-clamp-2 text-right">{tournamentName}</span>
          </div>
        </div>

        {/* Teams Section */}
        <div className="flex items-center justify-between flex-1 mb-2.5 lg:mb-3 w-full min-w-[240px] lg:min-w-[280px]">
          <div className="flex items-center gap-2 w-[95px] lg:w-[110px]">
            <Avatar className="w-7 h-7 bg-muted/8 border border-muted-foreground/15 hover:border-muted-foreground/40 hover:bg-muted/25 transition-all duration-300 flex-shrink-0 lg:w-8 lg:h-8">
              {team1Logo ? (
                <AvatarImage src={team1Logo} alt={team1Name} className="object-cover" />
              ) : (
                <AvatarFallback className="bg-transparent text-muted-foreground font-bold text-[9px] lg:text-[10px]">
                  {team1Name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              )}
            </Avatar>
            <span className="text-[11px] font-medium text-foreground truncate flex-1 min-w-0 lg:text-xs">
              {team1Name}
            </span>
          </div>

          <div className="px-2 flex-shrink-0">
            <span className="text-[11px] font-bold text-muted-foreground lg:text-xs">×</span>
          </div>

          <div className="flex items-center gap-2 w-[95px] lg:w-[110px] flex-row-reverse">
            <Avatar className="w-7 h-7 bg-muted/8 border border-muted-foreground/15 hover:border-muted-foreground/40 hover:bg-muted/25 transition-all duration-300 flex-shrink-0 lg:w-8 lg:h-8">
              {team2Logo ? (
                <AvatarImage src={team2Logo} alt={team2Name} className="object-cover" />
              ) : (
                <AvatarFallback className="bg-transparent text-muted-foreground font-bold text-[9px] lg:text-[10px]">
                  {team2Name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              )}
            </Avatar>
            <span className="text-[11px] font-medium text-foreground truncate text-right flex-1 min-w-0 lg:text-xs">
              {team2Name}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between flex-shrink-0 w-full min-w-[240px] lg:min-w-[280px]">
          <div className="px-1.5 py-0.5 md:px-2 bg-muted/8 border border-muted-foreground/15 rounded-lg text-[10px] font-medium text-muted-foreground hover:bg-muted/25 hover:border-muted-foreground/40 transition-all duration-300">
            {time}
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-5 px-1.5 text-[9px] font-medium lg:h-6 lg:px-2 lg:text-[10px]"
          >
            <Play className="w-2.5 h-2.5 mr-0.5 lg:w-3 lg:h-3 lg:mr-1" />
            <span className="lg:hidden">Play</span>
            <span className="hidden lg:inline">Assistir</span>
          </Button>
        </div>
      </div>
    </div>
  )
}

// Skeleton component
function FeaturedMatchCardSkeleton() {
  return (
    <div className={cn(
      "group relative flex-shrink-0 select-none overflow-hidden",
      "rounded-xl border shadow-sm transition-all duration-300 ease-out",
      "hover:shadow-md hover:shadow-muted/10",
      // Mobile: largura fixa com altura automática e padding sutil
      "w-[200px] min-h-[110px] p-3 flex flex-col justify-center items-center text-center",
      // Tablet: tamanho ajustado ao conteúdo com altura automática e padding sutil
      "md:w-fit md:min-h-[120px] md:p-4 md:flex-row md:justify-center md:items-center md:text-center md:min-w-[260px]",
      // Desktop: tamanho ajustado ao conteúdo com altura automática e padding sutil
      "lg:min-h-[130px] lg:p-4 lg:min-w-[300px]",
      "bg-muted/5 border-muted-foreground/15"
    )}
    >
      {/* Mobile Layout - Vertical */}
      <div className="flex md:hidden flex-col gap-3 w-full h-full justify-center items-center">
        {/* Tournament Name */}
        <Skeleton className="h-3 w-24 rounded-lg" />
        
        {/* Teams */}
        <div className="flex items-center justify-center gap-2 w-full">
          <div className="flex flex-col items-center gap-0.5">
            <Skeleton className="w-6 h-6 rounded-lg" />
            <Skeleton className="h-2.5 w-12 rounded-lg" />
          </div>
          
          <Skeleton className="h-2.5 w-2 rounded-lg mx-1" />
          
          <div className="flex flex-col items-center gap-0.5">
            <Skeleton className="w-6 h-6 rounded-lg" />
            <Skeleton className="h-2.5 w-12 rounded-lg" />
          </div>
        </div>
        
        {/* Date, Time and Status */}
        <div className="flex items-center justify-center gap-1 w-full">
          <Skeleton className="h-5 w-8 rounded-lg" />
          <Skeleton className="h-5 w-10 rounded-lg" />
          <Skeleton className="h-5 w-12 rounded-lg" />
        </div>
      </div>

      {/* Tablet/Desktop Layout - Horizontal */}
      <div className="hidden md:flex md:flex-col lg:flex-col md:h-full md:justify-center md:items-stretch">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 flex-shrink-0 mb-3 lg:mb-4 w-full min-w-[240px] lg:min-w-[280px]">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-10 rounded-lg" />
            <Skeleton className="h-5 w-16 rounded-lg" />
          </div>
          <Skeleton className="h-8 w-24 rounded-lg" />
        </div>

        {/* Teams Section */}
        <div className="flex items-center justify-between flex-1 mb-3 lg:mb-4 w-full min-w-[240px] lg:min-w-[280px]">
          <div className="flex items-center gap-2 w-[95px] lg:w-[110px]">
            <Skeleton className="w-7 h-7 lg:w-8 lg:h-8 rounded-lg" />
            <Skeleton className="h-4 w-16 rounded-lg" />
          </div>
          
          <Skeleton className="h-4 w-4 rounded-lg" />
          
          <div className="flex items-center gap-2 w-[95px] lg:w-[110px] flex-row-reverse">
            <Skeleton className="w-7 h-7 lg:w-8 lg:h-8 rounded-lg" />
            <Skeleton className="h-4 w-16 rounded-lg" />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between flex-shrink-0 w-full min-w-[240px] lg:min-w-[280px]">
          <Skeleton className="h-5 w-12 rounded-lg" />
          <Skeleton className="h-5 w-16 lg:h-6 lg:w-20 rounded-lg" />
        </div>
      </div>
    </div>
  )
}

export default HeaderFeaturedMatchesTab


