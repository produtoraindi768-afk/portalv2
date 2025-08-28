/**
 * Provider para configurar permissions policy globalmente
 */

'use client'

import { useEffect } from 'react'
import { usePermissionsPolicy } from '@/lib/permissionsPolicy'

interface PermissionsProviderProps {
  children: React.ReactNode
  suppressWarnings?: boolean
  enableDebug?: boolean
}

export function PermissionsProvider({ 
  children, 
  suppressWarnings = true,
  enableDebug = false 
}: PermissionsProviderProps) {
  const { checkSupport } = usePermissionsPolicy(suppressWarnings)

  useEffect(() => {
    // Debug permissions se habilitado
    if (enableDebug && process.env.NODE_ENV === 'development') {
      const support = checkSupport()
      console.log('🔒 Permissions Policy initialized:', support)
    }
  }, [checkSupport, enableDebug])

  return <>{children}</>
}
