import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface NoShowMetricsProps {
  stats: {
    total_appointments: number;
    no_shows: number;
    completed: number;
    no_show_rate: number;
    by_day_of_week: Record<string, number>;
  };
}

export const NoShowMetrics = ({ stats }: NoShowMetricsProps) => {
  const noShowColor = stats.no_show_rate > 20 ? "text-destructive" : 
                      stats.no_show_rate > 10 ? "text-yellow-500" : 
                      "text-green-500";

  const dayOfWeekData = stats.by_day_of_week ? Object.entries(stats.by_day_of_week) : [];
  const maxNoShows = dayOfWeekData.length > 0 ? Math.max(...dayOfWeekData.map(([, count]) => count)) : 1;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Taxa de No-Show
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className={`text-3xl font-bold ${noShowColor}`}>
              {stats.no_show_rate.toFixed(1)}%
            </div>
            <p className="text-sm text-muted-foreground mt-1">Taxa Geral</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-destructive flex items-center justify-center gap-1">
              <XCircle className="h-6 w-6" />
              {stats.no_shows}
            </div>
            <p className="text-sm text-muted-foreground mt-1">Faltas</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-500 flex items-center justify-center gap-1">
              <CheckCircle className="h-6 w-6" />
              {stats.completed}
            </div>
            <p className="text-sm text-muted-foreground mt-1">Concluídos</p>
          </div>
        </div>

        {dayOfWeekData.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm font-medium">No-Show por Dia da Semana</p>
            {dayOfWeekData.map(([day, count]) => (
              <div key={day} className="flex items-center gap-3">
                <span className="text-sm w-24 text-muted-foreground">{day.trim()}</span>
                <Progress 
                  value={(count / maxNoShows) * 100} 
                  className="flex-1 h-2" 
                />
                <span className="text-sm font-medium w-12 text-right">{count}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
