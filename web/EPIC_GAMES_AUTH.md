# Configuração da Autenticação Epic Games

## Visão Geral
A autenticação da Epic Games foi implementada usando o `OAuthProvider` do Firebase com o provider ID `"oidc.epic"`.

## Configuração no Firebase Console

### 1. Acesse o Firebase Console
- Vá para [Firebase Console](https://console.firebase.google.com/)
- Selecione seu projeto

### 2. Configure o Provedor OIDC
- Vá para **Authentication** > **Sign-in method**
- Clique em **Add new provider**
- Selecione **OpenID Connect (OIDC)**

### 3. Configure os Parâmetros da Epic Games
```
Provider ID: oidc.epic
Client ID: [Seu Client ID da Epic Games]
Client Secret: [Seu Client Secret da Epic Games]
Issuer: https://api.epicgames.dev/epic/oauth/v1
```

### 4. URLs de Redirecionamento
Adicione as seguintes URLs de redirecionamento:
```
https://[SEU_PROJETO].firebaseapp.com/__/auth/handler
```

## Configuração na Epic Games Developer Portal

### 1. Acesse o Epic Games Developer Portal
- Vá para [Epic Games Developer Portal](https://dev.epicgames.com/)
- Faça login com sua conta Epic

### 2. Crie uma Aplicação
- Clique em **Create Product**
- Preencha as informações necessárias
- Em **Client Credentials**, anote o **Client ID** e **Client Secret**

### 3. Configure as URLs de Redirecionamento
Adicione a URL do Firebase como redirecionamento autorizado:
```
https://[SEU_PROJETO].firebaseapp.com/__/auth/handler
```

## Implementação no Código

A autenticação já está implementada no componente `LoginForm.tsx`:

```typescript
const provider = new OAuthProvider("oidc.epic")
await signInWithPopup(auth, provider)
```

## Testando

1. Certifique-se de que todas as configurações estão corretas
2. Acesse a página de login (`/login`)
3. Clique no botão "Epic Games"
4. Você será redirecionado para a página de login da Epic Games
5. Após o login bem-sucedido, você será redirecionado de volta para a aplicação

## Troubleshooting

### Erro: "Provider not found"
- Verifique se o Provider ID está configurado como `oidc.epic` no Firebase Console
- Certifique-se de que o provedor OIDC está habilitado

### Erro: "Invalid redirect URI"
- Verifique se as URLs de redirecionamento estão configuradas corretamente tanto no Firebase quanto no Epic Games Developer Portal

### Erro: "Invalid client credentials"
- Verifique se o Client ID e Client Secret estão corretos
- Certifique-se de que a aplicação está ativa no Epic Games Developer Portal

## Recursos Adicionais

- [Documentação da Epic Games OAuth](https://dev.epicgames.com/docs/epic-account-services/oauth)
- [Documentação do Firebase OAuth](https://firebase.google.com/docs/auth/web/oidc-auth)
