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

async function checkFutureTournaments() {
  console.log('🔍 Verificando torneios com datas futuras (2025+)...')
  console.log('==================================================\n')
  
  try {
    const battlefySnapshot = await getDocs(collection(db, 'battlefy_tournaments'))
    const now = new Date()
    const currentYear = now.getFullYear()
    
    console.log(`📅 Ano atual: ${currentYear}`)
    console.log(`🕐 Data/hora atual: ${now.toLocaleString('pt-BR')}\n`)
    
    let futureTournaments: any[] = []
    let ongoingTournaments: any[] = []
    
    battlefySnapshot.docs.forEach((doc) => {
      const data = doc.data()
      const rawData = data.rawData
      
      if (rawData?.startTime) {
        const startDate = new Date(rawData.startTime)
        const startYear = startDate.getFullYear()
        
        // Verificar se é um torneio com data futura (2025+)
        if (startYear > currentYear) {
          futureTournaments.push({
            id: doc.id,
            name: data.name,
            startTime: rawData.startTime,
            startDate: startDate,
            lastCompleted: rawData.lastCompletedMatchAt,
            battlefyId: data.battlefyId
          })
        }
        
        // Verificar se deveria estar em andamento (considerando ano correto)
        const correctedStartTime = rawData.startTime.replace('2025', '2024')
        const correctedStartDate = new Date(correctedStartTime)
        const endDate = new Date(correctedStartDate.getTime() + 24 * 60 * 60 * 1000)
        
        if (now >= correctedStartDate && now <= endDate && !rawData.lastCompletedMatchAt) {
          ongoingTournaments.push({
            id: doc.id,
            name: data.name,
            originalStartTime: rawData.startTime,
            correctedStartTime: correctedStartTime,
            startDate: correctedStartDate,
            endDate: endDate,
            lastCompleted: rawData.lastCompletedMatchAt,
            battlefyId: data.battlefyId
          })
        }
      }
    })
    
    console.log('🚀 TORNEIOS COM DATAS FUTURAS (2025+):')
    console.log('======================================')
    
    if (futureTournaments.length === 0) {
      console.log('✅ Nenhum torneio com data futura encontrado.\n')
    } else {
      futureTournaments.forEach((tournament, index) => {
        console.log(`\n🏆 ${index + 1}. ${tournament.name}`)
        console.log(`   ID: ${tournament.id}`)
        console.log(`   BattlefyId: ${tournament.battlefyId}`)
        console.log(`   📅 StartTime original: ${tournament.startTime}`)
        console.log(`   📅 Data interpretada: ${tournament.startDate.toLocaleString('pt-BR')}`)
        console.log(`   🏁 LastCompleted: ${tournament.lastCompleted || 'N/A'}`)
        
        // Verificar se seria ongoing se corrigido para 2024
        const correctedStartTime = tournament.startTime.replace('2025', '2024')
        const correctedDate = new Date(correctedStartTime)
        const endDate = new Date(correctedDate.getTime() + 24 * 60 * 60 * 1000)
        
        console.log(`   🔧 Se fosse 2024: ${correctedDate.toLocaleString('pt-BR')}`)
        
        if (now >= correctedDate && now <= endDate) {
          console.log(`   ✅ SERIA ONGOING se a data fosse corrigida!`)
        } else if (now > endDate) {
          console.log(`   ❌ Seria FINISHED mesmo com correção`)
        } else {
          console.log(`   ⏳ Seria UPCOMING mesmo com correção`)
        }
      })
    }
    
    console.log('\n\n🎯 TORNEIOS QUE DEVERIAM ESTAR EM ANDAMENTO (com correção de ano):')
    console.log('=================================================================')
    
    if (ongoingTournaments.length === 0) {
      console.log('❌ Nenhum torneio deveria estar em andamento no momento.\n')
    } else {
      ongoingTournaments.forEach((tournament, index) => {
        console.log(`\n🏆 ${index + 1}. ${tournament.name}`)
        console.log(`   ID: ${tournament.id}`)
        console.log(`   BattlefyId: ${tournament.battlefyId}`)
        console.log(`   📅 StartTime original: ${tournament.originalStartTime}`)
        console.log(`   🔧 StartTime corrigido: ${tournament.correctedStartTime}`)
        console.log(`   📅 Início: ${tournament.startDate.toLocaleString('pt-BR')}`)
        console.log(`   🏁 Fim estimado: ${tournament.endDate.toLocaleString('pt-BR')}`)
        console.log(`   ✅ DEVERIA APARECER como EM ANDAMENTO!`)
      })
    }
    
    console.log('\n📊 RESUMO:')
    console.log('==========')
    console.log(`🚀 Torneios com datas futuras: ${futureTournaments.length}`)
    console.log(`🎯 Torneios que deveriam estar ongoing: ${ongoingTournaments.length}`)
    
    if (futureTournaments.length > 0) {
      console.log('\n💡 RECOMENDAÇÃO:')
      console.log('================')
      console.log('🔧 Parece que alguns torneios têm datas em 2025 quando deveriam ser 2024.')
      console.log('🔧 Isso pode ser um problema na importação dos dados do Battlefy.')
      console.log('🔧 Considere corrigir essas datas ou ajustar a lógica de importação.')
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar:', error)
  }
}

// Executar verificação
checkFutureTournaments().then(() => {
  console.log('\n✅ Verificação concluída!')
  process.exit(0)
}).catch(error => {
  console.error('❌ Erro:', error)
  process.exit(1)
})