'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

import { Separator } from '@/components/ui/separator'
import { Calendar, Users, DollarSign, Clock } from 'lucide-react'
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
    avatar?: string
    tournamentUrl?: string
  }
}

export function TournamentCard({ tournament }: TournamentCardProps) {
  const startDate = new Date(tournament.startDate)
  const endDate = new Date(tournament.endDate)
  const registrationDeadline = new Date(tournament.registrationDeadline)
  const currentDate = new Date()
  
  // Calcular status dinamicamente baseado nas datas
  const calculateRealStatus = () => {
    const now = currentDate.getTime()
    const start = startDate.getTime()
    const end = endDate.getTime()
    
    if (now < start) {
      return 'upcoming' // Torneio ainda não começou
    } else if (now >= start && now <= end) {
      return 'ongoing' // Torneio em andamento
    } else {
      return 'finished' // Torneio já terminou
    }
  }
  
  const realStatus = calculateRealStatus()
  const isToday = format(startDate, 'yyyy-MM-dd') === format(currentDate, 'yyyy-MM-dd')
  const daysUntilStart = differenceInDays(startDate, currentDate)
  const daysUntilEnd = differenceInDays(endDate, currentDate)
  const registrationClosed = isPast(registrationDeadline)
  

  
  const getStatusConfig = () => {
    switch (realStatus) {
      case 'ongoing':
        return {
          color: 'bg-destructive/10 text-destructive border-destructive/20',
          text: 'AO VIVO',
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

  const statusConfig = getStatusConfig()
  const formatConfig = getFormatConfig()

  return (
    <Card 
      className="group overflow-hidden hover:shadow-xl transition-all duration-500 cursor-pointer border-border bg-card hover:bg-accent/5 hover:-translate-y-1"
      onClick={() => {
        if (tournament.tournamentUrl) {
          window.open(tournament.tournamentUrl, '_blank')
        }
      }}
    >
      {/* Header com imagem do avatar limpa */}
      <div className="relative h-24 overflow-hidden">
        {/* Imagem de fundo do avatar */}
        {tournament.avatar ? (
          <img 
            src={tournament.avatar} 
            alt={`Avatar do torneio ${tournament.name}`}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback para gradiente sólido se a imagem falhar
              const target = e.target as HTMLImageElement
              target.style.display = 'none'
              target.nextElementSibling?.classList.remove('hidden')
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-600"></div>
        )}
        
        {/* Fallback para gradiente sólido se não houver avatar */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 hidden"></div>
      </div>

      {/* Conteúdo do card */}
      <CardContent className="p-6 space-y-4">
        {/* Nome do torneio */}
        <div className="text-center">
          <h3 className="font-bold text-xl leading-tight text-foreground mb-2">
            {tournament.name}
          </h3>
          <p className="text-sm text-muted-foreground">{tournament.game}</p>
        </div>

        {/* Badges de status e formato */}
        <div className="flex gap-2 justify-center">
          <Badge className={`text-xs border ${statusConfig.color}`} variant="outline">
            {statusConfig.icon} {statusConfig.text}
          </Badge>
          <Badge className={`text-xs border ${formatConfig.color}`} variant="outline">
            {formatConfig.icon} {formatConfig.text}
          </Badge>
        </div>



        {/* Informações de data */}
        <div className="space-y-3">
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="line-clamp-1">
              {format(startDate, 'dd/MM/yy', { locale: ptBR })} - {format(endDate, 'dd/MM/yy', { locale: ptBR })}
            </span>
          </div>
          
          {/* Contagem regressiva ou status temporal */}
          {realStatus === 'upcoming' && daysUntilStart >= 0 && (
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

        <Separator className="bg-border" />

        {/* Informações detalhadas */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center text-muted-foreground">
            <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="line-clamp-1 text-xs">{tournament.format}</span>
          </div>
          
          <div className="flex items-center text-muted-foreground">
            <Users className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="text-xs">{tournament.maxParticipants} vagas</span>
          </div>
        </div>

        {/* Premiação e taxa */}
        <div className="space-y-3">
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
            <Badge 
              variant={tournament.entryFee === 0 ? "default" : "outline"} 
              className={`text-xs ${
                tournament.entryFee === 0 
                  ? "bg-chart-2 hover:bg-chart-2/90 text-white border-chart-2" 
                  : "border-border text-muted-foreground"
              }`}
            >
              {tournament.entryFee === 0 ? (
                <span className="flex items-center gap-1">
                  🎉 GRATUITO
                </span>
              ) : (
                `R$ ${tournament.entryFee}`
              )}
            </Badge>
          </div>
        </div>

        {/* Aviso de inscrições */}
        {realStatus === 'upcoming' && registrationClosed && (
          <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-xs text-destructive text-center">
              🚫 Inscrições encerradas
            </p>
          </div>
        )}

        {/* Indicador de link externo */}
        {tournament.tournamentUrl && (
          <div className="mt-4 p-3 bg-primary/10 border border-primary/20 rounded-lg">
            <p className="text-xs text-primary text-center flex items-center justify-center gap-1">
              🔗 Clique para acessar o site oficial
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
