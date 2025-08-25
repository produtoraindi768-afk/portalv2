// 🏆 Sistema de Adição de Avatares para Times
// Este script adiciona avatares aos times existentes na coleção battlefy_teams

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';

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

// Avatares de exemplo para os times
const teamAvatars = {
  // Times genéricos com avatares de placeholder
  'MyGuyIsFree!': 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=400&fit=crop&crop=face',
  'FEAR': 'https://images.unsplash.com/photo-1566492031773-4f4e44671d66?w=400&h=400&fit=crop&crop=face',
  'Team Alpha': 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=400&fit=crop',
  'Team Beta': 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=400&fit=crop',
  'Team Gamma': 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=400&h=400&fit=crop',
  'Team Delta': 'https://images.unsplash.com/photo-1566492031773-4f4e44671d66?w=400&h=400&fit=crop',
  'Team Epsilon': 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=400&fit=crop',
  'Team Zeta': 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=400&fit=crop',
  'Team Eta': 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=400&h=400&fit=crop',
  'Team Theta': 'https://images.unsplash.com/photo-1566492031773-4f4e44671d66?w=400&h=400&fit=crop'
};

// Avatar padrão para times sem avatar específico
const defaultAvatar = 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=400&fit=crop&crop=face';

/**
 * Função principal para adicionar avatares aos times
 */
async function addTeamAvatars() {
  try {
    console.log('🔄 Iniciando adição de avatares aos times...');
    
    // Buscar todos os times
    const teamsCollection = collection(db, 'battlefy_teams');
    const teamsSnapshot = await getDocs(teamsCollection);
    
    console.log(`📊 Total de times encontrados: ${teamsSnapshot.size}`);
    
    let updatedCount = 0;
    let skippedCount = 0;
    
    // Processar cada time
    for (const teamDoc of teamsSnapshot.docs) {
      const teamData = teamDoc.data();
      const teamName = teamData.name;
      
      console.log(`\n🔍 Processando time: ${teamName}`);
      
      // Verificar se já tem avatar no rawData
      let hasExistingAvatar = false;
      if (teamData.rawData && typeof teamData.rawData === 'object') {
        // Verificar se já tem logoUrl na estrutura correta do Battlefy
        const hasLogoUrl = (teamData.rawData.persistentTeam && teamData.rawData.persistentTeam.logoUrl) ||
                          teamData.rawData.logoUrl || teamData.rawData.logo || teamData.rawData.avatar;
        
        if (hasLogoUrl) {
          hasExistingAvatar = true;
          console.log(`  ✅ Time já possui avatar no rawData`);
        }
      }
      
      // Verificar se já tem avatar no campo principal
      if (teamData.avatar || teamData.logo) {
        hasExistingAvatar = true;
        console.log(`  ✅ Time já possui avatar no campo principal`);
      }
      
      if (hasExistingAvatar) {
        skippedCount++;
        continue;
      }
      
      // Escolher avatar baseado no nome do time
      let avatarUrl = teamAvatars[teamName] || defaultAvatar;
      
      // Atualizar o documento com o avatar
      const teamDocRef = doc(db, 'battlefy_teams', teamDoc.id);
      
      // Atualizar tanto o campo avatar quanto o rawData.logoUrl
      const updateData = {
        avatar: avatarUrl,
        logoUrl: avatarUrl,
        'rawData.logoUrl': avatarUrl,
        updatedAt: new Date().toISOString()
      };
      
      await updateDoc(teamDocRef, updateData);
      
      console.log(`  ✅ Avatar adicionado: ${avatarUrl}`);
      updatedCount++;
    }
    
    console.log(`\n🎉 Processo concluído!`);
    console.log(`📊 Times atualizados: ${updatedCount}`);
    console.log(`⏭️ Times ignorados (já tinham avatar): ${skippedCount}`);
    
  } catch (error) {
    console.error('❌ Erro ao adicionar avatares:', error);
  }
}

/**
 * Função para listar times sem avatar
 */
async function listTeamsWithoutAvatar() {
  try {
    console.log('🔍 Listando times sem avatar...');
    
    const teamsCollection = collection(db, 'battlefy_teams');
    const teamsSnapshot = await getDocs(teamsCollection);
    
    const teamsWithoutAvatar = [];
    
    teamsSnapshot.forEach(doc => {
      const teamData = doc.data();
      const teamName = teamData.name;
      
      let hasAvatar = false;
      
      // Verificar avatar no rawData
      if (teamData.rawData && typeof teamData.rawData === 'object') {
        // Verificar se já tem logoUrl na estrutura correta do Battlefy
        const hasLogoUrl = (teamData.rawData.persistentTeam && teamData.rawData.persistentTeam.logoUrl) ||
                          teamData.rawData.logoUrl || teamData.rawData.logo || teamData.rawData.avatar;
        
        if (hasLogoUrl) {
          hasAvatar = true;
        }
      }
      
      // Verificar avatar no campo principal
      if (teamData.avatar || teamData.logo || teamData.logoUrl) {
        hasAvatar = true;
      }
      
      if (!hasAvatar) {
        teamsWithoutAvatar.push({
          id: doc.id,
          name: teamName,
          battlefyId: teamData.battlefyId,
          tournamentId: teamData.tournamentId
        });
      }
    });
    
    console.log(`\n📊 Times sem avatar: ${teamsWithoutAvatar.length}`);
    teamsWithoutAvatar.forEach(team => {
      console.log(`  - ${team.name} (ID: ${team.id})`);
    });
    
    return teamsWithoutAvatar;
    
  } catch (error) {
    console.error('❌ Erro ao listar times:', error);
    return [];
  }
}

/**
 * Função para verificar avatares existentes
 */
async function checkExistingAvatars() {
  try {
    console.log('🔍 Verificando avatares existentes...');
    
    const teamsCollection = collection(db, 'battlefy_teams');
    const teamsSnapshot = await getDocs(teamsCollection);
    
    let withAvatar = 0;
    let withoutAvatar = 0;
    
    teamsSnapshot.forEach(doc => {
      const teamData = doc.data();
      const teamName = teamData.name;
      
      let hasAvatar = false;
      let avatarSource = '';
      
      // Verificar avatar no rawData
      if (teamData.rawData && typeof teamData.rawData === 'object') {
        // Priorizar rawData.persistentTeam.logoUrl (estrutura real do Battlefy)
        if (teamData.rawData.persistentTeam && teamData.rawData.persistentTeam.logoUrl) {
          hasAvatar = true;
          avatarSource = 'rawData.persistentTeam.logoUrl';
        } else if (teamData.rawData.logoUrl) {
          hasAvatar = true;
          avatarSource = 'rawData.logoUrl';
        } else if (teamData.rawData.logo) {
          hasAvatar = true;
          avatarSource = 'rawData.logo';
        } else if (teamData.rawData.avatar) {
          hasAvatar = true;
          avatarSource = 'rawData.avatar';
        }
      }
      
      // Verificar avatar no campo principal
      if (!hasAvatar) {
        if (teamData.avatar) {
          hasAvatar = true;
          avatarSource = 'avatar';
        } else if (teamData.logo) {
          hasAvatar = true;
          avatarSource = 'logo';
        } else if (teamData.logoUrl) {
          hasAvatar = true;
          avatarSource = 'logoUrl';
        }
      }
      
      if (hasAvatar) {
        withAvatar++;
        console.log(`  ✅ ${teamName} - ${avatarSource}`);
      } else {
        withoutAvatar++;
        console.log(`  ❌ ${teamName} - sem avatar`);
      }
    });
    
    console.log(`\n📊 Resumo:`);
    console.log(`  ✅ Com avatar: ${withAvatar}`);
    console.log(`  ❌ Sem avatar: ${withoutAvatar}`);
    console.log(`  📈 Percentual com avatar: ${((withAvatar / (withAvatar + withoutAvatar)) * 100).toFixed(1)}%`);
    
  } catch (error) {
    console.error('❌ Erro ao verificar avatares:', error);
  }
}

// Executar as funções
if (process.argv.includes('--add')) {
  addTeamAvatars();
} else if (process.argv.includes('--list')) {
  listTeamsWithoutAvatar();
} else if (process.argv.includes('--check')) {
  checkExistingAvatars();
} else {
  console.log('🏆 Sistema de Adição de Avatares para Times');
  console.log('');
  console.log('Uso:');
  console.log('  node add-team-avatars.js --check   # Verificar avatares existentes');
  console.log('  node add-team-avatars.js --list    # Listar times sem avatar');
  console.log('  node add-team-avatars.js --add     # Adicionar avatares aos times');
  console.log('');
  console.log('Executando verificação por padrão...');
  checkExistingAvatars();
}

export { addTeamAvatars, listTeamsWithoutAvatar, checkExistingAvatars };