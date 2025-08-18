# 🔧 Solução de Problemas - Firebase Conectado mas Sem Dados

## 🚨 Problema: Variáveis de Ambiente Configuradas, mas Página Não Mostra Dados Reais

### ✅ **Passo 1: Verificar Configuração Básica**

1. **Confirme que o arquivo `.env.local` está na raiz do projeto `web/`**
   ```bash
   # Estrutura correta:
   web/
   ├── .env.local          # ← DEVE estar aqui
   ├── src/
   ├── package.json
   └── ...
   ```

2. **Verifique se as variáveis estão corretas**
   ```bash
   # .env.local deve conter:
   NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyC...
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=seu-projeto
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
   NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
   ```

### 🔄 **Passo 2: Reiniciar Servidor**

**IMPORTANTE:** Após alterar variáveis de ambiente, você DEVE reiniciar o servidor:

```bash
# 1. Pare o servidor (Ctrl+C)
# 2. Reinicie
npm run dev
```

### 🧪 **Passo 3: Executar Script de Debug**

```bash
cd web
npm run debug:firebase
```

Este script vai:
- ✅ Verificar se as variáveis estão sendo carregadas
- ✅ Testar a conexão com o Firebase
- ✅ Verificar se há dados na coleção `tournaments`

### 🔍 **Passo 4: Verificar Firebase Console**

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Selecione seu projeto
3. Vá para **Firestore Database**
4. **Confirme que existe uma coleção chamada `tournaments`**
5. **Verifique se há documentos dentro da coleção**

### 📊 **Passo 5: Verificar Estrutura dos Dados**

Cada documento na coleção `tournaments` deve ter esta estrutura:

```json
{
  "name": "Nome do Torneio",
  "game": "CS2",
  "format": "Online - Eliminação dupla",
  "description": "Descrição...",
  "startDate": "2025-08-07T18:00:00.000Z",
  "endDate": "2025-08-19T22:00:00.000Z",
  "registrationDeadline": "2025-08-05T23:59:59.000Z",
  "maxParticipants": 32,
  "prizePool": 15000,
  "entryFee": 0,
  "rules": "Regras...",
  "status": "ongoing",
  "isActive": true
}
```

**⚠️ IMPORTANTE:** O campo `isActive` deve ser `true` para o torneio aparecer.

### 🚀 **Passo 6: Popular o Banco de Dados**

Se a coleção `tournaments` estiver vazia:

```bash
# Opção 1: Script automático (Recomendado)
cd web
npm run seed:tournaments

# Opção 2: Manual no Firebase Console
# - Importe o arquivo FIREBASE_TOURNAMENTS_EXAMPLE.json
```

### 🔐 **Passo 7: Verificar Regras de Segurança**

No Firebase Console > Firestore Database > Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir leitura pública para torneios
    match /tournaments/{document} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### 🐛 **Passo 8: Debug na Interface**

1. Acesse `/torneios` no seu projeto
2. Clique em **"Expandir"** no componente de Debug Firebase
3. Clique em **"Testar Conexão"**
4. Verifique as informações exibidas

### 📱 **Passo 9: Verificar Console do Navegador**

1. Abra as Ferramentas do Desenvolvedor (F12)
2. Vá para a aba **Console**
3. Procure por erros relacionados ao Firebase
4. Erros comuns:
   - `Firebase: Error (auth/invalid-api-key)`
   - `Firebase: Error (auth/project-not-found)`
   - `Firestore: Missing or insufficient permissions`

### 🔄 **Passo 10: Soluções Comuns**

#### **Problema: "Firebase not available"**
```bash
# Solução: Verificar se o projeto está ativo
# - Acesse Firebase Console
# - Confirme que o projeto não está desabilitado
```

#### **Problema: "Permission denied"**
```bash
# Solução: Atualizar regras de segurança
# - Permitir leitura pública para torneios
```

#### **Problema: "Collection not found"**
```bash
# Solução: Criar coleção tournaments
# - Execute: npm run seed:tournaments
```

### 📞 **Se Nada Funcionar**

1. **Execute o debug completo:**
   ```bash
   npm run debug:firebase
   ```

2. **Verifique o log completo no terminal**

3. **Confirme que:**
   - ✅ Variáveis de ambiente estão corretas
   - ✅ Projeto Firebase está ativo
   - ✅ Firestore está habilitado
   - ✅ Coleção `tournaments` existe
   - ✅ Documentos têm a estrutura correta
   - ✅ Campo `isActive` é `true`

4. **Teste com dados mínimos:**
   ```json
   {
     "name": "Teste",
     "game": "CS2",
     "format": "Online",
     "description": "Teste",
     "startDate": "2025-08-07T18:00:00.000Z",
     "endDate": "2025-08-08T18:00:00.000Z",
     "registrationDeadline": "2025-08-06T18:00:00.000Z",
     "maxParticipants": 10,
     "prizePool": 1000,
     "entryFee": 0,
     "rules": "Teste",
     "status": "upcoming",
     "isActive": true
   }
   ```

### 🎯 **Resumo de Verificação**

- [ ] Arquivo `.env.local` na raiz do projeto `web/`
- [ ] Todas as variáveis configuradas
- [ ] Servidor reiniciado após alterações
- [ ] Projeto Firebase ativo
- [ ] Firestore habilitado
- [ ] Coleção `tournaments` existe
- [ ] Documentos com estrutura correta
- [ ] Campo `isActive` = `true`
- [ ] Regras de segurança permitem leitura
- [ ] Script de debug executado com sucesso 