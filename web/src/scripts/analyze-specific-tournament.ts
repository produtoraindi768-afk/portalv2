import { initializeApp } from 'firebase/app'
import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore'

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBMJ_OR41iCIMGDEmGYUkf1mI6Aym9W04w",
  authDomain: "dashboard-f0217.firebaseapp.com",
  projectId: "dashboard-f0217",
  storageBucket: "dashboard-f0217.firebasestorage.app",
  messagingSenderId: "791615571",
  appId: "1:791615571:web:396e6bc323a648864d0ea6"
}

// Inicializar Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

// Função para determinar status baseado nas datas (lógica atual da página)
function determineStatus(startTime: string, lastCompletedMatchAt?: string, rawData?: any): 'upcoming' | 'ongoing' | 'finished' {
  if (!startTime) return 'upcoming'
  
  const startDate = new Date(startTime)
  const now = new Date()
  
  // 1. Verificar se o torneio foi explicitamente finalizado
  if (lastCompletedMatchAt) {
    return 'finished'
  }
  
  // 2. Verificar status/state do Battlefy
  if (rawData?.status === 'complete' || rawData?.state === 'complete') {
    return 'finished'
  }
  
  // 3. Verificar se passou muito tempo desde o início (mais de 7 dias)
  if (startTime) {
    const daysSinceStart = (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    
    if (daysSinceStart > 7) {
      return 'finished'
    }
  }
  
  if (now < startDate) {
    return 'upcoming'
  } else {
    return 'ongoing'
  }
}

// Função para calcular status real baseado nas datas
function calculateRealStatus(startDate: string, endDate: string) {
  const now = new Date().getTime()
  const start = new Date(startDate).getTime()
  const end = new Date(endDate).getTime()
  
  if (now < start) {
    return 'upcoming'
  } else if (now >= start && now <= end) {
    return 'ongoing'
  } else {
    return 'finished'
  }
}

async function analyzeSpecificTournament() {
  console.log('🔍 Analisando torneio específico: west ballistic open #1')
  console.log('======================================================\n')
  
  try {
    // Buscar o torneio específico
    const docRef = doc(db, 'battlefy_tournaments', '9FdoHPeg5xBDnspWR3Ou')
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      const data = docSnap.data()
      const rawData = data.rawData
      
      console.log('📊 DADOS DO TORNEIO:')
      console.log('===================')
      console.log(`🏆 Nome: ${data.name}`)
      console.log(`🆔 ID: ${docSnap.id}`)
      console.log(`🎮 BattlefyId: ${data.battlefyId}`)
      console.log(`📅 StartTime: ${rawData?.startTime}`)
      console.log(`🏁 LastCompletedMatchAt: ${rawData?.lastCompletedMatchAt}`)
      console.log(`📊 Battlefy Status: ${rawData?.status || 'N/A'}`)
      console.log(`🔄 Battlefy State: ${rawData?.state || 'N/A'}`)
      console.log(`📥 ImportedAt: ${data.importedAt}`)
      console.log(`🔄 UpdatedAt: ${data.updatedAt}`)
      
      // Analisar datas
      const startTime = rawData?.startTime
      const lastCompleted = rawData?.lastCompletedMatchAt
      
      if (startTime) {
        const startDate = new Date(startTime)
        const now = new Date()
        const endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000) // +24h
        
        console.log('\n⏰ ANÁLISE DE DATAS:')
        console.log('===================')
        console.log(`📅 Data de início: ${startDate.toLocaleString('pt-BR')}`)
        console.log(`🏁 Data estimada fim: ${endDate.toLocaleString('pt-BR')}`)
        console.log(`🕐 Data atual: ${now.toLocaleString('pt-BR')}`)
        
        if (lastCompleted) {
          const lastCompletedDate = new Date(lastCompleted)
          console.log(`✅ Última partida: ${lastCompletedDate.toLocaleString('pt-BR')}`)
          
          const timeSinceLastMatch = (now.getTime() - lastCompletedDate.getTime()) / (1000 * 60 * 60)
          console.log(`⏱️  Tempo desde última partida: ${timeSinceLastMatch.toFixed(1)} horas`)
        }
        
        const determinedStatus = determineStatus(startTime, lastCompleted, rawData)
        const realStatus = calculateRealStatus(startTime, endDate.toISOString())
        
        console.log('\n🎯 ANÁLISE DE STATUS:')
        console.log('=====================')
        console.log(`🔍 Status determinado (lógica atual): ${determinedStatus.toUpperCase()}`)
        console.log(`📊 Status real (baseado em datas): ${realStatus.toUpperCase()}`)
        
        console.log('\n🤔 RAZÃO DA DISCREPÂNCIA:')
        console.log('=========================')
        if (determinedStatus === 'finished' && realStatus === 'ongoing') {
          if (lastCompleted) {
            console.log('❌ O torneio está sendo marcado como FINISHED porque:')
            console.log('   - Existe um lastCompletedMatchAt')
            console.log('   - A lógica atual considera que se há uma última partida, o torneio acabou')
            console.log('\n💡 POSSÍVEL SOLUÇÃO:')
            console.log('   - Verificar se realmente todas as partidas foram concluídas')
            console.log('   - Ou ajustar a lógica para considerar torneios em andamento mesmo com partidas concluídas')
          }
        }
        
        // Verificar se deveria aparecer na página
        console.log('\n📄 IMPACTO NA PÁGINA:')
        console.log('=====================')
        if (realStatus === 'ongoing') {
          console.log('✅ Este torneio DEVERIA aparecer na seção "EM ANDAMENTO"')
          console.log('❌ Mas não aparece devido à lógica de lastCompletedMatchAt')
        }
      }
      
      // Verificar rawData completo
      console.log('\n📋 DADOS BRUTOS (rawData):')
      console.log('==========================')
      console.log(JSON.stringify(rawData, null, 2))
      
    } else {
      console.log('❌ Torneio não encontrado!')
    }
    
  } catch (error) {
    console.error('❌ Erro ao analisar:', error)
  }
}

// Executar análise
analyzeSpecificTournament().then(() => {
  console.log('\n✅ Análise concluída!')
  process.exit(0)
}).catch(error => {
  console.error('❌ Erro:', error)
  process.exit(1)
})