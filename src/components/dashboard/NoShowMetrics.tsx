import { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertTriangle, CheckCircle2, XCircle, TrendingDown, TrendingUp } from "lucide-react";
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

export const NoShowMetrics = memo(({ stats }: NoShowMetricsProps) => {
  const noShowRate = stats.no_show_rate || 0;
  const isGood = noShowRate <= 10;
  const isWarning = noShowRate > 10 && noShowRate <= 20;
  const isCritical = noShowRate > 20;

  const statusColor = isGood ? "text-emerald-500" : isWarning ? "text-amber-500" : "text-red-500";
  const statusBg = isGood ? "bg-emerald-500/10" : isWarning ? "bg-amber-500/10" : "bg-red-500/10";
  const statusBorder = isGood ? "border-emerald-500/20" : isWarning ? "border-amber-500/20" : "border-red-500/20";

  const dayOfWeekData = stats.by_day_of_week ? Object.entries(stats.by_day_of_week) : [];
  const maxNoShows = dayOfWeekData.length > 0 ? Math.max(...dayOfWeekData.map(([, count]) => count), 1) : 1;

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden">
      <CardHeader className="border-b border-border/50 bg-muted/20">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Taxa de No-Show
            </CardTitle>
            <CardDescription>Análise de faltas dos últimos 30 dias</CardDescription>
          </div>
          {isCritical && (
            <div className="flex items-center gap-1.5 text-xs bg-red-500/10 text-red-500 px-2.5 py-1.5 rounded-full">
              <TrendingUp className="h-3.5 w-3.5" />
              Atenção necessária
            </div>
          )}
          {isGood && (
            <div className="flex items-center gap-1.5 text-xs bg-emerald-500/10 text-emerald-500 px-2.5 py-1.5 rounded-full">
              <TrendingDown className="h-3.5 w-3.5" />
              Excelente
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-6 space-y-6">
        {/* Main Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className={`text-center p-4 rounded-2xl ${statusBg} border ${statusBorder}`}>
            <div className={`text-3xl font-bold ${statusColor}`}>
              {noShowRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1 font-medium">Taxa Geral</p>
          </div>
          
          <div className="text-center p-4 rounded-2xl bg-red-500/5 border border-red-500/10">
            <div className="text-3xl font-bold text-red-500 flex items-center justify-center gap-2">
              <XCircle className="h-5 w-5" />
              {stats.no_shows}
            </div>
            <p className="text-xs text-muted-foreground mt-1 font-medium">Faltas</p>
          </div>
          
          <div className="text-center p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
            <div className="text-3xl font-bold text-emerald-500 flex items-center justify-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              {stats.completed}
            </div>
            <p className="text-xs text-muted-foreground mt-1 font-medium">Concluídos</p>
          </div>
        </div>

        {/* Day of Week Breakdown */}
        {dayOfWeekData.length > 0 && (
          <div className="space-y-4">
            <p className="text-sm font-semibold text-foreground">No-Show por Dia da Semana</p>
            <div className="space-y-3">
              {dayOfWeekData.map(([day, count]) => {
                const percentage = (count / maxNoShows) * 100;
                const dayColor = percentage > 70 ? "bg-red-500" : percentage > 40 ? "bg-amber-500" : "bg-cyan-500";
                
                return (
                  <div key={day} className="flex items-center gap-3">
                    <span className="text-sm w-20 text-muted-foreground truncate">{day.trim()}</span>
                    <div className="flex-1 h-2.5 bg-muted/50 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${dayColor} rounded-full transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold w-8 text-right tabular-nums">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tips */}
        {isCritical && (
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
            <p className="text-sm text-amber-600 dark:text-amber-400">
              💡 <span className="font-medium">Dica:</span> Considere enviar lembretes automáticos via WhatsApp 24h antes dos agendamentos para reduzir faltas.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

NoShowMetrics.displayName = "NoShowMetrics";
