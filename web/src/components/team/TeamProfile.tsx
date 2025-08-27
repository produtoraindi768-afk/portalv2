'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { firestoreHelpers } from '@/lib/firestore-helpers'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { CalendarDays, MapPin, Trophy, Users, ExternalLink, Crown, Shield, Mail } from 'lucide-react'
import { PageLayout, ContentWrapper, Typography } from '@/components/layout'

interface Team {
  id: string
  name: string
  tag: string
  game: string
  region: string
  description: string
  members: string[]
  captain: string
  contactEmail: string
  discordServer: string
  avatar: string
  isActive: boolean
  foundedDate?: string
  achievements?: string[]
}

interface TeamStats {
  totalMatches: number
  wins: number
  losses: number
  winRate: number
  averagePlacement: number
  totalPrizeWon: number
  currentRank: number
}

interface TeamMember {
  id: string
  username: string
  displayName: string
  role: 'Captain' | 'Member'
  position: string
  joinDate: string
  isActive: boolean
  avatar?: string
}

interface TeamMatch {
  id: string
  tournamentName: string
  date: string
  opponent: string
  result: 'win' | 'loss' | 'draw'
  score: string
  placement: number
}

interface TeamProfileProps {
  teamTag?: string
}

export function TeamProfile({ teamTag: propTeamTag }: TeamProfileProps = {}) {
  const params = useParams()
  const teamTag = propTeamTag || (params?.teamTag as string) || 'ALPHA'

  const [team, setTeam] = useState<Team | null>(null)
  const [stats, setStats] = useState<TeamStats | null>(null)
  const [matches, setMatches] = useState<TeamMatch[]>([])
  const [members, setMembers] = useState<TeamMember[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    loadTeamData()
  }, [teamTag])

  const loadTeamData = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Buscar dados da equipe
      const teamResult = await firestoreHelpers.getTeamByTag(teamTag)
      
      if (!teamResult || teamResult.docs.length === 0) {
        setError('Equipe não encontrada')
        return
      }

      const teamDoc = teamResult.docs[0]
      const teamData = {
        id: teamDoc.id,
        ...teamDoc.data()
      } as Team
      setTeam(teamData)

      // Buscar estatísticas
      const statsResult = await firestoreHelpers.getTeamStats(teamData.id)
      if (statsResult) {
        setStats(statsResult)
      }

      // Buscar partidas
      const matchesResult = await firestoreHelpers.getTeamMatches(teamData.id)
      if (matchesResult) {
        const matchesData = matchesResult.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as TeamMatch[]
        setMatches(matchesData)
      }

      // Buscar membros
      const membersResult = await firestoreHelpers.getTeamMembers(teamData.id)
      if (membersResult) {
        const membersData = membersResult.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as TeamMember[]
        setMembers(membersData)
      }

    } catch (err) {
      console.error('Error loading team data:', err)
      setError('Erro ao carregar dados da equipe')
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount)
  }

  if (isLoading) {
    return (
      <PageLayout pattern="default">
        <div className="text-center py-12">
          <Typography variant="body-lg">Carregando equipe...</Typography>
        </div>
      </PageLayout>
    )
  }

  if (error || !team) {
    return (
      <PageLayout pattern="default">
        <Card>
          <CardHeader>
            <CardTitle>Equipe não encontrada</CardTitle>
            <CardDescription>
              A equipe solicitada não existe ou foi removida.
            </CardDescription>
          </CardHeader>
        </Card>
      </PageLayout>
    )
  }

  return (
    <PageLayout pattern="default" showHeader={false}>
      <ContentWrapper layout="stack" gap="loose">
        {/* Team Banner - Blookie Style */}
        <div className="relative">
          <div className="bg-gradient-to-r from-primary/20 via-primary/10 to-transparent rounded-xl p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
              {/* Team Logo */}
              <Avatar className="h-32 w-32 md:h-40 md:w-40 border-4 border-background shadow-lg">
                <AvatarImage src={team.avatar} alt={team.name} />
                <AvatarFallback className="text-4xl font-bold">
                  {team.tag.substring(0, 2)}
                </AvatarFallback>
              </Avatar>

              {/* Team Info */}
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                  <Typography variant="h1" className="text-4xl font-bold">{team.name}</Typography>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="text-lg px-3 py-1">
                    {team.tag}
                  </Badge>
                  <Badge variant={team.isActive ? 'default' : 'secondary'} className="flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    {team.isActive ? 'Ativo' : 'Inativo'}
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {team.region}
                  </Badge>
                </div>
              </div>

              {team.description && (
                <p className="text-xl text-muted-foreground mb-6">{team.description}</p>
              )}

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold">{stats?.totalMatches || 0}</div>
                  <div className="text-sm text-muted-foreground">Partidas</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{stats?.wins || 0}</div>
                  <div className="text-sm text-muted-foreground">Vitórias</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{stats?.winRate || 0}%</div>
                  <div className="text-sm text-muted-foreground">Taxa de Vitória</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">#{stats?.currentRank || 0}</div>
                  <div className="text-sm text-muted-foreground">Ranking</div>
                </div>
              </div>

              {/* Contact Links */}
              <div className="flex items-center gap-4 mb-4">
                {team.discordServer && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={team.discordServer} target="_blank" rel="noopener noreferrer" aria-label="Discord">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Discord
                    </a>
                  </Button>
                )}
                {team.contactEmail && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={`mailto:${team.contactEmail}`} aria-label="Email">
                      <Mail className="h-4 w-4 mr-2" />
                      Email
                    </a>
                  </Button>
                )}
              </div>

              {team.foundedDate && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CalendarDays className="h-4 w-4" />
                  Fundada em {formatDate(team.foundedDate)}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="members">Membros</TabsTrigger>
          <TabsTrigger value="matches">Partidas</TabsTrigger>
          <TabsTrigger value="statistics">Estatísticas</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Partidas</CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalMatches || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taxa de Vitória</CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.winRate || 0}%</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Posição Média</CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.averagePlacement || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Prêmios Conquistados</CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats?.totalPrizeWon || 0)}</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Achievements */}
            <Card>
              <CardHeader>
                <CardTitle>Estatísticas da Equipe</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {team.achievements && team.achievements.length > 0 ? (
                  team.achievements.map((achievement, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                      <Trophy className="h-5 w-5 text-yellow-500" />
                      <span className="font-medium">{achievement}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-4">Nenhuma conquista registrada</p>
                )}
              </CardContent>
            </Card>

            {/* Recent Matches */}
            <Card>
              <CardHeader>
                <CardTitle>Partidas Recentes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {matches.slice(0, 3).map((match, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{match.tournamentName}</div>
                      <div className="text-sm text-muted-foreground">vs {match.opponent} • {match.score}</div>
                    </div>
                    <Badge variant={match.result === 'win' ? 'default' : 'secondary'}>
                      {match.result === 'win' ? 'Vitória' : 'Derrota'}
                    </Badge>
                  </div>
                ))}
                {matches.length === 0 && (
                  <p className="text-muted-foreground text-center py-4">Nenhuma partida registrada</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Members Tab - Table Implementation */}
        <TabsContent value="members" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Lista de Membros
              </CardTitle>
              <CardDescription>
                {members.length} membro{members.length !== 1 ? 's' : ''} na equipe
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Jogador</TableHead>
                    <TableHead>Função</TableHead>
                    <TableHead>Posição</TableHead>
                    <TableHead>Desde</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={member.avatar} alt={member.displayName} />
                            <AvatarFallback>{member.displayName.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{member.displayName}</div>
                            <div className="text-sm text-muted-foreground">@{member.username}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={member.role === 'Captain' ? 'default' : 'outline'}
                          className={member.role === 'Captain' ? 'captain-badge flex items-center gap-1' : 'flex items-center gap-1'}
                        >
                          {member.role === 'Captain' && <Crown className="h-3 w-3" />}
                          {member.role === 'Captain' ? 'Capitão' : 'Membro'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{member.position}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(member.joinDate)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {members.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum membro encontrado
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Matches Tab */}
        <TabsContent value="matches" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Partidas</CardTitle>
              <CardDescription>Todas as partidas registradas da equipe</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Torneio</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Oponente</TableHead>
                    <TableHead>Placar</TableHead>
                    <TableHead>Resultado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {matches.map((match) => (
                    <TableRow key={match.id}>
                      <TableCell className="font-medium">{match.tournamentName}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(match.date).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>{match.opponent}</TableCell>
                      <TableCell className="font-medium">{match.score}</TableCell>
                      <TableCell>
                        <Badge variant={match.result === 'win' ? 'default' : 'secondary'}>
                          {match.result === 'win' ? 'Vitória' : match.result === 'loss' ? 'Derrota' : 'Empate'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {matches.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhuma partida encontrada
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Statistics Tab */}
        <TabsContent value="statistics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Desempenho Detalhado</CardTitle>
              <CardDescription>Performance da Equipe</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2">
                  <div className="text-sm font-medium">Total de Partidas</div>
                  <div className="text-3xl font-bold">{stats?.totalMatches || 0}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium">Vitórias</div>
                  <div className="text-3xl font-bold">{stats?.wins || 0}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium">Derrotas</div>
                  <div className="text-3xl font-bold">{stats?.losses || 0}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium">Taxa de Vitória</div>
                  <div className="text-3xl font-bold">{stats?.winRate || 0}%</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium">Posição Média</div>
                  <div className="text-3xl font-bold">{stats?.averagePlacement || 0}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium">Ranking Atual</div>
                  <div className="text-3xl font-bold">#{stats?.currentRank || 0}</div>
                </div>
              </div>
              
              <div className="pt-6">
                <div className="text-lg font-medium mb-4">Gráfico de Performance</div>
                <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
                  <p className="text-muted-foreground">Evolução ao Longo do Tempo</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </ContentWrapper>
    </PageLayout>
  )
}