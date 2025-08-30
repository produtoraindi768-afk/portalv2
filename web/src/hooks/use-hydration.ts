"use client"

import { useEffect, useState } from 'react'

/**
 * Hook para garantir que componentes só renderizem após a hidratação estar completa.
 * Previne erros de hidratação causados por diferenças entre servidor e cliente.
 */
export function useHydration() {
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  return isHydrated
}

/**
 * Hook para renderização condicional segura.
 * Retorna null durante SSR e o componente após hidratação.
 */
export function useClientOnly() {
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  return hasMounted
}

/**
 * Hook para valores que podem diferir entre servidor e cliente.
 * Retorna o valor padrão durante SSR e o valor real após hidratação.
 */
export function useSafeValue<T>(clientValue: T, defaultValue: T): T {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return mounted ? clientValue : defaultValue
}