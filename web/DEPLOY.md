# Deploy no Vercel - Portal SafeZone SZ

## 🚀 Instruções de Deploy

### 1. Preparação

O projeto já está configurado e pronto para deploy. O erro de build foi corrigido:
- ✅ Tipos de parâmetros corrigidos para Next.js 15
- ✅ Build local funcionando
- ✅ Arquivo `vercel.json` criado

### 2. Configuração no Vercel

1. **Conecte o repositório:**
   - Acesse [vercel.com](https://vercel.com)
   - Importe o projeto do GitHub: `https://github.com/produtoraindi768-afk/portal-sz.git`
   - Selecione o diretório `web` como root directory

2. **Configure as variáveis de ambiente:**
   No painel do Vercel, adicione as seguintes variáveis:

   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=sua_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=seu_projeto_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=seu_projeto.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=seu_app_id
   TWITCH_CLIENT_ID=seu_twitch_client_id
   TWITCH_ACCESS_TOKEN=seu_twitch_token
   NOVITA_API_KEY=sua_novita_key
   FIREBASE_CLIENT_EMAIL=seu_service_account_email
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   ```

3. **Configurações de Build:**
   - Framework Preset: `Next.js`
   - Root Directory: `web`
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

### 3. Deploy

1. Clique em "Deploy"
2. Aguarde o processo de build
3. Seu site estará disponível em uma URL do Vercel

### 4. Configurações Pós-Deploy

- Configure um domínio customizado se necessário
- Configure redirects se houver
- Monitore os logs de função para APIs

### 5. Troubleshooting

**Se houver erros de build:**
- Verifique se todas as variáveis de ambiente estão configuradas
- Confirme que o diretório root está definido como `web`
- Verifique os logs de build no painel do Vercel

**Se as APIs não funcionarem:**
- Verifique as variáveis de ambiente das APIs (Twitch, Firebase, Novita)
- Confirme que as chaves estão válidas e ativas
- Verifique os logs das funções serverless

### 6. Comandos Úteis

```bash
# Testar build localmente
npm run build

# Iniciar em modo produção
npm run start

# Verificar tipos
npx tsc --noEmit
```

---

✅ **Status:** Projeto pronto para deploy no Vercel!