# Technical Specification

This is the technical specification for the spec detailed in @.agent-os/specs/2025-08-12-featured-matches-card/spec.md

## Technical Requirements

- Fonte de dados: Firestore, coleção `matches` conforme `web/PROJETO_SEED_DATA.md`.
- Campos utilizados: `isFeatured` (boolean), `scheduledDate` (string ISO), `tournamentName`, `format`, `game`, `team1.name`, `team2.name`.
- Query (preferida):
  - `where("isFeatured", "==", true)`
  - `where("scheduledDate", ">=", new Date().toISOString())`
  - `orderBy("scheduledDate", "asc")`
- Fallback: se faltar índice composto, buscar apenas `isFeatured = true`, filtrar futuras e ordenar no cliente.
- Componente: `web/src/components/sections/FeaturedMatchesSection.tsx`.
  - Estados: carregando, vazio e erro silencioso.
- Layout/UX:
  - Usar `Card`, `CardHeader`, `CardTitle`, `CardContent` e utilitários existentes.
  - Container centralizado: `section.py-16 lg:py-32` com `max-w-7xl` como demais seções.
  - Grade responsiva: `grid gap-6 sm:grid-cols-2 lg:grid-cols-3`.
  - Tokens do tema: `bg-card`, `text-card-foreground`, `text-muted-foreground`.
- Acessibilidade: títulos semânticos, textos claros.

## External Dependencies (Conditional)

Nenhuma nova dependência; reutilizar Firebase SDK e componentes shadcn/ui já presentes.


