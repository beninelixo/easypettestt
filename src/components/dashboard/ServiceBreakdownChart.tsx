import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Scissors } from "lucide-react";

interface ServiceBreakdownChartProps {
  data: Array<{ 
    service_name: string; 
    service_count: number; 
    revenue: number;
    avg_duration: number;
  }>;
}

const COLORS = [
  'hsl(var(--primary))', 
  'hsl(var(--secondary))', 
  'hsl(var(--accent))', 
  '#8884d8', 
  '#82ca9d',
  '#ffc658',
  '#ff8042'
];

export const ServiceBreakdownChart = ({ data }: ServiceBreakdownChartProps) => {
  const chartData = data.map(item => ({
    name: item.service_name,
    value: item.service_count,
    revenue: item.revenue
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scissors className="h-5 w-5" />
          Agendamentos por Serviço
        </CardTitle>
        <CardDescription>Distribuição de serviços realizados (últimos 30 dias)</CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(Number(percent) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
            
            <div className="mt-6 space-y-2 border-t pt-4">
              <p className="text-sm font-medium mb-3">Faturamento por Serviço</p>
              {data.map((service, idx) => (
                <div key={idx} className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                    />
                    <span className="text-muted-foreground">{service.service_name}</span>
                  </div>
                  <span className="font-medium">
                    R$ {parseFloat(service.revenue.toString()).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            Nenhum dado disponível
          </div>
        )}
      </CardContent>
    </Card>
  );
};
