/**
 * Console Cleaner Script
 * Execute este script no console do navegador para filtrar warnings em tempo real
 * 
 * Para usar:
 * 1. Abra o console do navegador (F12)
 * 2. Cole este código e pressione Enter
 * 3. O console será filtrado automaticamente
 */

(function() {
  'use strict';
  
  // Patterns para suprimir
  const suppressPatterns = [
    /React Router Future Flag Warning/,
    /Download the React DevTools/,
    /Vercel Web Analytics/,
    /Amazon IVS Player SDK/,
    /MediaCapabilities found/,
    /Permissions policy violation/,
    /deviceorientation events are blocked/,
    /429.*Too Many Requests/,
    /gql\.twitch\.tv/,
    /passport\.twitch\.tv/,
    /sentry\.io/,
    /x-kpsdk-v=j-/,
    /VM\d+:\d+\s+Error$/,
  ];
  
  // URLs para suprimir
  const suppressUrls = [
    'gql.twitch.tv',
    'passport.twitch.tv',
    'sentry.io',
  ];
  
  function shouldSuppress(message) {
    const str = String(message);
    return suppressPatterns.some(pattern => pattern.test(str)) ||
           suppressUrls.some(url => str.includes(url));
  }
  
  // Salvar métodos originais
  const original = {
    log: console.log,
    warn: console.warn,
    error: console.error,
    info: console.info,
  };
  
  // Interceptar console methods
  console.log = function(...args) {
    if (!shouldSuppress(args.join(' '))) {
      original.log.apply(console, args);
    }
  };
  
  console.warn = function(...args) {
    if (!shouldSuppress(args.join(' '))) {
      original.warn.apply(console, args);
    }
  };
  
  console.error = function(...args) {
    if (!shouldSuppress(args.join(' '))) {
      original.error.apply(console, args);
    }
  };
  
  console.info = function(...args) {
    if (!shouldSuppress(args.join(' '))) {
      original.info.apply(console, args);
    }
  };
  
  // Interceptar network errors
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    return originalFetch.apply(this, args).catch(error => {
      if (!shouldSuppress(error.message)) {
        throw error;
      }
      // Silenciosamente falhar para requests filtrados
      return Promise.reject(error);
    });
  };
  
  // Limpar console atual
  console.clear();
  
  console.log('%c✅ Console Cleaner Ativado!', 'color: green; font-weight: bold;');
  console.log('%cWarnings não críticos serão filtrados automaticamente.', 'color: #666;');
  
  // Função para restaurar console original
  window.restoreConsole = function() {
    console.log = original.log;
    console.warn = original.warn;
    console.error = original.error;
    console.info = original.info;
    window.fetch = originalFetch;
    console.log('%c🔄 Console restaurado ao estado original', 'color: orange; font-weight: bold;');
  };
  
  console.log('%cPara restaurar o console original, execute: restoreConsole()', 'color: #666;');
  
})();
