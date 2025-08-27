"use client"

import { useState, useEffect, useMemo, useRef } from 'react'

export type StreamPosition = {
  streamer: any
  position: 'left' | 'center' | 'right'
  isSelected: boolean
  containerStyle: React.CSSProperties
}

export function useStreamLayout() {
  const [sectionRect, setSectionRect] = useState<DOMRect | null>(null)
  const [mounted, setMounted] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)

  // Garantir montagem
  useEffect(() => {
    setMounted(true)
  }, [])

  // Atualizar posição da seção
  useEffect(() => {
    if (!mounted) return

    const updateSectionRect = () => {
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect()
        setSectionRect(rect)
      }
    }

    updateSectionRect()

    // RAF para garantir que o layout está pronto
    const rafId = requestAnimationFrame(updateSectionRect)
    const timeoutId = setTimeout(updateSectionRect, 100)

    const handleResize = () => updateSectionRect()
    window.addEventListener('resize', handleResize)
    window.addEventListener('scroll', handleResize, { passive: true })

    return () => {
      cancelAnimationFrame(rafId)
      clearTimeout(timeoutId)
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('scroll', handleResize)
    }
  }, [mounted])

  // Dimensões responsivas otimizadas
  const responsiveDimensions = useMemo(() => {
    const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1200
    
    // Mobile (< 640px): Layout vertical compacto
    if (viewportWidth < 640) {
      return {
        centerWidth: Math.min(viewportWidth - 32, 360),
        centerHeight: Math.min((viewportWidth - 32) * 9 / 16, 203),
        sideWidth: Math.min(viewportWidth - 64, 280),
        sideHeight: Math.min((viewportWidth - 64) * 9 / 16, 158),
        sideOffset: 80,
        verticalSpacing: 120
      }
    }
    // Tablet (640px - 1024px): Layout médio
    else if (viewportWidth < 1024) {
      return {
        centerWidth: 480,
        centerHeight: 270,
        sideWidth: 400,
        sideHeight: 225,
        sideOffset: 200,
        verticalSpacing: 150
      }
    }
    // Desktop (>= 1024px): Layout original
    else {
      return {
        centerWidth: 720,
        centerHeight: 405,
        sideWidth: 600,
        sideHeight: 338,
        sideOffset: 300,
        verticalSpacing: 200
      }
    }
  }, [])

  const calculatePositions = (
    streamers: any[], 
    selectedIndex: number,
    headerOffset: number = 0
  ): StreamPosition[] => {
    if (streamers.length === 0 || !sectionRect) return []

    const centerX = sectionRect.left + sectionRect.width / 2
    const centerY = sectionRect.top + sectionRect.height / 2 + headerOffset

    // Single stream
    if (streamers.length === 1) {
      return [{
        streamer: streamers[0],
        position: 'center',
        isSelected: true,
        containerStyle: {
          left: Math.max(0, centerX - responsiveDimensions.centerWidth / 2),
          top: centerY - responsiveDimensions.centerHeight / 2,
          width: responsiveDimensions.centerWidth,
          height: responsiveDimensions.centerHeight
        }
      }]
    }

    // Two streams
    if (streamers.length === 2) {
      return [
        {
          streamer: streamers[0],
          position: selectedIndex === 0 ? 'center' : 'left',
          isSelected: selectedIndex === 0,
          containerStyle: selectedIndex === 0 ? {
            left: Math.max(0, centerX - responsiveDimensions.centerWidth / 2),
            top: centerY - responsiveDimensions.centerHeight / 2,
            width: responsiveDimensions.centerWidth,
            height: responsiveDimensions.centerHeight
          } : {
            left: Math.max(16, centerX - responsiveDimensions.centerWidth / 2 - responsiveDimensions.sideOffset),
            top: centerY - responsiveDimensions.sideHeight / 2,
            width: responsiveDimensions.sideWidth,
            height: responsiveDimensions.sideHeight,
            transform: window.innerWidth >= 1024 ? 'scale(0.85) rotateY(5deg)' : 'scale(0.9)'
          }
        },
        {
          streamer: streamers[1],
          position: selectedIndex === 1 ? 'center' : 'right',
          isSelected: selectedIndex === 1,
          containerStyle: selectedIndex === 1 ? {
            left: Math.max(0, centerX - responsiveDimensions.centerWidth / 2),
            top: centerY - responsiveDimensions.centerHeight / 2,
            width: responsiveDimensions.centerWidth,
            height: responsiveDimensions.centerHeight
          } : {
            left: Math.min(
              sectionRect.width - responsiveDimensions.sideWidth - 16,
              centerX + responsiveDimensions.centerWidth / 2 + (responsiveDimensions.sideOffset - responsiveDimensions.sideWidth)
            ),
            top: centerY - responsiveDimensions.sideHeight / 2,
            width: responsiveDimensions.sideWidth,
            height: responsiveDimensions.sideHeight,
            transform: window.innerWidth >= 1024 ? 'scale(0.85) rotateY(-5deg)' : 'scale(0.9)'
          }
        }
      ]
    }

    // Three or more streams
    const leftIndex = (selectedIndex - 1 + streamers.length) % streamers.length
    const rightIndex = (selectedIndex + 1) % streamers.length

    return [
      {
        streamer: streamers[leftIndex],
        position: 'left',
        isSelected: false,
        containerStyle: {
          left: Math.max(16, centerX - responsiveDimensions.centerWidth / 2 - responsiveDimensions.sideOffset),
          top: centerY - responsiveDimensions.sideHeight / 2,
          width: responsiveDimensions.sideWidth,
          height: responsiveDimensions.sideHeight,
          transform: window.innerWidth >= 1024 ? 'scale(0.85) rotateY(5deg)' : 'scale(0.9)'
        }
      },
      {
        streamer: streamers[selectedIndex],
        position: 'center',
        isSelected: true,
        containerStyle: {
          left: Math.max(0, centerX - responsiveDimensions.centerWidth / 2),
          top: centerY - responsiveDimensions.centerHeight / 2,
          width: responsiveDimensions.centerWidth,
          height: responsiveDimensions.centerHeight
        }
      },
      {
        streamer: streamers[rightIndex],
        position: 'right',
        isSelected: false,
        containerStyle: {
          left: Math.min(
            sectionRect.width - responsiveDimensions.sideWidth - 16,
            centerX + responsiveDimensions.centerWidth / 2 + (responsiveDimensions.sideOffset - responsiveDimensions.sideWidth)
          ),
          top: centerY - responsiveDimensions.sideHeight / 2,
          width: responsiveDimensions.sideWidth,
          height: responsiveDimensions.sideHeight,
          transform: window.innerWidth >= 1024 ? 'scale(0.85) rotateY(-5deg)' : 'scale(0.9)'
        }
      }
    ]
  }

  return {
    sectionRef,
    sectionRect,
    responsiveDimensions,
    calculatePositions,
    mounted
  }
}