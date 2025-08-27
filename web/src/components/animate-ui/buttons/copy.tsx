"use client";

import { motion } from "motion/react";
import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const copyButtonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

interface CopyButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onDrag' | 'onDragEnd' | 'onDragStart' | 'onAnimationStart' | 'onAnimationEnd'>,
    VariantProps<typeof copyButtonVariants> {
  text: string;
  children?: React.ReactNode;
  successDuration?: number;
}

export default function CopyButton({
  text,
  children,
  className,
  variant,
  size,
  successDuration = 2000,
  ...props
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), successDuration);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <motion.button
      className={cn(copyButtonVariants({ variant, size, className }))}
      onClick={handleCopy}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      {...props}
    >
      <motion.div
        animate={{ opacity: copied ? 0 : 1, scale: copied ? 0 : 1 }}
        transition={{ duration: 0.2 }}
        className="absolute"
      >
        <Copy className="h-4 w-4" />
      </motion.div>
      
      <motion.div
        animate={{ opacity: copied ? 1 : 0, scale: copied ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        className="absolute"
      >
        <Check className="h-4 w-4" />
      </motion.div>
      
      <span className="ml-6">
        {children || (copied ? "Copied!" : "Copy")}
      </span>
    </motion.button>
  );
}