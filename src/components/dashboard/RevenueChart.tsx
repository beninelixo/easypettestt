import { memo } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useIsMobile } from "@/utils/breakpoints";

interface RevenueChartProps {
  data: Array<{ month: string; revenue: number }>;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card/95 backdrop-blur-sm border border-border/50 rounded-xl p-2 sm:p-3 shadow-xl">
        <p className="text-xs sm:text-sm font-medium text-foreground mb-1">{label}</p>
        <p className="text-sm sm:text-lg font-bold text-emerald-500">
          R$ {payload[0].value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </p>
      </div>
    );
  }
  return null;
};

const RevenueChart = memo(({ data }: RevenueChartProps) => {
  const isMobile = useIsMobile();
  const chartHeight = isMobile ? 200 : 280;
  
  return (
    <ResponsiveContainer width="100%" height={chartHeight}>
      <AreaChart 
        data={data} 
        margin={{ 
          top: 10, 
          right: isMobile ? 5 : 10, 
          left: isMobile ? -15 : 0, 
          bottom: isMobile ? 5 : 0 
        }}
      >
        <defs>
          <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity={0.4}/>
            <stop offset="50%" stopColor="#10b981" stopOpacity={0.15}/>
            <stop offset="100%" stopColor="#10b981" stopOpacity={0}/>
          </linearGradient>
          <linearGradient id="revenueStroke" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#10b981"/>
            <stop offset="100%" stopColor="#34d399"/>
          </linearGradient>
        </defs>
        <CartesianGrid 
          strokeDasharray="3 3" 
          stroke="hsl(var(--border))" 
          strokeOpacity={0.3}
          vertical={false}
        />
        <XAxis 
          dataKey="month" 
          axisLine={false}
          tickLine={false}
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: isMobile ? 10 : 12 }}
          dy={10}
          interval={isMobile ? 'preserveStartEnd' : 0}
        />
        <YAxis 
          axisLine={false}
          tickLine={false}
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: isMobile ? 10 : 12 }}
          tickFormatter={(value) => `R$${value >= 1000 ? `${(value/1000).toFixed(0)}k` : value}`}
          dx={-10}
          width={isMobile ? 40 : 50}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area 
          type="monotone" 
          dataKey="revenue" 
          stroke="url(#revenueStroke)" 
          strokeWidth={isMobile ? 2 : 3}
          fill="url(#revenueGradient)"
          dot={false}
          activeDot={{ 
            r: isMobile ? 4 : 6, 
            fill: '#10b981',
            stroke: '#fff',
            strokeWidth: 2
          }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
});

RevenueChart.displayName = "RevenueChart";

export default RevenueChart;