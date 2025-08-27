"use client";

import { motion } from "motion/react";

interface GradientBackgroundProps {
  className?: string;
  colors?: string[];
  speed?: "slow" | "normal" | "fast";
  blur?: "sm" | "md" | "lg" | "xl";
}

export default function GradientBackground({
  className = "",
  colors = [
    "from-purple-400 via-pink-400 to-red-400",
    "from-blue-400 via-purple-400 to-pink-400",
    "from-green-400 via-blue-400 to-purple-400",
  ],
  speed = "normal",
  blur = "xl",
}: GradientBackgroundProps) {
  const speedConfig = {
    slow: 20,
    normal: 15,
    fast: 10,
  };

  const blurConfig = {
    sm: "blur-sm",
    md: "blur-md", 
    lg: "blur-lg",
    xl: "blur-xl",
  };

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      <div className="absolute inset-0">
        {colors.map((color, index) => (
          <motion.div
            key={index}
            className={`absolute inset-0 bg-gradient-to-br ${color} opacity-30 ${blurConfig[blur]}`}
            animate={{
              background: [
                `linear-gradient(45deg, ${color})`,
                `linear-gradient(225deg, ${color})`,
                `linear-gradient(45deg, ${color})`,
              ],
            }}
            transition={{
              duration: speedConfig[speed],
              repeat: Infinity,
              ease: "easeInOut",
              delay: index * 2,
            }}
          />
        ))}
      </div>
    </div>
  );
}