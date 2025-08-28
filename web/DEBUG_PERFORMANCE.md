# 🚀 Debug e Monitoramento de Performance

Este guia mostra como monitorar e debuggar as otimizações implementadas no seu projeto.

## 📊 Monitoramento em Tempo Real

### No Console do Navegador

```javascript
// Relatório geral de performance
window.perf.getReport()

// Web Vitals (LCP, CLS, TTFB)
window.perf.getWebVitals()

// Status do cache de requests
window.requestCache.getStats()

// Status das conexões WebSocket
window.wsOptimizer.getConnectionStatus()

// Status do cache GraphQL
window.gqlOptimizer.getCacheStats()
```

### Métricas Automáticas

O sistema monitora automaticamente e reporta no console:

- ⚠️ **Requests lentos** (>500ms)
- 📦 **Cache hit/miss rates** 
- 🐌 **Gargalos de performance**
- 📺 **Players Twitch lentos**

## 🔧 Ferramentas de Debug

### 1. Performance Monitor

```javascript
// Iniciar monitoramento manual
window.performanceMonitor.startAutoMonitoring()

// Parar monitoramento
window.performanceMonitor.stopAutoMonitoring()

// Marcar início de operação
window.perf.mark('operacao-inicio')

// Marcar fim e medir
window.perf.mark('operacao-fim')
window.perf.measure('operacao-completa', 'operacao-inicio', 'operacao-fim')
```

### 2. Cache de Requests

```javascript
// Forçar invalidação do cache
window.requestCache.invalidate('featured-streamers')

// Limpar todo o cache
window.requestCache.invalidate(/.*/)

// Prefetch dados
window.requestCache.prefetch('dados-importantes', async () => {
  // Sua função de fetch aqui
})
```

### 3. WebSocket Optimizer

```javascript
// Status de todas as conexões
console.table(window.wsOptimizer.getConnectionStatus())

// Fechar conexão específica
window.wsOptimizer.closeConnection('twitch-chat')

// Fechar todas
window.wsOptimizer.closeAllConnections()
```

### 4. GraphQL Optimizer

```javascript
// Executar query com cache
window.gqlOptimizer.query(`
  query GetStreamers {
    streamers { id name isOnline }
  }
`, {}, { cache: true, priority: 'high' })

// Invalidar cache GraphQL
window.gqlOptimizer.invalidateCache('streamers')

// Prefetch queries comuns
window.gqlOptimizer.prefetch([
  { query: 'query GetStreamers { streamers { id name } }' },
  { query: 'query GetFeatured { featured { id } }' }
])
```

## 📈 Interpretando Métricas

### Cache Hit Rate
- **>80%**: Excelente ✅
- **50-80%**: Bom 👍
- **<50%**: Precisa melhorar ⚠️

### Request Duration
- **<100ms**: Rápido ✅
- **100-300ms**: Aceitável 👍
- **>300ms**: Lento ⚠️

### WebSocket Status
- **OPEN**: Conectado ✅
- **CONNECTING**: Conectando 🔄
- **PENDING**: Problema ⚠️
- **CLOSED**: Desconectado ❌

## 🐛 Troubleshooting

### Problema: Requests GraphQL ainda lentos

```javascript
// 1. Verificar cache
console.log(window.gqlOptimizer.getCacheStats())

// 2. Forçar cache mais agressivo
window.gqlOptimizer.query(query, vars, { 
  cache: true, 
  cacheTtl: 60000, // 1 minuto
  priority: 'high' 
})

// 3. Usar batching
// Múltiplas queries próximas serão automaticamente agrupadas
```

### Problema: WebSocket Pending

```javascript
// 1. Verificar status
console.log(window.wsOptimizer.getConnectionStatus())

// 2. Fechar e reconectar
window.wsOptimizer.closeConnection('problema-ws')

// 3. Usar timeout menor
window.wsOptimizer.createOptimizedConnection('novo-ws', {
  url: 'wss://example.com',
  timeout: 3000 // 3 segundos
})
```

### Problema: Cache não funcionando

```javascript
// 1. Verificar stats
console.log(window.requestCache.getStats())

// 2. Limpar e resetar
window.requestCache.cleanup()

// 3. Forçar refresh
window.requestCache.get('key', fetcher, { forceRefresh: true })
```

## 📊 Bundle Analysis

Para analisar o tamanho dos bundles:

```bash
# Gerar análise do webpack
ANALYZE=true npm run build

# Isso abrirá automaticamente o Bundle Analyzer
```

## ⚡ Dicas de Performance

### Para Twitch Players
```javascript
// Preload players populares
window.optimizedTwitchPlayer.preloadPlayer('streamer-popular')

// Verificar pool de players
console.log(window.optimizedTwitchPlayer.getStats())
```

### Para Requests Firebase
```javascript
// Usar cache utils
import { cachedFirebaseUtils } from '@/lib/request-cache'

// Em vez de getDocs direto
const streamers = await cachedFirebaseUtils.getFeaturedStreamers()
```

### Para Componentes React
```javascript
// Use React.memo para componentes pesados
export default React.memo(ComponentePesado)

// Use useMemo para cálculos complexos
const dadosProcessados = React.useMemo(() => {
  return processarDados(dadosOriginais)
}, [dadosOriginais])
```

## 🎯 Metas de Performance

### Core Web Vitals
- **LCP**: <2.5s
- **FID**: <100ms  
- **CLS**: <0.1

### Métricas Customizadas
- **Cache Hit Rate**: >80%
- **GraphQL Avg Response**: <200ms
- **WebSocket Connect Time**: <1s
- **Bundle Chunks**: <10

## 📝 Logs Úteis

O sistema automaticamente logga:

```
🚀 Performance Monitor Report
📦 GraphQL cache hit: query GetStreamers...
✅ WebSocket connected: twitch-chat
🐌 Slow request detected: /api/data took 523ms
🧹 Cleaned up 5 expired cache entries
```

Monitore esses logs para identificar problemas em tempo real.
