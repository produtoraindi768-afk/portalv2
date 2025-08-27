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

// Função para determinar status baseado nas datas
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

async function checkOngoingTournaments() {
  console.log('🔍 Verificando torneios que deveriam estar EM ANDAMENTO...')
  console.log('================================================================\n')
  
  try {
    // Buscar torneios do Battlefy
    const battlefySnapshot = await getDocs(collection(db, 'battlefy_tournaments'))
    const tournamentsSnapshot = await getDocs(collection(db, 'tournaments'))
    
    let ongoingCount = 0
    let shouldBeOngoingCount = 0
    
    console.log('📊 TORNEIOS BATTLEFY QUE DEVERIAM ESTAR EM ANDAMENTO:')
    console.log('====================================================\n')
    
    battlefySnapshot.docs.forEach((doc, index) => {
      const data = doc.data()
      const rawData = data.rawData
      
      if (rawData && rawData.startTime) {
        const determinedStatus = determineStatus(rawData.startTime, rawData.lastCompletedMatchAt, rawData)
        
        // Calcular endDate estimado (24h após início)
        const endDate = new Date(new Date(rawData.startTime).getTime() + 24 * 60 * 60 * 1000).toISOString()
        const realStatus = calculateRealStatus(rawData.startTime, endDate)
        
        if (determinedStatus === 'ongoing' || realStatus === 'ongoing') {
          shouldBeOngoingCount++
          
          console.log(`🏆 ${shouldBeOngoingCount}. ${data.name || 'Sem nome'}`)
          console.log(`   ID: ${doc.id}`)
          console.log(`   BattlefyId: ${data.battlefyId}`)
          console.log(`   📅 StartTime: ${rawData.startTime}`)
          console.log(`   🏁 LastCompleted: ${rawData.lastCompletedMatchAt || 'N/A'}`)
          console.log(`   📊 Battlefy Status: ${rawData.status || 'N/A'}`)
          console.log(`   🔄 Battlefy State: ${rawData.state || 'N/A'}`)
          console.log(`   🎯 Status determinado: ${determinedStatus.toUpperCase()}`)
          console.log(`   🎯 Status real (datas): ${realStatus.toUpperCase()}`)
          
          if (determinedStatus === 'ongoing') {
            ongoingCount++
            console.log(`   ✅ DEVERIA APARECER como EM ANDAMENTO na página!`)
          }
          
          console.log('')
        }
      }
    })
    
    console.log('\n📊 TORNEIOS DA COLEÇÃO TOURNAMENTS QUE DEVERIAM ESTAR EM ANDAMENTO:')
    console.log('===================================================================\n')
    
    let tournamentOngoingCount = 0
    
    tournamentsSnapshot.docs.forEach((doc, index) => {
      const data = doc.data()
      
      if (data.startDate && data.endDate) {
        const realStatus = calculateRealStatus(data.startDate, data.endDate)
        
        if (realStatus === 'ongoing') {
          tournamentOngoingCount++
          
          console.log(`🏆 ${tournamentOngoingCount}. ${data.name || 'Sem nome'}`)
          console.log(`   ID: ${doc.id}`)
          console.log(`   📅 StartDate: ${data.startDate}`)
          console.log(`   🏁 EndDate: ${data.endDate}`)
          console.log(`   📊 Status BD: ${data.status || 'N/A'}`)
          console.log(`   ✅ IsActive: ${data.isActive}`)
          console.log(`   🎯 Status real: ${realStatus.toUpperCase()}`)
          console.log(`   ✅ DEVERIA APARECER como EM ANDAMENTO na página!`)
          console.log('')
        }
      }
    })
    
    console.log('\n📈 RESUMO:')
    console.log('===========')
    console.log(`🔴 Torneios Battlefy que deveriam estar EM ANDAMENTO: ${ongoingCount}`)
    console.log(`🔴 Torneios Firebase que deveriam estar EM ANDAMENTO: ${tournamentOngoingCount}`)
    console.log(`🔴 Total de torneios que deveriam estar EM ANDAMENTO: ${ongoingCount + tournamentOngoingCount}`)
    
    if (ongoingCount + tournamentOngoingCount === 0) {
      console.log('\n✅ Não há torneios que deveriam estar em andamento no momento.')
      console.log('💡 Isso explica por que a seção "EM ANDAMENTO" não aparece na página.')
    } else {
      console.log('\n⚠️  Existem torneios que deveriam estar EM ANDAMENTO!')
      console.log('🔧 Verifique se a página está filtrando corretamente.')
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar:', error)
  }
}

// Executar verificação
checkOngoingTournaments().then(() => {
  console.log('\n✅ Verificação concluída!')
  process.exit(0)
}).catch(error => {
  console.error('❌ Erro:', error)
  process.exit(1)
})