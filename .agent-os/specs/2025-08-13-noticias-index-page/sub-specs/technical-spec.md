# Technical Specification

This is the technical specification for the spec detailed in @.agent-os/specs/2025-08-13-noticias-index-page/spec.md

## Technical Requirements

- Páginas/Rotas:
  - Criar `web/src/app/noticias/page.tsx` (Server Component) que renderiza a listagem usando o componente cliente existente `NewsSection`.
    - Cabeçalho da página: heading “Notícias”.
    - Usar `<NewsSection showHeader={false} />` (o header local da seção é opcional, manteremos um título da página para evitar duplicidade de heading).
  - Navegação: alterar `web/src/components/layout/nav-items.ts` para `{ title: "Notícias", href: "/noticias" }`.

- Layout Global (já existente, apenas consumir):
  - `RootLayout` inclui `SiteHeader`, `HeaderFeaturedMatchesTab`, `MiniplPlayerProvider` e `FooterSection`. A página de notícias apenas rende o conteúdo no `main`.

- UI/UX e Tema:
  - Utilizar componentes/tokens shadcn/ui já presentes (Card, Button, etc.). Não usar cores hardcoded; respeitar tokens `bg-card`, `text-muted-foreground`, `text-primary`, etc.
  - Grid responsivo 1/3 colunas conforme `NewsSection` para consistência visual.

- Firestore:
  - Leitura cliente via `getClientFirestore()` (arquivo `web/src/lib/safeFirestore.ts`).
  - Reutilizar lógica de `NewsSection` para buscar `collection(db, "news")` com `where("status", "==", "published")` e fallback sem índice, ordenação por `publishDate` (desc) com conversão de `publishedAt` quando existir.
  - Campos conforme seed em `web/PROJETO_SEED_DATA.md`: `title`, `content`, `contentHtml`, `excerpt`, `author`, `category`, `tags`, `slug`, `featuredImage`, SEO, `readingTime`, `status`, `publishDate`, `isFeatured`, `bannerUrl`.

- SEO:
  - Em `web/src/app/noticias/page.tsx`, exportar `metadata` com `title: "Notícias"` e descrição curta.

- Acessibilidade:
  - `alt` nas imagens; headings coerentes; links com `aria-label` como já feito em `NewsSection`.

- Testes rápidos (manuais):
  - Sem documentos em `news` → exibe estado vazio.
  - Com 1+ documentos publicados → cards com dados e navegação para `/noticias/[slug]` funcionando.
  - Erros de Firestore → mensagem de erro visível.

## External Dependencies

Nenhuma dependência nova. Reuso de Firebase (cliente) e shadcn/ui existentes.


