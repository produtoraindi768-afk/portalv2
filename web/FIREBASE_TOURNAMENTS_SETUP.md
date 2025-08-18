# Configuração de Torneios no Firebase

Este documento explica como configurar e alimentar a página de torneios com dados do Firebase.

## 📋 Pré-requisitos

1. **Projeto Firebase configurado** com as seguintes variáveis de ambiente:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

2. **Firestore habilitado** no projeto Firebase
3. **Regras de segurança** configuradas para permitir leitura

## 🗄️ Estrutura da Coleção

### Nome da Coleção: `tournaments`

### Campos Obrigatórios:
```typescript
{
  name: string              // Nome do torneio
  game: string              // Jogo (ex: "CS2", "Valorant", "Fortnite: Ballistic")
  format: string            // Formato (ex: "Online - Eliminação dupla", "LAN - Liga")
  description: string       // Descrição detalhada
  startDate: string         // Data de início (ISO format)
  endDate: string           // Data de término (ISO format)
  registrationDeadline: string // Prazo de inscrição (ISO format)
  maxParticipants: number   // Máximo de participantes
  prizePool: number         // Premiação em R$
  entryFee: number          // Taxa de inscrição em R$ (0 = gratuito)
  rules: string             // Regras do torneio
  status: string            // "upcoming" | "ongoing" | "finished"
  isActive: boolean         // Torneio ativo/inativo
}
```

## 🚀 Como Adicionar Dados

### Opção 1: Firebase Console (Interface Web)

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Selecione seu projeto
3. No menu lateral, clique em **Firestore Database**
4. Clique em **Criar coleção**
5. Nome da coleção: `tournaments`
6. Adicione documentos manualmente ou importe o arquivo JSON

### Opção 2: Importar JSON

1. Use o arquivo `FIREBASE_TOURNAMENTS_EXAMPLE.json` como base
2. No Firebase Console, vá para **Firestore Database**
3. Clique na coleção `tournaments`
4. Clique em **Importar JSON**
5. Selecione o arquivo JSON e confirme

### Opção 3: Script de Migração

```typescript
// Exemplo de script para adicionar torneios programaticamente
import { firestoreHelpers } from '@/lib/firestore-helpers'

const tournamentData = {
  name: "Meu Torneio",
  game: "CS2",
  format: "Online - Eliminação simples",
  description: "Descrição do torneio...",
  startDate: "2025-09-01T18:00:00.000Z",
  endDate: "2025-09-02T22:00:00.000Z",
  registrationDeadline: "2025-08-30T23:59:59.000Z",
  maxParticipants: 32,
  prizePool: 10000,
  entryFee: 0, // Gratuito
  rules: "Regras do torneio...",
  status: "upcoming",
  isActive: true
}

// Adicionar ao Firebase
const helpers = new firestoreHelpers()
await helpers.createTournament(tournamentData)
```

## 🎯 Exemplos de Dados

### Torneio Gratuito
```json
{
  "name": "Ballistic Open Championship",
  "game": "Fortnite: Ballistic",
  "format": "Online - Battle Royale",
  "description": "Campeonato aberto à comunidade de Ballistic",
  "startDate": "2025-08-20T18:00:00.000Z",
  "endDate": "2025-08-21T22:00:00.000Z",
  "registrationDeadline": "2025-08-18T23:59:59.000Z",
  "maxParticipants": 100,
  "prizePool": 5000,
  "entryFee": 0,
  "rules": "Sem trapaças, seguir fair play",
  "status": "upcoming",
  "isActive": true
}
```

### Torneio Pago
```json
{
  "name": "Liga Gamers Club - Série A",
  "game": "League of Legends",
  "format": "Online - Liga",
  "description": "Liga mensal de League of Legends",
  "startDate": "2025-08-08T19:00:00.000Z",
  "endDate": "2025-08-29T23:00:00.000Z",
  "registrationDeadline": "2025-08-06T23:59:59.000Z",
  "maxParticipants": 16,
  "prizePool": 8000,
  "entryFee": 50,
  "rules": "Times de 5 jogadores",
  "status": "ongoing",
  "isActive": true
}
```

## 🔧 Regras de Segurança Firestore

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir leitura pública para torneios
    match /tournaments/{document} {
      allow read: if true;
      allow write: if request.auth != null; // Apenas usuários autenticados podem escrever
    }
  }
}
```

## 📱 Funcionalidades da Interface

### Badge "Gratuito"
- Quando `entryFee` = 0, exibe um badge verde com 🎉
- Quando `entryFee` > 0, exibe o valor em R$

### Status dos Torneios
- **upcoming**: Próximos torneios (azul)
- **ongoing**: Em andamento (vermelho)
- **finished**: Finalizados (cinza)

### Filtros
- Por status
- Por jogo
- Por formato (Online/LAN)
- Por taxa de inscrição

## 🐛 Solução de Problemas

### Erro de Conexão
- Verifique as variáveis de ambiente
- Confirme se o projeto Firebase está ativo
- Verifique as regras de segurança do Firestore

### Dados Não Aparecem
- Confirme se a coleção se chama `tournaments`
- Verifique se `isActive` = true
- Confirme se os campos obrigatórios estão preenchidos

### Badge "Gratuito" Não Aparece
- Verifique se `entryFee` = 0 (não null ou undefined)
- Confirme se o campo é do tipo number

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique o console do navegador para erros
2. Confirme a configuração do Firebase
3. Teste com dados de exemplo primeiro
4. Verifique as regras de segurança do Firestore 