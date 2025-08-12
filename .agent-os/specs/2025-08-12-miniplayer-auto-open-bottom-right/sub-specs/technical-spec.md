# Technical Specification

This is the technical specification for the spec detailed in @.agent-os/specs/2025-08-12-miniplayer-auto-open-bottom-right/spec.md

## Technical Requirements

- Integrado no layout raiz (já existente): `web/src/app/layout.tsx` mantém o player montado entre rotas.
- Auto-open em todo refresh/início:
  - No `MiniplPlayerProvider`, definir `isVisible` como `true` logo ao montar (antes/fora do fetch de streamers).
  - O `FloatingMiniplayer` deve renderizar mesmo em `loading` e mesmo sem `activeStreamer`, exibindo placeholder/skeleton.
- Minimizar ancorando no canto inferior direito:
  - Ao ativar minimizar, acionar `snapToCorner('bottom-right')` e ajustar `position` para (window.innerWidth - width - margin, window.innerHeight - headerHeight - margin).
  - Persistir `dockedCorner: 'bottom-right'` e a posição resultante.
- Persistência:
  - Manter persistência atual (posição, `isMinimized`, `isMuted`, `volume`, `currentStreamId`, `dockedCorner`) em `localStorage`.
  - Sobrepor a visibilidade: sempre iniciar visível em cada refresh, independentemente do persistido.
- Mobile:
  - Sem alteração: continuar fixando na base da tela no mobile; a âncora bottom-right aplica-se ao desktop.
- UI/UX (shadcn/ui):
  - Continuar usando tokens do tema (`bg-card`, `border-border`, `text-card-foreground`, `text-muted-foreground`, `shadow`, `rounded-*`).

## Implementation Plan

- File: `web/src/components/miniplayer/MiniplPlayerProvider.tsx`
  - Add: `useEffect(() => { setIsVisible(true) }, [])` para auto-open imediato ao montar.
  - Ajustar lógica de auto-show: não forçar ocultar em fallback; manter `isVisible` true mesmo sem streamers.

- File: `web/src/components/miniplayer/FloatingMiniplayer.tsx`
  - Remover a condição `|| loading` do early return: permitir renderizar container durante loading.
  - Remover o early return quando `!activeStreamer`; usar placeholder já existente (mostra avatar/nome ou mensagem de indisponibilidade).
  - No `handleMinimizeToggle` e também após `handleOpenTwitch` (onde já chama `setMinimized(true)`), chamar `snapToCorner('bottom-right')` e ajustar `setPosition` para o canto inferior direito considerando `headerHeight` quando minimizado.
  - Garantir que o `style` do container continue a usar `left/top` a partir do estado.

- File: `web/src/hooks/use-miniplayer.ts`
  - Confirmar que `snapToCorner(corner: DockedCorner)` está exportado (já está no retorno). Se necessário, ajustar para suportar `'bottom-right'` explicitamente.
  - Garantir que `dockedCorner` é persistido (já é) e respeitado em restauros.

## Acceptance Criteria

- Ao recarregar qualquer rota, o miniplayer aparece aberto automaticamente em até 1s, sem necessidade de clique.
- Ao clicar para minimizar, o player move e fica ancorado no canto inferior direito, com tamanho minimizado.
- Ao navegar entre rotas, o player permanece visível, e continua ancorado no canto inferior direito até ser movido manualmente.
- Em mobile, continua fixo na base; em desktop, âncora bottom-right é aplicada.
- Persistência: `position`, `dockedCorner`, `isMinimized` permanecem salvos; visibilidade sempre reinicia como aberta no refresh.
