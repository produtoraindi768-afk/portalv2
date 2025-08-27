import { initializeApp } from 'firebase/app'
import { getFirestore, collection, getDocs } from 'firebase/firestore'

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

// Função para determinar status baseado nas datas (igual à página de torneios)
function determineStatus(startTime: string, lastCompletedMatchAt?: string, rawData?: any): 'upcoming' | 'ongoing' | 'finished' {
  if (!startTime) return 'upcoming'
  
  const startDate = new Date(startTime)
  const now = new Date()
  
  console.log(`   📅 Start: ${startDate.toLocaleString('pt-BR')}`)
  console.log(`   🕐 Now: ${now.toLocaleString('pt-BR')}`)
  
  // 1. Verificar se o torneio foi explicitamente finalizado
  if (lastCompletedMatchAt) {
    console.log(`   ✅ Finalizado: lastCompletedMatchAt = ${lastCompletedMatchAt}`)
    return 'finished'
  }
  
  // 2. Verificar status/state do Battlefy
  if (rawData?.status === 'complete' || rawData?.state === 'complete') {
    console.log(`   ✅ Finalizado: status/state = ${rawData?.status || rawData?.state}`)
    return 'finished'
  }
  
  // 3. Verificar se passou muito tempo desde o início (mais de 7 dias)
  if (startTime) {
    const daysSinceStart = (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    console.log(`   ⏰ Dias desde início: ${daysSinceStart.toFixed(1)}`)
    
    if (daysSinceStart > 7) {
      console.log(`   ⏰ Finalizado: mais de 7 dias (${daysSinceStart.toFixed(1)} dias)`)
      return 'finished'
    }
  }
  
  if (now < startDate) {
    console.log(`   📅 Status: UPCOMING (ainda não começou)`)
    return 'upcoming'
  } else {
    console.log(`   🔴 Status: ONGOING (em andamento)`)
    return 'ongoing'
  }
}

// Função para calcular status real baseado nas datas (igual ao TournamentCard)
function calculateRealStatus(startDate: string, endDate: string) {
  const now = new Date().getTime()
  const start = new Date(startDate).getTime()
  const end = new Date(endDate).getTime()
  
  if (now < start) {
    return 'upcoming' // Torneio ainda não começou
  } else if (now >= start && now <= end) {
    return 'ongoing' // Torneio em andamento
  } else {
    return 'finished' // Torneio já terminou
  }
}

async function debugTournamentStatus() {
  console.log('🔍 Analisando status dos torneios...')
  
  try {
    // Buscar torneios do Battlefy
    console.log('📊 TORNEIOS DO BATTLEFY:')
    console.log('========================\n')
    
    const battlefySnapshot = await getDocs(collection(db, 'battlefy_tournaments'))
    
    if (battlefySnapshot.empty) {
      console.log('❌ Nenhum torneio do Battlefy encontrado')
    } else {
      battlefySnapshot.docs.forEach((doc, index) => {
        const data = doc.data()
        const rawData = data.rawData
        
        console.log(`🏆 ${index + 1}. ${data.name || 'Sem nome'}`)
        console.log(`   ID: ${doc.id}`)
        console.log(`   BattlefyId: ${data.battlefyId}`)
        
        if (rawData) {
          console.log(`   🎮 Game: ${rawData.gameName || 'N/A'}`)
          console.log(`   📅 StartTime: ${rawData.startTime || 'N/A'}`)
          console.log(`   🏁 LastCompleted: ${rawData.lastCompletedMatchAt || 'N/A'}`)
          console.log(`   📊 Status: ${rawData.status || 'N/A'}`)
          console.log(`   🔄 State: ${rawData.state || 'N/A'}`)
          
          // Determinar status usando a lógica atual
          const determinedStatus = determineStatus(rawData.startTime, rawData.lastCompletedMatchAt, rawData)
          
          // Calcular status real baseado nas datas
          if (rawData.startTime) {
            const endDate = rawData.startTime ? new Date(new Date(rawData.startTime).getTime() + 24 * 60 * 60 * 1000).toISOString() : new Date().toISOString()
            const realStatus = calculateRealStatus(rawData.startTime, endDate)
            
            console.log(`   🎯 Status determinado: ${determinedStatus.toUpperCase()}`)
            console.log(`   🎯 Status real (datas): ${realStatus.toUpperCase()}`)
            
            if (determinedStatus !== realStatus) {
              console.log(`   ⚠️  DIVERGÊNCIA! Status determinado (${determinedStatus}) != Status real (${realStatus})`)
            }
          }
        } else {
          console.log('   ❌ rawData não encontrado')
        }
        
        console.log('')
      })
    }
    
    // Buscar torneios da coleção tournaments
    console.log('\n📊 TORNEIOS DA COLEÇÃO TOURNAMENTS:')
    console.log('===================================\n')
    
    const tournamentsSnapshot = await getDocs(collection(db, 'tournaments'))
    
    if (tournamentsSnapshot.empty) {
      console.log('❌ Nenhum torneio encontrado na coleção tournaments')
    } else {
      tournamentsSnapshot.docs.forEach((doc, index) => {
        const data = doc.data()
        
        console.log(`🏆 ${index + 1}. ${data.name || 'Sem nome'}`)
        console.log(`   ID: ${doc.id}`)
        console.log(`   🎮 Game: ${data.game || 'N/A'}`)
        console.log(`   📅 StartDate: ${data.startDate || 'N/A'}`)
        console.log(`   🏁 EndDate: ${data.endDate || 'N/A'}`)
        console.log(`   📊 Status: ${data.status || 'N/A'}`)
        console.log(`   ✅ IsActive: ${data.isActive}`)
        
        if (data.startDate && data.endDate) {
          const realStatus = calculateRealStatus(data.startDate, data.endDate)
          console.log(`   🎯 Status real (datas): ${realStatus.toUpperCase()}`)
          
          if (data.status !== realStatus) {
            console.log(`   ⚠️  DIVERGÊNCIA! Status BD (${data.status}) != Status real (${realStatus})`)
          }
        }
        
        console.log('')
      })
    }
    
  } catch (error) {
    console.error('❌ Erro ao debugar:', error)
  }
}

// Executar o debug
debugTournamentStatus().then(() => {
  console.log('\n✅ Debug concluído!')
  process.exit(0)
}).catch(error => {
  console.error('❌ Erro:', error)
  process.exit(1)
})