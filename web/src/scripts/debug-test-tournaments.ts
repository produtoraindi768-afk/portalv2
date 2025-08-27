import { initializeApp } from 'firebase/app'
import { getFirestore, collection, getDocs } from 'firebase/firestore'

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBOgLKHxWOLqOdKOhYhJJOJJJJJJJJJJJJ",
  authDomain: "projetosia-dev.firebaseapp.com",
  projectId: "projetosia-dev",
  storageBucket: "projetosia-dev.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdefghijklmnop"
}

// Inicializar Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

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

// Função para determinar status baseado nas datas (igual à página)
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

async function debugTestTournaments() {
  console.log('🔍 Debugando torneios de teste...')
  console.log('🕐 Data/hora atual:', new Date().toLocaleString('pt-BR'))
  console.log('')
  
  try {
    // Buscar torneios do Battlefy
    console.log('📊 TORNEIOS DE TESTE DO BATTLEFY:')
    console.log('================================\n')
    
    const battlefySnapshot = await getDocs(collection(db, 'battlefy_tournaments'))
    
    battlefySnapshot.docs.forEach((doc, index) => {
      const data = doc.data()
      const rawData = data.rawData
      
      // Filtrar apenas torneios de teste
      if (data.name && data.name.includes('TESTE')) {
        console.log(`🏆 ${data.name}`)
        console.log(`   ID: ${doc.id}`)
        console.log(`   BattlefyId: ${data.battlefyId}`)
        
        if (rawData) {
          console.log(`   📅 StartTime: ${rawData.startTime}`)
          console.log(`   🏁 LastCompleted: ${rawData.lastCompletedMatchAt || 'N/A'}`)
          console.log(`   📊 Status: ${rawData.status || 'N/A'}`)
          console.log(`   🔄 State: ${rawData.state || 'N/A'}`)
          
          // Calcular endDate (24h após startTime)
          const endDate = rawData.startTime ? 
            new Date(new Date(rawData.startTime).getTime() + 24 * 60 * 60 * 1000).toISOString() : 
            new Date().toISOString()
          
          console.log(`   🏁 EndDate calculado: ${endDate}`)
          
          // Status determinado pela função da página
          const determinedStatus = determineStatus(rawData.startTime, rawData.lastCompletedMatchAt, rawData)
          
          // Status real baseado nas datas
          const realStatus = calculateRealStatus(rawData.startTime, endDate)
          
          console.log(`   🎯 Status determinado (página): ${determinedStatus.toUpperCase()}`)
          console.log(`   🎯 Status real (datas): ${realStatus.toUpperCase()}`)
          
          if (determinedStatus !== realStatus) {
            console.log(`   ⚠️  PROBLEMA: Status determinado (${determinedStatus}) != Status real (${realStatus})`)
            
            if (rawData.lastCompletedMatchAt) {
              console.log(`   🔍 CAUSA: lastCompletedMatchAt está definido: ${rawData.lastCompletedMatchAt}`)
              console.log(`   💡 SOLUÇÃO: Remover lastCompletedMatchAt ou ajustar lógica`)
            }
          } else {
            console.log(`   ✅ Status correto!`)
          }
        }
        
        console.log('')
      }
    })
    
    // Buscar torneios da coleção tournaments
    console.log('📊 TORNEIOS DE TESTE DA COLEÇÃO TOURNAMENTS:')
    console.log('==========================================\n')
    
    const tournamentsSnapshot = await getDocs(collection(db, 'tournaments'))
    
    tournamentsSnapshot.docs.forEach((doc, index) => {
      const data = doc.data()
      
      // Filtrar apenas torneios de teste
      if (data.name && data.name.includes('TESTE')) {
        console.log(`🏆 ${data.name}`)
        console.log(`   ID: ${doc.id}`)
        console.log(`   📅 StartDate: ${data.startDate}`)
        console.log(`   🏁 EndDate: ${data.endDate}`)
        console.log(`   📊 Status BD: ${data.status || 'N/A'}`)
        console.log(`   ✅ IsActive: ${data.isActive}`)
        
        if (data.startDate && data.endDate) {
          const realStatus = calculateRealStatus(data.startDate, data.endDate)
          console.log(`   🎯 Status real (datas): ${realStatus.toUpperCase()}`)
          
          if (data.status !== realStatus) {
            console.log(`   ⚠️  DIVERGÊNCIA: Status BD (${data.status}) != Status real (${realStatus})`)
          } else {
            console.log(`   ✅ Status correto!`)
          }
        }
        
        console.log('')
      }
    })
    
  } catch (error) {
    console.error('❌ Erro ao debugar:', error)
  }
}

// Executar o debug
debugTestTournaments().then(() => {
  console.log('\n✅ Debug concluído!')
  process.exit(0)
}).catch(error => {
  console.error('❌ Erro:', error)
  process.exit(1)
})