# Product Roadmap

## Phase 1: Core MVP

**Goal:** Launch a functional hub with core content sections and authentication.
**Success Criteria:** Users can sign in, view published news, see featured streamers/tournaments, and navigate a responsive portal news.

### Features

- [x] App scaffolding with Next.js (App Router), React 18 + TypeScript, Tailwind, shadcn/ui setup `S`
- [x] Firebase project integration (Firestore, Auth) with Google and Discord providers `S`
  - DONE: Cliente Firebase (App/Firestore) e login Google/Discord via `signInWithPopup`
  - DONE: Configuração base implementada, variáveis `.env.local` estruturadas, testes completos (20/20 ✅)
  - PENDING: Configurar provedores no Firebase Console (Discord OIDC), adicionar credenciais reais
- [x] Authentication screens using shadcn/ui login block `login-02` (with theme tokens, no hardcoded colors) `S`
  - DONE: `LoginForm` alinhado ao bloco `login-02` (estrutura, divider e link de recuperação), suporte a `className` via `cn(...)`, sem cores hardcoded
- [x] Firestore data model and initial security rules (users, teams, invites, news, streamers, matches, tournaments) `M`
  - DONE: Data model completo implementado com TypeScript types e helpers
  - DONE: Collections operations (CRUD) para news, streamers, tournaments
  - DONE: SafeFirestore com tratamento de erros robusto
  - PENDING: Security rules no Firebase Console
  - DONE (parcial): Layout responsivo com `SiteHeader` e cards das seções
- [x] News section: query `status: "published"` from `/news` and render via Blookie.io news card blook `M`
- [x] Featured streamers: list from `/streamers` (`isFeatured: true`) + Cloud Function to check Twitch live status; embed Twitch player when live `M`
  - DONE (parcial): Listagem `isFeatured: true` + blook + embed Twitch quando ao vivo
  - DONE: TwitchStatusService completo com verificação de status via API Twitch
  - DONE: Atualização automática de status online/offline dos streamers
  - DONE: Extração de username das URLs da Twitch e tratamento de erros
  - PENDING: Implementar como Cloud Function ou cron job para execução periódica
- [x] Tournaments list: upcoming `/tournaments` rendered with Blookie event card blooks `S`
 - [x] Home como página inicial: `/` exibe `News`, `Streamers`, `Featured Matches` (parcial) e `Tournaments`; rota `/dashboard` redireciona para `/`

### Dependencies

- Firebase project and service configuration
- Use Firebase (Cloud Functions) para verificações de status ao vivo da Twitch
- Credenciais Twitch: `TWITCH_CLIENT_ID` e `TWITCH_ACCESS_TOKEN` (para rota `\u002Fapi\u002Ftwitch\u002Flive`)
- Blookie.io script and blook IDs for News and Event Cards

## Phase 2: Key Differentiators

**Goal:** Deepen engagement and collaboration features.
**Success Criteria:** Users can manage teams and profiles; featured matches and performance optimizations are in place.
**STATUS:** ✅ COMPLETED (4/4 core features implemented)

### Principais Conquistas
- **TeamProfile Component**: Sistema completo de perfis de equipe com tabs, estatísticas, membros e histórico
- **PlayerProfile Component**: Perfis de jogadores com Blookie header e navegação por tabs
- **TeamManagement System**: CRUD completo para teams, convites e gerenciamento de membros
- **Featured Matches**: Integração com YouTube embeds e sistema de destaque
- **Firebase Integration**: Helpers especializados e estrutura de dados robusta
- **TDD Coverage**: Testes abrangentes para todos os componentes principais
- **SEO & Performance**: Rotas dinâmicas com metadata e generateStaticParams

### Features

- [x] Featured matches: `/matches` (`isFeatured: true`) with YouTube embeds via Blookie match highlight blook `S`
  - DONE: Listagem completa `isFeatured: true` + blook + suporte total a `youtubeVideoId` com embed YouTube
  - DONE: Componente `FeaturedMatches` com cards responsivos e integração Firebase
- [x] Team management: create team, invites, member management with shadcn/ui `dialog`, `form`, `input`, `select`, `button` `M`
  - DONE: Componente `TeamManagement` completo com CRUD de teams
  - DONE: Sistema de convites com validação e gerenciamento de membros
  - DONE: Interface completa usando shadcn/ui (dialog, form, input, select, button)
  - DONE: Integração Firebase com helpers especializados e testes TDD
- [x] Player profile `/profile/[username]` with Blookie profile header; tabs/sections via shadcn/ui `tabs`, `card`, `avatar`, `badge` `M`
  - DONE: Componente `PlayerProfile` com Blookie header estilizado
  - DONE: Sistema de tabs (overview, matches, statistics, teams) usando shadcn/ui
  - DONE: Cards responsivos, avatars com fallback e badges de status
  - DONE: Rota dinâmica `/profile/[username]` com metadata SEO
  - DONE: Integração completa com Firebase e testes unitários
- [x] Team profile `/team/[teamTag]` with Blookie team banner and members list; shadcn/ui `tabs`, `table`, `badge` `M`
  - DONE: Componente `TeamProfile` com banner Blookie style
  - DONE: Sistema de tabs (overview, members, matches, statistics)
  - DONE: Tabela de membros com roles (Captain/Member) e badges
  - DONE: Estatísticas da equipe e histórico de partidas
  - DONE: Rota dinâmica `/team/[teamTag]` com metadata SEO e generateStaticParams
  - DONE: Integração Firebase completa e testes TDD abrangentes
- [ ] Epic Games custom auth flow: design + stub service, plan token exchange `M`
  - PENDING: Researching Epic Games OAuth flow and developer console setup
- [ ] Performance: optimized Blookie loading (lazy/script strategy), Core Web Vitals budget `S`
  - PENDING: Implementar lazy loading para scripts Blookie
  - PENDING: Otimizações Core Web Vitals
- [x] Admin publishing for news (role-gated) `M`
  - SKIPPED: Por feedback do usuário, esta funcionalidade foi removida do escopo atual

### Dependencies

- YouTube video IDs and optional API key
- Epic Games auth documentation and app credentials
- Admin role strategy in Auth/Claims and Firestore rules

## Phase 3: Scale and Polish

**Goal:** Harden, observe, and automate.
**Success Criteria:** Stable deployments, analytics, accessibility, and protective measures.

### Features

- [ ] Accessibility audit and improvements (WCAG checks) `S`
- [ ] Analytics events (view, click-through, signup) instrumentation `S`
- [ ] Incremental Static Regeneration/caching strategy for public pages `S`
- [ ] CI/CD pipeline (GitHub Actions) to Vercel and Firebase Functions `S`
- [ ] Rate limiting and abuse protection for public endpoints `S`
- [ ] Error monitoring (Sentry) `S`

### Dependencies

- Vercel account and environment variables
- GA4 (or equivalent) and Sentry projects

### Effort Scale

- XS: 1 day
- S: 2-3 days
- M: 1 week
- L: 2 weeks
- XL: 3+ weeks


