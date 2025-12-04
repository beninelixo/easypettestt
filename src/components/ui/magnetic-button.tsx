import * as React from "react";
import { cn } from "@/lib/utils";
import { useRelativeMousePosition } from "@/hooks/useMousePosition";

interface MagneticButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  strength?: number;
  className?: string;
  glowColor?: string;
}

export const MagneticButton = React.forwardRef<HTMLButtonElement, MagneticButtonProps>(
  ({ children, strength = 0.3, className, glowColor, ...props }, ref) => {
    const buttonRef = React.useRef<HTMLButtonElement>(null);
    const { x, y, isInside } = useRelativeMousePosition(buttonRef);

    const transform = isInside
      ? `translate(${x * strength}px, ${y * strength}px)`
      : 'translate(0, 0)';

    return (
      <button
        ref={buttonRef}
        className={cn(
          "relative overflow-hidden transition-all duration-300 ease-out",
          "before:absolute before:inset-0 before:opacity-0 before:transition-opacity before:duration-300",
          "hover:before:opacity-100",
          className
        )}
        style={{
          transform,
          willChange: isInside ? 'transform' : 'auto',
        }}
        {...props}
      >
        {/* Glow effect */}
        {isInside && (
          <span
            className="absolute pointer-events-none rounded-full blur-xl opacity-50 transition-opacity duration-300"
            style={{
              width: '150px',
              height: '150px',
              left: x + (buttonRef.current?.offsetWidth || 0) / 2 - 75,
              top: y + (buttonRef.current?.offsetHeight || 0) / 2 - 75,
              background: glowColor || 'hsl(var(--primary))',
            }}
          />
        )}
        
        {/* Ripple container */}
        <span className="relative z-10">{children}</span>
      </button>
    );
  }
);

MagneticButton.displayName = "MagneticButton";
