import * as React from "react";
import { cn } from "@/lib/utils";
import { useInView } from "react-intersection-observer";

interface AnimatedCounterProps {
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  onComplete?: () => void;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  end,
  duration = 2000,
  prefix = "",
  suffix = "",
  className,
  onComplete,
}) => {
  const [count, setCount] = React.useState(0);
  const [isComplete, setIsComplete] = React.useState(false);
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.3,
  });

  React.useEffect(() => {
    if (!inView) return;

    let startTime: number | null = null;
    let animationFrame: number;

    const easeOutQuart = (t: number): number => 1 - Math.pow(1 - t, 4);

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easedProgress = easeOutQuart(progress);
      
      setCount(Math.floor(easedProgress * end));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setIsComplete(true);
        onComplete?.();
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [inView, end, duration, onComplete]);

  return (
    <span
      ref={ref}
      className={cn(
        "inline-block tabular-nums transition-all duration-300",
        isComplete && "animate-pulse-glow",
        className
      )}
    >
      <span className={cn(
        "transition-all duration-200",
        !isComplete && inView && "blur-[1px]"
      )}>
        {prefix}
        {count.toLocaleString('pt-BR')}
        {suffix}
      </span>
    </span>
  );
};

// Variant with exploding particles
export const AnimatedCounterWithParticles: React.FC<AnimatedCounterProps & { particleCount?: number }> = ({
  particleCount = 8,
  ...props
}) => {
  const [showParticles, setShowParticles] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const handleComplete = () => {
    setShowParticles(true);
    setTimeout(() => setShowParticles(false), 1000);
    props.onComplete?.();
  };

  return (
    <div ref={containerRef} className="relative inline-block">
      <AnimatedCounter {...props} onComplete={handleComplete} />
      
      {showParticles && (
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: particleCount }).map((_, i) => (
            <span
              key={i}
              className="absolute w-2 h-2 rounded-full bg-primary animate-particle-explode"
              style={{
                left: '50%',
                top: '50%',
                '--angle': `${(360 / particleCount) * i}deg`,
              } as React.CSSProperties}
            />
          ))}
        </div>
      )}
    </div>
  );
};
