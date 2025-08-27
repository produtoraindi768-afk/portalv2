# Layout System Guide - Portal SafeZone

## 📐 Padronização de Layout Implementada

Este guia documenta o sistema de layout padronizado implementado para garantir consistência visual, tipográfica e de espaçamento em todas as páginas do portal.

## 🏗️ Componentes do Sistema

### 1. PageWrapper
**Localização**: `@/components/layout/PageWrapper`

Container principal que define largura máxima, centralização e padding das páginas.

```tsx
<PageWrapper 
  maxWidth="standard"    // narrow | standard | wide | full
  paddingY="normal"      // none | compact | normal | spacious | hero
  paddingX="normal"      // none | normal | wide
  centered={true}        // centralização horizontal
>
  {children}
</PageWrapper>
```

**Larguras Máximas:**
- `narrow`: max-w-4xl (768px) - artigos, formulários
- `standard`: max-w-6xl (1152px) - padrão para maioria das páginas
- `wide`: max-w-7xl (1280px) - dashboards, tabelas de dados
- `full`: sem restrição - hero sections, layouts full-width

### 2. SectionWrapper
**Localização**: `@/components/layout/SectionWrapper`

Define seções semânticas com espaçamento consistente e variações de fundo.

```tsx
<SectionWrapper
  as="section"           // section | div | article | main | aside
  spacing="normal"       // none | compact | normal | spacious | hero
  background="transparent" // transparent | subtle | card | muted | gradient
  fullWidth={false}
>
  {children}
</SectionWrapper>
```

### 3. ContentWrapper
**Localização**: `@/components/layout/ContentWrapper`

Organiza conteúdo com patterns de layout responsivos.

```tsx
<ContentWrapper
  layout="stack"         // stack | grid-2 | grid-3 | grid-4 | flex | centered
  gap="normal"          // tight | normal | loose | spacious
  align="stretch"       // start | center | end | stretch
  justify="start"       // start | center | end | between | around
>
  {children}
</ContentWrapper>
```

### 4. Typography
**Localização**: `@/components/ui/typography`

Sistema tipográfico consistente com hierarquia padronizada.

```tsx
<Typography 
  variant="h1"          // h1-h6 | body-lg | body | body-sm | caption | lead | muted
  as="h1"              // elemento HTML a ser renderizado
  align="left"         // left | center | right
  maxWidth="none"      // none | prose | narrow | wide
>
  {children}
</Typography>
```

**Hierarquia Tipográfica:**
- `h1`: 3xl/tight font-bold - Títulos principais de página (balanceado)
- `h2`: 2xl/tight font-bold - Cabeçalhos de seção
- `h3`: xl/tight font-semibold - Subcabeçalhos
- `h4`: lg font-semibold - Títulos de componentes
- `h5`: base font-medium - Pequenos cabeçalhos
- `h6`: sm font-medium - Menores cabeçalhos
- `hero`: 4xl/tight font-bold - Títulos hero especiais (impacto visual)
- `body-lg`: lg - Texto de corpo grande
- `body`: base - Texto padrão
- `lead`: lg text-muted-foreground - Parágrafos introdutórios
- `muted`: base text-muted-foreground - Texto auxiliar

### 5. PageLayout (High-level)
**Localização**: `@/components/layout/PageLayout`

Combina todos os componentes em patterns pré-configurados.

```tsx
<PageLayout 
  pattern="default"     // default | narrow | wide | hero | dashboard | article
  title="Título da Página"
  description="Descrição opcional"
  showHeader={true}
>
  {children}
</PageLayout>
```

## 📱 Sistema Responsivo

### Breakpoints Utilizados
Seguindo o padrão Tailwind CSS:

```css
/* Mobile first approach */
xs: 320px    /* Mobile pequeno */
sm: 640px    /* Mobile grande / Tablet pequeno */  
md: 768px    /* Tablet */
lg: 1024px   /* Desktop pequeno */
xl: 1280px   /* Desktop */
2xl: 1536px  /* Desktop grande */
```

### Padrões Responsivos

#### Espaçamento Responsivo
```tsx
// Padding vertical adaptativo
paddingY="normal"  // py-6 sm:py-8
paddingY="spacious" // py-8 sm:py-12
paddingY="hero"    // py-12 sm:py-16 lg:py-20

// Gaps responsivos
gap="normal"       // gap-6
gap="loose"        // gap-8
gap="spacious"     // gap-12
```

#### Grids Responsivos
```tsx
// Grid 3 colunas responsivo
layout="grid-3"    // grid-cols-1 sm:grid-cols-2 lg:grid-cols-3

// Grid 4 colunas responsivo  
layout="grid-4"    // grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
```

#### Tipografia Responsiva
```tsx
// Títulos que escalam
variant="h1"       // text-4xl/tight sm:text-5xl/tight
variant="h2"       // text-3xl/tight sm:text-4xl/tight
variant="lead"     // text-xl sm:text-2xl/relaxed
```

## 🎨 Patterns de Página

### 1. Default Pattern
Para páginas padrão de conteúdo:
```tsx
<PageLayout pattern="default" title="Título" description="Descrição">
  <Card>
    <CardContent>Conteúdo da página</CardContent>
  </Card>
</PageLayout>
```
- Max-width: 6xl (1152px)
- Padding: normal
- Spacing: normal

### 2. Narrow Pattern  
Para artigos e formulários:
```tsx
<PageLayout pattern="narrow" title="Artigo">
  <Typography variant="body" maxWidth="prose">
    Conteúdo do artigo com largura otimizada para leitura
  </Typography>
</PageLayout>
```
- Max-width: 4xl (768px)
- Padding: normal
- Ideal para textos longos

### 3. Wide Pattern
Para dashboards e tabelas:
```tsx
<PageLayout pattern="wide" title="Dashboard">
  <ContentWrapper layout="grid-4" gap="loose">
    {dashboardCards}
  </ContentWrapper>
</PageLayout>
```
- Max-width: 7xl (1280px)  
- Padding: compact
- Ideal para dados tabulares

### 4. Dashboard Pattern
Para interfaces administrativas:
```tsx
<DashboardPageLayout showHeader={false}>
  <ContentWrapper layout="stack" gap="normal">
    {adminContent}
  </ContentWrapper>
</DashboardPageLayout>
```
- Max-width: wide
- Spacing: compact
- Sem header por padrão

## 🔧 Uso Prático

### Exemplo 1: Página de Perfil
```tsx
export function PlayerProfile() {
  return (
    <PageLayout pattern="default" showHeader={false}>
      <ContentWrapper layout="stack" gap="loose">
        {/* Header do perfil */}
        <div className="bg-gradient-to-r from-primary/20 to-transparent rounded-xl p-6">
          <ContentWrapper layout="flex" align="center" gap="normal">
            <Avatar className="h-32 w-32" />
            <div>
              <Typography variant="h1">{playerName}</Typography>
              <Typography variant="muted">@{username}</Typography>
            </div>
          </ContentWrapper>
        </div>
        
        {/* Conteúdo em tabs */}
        <Tabs>
          {tabsContent}
        </Tabs>
      </ContentWrapper>
    </PageLayout>
  )
}
```

### Exemplo 2: Lista de Partidas
```tsx
export function MatchesContent() {
  return (
    <PageLayout pattern="wide" showHeader={false}>
      <ContentWrapper layout="stack" gap="loose">
        {/* Header com filtros */}
        <ContentWrapper layout="stack" gap="normal">
          <Typography variant="h1">Partidas</Typography>
          <ContentWrapper layout="flex" justify="between" gap="normal">
            <Input placeholder="Buscar..." />
            <Button>Filtros</Button>
          </ContentWrapper>
        </ContentWrapper>
        
        {/* Grid de partidas */}
        <ContentWrapper layout="grid-3" gap="normal">
          {matches.map(match => <MatchCard key={match.id} match={match} />)}
        </ContentWrapper>
      </ContentWrapper>
    </PageLayout>
  )
}
```

## ✅ Boas Práticas

### ✅ DO
- **Sempre use PageLayout** para páginas completas
- **Prefira patterns pré-configurados** (default, narrow, wide, etc.)
- **Use Typography** para todos os textos
- **Combine components** para layouts customizados
- **Siga mobile-first** na responsividade
- **Use variáveis do tema** para cores e espaçamentos

### ❌ DON'T
- ~~Hardcode larguras máximas~~ → Use maxWidth props
- ~~Hardcode padding/margin~~ → Use paddingY/paddingX props
- ~~Use h1, h2 diretamente~~ → Use Typography variants
- ~~Ignore responsividade~~ → Teste em diferentes telas
- ~~Misture sistemas~~ → Use apenas componentes do sistema

## 🔍 Checklist de Validação

### Para cada nova página:
- [ ] Usa PageLayout ou componentes do sistema
- [ ] Título usa Typography variant apropriado
- [ ] Largura máxima definida corretamente
- [ ] Espaçamento consistente com o design system
- [ ] Responsivo em mobile, tablet e desktop
- [ ] Usa variáveis do tema para cores
- [ ] Acessível (estrutura semântica correta)

### Para componentes reutilizáveis:
- [ ] Usa ContentWrapper para organização interna
- [ ] Props de layout são flexíveis
- [ ] Funciona dentro de diferentes containers
- [ ] Mantém proporções em diferentes telas
- [ ] Usa Typography para textos

## 📊 Resultados Esperados

Com este sistema implementado, conseguimos:

✅ **Consistência Visual**: Todas as páginas seguem os mesmos padrões  
✅ **Responsividade**: Layout se adapta perfeitamente a qualquer tela  
✅ **Manutenibilidade**: Mudanças centralizadas nos componentes base  
✅ **Produtividade**: Desenvolvimento mais rápido com patterns prontos  
✅ **Acessibilidade**: Estrutura semântica e hierarquia consistente  
✅ **Performance**: CSS otimizado com Tailwind e variáveis CSS

---

## 📞 Suporte

Para dúvidas sobre o sistema de layout:
1. Consulte os examples nos próprios componentes
2. Verifique este guia
3. Analise implementações existentes no codebase
4. Documente novos patterns que surgirem

**Versão**: 1.0  
**Última atualização**: Dezembro 2024