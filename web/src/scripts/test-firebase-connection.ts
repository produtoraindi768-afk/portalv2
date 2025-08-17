import { config } from 'dotenv'
import { resolve } from 'path'
import { getClientFirestore } from '../lib/safeFirestore'
import { collection, getDocs } from 'firebase/firestore'

// Carregar variáveis de ambiente do arquivo .env.local
const envPath = resolve(process.cwd(), '.env.local')
console.log('📁 Tentando carregar arquivo:', envPath)
config({ path: envPath })

async function testFirebaseConnection() {
  console.log('🔍 Testando conexão com Firebase...')
  
  // Verificar se as variáveis estão carregadas
  console.log('📋 Variáveis de ambiente:')
  console.log('API_KEY:', process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? '✅ Configurada' : '❌ Não configurada')
  console.log('PROJECT_ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? '✅ Configurada' : '❌ Não configurada')
  
  try {
    const db = getClientFirestore()
    
    if (!db) {
      console.log('❌ Firestore não está disponível')
      console.log('Verifique se as variáveis de ambiente estão configuradas:')
      console.log('- NEXT_PUBLIC_FIREBASE_API_KEY')
      console.log('- NEXT_PUBLIC_FIREBASE_PROJECT_ID')
      return
    }
    
    console.log('✅ Firestore conectado com sucesso!')
    
    // Testar uma consulta simples
    console.log('🔍 Testando consulta na coleção "tournaments"...')
    const tournamentsCollection = collection(db, 'tournaments')
    const snapshot = await getDocs(tournamentsCollection)
    
    console.log(`✅ Consulta bem-sucedida! Encontrados ${snapshot.size} documentos`)
    
    if (snapshot.size > 0) {
      console.log('📋 Documentos encontrados:')
      snapshot.docs.forEach((doc, index) => {
        const data = doc.data()
        console.log(`${index + 1}. ${data.name || 'Sem nome'} (ID: ${doc.id})`)
      })
    } else {
      console.log('📭 Nenhum documento encontrado na coleção "tournaments"')
    }
    
  } catch (error) {
    console.error('❌ Erro ao testar conexão:', error)
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  testFirebaseConnection()
}

export { testFirebaseConnection }
