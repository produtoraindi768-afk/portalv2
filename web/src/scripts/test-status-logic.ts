import { format, differenceInDays, isPast } from 'date-fns'
import { ptBR } from 'date-fns/locale'

// Simular dados de torneio para teste
const testTournaments = [
  {
    name: "Torneio Futuro",
    startDate: "2025-02-15T21:00:00.000Z", // 15 de fevereiro de 2025
    endDate: "2025-02-17T21:00:00.000Z",
    registrationDeadline: "2025-02-10T21:00:00.000Z"
  },
  {
    name: "Torneio Hoje",
    startDate: new Date().toISOString(), // Hoje
    endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 dias depois
    registrationDeadline: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() // 1 dia atrás
  },
  {
    name: "Torneio Em Andamento",
    startDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 dia atrás
    endDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 dia depois
    registrationDeadline: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2 dias atrás
  },
  {
    name: "Torneio Finalizado",
    startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 dias atrás
    endDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 dias atrás
    registrationDeadline: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() // 7 dias atrás
  }
]

// Função para calcular status real (igual ao componente)
function calculateRealStatus(startDate: string, endDate: string) {
  const now = new Date().getTime()
  const start = new Date(startDate).getTime()
  const end = new Date(endDate).getTime()
  
  if (now < start) {
    return 'upcoming' // Torneio ainda não começou
  } else if (now >= start && now <= end) {
    return 'ongoing' // Torneio em andamento
  } else {
    return 'finished' // Torneio já terminou
  }
}

// Função para obter configuração do status
function getStatusConfig(status: string, startDate: string) {
  const start = new Date(startDate)
  const currentDate = new Date()
  const isToday = format(start, 'yyyy-MM-dd') === format(currentDate, 'yyyy-MM-dd')
  
  switch (status) {
    case 'ongoing':
      return {
        color: 'bg-destructive/10 text-destructive border-destructive/20',
        text: 'AO VIVO',
        icon: '🔴'
      }
    case 'upcoming':
      return {
        color: isToday 
          ? 'bg-primary/10 text-primary border-primary/20' 
          : 'bg-chart-2/10 text-chart-2 border-chart-2/20',
        text: isToday ? 'HOJE' : 'EM BREVE',
        icon: isToday ? '⭐' : '📅'
      }
    case 'finished':
      return {
        color: 'bg-muted text-muted-foreground border-muted',
        text: 'FINALIZADO',
        icon: '🏁'
      }
    default:
      return {
        color: 'bg-muted text-muted-foreground border-muted',
        text: 'DESCONHECIDO',
        icon: '❓'
      }
  }
}

// Testar a lógica
console.log('🧪 TESTANDO LÓGICA DE STATUS DINÂMICO')
console.log('=====================================\n')

const currentDate = new Date()
console.log(`📅 Data atual: ${format(currentDate, 'dd/MM/yyyy HH:mm', { locale: ptBR })}`)
console.log(`🌍 Timezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}\n`)

testTournaments.forEach((tournament, index) => {
  console.log(`🏆 ${tournament.name}`)
  console.log(`   📅 Início: ${format(new Date(tournament.startDate), 'dd/MM/yyyy HH:mm', { locale: ptBR })}`)
  console.log(`   🏁 Fim: ${format(new Date(tournament.endDate), 'dd/MM/yyyy HH:mm', { locale: ptBR })}`)
  console.log(`   ⏰ Deadline: ${format(new Date(tournament.registrationDeadline), 'dd/MM/yyyy HH:mm', { locale: ptBR })}`)
  
  const realStatus = calculateRealStatus(tournament.startDate, tournament.endDate)
  const statusConfig = getStatusConfig(realStatus, tournament.startDate)
  
  console.log(`   🎯 Status: ${realStatus.toUpperCase()}`)
  console.log(`   🏷️  Badge: ${statusConfig.icon} ${statusConfig.text}`)
  console.log(`   🎨 Cor: ${statusConfig.color}`)
  
  // Calcular dias até início/fim
  const daysUntilStart = differenceInDays(new Date(tournament.startDate), currentDate)
  const daysUntilEnd = differenceInDays(new Date(tournament.endDate), currentDate)
  const registrationClosed = isPast(new Date(tournament.registrationDeadline))
  
  console.log(`   ⏳ Dias até início: ${daysUntilStart}`)
  console.log(`   ⏳ Dias até fim: ${daysUntilEnd}`)
  console.log(`   🚫 Inscrições fechadas: ${registrationClosed ? 'Sim' : 'Não'}`)
  
  console.log('')
})

console.log('✅ Teste concluído!')
console.log('\n📋 Resumo dos Status:')
console.log('- EM BREVE: Torneio ainda não começou')
console.log('- HOJE: Torneio começa hoje')
console.log('- AO VIVO: Torneio em andamento')
console.log('- FINALIZADO: Torneio já terminou') 