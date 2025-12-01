import { memo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface AppointmentsChartProps {
  data: Array<{ day: string; completed: number; cancelled: number; pending: number }>;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card/95 backdrop-blur-sm border border-border/50 rounded-xl p-3 shadow-xl min-w-[140px]">
        <p className="text-sm font-medium text-foreground mb-2">{label}</p>
        <div className="space-y-1.5">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div 
                  className="w-2.5 h-2.5 rounded-full" 
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-xs text-muted-foreground">{entry.name}</span>
              </div>
              <span className="text-sm font-semibold">{entry.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

const AppointmentsChart = memo(({ data }: AppointmentsChartProps) => {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }} barGap={2}>
        <defs>
          <linearGradient id="completedGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity={1}/>
            <stop offset="100%" stopColor="#0891b2" stopOpacity={0.8}/>
          </linearGradient>
          <linearGradient id="pendingGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity={1}/>
            <stop offset="100%" stopColor="#d97706" stopOpacity={0.8}/>
          </linearGradient>
          <linearGradient id="cancelledGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ef4444" stopOpacity={0.8}/>
            <stop offset="100%" stopColor="#dc2626" stopOpacity={0.6}/>
          </linearGradient>
        </defs>
        <CartesianGrid 
          strokeDasharray="3 3" 
          stroke="hsl(var(--border))" 
          strokeOpacity={0.3}
          vertical={false}
        />
        <XAxis 
          dataKey="day" 
          axisLine={false}
          tickLine={false}
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
          dy={10}
        />
        <YAxis 
          axisLine={false}
          tickLine={false}
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
          dx={-10}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))', opacity: 0.3 }} />
        <Bar 
          dataKey="completed" 
          fill="url(#completedGradient)" 
          name="Concluídos" 
          radius={[6, 6, 0, 0]}
          maxBarSize={40}
        />
        <Bar 
          dataKey="pending" 
          fill="url(#pendingGradient)" 
          name="Pendentes" 
          radius={[6, 6, 0, 0]}
          maxBarSize={40}
        />
        <Bar 
          dataKey="cancelled" 
          fill="url(#cancelledGradient)" 
          name="Cancelados" 
          radius={[6, 6, 0, 0]}
          maxBarSize={40}
        />
      </BarChart>
    </ResponsiveContainer>
  );
});

AppointmentsChart.displayName = "AppointmentsChart";

export default AppointmentsChart;
