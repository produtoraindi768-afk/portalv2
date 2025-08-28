/**
 * Gerenciamento de Permissions Policy para embeds Twitch
 * Trata warnings e melhora compatibilidade
 */

interface PermissionsPolicyConfig {
  accelerometer?: boolean
  gyroscope?: boolean
  magnetometer?: boolean
  camera?: boolean
  microphone?: boolean
  geolocation?: boolean
  fullscreen?: boolean
  autoplay?: boolean
}

/**
 * Configuração padrão para embeds Twitch
 */
const DEFAULT_TWITCH_PERMISSIONS: PermissionsPolicyConfig = {
  accelerometer: false,
  gyroscope: false,
  magnetometer: false,
  camera: false,
  microphone: false,
  geolocation: false,
  fullscreen: true,
  autoplay: true
}

/**
 * Gerar string de permissions policy para iframe
 */
export function generatePermissionsPolicy(config: PermissionsPolicyConfig = {}): string {
  const finalConfig = { ...DEFAULT_TWITCH_PERMISSIONS, ...config }
  const policies: string[] = []

  Object.entries(finalConfig).forEach(([permission, allowed]) => {
    if (allowed) {
      policies.push(`${permission}=*`)
    } else {
      policies.push(`${permission}=()`)
    }
  })

  return policies.join('; ')
}

/**
 * Criar iframe Twitch com permissions policy otimizada
 */
export function createOptimizedTwitchIframe(
  channel: string,
  options: {
    width?: string
    height?: string
    autoplay?: boolean
    muted?: boolean
    controls?: boolean
    allowFullscreen?: boolean
    customPermissions?: PermissionsPolicyConfig
  } = {}
): HTMLIFrameElement {
  const {
    width = '100%',
    height = '100%',
    autoplay = false,
    muted = true,
    controls = true,
    allowFullscreen = true,
    customPermissions = {}
  } = options

  const iframe = document.createElement('iframe')
  
  // URL do embed
  const params = new URLSearchParams({
    channel,
    autoplay: autoplay.toString(),
    muted: muted.toString(),
    controls: controls.toString(),
    playsinline: 'true'
  })

  // Parents para CORS
  const parents = ['localhost']
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    parents.push(window.location.hostname)
  }
  parents.forEach(parent => params.append('parent', parent))

  iframe.src = `https://player.twitch.tv/?${params.toString()}`
  iframe.width = width
  iframe.height = height
  iframe.frameBorder = '0'
  iframe.scrolling = 'no'

  // Permissions Policy
  const permissionsConfig = {
    ...DEFAULT_TWITCH_PERMISSIONS,
    fullscreen: allowFullscreen,
    autoplay,
    ...customPermissions
  }
  
  iframe.setAttribute('allow', generatePermissionsPolicy(permissionsConfig))

  // Atributos de segurança
  iframe.setAttribute('sandbox', [
    'allow-scripts',
    'allow-same-origin',
    'allow-presentation',
    allowFullscreen ? 'allow-fullscreen' : '',
    autoplay ? 'allow-autoplay' : ''
  ].filter(Boolean).join(' '))

  // Referrer policy para privacidade
  iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin')

  return iframe
}

/**
 * Verificar suporte a permissions
 */
export function checkPermissionSupport(): {
  permissionsAPI: boolean
  accelerometer: boolean
  gyroscope: boolean
  magnetometer: boolean
} {
  const hasPermissionsAPI = 'permissions' in navigator
  
  return {
    permissionsAPI: hasPermissionsAPI,
    accelerometer: 'DeviceMotionEvent' in window,
    gyroscope: 'DeviceOrientationEvent' in window,
    magnetometer: 'DeviceOrientationEvent' in window
  }
}

/**
 * Suprimir warnings específicos de permissions policy
 */
export function suppressPermissionWarnings(): void {
  if (typeof window === 'undefined') return

  // Interceptar console.warn para filtrar warnings conhecidos
  const originalWarn = console.warn
  console.warn = (...args: any[]) => {
    const message = args.join(' ')
    
    // Lista de warnings para suprimir
    const suppressPatterns = [
      /Permissions policy violation: accelerometer/,
      /deviceorientation events are blocked/,
      /devicemotion events are blocked/,
      /gyroscope is not allowed/,
      /magnetometer is not allowed/
    ]

    const shouldSuppress = suppressPatterns.some(pattern => 
      pattern.test(message)
    )

    if (!shouldSuppress) {
      originalWarn.apply(console, args)
    }
  }
}

/**
 * Configurar permissions policy no nível da página
 */
export function configurePagePermissions(): void {
  if (typeof document === 'undefined') return

  // Adicionar meta tag de permissions policy se não existir
  let policyMeta = document.querySelector('meta[http-equiv="Permissions-Policy"]')
  
  if (!policyMeta) {
    policyMeta = document.createElement('meta')
    policyMeta.setAttribute('http-equiv', 'Permissions-Policy')
    policyMeta.setAttribute('content', generatePermissionsPolicy({
      accelerometer: false,
      gyroscope: false,
      magnetometer: false,
      camera: false,
      microphone: false,
      geolocation: false,
      fullscreen: true,
      autoplay: true
    }))
    document.head.appendChild(policyMeta)
  }
}

/**
 * Hook para gerenciar permissions policy
 */
export function usePermissionsPolicy(suppressWarnings = true) {
  if (typeof window !== 'undefined') {
    // Configurar na primeira execução
    if (suppressWarnings) {
      suppressPermissionWarnings()
    }
    configurePagePermissions()
  }

  return {
    createIframe: createOptimizedTwitchIframe,
    checkSupport: checkPermissionSupport,
    generatePolicy: generatePermissionsPolicy
  }
}

/**
 * Utilitário para debugging de permissions
 */
export function debugPermissions(): void {
  if (process.env.NODE_ENV === 'development') {
    const support = checkPermissionSupport()
    console.log('Permissions Support:', support)
    
    if (support.permissionsAPI && 'permissions' in navigator) {
      // Verificar permissions específicas
      const permissionsToCheck = ['accelerometer', 'gyroscope', 'magnetometer']
      
      permissionsToCheck.forEach(async (permission) => {
        try {
          const result = await (navigator.permissions as any).query({ name: permission })
          console.log(`${permission}:`, result.state)
        } catch (error) {
          console.log(`${permission}: not supported`)
        }
      })
    }
  }
}
