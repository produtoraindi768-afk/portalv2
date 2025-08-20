import { formatDateToBrazilian, formatDateToBrazilianWithSlashes } from '@/lib/date-utils'

console.log('🧪 TESTANDO FORMATAÇÃO DE DATAS BRASILEIRAS')
console.log('==========================================\n')

// Casos de teste
const testCases = [
  '2025-08-19',
  '2025-01-15',
  '2024-12-31',
  '2025-08-19T10:30:00.000Z',
  '2025-08-19T10:30:00.000-03:00',
  '',
  undefined,
  'invalid-date',
  '19-08-2025' // Já no formato brasileiro
]

console.log('📅 Formato com hífens (DD-MM-AAAA):')
testCases.forEach((testCase, index) => {
  const result = formatDateToBrazilian(testCase)
  console.log(`${index + 1}. "${testCase}" → "${result}"`)
})

console.log('\n📅 Formato com barras (DD/MM/AAAA):')
testCases.forEach((testCase, index) => {
  const result = formatDateToBrazilianWithSlashes(testCase)
  console.log(`${index + 1}. "${testCase}" → "${result}"`)
})

console.log('\n✅ Teste concluído!')
