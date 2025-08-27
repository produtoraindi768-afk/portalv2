// Teste para verificar se a correção do status do torneio está funcionando

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

const firebaseConfig = {
  projectId: 'projetosia-dev'
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Simular a lógica da página corrigida
function calculateRealStatus(tournament) {
  const now = new Date().getTime();
  const start = new Date(tournament.startDate).getTime();
  const end = new Date(tournament.endDate).getTime();
  
  // Para torneios do Battlefy, verificar se foi explicitamente finalizado
  if (tournament.id.startsWith('battlefy_')) {
    // Se tem lastCompletedMatchAt, o torneio foi finalizado
    if (tournament.lastCompletedMatchAt) {
      return 'finished';
    }
    
    // Se o status/state do Battlefy é 'complete', foi finalizado
    if (tournament.battlefyStatus === 'complete' || tournament.battlefyState === 'complete') {
      return 'finished';
    }
    
    // Se passou mais de 7 dias desde o início, considerar finalizado
    if (tournament.startDate) {
      const daysSinceStart = (now - start) / (1000 * 60 * 60 * 24);
      if (daysSinceStart > 7) {
        return 'finished';
      }
    }
  }
  
  // Lógica padrão baseada em datas
  if (now < start) {
    return 'upcoming'; // Torneio ainda não começou
  } else if (now >= start && now <= end) {
    return 'ongoing'; // Torneio em andamento
  } else {
    return 'finished'; // Torneio já terminou
  }
}

async function testTournamentFix() {
  try {
    console.log('🔍 Testando correção do status do torneio...');
    
    const battlefySnapshot = await getDocs(collection(db, 'battlefy_tournaments'));
    
    if (battlefySnapshot.empty) {
      console.log('❌ Nenhum torneio do Battlefy encontrado');
      return;
    }
    
    let foundWestBallistic = false;
    
    battlefySnapshot.docs.forEach((doc) => {
      const data = doc.data();
      const rawData = data.rawData || {};
      
      if (data.name && data.name.toLowerCase().includes('west ballistic')) {
        foundWestBallistic = true;
        
        // Simular o mapeamento da página
        const tournament = {
          id: `battlefy_${doc.id}`,
          name: data.name || rawData.name || 'Sem nome',
          startDate: rawData.startTime || new Date().toISOString(),
          endDate: rawData.startTime ? new Date(new Date(rawData.startTime).getTime() + 24 * 60 * 60 * 1000).toISOString() : new Date().toISOString(),
          lastCompletedMatchAt: rawData.lastCompletedMatchAt,
          battlefyStatus: rawData.status,
          battlefyState: rawData.state
        };
        
        console.log('\n🏆 TORNEIO ENCONTRADO:');
        console.log('======================');
        console.log(`📋 Nome: ${tournament.name}`);
        console.log(`📅 Start Date: ${tournament.startDate}`);
        console.log(`🏁 End Date: ${tournament.endDate}`);
        console.log(`✅ Last Completed: ${tournament.lastCompletedMatchAt || 'N/A'}`);
        console.log(`📊 Battlefy Status: ${tournament.battlefyStatus || 'N/A'}`);
        console.log(`🔄 Battlefy State: ${tournament.battlefyState || 'N/A'}`);
        
        const calculatedStatus = calculateRealStatus(tournament);
        
        console.log('\n🎯 RESULTADO DO TESTE:');
        console.log('======================');
        console.log(`🔍 Status calculado: ${calculatedStatus.toUpperCase()}`);
        
        if (calculatedStatus === 'finished') {
          console.log('✅ SUCESSO! O torneio agora é corretamente identificado como FINALIZADO');
          console.log('📋 Ele deve aparecer na seção "TORNEIOS FINALIZADOS" da página');
        } else {
          console.log('❌ PROBLEMA! O torneio ainda não está sendo identificado como finalizado');
          console.log('🔍 Verifique se a lógica está correta');
        }
      }
    });
    
    if (!foundWestBallistic) {
      console.log('❌ Torneio "west ballistic" não encontrado');
    }
    
  } catch (error) {
    console.error('❌ Erro ao testar:', error.message);
  }
}

testTournamentFix();