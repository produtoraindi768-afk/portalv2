### Spec — Internacionalização (i18n) com Suporte ao Inglês

- **ID**: 2025-01-20-i18n-english-support
- **Status**: Ativo
- **Contexto**: Implementar suporte completo ao idioma inglês no Ballistic Hub, incluindo seleção manual de idioma, detecção automática por geolocalização IP e preservação de conteúdo não traduzível (nomes próprios, streamers, campeonatos).

#### Objetivo
Tornar a plataforma acessível para usuários internacionais através da implementação de um sistema de internacionalização robusto que permita navegação em português (padrão) e inglês, mantendo a integridade de nomes próprios e conteúdo específico da comunidade brasileira de Fortnite.

#### Escopo

##### **1. Funcionalidades Principais**
- **Seleção Manual de Idioma**: Componente de seletor de idioma no header
- **Detecção Automática por IP**: Redirecionamento baseado em geolocalização
- **Persistência de Preferência**: Armazenamento da escolha do usuário
- **Tradução de Interface**: Todos os textos da UI traduzidos para inglês
- **Preservação de Conteúdo**: Nomes de streamers, campeonatos e nomes próprios mantidos em português

##### **2. Áreas de Tradução**
- **Navegação Principal**: Header, navegação mobile, footer
- **Páginas de Autenticação**: Login, registro, formulários
- **Seções do Hub**: Hero, notícias, streamers, campeonatos
- **Dashboard e Perfis**: Gerenciamento de equipes, perfis de jogadores
- **Formulários e Validações**: Mensagens de erro, placeholders, labels
- **Notificações**: Toasts, alertas, confirmações

##### **3. Conteúdo Não Traduzível**
- **Nomes de Streamers**: Preservar usernames e nomes de display
- **Nomes de Campeonatos**: Manter nomes oficiais em português
- **Nomes Próprios**: Organizações, equipes, jogadores
- **Termos Específicos**: "Ballistic", marcas, logos
- **Conteúdo de Notícias**: Títulos e textos mantidos no idioma original

#### Arquitetura Técnica

##### **1. Biblioteca de i18n**
```typescript
// Utilizar next-intl para Next.js App Router
dependencies: {
  "next-intl": "^3.0.0",
  "@formatjs/intl-localematcher": "^0.5.0",
  "negotiator": "^0.6.0"
}
```

##### **2. Estrutura de Diretórios**
```
web/
├── src/
│   ├── app/
│   │   ├── [locale]/                    # Rotas localizadas
│   │   │   ├── layout.tsx              # Layout com contexto de idioma
│   │   │   ├── page.tsx                # Home localizada
│   │   │   ├── noticias/               # Notícias localizadas
│   │   │   ├── torneios/               # Campeonatos localizados
│   │   │   └── (auth)/                 # Autenticação localizada
│   │   ├── middleware.ts               # Detecção de idioma e redirecionamento
│   │   └── globals.css
│   ├── i18n/
│   │   ├── locales/
│   │   │   ├── pt.json                # Traduções português
│   │   │   └── en.json                # Traduções inglês
│   │   ├── config.ts                  # Configuração i18n
│   │   ├── types.ts                   # Tipos TypeScript
│   │   └── utils.ts                   # Utilitários de tradução
│   └── components/
│       ├── i18n/
│       │   ├── LanguageSwitcher.tsx   # Seletor de idioma
│       │   └── LocaleProvider.tsx     # Provider de contexto
│       └── layout/
│           └── SiteHeader.tsx         # Header com seletor de idioma
```

##### **3. Configuração de Middleware**
```typescript
// src/app/middleware.ts
import createMiddleware from 'next-intl/middleware'
import { NextRequest } from 'next/server'

const intlMiddleware = createMiddleware({
  locales: ['pt', 'en'],
  defaultLocale: 'pt',
  localeDetection: true
})

export async function middleware(request: NextRequest) {
  // Detecção por geolocalização IP
  const country = request.geo?.country || 'BR'
  const suggestedLocale = getLocaleByCountry(country)
  
  // Aplicar middleware de internacionalização
  return intlMiddleware(request)
}

function getLocaleByCountry(country: string): string {
  const englishSpeakingCountries = ['US', 'GB', 'CA', 'AU', 'IN', 'ZA']
  return englishSpeakingCountries.includes(country) ? 'en' : 'pt'
}
```

##### **4. Estrutura de Traduções**
```json
// src/i18n/locales/en.json
{
  "navigation": {
    "home": "Home",
    "news": "News",
    "matches": "Matches",
    "streams": "Streams",
    "tournaments": "Tournaments"
  },
  "auth": {
    "login": "Log in",
    "signup": "Sign up",
    "email": "Email",
    "password": "Password",
    "forgotPassword": "Forgot your password?",
    "continueWith": "or continue with"
  },
  "hero": {
    "title": "The Ultimate Hub for Fortnite: Ballistic",
    "subtitle": "Follow streams, tournaments, and news from the best Brazilian players",
    "watchStreams": "Watch Streams",
    "latestNews": "Latest News"
  },
  "streamers": {
    "title": "Featured Streamers",
    "live": "LIVE",
    "viewers": "viewers",
    "watchOn": "Watch on Twitch"
  },
  "tournaments": {
    "title": "Upcoming Tournaments",
    "prizePool": "Prize Pool",
    "registrations": "Registrations",
    "startDate": "Start Date"
  },
  "news": {
    "title": "Latest News",
    "readMore": "Read More",
    "publishedOn": "Published on",
    "by": "by"
  },
  "team": {
    "createTeam": "Create Team",
    "joinTeam": "Join Team",
    "teamMembers": "Team Members",
    "captain": "Captain",
    "invitePlayer": "Invite Player"
  },
  "profile": {
    "stats": "Statistics",
    "matches": "Recent Matches",
    "achievements": "Achievements",
    "editProfile": "Edit Profile"
  },
  "common": {
    "loading": "Loading...",
    "error": "An error occurred",
    "tryAgain": "Try Again",
    "save": "Save",
    "cancel": "Cancel",
    "confirm": "Confirm",
    "close": "Close"
  }
}
```

#### Implementação Detalhada

##### **1. Componente Seletor de Idioma**
```tsx
// src/components/i18n/LanguageSwitcher.tsx
'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useRouter, usePathname } from 'next/navigation'
import { Globe } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

const locales = [
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
  { code: 'en', name: 'English', flag: '🇺🇸' }
]

export function LanguageSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const t = useTranslations('common')

  const switchLocale = (newLocale: string) => {
    const newPathname = pathname.replace(`/${locale}`, `/${newLocale}`)
    router.push(newPathname)
    
    // Salvar preferência no localStorage
    localStorage.setItem('preferred-locale', newLocale)
  }

  const currentLocale = locales.find(l => l.code === locale)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">
            {currentLocale?.flag} {currentLocale?.name}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((localeOption) => (
          <DropdownMenuItem
            key={localeOption.code}
            onClick={() => switchLocale(localeOption.code)}
            className="gap-2"
          >
            <span>{localeOption.flag}</span>
            <span>{localeOption.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

##### **2. Hook para Preservação de Conteúdo**
```tsx
// src/hooks/use-preserve-content.ts
import { useLocale } from 'next-intl'

interface PreservableContent {
  streamerName?: string
  tournamentName?: string
  playerName?: string
  organizationName?: string
}

export function usePreserveContent() {
  const locale = useLocale()

  const shouldPreserve = (content: string, type: keyof PreservableContent): boolean => {
    // Lista de padrões que nunca devem ser traduzidos
    const preservePatterns = [
      // Streamers brasileiros conhecidos
      /^(gaules|fallen|coldzera|fer|fnx)/i,
      // Organizações
      /^(furia|mibr|imperial|loud|vikings)/i,
      // Campeonatos específicos
      /^(cblol|blast|esl|iem)/i,
      // Termos específicos do Fortnite
      /^(ballistic|creative|zero build)/i
    ]

    return preservePatterns.some(pattern => pattern.test(content))
  }

  const preserveOrTranslate = (
    originalContent: string,
    translatedContent: string,
    type: keyof PreservableContent
  ): string => {
    if (locale === 'pt' || shouldPreserve(originalContent, type)) {
      return originalContent
    }
    return translatedContent
  }

  return { shouldPreserve, preserveOrTranslate }
}
```

##### **3. Detecção de Geolocalização Avançada**
```typescript
// src/lib/geo-detection.ts
interface GeoData {
  country: string
  region: string
  timezone: string
  preferredLocale: string
}

export async function detectUserLocation(): Promise<GeoData> {
  try {
    // Usar API de geolocalização do Vercel/Cloudflare
    const response = await fetch('/api/geo')
    const data = await response.json()
    
    return {
      country: data.country || 'BR',
      region: data.region || 'SP',
      timezone: data.timezone || 'America/Sao_Paulo',
      preferredLocale: getPreferredLocaleByCountry(data.country)
    }
  } catch (error) {
    // Fallback para detecção via navigator
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    const isBrazilian = timezone.includes('America/Sao_Paulo') || 
                       timezone.includes('America/Manaus') ||
                       timezone.includes('America/Fortaleza')
    
    return {
      country: isBrazilian ? 'BR' : 'US',
      region: 'Unknown',
      timezone,
      preferredLocale: isBrazilian ? 'pt' : 'en'
    }
  }
}

function getPreferredLocaleByCountry(country: string): string {
  const englishCountries = [
    'US', 'GB', 'CA', 'AU', 'NZ', 'IE', 'ZA', 'IN', 'SG', 'MY'
  ]
  
  const spanishCountries = [
    'ES', 'MX', 'AR', 'CO', 'PE', 'VE', 'CL', 'EC', 'GT', 'CU', 'BO',
    'DO', 'HN', 'PY', 'SV', 'NI', 'CR', 'PA', 'UY', 'GQ'
  ]

  if (englishCountries.includes(country)) return 'en'
  if (country === 'BR') return 'pt'
  
  // Para países de língua espanhola, usar inglês como segunda opção
  if (spanishCountries.includes(country)) return 'en'
  
  // Padrão para outros países
  return 'en'
}
```

##### **4. API Route para Detecção de Geolocalização**
```typescript
// src/app/api/geo/route.ts
import { NextRequest, NextResponse } from 'next/server'

export function GET(request: NextRequest) {
  // Obter dados de geolocalização dos headers
  const country = request.geo?.country || 
                 request.headers.get('cf-ipcountry') || 
                 request.headers.get('x-vercel-ip-country') || 
                 'BR'
  
  const region = request.geo?.region || 
                request.headers.get('cf-region') || 
                request.headers.get('x-vercel-ip-region') || 
                'Unknown'
  
  const timezone = request.headers.get('cf-timezone') || 
                  request.headers.get('x-vercel-ip-timezone') || 
                  'America/Sao_Paulo'

  return NextResponse.json({
    country,
    region,
    timezone,
    timestamp: new Date().toISOString()
  })
}
```

#### Critérios de Aceite

##### **1. Funcionalidade de Idiomas**
- **Seleção Manual**: Usuário pode trocar entre PT/EN via seletor no header
- **Persistência**: Escolha do idioma salva e respeitada em sessões futuras
- **Detecção Automática**: Novos usuários redirecionados baseado em geolocalização IP
- **URLs Localizadas**: Rotas incluem prefixo de idioma (/pt/, /en/)

##### **2. Qualidade da Tradução**
- **Interface Completa**: Todos os textos da UI traduzidos para inglês
- **Consistência**: Terminologia consistente em toda a aplicação
- **Preservação**: Nomes próprios mantidos em português conforme regras
- **Contexto**: Traduções adaptadas ao contexto de uso

##### **3. Experiência do Usuário**
- **Transição Suave**: Troca de idioma sem perda de estado da página
- **Indicação Visual**: Estado atual do idioma claramente visível
- **Performance**: Tradução não impacta tempo de carregamento
- **Acessibilidade**: Suporte a leitores de tela para múltiplos idiomas

##### **4. Conteúdo Dinâmico**
- **Notícias**: Títulos e conteúdo preservados no idioma original
- **Streamers**: Nomes de usuário e displays mantidos em português
- **Campeonatos**: Nomes oficiais não traduzidos
- **Dados do Firebase**: Conteúdo dinâmico tratado corretamente

#### Implementação por Fases

##### **Fase 1: Infraestrutura Base (Sprint 1)**
- [ ] Configuração do next-intl
- [ ] Estrutura de arquivos de tradução
- [ ] Middleware de detecção de idioma
- [ ] Rotas localizadas básicas

##### **Fase 2: Componentes Core (Sprint 2)**
- [ ] Seletor de idioma no header
- [ ] Tradução da navegação principal
- [ ] Sistema de preservação de conteúdo
- [ ] Hook de detecção geográfica

##### **Fase 3: Páginas Principais (Sprint 3)**
- [ ] Home page traduzida
- [ ] Páginas de autenticação
- [ ] Seções de streamers e notícias
- [ ] Formulários e validações

##### **Fase 4: Funcionalidades Avançadas (Sprint 4)**
- [ ] Dashboard e perfis traduzidos
- [ ] Gerenciamento de equipes
- [ ] Notificações e toasts
- [ ] Testes de integração completos

##### **Fase 5: Otimização e Refinamento (Sprint 5)**
- [ ] Performance optimization
- [ ] SEO para múltiplos idiomas
- [ ] Analytics de uso por idioma
- [ ] Documentação completa

#### Considerações Técnicas

##### **1. SEO Multilíngue**
```typescript
// src/app/[locale]/layout.tsx
export async function generateMetadata({ params }: { params: { locale: string } }) {
  const t = await getTranslations({ locale: params.locale, namespace: 'metadata' })
  
  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      languages: {
        'pt-BR': '/pt',
        'en-US': '/en',
        'x-default': '/pt'
      }
    },
    openGraph: {
      locale: params.locale === 'pt' ? 'pt_BR' : 'en_US',
      alternateLocale: params.locale === 'pt' ? 'en_US' : 'pt_BR'
    }
  }
}
```

##### **2. Performance e Caching**
- **Lazy Loading**: Traduções carregadas sob demanda
- **Caching**: Arquivo de traduções em cache do browser
- **Bundle Splitting**: Separação por idioma para reduzir bundle inicial
- **Preloading**: Precarregamento do idioma provável do usuário

##### **3. Testes de Qualidade**
```typescript
// Testes automatizados para garantir qualidade das traduções
describe('Internationalization', () => {
  it('should preserve Brazilian streamer names', () => {
    expect(preserveContent('gaules', 'streamer')).toBe('gaules')
  })
  
  it('should translate UI elements correctly', () => {
    expect(t('navigation.home')).toBe('Home')
  })
  
  it('should maintain tournament names in original language', () => {
    expect(preserveContent('CBLOL 2024', 'tournament')).toBe('CBLOL 2024')
  })
})
```

#### Impactos

##### **Positivos**
- **Alcance Global**: Expansão para audiência internacional
- **Melhora da UX**: Experiência nativa para usuários de diferentes idiomas
- **SEO Internacional**: Melhor ranking em buscas internacionais
- **Competitividade**: Diferencial competitivo no mercado global

##### **Considerações**
- **Manutenção**: Necessidade de manter traduções atualizadas
- **Complexidade**: Aumento na complexidade do codebase
- **Custo**: Recursos para tradução e manutenção contínua
- **Performance**: Ligeiro impacto no bundle size inicial

#### Rastreabilidade
- **Change ID**: `@2025-01-20-i18n-english-support/`
- **Componentes Afetados**: Todos os componentes com texto UI
- **Novas Dependências**: next-intl, @formatjs/intl-localematcher
- **Alterações de Arquitetura**: Reestruturação de rotas para suporte a locale
- **Impacto no Bundle**: +50KB (estimado) para arquivos de tradução 