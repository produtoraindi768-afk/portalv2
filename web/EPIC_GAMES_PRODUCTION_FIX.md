# 🔧 Correção da Autenticação Epic Games em Produção

## 🚨 Problema Identificado
A autenticação Epic Games funciona apenas no localhost porque os domínios de produção não estão configurados corretamente no Firebase Console e Epic Games Developer Portal.

**❌ ERRO PRINCIPAL:** `auth/invalid-api-key` - As variáveis de ambiente do Firebase não estão configuradas no Vercel.

## 📋 Passos para Correção

### 1. 🔑 Configuração das Variáveis de Ambiente no Vercel

#### A. Acesse o Painel do Vercel
1. Vá para [vercel.com](https://vercel.com)
2. Selecione seu projeto
3. Vá para **Settings** > **Environment Variables**

#### B. Adicione as Variáveis do Firebase
```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=dashboard-f0217.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=dashboard-f0217
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=dashboard-f0217.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

**⚠️ IMPORTANTE:** Obtenha essas credenciais no [Firebase Console](https://console.firebase.google.com/) > **Project Settings** > **General** > **Your apps**

### 2. 🌐 Configuração no Firebase Console

#### A. Adicionar Domínios Autorizados
1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Selecione seu projeto `dashboard-f0217`
3. Vá para **Authentication** > **Settings** > **Authorized domains**
4. Adicione os seguintes domínios:
   ```
   fortnitesz.online
   www.fortnitesz.online
   [seu-dominio-vercel].vercel.app
   ```

#### B. Verificar Configuração OIDC
1. Vá para **Authentication** > **Sign-in method**
2. Clique no provedor **OpenID Connect (OIDC)**
3. Verifique se está configurado:
   ```
   Provider ID: oidc.epic
   Client ID: xyza7891Qu2npQYrklUzIfo9KZcQU2CV
   Client Secret: WKKgpsi/geAWUxyGbcCGcBgedCXNQTjFB/CDTrzuMmY
   Issuer: https://api.epicgames.dev/epic/oauth/v1
   ```

#### C. URLs de Redirecionamento
Adicione as seguintes URLs de redirecionamento:
```
https://dashboard-f0217.firebaseapp.com/__/auth/handler
https://fortnitesz.online/__/auth/handler
https://www.fortnitesz.online/__/auth/handler
```

### 3. 🎮 Configuração no Epic Games Developer Portal

#### A. Acesse o Portal
1. Vá para [Epic Games Developer Portal](https://dev.epicgames.com/)
2. Faça login com sua conta Epic
3. Selecione sua aplicação

#### B. URLs de Redirecionamento Autorizadas
Adicione as seguintes URLs:
```
https://dashboard-f0217.firebaseapp.com/__/auth/handler
https://fortnitesz.online/__/auth/handler
https://www.fortnitesz.online/__/auth/handler
```

#### C. Configurações de Escopo
Verifique se os seguintes escopos estão habilitados:
- `basic_profile`
- `openid`
- `email`

### 4. 🧪 Teste da Configuração

#### A. Teste Local
```bash
cd web
npm run dev
```
Acesse: `http://localhost:3000/login`

#### B. Teste em Produção
1. Faça deploy no Vercel
2. Acesse: `https://fortnitesz.online/login`
3. Teste o botão "Epic Games"

#### C. Página de Debug
Acesse: `https://fortnitesz.online/debug-epic` para diagnosticar problemas

### 5. 🔍 Debug e Troubleshooting

#### A. Verificar Console do Navegador
Abra o DevTools (F12) e verifique:
- Erros de rede
- Erros de JavaScript
- Logs de autenticação

#### B. Erros Comuns e Soluções

**❌ Erro: "auth/invalid-api-key"**
- **Solução:** Configure as variáveis de ambiente no Vercel
- **Passo:** Vercel Dashboard > Settings > Environment Variables

**❌ Erro: "auth/unauthorized-domain"**
- **Solução:** Adicione o domínio em Firebase Console > Authentication > Settings > Authorized domains

**❌ Erro: "auth/invalid-redirect-uri"**
- **Solução:** Verifique as URLs de redirecionamento no Epic Games Developer Portal

**❌ Erro: "auth/popup-blocked"**
- **Solução:** Permita popups para o domínio
- **Verificação:** Desative bloqueadores de anúncios

**❌ Erro: "auth/operation-not-allowed"**
- **Solução:** Verifique se o provedor OIDC está habilitado no Firebase Console

### 6. 📊 Monitoramento

#### A. Logs do Firebase
1. Vá para Firebase Console > Authentication > Users
2. Verifique se os usuários estão sendo criados

#### B. Logs do Vercel
1. Acesse o painel do Vercel
2. Vá para Functions > Logs
3. Verifique se há erros relacionados à autenticação

#### C. Script de Teste
Execute o script de teste para verificar a configuração:
```bash
cd web
npx tsx src/scripts/test-epic-production.ts
```

## ✅ Checklist de Verificação

- [ ] **Variáveis de ambiente configuradas no Vercel**
- [ ] Domínios autorizados adicionados no Firebase
- [ ] URLs de redirecionamento configuradas no Epic Games
- [ ] Provedor OIDC habilitado no Firebase
- [ ] Escopos configurados no Epic Games
- [ ] Teste local funcionando
- [ ] Teste em produção funcionando
- [ ] Logs verificados

## 🚀 Próximos Passos

1. **Configure as variáveis de ambiente** no Vercel (PRIORIDADE MÁXIMA)
2. **Aplique as configurações** do Firebase e Epic Games
3. **Faça novo deploy** no Vercel
4. **Teste a autenticação** em produção
5. **Use a página de debug** para diagnosticar problemas
6. **Monitorar logs** para identificar possíveis problemas

## 🔧 Ferramentas de Debug

### Página de Debug
Acesse: `https://fortnitesz.online/debug-epic`

### Script de Teste
```bash
cd web
npx tsx src/scripts/test-epic-production.ts
```

### Console do Navegador
Abra DevTools (F12) e verifique os logs de erro

## 📞 Suporte

Se ainda houver problemas após seguir este guia:
1. Verifique os logs do console do navegador
2. Use a página de debug em `/debug-epic`
3. Execute o script de teste
4. Consulte a documentação oficial da Epic Games
5. Verifique a documentação do Firebase OAuth
6. Entre em contato com o suporte técnico se necessário

## 🎯 Resumo da Solução

**O problema principal é que as variáveis de ambiente do Firebase não estão configuradas no Vercel.** Isso causa o erro `auth/invalid-api-key` que impede a autenticação de funcionar em produção.

**Solução:** Configure todas as variáveis de ambiente do Firebase no painel do Vercel e faça um novo deploy.
