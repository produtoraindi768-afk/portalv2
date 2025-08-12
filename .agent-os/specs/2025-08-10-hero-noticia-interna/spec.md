# Spec Requirements Document

> Spec: hero-noticia-interna
> Created: 2025-08-10

## Overview

Implementar um Hero na página interna de notícias, baseado no bloco Hero 4 do Blookie, exibindo dados da notícia selecionada (título, resumo, imagem de capa, tags e CTAs), com layout responsivo e suporte a tema claro/escuro. Referência: [Blookie Hero 4](https://blookie.io/blocks/heroes/4).

## User Stories

### Leitor vê contexto rico da notícia

Como um leitor, quero visualizar um Hero com o título, resumo, tags e uma imagem de capa da notícia selecionada, para entender rapidamente o conteúdo e decidir se devo continuar a leitura.

Fluxo: Ao acessar `noticias/[slug]`, o Hero é renderizado no topo com dados carregados da notícia selecionada. A imagem de capa é responsiva e otimizada, e as ações (ex.: "Ler mais", "Compartilhar") são claramente visíveis.

### Editor vê metadados refletidos

Como um editor, quero que as tags/categorias e o estado (ex.: "Novo") apareçam no Hero como Badges, para evidenciar o posicionamento editorial da notícia.

Fluxo: Ao marcar a notícia com tags e/ou flag de destaque, os Badges correspondentes aparecem no Hero.

## Spec Scope

1. **Componente Hero para notícia** - Implementar o Hero inspirado no Hero 4 do Blookie usando componentes shadcn/ui com tokens de tema (sem cores hardcoded), inclusive `Badge`, `Button`, `Sheet`/menu móvel e ícones Lucide.
2. **Mapeamento de dados da notícia** - Popular o Hero com dados da notícia selecionada: título, resumo/lead, imagem de capa, tags/badges e CTAs contextuais.
3. **Responsividade e acessibilidade** - Garantir layout responsivo (mobile/desktop), contraste adequado com tokens do tema e atributos de acessibilidade básicos.
4. **Integração com rota da notícia** - Renderizar o Hero no topo de `noticias/[slug]` (App Router), consumindo os dados da notícia do repositório atual (ex.: Firestore/SSR) conforme a base do projeto.
5. **Tema claro/escuro** - Respeitar tema do shadcn/ui (Radix + Tailwind), funcionando bem em ambos os temas.

## Out of Scope

- CRUD de notícias, CMS ou painel editorial.
- SEO avançado, Open Graph e enriquecimento de metadados além do já existente.
- Analytics e tracking de cliques (apenas hooks/pontos de extensão podem ser adicionados se já padronizados).

## Expected Deliverable

1. A página `noticias/[slug]` exibe o Hero no topo, com dados reais da notícia selecionada (título, resumo, imagem, tags) e CTAs funcionais de navegação/âncora.
2. O Hero utiliza exclusivamente componentes shadcn/ui e tokens de tema (nenhuma cor hardcoded), mantendo responsividade e bom contraste em tema claro/escuro.
3. O layout e a interação refletem o padrão do [Blookie Hero 4](https://blookie.io/blocks/heroes/4), ajustado ao branding via tokens do tema, com performance adequada (imagem otimizada) e sem erros de lint.


