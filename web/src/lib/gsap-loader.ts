"use client"

// Dynamic GSAP loader for client-side only
let gsapInstance: any = null
let ScrollTriggerInstance: any = null
let isLoaded = false

export const loadGSAP = async () => {
  if (typeof window === 'undefined') {
    // Return mock objects for server-side
    return {
      gsap: {
        timeline: () => ({ to: () => {}, fromTo: () => {}, call: () => {}, then: () => Promise.resolve(), kill: () => {} }),
        to: () => {},
        fromTo: () => {},
        set: () => {},
        registerPlugin: () => {},
        killTweensOf: () => {}
      },
      ScrollTrigger: {
        create: () => ({ kill: () => {} }),
        refresh: () => {}
      }
    }
  }

  if (isLoaded && gsapInstance && ScrollTriggerInstance) {
    return { gsap: gsapInstance, ScrollTrigger: ScrollTriggerInstance }
  }

  try {
    // Dynamically import GSAP
    const gsapModule = await import('gsap')
    const scrollTriggerModule = await import('gsap/ScrollTrigger')
    
    gsapInstance = gsapModule.gsap
    ScrollTriggerInstance = scrollTriggerModule.ScrollTrigger
    
    // Register ScrollTrigger plugin
    gsapInstance.registerPlugin(ScrollTriggerInstance)
    
    isLoaded = true
    
    return { gsap: gsapInstance, ScrollTrigger: ScrollTriggerInstance }
  } catch (error) {
    console.error('Failed to load GSAP:', error)
    
    // Return fallback mock objects
    return {
      gsap: {
        timeline: () => ({ to: () => {}, fromTo: () => {}, call: () => {}, then: () => Promise.resolve(), kill: () => {} }),
        to: () => {},
        fromTo: () => {},
        set: () => {},
        registerPlugin: () => {},
        killTweensOf: () => {}
      },
      ScrollTrigger: {
        create: () => ({ kill: () => {} }),
        refresh: () => {}
      }
    }
  }
}

// Sync loader for immediate use (only if already loaded)
export const getGSAP = () => {
  if (typeof window === 'undefined') {
    return null
  }
  
  return isLoaded ? { gsap: gsapInstance, ScrollTrigger: ScrollTriggerInstance } : null
}
