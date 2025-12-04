import * as React from "react";
import { cn } from "@/lib/utils";

interface AnimatedBlobProps {
  className?: string;
  color?: "primary" | "secondary" | "accent";
  size?: "sm" | "md" | "lg" | "xl";
  delay?: number;
}

export const AnimatedBlob: React.FC<AnimatedBlobProps> = ({
  className,
  color = "primary",
  size = "md",
  delay = 0,
}) => {
  const colorClasses = {
    primary: "bg-primary/20",
    secondary: "bg-secondary/20",
    accent: "bg-accent/20",
  };

  const sizeClasses = {
    sm: "w-32 h-32",
    md: "w-64 h-64",
    lg: "w-96 h-96",
    xl: "w-[500px] h-[500px]",
  };

  return (
    <div
      className={cn(
        "absolute rounded-full blur-3xl animate-blob-morph",
        colorClasses[color],
        sizeClasses[size],
        className
      )}
      style={{
        animationDelay: `${delay}ms`,
      }}
    />
  );
};

interface AnimatedBlobsBackgroundProps {
  className?: string;
}

export const AnimatedBlobsBackground: React.FC<AnimatedBlobsBackgroundProps> = ({
  className,
}) => {
  return (
    <div className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}>
      <AnimatedBlob
        color="primary"
        size="xl"
        className="top-0 -left-1/4 opacity-30"
        delay={0}
      />
      <AnimatedBlob
        color="secondary"
        size="lg"
        className="top-1/4 -right-1/4 opacity-25"
        delay={2000}
      />
      <AnimatedBlob
        color="accent"
        size="md"
        className="bottom-0 left-1/3 opacity-20"
        delay={4000}
      />
    </div>
  );
};
