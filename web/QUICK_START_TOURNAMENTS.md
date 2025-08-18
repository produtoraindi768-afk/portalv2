# 🚀 Início Rápido - Torneios

## ⚡ Configuração em 3 Passos

### 1. Configurar Firebase
Certifique-se de que as variáveis de ambiente estão configuradas no arquivo `.env.local`:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 2. Executar Script de Seed (Recomendado)
```bash
cd web
npm run seed:tournaments
```

### 3. Ou Adicionar Manualmente no Firebase Console
1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Vá para **Firestore Database**
3. Crie uma coleção chamada `tournaments`
4. Importe o arquivo `FIREBASE_TOURNAMENTS_EXAMPLE.json`

## 🎯 O que Você Verá

### Badge "Gratuito" 🎉
- Torneios com `entryFee: 0` mostram um badge verde destacado
- Torneios pagos mostram o valor em R$

### Status dos Torneios
- **🔴 EM ANDAMENTO**: Torneios ativos
- **🔵 PRÓXIMOS TORNEIOS**: Torneios futuros
- **⚫ TORNEIOS FINALIZADOS**: Torneios concluídos

### Filtros Disponíveis
- Por jogo (CS2, Valorant, League of Legends, etc.)
- Por formato (Online/LAN)
- Por status
- Por taxa de inscrição

## 📱 Testando a Interface

1. **Acesse** `/torneios` no seu projeto
2. **Verifique** se os dados aparecem
3. **Teste** os filtros e navegação
4. **Confirme** que o badge "Gratuito" aparece para torneios com `entryFee: 0`

## 🔧 Solução de Problemas Comuns

### "Modo Demonstração"
- Significa que o Firebase não está configurado
- Configure as variáveis de ambiente e reinicie o servidor

### "Erro de Conexão"
- Verifique se o projeto Firebase está ativo
- Confirme se as variáveis de ambiente estão corretas

### "Nenhum torneio encontrado"
- Execute o script de seed: `npm run seed:tournaments`
- Ou adicione torneios manualmente no Firebase Console

## 📚 Próximos Passos

1. **Personalizar dados**: Edite os torneios no Firebase Console
2. **Adicionar mais torneios**: Use o formato do arquivo de exemplo
3. **Implementar filtros avançados**: Por região, faixa etária, etc.
4. **Sistema de inscrições**: Conectar com autenticação de usuários

## 🆘 Precisa de Ajuda?

- 📖 Leia `FIREBASE_TOURNAMENTS_SETUP.md` para instruções detalhadas
- 🔍 Verifique o console do navegador para erros
- 📧 Consulte a documentação do Firebase
- 🐛 Teste com dados de exemplo primeiro 