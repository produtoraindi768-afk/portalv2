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
        <h2 className="text-2xl/tight font-bold tracking-tight text-balance sm:text-3xl/tight mb-2">
          Estatísticas dos Torneios
        </h2>
        <p className="text-muted-foreground text-base/7">
          Visão geral das competições disponíveis na plataforma
        </p>
      </div>

      {/* Cards de estatísticas principais */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-border bg-card hover:bg-accent/5">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold tracking-tight group-hover:text-primary transition-colors">
                    {stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                </div>
                <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${stat.bgColor} ${stat.color} group-hover:scale-110 transition-transform`}>
                  {stat.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Seção de informações adicionais */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Status dos torneios */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Status dos Torneios
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Em Andamento</span>
                <Badge className="bg-destructive/10 text-destructive border-destructive/20" variant="outline">
                  {ongoingTournaments.length}
                </Badge>
              </div>
              <Progress 
                value={(ongoingTournaments.length / tournaments.length) * 100} 
                className="h-2"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Próximos</span>
                <Badge className="bg-primary/10 text-primary border-primary/20" variant="outline">
                  {upcomingTournaments.length}
                </Badge>
              </div>
              <Progress 
                value={(upcomingTournaments.length / tournaments.length) * 100} 
                className="h-2"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Finalizados</span>
                <Badge className="bg-muted text-muted-foreground" variant="outline">
                  {finishedTournaments.length}
                </Badge>
              </div>
              <Progress 
                value={(finishedTournaments.length / tournaments.length) * 100} 
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>

        {/* Jogos mais populares */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GamepadIcon className="w-5 h-5" />
              Jogos Populares
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {topGames.map(([game, count], index) => (
              <div key={game} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${
                    index === 0 ? 'bg-chart-1' : 
                    index === 1 ? 'bg-chart-2' : 
                    'bg-chart-3'
                  } text-white text-xs font-bold`}>
                    {index + 1}
                  </div>
                  <span className="text-sm font-medium line-clamp-1">{game}</span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {count} torneio{count !== 1 ? 's' : ''}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Informações extras */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Destaques
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-accent/20 rounded-lg">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="text-sm font-medium">Torneios Premium</span>
              </div>
              <Badge variant="outline" className="text-xs">
                {premiumTournaments}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-accent/20 rounded-lg">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium">Torneios Gratuitos</span>
              </div>
              <Badge variant="outline" className="text-xs">
                {freeTournaments}
              </Badge>
            </div>

            <Separator />

            <div className="text-center p-3">
              <p className="text-xs text-muted-foreground">
                💡 Novos torneios são adicionados semanalmente
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 