// Example usage of Animate-UI components
// This file demonstrates how to use the manually installed components

import React from 'react'
import { 
  BubbleBackground, 
  GradientBackground, 
  CopyButton 
} from '@/components/animate-ui'

export function AnimateUIExamples() {
  return (
    <div className="space-y-8 p-8">
      {/* Bubble Background Example */}
      <div className="relative h-64 rounded-lg overflow-hidden border">
        <BubbleBackground 
          className="rounded-lg" 
          bubbleCount={15} 
          speed="normal"
          colors={[
            "from-blue-400/30 to-purple-400/30",
            "from-pink-400/30 to-rose-400/30",
            "from-green-400/30 to-emerald-400/30",
          ]}
        />
        <div className="relative z-10 flex items-center justify-center h-full">
          <h2 className="text-2xl font-bold text-center">
            Bubble Background
          </h2>
        </div>
      </div>

      {/* Gradient Background Example */}
      <div className="relative h-64 rounded-lg overflow-hidden border">
        <GradientBackground 
          className="rounded-lg" 
          speed="slow"
          blur="lg"
          colors={[
            "from-purple-400 via-pink-400 to-red-400",
            "from-blue-400 via-purple-400 to-pink-400",
          ]}
        />
        <div className="relative z-10 flex items-center justify-center h-full">
          <h2 className="text-2xl font-bold text-center text-white">
            Gradient Background
          </h2>
        </div>
      </div>

      {/* Copy Button Examples */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Copy Button Variants</h3>
        <div className="flex gap-4 flex-wrap">
          <CopyButton 
            text="Hello, World!" 
            variant="default"
          >
            Copy Default
          </CopyButton>
          
          <CopyButton 
            text="npm install animate-ui" 
            variant="outline"
          >
            Copy Outline
          </CopyButton>
          
          <CopyButton 
            text="const example = 'code';" 
            variant="secondary"
          >
            Copy Secondary
          </CopyButton>
          
          <CopyButton 
            text="Just the icon" 
            variant="ghost"
            size="icon"
          />
        </div>
      </div>

      {/* Combined Example */}
      <div className="relative h-64 rounded-lg overflow-hidden border">
        <BubbleBackground 
          className="rounded-lg" 
          bubbleCount={20} 
          speed="fast"
        />
        <GradientBackground 
          className="rounded-lg opacity-50" 
          speed="normal"
        />
        <div className="relative z-10 flex flex-col items-center justify-center h-full gap-4">
          <h2 className="text-2xl font-bold text-center text-white">
            Combined Effects
          </h2>
          <CopyButton 
            text="This combines multiple animate-ui components!" 
            variant="outline"
            className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30"
          >
            Copy Combined Example
          </CopyButton>
        </div>
      </div>
    </div>
  )
}