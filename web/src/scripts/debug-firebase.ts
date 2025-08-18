import { config } from 'dotenv'
import { resolve } from 'path'
import { firestoreHelpers } from '../lib/firestore-helpers'

// Carregar variáveis de ambiente do arquivo .env.local
config({ path: resolve(process.cwd(), '.env.local') })

async function debugFirebase() {
  console.log('🔍 Debug Firebase - Verificando configuração...\n')

  // Verificar variáveis de ambiente
  console.log('📋 Variáveis de Ambiente:')
  console.log('NEXT_PUBLIC_FIREBASE_API_KEY:', process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? '✅ Configurado' : '❌ Não configurado')
  console.log('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:', process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? '✅ Configurado' : '❌ Não configurado')
  console.log('NEXT_PUBLIC_FIREBASE_PROJECT_ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? '✅ Configurado' : '❌ Não configurado')
  console.log('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET:', process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ? '✅ Configurado' : '❌ Não configurado')
  console.log('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:', process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ? '✅ Configurado' : '❌ Não configurado')
  console.log('NEXT_PUBLIC_FIREBASE_APP_ID:', process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? '✅ Configurado' : '❌ Não configurado')

  console.log('\n🚀 Testando conexão com Firebase...')

  try {
    // Testar busca de torneios
    console.log('📡 Buscando torneios...')
    const tournamentsSnapshot = await firestoreHelpers.getAllTournaments()
    
    if (tournamentsSnapshot) {
      if (tournamentsSnapshot.empty) {
        console.log('✅ Firebase conectado, mas nenhum torneio encontrado')
        console.log('💡 Execute: npm run seed:tournaments')
      } else {
        console.log(`✅ Firebase conectado! ${tournamentsSnapshot.size} torneios encontrados`)
        
        // Mostrar alguns dados de exemplo
        const firstTournament = tournamentsSnapshot.docs[0].data()
        console.log('\n📊 Exemplo de torneio:')
        console.log('Nome:', firstTournament.name)
        console.log('Jogo:', firstTournament.game)
        console.log('Status:', firstTournament.status)
        console.log('Taxa:', firstTournament.entryFee === 0 ? 'Gratuito' : `R$ ${firstTournament.entryFee}`)
      }
    } else {
      console.log('❌ Erro: Não foi possível conectar ao Firebase')
      console.log('💡 Verifique:')
      console.log('   - Se as variáveis de ambiente estão corretas')
      console.log('   - Se o projeto Firebase está ativo')
      console.log('   - Se o Firestore está habilitado')
    }
  } catch (error) {
    console.error('❌ Erro ao conectar com Firebase:', error)
    console.log('\n💡 Possíveis soluções:')
    console.log('1. Verifique se o arquivo .env.local existe na raiz do projeto')
    console.log('2. Confirme se as variáveis estão corretas')
    console.log('3. Reinicie o servidor após alterar as variáveis')
    console.log('4. Verifique se o projeto Firebase está ativo')
  }

  console.log('\n🔍 Debug concluído!')
}

// Executar debug
debugFirebase().catch(console.error) 