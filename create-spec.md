### Spec Update — Global Navbar & Footer

- **ID**: 2025-08-10-global-navbar-footer
- **Status**: Ativo
- **Contexto**: Tornar a navegação principal (navbar) e o rodapé (footer) persistentes em todas as páginas, reutilizando os componentes existentes e mantendo os padrões definidos no projeto.

#### Objetivo
Garantir que o cabeçalho `SiteHeader` e o rodapé `FooterSection` estejam presentes e consistentes em todas as páginas da aplicação, oferecendo navegação estável, responsiva e alinhada ao design system do projeto.

#### Escopo
- **Incluir globalmente**:
  - `SiteHeader` (`web/src/components/layout/SiteHeader.tsx`)
  - `FooterSection` (`web/src/components/layout/FooterSection.tsx`)
- **Persistência**: Ambos devem estar presentes em todas as rotas renderizadas sob `web/src/app/**` (ex.: home, news, dashboard, login), a menos que explicitamente excepcionadas por uma decisão futura de UX aprovada.

#### Regras de Design e UI
- **shadcn/ui**: Usar componentes shadcn/ui e variáveis do tema para cores/estados. Nunca usar cores hardcoded.
- **Responsividade**: Manter comportamento mobile com `Sheet` no `SiteHeader` e grid responsiva no `FooterSection` conforme já implementado.
- **Consistência**: Larguras máximas e espaçamentos utilizando utilitários existentes (ex.: `mx-auto`, `px-6`, `lg:max-w-7xl`).
- **Acessibilidade**: Garantir landmarks (`<header>`, `<nav>`, `<footer>`) e foco/aria nos toggles mobile.

#### Diretriz Técnica
- Definir o layout global em `web/src/app/layout.tsx` para envolver todas as páginas com:
  - `SiteHeader` no topo
  - `children` no meio
  - `FooterSection` ao final
- Evitar duplicidade: Layouts de grupos de rota (ex.: `web/src/app/(dashboard)/layout.tsx`, `web/src/app/dashboard/layout.tsx`) não devem renderizar `SiteHeader`/`FooterSection` se o layout global já o fizer. Caso existam, simplificar para herdar do layout global.
- Páginas especiais (ex.: `/(auth)/login`) devem manter a navbar e o footer, salvo exceção formal documentada.

#### Critérios de Aceite
- **Presença Global**: `SiteHeader` e `FooterSection` visíveis em: Home (`/`), Login (`/login`), News slug (`/news/[slug]`), Dashboard (`/dashboard`).
- **Tema**: Cores e estados respeitam tokens do tema shadcn/ui; nenhuma cor hardcoded adicionada.
- **Mobile**: Menu mobile funcional via `Sheet`; footer empilha colunas corretamente em breakpoints pequenos.
- **A11y**: Navegação por teclado cobre abrir/fechar menu, foco visível; landmarks sem conflito.
- **Sem duplicidade**: Nenhuma página renderiza múltiplos headers/footers.

#### Notas de Implementação (resumo)
- Atualizar `web/src/app/layout.tsx` para compor:
  - `<SiteHeader />`
  - `<main className="min-h-svh flex-1">{children}</main>`
  - `<FooterSection />`
- Revisar/remover headers duplicados em `web/src/app/(dashboard)/layout.tsx` e `web/src/app/dashboard/layout.tsx`, delegando ao layout global.

#### Impactos
- UX mais consistente entre páginas.
- Simplificação de manutenção ao centralizar a estrutura em um único layout global.

#### Rastreabilidade
- Change ID: `@2025-08-10-global-navbar-footer/`
- Componentes afetados: `SiteHeader`, `FooterSection`, layouts em `web/src/app/**`.


