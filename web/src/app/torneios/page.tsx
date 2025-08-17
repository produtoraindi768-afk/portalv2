import { Suspense } from 'react'
import { Metadata } from 'next'
import { firestoreHelpers } from '@/lib/firestore-helpers'
import { TournamentCard } from '@/components/tournaments/TournamentCard'
import { TournamentFilters } from '@/components/tournaments/TournamentFilters'
import { TournamentStats } from '@/components/tournaments/TournamentStats'
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
}

async function TournamentsContent() {
  const tournamentsSnapshot = await firestoreHelpers.getAllTournaments()
  
  // Dados de exemplo para demonstração
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
      isActive: true
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
      isActive: true
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
      isActive: true
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
      isActive: true
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
      isActive: true
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
      isActive: true
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
      isActive: true
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
      isActive: true
    }
  ]

  // Usar dados do Firebase se disponíveis, senão usar dados mock
  const tournaments: Tournament[] = tournamentsSnapshot 
    ? tournamentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Tournament))
    : mockTournaments

  // Separar torneios por status
  const ongoingTournaments = tournaments.filter(t => t.status === 'ongoing')
  const upcomingTournaments = tournaments.filter(t => t.status === 'upcoming')
  const finishedTournaments = tournaments.filter(t => t.status === 'finished')

  return (
    <div className="pt-24 pb-8 lg:pt-32 lg:pb-16">
      <div className="mx-auto w-full max-w-2xl px-6 lg:max-w-7xl">
        {/* Header */}
        <div className="mb-12">
          <div className="text-center lg:text-left">
            <h1 className="text-3xl/tight font-bold tracking-tight text-balance sm:text-4xl/tight lg:text-5xl/tight">
              Campeonatos
            </h1>
            <p className="text-muted-foreground mt-4 text-base/7 text-balance sm:text-lg/8">
              Confira todos os campeonatos e torneios disponíveis
            </p>
            {!tournamentsSnapshot && (
              <div className="mt-6 p-4 bg-accent/50 border border-accent rounded-xl">
                <p className="text-accent-foreground text-sm">
                  💡 <strong>Modo Demonstração:</strong> Exibindo dados de exemplo. 
                  Para dados reais, configure o Firebase corretamente.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Estatísticas dos Torneios */}
        <TournamentStats tournaments={tournaments} />

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
              Não há torneios disponíveis no momento. Volte em breve!
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
            <Skeleton className="h-12 w-64 mb-4" />
            <Skeleton className="h-6 w-96" />
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-80 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    }>
      <TournamentsContent />
    </Suspense>
  )
}
