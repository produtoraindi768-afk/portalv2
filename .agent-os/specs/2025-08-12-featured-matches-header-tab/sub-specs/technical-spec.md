# Technical Specification

This is the technical specification for the spec detailed in @.agent-os/specs/2025-08-12-featured-matches-header-tab/spec.md

## Technical Requirements

- Dados: Firestore coleção `matches` (mesmo schema da `FeaturedMatchesSection`).
- Query primária:
  - `where("isFeatured", "==", true)`
  - `where("scheduledDate", ">=", new Date().toISOString())`
  - `orderBy("scheduledDate", "asc")`
  - Incluir `isLive` (boolean) opcional; quando verdadeiro, priorizar visual "Ao vivo".
- Fallback sem índice composto: buscar só `isFeatured`, filtrar no cliente por futuras e ordenar.
- Novo componente: `HeaderFeaturedMatchesTab` em `web/src/components/layout/`.
  - UI compacta: altura ~72–88px; itens com largura mínima ~280–320px; variações responsivas.
  - Estrutura: container `div` com `bg-card/50 backdrop-blur` sobre `bg-background` (usar tokens), borda superior/inferior com `border-border`.
  - Internamente, um "carousel" simples com rolagem horizontal (`overflow-x-auto snap-x snap-mandatory`) e botões laterais (`Button` shadcn) que fazem `scrollBy`.
- Tokens/tema: usar `bg-card`, `text-card-foreground`, `text-muted-foreground`, `text-primary`, `text-destructive`, `border-border`.
- Estados: skeletons estreitos; vazio com mensagem discreta; erro silencioso.
- Acessibilidade: botões com `aria-label` para navegar; headings semânticos.
- Integração: importar e renderizar no `RootLayout` imediatamente após `SiteHeader`, antes de `<main>`.
- Performance: limitar a 12–16 itens; evitar dependências externas para carrossel.

## External Dependencies (Conditional)

Nenhuma nova dependência. Reutilizar Firebase SDK e shadcn/ui.


