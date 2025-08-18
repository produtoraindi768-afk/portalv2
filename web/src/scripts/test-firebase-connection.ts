import { config } from 'dotenv'
import { resolve } from 'path'

// Carregar variáveis de ambiente do arquivo .env.local
config({ path: resolve(process.cwd(), '.env.local') })

async function testFirebaseConnection() {
  console.log('🧪 Teste de Conexão Firebase - Básico\n')

  // Verificar variáveis de ambiente
  console.log('📋 Variáveis de Ambiente:')
  const envVars = {
    'NEXT_PUBLIC_FIREBASE_API_KEY': process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN': process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID': process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET': process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID': process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    'NEXT_PUBLIC_FIREBASE_APP_ID': process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  }

  Object.entries(envVars).forEach(([key, value]) => {
    if (value) {
      console.log(`✅ ${key}: ${value.substring(0, 20)}...`)
    } else {
      console.log(`❌ ${key}: Não configurado`)
    }
  })

  // Verificar se todas as variáveis estão configuradas
  const allConfigured = Object.values(envVars).every(Boolean)
  console.log(`\n📊 Status: ${allConfigured ? '✅ Todas configuradas' : '❌ Faltando variáveis'}`)

  if (!allConfigured) {
    console.log('\n💡 Soluções:')
    console.log('1. Verifique se o arquivo .env.local existe na raiz do projeto web/')
    console.log('2. Confirme se todas as variáveis estão configuradas')
    console.log('3. Reinicie o servidor após alterar as variáveis')
    return
  }

  console.log('\n🚀 Testando importação do Firebase...')
  
  try {
    // Testar importação do Firebase
    const { getFirebaseApp } = await import('../lib/firebase')
    console.log('✅ Importação do Firebase: OK')
    
    // Testar inicialização do app
    const app = getFirebaseApp()
    console.log('✅ Firebase App inicializado:', app.name)
    
    // Testar importação do Firestore
    const { getClientFirestore } = await import('../lib/safeFirestore')
    console.log('✅ Importação do Firestore: OK')
    
    // Testar obtenção do Firestore
    const db = getClientFirestore()
    if (db) {
      console.log('✅ Firestore obtido com sucesso')
    } else {
      console.log('❌ Firestore retornou null')
    }
    
  } catch (error) {
    console.error('❌ Erro ao testar Firebase:', error)
  }

  console.log('\n🔍 Teste concluído!')
}

// Executar teste
testFirebaseConnection().catch(console.error)
