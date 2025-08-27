import { config } from 'dotenv'
import { resolve } from 'path'
import { firestoreHelpers } from '../lib/firestore-helpers'

// Carregar variáveis de ambiente
config({ path: resolve(process.cwd(), '.env.local') })

async function debugTrifectaStatus() {
  console.log('🔍 DEBUGANDO STATUS DO TRIFECTA SHOWDOWN #2')
  console.log('===============================================\n')

  try {
    // Buscar o torneio específico
    const battlefySnapshot = await firestoreHelpers.getBattlefyTournaments()
    
    if (!battlefySnapshot || battlefySnapshot.empty) {
      console.log('❌ Nenhum torneio Battlefy encontrado')
      return
    }

    const trifectaDoc = battlefySnapshot.docs.find(doc => {
      const data = doc.data()
      return data.name === 'TRIFECTA SHOWDOWN #2'
    })

    if (!trifectaDoc) {
      console.log('❌ Torneio TRIFECTA SHOWDOWN #2 não encontrado')
      return
    }

    const data = trifectaDoc.data()
    const rawData = data.rawData || {}

    console.log('📋 DADOS DO TORNEIO:')
    console.log(`   Nome: ${data.name}`)
    console.log(`   ID: ${trifectaDoc.id}`)
    console.log(`   Battlefy ID: ${data.battlefyId}`)
    console.log(`   Importado em: ${data.importedAt}`)
    console.log(`   Atualizado em: ${data.updatedAt}`)
    console.log('')

    console.log('📊 RAW DATA RELEVANTE:')
    console.log(`   startTime: ${rawData.startTime}`)
    console.log(`   lastCompletedMatchAt: ${rawData.lastCompletedMatchAt}`)
    console.log(`   status: ${rawData.status}`)
    console.log(`   state: ${rawData.state}`)
    console.log(`   checkInStartTime: ${rawData.checkInStartTime}`)
    console.log(`   checkInEndTime: ${rawData.checkInEndTime}`)
    console.log('')

    // Função atual de determinação de status
    const determineCurrentStatus = (startTime: string, lastCompletedMatchAt?: string): 'upcoming' | 'ongoing' | 'finished' => {
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

    // Função melhorada de determinação de status
    const determineImprovedStatus = (rawData: any): 'upcoming' | 'ongoing' | 'finished' => {
      const now = new Date()
      
      // 1. Verificar se o torneio foi explicitamente finalizado
      if (rawData.lastCompletedMatchAt) {
        console.log('   ✅ Torneio finalizado: lastCompletedMatchAt existe')
        return 'finished'
      }
      
      // 2. Verificar status/state do Battlefy
      if (rawData.status === 'complete' || rawData.state === 'complete') {
        console.log('   ✅ Torneio finalizado: status/state = complete')
        return 'finished'
      }
      
      // 3. Verificar se passou muito tempo desde o início (mais de 7 dias)
      if (rawData.startTime) {
        const startDate = new Date(rawData.startTime)
        const daysSinceStart = (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
        
        if (daysSinceStart > 7) {
          console.log(`   ⏰ Torneio finalizado: ${daysSinceStart.toFixed(1)} dias desde o início`)
          return 'finished'
        }
        
        if (now < startDate) {
          console.log('   📅 Torneio futuro: ainda não começou')
          return 'upcoming'
        } else {
          console.log('   🔴 Torneio em andamento: começou mas não finalizou')
          return 'ongoing'
        }
      }
      
      return 'upcoming'
    }

    const currentStatus = determineCurrentStatus(rawData.startTime, rawData.lastCompletedMatchAt)
    const improvedStatus = determineImprovedStatus(rawData)

    console.log('🎯 ANÁLISE DE STATUS:')
    console.log(`   Status atual (lógica atual): ${currentStatus}`)
    console.log(`   Status melhorado (nova lógica): ${improvedStatus}`)
    console.log('')

    // Verificar datas
    if (rawData.startTime) {
      const startDate = new Date(rawData.startTime)
      const now = new Date()
      const daysDiff = (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      
      console.log('📅 ANÁLISE DE DATAS:')
      console.log(`   Data de início: ${startDate.toLocaleString('pt-BR')}`)
      console.log(`   Data atual: ${now.toLocaleString('pt-BR')}`)
      console.log(`   Diferença: ${daysDiff.toFixed(1)} dias`)
      console.log('')
    }

    // Mostrar outros campos relevantes do rawData
    console.log('🔍 OUTROS CAMPOS RELEVANTES:')
    const relevantFields = ['prizes', 'teamCap', 'maxPlayers', 'type', 'gameName', 'about']
    relevantFields.forEach(field => {
      if (rawData[field] !== undefined) {
        console.log(`   ${field}: ${JSON.stringify(rawData[field]).substring(0, 100)}...`)
      }
    })

  } catch (error) {
    console.error('❌ Erro ao debugar:', error)
  }
}

// Executar o debug
debugTrifectaStatus().then(() => {
  console.log('\n✅ Debug concluído!')
  process.exit(0)
}).catch(error => {
  console.error('❌ Erro:', error)
  process.exit(1)
})