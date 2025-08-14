import { initializeApp } from 'firebase/app'
import { getAuth, OAuthProvider, signInWithPopup } from 'firebase/auth'
import { getFirestore, doc, setDoc } from 'firebase/firestore'

// Configuração do Firebase (substitua pelas suas credenciais)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

async function testEpicAuth() {
  try {
    console.log('🚀 Iniciando teste da autenticação Epic Games...')
    
    // Inicializar Firebase
    const app = initializeApp(firebaseConfig)
    const auth = getAuth(app)
    const db = getFirestore(app)
    
    console.log('✅ Firebase inicializado')
    
    // Configurar provider Epic Games
    const provider = new OAuthProvider("oidc.epic")
    provider.addScope('basic_profile')
    
    console.log('✅ Provider Epic Games configurado')
    
    // Simular dados de teste (em um ambiente real, isso viria do popup)
    const testUserData = {
      uid: 'test-epic-user-' + Date.now(),
      email: 'test@epicgames.com',
      displayName: 'Test Epic User',
      photoURL: 'https://example.com/avatar.jpg',
      provider: 'epic',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      epicAccountId: 'test-account-id',
      epicDisplayName: 'Test Epic User',
      epicUsername: 'testepicuser',
      epicProfile: {
        accountId: 'test-account-id',
        displayName: 'Test Epic User',
        username: 'testepicuser',
        country: 'BR',
        preferredLanguage: 'pt-BR'
      },
      playerProfile: {
        username: 'testepicuser',
        displayName: 'Test Epic User',
        avatar: 'https://example.com/avatar.jpg',
        bio: 'Jogador de teste',
        country: 'BR',
        joinDate: new Date().toISOString(),
        isVerified: false,
        socialLinks: {}
      },
      playerStats: {
        totalMatches: 0,
        wins: 0,
        winRate: 0,
        killDeathRatio: 0,
        averagePlacement: 0,
        totalKills: 0,
        totalDeaths: 0
      },
      playerTeams: []
    }
    
    // Salvar dados de teste no Firestore
    await setDoc(doc(db, 'users', testUserData.uid), testUserData)
    
    console.log('✅ Dados de teste salvos no Firestore')
    console.log('📊 Dados salvos:', JSON.stringify(testUserData, null, 2))
    
    console.log('🎉 Teste concluído com sucesso!')
    console.log('📝 Próximos passos:')
    console.log('1. Configure as credenciais Epic Games no Firebase Console')
    console.log('2. Configure as URLs de redirecionamento no Epic Games Developer Portal')
    console.log('3. Teste o login real na aplicação')
    
  } catch (error) {
    console.error('❌ Erro no teste:', error)
  }
}

// Executar teste se chamado diretamente
if (require.main === module) {
  testEpicAuth()
}

export { testEpicAuth }
