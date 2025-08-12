import { seedDataWithAdmin } from '../lib/firebase-admin'
import { firestoreHelpers } from '../lib/firestore-helpers'

/**
 * Script para popular o Firebase com dados de exemplo
 * Baseado nas estruturas definidas em PROJETO_SEED_DATA.md
 * 
 * Uso:
 * npm run seed-data
 */

async function main() {
  console.log('🚀 Iniciando seed do Firebase...')
  console.log('📄 Usando estruturas do PROJETO_SEED_DATA.md')
  console.log('🔧 Projeto: dashboard-f0217\n')

  try {
    // Usar Admin SDK para seed
    const success = await seedDataWithAdmin()
    
    if (success) {
      console.log('✅ Seed de dados completado com sucesso!')
      console.log('\n📊 Collections criadas:')
      console.log('- news (notícias)')
      console.log('- streamers (streamers em destaque)')
      console.log('- tournaments (torneios)')
      console.log('- teams (equipes)')
      console.log('\n🎯 Dados de exemplo prontos para uso!')
      
      // Testar se é possível acessar via client SDK também
      console.log('\n🧪 Testando acesso via client SDK...')
      const clientNews = await firestoreHelpers.getPublishedNews(1)
      if (clientNews && clientNews.docs.length > 0) {
        console.log('✅ Client SDK funcionando - dados acessíveis')
      } else {
        console.log('⚠️ Client SDK precisa de configuração adicional')
      }
      
    } else {
      console.error('❌ Falha no seed de dados')
      process.exit(1)
    }
  } catch (error) {
    console.error('❌ Erro durante o seed:', error)
    process.exit(1)
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main().then(() => {
    console.log('\n🏁 Script finalizado')
    process.exit(0)
  })
}

export { main as seedFirebaseData }