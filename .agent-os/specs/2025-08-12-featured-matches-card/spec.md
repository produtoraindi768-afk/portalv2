# Spec Requirements Document

> Spec: Featured Matches Card
> Created: 2025-08-12

## Overview

Implementar um card de “Partidas em Destaque” que lê a coleção `matches` do Firestore, exibindo somente partidas futuras marcadas com `isFeatured = true`, ordenadas pela data mais próxima a acontecer. O card ficará centralizado logo abaixo do cabeçalho/nav, mantendo o design, layout e variáveis de tema do projeto.

## User Stories

### Ver próximas partidas em destaque

Como visitante do site, quero ver rapidamente as próximas partidas em destaque, ordenadas por data mais próxima, para decidir o que acompanhar.

Fluxo: ao abrir a página inicial, logo abaixo do cabeçalho aparece um card com as partidas em destaque; cada item mostra times, torneio, formato, jogo e data/hora.

### Curadoria por destaque

Como editor, quando marco uma partida com `isFeatured = true` no banco, ela deve aparecer automaticamente no card (se ainda não ocorreu), sem novas publicações manuais.

## Spec Scope

1. **Consulta ao Firestore (`matches`)** - Filtrar por `isFeatured = true` e por partidas futuras, ordenando por `scheduledDate` ascendente.
2. **Layout centralizado** - Um `Card` contendo título e uma grade de itens; centralizado sob o header, responsivo, usando tokens/variáveis existentes.
3. **Campos exibidos** - Times (`team1.name` vs `team2.name`), `tournamentName`, `format`, `game` e data/hora (`scheduledDate`).
4. **Estados de UI** - Carregando, vazio (“Sem partidas em destaque.”) e erro silencioso (log no console).
5. **Responsividade** - Grade 1 coluna no mobile; 2 colunas em `sm`; 3 em `lg`.

## Out of Scope

- CRUD/admin para partidas; importador de dados.
- Streaming/embedding de players além do já existente; histórico de partidas passadas.
- Configurações avançadas de timezone/intl; SEO específico desta seção.

## Expected Deliverable

1. Card “Partidas em Destaque” visível abaixo do cabeçalho, consistente com o tema (shadcn/ui) e paleta do projeto.
2. Lista mostra somente partidas futuras com `isFeatured = true`, ordenadas por `scheduledDate` (mais próximas primeiro).
3. Renderização responsiva com mensagens de vazio e carregamento adequadas.

> Referências: `web/PROJETO_SEED_DATA.md` (coleção `matches`).


