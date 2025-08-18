"use client"

import React, { createContext, useContext, useState, useCallback } from 'react'

interface HeaderHeightContextValue {
  featuredMatchesHeight: number
  isCollapsed: boolean
  setFeaturedMatchesHeight: (height: number) => void
  setIsCollapsed: (collapsed: boolean) => void
}

const HeaderHeightContext = createContext<HeaderHeightContextValue | undefined>(undefined)

export function HeaderHeightProvider({ children }: { children: React.ReactNode }) {
  const [featuredMatchesHeight, setFeaturedMatchesHeight] = useState(0)
  const [isCollapsed, setIsCollapsed] = useState(false)

  const updateFeaturedMatchesHeight = useCallback((height: number) => {
    setFeaturedMatchesHeight(height)
  }, [])

  const updateIsCollapsed = useCallback((collapsed: boolean) => {
    setIsCollapsed(collapsed)
  }, [])

  return (
    <HeaderHeightContext.Provider
      value={{
        featuredMatchesHeight,
        isCollapsed,
        setFeaturedMatchesHeight: updateFeaturedMatchesHeight,
        setIsCollapsed: updateIsCollapsed,
      }}
    >
      {children}
    </HeaderHeightContext.Provider>
  )
}

export function useHeaderHeight() {
  const context = useContext(HeaderHeightContext)
  if (context === undefined) {
    throw new Error('useHeaderHeight must be used within a HeaderHeightProvider')
  }
  return context
}
