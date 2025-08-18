'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { 
  Trophy, 
  Calendar, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Clock,
  Star,
  GamepadIcon
} from 'lucide-react'

interface Tournament {
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

interface TournamentStatsProps {
  tournaments: Tournament[]
}

export function TournamentStats({ tournaments }: TournamentStatsProps) {
  // Calcular estatísticas
  const ongoingTournaments = tournaments.filter(t => t.status === 'ongoing')
  const upcomingTournaments = tournaments.filter(t => t.status === 'upcoming')
  const finishedTournaments = tournaments.filter(t => t.status === 'finished')
  
  const totalPrizePool = tournaments.reduce((sum, t) => sum + t.prizePool, 0)
  const totalParticipants = tournaments.reduce((sum, t) => sum + t.maxParticipants, 0)
  const freeTournaments = tournaments.filter(t => t.entryFee === 0).length
  
  // Estatísticas por jogo
  const gameStats = tournaments.reduce((acc, tournament) => {
    acc[tournament.game] = (acc[tournament.game] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  const topGames = Object.entries(gameStats)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)

  // Torneis de destaque (alto prêmio)
  const premiumTournaments = tournaments.filter(t => t.prizePool >= 25000).length

  const stats = [
    {
      title: 'Torneios Ativos',
      value: ongoingTournaments.length,
      icon: <Trophy className="w-5 h-5" />,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
      description: 'Em andamento agora'
    },
    {
      title: 'Próximos Torneios',
      value: upcomingTournaments.length,
      icon: <Calendar className="w-5 h-5" />,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      description: 'Inscrições abertas'
    },
    {
      title: 'Premiação Total',
      value: `R$ ${totalPrizePool.toLocaleString('pt-BR')}`,
      icon: <DollarSign className="w-5 h-5" />,
      color: 'text-chart-2',
      bgColor: 'bg-chart-2/10',
      description: 'Em prêmios disponíveis'
    },
    {
      title: 'Vagas Disponíveis',
      value: totalParticipants.toLocaleString('pt-BR'),
      icon: <Users className="w-5 h-5" />,
      color: 'text-chart-4',
      bgColor: 'bg-chart-4/10',
      description: 'Para participantes'
    }
  ]

  return (
    <div className="mb-16 space-y-8">
      {/* Header da seção */}
      <div className="text-center lg:text-left">
        <h2 className="text-2xl/tight font-bold tracking-tight text-balance sm:text-3xl/tight text-foreground mb-4">
          Estatísticas dos Torneios
        </h2>
        <p className="text-muted-foreground text-base/7 text-balance">
          Visão geral dos campeonatos e competições disponíveis
        </p>
      </div>

      {/* Cards de estatísticas principais */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index} className="border-border bg-card hover:bg-accent/5 transition-colors">
            <CardContent className="p-6 text-center">
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${stat.bgColor} ${stat.color} mb-4`}>
                {stat.icon}
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{stat.title}</h3>
              <p className="text-3xl font-bold text-foreground mb-2">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Estatísticas secundárias */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Jogos */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <GamepadIcon className="w-5 h-5 text-primary" />
              Top Jogos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {topGames.length > 0 ? (
              topGames.map(([game, count], index) => (
                <div key={game} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-semibold">
                      {index + 1}
                    </div>
                    <span className="text-foreground font-medium capitalize">{game}</span>
                  </div>
                  <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
                    {count} torneio{count !== 1 ? 's' : ''}
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-8">Nenhum jogo disponível</p>
            )}
          </CardContent>
        </Card>

        {/* Estatísticas adicionais */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-chart-3" />
              Destaques
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Torneios gratuitos */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-foreground font-medium">Torneios Gratuitos</span>
                <Badge variant="outline" className="border-chart-2/20 text-chart-2 bg-chart-2/10">
                  {freeTournaments}
                </Badge>
              </div>
              <Progress value={(freeTournaments / Math.max(tournaments.length, 1)) * 100} className="h-2" />
            </div>

            {/* Torneios premium */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-foreground font-medium">Torneios Premium</span>
                <Badge variant="outline" className="border-chart-5/20 text-chart-5 bg-chart-5/10">
                  {premiumTournaments}
                </Badge>
              </div>
              <Progress value={(premiumTournaments / Math.max(tournaments.length, 1)) * 100} className="h-2" />
            </div>

            {/* Separador */}
            <Separator className="bg-border" />

            {/* Total geral */}
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{tournaments.length}</p>
              <p className="text-sm text-muted-foreground">Total de Torneios</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 