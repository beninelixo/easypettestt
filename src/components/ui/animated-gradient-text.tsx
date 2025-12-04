import * as React from "react";
import { cn } from "@/lib/utils";

interface AnimatedGradientTextProps {
  children: React.ReactNode;
  className?: string;
  shimmer?: boolean;
  glow?: boolean;
}

export const AnimatedGradientText: React.FC<AnimatedGradientTextProps> = ({
  children,
  className,
  shimmer = true,
  glow = false,
}) => {
  return (
    <span
      className={cn(
        "bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent",
        "bg-[length:200%_auto]",
        shimmer && "animate-gradient-flow",
        glow && "drop-shadow-[0_0_25px_hsl(var(--primary)/0.5)]",
        className
      )}
    >
      {children}
    </span>
  );
};
