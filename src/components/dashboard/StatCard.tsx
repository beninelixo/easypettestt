import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { memo } from "react";
import { useIsMobile } from "@/utils/breakpoints";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: string;
  description?: string;
  className?: string;
}

export const StatCard = memo(({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  color = "text-primary",
  description,
  className 
}: StatCardProps) => {
  const isMobile = useIsMobile();
  
  return (
    <Card className={cn(
      "hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2 group",
      className
    )}>
      <CardHeader className={cn(
        "flex flex-row items-center justify-between space-y-0",
        isMobile ? "pb-1.5 px-3 pt-3" : "pb-2"
      )}>
        <CardTitle className={cn(
          "font-medium text-muted-foreground",
          isMobile ? "text-xs" : "text-sm"
        )}>
          {title}
        </CardTitle>
        <div className={cn(
          color,
          "bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl group-hover:scale-110 transition-transform duration-300",
          isMobile ? "p-2" : "p-3"
        )}>
          <Icon className={cn(isMobile ? "h-4 w-4" : "h-5 w-5")} />
        </div>
      </CardHeader>
      <CardContent className={cn(isMobile && "px-3 pb-3")}>
        <div className="flex items-end justify-between gap-2">
          <div className={cn(
            "font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent",
            isMobile ? "text-xl" : "text-3xl"
          )}>
            {value}
          </div>
          {trend && (
            <div className={cn(
              "font-medium flex items-center gap-0.5",
              isMobile ? "text-[10px]" : "text-xs",
              trend.isPositive ? 'text-accent' : 'text-destructive'
            )}>
              <span>{trend.isPositive ? '↑' : '↓'}</span>
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>
        {description && (
          <p className={cn(
            "text-muted-foreground mt-1",
            isMobile ? "text-[10px]" : "text-xs"
          )}>
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
});

StatCard.displayName = 'StatCard';
