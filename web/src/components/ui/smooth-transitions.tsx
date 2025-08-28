/**
 * Componentes para transições suaves e animações otimizadas
 */

'use client'

import React, { memo, forwardRef } from 'react'
import { motion, AnimatePresence, type HTMLMotionProps } from 'motion/react'
import { cn } from '@/lib/utils'

// Configurações de animação padrão
const defaultTransition = {
  type: "spring",
  stiffness: 300,
  damping: 30,
  mass: 0.8
}

const easeTransition = {
  type: "tween",
  ease: [0.25, 0.1, 0.25, 1],
  duration: 0.3
}

// Variantes de animação comuns
const fadeVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 }
}

const slideUpVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
}

const slideInVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 }
}

const scaleVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 }
}

// Componente base para transições
interface SmoothTransitionProps extends HTMLMotionProps<'div'> {
  variant?: 'fade' | 'slideUp' | 'slideIn' | 'scale'
  duration?: number
  delay?: number
  children: React.ReactNode
}

export const SmoothTransition = memo(forwardRef<HTMLDivElement, SmoothTransitionProps>(({
  variant = 'fade',
  duration = 0.3,
  delay = 0,
  children,
  className,
  ...props
}, ref) => {
  const variants = {
    fade: fadeVariants,
    slideUp: slideUpVariants,
    slideIn: slideInVariants,
    scale: scaleVariants
  }[variant]

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={variants}
      transition={{
        ...easeTransition,
        duration,
        delay
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}))

SmoothTransition.displayName = 'SmoothTransition'

// Componente para listas animadas
interface AnimatedListProps {
  children: React.ReactNode[]
  stagger?: number
  variant?: 'fade' | 'slideUp' | 'slideIn' | 'scale'
  className?: string
}

export const AnimatedList = memo<AnimatedListProps>(({
  children,
  stagger = 0.1,
  variant = 'slideUp',
  className
}) => {
  return (
    <div className={className}>
      {children.map((child, index) => (
        <SmoothTransition
          key={index}
          variant={variant}
          delay={index * stagger}
        >
          {child}
        </SmoothTransition>
      ))}
    </div>
  )
})

AnimatedList.displayName = 'AnimatedList'

// Componente para hover suave
interface SmoothHoverProps extends HTMLMotionProps<'div'> {
  scale?: number
  lift?: number
  glow?: boolean
  children: React.ReactNode
}

export const SmoothHover = memo(forwardRef<HTMLDivElement, SmoothHoverProps>(({
  scale = 1.02,
  lift = 2,
  glow = false,
  children,
  className,
  ...props
}, ref) => {
  return (
    <motion.div
      ref={ref}
      whileHover={{
        scale,
        y: -lift,
        boxShadow: glow ? '0 10px 25px rgba(0,0,0,0.1)' : undefined
      }}
      whileTap={{ scale: scale * 0.98 }}
      transition={defaultTransition}
      className={cn('cursor-pointer', className)}
      {...props}
    >
      {children}
    </motion.div>
  )
}))

SmoothHover.displayName = 'SmoothHover'

// Componente para loading suave
interface SmoothLoadingProps {
  isLoading: boolean
  children: React.ReactNode
  fallback?: React.ReactNode
  className?: string
}

export const SmoothLoading = memo<SmoothLoadingProps>(({
  isLoading,
  children,
  fallback,
  className
}) => {
  return (
    <AnimatePresence mode="wait">
      {isLoading ? (
        <motion.div
          key="loading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={easeTransition}
          className={className}
        >
          {fallback}
        </motion.div>
      ) : (
        <motion.div
          key="content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={easeTransition}
          className={className}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
})

SmoothLoading.displayName = 'SmoothLoading'

// Componente para scroll reveal
interface ScrollRevealProps extends HTMLMotionProps<'div'> {
  threshold?: number
  rootMargin?: string
  children: React.ReactNode
}

export const ScrollReveal = memo(forwardRef<HTMLDivElement, ScrollRevealProps>(({
  threshold = 0.1,
  rootMargin = '0px',
  children,
  className,
  ...props
}, ref) => {
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ threshold, rootMargin, once: true }}
      transition={defaultTransition}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}))

ScrollReveal.displayName = 'ScrollReveal'

// Componente para transições de página
interface PageTransitionProps {
  children: React.ReactNode
  className?: string
}

export const PageTransition = memo<PageTransitionProps>(({
  children,
  className
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{
        type: "tween",
        ease: "easeInOut",
        duration: 0.4
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
})

PageTransition.displayName = 'PageTransition'

// Componente para grid responsivo animado
interface ResponsiveGridProps {
  children: React.ReactNode[]
  columns?: {
    xs?: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
  }
  gap?: string
  stagger?: number
  className?: string
}

export const ResponsiveGrid = memo<ResponsiveGridProps>(({
  children,
  columns = { xs: 1, sm: 2, md: 3, lg: 4, xl: 5 },
  gap = '1rem',
  stagger = 0.05,
  className
}) => {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6'
  }

  const responsiveClasses = [
    columns.xs && `grid-cols-${columns.xs}`,
    columns.sm && `sm:grid-cols-${columns.sm}`,
    columns.md && `md:grid-cols-${columns.md}`,
    columns.lg && `lg:grid-cols-${columns.lg}`,
    columns.xl && `xl:grid-cols-${columns.xl}`
  ].filter(Boolean).join(' ')

  return (
    <div
      className={cn('grid', responsiveClasses, className)}
      style={{ gap }}
    >
      {children.map((child, index) => (
        <SmoothTransition
          key={index}
          variant="slideUp"
          delay={index * stagger}
        >
          {child}
        </SmoothTransition>
      ))}
    </div>
  )
})

ResponsiveGrid.displayName = 'ResponsiveGrid'
