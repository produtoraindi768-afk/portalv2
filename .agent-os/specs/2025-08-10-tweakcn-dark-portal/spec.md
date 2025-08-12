# Spec Requirements Document

> Spec: TweakCN dark theme em todo o portal (alinhado ao layout Blookie)
> Created: 2025-08-10

## Overview

Aplicar e padronizar o tema escuro baseado nas variáveis TweakCN em todas as páginas e componentes do portal, assegurando consistência visual e aderência ao layout/UX do Blookie, sem cores hardcoded.

## User Stories

### Experiência consistente em todo o site

Como visitante, quero que todas as páginas usem o tema escuro consistente (background, foreground, bordas, estados) para melhor leitura e conforto visual, mantendo o visual Blookie.

Fluxo: ao acessar qualquer rota (home, notícias, dashboards, login), a página carrega com `html.dark`, tokens `bg-background`/`text-foreground` ativos e componentes shadcn/ui herdando as variáveis.

### Design system confiável

Como designer, quero que os componentes usem apenas tokens do tema (cores, radius, sombras, tipografia) para que o layout se mantenha fiel ao Blookie e seja fácil de evoluir.

Fluxo: qualquer ajuste de cor no `globals.css` reflete automaticamente em botões, cards, inputs, tooltips e estados interativos.

### Implementação sem dívidas de estilo

Como dev, quero remover cores hardcoded e garantir que utilitários Tailwind e componentes shadcn/ui estejam mapeados para as variáveis, evitando divergências visuais.

Fluxo: auditoria automática/manual aponta usos de `text-white`, `bg-black`, hex e HSL diretos e orienta a troca para tokens (`text-foreground`, `bg-background`, `bg-primary`, etc.).

## Spec Scope

1. **Tema escuro por padrão** - Garantir `class="dark"` no `html` raiz para todo o app (`web/src/app/layout.tsx`).
2. **Tokens TweakCN globais** - Centralizar/confirmar variáveis em `web/src/app/globals.css` com mapping `@theme inline` para tokens Tailwind/shadcn.
3. **Aderência shadcn/ui** - Verificar/ajustar componentes em `web/src/components/ui/*` para usar tokens (`bg-background`, `text-foreground`, `border-border`, `bg-primary`, `text-primary-foreground`, etc.).
4. **Remoção de cores hardcoded** - Auditar `src/**` trocando utilitários e valores explícitos por tokens do tema.
5. **Compatibilidade Blookie** - Manter o layout, hierarquias visuais e espaços conforme Blookie (cards, headings, grids), usando apenas variáveis (radius, sombras e tipografia).

## Out of Scope

- Criação de modo claro ou alternância de tema (toggle).
- Mudanças estruturais significativas de layout além do necessário para aderir ao tema.
- Migração de bibliotecas/grandes refactors fora de estilos.

## Expected Deliverable

1. Ao abrir qualquer página, o DOM possui `html.dark` e o `body` aplica `bg-background`/`text-foreground` do TweakCN.
2. Componentes shadcn/ui exibem cores coerentes com os tokens, sem cores hardcoded remanescentes em `src/**` (checagem amostral por busca).
3. Visual conforme Blookie: cards, botões, inputs e tooltips com radius/sombra do tema e contraste adequado.

—

Referências:
- Variáveis e mapping: `web/src/app/globals.css`
- HTML raiz: `web/src/app/layout.tsx`
- Componentes base: `web/src/components/ui/*`

