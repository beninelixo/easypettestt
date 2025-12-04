import * as React from "react";
import { cn } from "@/lib/utils";

interface GlowingBorderProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  borderRadius?: string;
  animate?: boolean;
  intensity?: 'low' | 'medium' | 'high';
}

export const GlowingBorder: React.FC<GlowingBorderProps> = ({
  children,
  className,
  glowColor = "hsl(var(--primary))",
  borderRadius = "1rem",
  animate = true,
  intensity = 'medium',
}) => {
  const intensityValues = {
    low: { blur: '10px', opacity: '0.3' },
    medium: { blur: '20px', opacity: '0.5' },
    high: { blur: '30px', opacity: '0.7' },
  };

  const { blur, opacity } = intensityValues[intensity];

  return (
    <div className={cn("relative group", className)}>
      {/* Glow effect */}
      <div
        className={cn(
          "absolute -inset-0.5 rounded-[inherit] opacity-0 group-hover:opacity-100 transition-all duration-500",
          animate && "animate-glow-pulse"
        )}
        style={{
          background: `linear-gradient(45deg, ${glowColor}, transparent, ${glowColor})`,
          backgroundSize: '200% 200%',
          filter: `blur(${blur})`,
          borderRadius,
          opacity: 0,
        }}
      />
      
      {/* Rotating border gradient */}
      <div
        className={cn(
          "absolute -inset-[1px] rounded-[inherit] opacity-0 group-hover:opacity-100 transition-opacity duration-300",
          animate && "animate-border-rotate"
        )}
        style={{
          background: `conic-gradient(from var(--angle, 0deg), ${glowColor}, transparent, ${glowColor})`,
          borderRadius,
        }}
      />
      
      {/* Content container */}
      <div 
        className="relative bg-background rounded-[inherit] z-10"
        style={{ borderRadius }}
      >
        {children}
      </div>
    </div>
  );
};

// Simpler variant with just hover glow
export const SimpleGlow: React.FC<{
  children: React.ReactNode;
  className?: string;
  color?: string;
}> = ({ children, className, color = "hsl(var(--primary))" }) => {
  return (
    <div 
      className={cn(
        "relative transition-all duration-300",
        "hover:shadow-[0_0_30px_rgba(var(--primary),0.3)]",
        className
      )}
    >
      {children}
    </div>
  );
};
