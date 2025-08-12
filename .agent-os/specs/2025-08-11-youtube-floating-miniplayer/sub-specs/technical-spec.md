# Technical Specification

This is the technical specification for the spec detailed in @.agent-os/specs/2025-08-11-youtube-floating-miniplayer/spec.md

## Technical Requirements

- Player flutuante com proporção 16:9
  - Usar `AspectRatio` para o vídeo/iframe (Twitch). Container externo em `fixed` com `pointer-events-none`, conteúdo com `pointer-events-auto`.
  - Estilização via tokens: `bg-card`, `border-border`, `text-muted-foreground`, `shadow`, `rounded-xl/2xl`.

- Controles e layout (shadcn/ui)
  - `Card` como base do miniplayer (header arrastável, content para player, footer opcional).
  - `Tooltip` nos botões: abrir no Twitch, minimizar/expandir, fechar, mudo/desmudo.
  - `DropdownMenu` opcional para controles extras (velocidade futura, qualidade quando suportado por provider).
  - `Slider` para volume quando suportado; se não, manter switch mudo/desmudo re-montando o iframe com `muted`.

- Arraste com limites e snapping
  - Iniciar drag apenas quando clicado no header (ignorar cliques em botões/iframes/svgs com `closest`).
  - Durante drag: `document` listeners de `mousemove`/`mouseup`, cursor `grabbing`, `user-select: none` no `body`.
  - Limitar posição por margem configurável (ex.: 12 px). Ajustar largura/altura baseadas no estado (minimizado vs normal) para cálculos de limites.
  - Ao soltar, fazer snapping para o canto mais próximo (top/bottom x left/right) calculado pelo centro do player.

- Estados e persistência
  - Estados: `position {x,y}`, `isDragging`, `isMinimized`, `isHovering`, `currentStreamIndex`, `isMuted`, `volume` (0-100 quando suportado), `dockedCorner`.
  - Persistir: `position`, `isMinimized`, `isMuted`, `volume`, `currentStreamId` em `localStorage` (com chave namespaced), restaurar no `useEffect` inicial.
  - Persistir entre rotas: renderizar o miniplayer em nível de layout raiz (`app/layout.tsx`) para manter o componente montado durante navegação.

- Fonte de dados e seleção de stream
  - Usar Firestore client (ver `web/src/lib/safeFirestore.ts`) para buscar `collection(db, 'streamers')` com `where('isFeatured','==',true)` (e opcionalmente `where('isOnline','==',true)` para exibir primeiro quem está ao vivo), em linha com `web/PROJETO_SEED_DATA.md`.
  - Tipos conforme `web/src/lib/firestore-helpers.ts::StreamerData` (`id`, `name`, `platform`, `streamUrl`, `avatarUrl`, `category`, `isOnline`, `isFeatured`, `createdAt`, `lastStatusUpdate`).
  - Extrair `twitchChannel` de `streamUrl` usando mesma lógica de `twitch-status.ts::extractUsernameFromTwitchUrl` ou função util local idêntica.
  - Priorizar ordenar online > destaque > nome; fallback para ordem padrão do snapshot.
  - Barra switcher compacta (avatars) para troca rápida: destaque para ativo, selo de destaque (ícone ⭐), indicador online (pulsante se `isOnline`).

- Integração com Twitch
  - Usar iframe `https://player.twitch.tv/?channel={channel}&parent={DOMAIN}&autoplay=true&muted={true|false}&controls=false`.
  - Definir `parent` para domínios reais do projeto (adicionar `localhost` e domínio de produção). Evitar hardcode em produção.
  - Mudo/desmudo: se sem SDK, re-montar o iframe ao alternar `muted` ou manter apenas `muted=true` no MVP. Documentar limitação.
  - Botão “Abrir no Twitch” abre `https://www.twitch.tv/{channel}` em nova aba com `noopener,noreferrer`.

- Responsividade e mobile
  - Em >= md: livre arraste e snapping nos 4 cantos; tamanho base p.ex. 480x270 (16:9). Em minimizado: largura ~320 px, altura reduzida (thumbnail/linha).
  - Em < md: fixar na base (bottom) com largura total da viewport, altura controlada por `AspectRatio`; controles reduzidos (fechar, abrir, mudo/desmudo). Desabilitar arraste no mobile.

- Acessibilidade
  - `aria-label`/`title` nos botões; foco visível; `Esc` para fechar quando focado.
  - Evitar movimento excessivo: respeitar `prefers-reduced-motion` nas animações.

- Performance
  - Evitar re-renderizações: memoizar lista de streams e índice, throttle/debounce no `mousemove` (requestAnimationFrame).
  - `pointer-events-none` na camada externa para não bloquear interações da página, apenas o miniplayer recebe eventos.
  - Animações com `transform` e `opacity` apenas; transições desativadas enquanto arrastando.

## External Dependencies (Conditional)

Nenhuma nova dependência obrigatória. Opcionalmente, considerar:
- Store leve (ex.: Zustand) para compartilhamento/persistência de estado global do miniplayer.
- `zod` para validar documentos do Firestore antes do uso no UI (campos opcionais/ausentes).

Caso adotada store:
- Biblioteca: Zustand
- Justificativa: simplificar persistência e acesso ao estado do miniplayer entre componentes.
- Versão: estável mais recente compatível com Next 14.
