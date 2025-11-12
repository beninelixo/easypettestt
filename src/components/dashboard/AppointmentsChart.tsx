import { memo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface AppointmentsChartProps {
  data: Array<{ day: string; completed: number; cancelled: number; pending: number }>;
}

const AppointmentsChart = memo(({ data }: AppointmentsChartProps) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis 
          dataKey="day" 
          className="text-xs"
          stroke="hsl(var(--muted-foreground))"
        />
        <YAxis 
          className="text-xs"
          stroke="hsl(var(--muted-foreground))"
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'hsl(var(--background))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px'
          }}
        />
        <Legend />
        <Bar dataKey="completed" fill="hsl(var(--primary))" name="Concluídos" radius={[8, 8, 0, 0]} />
        <Bar dataKey="pending" fill="hsl(var(--secondary))" name="Pendentes" radius={[8, 8, 0, 0]} />
        <Bar dataKey="cancelled" fill="hsl(var(--destructive))" name="Cancelados" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
});

AppointmentsChart.displayName = "AppointmentsChart";

export default AppointmentsChart;
