"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";

interface Bubble {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
}

interface BubbleBackgroundProps {
  className?: string;
  bubbleCount?: number;
  colors?: string[];
  speed?: "slow" | "normal" | "fast";
}

export default function BubbleBackground({
  className = "",
  bubbleCount = 20,
  colors = [
    "from-blue-400/20 to-purple-400/20",
    "from-pink-400/20 to-rose-400/20",
    "from-green-400/20 to-emerald-400/20",
    "from-yellow-400/20 to-orange-400/20",
    "from-indigo-400/20 to-blue-400/20",
  ],
  speed = "normal",
}: BubbleBackgroundProps) {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);

  const speedMultiplier = {
    slow: 1.5,
    normal: 1,
    fast: 0.5,
  };

  useEffect(() => {
    const generateBubbles = () => {
      const newBubbles: Bubble[] = [];
      for (let i = 0; i < bubbleCount; i++) {
        newBubbles.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 60 + 20,
          delay: Math.random() * 5,
          duration: (Math.random() * 10 + 15) * speedMultiplier[speed],
        });
      }
      setBubbles(newBubbles);
    };

    generateBubbles();
  }, [bubbleCount, speed]);

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      {bubbles.map((bubble) => (
        <motion.div
          key={bubble.id}
          className={`absolute rounded-full bg-gradient-to-br ${
            colors[bubble.id % colors.length]
          } blur-sm`}
          style={{
            left: `${bubble.x}%`,
            top: `${bubble.y}%`,
            width: `${bubble.size}px`,
            height: `${bubble.size}px`,
          }}
          animate={{
            y: [-20, -100],
            opacity: [0, 1, 0],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: bubble.duration,
            delay: bubble.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}