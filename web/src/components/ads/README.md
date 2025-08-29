# Componentes AdSense

Este diretório contém os componentes para integração com Google AdSense no projeto.

## Configuração

O script do AdSense já está configurado no `layout.tsx` principal com o client ID: `ca-pub-4101364659538880`

## Componentes Disponíveis

### AdSense (Componente Base)

Componente principal que aceita todas as configurações do AdSense.

```tsx
import { AdSense } from '@/components/ads'

<AdSense
  adSlot="1234567890"
  adFormat="auto"
  className="my-4"
  responsive
/>
```

### ResponsiveAd

Anúncio responsivo que se adapta ao tamanho da tela.

```tsx
import { ResponsiveAd } from '@/components/ads'

<ResponsiveAd adSlot="1234567890" />
```

### RectangleAd

Anúncio em formato retângulo (300x250px).

```tsx
import { RectangleAd } from '@/components/ads'

<RectangleAd adSlot="1234567890" />
```

### BannerAd

Banner horizontal (728x90px).

```tsx
import { BannerAd } from '@/components/ads'

<BannerAd adSlot="1234567890" />
```

### SidebarAd

Anúncio vertical para sidebar (160x600px).

```tsx
import { SidebarAd } from '@/components/ads'

<SidebarAd adSlot="1234567890" />
```

## Propriedades

### AdSense Props

- `adSlot` (string, obrigatório): ID do slot do anúncio no AdSense
- `adFormat` (string, opcional): Formato do anúncio ('auto', 'rectangle', 'vertical', 'horizontal')
- `adLayout` (string, opcional): Layout personalizado
- `adLayoutKey` (string, opcional): Chave do layout personalizado
- `className` (string, opcional): Classes CSS adicionais
- `style` (CSSProperties, opcional): Estilos inline
- `responsive` (boolean, opcional): Se o anúncio deve ser responsivo (padrão: true)

## Como Obter o Ad Slot

1. Acesse o [Google AdSense](https://www.google.com/adsense/)
2. Vá para "Anúncios" > "Por site"
3. Crie uma nova unidade de anúncio
4. Copie o `data-ad-slot` do código gerado
5. Use esse valor na prop `adSlot`

## Exemplo de Uso em Páginas

```tsx
// Em uma página de notícias
import { ResponsiveAd, RectangleAd } from '@/components/ads'

export default function NewsPage() {
  return (
    <div>
      <h1>Notícias</h1>
      
      {/* Anúncio responsivo no topo */}
      <ResponsiveAd adSlot="1234567890" />
      
      <article>
        {/* Conteúdo da notícia */}
      </article>
      
      {/* Anúncio retângulo no meio do conteúdo */}
      <RectangleAd adSlot="0987654321" className="my-8" />
      
      <article>
        {/* Mais conteúdo */}
      </article>
    </div>
  )
}
```

## Boas Práticas

1. **Não abuse dos anúncios**: Mantenha um equilíbrio entre conteúdo e anúncios
2. **Use slots diferentes**: Cada posição deve ter seu próprio ad slot
3. **Teste a responsividade**: Verifique como os anúncios aparecem em diferentes tamanhos de tela
4. **Monitore a performance**: Acompanhe as métricas no painel do AdSense
5. **Respeite as políticas**: Siga as diretrizes do Google AdSense

## Troubleshooting

### Anúncios não aparecem

1. Verifique se o client ID está correto no `layout.tsx`
2. Confirme se o ad slot está ativo no painel do AdSense
3. Aguarde até 24h para novos slots serem ativados
4. Verifique se não há bloqueadores de anúncios ativos

### Erros no console

- Verifique se o script do AdSense está carregando corretamente
- Confirme se os ad slots estão configurados corretamente
- Verifique se o domínio está autorizado no AdSense