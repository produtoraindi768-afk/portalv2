/**
 * Console filter otimizado para desenvolvimento
 * Filtra automaticamente warnings não críticos
 */

// Patterns para filtrar
const FILTER_PATTERNS = [
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
  /deviceorientation events are blocked/,
  /sentry\.io.*429/,
  /x-kpsdk-v=j-/,
  /The deviceorientation events/,
  /Violation.*accelerometer/
]

function shouldFilter(message: string): boolean {
  return FILTER_PATTERNS.some(pattern => pattern.test(message))
}

// Aplicar filtro apenas em desenvolvimento
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  const original = {
    log: console.log,
    warn: console.warn,
    error: console.error,
  }

  console.log = (...args: any[]) => {
    const message = args.join(' ')
    if (!shouldFilter(message)) {
      original.log(...args)
    }
  }

  console.warn = (...args: any[]) => {
    const message = args.join(' ')
    if (!shouldFilter(message)) {
      original.warn(...args)
    }
  }

  console.error = (...args: any[]) => {
    const message = args.join(' ')
    if (!shouldFilter(message)) {
      original.error(...args)
    }
  }

  // Função global para restaurar console
  ;(window as any).restoreConsole = () => {
    Object.assign(console, original)
    console.log('🔄 Console restaurado ao estado original')
  }

  // Log inicial (apenas uma vez)
  setTimeout(() => {
    console.log('🧹 Console filter ativo - warnings não críticos filtrados')
  }, 1000)
}

export { shouldFilter }
