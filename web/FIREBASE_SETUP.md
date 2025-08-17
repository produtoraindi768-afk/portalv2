# 🔥 Configuração do Firebase para Torneios

## Problema Atual
A página de torneios está funcionando com dados de exemplo, mas não consegue salvar dados no Firebase devido às regras de segurança.

## Soluções

### 1. 🚀 Solução Rápida (Recomendada)
A página já está funcionando com dados de exemplo! Acesse:
- **URL**: `http://localhost:3000/torneios`
- **Status**: ✅ Funcionando com design completo

### 2. 🔧 Configuração Completa do Firebase

#### 2.1 Configurar Regras do Firestore
Acesse o [Firebase Console](https://console.firebase.google.com/project/dashboard-f0217/firestore/rules) e atualize as regras:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir leitura pública para torneios
    match /tournaments/{document} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Permitir leitura pública para outras coleções
    match /{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

#### 2.2 Adicionar Dados via Firebase Console
1. Acesse [Firestore Database](https://console.firebase.google.com/project/dashboard-f0217/firestore/data)
2. Crie uma coleção chamada `tournaments`
3. Adicione documentos com a estrutura:

```json
{
  "name": "CCT Season 3 South American Series",
  "game": "CS2",
  "format": "Online - Eliminação dupla",
  "description": "Campeonato sul-americano de Counter-Strike 2",
  "startDate": "2025-08-07T18:00:00.000Z",
  "endDate": "2025-08-19T22:00:00.000Z",
  "registrationDeadline": "2025-08-05T23:59:59.000Z",
  "maxParticipants": 32,
  "prizePool": 15000,
  "entryFee": 0,
  "rules": "Sem trapaças, seguir fair play.",
  "status": "ongoing",
  "isActive": true
}
```

#### 2.3 Usar Script Admin (Opcional)
Execute o script com Admin SDK:
```bash
npm run seed-tournaments-admin
```

## 📊 Estrutura de Dados

### Campos Obrigatórios:
- `name`: Nome do torneio
- `game`: Jogo (CS2, League of Legends, etc.)
- `format`: Formato (Online/LAN)
- `startDate`: Data de início (ISO)
- `endDate`: Data de término (ISO)
- `status`: "upcoming" | "ongoing" | "finished"
- `isActive`: boolean

### Campos Opcionais:
- `description`: Descrição detalhada
- `maxParticipants`: Número máximo de participantes
- `prizePool`: Premiação em R$
- `entryFee`: Taxa de inscrição
- `rules`: Regras do torneio

## 🎨 Funcionalidades Implementadas

### ✅ Design Completo
- Cards baseados no Draft5
- Badges de status (ONLINE/LAN, EM ANDAMENTO/HOJE)
- Cores dinâmicas por jogo
- Layout responsivo

### ✅ Sistema de Filtros
- Por status (Em Andamento, Próximos, Finalizados)
- Por formato (Online/LAN)
- Busca por texto

### ✅ Separação por Status
- **EM ANDAMENTO**: Torneios ativos
- **PRÓXIMOS TORNEIOS**: Torneios futuros
- **TORNEIOS FINALIZADOS**: Torneios concluídos

## 🚀 Próximos Passos

1. **Teste a página atual**: `http://localhost:3000/torneios`
2. **Configure as regras do Firestore** (se quiser dados reais)
3. **Adicione dados via Firebase Console**
4. **Implemente funcionalidades adicionais**:
   - Página de detalhes do torneio
   - Sistema de inscrições
   - Filtros avançados

## 📱 Status Atual
- ✅ Página funcionando
- ✅ Design implementado
- ✅ Dados de exemplo
- ⚠️ Firebase precisa de configuração para dados reais
