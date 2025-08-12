# Spec Requirements Document

> Spec: miniplayer-persist-auto-open-bottom-right
> Created: 2025-08-12

## Overview

Garantir que o miniplayer permaneça persistente entre páginas, inicie sempre aberto após qualquer refresh/início da aplicação e, ao ser minimizado, seja ancorado automaticamente no canto inferior direito da tela.

## User Stories

### Auto-open após refresh

Como usuário, quero que o miniplayer esteja aberto automaticamente sempre que eu abrir o site ou recarregar a página, para que eu não precise ativá-lo manualmente.

Fluxo: acesso/refresh → miniplayer renderiza aberto (mesmo sem streamer carregado ainda) → ao carregar streamers, o conteúdo é exibido sem fechar o player.

### Minimizar ancorando no canto inferior direito

Como usuário, quero que ao clicar em minimizar, o miniplayer se desloque e fique ancorado no canto inferior direito, para manter o conteúdo visível e acessível sem atrapalhar a navegação.

Fluxo: player aberto → clicar em minimizar → player move para bottom-right e ajusta tamanho minimizado → permanece ancorado entre mudanças de rota.

## Spec Scope

1. **Auto-open global** - O miniplayer deve iniciar visível (aberto) em qualquer página após refresh/carregamento inicial.
2. **Minimize to bottom-right** - Ao minimizar, o player deve ancorar no canto inferior direito (`bottom-right`) automaticamente.
3. **Persistência entre rotas** - O player permanece montado e visível entre navegações (já integrado no `app/layout.tsx`).
4. **Persistência de posição/estado** - Posição, `dockedCorner` e estado minimizado devem continuar sendo persistidos; porém o estado visível inicia como aberto em todo refresh.
5. **Compatibilidade mobile** - No mobile, o miniplayer continua fixo na base; a âncora bottom-right aplica-se ao desktop.

## Out of Scope

- Novos controles de player, novos providers de vídeo ou alterações de UI além do necessário para ancoragem e auto-open.
- Mudanças de schema no Firestore ou APIs backend.
- Alterações de cores fora dos tokens do tema.

## Expected Deliverable

1. Ao abrir ou recarregar qualquer página, o miniplayer aparece aberto automaticamente.
2. Ao minimizar, o player é reposicionado e ancorado no canto inferior direito, mantendo-se lá mesmo após mudar de rota.
3. Persistência intacta (posição, canto ancorado, minimizado) entre sessões, com a exceção de que a visibilidade inicia aberta em todo refresh.


