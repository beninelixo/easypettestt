import { memo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface PeakHoursChartProps {
  data: Array<{ hour: number; appointment_count: number }>;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card/95 backdrop-blur-sm border border-border/50 rounded-xl p-3 shadow-xl">
        <p className="text-sm font-medium text-foreground mb-1">{label}</p>
        <p className="text-lg font-bold text-violet-500">
          {payload[0].value} agendamento{payload[0].value !== 1 ? 's' : ''}
        </p>
      </div>
    );
  }
  return null;
};

export const PeakHoursChart = memo(({ data }: PeakHoursChartProps) => {
  const formattedData = data.map(item => ({
    hour: `${String(item.hour).padStart(2, '0')}h`,
    appointments: item.appointment_count
  }));

  const maxCount = Math.max(...data.map(d => d.appointment_count), 1);

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={formattedData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="peakGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity={1}/>
            <stop offset="100%" stopColor="#7c3aed" stopOpacity={0.8}/>
          </linearGradient>
        </defs>
        <CartesianGrid 
          strokeDasharray="3 3" 
          stroke="hsl(var(--border))" 
          strokeOpacity={0.3}
          vertical={false}
        />
        <XAxis 
          dataKey="hour" 
          axisLine={false}
          tickLine={false}
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
          dy={10}
          interval={0}
          angle={-45}
          textAnchor="end"
          height={50}
        />
        <YAxis 
          axisLine={false}
          tickLine={false}
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
          dx={-10}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))', opacity: 0.3 }} />
        <Bar 
          dataKey="appointments" 
          radius={[6, 6, 0, 0]}
          maxBarSize={35}
        >
          {formattedData.map((entry, index) => (
            <Cell 
              key={`cell-${index}`}
              fill={entry.appointments === maxCount ? '#8b5cf6' : 'url(#peakGradient)'}
              opacity={0.5 + (entry.appointments / maxCount) * 0.5}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
});

PeakHoursChart.displayName = "PeakHoursChart";
