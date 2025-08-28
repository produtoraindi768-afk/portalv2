import { Suspense } from 'react'
import { Metadata } from 'next'
import { firestoreHelpers } from '@/lib/firestore-helpers'
import { TournamentCard } from '@/components/tournaments/TournamentCard'
import { TournamentFilters } from '@/components/tournaments/TournamentFilters'
import { Skeleton } from '@/components/ui/skeleton'
import { GridSkeleton } from '@/components/ui/skeleton-patterns'
import { Separator } from '@/components/ui/separator'
import { PageLayout, ContentWrapper, Typography } from '@/components/layout'

export const metadata: Metadata = {
  title: 'Campeonatos | SZ - Fortnite Ballistic',
}

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
  avatar?: string
  tournamentUrl?: string
  // Campos específicos do Battlefy para determinar status correto
  lastCompletedMatchAt?: string
  battlefyStatus?: string
  battlefyState?: string
}

async function TournamentsContent() {
  // Função para mapear status do Firebase para os valores esperados
  function mapStatus(firebaseStatus: string): 'upcoming' | 'ongoing' | 'finished' {
    if (!firebaseStatus) return 'upcoming'
    
    const status = firebaseStatus.toLowerCase()
    
    if (status.includes('inscrições abertas') || status.includes('upcoming') || status.includes('próximo')) {
      return 'upcoming'
    } else if (status.includes('em andamento') || status.includes('ongoing') || status.includes('ativo')) {
      return 'ongoing'
    } else if (status.includes('finalizado') || status.includes('finished') || status.includes('concluído')) {
      return 'finished'
    }
    
    return 'upcoming'
  }

  // Função para converter timestamps do Firebase para strings ISO
  function convertFirebaseTimestamp(timestamp: any): string {
    if (!timestamp) return new Date().toISOString()
    
    // Se for um timestamp do Firebase (objeto com seconds)
    if (timestamp.seconds) {
      return new Date(timestamp.seconds * 1000).toISOString()
    }
    
    // Se for uma string de data válida
    if (typeof timestamp === 'string') {
      const date = new Date(timestamp)
      if (!isNaN(date.getTime())) {
        return date.toISOString()
      }
    }
    
    // Se for um objeto Date
    if (timestamp instanceof Date) {
      return timestamp.toISOString()
    }
    
    // Fallback para data atual
    return new Date().toISOString()
  }

  let tournaments: Tournament[] = []
  let firebaseError: string | null = null
  let isFirebaseConnected = false

  try {
    // Buscar dados de ambas as coleções
    const [battlefySnapshot, tournamentsSnapshot] = await Promise.all([
      firestoreHelpers.getBattlefyTournaments(),
      firestoreHelpers.getAllTournaments()
    ])

    let battlefyTournaments: Tournament[] = []
    let seedTournaments: Tournament[] = []

    // Processar dados do Battlefy
    if (battlefySnapshot && !battlefySnapshot.empty) {
      isFirebaseConnected = true
      battlefyTournaments = battlefySnapshot.docs.map(doc => {
        const data = doc.data()
        const rawData = data.rawData || {}

        // Função para extrair prêmios do HTML
        const extractPrizePool = (prizesHtml: string): number => {
          if (!prizesHtml) return 0
          // Procurar por valores em R$ no HTML
          const matches = prizesHtml.match(/R\$\s*([\d.,]+)/g)
          if (matches && matches.length > 0) {
            // Pegar o maior valor encontrado
            const values = matches.map(match => {
              const numStr = match.replace(/R\$\s*/, '').replace(/\./g, '').replace(',', '.')
              return parseFloat(numStr) || 0
            })
            return Math.max(...values)
          }
          return 0
        }

        // Função para determinar status baseado apenas no Battlefy (para casos específicos)
        const determineBattlefyStatus = (rawData?: any): 'complete' | null => {
          // Verificar apenas status/state do Battlefy para casos explicitamente finalizados
          if (rawData?.status === 'complete' || rawData?.state === 'complete') {
            return 'complete'
          }
          return null
        }

        // Mapear dados do Battlefy para a estrutura esperada
        const tournament: Tournament = {
          id: `battlefy_${doc.id}`,
          name: data.name || rawData.name || 'Sem nome',
          game: 'Fortnite',
          format: rawData.type === 'team' ? `Equipes (${rawData.playersPerTeam || 5} jogadores)` : 'Individual',
          description: rawData.about ? rawData.about.replace(/<[^>]*>/g, '').substring(0, 200) + '...' : 'Sem descrição',
          startDate: rawData.startTime || new Date().toISOString(),
          endDate: rawData.startTime ? new Date(new Date(rawData.startTime).getTime() + 24 * 60 * 60 * 1000).toISOString() : new Date().toISOString(),
          registrationDeadline: rawData.checkInStartTime || rawData.startTime || new Date().toISOString(),
          maxParticipants: rawData.teamCap || rawData.maxPlayers || 0,
          prizePool: extractPrizePool(rawData.prizes || ''),
          entryFee: 0, // Battlefy tournaments são geralmente gratuitos
          rules: rawData.rules?.complete || rawData.rules?.critical || 'Regras não especificadas',
          status: determineBattlefyStatus(rawData) === 'complete' ? 'finished' : 'upcoming', // Status será recalculado dinamicamente
          isActive: true,
          avatar: rawData.bannerUrl || undefined,
          tournamentUrl: `https://battlefy.com/tournament/${rawData.slug || data.battlefyId}`,
          // Campos específicos do Battlefy para determinar status correto
          lastCompletedMatchAt: rawData.lastCompletedMatchAt,
          battlefyStatus: rawData.status,
          battlefyState: rawData.state
        }

        return tournament
      })
    }

    // Processar dados da coleção tournaments (seed data)
    if (tournamentsSnapshot && !tournamentsSnapshot.empty) {
      isFirebaseConnected = true
      seedTournaments = tournamentsSnapshot.docs.map(doc => {
        const data = doc.data()
        
        // Converter timestamps do Firebase para strings ISO
        const convertTimestamp = (timestamp: any): string => {
          if (!timestamp) return new Date().toISOString()
          if (timestamp.toDate) {
            return timestamp.toDate().toISOString()
          }
          if (typeof timestamp === 'string') {
            return new Date(timestamp).toISOString()
          }
          return new Date().toISOString()
        }

        const mappedStatus = mapStatus(data.status || 'upcoming')
        
        const tournament: Tournament = {
          id: `seed_${doc.id}`,
          name: data.name || 'Sem nome',
          game: 'Fortnite',
          format: data.format || 'Formato não especificado',
          description: data.description || 'Sem descrição',
          startDate: convertTimestamp(data.startDate),
          endDate: convertTimestamp(data.endDate),
          registrationDeadline: convertTimestamp(data.registrationDeadline),
          maxParticipants: data.maxParticipants || data.maxTeams || 0,
          prizePool: data.prizePool || 0,
          entryFee: data.entryFee || 0,
          rules: data.rules || 'Regras não especificadas',
          status: mappedStatus,
          isActive: data.isActive !== false,
          avatar: data.avatar || data.bannerUrl || undefined,
          tournamentUrl: data.tournamentUrl || undefined
        }



        return tournament
      })
    }

    // Combinar ambos os arrays
    tournaments = [...battlefyTournaments, ...seedTournaments]

    // Ordenar por data de início (mais recente primeiro)
    tournaments.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())

    if (tournaments.length === 0 && isFirebaseConnected) {
      // Firebase conectado mas sem dados
      tournaments = []
    } else if (!isFirebaseConnected) {
      firebaseError = 'Firebase retornou null - verifique a configuração'
    }
  } catch (error) {
    firebaseError = error instanceof Error ? error.message : 'Erro desconhecido ao conectar com o banco de dados'
    isFirebaseConnected = false
  }

  // Se não há conexão com Firebase, usar dados de exemplo
  if (!isFirebaseConnected) {
    const mockTournaments: Tournament[] = [
      {
        id: "1",
        name: "CCT Season 3 South American Series",
        game: "CS2",
        format: "Online - Eliminação dupla",
        description: "Campeonato sul-americano de Counter-Strike 2",
        startDate: "2025-08-07T18:00:00.000Z",
        endDate: "2025-08-19T22:00:00.000Z",
        registrationDeadline: "2025-08-05T23:59:59.000Z",
        maxParticipants: 32,
        prizePool: 15000,
        entryFee: 0,
        rules: "Sem trapaças, seguir fair play.",
        status: "ongoing" as const,
        isActive: true,
        avatar: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=300&fit=crop",
        tournamentUrl: "https://www.hltv.org/events/1234/cct-season-3-south-american-series"
      },
      {
        id: "2",
        name: "Liga Gamers Club - Série A: Agosto",
        game: "League of Legends",
        format: "Online - Liga",
        description: "Liga mensal de League of Legends",
        startDate: "2025-08-08T19:00:00.000Z",
        endDate: "2025-08-29T23:00:00.000Z",
        registrationDeadline: "2025-08-06T23:59:59.000Z",
        maxParticipants: 16,
        prizePool: 8000,
        entryFee: 50,
        rules: "Times de 5 jogadores.",
        status: "ongoing" as const,
        isActive: true,
        avatar: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=300&fit=crop",
        tournamentUrl: "https://www.gamersclub.com.br/liga-serie-a"
      },
      {
        id: "3",
        name: "ESL Challenger League Season 5",
        game: "CS2",
        format: "Online - Liga",
        description: "Liga profissional de Counter-Strike 2",
        startDate: "2025-08-11T20:00:00.000Z",
        endDate: "2025-09-01T22:00:00.000Z",
        registrationDeadline: "2025-08-09T23:59:59.000Z",
        maxParticipants: 24,
        prizePool: 25000,
        entryFee: 0,
        rules: "Times profissionais.",
        status: "ongoing" as const,
        isActive: true,
        avatar: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=300&fit=crop",
        tournamentUrl: "https://www.eslgaming.com/challenger-league"
      },
      {
        id: "4",
        name: "StarLadder StarSeries Budapest 2025",
        game: "CS2",
        format: "LAN - Eliminação simples",
        description: "Torneio internacional em Budapeste",
        startDate: "2025-08-13T10:00:00.000Z",
        endDate: "2025-08-17T22:00:00.000Z",
        registrationDeadline: "2025-08-01T23:59:59.000Z",
        maxParticipants: 16,
        prizePool: 50000,
        entryFee: 200,
        rules: "Torneio presencial.",
        status: "ongoing" as const,
        isActive: true,
        avatar: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=300&fit=crop",
        tournamentUrl: "https://starladder.com/starseries-budapest-2025"
      },
      {
        id: "5",
        name: "Circuito FERJEE de Esports 2025",
        game: "Valorant",
        format: "LAN - Eliminação dupla",
        description: "Circuito estadual de Valorant",
        startDate: "2025-08-13T14:00:00.000Z",
        endDate: "2025-08-15T22:00:00.000Z",
        registrationDeadline: "2025-08-10T23:59:59.000Z",
        maxParticipants: 32,
        prizePool: 12000,
        entryFee: 30,
        rules: "Torneio presencial no Rio.",
        status: "ongoing" as const,
        isActive: true,
        avatar: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=300&fit=crop",
        tournamentUrl: "https://ferjee.com.br/circuito-esports-2025"
      },
      {
        id: "6",
        name: "BLAST Bounty Fall 2025",
        game: "CS2",
        format: "LAN - Eliminação simples",
        description: "Torneio internacional BLAST",
        startDate: "2025-08-14T12:00:00.000Z",
        endDate: "2025-08-17T22:00:00.000Z",
        registrationDeadline: "2025-08-01T23:59:59.000Z",
        maxParticipants: 8,
        prizePool: 100000,
        entryFee: 0,
        rules: "Torneio convite.",
        status: "ongoing" as const,
        isActive: true,
        avatar: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=300&fit=crop",
        tournamentUrl: "https://blast.tv/bounty-fall-2025"
      },
      {
        id: "7",
        name: "ESL Impact League Season 8",
        game: "CS2",
        format: "Online - Liga",
        description: "Liga feminina de Counter-Strike 2",
        startDate: "2025-08-15T19:00:00.000Z",
        endDate: "2025-08-17T22:00:00.000Z",
        registrationDeadline: "2025-08-13T23:59:59.000Z",
        maxParticipants: 16,
        prizePool: 15000,
        entryFee: 0,
        rules: "Liga exclusiva para jogadoras.",
        status: "upcoming" as const,
        isActive: true,
        avatar: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=300&fit=crop",
        tournamentUrl: "https://www.eslgaming.com/impact-league"
      },
      {
        id: "8",
        name: "Ballistic Open Championship",
        game: "Fortnite: Ballistic",
        format: "Online - Battle Royale",
        description: "Campeonato aberto de Ballistic",
        startDate: "2025-08-20T18:00:00.000Z",
        endDate: "2025-08-21T22:00:00.000Z",
        registrationDeadline: "2025-08-18T23:59:59.000Z",
        maxParticipants: 100,
        prizePool: 5000,
        entryFee: 0,
        rules: "Torneio aberto.",
        status: "upcoming" as const,
        isActive: true,
        avatar: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=300&fit=crop",
        tournamentUrl: "https://ballistic.epicgames.com/championship"
      }
    ]

    tournaments = mockTournaments
  }

  // Função para calcular status real baseado nas datas e dados do Battlefy
  const calculateRealStatus = (tournament: Tournament): 'upcoming' | 'ongoing' | 'finished' => {
    const now = new Date().getTime()
    const start = new Date(tournament.startDate).getTime()
    const end = new Date(tournament.endDate).getTime()
    
    // Para torneios do Battlefy, verificar se foi explicitamente finalizado
    if (tournament.id.startsWith('battlefy_')) {
      // Se tem lastCompletedMatchAt, o torneio foi finalizado
      if (tournament.lastCompletedMatchAt) {
        return 'finished'
      }
      
      // Se o status/state do Battlefy é 'complete', foi finalizado
      if (tournament.battlefyStatus === 'complete' || tournament.battlefyState === 'complete') {
        return 'finished'
      }
      
      // Se passou mais de 7 dias desde o início, considerar finalizado
      if (tournament.startDate) {
        const daysSinceStart = (now - start) / (1000 * 60 * 60 * 24)
        if (daysSinceStart > 7) {
          return 'finished'
        }
      }
    }
    
    // Lógica padrão baseada em datas
    if (now < start) {
      return 'upcoming' // Torneio ainda não começou
    } else if (now >= start && now <= end) {
      return 'ongoing' // Torneio em andamento
    } else {
      return 'finished' // Torneio já terminou
    }
  }

  // Mapear torneios com status calculado dinamicamente
  const tournamentsWithRealStatus = tournaments.map(tournament => ({
    ...tournament,
    status: calculateRealStatus(tournament)
  }))

  // Separar torneios por status real (calculado dinamicamente)
  const ongoingTournaments = tournamentsWithRealStatus.filter(t => t.status === 'ongoing')
  const upcomingTournaments = tournamentsWithRealStatus.filter(t => t.status === 'upcoming')
  const finishedTournaments = tournamentsWithRealStatus.filter(t => t.status === 'finished')



  // Estatísticas para exibição
  const totalTournaments = tournamentsWithRealStatus.length
  const freeTournaments = tournamentsWithRealStatus.filter(t => t.entryFee === 0).length
  const totalPrizePool = tournamentsWithRealStatus.reduce((sum, t) => sum + t.prizePool, 0)

  return (
    <PageLayout 
      pattern="wide" 
      title="Campeonatos"
      description="Confira todos os campeonatos e torneios disponíveis"
    >
      <ContentWrapper layout="stack" gap="spacious">

        {/* Filtros */}
        <TournamentFilters />

        {/* Separador após filtros */}
        {(ongoingTournaments.length > 0 || upcomingTournaments.length > 0 || finishedTournaments.length > 0) && (
          <Separator className="bg-border/50 my-6" />
        )}

        {/* Torneios em Andamento */}
        {ongoingTournaments.length > 0 && (
          <>
            <section>
              <Typography variant="h2" className="mb-8 text-destructive">
                EM ANDAMENTO
              </Typography>
              <ContentWrapper layout="grid-4" gap="normal">
                {ongoingTournaments.map((tournament) => (
                  <TournamentCard key={tournament.id} tournament={tournament} />
                ))}
              </ContentWrapper>
            </section>
            
            {/* Separador após torneios em andamento */}
            {(upcomingTournaments.length > 0 || finishedTournaments.length > 0) && (
              <Separator className="bg-border/40 my-8" />
            )}
          </>
        )}

        {/* Próximos Torneios */}
        {upcomingTournaments.length > 0 && (
          <>
            <section>
              <Typography variant="h2" className="mb-8 text-primary">
                PRÓXIMOS TORNEIOS
              </Typography>
              <ContentWrapper layout="grid-4" gap="normal">
                {upcomingTournaments.map((tournament) => (
                  <TournamentCard key={tournament.id} tournament={tournament} />
                ))}
              </ContentWrapper>
            </section>
            
            {/* Separador após próximos torneios */}
            {finishedTournaments.length > 0 && (
              <Separator className="bg-border/40 my-8" />
            )}
          </>
        )}

        {/* Torneios Finalizados */}
        {finishedTournaments.length > 0 && (
          <section>
            <Typography variant="h2" className="mb-8 text-muted-foreground">
              TORNEIOS FINALIZADOS
            </Typography>
            <ContentWrapper layout="grid-4" gap="normal">
              {finishedTournaments.map((tournament) => (
                <TournamentCard key={tournament.id} tournament={tournament} />
              ))}
            </ContentWrapper>
          </section>
        )}

        {/* Mensagem quando não há torneios */}
        {tournaments.length === 0 && (
          <div className="text-center py-16">
            <Typography variant="h2" className="text-muted-foreground mb-4">
              Nenhum torneio encontrado
            </Typography>
            <Typography variant="muted">
              {isFirebaseConnected 
                ? "Não há torneios disponíveis no banco de dados. Adicione torneios através do Firebase Console."
                : "Não há torneios disponíveis no momento. Volte em breve!"
              }
            </Typography>
          </div>
        )}
      </ContentWrapper>
    </PageLayout>
  )
}

export default function TournamentsPage() {
  return (
    <Suspense fallback={
      <PageLayout 
        pattern="wide" 
        title="Campeonatos"
        description="Confira todos os campeonatos e torneios disponíveis"
      >
        <ContentWrapper layout="grid-4" gap="normal">
          <GridSkeleton items={8} />
        </ContentWrapper>
      </PageLayout>
    }>
      <TournamentsContent />
    </Suspense>
  )
}
