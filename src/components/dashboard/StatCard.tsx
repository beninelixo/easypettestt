import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { memo } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: string;
}

export const StatCard = memo(({ title, value, icon: Icon, trend, color = "text-primary" }: StatCardProps) => {
  return (
    <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2 group">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={`${color} bg-gradient-to-br from-primary/10 to-secondary/10 p-3 rounded-xl group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="h-5 w-5" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between">
          <div className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {value}
          </div>
          {trend && (
            <div className={`text-xs font-medium flex items-center gap-1 ${
              trend.isPositive ? 'text-accent' : 'text-destructive'
            }`}>
              <span>{trend.isPositive ? '↑' : '↓'}</span>
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

StatCard.displayName = 'StatCard';
