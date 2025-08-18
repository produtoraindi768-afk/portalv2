import { config } from 'dotenv'
import { resolve } from 'path'
import { firestoreHelpers } from '../lib/firestore-helpers'

// Carregar variáveis de ambiente do arquivo .env.local
config({ path: resolve(process.cwd(), '.env.local') })

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

async function testTournamentsMapping() {
  console.log('🧪 Teste de Mapeamento de Torneios\n')

  try {
    console.log('📡 Buscando torneios do Firebase...')
    const tournamentsSnapshot = await firestoreHelpers.getAllTournaments()
    
    if (!tournamentsSnapshot) {
      console.log('❌ Erro: Não foi possível conectar ao Firebase')
      return
    }

    if (tournamentsSnapshot.empty) {
      console.log('📭 Nenhum torneio encontrado na coleção')
      return
    }

    console.log(`✅ ${tournamentsSnapshot.size} torneios encontrados!\n`)

    // Testar mapeamento de cada torneio
    tournamentsSnapshot.docs.forEach((doc, index) => {
      const data = doc.data()
      console.log(`📊 Torneio ${index + 1} (ID: ${doc.id}):`)
      console.log('  Dados originais do Firebase:')
      console.log(`    name: "${data.name}"`)
      console.log(`    game: "${data.game}"`)
      console.log(`    format: "${data.format}"`)
      console.log(`    status: "${data.status}"`)
      console.log(`    entryFee: ${data.entryFee}`)
      console.log(`    isActive: ${data.isActive}`)
      console.log(`    startDate: "${data.startDate}"`)
      console.log(`    endDate: "${data.endDate}"`)
      console.log(`    maxParticipants: ${data.maxParticipants}`)
      console.log(`    maxTeams: ${data.maxTeams}`)
      console.log(`    prizePool: ${data.prizePool}`)

      // Testar mapeamento
      const mappedTournament = {
        id: doc.id,
        name: data.name || 'Sem nome',
        game: data.game || 'Jogo não especificado',
        format: data.format || 'Formato não especificado',
        description: data.description || 'Sem descrição',
        startDate: convertFirebaseTimestamp(data.startDate),
        endDate: convertFirebaseTimestamp(data.endDate),
        registrationDeadline: convertFirebaseTimestamp(data.registrationDeadline),
        maxParticipants: data.maxParticipants || data.maxTeams || 0,
        prizePool: data.prizePool || 0,
        entryFee: data.entryFee || 0,
        rules: data.rules || 'Regras não especificadas',
        status: mapStatus(data.status),
        isActive: data.isActive || false,
        avatar: data.avatar || data.bannerUrl || undefined,
        tournamentUrl: data.tournamentUrl || data.rules || undefined
      }

      console.log('\n  🔄 Torneio mapeado:')
      console.log(`    name: "${mappedTournament.name}"`)
      console.log(`    game: "${mappedTournament.game}"`)
      console.log(`    format: "${mappedTournament.format}"`)
      console.log(`    status: "${mappedTournament.status}"`)
      console.log(`    entryFee: ${mappedTournament.entryFee}`)
      console.log(`    isActive: ${mappedTournament.isActive}`)
      console.log(`    maxParticipants: ${mappedTournament.maxParticipants}`)
      console.log(`    prizePool: ${mappedTournament.prizePool}`)
      console.log(`    startDate: "${mappedTournament.startDate}"`)
      console.log(`    endDate: "${mappedTournament.endDate}"`)
      console.log(`    registrationDeadline: "${mappedTournament.registrationDeadline}"`)
      console.log(`    avatar: "${mappedTournament.avatar || 'Não definido'}"`)
      console.log(`    tournamentUrl: "${mappedTournament.tournamentUrl || 'Não definido'}"`)

      // Verificar se o badge "Gratuito" deve aparecer
      if (mappedTournament.entryFee === 0) {
        console.log('  🎉 ✅ Deve mostrar badge "Gratuito"!')
      } else {
        console.log(`  💰 Deve mostrar valor: R$ ${mappedTournament.entryFee}`)
      }

      console.log('  ---')
    })

    console.log('\n✅ Teste de mapeamento concluído!')

  } catch (error) {
    console.error('❌ Erro ao testar mapeamento:', error)
  }
}

// Executar teste
testTournamentsMapping().catch(console.error) 