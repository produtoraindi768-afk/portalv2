import { format, differenceInDays, isPast } from 'date-fns'
import { ptBR } from 'date-fns/locale'

// Datas fornecidas pelo usuário
const userTournament = {
  name: "Torneio do Usuário",
  startDate: "2025-01-29T21:00:00.000-03:00", // 29 de janeiro às 21h (UTC-3)
  endDate: "2025-01-30T21:00:00.000-03:00",   // 30 de janeiro às 21h (UTC-3)
  registrationDeadline: "2025-01-11T21:00:00.000-03:00" // 11 de janeiro às 21h (UTC-3)
}

// Função para calcular status real (igual ao componente)
function calculateRealStatus(startDate: string, endDate: string, currentDate: Date) {
  const now = currentDate.getTime()
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
function getStatusConfig(status: string, startDate: string, currentDate: Date) {
  const start = new Date(startDate)
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

// Testar com as datas do usuário
console.log('🎯 TESTANDO DATAS ESPECÍFICAS DO USUÁRIO')
console.log('========================================\n')

const currentDate = new Date()
console.log(`📅 Data atual: ${format(currentDate, 'dd/MM/yyyy HH:mm', { locale: ptBR })}`)
console.log(`🌍 Timezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}`)
console.log(`⏰ UTC Offset: ${currentDate.getTimezoneOffset() / -60}h\n`)

console.log(`🏆 ${userTournament.name}`)
console.log(`   📅 Início: ${format(new Date(userTournament.startDate), 'dd/MM/yyyy HH:mm', { locale: ptBR })}`)
console.log(`   🏁 Fim: ${format(new Date(userTournament.endDate), 'dd/MM/yyyy HH:mm', { locale: ptBR })}`)
console.log(`   ⏰ Deadline: ${format(new Date(userTournament.registrationDeadline), 'dd/MM/yyyy HH:mm', { locale: ptBR })}`)

const realStatus = calculateRealStatus(userTournament.startDate, userTournament.endDate, currentDate)
const statusConfig = getStatusConfig(realStatus, userTournament.startDate, currentDate)

console.log(`\n🎯 Status Atual: ${realStatus.toUpperCase()}`)
console.log(`🏷️  Badge: ${statusConfig.icon} ${statusConfig.text}`)
console.log(`🎨 Cor: ${statusConfig.color}`)

// Calcular dias até início/fim
const daysUntilStart = differenceInDays(new Date(userTournament.startDate), currentDate)
const daysUntilEnd = differenceInDays(new Date(userTournament.endDate), currentDate)
const registrationClosed = isPast(new Date(userTournament.registrationDeadline))

console.log(`\n⏳ Dias até início: ${daysUntilStart}`)
console.log(`⏳ Dias até fim: ${daysUntilEnd}`)
console.log(`🚫 Inscrições fechadas: ${registrationClosed ? 'Sim' : 'Não'}`)

// Simular diferentes datas para mostrar a transição
console.log('\n🔄 SIMULAÇÃO DE TRANSIÇÃO DE STATUS')
console.log('===================================')

const testDates = [
  { name: "Hoje (17/08/2025)", date: new Date() },
  { name: "10 de Janeiro 2025", date: new Date("2025-01-10T21:00:00.000-03:00") },
  { name: "11 de Janeiro 2025 (Deadline)", date: new Date("2025-01-11T21:00:00.000-03:00") },
  { name: "12 de Janeiro 2025", date: new Date("2025-01-12T21:00:00.000-03:00") },
  { name: "28 de Janeiro 2025", date: new Date("2025-01-28T21:00:00.000-03:00") },
  { name: "29 de Janeiro 2025 (Início)", date: new Date("2025-01-29T21:00:00.000-03:00") },
  { name: "30 de Janeiro 2025 (Fim)", date: new Date("2025-01-30T21:00:00.000-03:00") },
  { name: "31 de Janeiro 2025", date: new Date("2025-01-31T21:00:00.000-03:00") }
]

testDates.forEach(({ name, date }) => {
  const simulatedStatus = calculateRealStatus(userTournament.startDate, userTournament.endDate, date)
  const simulatedConfig = getStatusConfig(simulatedStatus, userTournament.startDate, date)
  
  console.log(`\n📅 ${name}`)
  console.log(`   🎯 Status: ${simulatedStatus.toUpperCase()}`)
  console.log(`   🏷️  Badge: ${simulatedConfig.icon} ${simulatedConfig.text}`)
  console.log(`   🎨 Cor: ${simulatedConfig.color}`)
})

console.log('\n✅ Simulação concluída!')
console.log('\n📋 Resumo da Transição:')
console.log('1. 📅 EM BREVE: Até 29 de janeiro às 21h')
console.log('2. 🔴 AO VIVO: 29 de janeiro às 21h até 30 de janeiro às 21h')
console.log('3. 🏁 FINALIZADO: Após 30 de janeiro às 21h')
console.log('\n🎯 O sistema agora é inteligente e muda automaticamente!') 