import { config } from 'dotenv'
import { resolve } from 'path'
import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

// Carregar variáveis de ambiente
config({ path: resolve(process.cwd(), '.env.local') })

// Inicializar Firebase Admin
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n')
    })
  })
}

const db = getFirestore()

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
    status: "ongoing",
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
    status: "ongoing",
    isActive: true
  }
]

async function seedTournamentsAdmin() {
  console.log('🌱 Iniciando seed de torneios com Admin SDK...')
  
  try {
    for (const tournament of sampleTournaments) {
      try {
        const docRef = await db.collection('tournaments').add(tournament)
        console.log(`✅ Torneio criado: ${tournament.name} (ID: ${docRef.id})`)
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
  seedTournamentsAdmin()
}

export { seedTournamentsAdmin }
