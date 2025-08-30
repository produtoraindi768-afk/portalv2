"use client";

import { cn } from "@/lib/utils";
import React from "react";

export interface ProgressiveBlurHorizontalProps {
  className?: string;
  width?: string;
  position?: "left" | "right" | "both";
  blurLevels?: number[];
  children?: React.ReactNode;
}

export function ProgressiveBlurHorizontal({
  className,
  width = "64px",
  position = "right",
  blurLevels = [0.5, 1, 2, 4, 8, 16, 32],
}: ProgressiveBlurHorizontalProps) {
  // Create array with length equal to blurLevels.length - 2 (for before/after pseudo elements)
  const divElements = Array(blurLevels.length - 2).fill(null);

  return (
    <div
      className={cn(
        "gradient-blur pointer-events-none absolute z-10 inset-y-0",
        className,
        position === "left"
          ? "left-0"
          : position === "right"
            ? "right-0"
            : "inset-x-0",
      )}
      style={{
        width: position === "both" ? "100%" : width,
      }}
    >
      {/* First blur layer (pseudo element) */}
      <div
        className="absolute inset-0"
        style={{
          zIndex: 1,
          backdropFilter: `blur(${blurLevels[0]}px)`,
          WebkitBackdropFilter: `blur(${blurLevels[0]}px)`,
          maskImage:
            position === "right"
              ? `linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,0.8) 20%, rgba(0,0,0,0) 100%)`
              : position === "left"
                ? `linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,0.8) 20%, rgba(0,0,0,0) 100%)`
                : `linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 5%, rgba(0,0,0,1) 95%, rgba(0,0,0,0) 100%)`,
          WebkitMaskImage:
            position === "right"
              ? `linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,0.8) 20%, rgba(0,0,0,0) 100%)`
              : position === "left"
                ? `linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,0.8) 20%, rgba(0,0,0,0) 100%)`
                : `linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 5%, rgba(0,0,0,1) 95%, rgba(0,0,0,0) 100%)`,
        }}
      />

      {/* Middle blur layers */}
      {divElements.map((_, index) => {
        const blurIndex = index + 1;
        const progress = (index + 1) / (blurLevels.length - 1);
        const startPercent = progress * 80; // 0% to 80%
        const endPercent = Math.min(startPercent + 40, 100); // Overlap for smooth transition

        const maskGradient =
          position === "right"
            ? `linear-gradient(to left, rgba(0,0,0,${1 - progress * 0.3}) ${startPercent}%, rgba(0,0,0,0) ${endPercent}%)`
            : position === "left"
              ? `linear-gradient(to right, rgba(0,0,0,${1 - progress * 0.3}) ${startPercent}%, rgba(0,0,0,0) ${endPercent}%)`
              : `linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 5%, rgba(0,0,0,1) 95%, rgba(0,0,0,0) 100%)`;

        return (
          <div
            key={`blur-${index}`}
            className="absolute inset-0"
            style={{
              zIndex: index + 2,
              backdropFilter: `blur(${blurLevels[blurIndex]}px)`,
              WebkitBackdropFilter: `blur(${blurLevels[blurIndex]}px)`,
              maskImage: maskGradient,
              WebkitMaskImage: maskGradient,
            }}
          />
        );
      })}

      {/* Last blur layer (pseudo element) */}
      <div
        className="absolute inset-0"
        style={{
          zIndex: blurLevels.length,
          backdropFilter: `blur(${blurLevels[blurLevels.length - 1]}px)`,
          WebkitBackdropFilter: `blur(${blurLevels[blurLevels.length - 1]}px)`,
          maskImage:
            position === "right"
              ? `linear-gradient(to left, rgba(0,0,0,0.7) 60%, rgba(0,0,0,0) 100%)`
              : position === "left"
                ? `linear-gradient(to right, rgba(0,0,0,0.7) 60%, rgba(0,0,0,0) 100%)`
                : `linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 5%, rgba(0,0,0,1) 95%, rgba(0,0,0,0) 100%)`,
          WebkitMaskImage:
            position === "right"
              ? `linear-gradient(to left, rgba(0,0,0,0.7) 60%, rgba(0,0,0,0) 100%)`
              : position === "left"
                ? `linear-gradient(to right, rgba(0,0,0,0.7) 60%, rgba(0,0,0,0) 100%)`
                : `linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 5%, rgba(0,0,0,1) 95%, rgba(0,0,0,0) 100%)`,
        }}
      />
    </div>
  );
}

export default ProgressiveBlurHorizontal;