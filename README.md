# Portal SafeZone SZ

Um portal moderno e responsivo para a comunidade SafeZone, desenvolvido com Next.js 15, React 19, TypeScript e Tailwind CSS.

## 🚀 Características

- **Interface Moderna**: Design responsivo com tema dark/light
- **Autenticação**: Sistema completo com Firebase Auth (Google, Discord)
- **Miniplayer**: Player flutuante para streams da Twitch
- **Notícias**: Sistema de notícias com Firebase Firestore
- **Torneios**: Seção dedicada para torneios e eventos
- **Perfis de Equipe**: Gerenciamento de membros e equipes
- **Componentes Reutilizáveis**: Biblioteca de componentes com shadcn/ui

## 🛠️ Tecnologias

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Backend**: Firebase (Firestore, Auth, Admin)
- **APIs**: Twitch API, Novita AI
- **Testes**: Jest, Testing Library
- **Animações**: Motion (Framer Motion)

## 📦 Instalação

1. Clone o repositório:
```bash
git clone https://github.com/produtoraindi768-afk/portal-safezone-sz.git
cd portal-safezone-sz
```

2. Instale as dependências:
```bash
cd web
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env.local
```

Edite o arquivo `.env.local` com suas credenciais:
- Firebase (API Key, Project ID, etc.)
- Twitch API (Client ID, Access Token)
- Novita AI (API Key)
- Blookie Script URL

4. Execute o projeto:
```bash
npm run dev
```

O projeto estará disponível em `http://localhost:3000`

## 🔧 Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Gera a build de produção
- `npm run start` - Inicia o servidor de produção
- `npm run lint` - Executa o linter
- `npm run test` - Executa os testes
- `npm run test:watch` - Executa os testes em modo watch
- `npm run seed-data` - Popula o Firebase com dados de exemplo

## 🔐 Segurança

- Todas as chaves de API são gerenciadas via variáveis de ambiente
- Arquivo `.env.local` está no `.gitignore` para evitar exposição de credenciais
- Firebase Admin SDK configurado para operações server-side seguras
- Regras de segurança do Firestore implementadas

## 📁 Estrutura do Projeto

```
web/
├── src/
│   ├── app/                 # App Router (Next.js 15)
│   ├── components/          # Componentes reutilizáveis
│   │   ├── ui/             # Componentes base (shadcn/ui)
│   │   ├── sections/       # Seções da página
│   │   ├── auth/           # Componentes de autenticação
│   │   ├── miniplayer/     # Player flutuante
│   │   └── layout/         # Componentes de layout
│   ├── hooks/              # Custom hooks
│   ├── lib/                # Utilitários e configurações
│   └── scripts/            # Scripts de setup
├── public/                 # Arquivos estáticos
└── __tests__/             # Testes
```

## 🧪 Testes

O projeto inclui testes abrangentes:
- Testes unitários para componentes
- Testes de integração para hooks
- Testes para utilitários e helpers
- Cobertura de testes para funcionalidades críticas

## 🚀 Deploy

O projeto está configurado para deploy em:
- **Vercel** (recomendado para Next.js)
- **Netlify**
- **Firebase Hosting**

## 📄 Licença

Este projeto é privado e pertence à comunidade SafeZone.

## 🤝 Contribuição

Para contribuir com o projeto:
1. Faça um fork do repositório
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📞 Suporte

Para suporte e dúvidas, entre em contato com a equipe de desenvolvimento da SafeZone.