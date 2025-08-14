# Configuração Completa da Autenticação Epic Games

## 🎯 Visão Geral
Este documento contém todos os passos necessários para configurar a autenticação Epic Games no projeto Ballistic Hub.

## 📋 Credenciais Epic Games

### Dados do Produto
- **Product ID**: `0d9c72c4ff174443934da9bf51362aa4`
- **Sandbox ID**: `40f9df87501d4449aaa2d01e381dd77d`
- **Deployment ID**: `7c540a775c2146ada6342ffdf49fa403`

### Credenciais do Cliente
- **Client ID**: `xyza7891Qu2npQYrklUzIfo9KZcQU2CV`
- **Client Secret**: `WKKgpsi/geAWUxyGbcCGcBgedCXNQTjFB/CDTrzuMmY`

## 🔧 Configuração no Firebase Console

### 1. Acesse o Firebase Console
1. Vá para [Firebase Console](https://console.firebase.google.com/)
2. Selecione seu projeto `dashboard-f0217`

### 2. Configure o Provedor OIDC
1. Vá para **Authentication** > **Sign-in method**
2. Clique em **Add new provider**
3. Selecione **OpenID Connect (OIDC)**

### 3. Configure os Parâmetros da Epic Games
```
Provider ID: oidc.epic
Client ID: xyza7891Qu2npQYrklUzIfo9KZcQU2CV
Client Secret: WKKgpsi/geAWUxyGbcCGcBgedCXNQTjFB/CDTrzuMmY
Issuer: https://api.epicgames.dev/epic/oauth/v1
```

### 4. URLs de Redirecionamento
Adicione as seguintes URLs de redirecionamento:
```
https://dashboard-f0217.firebaseapp.com/__/auth/handler
```

## 🔧 Configuração no Epic Games Developer Portal

### 1. URLs de Redirecionamento Autorizadas
No Epic Games Developer Portal, adicione:
```
https://dashboard-f0217.firebaseapp.com/__/auth/handler
```

### 2. Configurações de Escopo
Certifique-se de que o escopo `basic_profile` está habilitado para sua aplicação.

## 🚀 Implementação no Código

### Arquivos Criados/Modificados

1. **`web/src/lib/user-helpers.ts`** - Gerenciamento de dados do usuário
2. **`web/src/hooks/use-auth.ts`** - Hook personalizado para autenticação
3. **`web/src/components/auth/LoginForm.tsx`** - Formulário de login atualizado
4. **`web/src/components/auth/AuthStatus.tsx`** - Status de autenticação melhorado
5. **`web/src/components/ui/toaster.tsx`** - Componente de notificações
6. **`web/src/app/layout.tsx`** - Layout principal com Toaster

### Estrutura de Dados do Usuário

Quando um usuário faz login via Epic Games, os seguintes dados são salvos:

```typescript
interface UserData {
  uid: string
  email: string
  displayName: string
  photoURL?: string
  provider: 'epic'
  createdAt: string
  lastLogin: string
  
  // Dados específicos da Epic Games
  epicAccountId?: string
  epicDisplayName?: string
  epicUsername?: string
  epicProfile?: {
    accountId: string
    displayName: string
    username: string
    country?: string
    preferredLanguage?: string
  }
  
  // Perfil do jogador
  playerProfile?: {
    username: string
    displayName: string
    avatar: string
    bio: string
    country: string
    joinDate: string
    isVerified: boolean
    socialLinks: {
      twitch?: string
      youtube?: string
      twitter?: string
      discord?: string
    }
  }
  
  // Estatísticas do jogador
  playerStats?: {
    totalMatches: number
    wins: number
    winRate: number
    killDeathRatio: number
    averagePlacement: number
    totalKills: number
    totalDeaths: number
  }
  
  // Times do jogador
  playerTeams?: Array<{
    teamId: string
    name: string
    tag: string
    role: 'Captain' | 'Member'
    joinDate: string
    leaveDate?: string
    isActive: boolean
  }>
}
```

## 🧪 Testando a Implementação

### 1. Teste Local
```bash
cd web
npm run dev
```

### 2. Acesse a Página de Login
- Vá para `http://localhost:3000/login`
- Clique no botão "Epic Games"
- Você deve ser redirecionado para a página de login da Epic Games

### 3. Verificar Dados Salvos
Após o login bem-sucedido, verifique no Firebase Console:
- **Authentication** > **Users** - Deve mostrar o usuário Epic Games
- **Firestore** > **users** - Deve conter os dados completos do usuário

### 4. Script de Teste
Execute o script de teste para verificar a configuração:
```bash
cd web
npx tsx src/scripts/test-epic-auth.ts
```

## 🔒 Regras de Segurança do Firestore

As regras já estão configuradas no arquivo `firestore.rules`:

```javascript
// USERS COLLECTION
match /users/{userId} {
  // Usuário pode ler seu próprio perfil, outros apenas dados públicos
  allow read: if request.auth.uid == userId || 
    (resource.data.public == true);
  
  // Usuário pode criar/atualizar apenas seu próprio perfil
  allow create, update: if request.auth.uid == userId;
  
  // Apenas o próprio usuário pode deletar seu perfil
  allow delete: if request.auth.uid == userId;
}
```

## 🎨 Funcionalidades Implementadas

### 1. Login com Epic Games
- ✅ Botão de login funcional
- ✅ Redirecionamento para Epic Games
- ✅ Captura de dados do perfil
- ✅ Salvamento no Firestore

### 2. Gerenciamento de Estado
- ✅ Hook `useAuth` para gerenciar autenticação
- ✅ Estado de loading durante login
- ✅ Dados do usuário sincronizados

### 3. Interface do Usuário
- ✅ Componente AuthStatus melhorado
- ✅ Dropdown com informações do usuário
- ✅ Avatar e informações do perfil
- ✅ Notificações com toast

### 4. Dados do Usuário
- ✅ Perfil básico criado automaticamente
- ✅ Estatísticas inicializadas
- ✅ Estrutura para times
- ✅ Links sociais

## 🚨 Troubleshooting

### Erro: "Provider not found"
- Verifique se o Provider ID está configurado como `oidc.epic`
- Certifique-se de que o provedor OIDC está habilitado no Firebase

### Erro: "Invalid redirect URI"
- Verifique se as URLs de redirecionamento estão configuradas corretamente
- Confirme se o domínio do Firebase está correto

### Erro: "Invalid client credentials"
- Verifique se o Client ID e Client Secret estão corretos
- Confirme se a aplicação está ativa no Epic Games Developer Portal

### Erro: "Scope not allowed"
- Verifique se o escopo `basic_profile` está habilitado
- Confirme as configurações de permissões no Epic Games Developer Portal

## 📚 Recursos Adicionais

- [Documentação da Epic Games OAuth](https://dev.epicgames.com/docs/epic-account-services/oauth)
- [Documentação do Firebase OAuth](https://firebase.google.com/docs/auth/web/oidc-auth)
- [Documentação do Sonner (Toast)](https://sonner.emilkowal.ski/)

## ✅ Checklist de Configuração

- [ ] Credenciais Epic Games configuradas
- [ ] Firebase Console configurado (OIDC provider)
- [ ] URLs de redirecionamento configuradas
- [ ] Código implementado e testado
- [ ] Regras de segurança aplicadas
- [ ] Teste de login realizado
- [ ] Dados salvos no Firestore verificados

## 🎉 Próximos Passos

1. **Teste o login real** com uma conta Epic Games
2. **Verifique os dados salvos** no Firestore
3. **Implemente páginas de perfil** usando os dados salvos
4. **Adicione funcionalidades de time** usando a estrutura criada
5. **Implemente estatísticas** baseadas nas partidas do usuário
