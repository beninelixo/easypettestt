import * as React from "react";
import { cn } from "@/lib/utils";
import { useScrollReveal } from "@/hooks/useScrollReveal";

type AnimationType = 'fade' | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right' | 'zoom' | 'flip';

interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  animation?: AnimationType;
  delay?: number;
  duration?: number;
  threshold?: number;
  stagger?: boolean;
  staggerDelay?: number;
}

const animationClasses: Record<AnimationType, { hidden: string; visible: string }> = {
  'fade': {
    hidden: 'opacity-0',
    visible: 'opacity-100',
  },
  'slide-up': {
    hidden: 'opacity-0 translate-y-10',
    visible: 'opacity-100 translate-y-0',
  },
  'slide-down': {
    hidden: 'opacity-0 -translate-y-10',
    visible: 'opacity-100 translate-y-0',
  },
  'slide-left': {
    hidden: 'opacity-0 translate-x-10',
    visible: 'opacity-100 translate-x-0',
  },
  'slide-right': {
    hidden: 'opacity-0 -translate-x-10',
    visible: 'opacity-100 translate-x-0',
  },
  'zoom': {
    hidden: 'opacity-0 scale-95',
    visible: 'opacity-100 scale-100',
  },
  'flip': {
    hidden: 'opacity-0 rotateX-90',
    visible: 'opacity-100 rotateX-0',
  },
};

export const AnimatedSection: React.FC<AnimatedSectionProps> = ({
  children,
  className,
  animation = 'fade',
  delay = 0,
  duration = 600,
  threshold = 0.1,
}) => {
  const { ref, isVisible } = useScrollReveal({ threshold });
  const classes = animationClasses[animation];

  return (
    <div
      ref={ref}
      className={cn(
        "transition-all ease-out",
        isVisible ? classes.visible : classes.hidden,
        className
      )}
      style={{
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
};

// Stagger container for multiple children
interface StaggerContainerProps {
  children: React.ReactNode;
  className?: string;
  animation?: AnimationType;
  staggerDelay?: number;
  duration?: number;
}

export const StaggerContainer: React.FC<StaggerContainerProps> = ({
  children,
  className,
  animation = 'slide-up',
  staggerDelay = 100,
  duration = 600,
}) => {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.1 });

  return (
    <div ref={ref} className={className}>
      {React.Children.map(children, (child, index) => (
        <div
          className={cn(
            "transition-all ease-out",
            isVisible 
              ? animationClasses[animation].visible 
              : animationClasses[animation].hidden
          )}
          style={{
            transitionDuration: `${duration}ms`,
            transitionDelay: isVisible ? `${index * staggerDelay}ms` : '0ms',
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
};
