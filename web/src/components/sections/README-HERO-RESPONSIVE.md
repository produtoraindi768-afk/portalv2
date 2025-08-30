# Hero Sections Responsivos

Este diretório contém diferentes versões do componente Hero para otimizar o uso do espaço em diferentes tamanhos de tela.

## Componentes Disponíveis

### 1. `AppleHeroSection.tsx` (Original)
- Layout completo com grid de 2 colunas
- Melhor para telas desktop e tablets
- Inclui título, excerpt, botão CTA e imagem em colunas separadas

### 2. `AppleHeroSectionCompact.tsx` (Novo - Compacto)
- Layout compacto com título sobreposto na imagem
- Otimizado para dispositivos móveis
- Economiza espaço vertical significativamente
- Mantém a funcionalidade essencial (título + imagem)

### 3. `ResponsiveAppleHero.tsx` (Novo - JavaScript)
- Alterna entre versões usando JavaScript
- Detecta tamanho da tela em tempo real
- Usa `window.innerWidth` para decidir qual componente renderizar

### 4. `AppleHeroResponsive.tsx` (Novo - CSS Only)
- **RECOMENDADO**: Versão mais eficiente
- Usa apenas classes Tailwind CSS para responsividade
- Melhor performance (sem JavaScript para detecção)
- Layout único que se adapta automaticamente

## Como Usar

### Opção 1: Substituição Direta (Recomendado)
```tsx
// Substitua o import original
// import AppleHeroSection from "@/components/sections/AppleHeroSection"

// Por esta versão responsiva
import AppleHeroResponsive from "@/components/sections/AppleHeroResponsive"

export default function HomePage() {
  return (
    <div>
      <AppleHeroResponsive />
      {/* resto do conteúdo */}
    </div>
  )
}
```

### Opção 2: Componentes Separados
```tsx
import AppleHeroSection from "@/components/sections/AppleHeroSection"
import AppleHeroSectionCompact from "@/components/sections/AppleHeroSectionCompact"

export default function HomePage() {
  return (
    <div>
      {/* Versão desktop */}
      <div className="hidden md:block">
        <AppleHeroSection />
      </div>
      
      {/* Versão mobile */}
      <div className="block md:hidden">
        <AppleHeroSectionCompact />
      </div>
    </div>
  )
}
```

### Opção 3: JavaScript Responsivo
```tsx
import ResponsiveAppleHero from "@/components/sections/ResponsiveAppleHero"

export default function HomePage() {
  return (
    <div>
      <ResponsiveAppleHero />
    </div>
  )
}
```

## Breakpoints

- **Mobile (< 768px)**: Layout compacto com título sobreposto
- **Desktop (>= 768px)**: Layout completo com grid de 2 colunas

## Características da Versão Compacta

### Layout Mobile
- Imagem com aspect ratio 16:9
- Título sobreposto na parte inferior da imagem
- Gradient overlay para melhor legibilidade
- Badge de categoria no canto superior esquerdo
- Sem excerpt ou botão CTA para economizar espaço

### Fallback sem Imagem
- Container com border dashed
- Título centralizado
- Badge de categoria acima do título
- Mantém a mesma altura para consistência

## Performance

### `AppleHeroResponsive.tsx` (Melhor)
- ✅ Renderização única
- ✅ CSS-only responsividade
- ✅ Sem JavaScript adicional
- ✅ Melhor SEO (conteúdo sempre presente)

### `ResponsiveAppleHero.tsx`
- ⚠️ Renderização condicional
- ⚠️ Requer JavaScript
- ⚠️ Pode causar layout shift
- ⚠️ Duplicação de código

## Customização

Todos os componentes seguem o mesmo padrão de props e mantêm compatibilidade com:
- Variáveis de tema do Tailwind
- Sistema de cores do shadcn/ui
- Componentes de layout existentes
- Formatação de texto (`formatNewsTitle`)

## Migração

Para migrar do componente original:

1. **Backup**: Mantenha o componente original como fallback
2. **Teste**: Use `AppleHeroResponsive` em uma página de teste
3. **Substitua**: Quando satisfeito, substitua as importações
4. **Cleanup**: Remova componentes não utilizados após confirmação

```bash
# Exemplo de busca e substituição
grep -r "AppleHeroSection" src/
# Substitua manualmente ou use ferramenta de refactoring
```