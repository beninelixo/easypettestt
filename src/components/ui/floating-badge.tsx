import * as React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface FloatingBadgeProps {
  icon: LucideIcon;
  label: string;
  className?: string;
  delay?: number;
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "left" | "right";
}

export const FloatingBadge: React.FC<FloatingBadgeProps> = ({
  icon: Icon,
  label,
  className,
  delay = 0,
  position = "top-right",
}) => {
  const positionClasses = {
    "top-left": "-top-4 -left-4",
    "top-right": "-top-4 -right-4",
    "bottom-left": "-bottom-4 -left-4",
    "bottom-right": "-bottom-4 -right-4",
    "left": "top-1/2 -translate-y-1/2 -left-8",
    "right": "top-1/2 -translate-y-1/2 -right-8",
  };

  return (
    <div
      className={cn(
        "absolute z-20 flex items-center gap-2 px-4 py-2 rounded-full",
        "bg-background/95 backdrop-blur-md border border-border/50",
        "shadow-lg hover:shadow-xl transition-all duration-500",
        "hover:scale-110 cursor-default",
        "animate-float-badge",
        positionClasses[position],
        className
      )}
      style={{
        animationDelay: `${delay}ms`,
        animationDuration: `${3 + Math.random() * 2}s`,
      }}
    >
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <span className="text-sm font-semibold text-foreground whitespace-nowrap">{label}</span>
    </div>
  );
};

interface FloatingBadgesContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const FloatingBadgesContainer: React.FC<FloatingBadgesContainerProps> = ({
  children,
  className,
}) => {
  return (
    <div className={cn("relative", className)}>
      {children}
    </div>
  );
};
