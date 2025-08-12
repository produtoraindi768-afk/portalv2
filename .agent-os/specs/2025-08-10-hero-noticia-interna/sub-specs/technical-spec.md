# Technical Specification

Este é o documento técnico da spec em @.agent-os/specs/2025-08-10-hero-noticia-interna/spec.md

## Technical Requirements

- Roteamento: Next.js App Router 14+ com página `app/noticias/[slug]/page.tsx` (ou equivalente no projeto) exibindo o Hero no topo.
- Dados: Consumir a notícia selecionada (por `slug`) do repositório atual (ex.: Firestore via server components/SSR ou fetch server-side). Campos esperados: `title`, `excerpt`/`lead`, `coverImageUrl`, `tags: string[]`, `isNew?: boolean`.
- UI: Implementar o layout inspirado no Hero 4 do Blookie usando shadcn/ui: `Badge`, `Button`, `Sheet`, `SheetContent`, `SheetTitle`, `SheetTrigger`. Ícones via `lucide-react`. Sem cores hardcoded; usar tokens do tema shadcn/ui.
- Imagens: Usar `next/image` com `fill` ou proporção 16:9 responsiva, `sizes` apropriado, `priority` condicional (LCP do artigo), e `alt` descritivo com o título da notícia.
- Acessibilidade: Hierarquia semântica (`h1` para título do artigo), textos alternativos, foco visível nos botões/links, e labels nos `Sheet`/menu móvel.
- Responsividade: Seguir breakpoints tailwind; garantir boa experiência em mobile e desktop.
- Tema: Respeitar tema claro/escuro via tokens do shadcn/ui; evitar cores literais.
- Navegação/CTAs: Botões principais (ex.: "Ler notícia" rolando/ancorando para o conteúdo; secundário opcional como "Compartilhar" ou link para categoria). Usar `asChild` com `Link`/`a` conforme padrão do projeto.
- Estrutura de props (se componente dedicado): `HeroNoticia` recebe `title`, `excerpt`, `coverImageUrl`, `tags`, `primaryAction`, `secondaryAction?`.
- Testes mínimos: snapshot/visual do componente e render em `noticias/[slug]` com dados mockados.
- Lint/Types: Tipar com TypeScript; sem erros de eslint/prettier.
- Regras internas: Durante a implementação, consultar o demo do componente via MCP do shadcn/ui primeiro; aplicar componentes/blocks conforme aplicável e estilizar usando variáveis do tema (regra do workspace).

## External Dependencies (Conditional)

Nenhuma dependência nova prevista. Utilizar `shadcn/ui`, `lucide-react` e `next/image` já presentes no stack.

Referência visual: https://blookie.io/blocks/heroes/4
