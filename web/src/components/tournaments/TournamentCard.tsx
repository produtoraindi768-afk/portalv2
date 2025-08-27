'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Calendar, Users, DollarSign, Clock, ExternalLink, Trophy, Gamepad2, MapPin, CheckCircle, AlertCircle } from 'lucide-react'
import { format, differenceInDays, isPast, isToday, isTomorrow, formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface TournamentCardProps {
  tournament: {
    id: string
    name: string
    game: string
    format: string
    description: string
    startDate: string
    endDate: string
    registrationDeadline: string
    maxParticipants: number
    prizePool: number
    entryFee: number
    rules: string
    status: 'upcoming' | 'ongoing' | 'finished'
    isActive: boolean
    avatar?: string
    tournamentUrl?: string
    // Campos específicos do Battlefy para melhor UX
    lastCompletedMatchAt?: string
    battlefyStatus?: string
    battlefyState?: string
  }
}

export function TournamentCard({ tournament }: TournamentCardProps) {
  const startDate = new Date(tournament.startDate)
  const endDate = new Date(tournament.endDate)
  const registrationDeadline = new Date(tournament.registrationDeadline)
  const currentDate = new Date()
  
  // Usar o status já calculado corretamente na página principal
  const realStatus = tournament.status
  const isTournamentToday = isToday(startDate)
  const isTournamentTomorrow = isTomorrow(startDate)
  const daysUntilStart = differenceInDays(startDate, currentDate)
  const daysUntilEnd = differenceInDays(endDate, currentDate)
  const registrationClosed = isPast(registrationDeadline)
  const isBattlefyTournament = tournament.id.startsWith('battlefy_')
  
  // Melhor tratamento de data e horário
  const getDateInfo = () => {
    if (realStatus === 'ongoing') {
      return {
        primary: 'EM ANDAMENTO',
        secondary: `Até ${format(endDate, 'dd/MM', { locale: ptBR })}`,
        urgency: 'high'
      }
    }
    
    if (isTournamentToday) {
      return {
        primary: 'HOJE',
        secondary: format(startDate, 'HH:mm'),
        urgency: 'high'
      }
    }
    
    if (isTournamentTomorrow) {
      return {
        primary: 'AMANHÃ',
        secondary: format(startDate, 'HH:mm'),
        urgency: 'medium'
      }
    }
    
    if (daysUntilStart > 0 && daysUntilStart <= 7) {
      return {
        primary: `${daysUntilStart} ${daysUntilStart === 1 ? 'DIA' : 'DIAS'}`,
        secondary: format(startDate, 'dd/MM'),
        urgency: 'medium'
      }
    }
    
    return {
      primary: format(startDate, 'dd/MM/yy', { locale: ptBR }),
      secondary: format(startDate, 'HH:mm'),
      urgency: 'low'
    }
  }
  
  const dateInfo = getDateInfo()
  

  
  const getStatusConfig = () => {
    switch (realStatus) {
      case 'ongoing':
        return {
          color: 'bg-red-500 text-white border-red-500',
          text: 'AO VIVO',
          icon: '🔴',
          pulse: true
        }
      case 'upcoming':
        if (dateInfo.urgency === 'high') {
          return {
            color: 'bg-primary text-primary-foreground border-primary',
            text: dateInfo.primary,
            icon: '⭐',
            pulse: false
          }
        }
        return {
          color: 'bg-chart-2/10 text-chart-2 border-chart-2/20',
          text: 'PRÓXIMO',
          icon: '📅',
          pulse: false
        }
      case 'finished':
        return {
          color: 'bg-muted text-muted-foreground border-muted',
          text: 'FINALIZADO',
          icon: '🏁',
          pulse: false
        }
      default:
        return {
          color: 'bg-muted text-muted-foreground border-muted',
          text: 'DESCONHECIDO',
          icon: '❓',
          pulse: false
        }
    }
  }

  const getFormatConfig = () => {
    const formatLower = tournament.format.toLowerCase()
    const isOnline = formatLower.includes('online') || formatLower.includes('remoto')
    const isTeam = formatLower.includes('equip') || formatLower.includes('team')
    
    return {
      type: isOnline ? 'ONLINE' : 'LAN',
      mode: isTeam ? 'EQUIPES' : 'INDIVIDUAL',
      onlineColor: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
      lanColor: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
      teamColor: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
      soloColor: 'bg-green-500/10 text-green-600 border-green-500/20'
    }
  }
  
  const getPrizePoolTier = () => {
    if (tournament.prizePool >= 50000) return 'premium'
    if (tournament.prizePool >= 10000) return 'high'
    if (tournament.prizePool >= 1000) return 'medium'
    return 'low'
  }

  const statusConfig = getStatusConfig()
  const formatConfig = getFormatConfig()
  const prizePoolTier = getPrizePoolTier()

  return (
    <Card 
      className={cn(
        "group overflow-hidden transition-all duration-300 cursor-pointer border-border/50 bg-card",
        "hover:shadow-xl hover:border-primary/20 hover:-translate-y-1",
        realStatus === 'ongoing' && "ring-2 ring-red-500/20 shadow-lg shadow-red-500/10",
        dateInfo.urgency === 'high' && realStatus === 'upcoming' && "ring-2 ring-primary/20 shadow-lg shadow-primary/10",
        prizePoolTier === 'premium' && "bg-gradient-to-br from-card to-yellow-50/20"
      )}
      onClick={() => {
        if (tournament.tournamentUrl) {
          window.open(tournament.tournamentUrl, '_blank')
        }
      }}
    >
      {/* Header melhorado com overlay e badges */}
      <div className="relative h-32 overflow-hidden">
        {/* Imagem de fundo com gradiente overlay */}
        {tournament.avatar ? (
          <>
            <img 
              src={tournament.avatar} 
              alt={`Avatar do torneio ${tournament.name}`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.style.display = 'none'
                target.nextElementSibling?.classList.remove('hidden')
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          </>
        ) : (
          <>
            <div className="w-full h-full bg-gradient-to-br from-primary/80 via-primary/60 to-purple-600/80"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          </>
        )}
        
        {/* Fallback gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-primary/60 to-purple-600/80 hidden"></div>
        
        {/* Status badge no canto superior direito */}
        <div className="absolute top-3 right-3">
          <Badge 
            className={cn(
              "text-xs border font-semibold",
              statusConfig.color,
              statusConfig.pulse && "animate-pulse"
            )} 
            variant="outline"
          >
            {statusConfig.icon} {statusConfig.text}
          </Badge>
        </div>
        
        {/* Source badge para Battlefy */}
        {isBattlefyTournament && (
          <div className="absolute top-3 left-3">
            <Badge 
              variant="outline" 
              className="text-xs bg-blue-500/20 text-blue-300 border-blue-400/30 font-medium"
            >
              ⚡ Battlefy
            </Badge>
          </div>
        )}
        
        {/* Prize pool tier indicator */}
        {prizePoolTier === 'premium' && (
          <div className="absolute bottom-3 left-3">
            <Badge 
              variant="outline" 
              className="text-xs bg-yellow-500/20 text-yellow-300 border-yellow-400/30 font-medium"
            >
              💎 Premium
            </Badge>
          </div>
        )}
      </div>

      {/* Conteúdo principal melhorado */}
      <CardContent className="p-6 space-y-4">
        {/* Header do torneio com jogo */}
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg leading-tight text-foreground mb-2 line-clamp-2">
                {tournament.name}
              </h3>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs font-medium bg-muted/50">
                  <Gamepad2 className="w-3 h-3 mr-1" />
                  {tournament.game}
                </Badge>
              </div>
            </div>
            
            {/* Avatar do jogo ou torneio */}
            <Avatar className="w-12 h-12 border-2 border-border/20">
              <AvatarImage src={tournament.avatar} alt={tournament.game} />
              <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                {tournament.game.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
          
          {/* Badges de formato e modo */}
          <div className="flex gap-2 flex-wrap">
            <Badge 
              className={cn(
                "text-xs border",
                formatConfig.type === 'ONLINE' ? formatConfig.onlineColor : formatConfig.lanColor
              )} 
              variant="outline"
            >
              {formatConfig.type === 'ONLINE' ? '🌐' : '🏢'} {formatConfig.type}
            </Badge>
            <Badge 
              className={cn(
                "text-xs border",
                formatConfig.mode === 'EQUIPES' ? formatConfig.teamColor : formatConfig.soloColor
              )} 
              variant="outline"
            >
              {formatConfig.mode === 'EQUIPES' ? '👥' : '👤'} {formatConfig.mode}
            </Badge>
          </div>
        </div>

        <Separator className="bg-border/30" />



        {/* Informações de data e tempo melhoradas */}
        <div className="space-y-4">
          {/* Data principal destacada */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">
                {dateInfo.primary}
              </span>
            </div>
            <span className={cn(
              "text-sm font-medium",
              dateInfo.urgency === 'high' ? 'text-primary' : 'text-muted-foreground'
            )}>
              {dateInfo.secondary}
            </span>
          </div>
          
          {/* Período completo do torneio */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>
              {format(startDate, 'dd/MM', { locale: ptBR })} - {format(endDate, 'dd/MM', { locale: ptBR })}
            </span>
            {realStatus === 'ongoing' && (
              <Badge variant="outline" className="text-xs bg-red-500/10 text-red-600 border-red-500/20 ml-auto">
                🔴 Ativo
              </Badge>
            )}
          </div>
          
          {/* Status de inscrições */}
          {realStatus === 'upcoming' && (
            <div className="flex items-center gap-2 text-xs">
              {registrationClosed ? (
                <>
                  <AlertCircle className="w-3 h-3 text-red-500" />
                  <span className="text-red-600 font-medium">Inscrições encerradas</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  <span className="text-green-600 font-medium">
                    Inscrições até {format(registrationDeadline, 'dd/MM', { locale: ptBR })}
                  </span>
                </>
              )}
            </div>
          )}
        </div>

        <Separator className="bg-border/40" />

        {/* Informações de participação */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            <div className="text-sm">
              <div className="font-medium text-foreground">{tournament.maxParticipants}</div>
              <div className="text-xs text-muted-foreground">participantes</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <div className="text-sm">
              <div className="font-medium text-foreground truncate">
                {tournament.format.split(' ')[0] || 'Formato'}
              </div>
              <div className="text-xs text-muted-foreground">formato</div>
            </div>
          </div>
        </div>

        {/* Premiação e investimento */}
        <div className="space-y-4">
          {/* Premiação destacada */}
          {tournament.prizePool > 0 && (
            <div className={cn(
              "p-3 rounded-lg border",
              prizePoolTier === 'premium' && "bg-gradient-to-r from-yellow-500/5 to-orange-500/5 border-yellow-500/20",
              prizePoolTier === 'high' && "bg-gradient-to-r from-green-500/5 to-blue-500/5 border-green-500/20",
              prizePoolTier === 'medium' && "bg-muted/30 border-border/30",
              prizePoolTier === 'low' && "bg-muted/20 border-border/20"
            )}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trophy className={cn(
                    "w-4 h-4",
                    prizePoolTier === 'premium' && "text-yellow-600",
                    prizePoolTier === 'high' && "text-green-600",
                    prizePoolTier === 'medium' && "text-blue-600",
                    prizePoolTier === 'low' && "text-muted-foreground"
                  )} />
                  <span className="text-sm font-medium text-foreground">Premiação</span>
                </div>
                <div className="text-right">
                  <div className={cn(
                    "font-bold",
                    prizePoolTier === 'premium' && "text-yellow-700 text-base",
                    prizePoolTier === 'high' && "text-green-700 text-base",
                    prizePoolTier === 'medium' && "text-blue-700 text-sm",
                    prizePoolTier === 'low' && "text-muted-foreground text-sm"
                  )}>
                    R$ {tournament.prizePool.toLocaleString('pt-BR')}
                  </div>
                  {prizePoolTier === 'premium' && (
                    <div className="text-xs text-yellow-600 font-medium">Alto valor!</div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Taxa de entrada */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Inscrição</span>
            <Badge 
              variant={tournament.entryFee === 0 ? "default" : "outline"} 
              className={cn(
                "text-xs font-medium",
                tournament.entryFee === 0 
                  ? "bg-green-500 hover:bg-green-600 text-white border-green-500" 
                  : "border-border text-muted-foreground bg-muted/50"
              )}
            >
              {tournament.entryFee === 0 ? (
                <span className="flex items-center gap-1">
                  🎉 GRATUITO
                </span>
              ) : (
                `R$ ${tournament.entryFee.toLocaleString('pt-BR')}`
              )}
            </Badge>
          </div>
        </div>

        {/* Avisos importantes e ações */}
        <div className="space-y-3">
          {/* Aviso de inscrições encerradas */}
          {realStatus === 'upcoming' && registrationClosed && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <p className="text-sm text-red-700 font-medium">
                  Inscrições encerradas em {format(registrationDeadline, 'dd/MM', { locale: ptBR })}
                </p>
              </div>
            </div>
          )}
          
          {/* Indicador de link externo */}
          {tournament.tournamentUrl && (
            <div className={cn(
              "p-3 rounded-lg border transition-colors",
              realStatus === 'ongoing' 
                ? "bg-red-50 border-red-200 hover:bg-red-100" 
                : "bg-primary/5 border-primary/20 hover:bg-primary/10"
            )}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ExternalLink className={cn(
                    "w-4 h-4 flex-shrink-0",
                    realStatus === 'ongoing' ? "text-red-600" : "text-primary"
                  )} />
                  <p className={cn(
                    "text-sm font-medium",
                    realStatus === 'ongoing' ? "text-red-700" : "text-primary"
                  )}>
                    {realStatus === 'ongoing' ? 'Acompanhar ao vivo' : 'Ver detalhes completos'}
                  </p>
                </div>
                <Badge 
                  variant="outline" 
                  className={cn(
                    "text-xs",
                    realStatus === 'ongoing' 
                      ? "bg-red-100 text-red-700 border-red-300" 
                      : "bg-primary/10 text-primary border-primary/30"
                  )}
                >
                  {isBattlefyTournament ? 'Battlefy' : 'Site oficial'}
                </Badge>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
