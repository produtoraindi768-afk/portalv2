# Spec Requirements Document

> Spec: youtube-floating-miniplayer
> Created: 2025-08-11

## Overview

Transformar o layout e a experiência dos streamers em destaque em um miniplayer flutuante ao estilo do YouTube, com docking inteligente, arraste, minimizar/expandir e persistência entre páginas. A UI utilizará componentes shadcn/ui e variáveis de tema, garantindo consistência visual e acessibilidade.

## User Stories

### Miniplayer persistente durante navegação

Como visitante, quero que ao abrir ou focar uma stream em destaque, um miniplayer flutuante continue visível enquanto navego por outras páginas, para acompanhar o conteúdo sem interrupções.

O miniplayer deve surgir automaticamente quando a stream em destaque estiver ativa, manter a reprodução ao trocar de rota, e reposicionar-se de forma suave para não cobrir elementos críticos da UI.

### Controles essenciais e docking inteligente

Como usuário, quero minimizar/expandir, arrastar e encaixar o miniplayer nas bordas da janela, além de controlar volume (mudo/desmudo) e abrir no Twitch, para ter controle rápido sem perder o foco do que estou fazendo.

O miniplayer deve possuir header arrastável, snapping para cantos, limites com margem, e botões com tooltip para minimizar, fechar e abrir no Twitch. Todos os controles devem usar componentes shadcn/ui e tokens do tema.

### Experiência mobile compacta

Como usuário mobile, quero uma versão compacta no rodapé com controles básicos (play/pause quando suportado, mudo/desmudo, fechar) para economizar espaço, mantendo o aspecto 16:9 e leitura confortável.

## Spec Scope

1. **Contêiner flutuante 16:9** - Miniplayer com proporção 16:9 usando `AspectRatio`, renderizado em portal global, com estilos via tokens (`bg-card`, `border-border`, `text-muted-foreground`).
2. **Arraste, snapping e limites** - Header arrastável, snapping para cantos, margens de segurança, cursor adequado, e prevenção de arraste sobre elementos interativos. Botões de ação (minimizar e abrir no Twitch) posicionados no topo direito do player, no estilo controles de janela. Ao abrir no Twitch, o miniplayer é automaticamente minimizado e continua executando em segundo plano.
3. **Controles do player e ações** - Minimizar/expandir, fechar, abrir no Twitch, mudo/desmudo e volume (quando suportado pelo provider). Tooltips consistentes.
4. **Persistência de estado** - Posição, tamanho/estado (minimizado), volume/mudo e stream atual persistidos em `localStorage` e restaurados ao recarregar/trocar de rota.
5. **Switcher de destaques** - Barra compacta com avatares dos streamers que estão online e marcados como destaque, para troca rápida, com indicação do ativo e do destaque. Quando minimizado, exibir cabeçalho compacto em forma de pílula com mini avatares sobrepostos (até 5) e nome do streamer ativo com indicador online.

## Out of Scope

- Fila/playlist completa de vídeos e histórico.
- Picture-in-Picture nativo do navegador entre abas/janelas.
- Chat embutido da Twitch ou autenticação OAuth da Twitch.
- Controle programático avançado via SDK da Twitch além dos parâmetros suportados pelo iframe neste primeiro passo.

## Expected Deliverable

1. Miniplayer flutuante funcional que aparece com streams em destaque, permanece entre páginas, com docking, arraste, minimizar/expandir e abrir no Twitch.
2. Persistência de estado (posição, minimizado, volume/mudo, stream selecionada) entre navegações e reloads.
3. Experiência mobile compacta no rodapé, mantendo proporção 16:9 e controles essenciais, sem regressões de performance (scroll/drag fluido e sem CLS perceptível).


