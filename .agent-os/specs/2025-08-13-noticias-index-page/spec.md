# Spec Requirements Document

> Spec: Página de Notícias (Índice)
> Created: 2025-08-13

## Overview

Criar a página de índice de notícias em `/noticias`, listando todas as notícias publicadas do Firestore, mantendo o padrão de layout global (header/navbar, aba de partidas em destaque, miniplayer flutuante e footer) e usando componentes/tokens do shadcn/ui sem cores hardcoded.

## User Stories

### Listagem de notícias recentes

Como visitante, quero ver a lista de notícias ordenadas por data de publicação, para ler rapidamente as novidades mais recentes.

Fluxo/Detalhes: acessar `/noticias` → carregar documentos da coleção `news` com `status == "published"` (conforme PROJETO_SEED_DATA.md) → exibir cards com imagem de capa, data, título, resumo e link “Leia mais” para `/noticias/[slug]`.

### Navegação e identidade consistentes

Como visitante, quero que a página de notícias mantenha o mesmo header, navbar, aba de partidas em destaque, miniplayer e footer do site, para uma experiência consistente.

Fluxo/Detalhes: a página usa o `RootLayout` já existente (`SiteHeader` + `HeaderFeaturedMatchesTab` + `MiniplPlayerProvider` + `FooterSection`).

### Estados de carregamento/erro/vazio claros

Como visitante, quero ter feedback adequado durante o carregamento, ver mensagens úteis em caso de erro e um estado vazio amigável se não houver notícias.

Fluxo/Detalhes: replicar padrões já usados em `NewsSection` para loading/erro/vazio.

## Spec Scope

1. **Rota `/noticias`** - Página de índice com grid responsivo listando notícias publicadas, ordenadas desc por `publishDate` (string) ou `publishedAt` (Timestamp convertido), usando tokens de tema do shadcn/ui.
2. **Integração Firestore** - Leitura da coleção `news` com `status == "published"`; mapeamento de campos conforme `web/PROJETO_SEED_DATA.md` (ex.: `title`, `excerpt`, `featuredImage`, `publishDate`, `slug`, `isFeatured`).
3. **Navegação** - Atualizar item “Notícias” do menu para apontar para `'/noticias'` (em vez de `/#news`). Links dos cards mantêm `/noticias/[slug]`.
4. **SEO básico** - Título e descrição via `generateMetadata` na página de índice.
5. **Acessibilidade/UX** - Alternativas de texto para imagens, hierarquia de headings e foco/leituras coerentes com o tema.

## Out of Scope

- CMS/editorial, criação/edição de conteúdo no painel.
- Filtros, busca e paginação avançada (pode ser previsto em evolução futura).
- Internacionalização de conteúdo e SEO avançado (OpenGraph, JSON-LD avançado).

## Expected Deliverable

1. Acessar `/noticias` mostra a lista de notícias publicadas com cards e link funcional para `/noticias/[slug]`, mantendo header, navbar, aba de partidas em destaque, miniplayer e footer.
2. Dados carregados da coleção `news` do Firestore, compatíveis com o esquema de `web/PROJETO_SEED_DATA.md`, com ordenação desc por data e estados de loading/erro/vazio adequados.


