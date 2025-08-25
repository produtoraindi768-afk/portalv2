// Teste da extração de completedAt para partidas bye usando updatedAt

// Dados de exemplo simulando partidas bye e normais do Battlefy
const mockBattlefyMatches = [
  {
    id: '1',
    rawData: {
      _id: '68ab6fdf8f064a05540eb700',
      isBye: true,
      isComplete: true,
      matchNumber: 15,
      matchType: 'winner',
      roundNumber: 1,
      createdAt: '2025-08-24T20:02:39.612Z',
      updatedAt: '2025-08-24T20:02:39.922Z',
      top: {
        disqualified: false,
        seedNumber: 6,
        teamID: '68ab611ed039110562855bf9',
        winner: true
      },
      bottom: {
        disqualified: false,
        winner: false,
        isBye: true
      }
    }
  },
  {
    id: '2',
    rawData: {
      _id: '68ab6fdf8f064a05540eb701',
      isBye: false,
      isComplete: true,
      matchNumber: 16,
      matchType: 'winner',
      roundNumber: 1,
      createdAt: '2025-08-24T19:30:15.123Z',
      completedAt: '2025-08-24T20:45:30.456Z',
      updatedAt: '2025-08-24T20:45:35.789Z',
      top: {
        disqualified: false,
        teamID: '68ab611ed039110562855bf8',
        winner: true,
        score: 2
      },
      bottom: {
        disqualified: false,
        teamID: '68ab611ed039110562855bf7',
        winner: false,
        score: 1
      }
    }
  },
  {
    id: '3',
    rawData: {
      _id: '68ab6fdf8f064a05540eb702',
      isBye: false,
      isComplete: false,
      matchNumber: 17,
      matchType: 'winner',
      roundNumber: 2,
      createdAt: '2025-08-24T21:00:00.000Z',
      scheduledTime: '2025-08-24T22:00:00.000Z',
      top: {
        teamID: '68ab611ed039110562855bf6'
      },
      bottom: {
        teamID: '68ab611ed039110562855bf5'
      }
    }
  }
];

// Simular a lógica de extração do completedAt do hook
function extractCompletedAt(rawDataParsed, isBye) {
  // Para partidas bye, usar updatedAt como data de conclusão
  if (isBye && typeof rawDataParsed.updatedAt === 'string') {
    return rawDataParsed.updatedAt;
  }
  // Para partidas normais, usar completedAt
  return typeof rawDataParsed.completedAt === 'string' ? rawDataParsed.completedAt : undefined;
}

console.log('🔍 Testando extração de completedAt para partidas bye e normais...');
console.log('');

mockBattlefyMatches.forEach((match, index) => {
  const rawData = match.rawData;
  const isBye = rawData.isBye === true || 
                (rawData.top?.isBye === true || rawData.bottom?.isBye === true);
  
  const extractedCompletedAt = extractCompletedAt(rawData, isBye);
  
  console.log(`📋 Partida ${index + 1} (ID: ${match.id}):`);
  console.log(`   - isBye: ${isBye}`);
  console.log(`   - isComplete: ${rawData.isComplete}`);
  console.log(`   - createdAt: ${rawData.createdAt || 'N/A'}`);
  console.log(`   - completedAt: ${rawData.completedAt || 'N/A'}`);
  console.log(`   - updatedAt: ${rawData.updatedAt || 'N/A'}`);
  console.log(`   - scheduledTime: ${rawData.scheduledTime || 'N/A'}`);
  console.log(`   ✅ Extracted completedAt: ${extractedCompletedAt || 'N/A'}`);
  
  if (isBye && extractedCompletedAt === rawData.updatedAt) {
    console.log(`   ✅ Correto: Partida bye usando updatedAt`);
  } else if (!isBye && extractedCompletedAt === rawData.completedAt) {
    console.log(`   ✅ Correto: Partida normal usando completedAt`);
  } else if (!isBye && !rawData.completedAt && !extractedCompletedAt) {
    console.log(`   ✅ Correto: Partida não finalizada sem completedAt`);
  } else {
    console.log(`   ❌ Erro na extração`);
  }
  
  console.log('');
});

console.log('📊 Resumo da lógica:');
console.log('- Partidas bye (isBye: true) → usar updatedAt como completedAt');
console.log('- Partidas normais finalizadas → usar completedAt');
console.log('- Partidas não finalizadas → completedAt undefined');
console.log('');
console.log('🎯 Implementação atualizada: partidas bye agora usam updatedAt para ordenação cronológica.');