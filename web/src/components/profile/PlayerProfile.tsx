'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { firestoreHelpers, type PlayerData, type PlayerStats } from '@/lib/firestore-helpers'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { CalendarDays, MapPin, Shield, Trophy, Target, TrendingUp, Users, ExternalLink } from 'lucide-react'
import { PageLayout, ContentWrapper, Typography } from '@/components/layout'

interface PlayerProfileProps {
  username?: string
}

export function PlayerProfile({ username: propUsername }: PlayerProfileProps = {}) {
  const params = useParams()
  const username = propUsername || (params?.username as string) || 'test-player'

  const [player, setPlayer] = useState<PlayerData | null>(null)
  const [stats, setStats] = useState<PlayerStats | null>(null)
  const [matches, setMatches] = useState<any[]>([])
  const [teams, setTeams] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    loadPlayerData()
  }, [username])

  const loadPlayerData = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Buscar dados do jogador
      const playerResult = await firestoreHelpers.getPlayerByUsername(username)
      
      if (!playerResult || !playerResult.exists) {
        setError('Jogador não encontrado')
        return
      }

      const playerData = playerResult.data!()
      setPlayer(playerData)

      // Buscar estatísticas
      const statsResult = await firestoreHelpers.getPlayerStats(username)
      if (statsResult) {
        setStats(statsResult)
      }

      // Buscar partidas
      const matchesResult = await firestoreHelpers.getPlayerMatches(username)
      if (matchesResult) {
        const matchesData = matchesResult.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        setMatches(matchesData)
      }

      // Buscar equipes
      const teamsResult = await firestoreHelpers.getPlayerTeams(username)
      if (teamsResult) {
        const teamsData = teamsResult.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        setTeams(teamsData)
      }

    } catch (err) {
      console.error('Error loading player data:', err)
      setError('Erro ao carregar dados do jogador')
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('pt-BR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date)
  }

  if (isLoading) {
    return (
      <PageLayout pattern="default" showHeader={false}>
        <ContentWrapper layout="stack" gap="loose">
          {/* Profile Header Skeleton */}
          <div className="relative">
            <div className="bg-gradient-to-r from-primary/20 via-primary/10 to-transparent rounded-xl p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                {/* Avatar Skeleton */}
                <Skeleton className="h-24 w-24 md:h-32 md:w-32 rounded-full border-4 border-background" />
                
                {/* Profile Info Skeleton */}
                <div className="flex-1 space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center gap-3">
                    <Skeleton className="h-8 w-48" />
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-6 w-24" />
                      <Skeleton className="h-6 w-16" />
                    </div>
                  </div>
                  
                  <Skeleton className="h-5 w-96 max-w-full" />
                  
                  {/* Social Links Skeleton */}
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-24" />
                    <Skeleton className="h-8 w-20" />
                  </div>
                  
                  <Skeleton className="h-4 w-40" />
                </div>
              </div>
            </div>
          </div>
          
          {/* Navigation Tabs Skeleton */}
          <div className="space-y-6">
            <div className="grid w-full grid-cols-4 gap-2">
              <Skeleton className="h-10 rounded-md" />
              <Skeleton className="h-10 rounded-md" />
              <Skeleton className="h-10 rounded-md" />
              <Skeleton className="h-10 rounded-md" />
            </div>
            
            {/* Tab Content Skeleton */}
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Card key={i}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-8 w-16" />
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {/* Content Cards */}
              <div className="grid gap-6 md:grid-cols-2">
                {Array.from({ length: 2 }).map((_, i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-6 w-32" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {Array.from({ length: 3 }).map((_, j) => (
                        <div key={j} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-24" />
                          </div>
                          <Skeleton className="h-6 w-16" />
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </ContentWrapper>
      </PageLayout>
    )
  }

  if (error || !player) {
    return (
      <PageLayout pattern="default">
        <Card>
          <CardHeader>
            <CardTitle>Jogador não encontrado</CardTitle>
            <CardDescription>
              O perfil solicitado não existe ou foi removido.
            </CardDescription>
          </CardHeader>
        </Card>
      </PageLayout>
    )
  }

  return (
    <PageLayout pattern="default" showHeader={false}>
      <ContentWrapper layout="stack" gap="loose">
        {/* Profile Header - Blookie Style */}
        <div className="relative">
          <div className="bg-gradient-to-r from-primary/20 via-primary/10 to-transparent rounded-xl p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Avatar */}
            <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-background shadow-lg">
              <AvatarImage src={player.avatar} alt={player.displayName} />
              <AvatarFallback className="text-2xl font-bold">
                {player.displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
                <Typography variant="h1" className="text-2xl font-bold">{player.displayName}</Typography>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">@{player.username}</span>
                  {player.isVerified && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      Verificado
                    </Badge>
                  )}
                  <Badge variant="outline" className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {player.country}
                  </Badge>
                </div>
              </div>

              {player.bio && (
                <Typography variant="body-lg" className="text-muted-foreground mb-4">{player.bio}</Typography>
              )}

              {/* Social Links */}
              <div className="flex items-center gap-3 mb-4">
                {player.socialLinks.twitch && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={player.socialLinks.twitch} target="_blank" rel="noopener noreferrer" aria-label="Twitch">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Twitch
                    </a>
                  </Button>
                )}
                {player.socialLinks.youtube && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={player.socialLinks.youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      YouTube
                    </a>
                  </Button>
                )}
                {player.socialLinks.twitter && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={player.socialLinks.twitter} target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Twitter
                    </a>
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CalendarDays className="h-4 w-4" />
                Membro desde {formatDate(player.joinDate)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="statistics">Estatísticas</TabsTrigger>
          <TabsTrigger value="matches">Partidas</TabsTrigger>
          <TabsTrigger value="teams">Equipes</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Partidas</CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalMatches || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Vitórias</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.wins || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taxa de Vitória</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.winRate || 0}%</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">K/D Ratio</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.killDeathRatio || 0}</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Recent Matches */}
            <Card>
              <CardHeader>
                <CardTitle>Estatísticas Gerais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {matches.slice(0, 3).map((match, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{match.tournamentName}</div>
                      <div className="text-sm text-muted-foreground">#{match.placement} • {match.kills} eliminações</div>
                    </div>
                    <Badge variant={match.result === 'win' ? 'default' : 'secondary'}>
                      {match.result === 'win' ? 'Vitória' : 'Derrota'}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Current Team */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Equipe Atual
                </CardTitle>
              </CardHeader>
              <CardContent>
                {teams.filter(team => team.isActive).map((team, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{team.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {team.tag} • {team.role}
                      </div>
                    </div>
                    <Badge>{team.role}</Badge>
                  </div>
                ))}
                {teams.filter(team => team.isActive).length === 0 && (
                  <p className="text-muted-foreground text-center py-4">Não faz parte de nenhuma equipe</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Statistics Tab */}
        <TabsContent value="statistics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Desempenho Detalhado</CardTitle>
              <CardDescription>Estatísticas completas do jogador</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2">
                  <div className="text-sm font-medium">Total de Partidas</div>
                  <div className="text-2xl font-bold">{stats?.totalMatches || 0}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium">Taxa de Vitória</div>
                  <div className="text-2xl font-bold">{stats?.winRate || 0}%</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium">K/D Ratio</div>
                  <div className="text-2xl font-bold">{stats?.killDeathRatio || 0}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium">Posição Média</div>
                  <div className="text-2xl font-bold">{stats?.averagePlacement || 0}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium">Total de Eliminações</div>
                  <div className="text-2xl font-bold">{stats?.totalKills || 0}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium">Total de Mortes</div>
                  <div className="text-2xl font-bold">{stats?.totalDeaths || 0}</div>
                </div>
              </div>
              
              <div className="pt-4">
                <div className="text-lg font-medium mb-4">Gráfico de Performance</div>
                <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
                  <p className="text-muted-foreground">Gráfico de performance seria renderizado aqui</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Matches Tab */}
        <TabsContent value="matches" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Partidas</CardTitle>
              <CardDescription>Todas as partidas recentes do jogador</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-6">
                <Input
                  placeholder="Filtrar por torneio..."
                  className="max-w-sm"
                />
                <Select defaultValue="all">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filtrar por resultado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="win">Vitórias</SelectItem>
                    <SelectItem value="loss">Derrotas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-5 gap-4 font-medium text-sm text-muted-foreground pb-2 border-b">
                  <div>Torneio</div>
                  <div>Data</div>
                  <div>Posição</div>
                  <div>Eliminações</div>
                  <div>Resultado</div>
                </div>
                
                {matches.map((match, index) => (
                  <div key={index} className="grid grid-cols-5 gap-4 items-center py-3 border-b last:border-0">
                    <div className="font-medium">{match.tournamentName}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(match.date).toLocaleDateString('pt-BR')}
                    </div>
                    <div className="font-medium">#{match.placement}</div>
                    <div>{match.kills}</div>
                    <Badge variant={match.result === 'win' ? 'default' : 'secondary'}>
                      {match.result === 'win' ? 'Vitória' : 'Derrota'}
                    </Badge>
                  </div>
                ))}

                {matches.length === 0 && (
                  <p className="text-muted-foreground text-center py-8">Nenhuma partida encontrada</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Teams Tab */}
        <TabsContent value="teams" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Current Team */}
            <Card>
              <CardHeader>
                <CardTitle>Equipe Atual</CardTitle>
              </CardHeader>
              <CardContent>
                {teams.filter(team => team.isActive).map((team, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="font-medium text-lg">{team.name}</div>
                        <div className="text-muted-foreground">{team.tag}</div>
                      </div>
                      <Badge>{team.role}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Entrou em {formatDate(team.joinDate)}
                    </div>
                  </div>
                ))}
                {teams.filter(team => team.isActive).length === 0 && (
                  <p className="text-muted-foreground text-center py-8">Não faz parte de nenhuma equipe</p>
                )}
              </CardContent>
            </Card>

            {/* Team History */}
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Equipes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {teams.filter(team => !team.isActive).map((team, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{team.name}</div>
                        <div className="text-sm text-muted-foreground">{team.tag} • {team.role}</div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatDate(team.joinDate)} - {team.leaveDate ? formatDate(team.leaveDate) : 'Atual'}
                      </div>
                    </div>
                  </div>
                ))}
                {teams.filter(team => !team.isActive).length === 0 && (
                  <p className="text-muted-foreground text-center py-4">Nenhum histórico de equipes</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      </ContentWrapper>
    </PageLayout>
  )
}