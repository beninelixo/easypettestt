import * as React from "react";
import { cn } from "@/lib/utils";

interface StaggerContainerProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
  initialDelay?: number;
  animation?: "fade-up" | "fade-in" | "scale-in" | "slide-left" | "slide-right";
}

export const StaggerContainer: React.FC<StaggerContainerProps> = ({
  children,
  className,
  staggerDelay = 100,
  initialDelay = 0,
  animation = "fade-up",
}) => {
  const animationClasses = {
    "fade-up": "opacity-0 translate-y-4",
    "fade-in": "opacity-0",
    "scale-in": "opacity-0 scale-95",
    "slide-left": "opacity-0 translate-x-4",
    "slide-right": "opacity-0 -translate-x-4",
  };

  const animationEndClasses = {
    "fade-up": "opacity-100 translate-y-0",
    "fade-in": "opacity-100",
    "scale-in": "opacity-100 scale-100",
    "slide-left": "opacity-100 translate-x-0",
    "slide-right": "opacity-100 translate-x-0",
  };

  return (
    <div className={cn("grid gap-4", className)}>
      {React.Children.map(children, (child, index) => (
        <div
          className={cn(
            animationClasses[animation],
            "animate-stagger-item transition-all duration-500 ease-out"
          )}
          style={{
            animationDelay: `${initialDelay + index * staggerDelay}ms`,
            animationFillMode: "forwards",
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
};

interface StaggerItemProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export const StaggerItem: React.FC<StaggerItemProps> = ({ children, delay = 0, className }) => {
  return (
    <div
      className={cn(
        "opacity-0 animate-fade-in transition-all duration-500 ease-out",
        className
      )}
      style={{
        animationDelay: `${delay}ms`,
        animationFillMode: "forwards",
      }}
    >
      {children}
    </div>
  );
};
