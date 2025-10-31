import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";

interface RevenueChartProps {
  data: Array<{ month: string; revenue: number }>;
}

const RevenueChart = ({ data }: RevenueChartProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Faturamento Mensal</CardTitle>
        <CardDescription>Evolução do faturamento nos últimos 6 meses</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="month" 
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
            <Area 
              type="monotone" 
              dataKey="revenue" 
              stroke="hsl(var(--primary))" 
              fillOpacity={1}
              fill="url(#colorRevenue)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default RevenueChart;
