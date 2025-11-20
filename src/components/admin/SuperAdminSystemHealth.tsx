import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, XCircle, TrendingUp, Database, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface HealthMetrics {
  overdue_appointments: number;
  low_stock_products: number;
  negative_stock_products: number;
  pending_payments: number;
  old_pending_payments: number;
  incomplete_profiles: number;
  orphan_pets: number;
  expired_products: number;
  expiring_soon_products: number;
  completed_without_payment: number;
}

export const SuperAdminSystemHealth = () => {
  const [health, setHealth] = useState<HealthMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadHealthMetrics();
    const interval = setInterval(loadHealthMetrics, 60000); // Atualizar a cada minuto
    return () => clearInterval(interval);
  }, []);

  const loadHealthMetrics = async () => {
    try {
      const { data, error } = await supabase.rpc('get_system_health');
      if (error) throw error;
      setHealth(data as any);
    } catch (error: any) {
      console.error("Error loading health metrics:", error);
      toast({
        title: "Erro ao carregar métricas",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (count: number) => {
    if (count === 0) return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    if (count < 5) return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    return <XCircle className="h-5 w-5 text-destructive" />;
  };

  const getStatusBadge = (count: number) => {
    if (count === 0) return <Badge variant="outline" className="bg-green-500/10">Saudável</Badge>;
    if (count < 5) return <Badge variant="outline" className="bg-yellow-500/10">Atenção</Badge>;
    return <Badge variant="destructive">Crítico</Badge>;
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Saúde do Sistema</CardTitle>
          <CardDescription>
            Monitoramento em tempo real de métricas críticas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {/* Agendamentos Atrasados */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Agendamentos Atrasados
                </CardTitle>
                {getStatusIcon(health?.overdue_appointments || 0)}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{health?.overdue_appointments || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Agendamentos pendentes com data passada
                </p>
                {getStatusBadge(health?.overdue_appointments || 0)}
              </CardContent>
            </Card>

            {/* Produtos com Estoque Baixo */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Estoque Baixo
                </CardTitle>
                {getStatusIcon(health?.low_stock_products || 0)}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{health?.low_stock_products || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Produtos abaixo do estoque mínimo
                </p>
                {getStatusBadge(health?.low_stock_products || 0)}
              </CardContent>
            </Card>

            {/* Pagamentos Pendentes */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Pagamentos Pendentes
                </CardTitle>
                {getStatusIcon(health?.pending_payments || 0)}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{health?.pending_payments || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Total de pagamentos não concluídos
                </p>
                {getStatusBadge(health?.pending_payments || 0)}
              </CardContent>
            </Card>

            {/* Perfis Incompletos */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Perfis Incompletos
                </CardTitle>
                {getStatusIcon(health?.incomplete_profiles || 0)}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{health?.incomplete_profiles || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Usuários sem nome ou telefone
                </p>
                {getStatusBadge(health?.incomplete_profiles || 0)}
              </CardContent>
            </Card>

            {/* Produtos Vencidos */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Produtos Vencidos
                </CardTitle>
                {getStatusIcon(health?.expired_products || 0)}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{health?.expired_products || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Produtos com data de validade expirada
                </p>
                {getStatusBadge(health?.expired_products || 0)}
              </CardContent>
            </Card>

            {/* Agendamentos sem Pagamento */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Sem Pagamento
                </CardTitle>
                {getStatusIcon(health?.completed_without_payment || 0)}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{health?.completed_without_payment || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Agendamentos concluídos sem pagamento registrado
                </p>
                {getStatusBadge(health?.completed_without_payment || 0)}
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
