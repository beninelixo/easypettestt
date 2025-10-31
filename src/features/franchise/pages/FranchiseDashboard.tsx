import { useState } from 'react';
import { useTenant } from '@/lib/tenant-context';
import { useConsolidatedMetrics } from '@/shared/hooks/useConsolidated';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, TrendingUp, DollarSign, Users } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { UnitSwitcher } from '@/shared/components/navigation/UnitSwitcher';
import type { ConsolidatedMetrics } from '@/types/multi-tenant';

const getDefaultDateRange = () => ({
  from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  to: new Date(),
});

export const FranchiseDashboard = () => {
  const { tenantId, franchiseId } = useTenant();
  const [dateRange] = useState(getDefaultDateRange());

  const { data: metrics, isLoading } = useConsolidatedMetrics({
    tenant_id: tenantId || '',
    franchise_ids: franchiseId ? [franchiseId] : undefined,
    date_start: dateRange.from.toISOString().split('T')[0],
    date_end: dateRange.to.toISOString().split('T')[0],
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  const metricsData: Partial<ConsolidatedMetrics> = metrics || {};

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard da Franquia</h1>
          <p className="text-muted-foreground">
            Visão consolidada das suas unidades
          </p>
        </div>
        <div className="flex items-center gap-2">
          <UnitSwitcher />
          <Button variant="outline">
            Exportar Relatório
          </Button>
          <Button>
            Nova Unidade
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Minhas Unidades
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metricsData.active_units || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Agendamentos
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metricsData.total_appointments || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Faturamento Total
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {Number(metricsData.total_revenue || 0).toLocaleString('pt-BR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Clientes Ativos
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metricsData.total_clients || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Performance comparison and charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Comparativo de Performance</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center text-muted-foreground">
            Gráfico comparativo entre unidades
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ranking de Unidades</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center text-muted-foreground">
            Top performers
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
