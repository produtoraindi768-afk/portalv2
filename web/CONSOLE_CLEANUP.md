# Console Cleanup Guide

Durante o desenvolvimento, o console pode ficar poluído com warnings e logs não críticos do Twitch, React Router, Vercel Analytics, etc. Este guia mostra como limpar o console.

## 🚀 Solução Rápida (Recomendada)

**Cole este código no console do navegador (F12):**

```javascript
console.clear();
const original = { log: console.log, warn: console.warn, error: console.error };
const filters = [
  /React Router Future Flag Warning/,
  /Download the React DevTools/,
  /Vercel Web Analytics/,
  /Amazon IVS Player SDK/,
  /MediaCapabilities found/,
  /429.*Too Many Requests/,
  /gql\.twitch\.tv/,
  /passport\.twitch\.tv/,
  /VM\d+:\d+\s+Error$/,
  /Player stopping playback/,
  /Permissions policy violation/,
  /deviceorientation events are blocked/
];
function shouldFilter(msg) { return filters.some(f => f.test(String(msg))); }
console.log = (...args) => { if (!shouldFilter(args.join(' '))) original.log(...args); };
console.warn = (...args) => { if (!shouldFilter(args.join(' '))) original.warn(...args); };
console.error = (...args) => { if (!shouldFilter(args.join(' '))) original.error(...args); };
console.log('✅ Console filter ativado! Warnings não críticos serão filtrados.');
window.restoreConsole = () => { Object.assign(console, original); console.log('🔄 Console restaurado'); };
```

## 📋 O que é filtrado

- ✅ **React Router Future Flag Warnings** - Avisos sobre futuras versões
- ✅ **Vercel Web Analytics** - Logs de analytics em desenvolvimento  
- ✅ **Amazon IVS Player SDK** - Logs internos do player Twitch
- ✅ **Twitch Rate Limiting (429)** - Erros de muitas requisições
- ✅ **MediaCapabilities** - Logs de capacidades de mídia
- ✅ **VM Errors** - Erros genéricos de scripts externos
- ✅ **Permissions Policy** - Avisos de política de permissões

## 🔄 Para restaurar o console original

```javascript
restoreConsole()
```

## 🛠️ Logs importantes que NÃO são filtrados

- ❌ **Erros de JavaScript** - Erros reais do seu código
- ❌ **Erros de rede importantes** - Falhas de API críticas
- ❌ **Logs de debug do seu código** - console.log() do seu desenvolvimento
- ❌ **Erros de TypeScript** - Problemas de tipagem

## 📝 Notas

1. **Temporário**: O filtro funciona apenas na sessão atual do navegador
2. **Desenvolvimento**: Só afeta o ambiente de desenvolvimento
3. **Reversível**: Pode ser desativado a qualquer momento
4. **Seletivo**: Filtra apenas warnings conhecidos e não críticos

## 🔧 Alternativas

### Opção 1: Filtros do DevTools
1. Abra o console (F12)
2. Clique no ícone de filtro
3. Digite `-"React Router" -"Vercel" -"Amazon IVS" -"429"`

### Opção 2: Limpar manualmente
```javascript
console.clear() // Limpa o console atual
```

### Opção 3: Desabilitar logs específicos
```javascript
// Desabilitar apenas warnings
console.warn = () => {}

// Restaurar warnings
console.warn = console.__proto__.warn
```

## 🎯 Resultado

Após aplicar o filtro, o console mostrará apenas:
- Logs relevantes do seu código
- Erros reais que precisam ser corrigidos
- Informações importantes de debug

Console limpo = desenvolvimento mais produtivo! 🚀
