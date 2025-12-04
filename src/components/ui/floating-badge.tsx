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
    "top-left": "top-2 left-2",
    "top-right": "top-2 right-2",
    "bottom-left": "bottom-2 left-2",
    "bottom-right": "bottom-12 right-2",
    "left": "top-1/3 left-2",
    "right": "top-1/2 -translate-y-1/2 right-2",
  };

  return (
    <div
      className={cn(
        "absolute z-10 flex items-center gap-2 px-3 py-1.5 rounded-full",
        "bg-background/95 backdrop-blur-sm border border-border/40",
        "shadow-sm transition-all duration-300 ease-out",
        "hover:shadow-md cursor-default",
        "animate-float-badge",
        positionClasses[position],
        className
      )}
      style={{
        animationDelay: `${delay}ms`,
        animationDuration: '6s',
      }}
    >
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary/15 to-secondary/15 flex items-center justify-center">
        <Icon className="h-3.5 w-3.5 text-primary" />
      </div>
      <span className="text-xs font-medium text-foreground whitespace-nowrap">{label}</span>
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
