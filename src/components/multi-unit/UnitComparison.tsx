import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, DollarSign, Users, Calendar } from "lucide-react";
import type { Unit } from "@/types/multi-tenant";

interface UnitMetrics {
  unit: Unit;
  revenue: number;
  appointments: number;
  clients: number;
  growth: number;
}

interface UnitComparisonProps {
  units: UnitMetrics[];
}

export function UnitComparison({ units }: UnitComparisonProps) {
  if (units.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            Nenhuma unidade para comparar
          </p>
        </CardContent>
      </Card>
    );
  }

  const maxRevenue = Math.max(...units.map(u => u.revenue));
  const maxAppointments = Math.max(...units.map(u => u.appointments));
  const maxClients = Math.max(...units.map(u => u.clients));

  const getTrendIcon = (growth: number) => {
    if (growth > 5) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (growth < -5) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const getTrendColor = (growth: number) => {
    if (growth > 5) return "text-green-600";
    if (growth < -5) return "text-red-600";
    return "text-muted-foreground";
  };

  return (
    <div className="space-y-4">
      {units.map((unitMetric, index) => (
        <Card key={unitMetric.unit.id} className="relative overflow-hidden">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">{unitMetric.unit.name}</CardTitle>
                <CardDescription>{unitMetric.unit.code}</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={index === 0 ? "default" : "secondary"}>
                  #{index + 1}
                </Badge>
                {getTrendIcon(unitMetric.growth)}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Revenue */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Faturamento</span>
                </div>
                <span className="font-medium">
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(unitMetric.revenue)}
                </span>
              </div>
              <Progress 
                value={(unitMetric.revenue / maxRevenue) * 100} 
                className="h-2"
              />
            </div>

            {/* Appointments */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Agendamentos</span>
                </div>
                <span className="font-medium">{unitMetric.appointments}</span>
              </div>
              <Progress 
                value={(unitMetric.appointments / maxAppointments) * 100} 
                className="h-2"
              />
            </div>

            {/* Clients */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Clientes Ativos</span>
                </div>
                <span className="font-medium">{unitMetric.clients}</span>
              </div>
              <Progress 
                value={(unitMetric.clients / maxClients) * 100} 
                className="h-2"
              />
            </div>

            {/* Growth */}
            <div className="pt-2 border-t">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Crescimento</span>
                <span className={`font-medium ${getTrendColor(unitMetric.growth)}`}>
                  {unitMetric.growth > 0 ? "+" : ""}
                  {unitMetric.growth.toFixed(1)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
