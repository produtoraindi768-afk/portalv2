# 🎯 Sistema de Status Dinâmico dos Torneios

## ✨ **Visão Geral**

O sistema agora calcula automaticamente o status dos torneios baseado nas datas reais, independente do campo `status` do banco de dados. Isso garante que o status seja sempre preciso e atualizado em tempo real.

## 🕐 **Como Funciona**

### **1. Cálculo Automático do Status**
```typescript
const calculateRealStatus = () => {
  const now = currentDate.getTime()
  const start = startDate.getTime()
  const end = endDate.getTime()
  
  if (now < start) {
    return 'upcoming' // Torneio ainda não começou
  } else if (now >= start && now <= end) {
    return 'ongoing' // Torneio em andamento
  } else {
    return 'finished' // Torneio já terminou
  }
}
```

### **2. Status Possíveis**
- **🟢 EM BREVE**: Torneio ainda não começou
- **⭐ HOJE**: Torneio começa hoje
- **🔴 AO VIVO**: Torneio em andamento
- **🏁 FINALIZADO**: Torneio já terminou

## 📅 **Exemplo com Suas Datas**

### **Torneio de Exemplo:**
```json
{
  "name": "Torneio Teste",
  "startDate": "2025-01-29T21:00:00.000-03:00", // 29 de janeiro às 21h (UTC-3)
  "endDate": "2025-01-30T21:00:00.000-03:00",   // 30 de janeiro às 21h (UTC-3)
  "registrationDeadline": "2025-01-11T21:00:00.000-03:00" // 11 de janeiro às 21h (UTC-3)
}
```

### **Status por Período:**

#### **📅 Até 28 de Janeiro (21h)**
- **Status**: `upcoming`
- **Badge**: 📅 EM BREVE
- **Cor**: Azul claro
- **Descrição**: Torneio ainda não começou

#### **📅 29 de Janeiro (21h) - 30 de Janeiro (21h)**
- **Status**: `ongoing`
- **Badge**: 🔴 AO VIVO
- **Cor**: Vermelho
- **Descrição**: Torneio em andamento

#### **📅 Após 30 de Janeiro (21h)**
- **Status**: `finished`
- **Badge**: 🏁 FINALIZADO
- **Cor**: Cinza
- **Descrição**: Torneio já terminou

## 🎨 **Configuração Visual dos Badges**

### **EM BREVE (Azul)**
```typescript
{
  color: 'bg-chart-2/10 text-chart-2 border-chart-2/20',
  text: 'EM BREVE',
  icon: '📅'
}
```

### **HOJE (Azul Primário)**
```typescript
{
  color: 'bg-primary/10 text-primary border-primary/20',
  text: 'HOJE',
  icon: '⭐'
}
```

### **AO VIVO (Vermelho)**
```typescript
{
  color: 'bg-destructive/10 text-destructive border-destructive/20',
  text: 'AO VIVO',
  icon: '🔴'
}
```

### **FINALIZADO (Cinza)**
```typescript
{
  color: 'bg-muted text-muted-foreground border-muted',
  text: 'FINALIZADO',
  icon: '🏁'
}
```

## 🔧 **Implementação Técnica**

### **1. Cálculo em Tempo Real**
- **Data atual** vs. **startDate** vs. **endDate**
- **Timezone** local do usuário
- **Atualização automática** a cada renderização

### **2. Independência do Banco**
- **Não depende** do campo `status` do Firestore
- **Sempre preciso** baseado nas datas reais
- **Atualização automática** sem necessidade de sincronização

### **3. Fallbacks Inteligentes**
- **Inscrições fechadas**: Baseado em `registrationDeadline`
- **Progresso do torneio**: Calculado dinamicamente
- **Contagem regressiva**: Dias até início/fim

## 🧪 **Testando o Sistema**

### **1. Executar Teste de Status**
```bash
cd web
npm run test:status
```

### **2. Verificar na Interface**
1. **Acesse** `/torneios`
2. **Observe** os badges de status
3. **Confirme** que mudam conforme a data
4. **Teste** com diferentes datas

### **3. Cenários de Teste**
- **Torneio futuro**: Deve mostrar "EM BREVE"
- **Torneio hoje**: Deve mostrar "HOJE"
- **Torneio ativo**: Deve mostrar "AO VIVO"
- **Torneio passado**: Deve mostrar "FINALIZADO"

## 📊 **Vantagens do Sistema**

### **✅ Benefícios**
- **Status sempre preciso**: Baseado em datas reais
- **Atualização automática**: Sem intervenção manual
- **Independência do banco**: Não depende de sincronização
- **Timezone correto**: Respeita o fuso horário local
- **Fallbacks inteligentes**: Tratamento de casos especiais

### **🎯 Impacto no UX**
- **Informação confiável**: Status sempre correto
- **Visual consistente**: Badges padronizados
- **Feedback em tempo real**: Atualização automática
- **Clareza temporal**: Fácil entender quando o torneio acontece

## 🚀 **Como Personalizar**

### **1. Adicionar Novos Status**
```typescript
case 'special':
  return {
    color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
    text: 'ESPECIAL',
    icon: '🌟'
  }
```

### **2. Modificar Cores**
```typescript
// Para status "AO VIVO"
color: 'bg-green-500/10 text-green-600 border-green-500/20'
```

### **3. Adicionar Ícones**
```typescript
// Para status "EM BREVE"
icon: '🚀' // Foguete em vez de calendário
```

## 🎉 **Resultado Final**

Agora o sistema:
- **Calcula status automaticamente** baseado nas datas
- **Muda de "EM BREVE" para "AO VIVO"** no momento correto
- **Muda para "FINALIZADO"** quando termina
- **Mostra "HOJE"** quando o torneio começa
- **É sempre preciso** e atualizado em tempo real

## 🔍 **Exemplo Prático**

Com suas datas:
- **startDate**: 29 de janeiro de 2025 às 21h
- **registrationDeadline**: 11 de janeiro de 2025 às 21h

**Status atual (janeiro de 2025):**
- ✅ **EM BREVE**: Torneio ainda não começou
- ⏰ **Inscrições**: Fechadas (deadline passou)
- 📅 **Início**: Em breve (29 de janeiro)

**Status em 29 de janeiro às 21h:**
- 🔴 **AO VIVO**: Torneio começou!
- 🎮 **Progresso**: 0% (acabou de começar)

**Status em 30 de janeiro após 21h:**
- 🏁 **FINALIZADO**: Torneio terminou

O sistema agora é **inteligente e preciso**! 🎯✨ 