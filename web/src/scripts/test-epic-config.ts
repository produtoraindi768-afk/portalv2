import { initializeApp } from 'firebase/app'
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore'

// Configuração do Firebase
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

async function testEpicConfiguration() {
  try {
    console.log('🚀 Testando configuração da Epic Games...')
    
    // Inicializar Firebase
    const app = initializeApp(firebaseConfig)
    const db = getFirestore(app)
    
    console.log('✅ Firebase inicializado')
    console.log('📊 Configuração do projeto:', {
      projectId: firebaseConfig.projectId,
      authDomain: firebaseConfig.authDomain
    })
    
    // Testar conexão com Firestore
    const testDoc = doc(db, 'test', 'epic-config')
    await setDoc(testDoc, {
      test: true,
      timestamp: new Date().toISOString(),
      message: 'Teste de configuração Epic Games'
    })
    
    console.log('✅ Conexão com Firestore funcionando')
    
    // Ler o documento de teste
    const testDocSnap = await getDoc(testDoc)
    if (testDocSnap.exists()) {
      console.log('✅ Leitura do Firestore funcionando')
    }
    
    // Limpar documento de teste
    await setDoc(testDoc, {})
    
    console.log('\n📋 Credenciais Epic Games:')
    console.log('Client ID:', 'xyza7891Qu2npQYrklUzIfo9KZcQU2CV')
    console.log('Client Secret:', 'WKKgpsi/geAWUxyGbcCGcBgedCXNQTjFB/CDTrzuMmY')
    console.log('Product ID:', '0d9c72c4ff174443934da9bf51362aa4')
    console.log('Sandbox ID:', '40f9df87501d4449aaa2d01e381dd77d')
    console.log('Deployment ID:', '7c540a775c2146ada6342ffdf49fa403')
    
    console.log('\n🔧 Próximos passos para configurar:')
    console.log('1. Acesse o Firebase Console')
    console.log('2. Vá para Authentication > Sign-in method')
    console.log('3. Adicione um novo provedor OIDC')
    console.log('4. Configure:')
    console.log('   - Provider ID: oidc.epic')
    console.log('   - Client ID: xyza7891Qu2npQYrklUzIfo9KZcQU2CV')
    console.log('   - Client Secret: WKKgpsi/geAWUxyGbcCGcBgedCXNQTjFB/CDTrzuMmY')
    console.log('   - Issuer: https://api.epicgames.dev/epic/oauth/v1')
    console.log('5. Adicione URL de redirecionamento:')
    console.log('   https://dashboard-f0217.firebaseapp.com/__/auth/handler')
    
    console.log('\n🎮 No Epic Games Developer Portal:')
    console.log('1. Adicione a URL de redirecionamento:')
    console.log('   https://dashboard-f0217.firebaseapp.com/__/auth/handler')
    console.log('2. Verifique se o escopo basic_profile está habilitado')
    
    console.log('\n🧪 Para testar:')
    console.log('1. Execute: npm run dev')
    console.log('2. Acesse: http://localhost:3000/login')
    console.log('3. Clique no botão Epic Games')
    console.log('4. Verifique os dados salvos no Firestore')
    
    console.log('\n✅ Teste de configuração concluído com sucesso!')
    
  } catch (error) {
    console.error('❌ Erro no teste de configuração:', error)
    console.log('\n🔍 Verifique:')
    console.log('1. Se as variáveis de ambiente estão configuradas')
    console.log('2. Se o projeto Firebase está ativo')
    console.log('3. Se as regras do Firestore permitem escrita')
  }
}

// Executar teste se chamado diretamente
if (require.main === module) {
  testEpicConfiguration()
}

export { testEpicConfiguration }
