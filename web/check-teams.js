const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, limit, query } = require('firebase/firestore');

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

async function checkTeams() {
  try {
    console.log('🔍 Verificando times na coleção battlefy_teams...');
    
    const teamsRef = collection(db, 'battlefy_teams');
    const q = query(teamsRef, limit(2));
    const snapshot = await getDocs(q);
    
    console.log(`📊 Total de documentos encontrados: ${snapshot.size}`);
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      console.log('\n📄 Documento:', doc.id);
      console.log('  - Nome:', data.name);
      console.log('  - BattlefyId:', data.battlefyId);
      
      // Verificar se há logoUrl diretamente no documento
      if (data.logoUrl) {
        console.log('  ✅ LogoUrl encontrado:', data.logoUrl);
      } else {
        console.log('  ❌ LogoUrl não encontrado no documento');
      }
      
      // Verificar rawData
      if (data.rawData && typeof data.rawData === 'object') {
        console.log('\n  🔍 Analisando rawData...');
        
        // Verificar campos de logo no nível do time
        const logoFields = ['logoUrl', 'logo', 'avatar', 'image', 'teamLogo', 'logoImage'];
        let logoFound = false;
        
        logoFields.forEach(field => {
          if (data.rawData[field]) {
            console.log(`  ✅ ${field}:`, data.rawData[field]);
            logoFound = true;
          }
        });
        
        if (!logoFound) {
          console.log('  ❌ Nenhum campo de logo encontrado no rawData do time');
        }
        
        // Verificar se há logo nos dados do captain
        if (data.rawData.captain && typeof data.rawData.captain === 'object') {
          console.log('\n  👑 Verificando dados do captain...');
          logoFields.forEach(field => {
            if (data.rawData.captain[field]) {
              console.log(`  ✅ Captain ${field}:`, data.rawData.captain[field]);
            }
          });
        }
        
        // Verificar se há logo nos dados dos players
        if (data.rawData.players && Array.isArray(data.rawData.players)) {
          console.log(`\n  👥 Verificando ${data.rawData.players.length} jogadores...`);
          data.rawData.players.forEach((player, index) => {
            if (player && typeof player === 'object') {
              logoFields.forEach(field => {
                if (player[field]) {
                  console.log(`  ✅ Player ${index + 1} ${field}:`, player[field]);
                }
              });
            }
          });
        }
        
        // Verificar customFields
        if (data.rawData.customFields && typeof data.rawData.customFields === 'object') {
          console.log('\n  🎨 Verificando customFields...');
          const customKeys = Object.keys(data.rawData.customFields);
          console.log('  - CustomFields keys:', customKeys);
          
          customKeys.forEach(key => {
            const value = data.rawData.customFields[key];
            if (typeof value === 'string' && (value.includes('http') || value.includes('logo') || value.includes('avatar'))) {
              console.log(`  ✅ CustomField ${key}:`, value);
            }
          });
        }
      }
      
      console.log('\n' + '='.repeat(50));
    });
    
  } catch (error) {
    console.error('❌ Erro ao verificar times:', error);
  }
}

checkTeams().then(() => {
  console.log('\n✅ Verificação concluída');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Erro:', error);
  process.exit(1);
});