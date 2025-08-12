# Prompt Otimizado para Geração de HUB do Fortnite: Ballistic (Stack com Firebase + Blookie.io)

## Persona

Você é um desenvolvedor de software sênior, especialista em desenvolvimento de aplicações web full-stack com a stack **Next.js, Firebase e ferramentas de UI modernas**. Sua tarefa é gerar o código-fonte inicial para uma aplicação web robusta, visualmente impressionante e escalável que funcionará como um HUB central para a comunidade do modo de jogo "Fortnite: Ballistic".

## Objetivo do Aplicativo

Criar uma plataforma centralizada e visualmente cativante para jogadores e fãs do modo "Fortnite: Ballistic", oferecendo:
- Notícias atualizadas apresentadas de forma interativa.
- Destaque para streamers e jogadores influentes com componentes animados.
- Informações sobre partidas e torneios com visuais dinâmicos.
- Um sistema de cadastro e gerenciamento de equipes com autenticação segura via **Firebase Authentication (Epic Games, Discord, Google)**.

## Estrutura do Projeto e Tecnologias

Gere um projeto completo utilizando a seguinte stack tecnológica:

- **Frontend:**
  - **Framework:** React com Next.js (utilizando App Router).
  - **Linguagem:** TypeScript.
  - **Estilização:** Tailwind CSS.
  - **Componentes Visuais Dinâmicos:** **Blookie.io**. O projeto deve incluir a configuração para renderizar "blooks" embedados. Crie um componente wrapper no React (`<BlookieEmbed />`) para facilitar o uso dos blooks e a passagem de dados dinâmicos para seus atributos.
  - **Componentes UI Estruturais:** **Shadcn/ui**. Utilize para o layout geral, dashboards, formulários, modais, botões e outros elementos de interface base.
- **Backend:**
  - **Plataforma:** **Firebase Functions** (para lógica server-side).
  - **Linguagem:** TypeScript.
- **Banco de Dados e Autenticação:**
  - **Serviço:** **Firebase**
  - **Autenticação:** **Firebase Authentication** (com provedores para Google, Discord e fluxo customizado para Epic Games).
  - **Banco de Dados:** **Cloud Firestore** (NoSQL).

## Funcionalidades Detalhadas

### 1. Página Inicial (HUB)

- **Layout:** Crie um dashboard moderno e intuitivo construído com componentes **Shadcn/ui** (para a estrutura) e preenchido com componentes **Blookie.io** (para o conteúdo de destaque).
- **Notícias:**
  - **Descrição:** Uma seção que exibe as últimas notícias sobre o "Fortnite: Ballistic".
  - **Lógica:** Obtenha a lista de notícias da coleção `/news` no Firestore (`status: "published"`).
  - **UI com Blookie:** Para cada notícia, renderize um **blook** de "Card de Notícia" do Blookie.io. Passe os dados da notícia (título, imagem de capa, resumo) dinamicamente para os atributos do blook para que ele exiba o conteúdo correto de forma animada.
- **Streamers em Destaque:**
  - **Descrição:** Uma seção dinâmica que mostra streamers que estão ao vivo.
  - **Lógica:**
    1. Consulte a coleção `/streamers` no Firestore (`isFeatured: true`).
    2. Chame uma Firebase Function para verificar o status ao vivo na Twitch.
  - **UI com Blookie:** Exiba os streamers ao vivo utilizando um **blook** de "Perfil de Streamer" ou "Player de Vídeo" customizado no Blookie.io. Este blook deve ser projetado para:
    - Receber o nome do streamer, avatar e status "AO VIVO" como atributos.
    - Mostrar um player de vídeo da Twitch embedado.
    - Ter um design interativo e chamativo, conforme criado na plataforma Blookie.
- **Partidas em Destaque:**
  - **Descrição:** Uma seção para destacar partidas ou eventos importantes.
  - **Lógica:** Consulte a coleção `/matches` no Firestore (`isFeatured: true`).
  - **UI com Blookie:** Use um **blook** de "Destaque de Partida". Passe o título da partida, times envolvidos e um ID de vídeo do YouTube como atributos. O blook deve apresentar essas informações com animações e talvez um botão para assistir ao vídeo.
- **Próximos Torneios:**
  - **Descrição:** Uma seção para informar sobre futuros torneios.
  - **Lógica:** Consulte a coleção `/tournaments` no Firestore.
  - **UI com Blookie:** Renderize cada torneio usando um **blook** de "Card de Evento". Passe o nome do torneio, data, premiação e um link de inscrição como atributos para o blook.

### 2. Autenticação e Gerenciamento de Contas

- **Autenticação Múltipla:**
  - **Descrição:** Utilize o **Firebase Authentication** para implementar os provedores de login (Google, Discord, Epic Games). As telas de login e cadastro devem ser construídas com **Shadcn/ui**.
- **Criação e Gerenciamento de Equipes:**
  - **Descrição:** As funcionalidades de criar equipe, enviar convites e gerenciar membros devem ser implementadas em modais ou páginas de dashboard construídas com **Shadcn/ui**.

### 3. Perfis de Jogadores e Equipes

- **Página de Perfil do Jogador (`/profile/[username]`):**
  - **Descrição:** A estrutura da página (abas, seções) deve ser feita com **Shadcn/ui**.
  - **UI com Blookie:** O header do perfil, onde ficam o avatar, nome e estatísticas principais do jogador, deve ser um **blook** de "Header de Perfil" para dar um destaque visual forte e animado.
- **Página de Perfil da Equipe (`/team/[teamTag]`):**
  - **Descrição:** Similar ao perfil do jogador, a estrutura é feita com **Shadcn/ui**.
  - **UI com Blookie:** O banner da equipe e a lista de membros podem ser renderizados usando **blooks** customizados para garantir uma apresentação visual consistente e atraente.

### 4. Estrutura do Banco de Dados (Cloud Firestore)

- **Descrição:** Projete uma estrutura de dados NoSQL otimizada para as consultas da aplicação.
- **Coleções Principais:**
  - `users/{userId}`
    - `username: string`
    - `email: string`
    - `avatarUrl: string`
    - `socials: { twitch: string, twitter: string }`
    - `bio: string`
    - `currentTeamId: string | null`
  - `teams/{teamId}`
    - `name: string`
    - `tag: string`
    - `captainId: string`
    - `members: string[]` (Array com os `userId` dos membros)
  - `invites/{inviteId}`
    - `teamId: string`
    - `invitedUserId: string`
    - `inviterUserId: string`
    - `status: 'pending' | 'accepted' | 'declined'`
  - `news/{newsId}`
    - `title: string`
    - `content: string`
    - `imageUrl: string`
    - `publishedAt: Timestamp`
    - `status: 'draft' | 'published'`
  - `streamers/{streamerId}`
    - `twitchUsername: string`
    - `displayName: string`
    - `isFeatured: boolean`
  - `matches/{matchId}`
    - `title: string`
    - `description: string`
    - `youtubeVideoId: string`
    - `isFeatured: boolean`
  - `tournaments/{tournamentId}`
    - `name: string`
    - `startDate: Timestamp`
    - `description: string`
    - `prizePool: string`

### 5. Considerações Adicionais

- **Segurança:** Configure as **Regras de Segurança do Firestore** (`firestore.rules`) para proteger os dados, garantindo que os usuários só possam escrever/ler dados autorizados.
- **Qualidade do Código:** Gere um código bem documentado, com uma clara separação entre a lógica de UI estrutural (Shadcn/ui) e os componentes visuais de destaque (Blookie.io).
- **Performance:** Garanta que o script do Blookie.io seja carregado de forma eficiente, sem impactar negativamente o Core Web Vitals da aplicação.