// 🧪 Script para testar a extração de avatares com a nova estrutura
// Este script verifica se os avatares estão sendo extraídos corretamente do rawData.persistentTeam.logoUrl

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBMJ_OR41iCIMGDEmGYUkf1mI6Aym9W04w",
  authDomain: "dashboard-f0217.firebaseapp.com",
  projectId: "dashboard-f0217",
  storageBucket: "dashboard-f0217.firebasestorage.app",
  messagingSenderId: "791615571",
  appId: "1:791615571:web:396e6bc323a648864d0ea6"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/**
 * Função para testar a extração de logoUrl com a nova lógica
 */
function extractLogoUrl(teamData) {
  let logoUrl = null;
  
  if (teamData.rawData && typeof teamData.rawData === 'object') {
    // Priorizar rawData.persistentTeam.logoUrl (estrutura real do Battlefy)
    if (teamData.rawData.persistentTeam && teamData.rawData.persistentTeam.logoUrl) {
      logoUrl = teamData.rawData.persistentTeam.logoUrl;
    } else {
      // Fallback para outras possíveis estruturas
      logoUrl = teamData.rawData.logoUrl || teamData.rawData.logo;
    }
  }
  
  return logoUrl;
}

/**
 * Função principal para testar a extração
 */
async function testAvatarExtraction() {
  try {
    console.log('🧪 Testando extração de avatares...');
    
    // Buscar times
    const teamsCollection = collection(db, 'battlefy_teams');
    const teamsSnapshot = await getDocs(teamsCollection);
    
    console.log(`📊 Total de times: ${teamsSnapshot.size}`);
    
    let teamsWithAvatars = 0;
    let teamsWithoutAvatars = 0;
    
    // Testar extração para cada time
    teamsSnapshot.forEach(doc => {
      const teamData = doc.data();
      const teamName = teamData.name;
      
      // Usar a nova lógica de extração
      const logoUrl = extractLogoUrl(teamData);
      
      if (logoUrl) {
        teamsWithAvatars++;
        console.log(`✅ ${teamName}: ${logoUrl.substring(0, 50)}...`);
      } else {
        teamsWithoutAvatars++;
        console.log(`❌ ${teamName}: sem logoUrl`);
      }
    });
    
    console.log(`\n📊 Resultado do teste:`);
    console.log(`  ✅ Times com avatares: ${teamsWithAvatars}`);
    console.log(`  ❌ Times sem avatares: ${teamsWithoutAvatars}`);
    console.log(`  📈 Percentual com avatares: ${((teamsWithAvatars / (teamsWithAvatars + teamsWithoutAvatars)) * 100).toFixed(1)}%`);
    
    if (teamsWithAvatars > 0) {
      console.log('\n🎉 Sucesso! A nova lógica de extração está funcionando!');
    } else {
      console.log('\n⚠️  Nenhum avatar foi encontrado. Verifique a estrutura dos dados.');
    }
    
  } catch (error) {
    console.error('❌ Erro ao testar extração:', error);
  }
}

// Executar teste
testAvatarExtraction();