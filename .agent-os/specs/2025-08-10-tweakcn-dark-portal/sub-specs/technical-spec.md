# Technical Specification

This is the technical specification for the spec detailed in @.agent-os/specs/2025-08-10-tweakcn-dark-portal/spec.md

## Technical Requirements

- Tema escuro por padrão
  - Assegurar `class="dark"` no `<html>` em `web/src/app/layout.tsx` (já presente).
  - `body` com `bg-background text-foreground` via `@layer base` (já presente em `globals.css`).

- Tokens TweakCN
  - Manter/confirmar blocos `:root` e `.dark` em `web/src/app/globals.css` com variáveis fornecidas.
  - Garantir `@theme inline` mapeando todas as variáveis para tokens: `--color-background`, `--color-foreground`, `--color-primary`, etc.
  - Utilizar fontes e radius via `--font-sans`, `--radius-*` e sombras `--shadow-*` do tema.

- Aderência shadcn/ui
  - Conferir componentes em `web/src/components/ui/*` para classes baseadas em tokens:
    - Fundo/Texto: `bg-background`, `text-foreground`
    - Borda/Anel: `border-border`, `ring-ring`
    - Ações: `bg-primary`, `text-primary-foreground`, `hover:bg-primary/90`
    - Secundário/Muted/Accent: `bg-secondary`, `bg-muted`, `bg-accent` e respectivos `*-foreground`
  - Evitar utilitários fixos como `text-white`, `bg-black`, hex/HSL diretos, substituindo por tokens.

- Auditoria de cores hardcoded
  - Busca em `web/src/**` por padrões: `#`, `hsl(`, `oklch(` fora de `globals.css`, `text-white`, `bg-black`, `text-black`.
  - Substituir por tokens equivalentes do tema.

- Compatibilidade visual Blookie
  - Cards/sections devem respeitar `--radius` e `--shadow-*` do tema; quando vidro for desejado, usar utilitário `.glass` já presente.
  - Tipografia via `font-sans`/escala existente; sem redefinir famílias locais em componentes.

- Acessibilidade e contraste
  - Verificar contraste mínimo (WCAG AA) para estados primários/foreground.

## External Dependencies (Conditional)

Nenhuma nova dependência. Usar shadcn/ui existente e Tailwind já configurado.
