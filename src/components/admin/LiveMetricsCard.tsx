import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { memo, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface LiveMetricsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  isLive?: boolean;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
}

const variantStyles = {
  default: 'text-primary',
  success: 'text-accent',
  warning: 'text-yellow-500',
  danger: 'text-destructive',
  info: 'text-blue-500',
};

const variantBg = {
  default: 'from-primary/10 to-secondary/10',
  success: 'from-accent/10 to-green-500/10',
  warning: 'from-yellow-500/10 to-orange-500/10',
  danger: 'from-destructive/10 to-red-500/10',
  info: 'from-blue-500/10 to-cyan-500/10',
};

export const LiveMetricsCard = memo(({ 
  title, 
  value, 
  icon: Icon, 
  description,
  trend, 
  isLive = false,
  variant = 'default',
  className
}: LiveMetricsCardProps) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [prevValue, setPrevValue] = useState(value);

  // Animate when value changes
  useEffect(() => {
    if (prevValue !== value) {
      setIsAnimating(true);
      setPrevValue(value);
      const timeout = setTimeout(() => setIsAnimating(false), 1000);
      return () => clearTimeout(timeout);
    }
  }, [value, prevValue]);

  return (
    <Card className={cn(
      "hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2 group relative overflow-hidden",
      isAnimating && "ring-2 ring-primary/50",
      className
    )}>
      {/* Live indicator */}
      {isLive && (
        <div className="absolute top-2 right-2 flex items-center gap-1">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
          </span>
          <span className="text-[10px] font-medium text-accent uppercase tracking-wider">Live</span>
        </div>
      )}
      
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={cn(
          "p-3 rounded-xl group-hover:scale-110 transition-transform duration-300 bg-gradient-to-br",
          variantBg[variant]
        )}>
          <Icon className={cn("h-5 w-5", variantStyles[variant])} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between">
          <div className={cn(
            "text-3xl font-bold transition-all duration-300",
            isAnimating && "scale-110 text-primary",
            !isAnimating && "bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
          )}>
            {value}
          </div>
          {trend && (
            <div className={cn(
              "text-xs font-medium flex items-center gap-1",
              trend.isPositive ? 'text-accent' : 'text-destructive'
            )}>
              <span>{trend.isPositive ? '↑' : '↓'}</span>
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
});

LiveMetricsCard.displayName = 'LiveMetricsCard';
