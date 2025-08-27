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

async function checkCurrentOngoing() {
  console.log('🔍 Verificando torneios que DEVERIAM estar em andamento AGORA...')
  console.log('===============================================================\n')
  
  try {
    const battlefySnapshot = await getDocs(collection(db, 'battlefy_tournaments'))
    const now = new Date()
    
    console.log(`🕐 Data/hora atual: ${now.toLocaleString('pt-BR')}\n`)
    
    let shouldBeOngoing: any[] = []
    let recentlyFinished: any[] = []
    
    battlefySnapshot.docs.forEach((doc) => {
      const data = doc.data()
      const rawData = data.rawData
      
      if (rawData?.startTime) {
        const startDate = new Date(rawData.startTime)
        const endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000) // +24h
        const lastCompleted = rawData.lastCompletedMatchAt ? new Date(rawData.lastCompletedMatchAt) : null
        
        // Verificar se deveria estar em andamento (entre start e end)
        const isInTimeWindow = now >= startDate && now <= endDate
        
        // Verificar se foi finalizado recentemente (últimas 24h)
        const wasRecentlyFinished = lastCompleted && (now.getTime() - lastCompleted.getTime()) < (24 * 60 * 60 * 1000)
        
        if (isInTimeWindow) {
          const tournament = {
            id: doc.id,
            name: data.name,
            battlefyId: data.battlefyId,
            startTime: rawData.startTime,
            startDate: startDate,
            endDate: endDate,
            lastCompleted: rawData.lastCompletedMatchAt,
            lastCompletedDate: lastCompleted,
            status: rawData.status,
            state: rawData.state,
            isInTimeWindow: true,
            hasLastCompleted: !!rawData.lastCompletedMatchAt
          }
          
          if (rawData.lastCompletedMatchAt) {
            recentlyFinished.push(tournament)
          } else {
            shouldBeOngoing.push(tournament)
          }
        }
      }
    })
    
    console.log('✅ TORNEIOS QUE DEVERIAM ESTAR EM ANDAMENTO:')
    console.log('===========================================')
    
    if (shouldBeOngoing.length === 0) {
      console.log('❌ Nenhum torneio deveria estar em andamento no momento.\n')
    } else {
      shouldBeOngoing.forEach((tournament, index) => {
        console.log(`\n🏆 ${index + 1}. ${tournament.name}`)
        console.log(`   ID: ${tournament.id}`)
        console.log(`   BattlefyId: ${tournament.battlefyId}`)
        console.log(`   📅 Início: ${tournament.startDate.toLocaleString('pt-BR')}`)
        console.log(`   🏁 Fim estimado: ${tournament.endDate.toLocaleString('pt-BR')}`)
        console.log(`   📊 Status: ${tournament.status || 'N/A'}`)
        console.log(`   🔄 State: ${tournament.state || 'N/A'}`)
        console.log(`   ✅ DEVERIA APARECER como EM ANDAMENTO!`)
      })
    }
    
    console.log('\n\n🏁 TORNEIOS FINALIZADOS RECENTEMENTE (últimas 24h):')
    console.log('====================================================')
    
    if (recentlyFinished.length === 0) {
      console.log('❌ Nenhum torneio foi finalizado recentemente.\n')
    } else {
      recentlyFinished.forEach((tournament, index) => {
        const timeSinceFinished = tournament.lastCompletedDate ? 
          (now.getTime() - tournament.lastCompletedDate.getTime()) / (1000 * 60 * 60) : 0
        
        console.log(`\n🏆 ${index + 1}. ${tournament.name}`)
        console.log(`   ID: ${tournament.id}`)
        console.log(`   BattlefyId: ${tournament.battlefyId}`)
        console.log(`   📅 Início: ${tournament.startDate.toLocaleString('pt-BR')}`)
        console.log(`   🏁 Fim estimado: ${tournament.endDate.toLocaleString('pt-BR')}`)
        console.log(`   ✅ Finalizado em: ${tournament.lastCompletedDate?.toLocaleString('pt-BR')}`)
        console.log(`   ⏱️  Há ${timeSinceFinished.toFixed(1)} horas`)
        console.log(`   📊 Status: ${tournament.status || 'N/A'}`)
        console.log(`   🔄 State: ${tournament.state || 'N/A'}`)
        console.log(`   ❌ Não aparece como EM ANDAMENTO (correto, pois foi finalizado)`)
      })
    }
    
    // Verificar torneios da coleção tournaments também
    console.log('\n\n📋 VERIFICANDO COLEÇÃO TOURNAMENTS:')
    console.log('==================================')
    
    const tournamentsSnapshot = await getDocs(collection(db, 'tournaments'))
    let tournamentsShouldBeOngoing: any[] = []
    
    tournamentsSnapshot.docs.forEach((doc) => {
      const data = doc.data()
      
      if (data.startDate && data.endDate && data.isActive) {
        const startDate = new Date(data.startDate)
        const endDate = new Date(data.endDate)
        
        if (now >= startDate && now <= endDate) {
          tournamentsShouldBeOngoing.push({
            id: doc.id,
            name: data.name,
            startDate: startDate,
            endDate: endDate,
            status: data.status,
            isActive: data.isActive
          })
        }
      }
    })
    
    if (tournamentsShouldBeOngoing.length === 0) {
      console.log('❌ Nenhum torneio da coleção tournaments deveria estar em andamento.\n')
    } else {
      tournamentsShouldBeOngoing.forEach((tournament, index) => {
        console.log(`\n🏆 ${index + 1}. ${tournament.name}`)
        console.log(`   ID: ${tournament.id}`)
        console.log(`   📅 Início: ${tournament.startDate.toLocaleString('pt-BR')}`)
        console.log(`   🏁 Fim: ${tournament.endDate.toLocaleString('pt-BR')}`)
        console.log(`   📊 Status: ${tournament.status}`)
        console.log(`   ✅ IsActive: ${tournament.isActive}`)
        console.log(`   ✅ DEVERIA APARECER como EM ANDAMENTO!`)
      })
    }
    
    console.log('\n📊 RESUMO FINAL:')
    console.log('================')
    console.log(`🎯 Battlefy que deveriam estar ongoing: ${shouldBeOngoing.length}`)
    console.log(`🏁 Battlefy finalizados recentemente: ${recentlyFinished.length}`)
    console.log(`📋 Tournaments que deveriam estar ongoing: ${tournamentsShouldBeOngoing.length}`)
    console.log(`🔢 Total que deveria aparecer como EM ANDAMENTO: ${shouldBeOngoing.length + tournamentsShouldBeOngoing.length}`)
    
    if (shouldBeOngoing.length + tournamentsShouldBeOngoing.length === 0) {
      console.log('\n✅ CONCLUSÃO: Não há torneios que deveriam estar em andamento.')
      console.log('💡 Por isso a seção "EM ANDAMENTO" não aparece na página.')
      console.log('🔍 Todos os torneios estão corretamente categorizados.')
    } else {
      console.log('\n⚠️  PROBLEMA IDENTIFICADO!')
      console.log('🔧 Existem torneios que deveriam aparecer como EM ANDAMENTO.')
      console.log('🔍 Verifique a lógica de filtragem na página.')
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar:', error)
  }
}

// Executar verificação
checkCurrentOngoing().then(() => {
  console.log('\n✅ Verificação concluída!')
  process.exit(0)
}).catch(error => {
  console.error('❌ Erro:', error)
  process.exit(1)
})