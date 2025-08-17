import { config } from 'dotenv'
import { resolve } from 'path'
import { firestoreHelpers } from '../lib/firestore-helpers'

// Carregar variáveis de ambiente do arquivo .env.local
config({ path: resolve(process.cwd(), '.env.local') })

const sampleTournaments = [
  {
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
    rules: "Sem trapaças, seguir fair play. Jogadores devem ter pelo menos 16 anos.",
    status: "ongoing" as const,
    isActive: true
  },
  {
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
    rules: "Times de 5 jogadores. Regras oficiais da Riot Games.",
    status: "ongoing" as const,
    isActive: true
  },
  {
    name: "ESL Challenger League Season 5 - América do Sul",
    game: "CS2",
    format: "Online - Liga",
    description: "Liga profissional de Counter-Strike 2",
    startDate: "2025-08-11T20:00:00.000Z",
    endDate: "2025-09-01T22:00:00.000Z",
    registrationDeadline: "2025-08-09T23:59:59.000Z",
    maxParticipants: 24,
    prizePool: 25000,
    entryFee: 0,
    rules: "Times profissionais. Regras ESL oficiais.",
    status: "ongoing" as const,
    isActive: true
  },
  {
    name: "ESL Challenger League Season 5 - América do Norte",
    game: "CS2",
    format: "Online - Liga",
    description: "Liga profissional de Counter-Strike 2 - NA",
    startDate: "2025-08-12T21:00:00.000Z",
    endDate: "2025-08-31T23:00:00.000Z",
    registrationDeadline: "2025-08-10T23:59:59.000Z",
    maxParticipants: 24,
    prizePool: 30000,
    entryFee: 0,
    rules: "Times profissionais. Regras ESL oficiais.",
    status: "ongoing" as const,
    isActive: true
  },
  {
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
    rules: "Torneio presencial. Passagem e hospedagem incluídas.",
    status: "ongoing" as const,
    isActive: true
  },
  {
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
    rules: "Torneio presencial no Rio de Janeiro. Times de 5 jogadores.",
    status: "ongoing" as const,
    isActive: true
  },
  {
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
    rules: "Torneio convite. Times profissionais.",
    status: "ongoing" as const,
    isActive: true
  },
  {
    name: "ESL Impact League Season 8: South America",
    game: "CS2",
    format: "Online - Liga",
    description: "Liga feminina de Counter-Strike 2",
    startDate: "2025-08-15T19:00:00.000Z",
    endDate: "2025-08-17T22:00:00.000Z",
    registrationDeadline: "2025-08-13T23:59:59.000Z",
    maxParticipants: 16,
    prizePool: 15000,
    entryFee: 0,
    rules: "Liga exclusiva para jogadoras. #GGFORALL",
    status: "upcoming" as const,
    isActive: true
  },
  {
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
    rules: "Torneio aberto. Modo Battle Royale. Sem trapaças.",
    status: "upcoming" as const,
    isActive: true
  },
  {
    name: "Valorant Champions Tour 2025",
    game: "Valorant",
    format: "Online - Liga",
    description: "Circuito oficial da Riot Games",
    startDate: "2025-08-25T20:00:00.000Z",
    endDate: "2025-09-15T22:00:00.000Z",
    registrationDeadline: "2025-08-23T23:59:59.000Z",
    maxParticipants: 64,
    prizePool: 75000,
    entryFee: 0,
    rules: "Circuito oficial. Regras VCT 2025.",
    status: "upcoming" as const,
    isActive: true
  },
  {
    name: "Dota 2 International Qualifiers",
    game: "Dota 2",
    format: "Online - Eliminação dupla",
    description: "Qualificatórias para o The International",
    startDate: "2025-09-01T18:00:00.000Z",
    endDate: "2025-09-10T22:00:00.000Z",
    registrationDeadline: "2025-08-30T23:59:59.000Z",
    maxParticipants: 32,
    prizePool: 100000,
    entryFee: 0,
    rules: "Qualificatórias regionais. Times profissionais.",
    status: "upcoming" as const,
    isActive: true
  },
  {
    name: "League of Legends World Championship",
    game: "League of Legends",
    format: "LAN - Eliminação dupla",
    description: "Campeonato mundial de League of Legends",
    startDate: "2025-10-01T18:00:00.000Z",
    endDate: "2025-11-15T22:00:00.000Z",
    registrationDeadline: "2025-09-15T23:59:59.000Z",
    maxParticipants: 24,
    prizePool: 2000000,
    entryFee: 0,
    rules: "Campeonato mundial. Times qualificados.",
    status: "upcoming" as const,
    isActive: true
  }
]

async function seedTournaments() {
  console.log('🌱 Iniciando seed de torneios...')
  
  try {
    for (const tournament of sampleTournaments) {
      try {
        const result = await firestoreHelpers.createTournament(tournament)
        if (result) {
          console.log(`✅ Torneio criado: ${tournament.name}`)
        } else {
          console.log(`❌ Erro ao criar torneio: ${tournament.name}`)
        }
      } catch (error) {
        console.log(`❌ Erro ao criar torneio: ${tournament.name}`)
        console.error('   Detalhes do erro:', error)
      }
    }
    
    console.log('🎉 Seed de torneios concluído!')
  } catch (error) {
    console.error('❌ Erro durante o seed:', error)
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  seedTournaments()
}

export { seedTournaments }
