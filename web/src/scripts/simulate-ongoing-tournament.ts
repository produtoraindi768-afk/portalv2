import { initializeApp } from 'firebase/app'
import { getFirestore, collection, addDoc, updateDoc, doc } from 'firebase/firestore'

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

async function simulateOngoingTournament() {
  console.log('🎮 Criando torneio de teste EM ANDAMENTO...')
  console.log('==========================================\n')
  
  try {
    const now = new Date()
    const startTime = new Date(now.getTime() - 2 * 60 * 60 * 1000) // 2 horas atrás
    const endTime = new Date(now.getTime() + 4 * 60 * 60 * 1000) // 4 horas no futuro
    
    console.log(`🕐 Agora: ${now.toLocaleString('pt-BR')}`)
    console.log(`📅 Início do torneio: ${startTime.toLocaleString('pt-BR')}`)
    console.log(`🏁 Fim do torneio: ${endTime.toLocaleString('pt-BR')}`)
    console.log(`⏱️  Duração: 6 horas`)
    console.log(`✅ Status esperado: EM ANDAMENTO\n`)
    
    // Criar torneio Battlefy de teste
    const battlefyTournament = {
      name: "🔥 TESTE - Torneio EM ANDAMENTO",
      battlefyId: "test-ongoing-tournament-" + Date.now(),
      game: "Fortnite",
      importedAt: now.toISOString(),
      updatedAt: now.toISOString(),
      rawData: {
        _id: "test-ongoing-tournament-" + Date.now(),
        name: "🔥 TESTE - Torneio EM ANDAMENTO",
        startTime: startTime.toISOString(),
        gameName: "Fortnite",
        region: "Brazil",
        playersPerTeam: 5,
        isPublished: true,
        registrationEnabled: false, // Já começou
        // NÃO incluir lastCompletedMatchAt para simular torneio em andamento
        // status e state também não definidos para simular torneio ativo
        createdAt: startTime.toISOString(),
        updatedAt: now.toISOString()
      }
    }
    
    console.log('📝 Adicionando torneio Battlefy de teste...')
    const battlefyDocRef = await addDoc(collection(db, 'battlefy_tournaments'), battlefyTournament)
    console.log(`✅ Torneio Battlefy criado com ID: ${battlefyDocRef.id}`)
    
    // Criar torneio da coleção tournaments de teste
    const regularTournament = {
      name: "🎯 TESTE - Campeonato EM ANDAMENTO",
      startDate: startTime.toISOString(),
      endDate: endTime.toISOString(),
      status: "Em Andamento",
      isActive: true,
      game: "Fortnite",
      description: "Torneio de teste para verificar exibição em andamento",
      maxParticipants: 100,
      currentParticipants: 45,
      createdAt: startTime.toISOString(),
      updatedAt: now.toISOString()
    }
    
    console.log('📝 Adicionando torneio regular de teste...')
    const regularDocRef = await addDoc(collection(db, 'tournaments'), regularTournament)
    console.log(`✅ Torneio regular criado com ID: ${regularDocRef.id}`)
    
    console.log('\n🎯 TORNEIOS DE TESTE CRIADOS:')
    console.log('=============================')
    console.log(`🏆 Battlefy: "🔥 TESTE - Torneio EM ANDAMENTO"`)
    console.log(`   ID: ${battlefyDocRef.id}`)
    console.log(`   ✅ Deveria aparecer como EM ANDAMENTO`)
    console.log()
    console.log(`🏆 Regular: "🎯 TESTE - Campeonato EM ANDAMENTO"`)
    console.log(`   ID: ${regularDocRef.id}`)
    console.log(`   ✅ Deveria aparecer como EM ANDAMENTO`)
    
    console.log('\n💡 PRÓXIMOS PASSOS:')
    console.log('==================')
    console.log('1. 🌐 Acesse a página de torneios')
    console.log('2. 🔍 Verifique se os torneios aparecem na seção "EM ANDAMENTO"')
    console.log('3. 🧹 Após o teste, delete estes torneios de teste')
    
    console.log('\n🗑️  COMANDO PARA DELETAR DEPOIS:')
    console.log('================================')
    console.log(`Battlefy ID: ${battlefyDocRef.id}`)
    console.log(`Regular ID: ${regularDocRef.id}`)
    
    return {
      battlefyId: battlefyDocRef.id,
      regularId: regularDocRef.id
    }
    
  } catch (error) {
    console.error('❌ Erro ao criar torneios de teste:', error)
    throw error
  }
}

// Executar simulação
simulateOngoingTournament().then((ids) => {
  console.log('\n✅ Torneios de teste criados com sucesso!')
  console.log('🔍 Verifique a página de torneios agora.')
  process.exit(0)
}).catch(error => {
  console.error('❌ Erro:', error)
  process.exit(1)
})