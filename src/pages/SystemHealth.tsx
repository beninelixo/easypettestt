import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Package, 
  CreditCard, 
  Users, 
  PawPrint,
  Calendar,
  TrendingDown,
  RefreshCw
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface SystemHealthData {
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
  last_check: string;
}

const SystemHealth = () => {
  const [healthData, setHealthData] = useState<SystemHealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchHealthData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_system_health');
      
      if (error) throw error;
      
      setHealthData(data as unknown as SystemHealthData);
    } catch (error) {
      console.error('Error fetching health data:', error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar os dados de saúde do sistema",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthData();
    
    // Auto-refresh a cada 5 minutos
    const interval = setInterval(fetchHealthData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (value: number, warning: number = 0, critical: number = 0): "success" | "warning" | "destructive" => {
    if (value === 0) return "success";
    if (value <= warning) return "warning";
    return "destructive";
  };

  const healthItems = healthData ? [
    {
      title: "Agendamentos Atrasados",
      value: healthData.overdue_appointments,
      icon: Calendar,
      description: "Agendamentos pendentes/confirmados com data passada",
      status: getStatusColor(healthData.overdue_appointments, 3, 10),
    },
    {
      title: "Produtos com Estoque Baixo",
      value: healthData.low_stock_products,
      icon: Package,
      description: "Produtos abaixo do estoque mínimo",
      status: getStatusColor(healthData.low_stock_products, 5, 15),
    },
    {
      title: "Produtos com Estoque Negativo",
      value: healthData.negative_stock_products,
      icon: TrendingDown,
      description: "Produtos com quantidade negativa (erro crítico)",
      status: getStatusColor(healthData.negative_stock_products, 0, 1),
    },
    {
      title: "Pagamentos Pendentes",
      value: healthData.pending_payments,
      icon: CreditCard,
      description: "Pagamentos aguardando confirmação",
      status: getStatusColor(healthData.pending_payments, 10, 30),
    },
    {
      title: "Pagamentos Antigos Pendentes",
      value: healthData.old_pending_payments,
      icon: Clock,
      description: "Pendentes há mais de 30 dias",
      status: getStatusColor(healthData.old_pending_payments, 0, 5),
    },
    {
      title: "Perfis Incompletos",
      value: healthData.incomplete_profiles,
      icon: Users,
      description: "Usuários sem nome ou telefone",
      status: getStatusColor(healthData.incomplete_profiles, 5, 20),
    },
    {
      title: "Pets Órfãos",
      value: healthData.orphan_pets,
      icon: PawPrint,
      description: "Pets sem dono cadastrado",
      status: getStatusColor(healthData.orphan_pets, 0, 1),
    },
    {
      title: "Produtos Vencidos",
      value: healthData.expired_products,
      icon: AlertCircle,
      description: "Produtos com validade expirada",
      status: getStatusColor(healthData.expired_products, 0, 5),
    },
    {
      title: "Produtos a Vencer",
      value: healthData.expiring_soon_products,
      icon: Clock,
      description: "Vencimento nos próximos 30 dias",
      status: getStatusColor(healthData.expiring_soon_products, 5, 15),
    },
    {
      title: "Serviços sem Pagamento",
      value: healthData.completed_without_payment,
      icon: CreditCard,
      description: "Agendamentos completados sem registro de pagamento",
      status: getStatusColor(healthData.completed_without_payment, 0, 3),
    },
  ] : [];

  const criticalIssues = healthItems.filter(item => item.status === "destructive");
  const warningIssues = healthItems.filter(item => item.status === "warning");
  const healthyItems = healthItems.filter(item => item.status === "success");

  const overallHealth = criticalIssues.length === 0 && warningIssues.length === 0 ? "healthy" : 
                        criticalIssues.length > 0 ? "critical" : "warning";

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Saúde do Sistema</h1>
            <p className="text-muted-foreground mt-2">
              Monitoramento em tempo real da integridade dos dados
            </p>
          </div>
          <Button onClick={fetchHealthData} disabled={loading} variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>

        {/* Overall Status */}
        {loading ? (
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full" />
            </CardContent>
          </Card>
        ) : (
          <Card className={`border-2 ${
            overallHealth === "healthy" ? "border-green-500" : 
            overallHealth === "critical" ? "border-red-500" : 
            "border-yellow-500"
          }`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {overallHealth === "healthy" ? (
                    <CheckCircle2 className="h-8 w-8 text-green-500" />
                  ) : (
                    <AlertCircle className="h-8 w-8 text-yellow-500 md:text-red-500" />
                  )}
                  <div>
                    <CardTitle className="text-2xl">
                      {overallHealth === "healthy" ? "Sistema Saudável" : 
                       overallHealth === "critical" ? "Atenção Necessária" : 
                       "Avisos Detectados"}
                    </CardTitle>
                    <CardDescription>
                      {criticalIssues.length > 0 && `${criticalIssues.length} problema(s) crítico(s) • `}
                      {warningIssues.length > 0 && `${warningIssues.length} aviso(s) • `}
                      {healthyItems.length} item(ns) OK
                    </CardDescription>
                  </div>
                </div>
                {healthData && (
                  <Badge variant="secondary">
                    Última verificação: {new Date(healthData.last_check).toLocaleString('pt-BR')}
                  </Badge>
                )}
              </div>
            </CardHeader>
          </Card>
        )}

        {/* Critical Issues */}
        {criticalIssues.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-red-500 flex items-center gap-2">
              <AlertCircle className="h-6 w-6" />
              Problemas Críticos
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {criticalIssues.map((item, index) => (
                <MetricCard key={index} {...item} />
              ))}
            </div>
          </div>
        )}

        {/* Warnings */}
        {warningIssues.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-yellow-500 flex items-center gap-2">
              <Clock className="h-6 w-6" />
              Avisos
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {warningIssues.map((item, index) => (
                <MetricCard key={index} {...item} />
              ))}
            </div>
          </div>
        )}

        {/* Healthy Items */}
        {healthyItems.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-green-500 flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6" />
              Itens Saudáveis
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {healthyItems.map((item, index) => (
                <MetricCard key={index} {...item} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

interface MetricCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
  description: string;
  status: "success" | "warning" | "destructive";
}

const MetricCard = ({ title, value, icon: Icon, description, status }: MetricCardProps) => {
  const statusConfig = {
    success: {
      bg: "bg-green-500/10 border-green-500/20",
      text: "text-green-600 dark:text-green-400",
      icon: "text-green-500",
    },
    warning: {
      bg: "bg-yellow-500/10 border-yellow-500/20",
      text: "text-yellow-600 dark:text-yellow-400",
      icon: "text-yellow-500",
    },
    destructive: {
      bg: "bg-red-500/10 border-red-500/20",
      text: "text-red-600 dark:text-red-400",
      icon: "text-red-500",
    },
  };

  const config = statusConfig[status];

  return (
    <Card className={`${config.bg} border-2`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <Icon className={`h-5 w-5 ${config.icon}`} />
          <Badge variant={status === "success" ? "secondary" : status === "destructive" ? "destructive" : "outline"}>
            {value}
          </Badge>
        </div>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
};

export default SystemHealth;
