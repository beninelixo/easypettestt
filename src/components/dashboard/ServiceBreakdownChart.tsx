import { memo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface ServiceBreakdownChartProps {
  data: Array<{ 
    service_name: string; 
    service_count: number; 
    revenue: number;
    avg_duration: number;
  }>;
}

const COLORS = [
  '#06b6d4', // cyan
  '#10b981', // emerald
  '#f59e0b', // amber
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#ef4444', // red
  '#3b82f6', // blue
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-card/95 backdrop-blur-sm border border-border/50 rounded-xl p-3 shadow-xl min-w-[160px]">
        <p className="text-sm font-semibold text-foreground mb-2">{data.name}</p>
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Agendamentos:</span>
            <span className="font-medium">{data.value}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Receita:</span>
            <span className="font-medium text-emerald-500">
              R$ {data.revenue?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export const ServiceBreakdownChart = memo(({ data }: ServiceBreakdownChartProps) => {
  const chartData = data.map(item => ({
    name: item.service_name,
    value: item.service_count,
    revenue: item.revenue
  }));

  const total = chartData.reduce((acc, item) => acc + item.value, 0);

  if (chartData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[280px] text-muted-foreground">
        <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-3">
          <span className="text-2xl">📊</span>
        </div>
        <p className="text-sm">Nenhum dado disponível</p>
      </div>
    );
  }

  return (
    <div className="h-[280px]">
      <div className="flex h-full">
        {/* Chart */}
        <div className="flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
                dataKey="value"
                strokeWidth={0}
              >
                {chartData.map((_, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]}
                    className="hover:opacity-80 transition-opacity cursor-pointer"
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="w-[140px] flex flex-col justify-center space-y-2 pl-2">
          {chartData.slice(0, 5).map((item, idx) => {
            const percentage = ((item.value / total) * 100).toFixed(0);
            return (
              <div key={idx} className="flex items-center gap-2 group cursor-pointer">
                <div 
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0 group-hover:scale-125 transition-transform" 
                  style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-foreground truncate">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{percentage}%</p>
                </div>
              </div>
            );
          })}
          {chartData.length > 5 && (
            <p className="text-xs text-muted-foreground pl-4">+{chartData.length - 5} mais</p>
          )}
        </div>
      </div>
    </div>
  );
});

ServiceBreakdownChart.displayName = "ServiceBreakdownChart";
