import { Suspense } from 'react'
import { Metadata } from 'next'
import { firestoreHelpers } from '@/lib/firestore-helpers'
import { TournamentCard } from '@/components/tournaments/TournamentCard'
import { TournamentFilters } from '@/components/tournaments/TournamentFilters'
import { Skeleton } from '@/components/ui/skeleton'

export const metadata: Metadata = {
  title: 'Campeonatos - ProjetoSIA',
  description: 'Confira todos os campeonatos e torneios disponíveis. Participe das competições mais emocionantes.',
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

        // Função para determinar status baseado nas datas
        const determineStatus = (startTime: string, lastCompletedMatchAt?: string): 'upcoming' | 'ongoing' | 'finished' => {
          if (!startTime) return 'upcoming'
          
          const startDate = new Date(startTime)
          const now = new Date()
          
          if (lastCompletedMatchAt) {
            return 'finished'
          }
          
          if (now < startDate) {
            return 'upcoming'
          } else {
            return 'ongoing'
          }
        }

        // Mapear dados do Battlefy para a estrutura esperada
        const tournament: Tournament = {
          id: `battlefy_${doc.id}`,
          name: data.name || rawData.name || 'Sem nome',
          game: data.game || rawData.gameName || 'Jogo não especificado',
          format: rawData.type === 'team' ? `Equipes (${rawData.playersPerTeam || 5} jogadores)` : 'Individual',
          description: rawData.about ? rawData.about.replace(/<[^>]*>/g, '').substring(0, 200) + '...' : 'Sem descrição',
          startDate: rawData.startTime || new Date().toISOString(),
          endDate: rawData.startTime ? new Date(new Date(rawData.startTime).getTime() + 24 * 60 * 60 * 1000).toISOString() : new Date().toISOString(),
          registrationDeadline: rawData.checkInStartTime || rawData.startTime || new Date().toISOString(),
          maxParticipants: rawData.teamCap || rawData.maxPlayers || 0,
          prizePool: extractPrizePool(rawData.prizes || ''),
          entryFee: 0, // Battlefy tournaments são geralmente gratuitos
          rules: rawData.rules?.complete || rawData.rules?.critical || 'Regras não especificadas',
          status: determineStatus(rawData.startTime, rawData.lastCompletedMatchAt),
          isActive: true,
          avatar: rawData.bannerUrl || undefined,
          tournamentUrl: `https://battlefy.com/tournament/${rawData.slug || data.battlefyId}`
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
          game: data.game || 'Jogo não especificado',
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

  // Se não há dados do Firebase, usar dados de exemplo
  if (!isFirebaseConnected || tournaments.length === 0) {
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

  // Separar torneios por status
  const ongoingTournaments = tournaments.filter(t => t.status === 'ongoing')
  const upcomingTournaments = tournaments.filter(t => t.status === 'upcoming')
  const finishedTournaments = tournaments.filter(t => t.status === 'finished')



  // Estatísticas para exibição
  const totalTournaments = tournaments.length
  const freeTournaments = tournaments.filter(t => t.entryFee === 0).length
  const totalPrizePool = tournaments.reduce((sum, t) => sum + t.prizePool, 0)

  return (
    <div className="pt-24 pb-8 lg:pt-32 lg:pb-16">
      <div className="mx-auto w-full max-w-2xl px-6 lg:max-w-7xl">
        {/* Header */}
        <div className="mb-12">
          <div className="text-center lg:text-left">
            <h1 className="text-3xl/tight font-bold tracking-tight text-balance sm:text-4xl/tight lg:text-5xl/tight text-foreground">
              Campeonatos
            </h1>
            <p className="text-muted-foreground mt-4 text-base/7 text-balance sm:text-lg/8">
              Confira todos os campeonatos e torneios disponíveis
            </p>
          </div>
        </div>

        {/* Filtros */}
        <TournamentFilters />

        {/* Torneios em Andamento */}
        {ongoingTournaments.length > 0 && (
          <section className="mb-16">
            <div className="mb-8">
              <h2 className="text-2xl/tight font-bold tracking-tight text-balance sm:text-3xl/tight text-destructive">
                EM ANDAMENTO
              </h2>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {ongoingTournaments.map((tournament) => (
                <TournamentCard key={tournament.id} tournament={tournament} />
              ))}
            </div>
          </section>
        )}

        {/* Próximos Torneios */}
        {upcomingTournaments.length > 0 && (
          <section className="mb-16">
            <div className="mb-8">
              <h2 className="text-2xl/tight font-bold tracking-tight text-balance sm:text-3xl/tight text-primary">
                PRÓXIMOS TORNEIOS
              </h2>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {upcomingTournaments.map((tournament) => (
                <TournamentCard key={tournament.id} tournament={tournament} />
              ))}
            </div>
          </section>
        )}

        {/* Torneios Finalizados */}
        {finishedTournaments.length > 0 && (
          <section className="mb-16">
            <div className="mb-8">
              <h2 className="text-2xl/tight font-bold tracking-tight text-balance sm:text-3xl/tight text-muted-foreground">
                TORNEIOS FINALIZADOS
              </h2>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {finishedTournaments.map((tournament) => (
                <TournamentCard key={tournament.id} tournament={tournament} />
              ))}
            </div>
          </section>
        )}

        {/* Mensagem quando não há torneios */}
        {tournaments.length === 0 && (
          <div className="text-center py-16">
            <h2 className="text-2xl/tight font-bold tracking-tight text-balance sm:text-3xl/tight text-muted-foreground mb-4">
              Nenhum torneio encontrado
            </h2>
            <p className="text-muted-foreground text-base/7">
              {isFirebaseConnected 
                ? "Não há torneios disponíveis no banco de dados. Adicione torneios através do Firebase Console."
                : "Não há torneios disponíveis no momento. Volte em breve!"
              }
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function TournamentsPage() {
  return (
    <Suspense fallback={
      <div className="pt-24 pb-8 lg:pt-32 lg:pb-16">
        <div className="mx-auto w-full max-w-2xl px-6 lg:max-w-7xl">
          <div className="mb-12">
            <Skeleton className="h-12 w-64 mb-4 bg-muted" />
            <Skeleton className="h-6 w-96 bg-muted" />
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-80 w-full rounded-xl bg-muted" />
            ))}
          </div>
        </div>
      </div>
    }>
      <TournamentsContent />
    </Suspense>
  )
}
