const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDvBUDqVIzWjQhOGOhQZOGOhQZOGOhQZOG",
  authDomain: "projetosia-dev.firebaseapp.com",
  projectId: "projetosia-dev",
  storageBucket: "projetosia-dev.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdefghijklmnop"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkCompletedAt() {
  try {
    console.log('🔍 Verificando extração do completedAt das partidas Battlefy...');
    
    const battlefyQuery = collection(db, 'battlefy_matches');
    const battlefySnap = await getDocs(battlefyQuery);
    
    let totalMatches = 0;
    let matchesWithCompletedAt = 0;
    let matchesWithScheduledTime = 0;
    
    battlefySnap.docs.forEach(doc => {
      const raw = doc.data();
      totalMatches++;
      
      // Extrair dados do rawData
      let rawDataParsed = {};
      if (typeof raw.rawData === 'object' && raw.rawData !== null) {
        rawDataParsed = raw.rawData;
      } else if (typeof raw.rawData === 'string') {
        try {
          rawDataParsed = JSON.parse(raw.rawData);
        } catch {
          rawDataParsed = {};
        }
      }
      
      const completedAt = rawDataParsed.completedAt;
      const scheduledTime = rawDataParsed.scheduledTime;
      
      if (completedAt) {
        matchesWithCompletedAt++;
        console.log(`✅ Partida ${doc.id}: completedAt = ${completedAt}`);
      }
      
      if (scheduledTime) {
        matchesWithScheduledTime++;
      }
      
      // Mostrar exemplo de uma partida com completedAt
      if (completedAt && matchesWithCompletedAt <= 3) {
        console.log(`📋 Exemplo - Partida ${doc.id}:`);
        console.log(`   - battlefyId: ${raw.battlefyId}`);
        console.log(`   - completedAt: ${completedAt}`);
        console.log(`   - scheduledTime: ${scheduledTime || 'N/A'}`);
        console.log(`   - matchNumber: ${rawDataParsed.matchNumber || 'N/A'}`);
        console.log('');
      }
    });
    
    console.log('\n📊 Resumo:');
    console.log(`Total de partidas: ${totalMatches}`);
    console.log(`Partidas com completedAt: ${matchesWithCompletedAt} (${((matchesWithCompletedAt/totalMatches)*100).toFixed(1)}%)`);
    console.log(`Partidas com scheduledTime: ${matchesWithScheduledTime} (${((matchesWithScheduledTime/totalMatches)*100).toFixed(1)}%)`);
    
    if (matchesWithCompletedAt > 0) {
      console.log('\n✅ Campo completedAt encontrado e sendo extraído corretamente!');
    } else {
      console.log('\n❌ Nenhuma partida com completedAt encontrada.');
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar completedAt:', error);
  }
}

checkCompletedAt();