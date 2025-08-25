// 🔍 Script para verificar a estrutura do rawData nos times
// Este script analisa como o logoUrl está estruturado no rawData

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore';

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
 * Função para analisar a estrutura do rawData
 */
async function analyzeRawDataStructure() {
  try {
    console.log('🔍 Analisando estrutura do rawData...');
    
    // Buscar alguns times para análise
    const teamsCollection = collection(db, 'battlefy_teams');
    const teamsSnapshot = await getDocs(teamsCollection);
    
    console.log(`📊 Total de times encontrados: ${teamsSnapshot.size}`);
    
    let count = 0;
    // Analisar os primeiros 3 times
    for (const teamDoc of teamsSnapshot.docs) {
      if (count >= 3) break;
      
      const teamData = teamDoc.data();
      const teamName = teamData.name;
      
      console.log(`\n🔍 Analisando time: ${teamName}`);
      console.log(`📄 ID do documento: ${teamDoc.id}`);
      
      // Verificar se rawData existe
      if (teamData.rawData) {
        console.log('✅ rawData existe');
        
        // Verificar tipo do rawData
        const rawDataType = typeof teamData.rawData;
        console.log(`📝 Tipo do rawData: ${rawDataType}`);
        
        let parsedRawData = null;
        
        if (rawDataType === 'object') {
          parsedRawData = teamData.rawData;
          console.log('📦 rawData já é um objeto');
        } else if (rawDataType === 'string') {
          try {
            parsedRawData = JSON.parse(teamData.rawData);
            console.log('📦 rawData parseado de string para objeto');
          } catch (error) {
            console.log('❌ Erro ao parsear rawData:', error.message);
            continue;
          }
        }
        
        if (parsedRawData) {
          // Verificar estrutura do rawData
          console.log('🔍 Estrutura do rawData:');
          
          // Verificar logoUrl direto
          if (parsedRawData.logoUrl) {
            console.log(`  ✅ rawData.logoUrl: ${parsedRawData.logoUrl}`);
          } else {
            console.log('  ❌ rawData.logoUrl não encontrado');
          }
          
          // Verificar persistentTeam
          if (parsedRawData.persistentTeam) {
            console.log('  ✅ rawData.persistentTeam existe');
            
            if (parsedRawData.persistentTeam.logoUrl) {
              console.log(`  ✅ rawData.persistentTeam.logoUrl: ${parsedRawData.persistentTeam.logoUrl}`);
            } else {
              console.log('  ❌ rawData.persistentTeam.logoUrl não encontrado');
            }
            
            // Verificar logo.url
            if (parsedRawData.persistentTeam.logo && parsedRawData.persistentTeam.logo.url) {
              console.log(`  ✅ rawData.persistentTeam.logo.url: ${parsedRawData.persistentTeam.logo.url}`);
            } else {
              console.log('  ❌ rawData.persistentTeam.logo.url não encontrado');
            }
          } else {
            console.log('  ❌ rawData.persistentTeam não encontrado');
          }
          
          // Mostrar todas as chaves do rawData
          console.log('🔑 Chaves disponíveis no rawData:');
          Object.keys(parsedRawData).forEach(key => {
            console.log(`  - ${key}`);
          });
        }
      } else {
        console.log('❌ rawData não existe');
      }
      
      count++;
    }
    
  } catch (error) {
    console.error('❌ Erro ao analisar rawData:', error);
  }
}

// Executar análise
analyzeRawDataStructure();