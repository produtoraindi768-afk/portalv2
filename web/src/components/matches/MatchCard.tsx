"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type TeamInfo = {
  id?: string
  name?: string
  logo?: string | null
  avatar?: string | null
}

type MatchData = {
  id: string
  tournamentName?: string
  scheduledDate?: string
  format?: string
  game?: string
  isFeatured?: boolean
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

interface MatchCardProps {
  match: MatchData
  className?: string
}

export function MatchCard({ match, className }: MatchCardProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return { date: '--', time: '--' }
    
    try {
      const date = new Date(dateString)
      const today = new Date()
      const tomorrow = new Date(today)
      tomorrow.setDate(today.getDate() + 1)
      
      let dateLabel = date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit'
      })
      
      // Se for hoje, mostrar "HOJE"
      if (date.toDateString() === today.toDateString()) {
        dateLabel = 'HOJE'
      }
      // Se for amanhã, mostrar "AMANHÃ"
      else if (date.toDateString() === tomorrow.toDateString()) {
        dateLabel = 'AMANHÃ'
      }
      
      const time = date.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      })
      
      return { date: dateLabel, time }
    } catch {
      return { date: '--', time: '--' }
    }
  }

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'ongoing':
        return (
          <Badge variant="destructive" className="bg-red-500 text-white animate-pulse">
            Ao vivo
          </Badge>
        )
      case 'finished':
        return (
          <Badge variant="secondary" className="bg-muted text-muted-foreground">
            FINALIZADA
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="border-primary text-primary">
            AGENDADA
          </Badge>
        )
    }
  }

  const getScores = () => {
    if (match.status !== 'finished' && match.status !== 'ongoing') {
      return null;
    }

    // Score principal: sempre usar result
    const mainScore = match.result && (match.result.team1Score > 0 || match.result.team2Score > 0 || match.result.winner) ? {
      team1Score: match.result.team1Score || 0,
      team2Score: match.result.team2Score || 0,
      winner: match.result.winner,
      format: 'BO1'
    } : null;

    // Score secundário: priorizar resultMD5, depois resultMD3
    let secondaryScore = null;
    if (match.resultMD5 && (match.resultMD5.team1Score > 0 || match.resultMD5.team2Score > 0 || match.resultMD5.winner)) {
      secondaryScore = {
        team1Score: match.resultMD5.team1Score || 0,
        team2Score: match.resultMD5.team2Score || 0,
        winner: match.resultMD5.winner,
        format: 'MD5'
      };
    } else if (match.resultMD3 && (match.resultMD3.team1Score > 0 || match.resultMD3.team2Score > 0 || match.resultMD3.winner)) {
      secondaryScore = {
        team1Score: match.resultMD3.team1Score || 0,
        team2Score: match.resultMD3.team2Score || 0,
        winner: match.resultMD3.winner,
        format: 'MD3'
      };
    }

    return { mainScore, secondaryScore };
  }

  const { date, time } = formatDate(match.scheduledDate)
  const team1Name = match.team1?.name || 'Time 1'
  const team2Name = match.team2?.name || 'Time 2'
  const team1Logo = match.team1?.logo || match.team1?.avatar
  const team2Logo = match.team2?.logo || match.team2?.avatar
  const scores = getScores()
  const mainScore = scores?.mainScore
  const secondaryScore = scores?.secondaryScore

  return (
    <Card className={cn(
      "overflow-hidden transition-all duration-200 hover:shadow-lg border-border/50",
      match.isFeatured && "ring-2 ring-primary/20",
      className
    )}>
      <CardContent className="p-0">
        {/* Header com torneio */}
        <div className="bg-gradient-to-r from-muted/20 via-muted/30 to-muted/20 px-4 py-4 border-b border-border/50">
          <div className="flex justify-center">
            <div className="flex items-center gap-3">
              <span className="text-base font-bold text-center bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent drop-shadow-sm">
                {match.tournamentName || 'Torneio'}
              </span>
              {match.isFeatured && (
                <Badge variant="secondary" className="text-xs px-2 py-1 bg-gradient-to-r from-yellow-400/20 to-yellow-600/20 border-yellow-500/30">
                  ⭐ Destaque
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Conteúdo principal da partida */}
        <div className="p-6">
          {/* Times e VS */}
          <div className="flex items-center justify-between gap-4 mb-4">
            {/* Time 1 */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="relative">
                <div className="w-12 h-12 border-2 border-primary/20 rounded-lg p-1.5 bg-muted/30">
                  <Avatar className="w-full h-full">
                    {team1Logo ? (
                      <AvatarImage src={team1Logo} alt={team1Name} />
                    ) : (
                      <AvatarFallback className="text-sm font-bold bg-primary/10 text-primary">
                        {team1Name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <div className={cn(
                  "font-semibold truncate text-foreground"
                )}>
                  {team1Name}
                </div>
                {mainScore && match.status === 'finished' && mainScore.winner === 'team1' && (
                  <div className="text-xs text-green-500 font-medium">
                    🏆 Vencedor
                  </div>
                )}
              </div>
            </div>

            {/* VS e Score/Horário */}
            <div className="flex flex-col items-center gap-2 min-w-[80px]">
              {mainScore ? (
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">
                    {mainScore.team1Score} - {mainScore.team2Score}
                  </div>
                  {secondaryScore && (
                    <div className="text-sm text-muted-foreground mt-1">
                      ({secondaryScore.team1Score} - {secondaryScore.team2Score})
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground mt-1">
                    {secondaryScore ? (match.resultMD5 ? 'MD5' : 'MD3') : (mainScore.format || 'BO1')}
                  </div>

                </div>
              ) : (
                <div className="text-center">
                  <div className="text-lg font-bold text-muted-foreground">
                    VS
                  </div>
                  <div className="text-sm font-medium text-foreground">
                    {time}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {date}
                  </div>
                </div>
              )}
            </div>

            {/* Time 2 */}
            <div className="flex items-center gap-3 flex-1 min-w-0 flex-row-reverse">
              <div className="relative">
                <div className="w-12 h-12 border-2 border-primary/20 rounded-lg p-1.5 bg-muted/30">
                  <Avatar className="w-full h-full">
                    {team2Logo ? (
                      <AvatarImage src={team2Logo} alt={team2Name} />
                    ) : (
                      <AvatarFallback className="text-sm font-bold bg-primary/10 text-primary">
                        {team2Name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>
                </div>
              </div>
              <div className="min-w-0 flex-1 text-right">
                <div className={cn(
                  "font-semibold truncate text-foreground"
                )}>
                  {team2Name}
                </div>
                {mainScore && match.status === 'finished' && mainScore.winner === 'team2' && (
                  <div className="text-xs text-green-500 font-medium">
                    🏆 Vencedor
                  </div>
                )}
              </div>
            </div>
          </div>


        </div>
      </CardContent>
    </Card>
  )
}