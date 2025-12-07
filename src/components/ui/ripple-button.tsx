import * as React from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface RippleButtonProps extends ButtonProps {
  rippleColor?: string;
  hapticFeedback?: boolean;
}

export const RippleButton = React.forwardRef<HTMLButtonElement, RippleButtonProps>(
  ({ children, className, rippleColor = "hsl(var(--primary) / 0.3)", hapticFeedback = true, onClick, ...props }, ref) => {
    const [ripples, setRipples] = React.useState<Array<{ x: number; y: number; id: number; size: number }>>([]);

    const handleClick = React.useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
      const button = event.currentTarget;
      const rect = button.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      
      // Calculate ripple size based on button dimensions
      const size = Math.max(rect.width, rect.height) * 2;
      
      const newRipple = { x, y, id: Date.now(), size };
      setRipples((prev) => [...prev, newRipple]);

      // Haptic feedback for supported devices
      if (hapticFeedback && 'vibrate' in navigator) {
        navigator.vibrate(10);
      }

      // Cleanup ripple after animation
      setTimeout(() => {
        setRipples((prev) => prev.filter((ripple) => ripple.id !== newRipple.id));
      }, 500);

      onClick?.(event);
    }, [hapticFeedback, onClick]);

    return (
      <Button
        ref={ref}
        className={cn(
          "relative overflow-hidden transition-transform duration-150 active:scale-[0.98]",
          className
        )}
        onClick={handleClick}
        {...props}
      >
        {children}
        {ripples.map((ripple) => (
          <span
            key={ripple.id}
            className="absolute rounded-full pointer-events-none"
            style={{
              left: ripple.x - ripple.size / 2,
              top: ripple.y - ripple.size / 2,
              width: ripple.size,
              height: ripple.size,
              backgroundColor: rippleColor,
              transform: 'scale(0)',
              opacity: 0.6,
              animation: 'ripple-expand 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards',
            }}
          />
        ))}
        <style>{`
          @keyframes ripple-expand {
            0% {
              transform: scale(0);
              opacity: 0.6;
            }
            100% {
              transform: scale(1);
              opacity: 0;
            }
          }
        `}</style>
      </Button>
    );
  }
);

RippleButton.displayName = "RippleButton";
