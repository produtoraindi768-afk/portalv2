'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Calendar, MapPin, Trophy, Users, DollarSign, Clock, Star } from 'lucide-react'
import { format, differenceInDays, isPast } from 'date-fns'
import { ptBR } from 'date-fns/locale'

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
  }
}

export function TournamentCard({ tournament }: TournamentCardProps) {
  const startDate = new Date(tournament.startDate)
  const endDate = new Date(tournament.endDate)
  const registrationDeadline = new Date(tournament.registrationDeadline)
  const currentDate = new Date()
  
  const isToday = format(startDate, 'yyyy-MM-dd') === format(currentDate, 'yyyy-MM-dd')
  const daysUntilStart = differenceInDays(startDate, currentDate)
  const daysUntilEnd = differenceInDays(endDate, currentDate)
  const registrationClosed = isPast(registrationDeadline)
  
  // Calcular progresso do torneio (se em andamento)
  const tournamentProgress = tournament.status === 'ongoing' 
    ? Math.max(0, Math.min(100, ((currentDate.getTime() - startDate.getTime()) / (endDate.getTime() - startDate.getTime())) * 100))
    : 0
  
  const getStatusConfig = () => {
    switch (tournament.status) {
      case 'ongoing':
        return {
          color: 'bg-destructive/10 text-destructive border-destructive/20',
          text: 'EM ANDAMENTO',
          icon: '🔴'
        }
      case 'upcoming':
        return {
          color: isToday 
            ? 'bg-primary/10 text-primary border-primary/20' 
            : 'bg-chart-2/10 text-chart-2 border-chart-2/20',
          text: isToday ? 'HOJE' : 'EM BREVE',
          icon: isToday ? '⭐' : '📅'
        }
      case 'finished':
        return {
          color: 'bg-muted text-muted-foreground border-muted',
          text: 'FINALIZADO',
          icon: '🏁'
        }
      default:
        return {
          color: 'bg-muted text-muted-foreground border-muted',
          text: 'DESCONHECIDO',
          icon: '❓'
        }
    }
  }

  const getFormatConfig = () => {
    const isOnline = tournament.format.toLowerCase().includes('online') || 
                    tournament.format.toLowerCase().includes('remoto')
    return {
      color: isOnline 
        ? 'bg-primary/10 text-primary border-primary/20' 
        : 'bg-destructive/10 text-destructive border-destructive/20',
      text: isOnline ? 'ONLINE' : 'LAN',
      icon: isOnline ? '🌐' : '🏢'
    }
  }

  const getGameConfig = (game: string) => {
    const gameColors: { [key: string]: { bg: string, text: string } } = {
      'fortnite': { bg: 'bg-chart-1', text: 'text-white' },
      'ballistic': { bg: 'bg-chart-3', text: 'text-white' },
      'league of legends': { bg: 'bg-chart-2', text: 'text-white' },
      'valorant': { bg: 'bg-destructive', text: 'text-destructive-foreground' },
      'cs2': { bg: 'bg-chart-4', text: 'text-white' },
      'csgo': { bg: 'bg-chart-4', text: 'text-white' },
      'dota': { bg: 'bg-chart-5', text: 'text-white' },
      'lol': { bg: 'bg-chart-2', text: 'text-white' },
    }

    const gameKey = game.toLowerCase()
    for (const [key, colors] of Object.entries(gameColors)) {
      if (gameKey.includes(key)) {
        return colors
      }
    }
    
    return { bg: 'bg-muted', text: 'text-muted-foreground' }
  }

  const getGameInitials = (game: string) => {
    const words = game.split(' ')
    if (words.length >= 2) {
      return words.slice(0, 2).map(word => word[0]).join('').toUpperCase()
    }
    return game.substring(0, 3).toUpperCase()
  }

  const statusConfig = getStatusConfig()
  const formatConfig = getFormatConfig()
  const gameConfig = getGameConfig(tournament.game)

  return (
    <Card className="group overflow-hidden hover:shadow-xl transition-all duration-500 cursor-pointer border-border bg-card hover:bg-accent/5 hover:-translate-y-1">
      {/* Header modernizado */}
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className={`h-12 w-12 ${gameConfig.bg} border-2 border-background`}>
              <AvatarFallback className={`${gameConfig.text} font-bold text-sm`}>
                {getGameInitials(tournament.game)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <h3 className="font-bold text-base leading-tight line-clamp-1 group-hover:text-primary transition-colors">
                {tournament.name}
              </h3>
              <p className="text-xs text-muted-foreground">{tournament.game}</p>
            </div>
          </div>
          
          {/* Badge de destaque para prêmios altos */}
          {tournament.prizePool >= 25000 && (
            <div className="flex items-center">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            </div>
          )}
        </div>
      </CardHeader>

      {/* Conteúdo principal */}
      <CardContent className="space-y-4">
        {/* Badges de status e formato */}
        <div className="flex gap-2">
          <Badge className={`text-xs border ${statusConfig.color}`} variant="outline">
            {statusConfig.icon} {statusConfig.text}
          </Badge>
          <Badge className={`text-xs border ${formatConfig.color}`} variant="outline">
            {formatConfig.icon} {formatConfig.text}
          </Badge>
        </div>

        {/* Progresso do torneio (apenas se em andamento) */}
        {tournament.status === 'ongoing' && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progresso</span>
              <span>{Math.round(tournamentProgress)}%</span>
            </div>
            <Progress value={tournamentProgress} className="h-2" />
          </div>
        )}

        {/* Informações de data */}
        <div className="space-y-2">
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="line-clamp-1">
              {format(startDate, 'dd/MM/yy', { locale: ptBR })} - {format(endDate, 'dd/MM/yy', { locale: ptBR })}
            </span>
          </div>
          
          {/* Contagem regressiva ou status temporal */}
          {tournament.status === 'upcoming' && daysUntilStart >= 0 && (
            <div className="flex items-center text-xs text-muted-foreground">
              <Clock className="w-3 h-3 mr-2" />
              <span>
                {daysUntilStart === 0 ? 'Hoje' : 
                 daysUntilStart === 1 ? 'Amanhã' : 
                 `Em ${daysUntilStart} dias`}
              </span>
            </div>
          )}
        </div>

        <Separator />

        {/* Informações detalhadas */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center text-muted-foreground">
            <Trophy className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="line-clamp-1 text-xs">{tournament.format}</span>
          </div>
          
          <div className="flex items-center text-muted-foreground">
            <Users className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="text-xs">{tournament.maxParticipants} vagas</span>
          </div>
        </div>

        {/* Premiação e taxa */}
        <div className="space-y-2">
          {tournament.prizePool > 0 && (
            <div className="flex items-center justify-between">
              <div className="flex items-center text-muted-foreground">
                <DollarSign className="w-4 h-4 mr-1" />
                <span className="text-sm font-medium">Premiação</span>
              </div>
              <span className="text-sm font-bold text-primary">
                R$ {tournament.prizePool.toLocaleString('pt-BR')}
              </span>
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Taxa de inscrição</span>
            <Badge variant={tournament.entryFee === 0 ? "secondary" : "outline"} className="text-xs">
              {tournament.entryFee === 0 ? "GRATUITO" : `R$ ${tournament.entryFee}`}
            </Badge>
          </div>
        </div>

        {/* Aviso de inscrições */}
        {tournament.status === 'upcoming' && registrationClosed && (
          <div className="mt-3 p-2 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-xs text-destructive text-center">
              🚫 Inscrições encerradas
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
