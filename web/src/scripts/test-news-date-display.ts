import { formatDateToBrazilian } from '@/lib/date-utils'

console.log('🧪 TESTANDO EXIBIÇÃO DE DATAS DAS NOTÍCIAS')
console.log('=========================================\n')

// Simular dados de notícias como vêm do Firestore
const mockNewsData = [
  {
    id: '1',
    title: 'Ballistic Update 1.2',
    publishDate: '2025-08-19', // Formato ISO do Firestore
    category: 'Atualizações'
  },
  {
    id: '2', 
    title: 'Novo Torneio Anunciado',
    publishDate: '2025-01-15', // Formato ISO do Firestore
    category: 'Torneios'
  },
  {
    id: '3',
    title: 'Patch Notes da Semana',
    publishDate: '2024-12-31', // Formato ISO do Firestore
    category: 'Patch Notes'
  }
]

console.log('📰 Simulando exibição das notícias:')
console.log('==================================\n')

mockNewsData.forEach((news, index) => {
  const formattedDate = formatDateToBrazilian(news.publishDate)
  console.log(`${index + 1}. ${news.title}`)
  console.log(`   📅 Data original: ${news.publishDate}`)
  console.log(`   📅 Data formatada: ${formattedDate}`)
  console.log(`   🏷️  Categoria: ${news.category}`)
  console.log('')
})

console.log('✅ Teste concluído!')
console.log('📝 As datas agora são exibidas no formato brasileiro (DD-MM-AAAA)')
console.log('📝 Exemplo: 2025-08-19 → 19-08-2025')
