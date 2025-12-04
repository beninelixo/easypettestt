import * as React from "react";
import { cn } from "@/lib/utils";

interface WaveBackgroundProps {
  className?: string;
  color?: string;
  opacity?: number;
  speed?: 'slow' | 'medium' | 'fast';
  position?: 'top' | 'bottom';
  flip?: boolean;
}

export const WaveBackground: React.FC<WaveBackgroundProps> = ({
  className,
  color = "hsl(var(--primary))",
  opacity = 0.1,
  speed = 'medium',
  position = 'bottom',
  flip = false,
}) => {
  const speedDuration = {
    slow: '25s',
    medium: '15s',
    fast: '8s',
  };

  return (
    <div 
      className={cn(
        "absolute left-0 right-0 overflow-hidden pointer-events-none",
        position === 'top' ? 'top-0' : 'bottom-0',
        flip && 'rotate-180',
        className
      )}
      style={{ height: '150px' }}
    >
      <svg
        className="absolute w-[200%] h-full"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
        style={{
          animation: `wave ${speedDuration[speed]} linear infinite`,
        }}
      >
        <path
          fill={color}
          fillOpacity={opacity}
          d="M0,192L48,176C96,160,192,128,288,133.3C384,139,480,181,576,186.7C672,192,768,160,864,154.7C960,149,1056,171,1152,165.3C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
        />
      </svg>
      <svg
        className="absolute w-[200%] h-full"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
        style={{
          animation: `wave ${speedDuration[speed]} linear infinite`,
          animationDelay: '-5s',
          left: '-50%',
        }}
      >
        <path
          fill={color}
          fillOpacity={opacity * 0.5}
          d="M0,64L48,96C96,128,192,192,288,202.7C384,213,480,171,576,144C672,117,768,107,864,128C960,149,1056,203,1152,208C1248,213,1344,171,1392,149.3L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
        />
      </svg>
    </div>
  );
};

// Animated gradient mesh background
export const GradientMesh: React.FC<{
  className?: string;
  colors?: string[];
}> = ({ 
  className,
  colors = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))']
}) => {
  return (
    <div className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}>
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          background: `
            radial-gradient(at 0% 0%, ${colors[0]} 0px, transparent 50%),
            radial-gradient(at 100% 0%, ${colors[1]} 0px, transparent 50%),
            radial-gradient(at 100% 100%, ${colors[2]} 0px, transparent 50%),
            radial-gradient(at 0% 100%, ${colors[0]} 0px, transparent 50%)
          `,
          animation: 'gradient-mesh-move 20s ease infinite',
        }}
      />
    </div>
  );
};
