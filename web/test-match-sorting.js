// Teste da ordenação de partidas por completedAt e scheduledDate

// Dados de exemplo simulando partidas do Battlefy
const mockMatches = [
  {
    id: '1',
    source: 'battlefy',
    battlefyId: '68a65565c7e45b0076e5f86f',
    completedAt: '2025-08-21T01:03:47.244Z',
    scheduledDate: '2025-08-20T20:00:00.000Z',
    status: 'finished',
    matchNumber: 10
  },
  {
    id: '2', 
    source: 'battlefy',
    battlefyId: '68a65565c7e45b0076e5f870',
    completedAt: '2025-08-21T02:15:30.123Z',
    scheduledDate: '2025-08-20T21:00:00.000Z',
    status: 'finished',
    matchNumber: 11
  },
  {
    id: '3',
    source: 'battlefy', 
    battlefyId: '68a65565c7e45b0076e5f871',
    scheduledDate: '2025-08-21T18:00:00.000Z',
    status: 'scheduled',
    matchNumber: 12
  },
  {
    id: '4',
    source: 'seed',
    scheduledDate: '2025-08-21T19:00:00.000Z',
    status: 'scheduled'
  },
  {
    id: '5',
    source: 'battlefy',
    battlefyId: '68a65565c7e45b0076e5f872',
    completedAt: '2025-08-20T23:45:15.789Z',
    scheduledDate: '2025-08-20T19:00:00.000Z', 
    status: 'finished',
    matchNumber: 9
  }
];

console.log('🔍 Testando ordenação de partidas por completedAt/scheduledDate...');
console.log('\n📋 Partidas antes da ordenação:');
mockMatches.forEach((match, index) => {
  console.log(`${index + 1}. ID: ${match.id} | completedAt: ${match.completedAt || 'N/A'} | scheduledDate: ${match.scheduledDate || 'N/A'} | Status: ${match.status}`);
});

// Aplicar a mesma lógica de ordenação do hook
const sortedMatches = mockMatches.sort((a, b) => {
  // Primeiro critério: partidas finalizadas (com completedAt) vêm primeiro
  const aIsFinished = a.status === 'finished' && a.completedAt;
  const bIsFinished = b.status === 'finished' && b.completedAt;
  
  if (aIsFinished && !bIsFinished) return -1;
  if (!aIsFinished && bIsFinished) return 1;
  
  // Segundo critério: ordenar por data (completedAt para finalizadas, scheduledDate para outras)
  const dateA = a.completedAt || a.scheduledDate || '';
  const dateB = b.completedAt || b.scheduledDate || '';
  return dateB.localeCompare(dateA);
});

console.log('\n✅ Partidas após ordenação (mais recentes primeiro):');
sortedMatches.forEach((match, index) => {
  const primaryDate = match.completedAt || match.scheduledDate || 'N/A';
  const dateType = match.completedAt ? 'completedAt' : 'scheduledDate';
  console.log(`${index + 1}. ID: ${match.id} | ${dateType}: ${primaryDate} | Status: ${match.status}`);
});

console.log('\n📊 Análise da ordenação:');
console.log('- Partidas finalizadas (com completedAt) devem aparecer primeiro, ordenadas por data de conclusão (mais recentes primeiro)');
console.log('- Partidas agendadas (sem completedAt) devem aparecer depois, ordenadas por data agendada (mais recentes primeiro)');
console.log('- Ordem esperada: ID 2 (02:15) → ID 1 (01:03) → ID 5 (23:45) → ID 4 (19:00) → ID 3 (18:00)');

const actualOrder = sortedMatches.map(m => m.id).join(' → ');
console.log(`- Ordem obtida: ${actualOrder}`);

// Verificar se a ordenação está correta
const expectedOrder = ['2', '1', '5', '4', '3'];
const isCorrect = sortedMatches.every((match, index) => match.id === expectedOrder[index]);

if (isCorrect) {
  console.log('\n✅ Ordenação está funcionando corretamente!');
} else {
  console.log('\n❌ Ordenação não está funcionando como esperado.');
}

console.log('\n🎯 Implementação concluída: partidas agora são ordenadas por completedAt (prioridade) ou scheduledDate (fallback).');