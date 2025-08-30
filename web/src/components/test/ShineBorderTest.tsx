"use client"

import { ShineBorder } from '@/components/magicui/shine-border'
import { useTheme } from "next-themes"
import { Card } from "@/components/ui/card"

export function ShineBorderTest() {
  const { theme } = useTheme()
  
  return (
    <div className="p-8 space-y-8">
      <h2 className="text-2xl font-bold">ShineBorder Test</h2>
      
      {/* Test 1: Basic implementation */}
      <div className="relative overflow-hidden rounded-lg border bg-background p-6">
        <ShineBorder shineColor={theme === "dark" ? "white" : "black"} />
        <div className="relative z-10">
          <h3 className="text-lg font-semibold">Test 1: Basic ShineBorder</h3>
          <p className="text-muted-foreground">This should show a shine animation around the border.</p>
        </div>
      </div>
      
      {/* Test 2: With Card component */}
      <Card className="relative overflow-hidden p-6">
        <ShineBorder shineColor={theme === "dark" ? "white" : "black"} />
        <div className="relative z-10">
          <h3 className="text-lg font-semibold">Test 2: ShineBorder with Card</h3>
          <p className="text-muted-foreground">This should show a shine animation with Card styling.</p>
        </div>
      </Card>
      
      {/* Test 3: Custom duration */}
      <div className="relative overflow-hidden rounded-lg border bg-background p-6">
        <ShineBorder 
          shineColor={theme === "dark" ? "white" : "black"} 
          duration={3}
        />
        <div className="relative z-10">
          <h3 className="text-lg font-semibold">Test 3: Fast Animation (3s)</h3>
          <p className="text-muted-foreground">This should show a faster shine animation.</p>
        </div>
      </div>
      
      {/* Test 4: Different colors */}
      <div className="relative overflow-hidden rounded-lg border bg-background p-6">
        <ShineBorder shineColor="#3b82f6" duration={5} />
        <div className="relative z-10">
          <h3 className="text-lg font-semibold">Test 4: Blue Shine</h3>
          <p className="text-muted-foreground">This should show a blue shine animation.</p>
        </div>
      </div>
    </div>
  )
}