import * as React from "react";
import { cn } from "@/lib/utils";
import { useScrollProgress } from "@/hooks/useScrollProgress";

interface ScrollProgressProps {
  className?: string;
  height?: number;
  showPercentage?: boolean;
}

export const ScrollProgress: React.FC<ScrollProgressProps> = ({
  className,
  height = 3,
  showPercentage = false,
}) => {
  const progress = useScrollProgress();

  return (
    <div
      className={cn(
        "fixed top-0 left-0 right-0 z-[100] bg-background/20",
        className
      )}
      style={{ height }}
    >
      <div
        className="h-full bg-gradient-to-r from-primary via-secondary to-primary transition-all duration-150 ease-out"
        style={{ 
          width: `${progress}%`,
          backgroundSize: '200% 100%',
          animation: 'gradient-flow 3s ease infinite',
        }}
      />
      
      {showPercentage && progress > 0 && (
        <span 
          className="absolute top-full mt-1 text-xs font-medium text-primary bg-background/80 px-2 py-0.5 rounded-full backdrop-blur-sm"
          style={{ left: `${Math.min(progress, 95)}%`, transform: 'translateX(-50%)' }}
        >
          {Math.round(progress)}%
        </span>
      )}
    </div>
  );
};
