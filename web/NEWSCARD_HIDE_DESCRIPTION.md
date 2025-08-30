# NewsCard - Ocultando Descrição

O componente `NewsCard` agora possui uma nova prop `hideDescription` que permite ocultar a descrição/excerpt dos cards de notícias.

## Nova Prop

```typescript
hideDescription?: boolean // Nova prop para ocultar a descrição
```

## Como Usar

### Exemplo 1: Card padrão sem descrição
```tsx
<NewsCard 
  article={article}
  variant="default"
  hideDescription={true}
/>
```

### Exemplo 2: Card featured sem descrição
```tsx
<NewsCard 
  article={article}
  variant="featured"
  hideDescription={true}
/>
```

### Exemplo 3: Card compact (não afetado)
```tsx
<NewsCard 
  article={article}
  variant="compact"
  hideDescription={true} // Não tem efeito no variant compact
/>
```

## Implementação no NewsGrid

Para aplicar globalmente no NewsGrid, você pode modificar o componente:

```tsx
// No arquivo NewsGrid.tsx
<NewsCard 
  article={article}
  variant={isFeaturedDisplay ? "featured" : "default"}
  priority={index === 0}
  hideDescription={true} // Adicione esta linha para ocultar descrições
/>
```

## Comportamento

- **Variant `default`**: Remove o parágrafo com a descrição/excerpt
- **Variant `featured`**: Remove o parágrafo com a descrição/excerpt
- **Variant `compact`**: Não é afetado (compact não exibe descrição)

## Casos de Uso

1. **Cards mais limpos**: Para layouts onde você quer focar apenas no título
2. **Performance**: Reduz o conteúdo renderizado
3. **Design específico**: Para seções onde a descrição não é necessária

## Exemplo Prático

Se você quiser ocultar as descrições apenas em uma seção específica:

```tsx
function NoticiasSection() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {articles.map((article) => (
        <NewsCard 
          key={article.id}
          article={article}
          hideDescription={true} // Oculta descrição nesta seção
        />
      ))}
    </div>
  )
}
```

Esta implementação permite controle granular sobre quando exibir ou ocultar as descrições nos cards de notícias.