# Seed rápido (Firebase Console)

Coleções sugeridas p/ testes:

- news (estrutura de dados)
  - title: string — news title
  - content: string — main content
  - contentHtml: string — HTML formatted content
  - excerpt: string — short summary
  - author: string — author name
  - category: string — category name
  - tags: string[] — list of tags
  - slug: string — URL-friendly identifier
  - featuredImage: string — URL of featured image
  - seoTitle: string — SEO title
  - seoDescription: string — SEO description
  - readingTime: number — estimated reading time in minutes
  - status: "draft" | "published"
  - publishDate: string (YYYY-MM-DD) — publication date
  - isFeatured: boolean — mark as featured news
  - bannerUrl: string — URL of banner if featured

  Exemplo (JSONC):
  ```jsonc
  {
    "title": "Ballistic Update 1.2",
    "content": "Texto completo da notícia...",
    "contentHtml": "<p>Texto <strong>formatado</strong>...</p>",
    "excerpt": "Resumo curto da notícia",
    "author": "Equipe Editorial",
    "category": "Atualizações",
    "tags": ["patch", "balance"],
    "slug": "ballistic-update-1-2",
    "featuredImage": "https://example.com/cover.jpg",
    "seoTitle": "Ballistic 1.2: Novidades",
    "seoDescription": "Resumo para SEO",
    "readingTime": 4,
    "status": "published",
    "publishDate": "2025-08-12",
    "isFeatured": true,
    "bannerUrl": "https://example.com/banner.jpg"
  }
  ```

- streamers (estrutura de dados)
  - id: string — gerado com `Date.now().toString()`
  - name: string — nome do streamer
  - platform: string — plataforma de streaming (Twitch, YouTube, etc.)
  - streamUrl: string — URL da live
  - avatarUrl: string — imagem/avatar
  - category: string — categoria de conteúdo
  - isOnline: boolean — status ao vivo
  - isFeatured: boolean — destaque
  - createdAt: string — data de criação em ISO
  - lastStatusUpdate: string — última atualização de status em ISO

  Estrutura (JSONC):
  ```jsonc
  {
    "id": "1733856000000",          // gerado com Date.now().toString()
    "name": "Streamer Name",        // nome do streamer
    "platform": "twitch",           // plataforma de streaming (Twitch, YouTube, etc.)
    "streamUrl": "https://...",     // URL da live
    "avatarUrl": "https://...",     // imagem/avatar
    "category": "FPS",              // categoria de conteúdo
    "isOnline": false,               // status ao vivo
    "isFeatured": false,             // destaque
    "createdAt": "2025-08-10T10:00:00.000Z",      // data de criação em ISO
    "lastStatusUpdate": "2025-08-10T10:00:00.000Z" // última atualização de status em ISO
  }
  ```

- matches (estrutura de dados)
  - tournamentId: string — ID do torneio selecionado
  - team1Id: string — ID do primeiro time
  - team2Id: string — ID do segundo time
  - scheduledDate: string (ISO) — Data e hora agendada
  - format: string — Formato ('MD1', 'MD3', 'MD5')
  - game: string — Jogo (ex.: 'League of Legends')
  - isFeatured: boolean — Destaque
  - tournamentName: string — Nome do torneio (derivado de tournament.name)
  - team1: {
      id: string,
      name: string,
      logo: string | null,
      avatar: string | null
    }
  - team2: {
      id: string,
      name: string,
      logo: string | null,
      avatar: string | null
    }
  - maps: Array<{
      name: string,
      winner: null | 'team1' | 'team2'
    }> — 1, 3 ou 5 mapas conforme o formato
  - status: 'scheduled' | 'ongoing' | 'finished' — Inicial: 'scheduled'
  - result: {
      team1Score: number,
      team2Score: number,
      winner: null | 'team1' | 'team2'
    }
  - resultMD3: {
      team1Score: number, // 0-3
      team2Score: number, // 0-3
      winner: string | null // 'team1' | 'team2'
    }
  - resultMD5: {
      team1Score: number, // 0-5
      team2Score: number, // 0-5
      winner: string | null // 'team1' | 'team2'
    }

  Exemplo (JS):
  ```javascript
  const match = {
    tournamentId: "tourn_001",
    team1Id: "team_alpha",
    team2Id: "team_beta",
    scheduledDate: new Date().toISOString(),
    format: "MD3",
    game: "Fortnite: Ballistic",
    isFeatured: true,

    tournamentName: "Ballistic Open",

    team1: { id: "team_alpha", name: "Alpha", logo: null, avatar: null },
    team2: { id: "team_beta", name: "Beta", logo: null, avatar: null },

    maps: [
      { name: "Mapa 1", winner: null },
      { name: "Mapa 2", winner: null },
      { name: "Mapa 3", winner: null }
    ],

    status: "scheduled",

    result: { team1Score: 0, team2Score: 0, winner: null },
    resultMD3: { team1Score: 0, team2Score: 0, winner: null },
    resultMD5: { team1Score: 0, team2Score: 0, winner: null }
  }
  ```

- tournaments (estrutura de dados)
  - name: string — Nome do torneio
  - game: string — Jogo
  - format: string — Formato do torneio
  - description: string — Descrição
  - startDate: Date/Timestamp — Data de início
  - endDate: Date/Timestamp — Data de término
  - registrationDeadline: Date/Timestamp — Prazo de inscrição
  - maxParticipants: number — Máximo de participantes
  - prizePool: number — Premiação em R$
  - entryFee: number — Taxa de inscrição em R$
  - rules: string — Regras do torneio
  - status: string — Status do torneio (ex.: "upcoming", "ongoing", "finished")
  - isActive: boolean — Torneio ativo/inativo

  Exemplo (JSONC):
  ```jsonc
  {
    "name": "Ballistic Open",
    "game": "Fortnite: Ballistic",
    "format": "Eliminação simples",
    "description": "Torneio aberto à comunidade",
    "startDate": "2025-08-20T18:00:00.000Z",
    "endDate": "2025-08-21T22:00:00.000Z",
    "registrationDeadline": "2025-08-18T23:59:59.000Z",
    "maxParticipants": 64,
    "prizePool": 5000,
    "entryFee": 0,
    "rules": "Sem trapaças, seguir fair play.",
    "status": "upcoming",
    "isActive": true
  }
  ```


- teams (estrutura de dados)
  - name: string — Nome da equipe
  - tag: string — Tag (usar maiúsculas, ex.: `TAG`)
  - game: string — Jogo
  - region: string — Região
  - description: string — Descrição da equipe
  - members: string[] — Lista de membros (IDs/nomes; filtrar vazios)
  - captain: string — Capitão (ID/nome)
  - contactEmail: string — Email de contato
  - discordServer: string — URL/ID do servidor Discord
  - avatar: string — URL do avatar
  - isActive: boolean — Equipe ativa

  Exemplo (JSONC):
  ```jsonc
  {
    "name": "Equipe Alpha",                 // Nome da equipe
    "tag": "ALPHA",                        // Tag da equipe (maiúsculas)
    "game": "Fortnite: Ballistic",         // Jogo
    "region": "BR",                        // Região
    "description": "Time competitivo...",  // Descrição da equipe
    "members": ["user_1", "user_2"],      // Lista de membros (sem strings vazias)
    "captain": "user_1",                   // Capitão
    "contactEmail": "contato@alpha.gg",    // Email de contato
    "discordServer": "https://discord.gg/abc123", // Servidor do Discord
    "avatar": "https://example.com/logo.png",      // URL do avatar
    "isActive": true                         // Equipe ativa
  }
  ```

