import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Crown, CreditCard, Calendar, Users, Clock, 
  ArrowRight, CheckCircle, AlertTriangle, Sparkles,
  TrendingUp, Shield, Star
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface PlanLimits {
  appointments: number;
  users: number;
  storage: number;
}

const PLAN_LIMITS: Record<string, PlanLimits> = {
  'gratuito': { appointments: 30, users: 1, storage: 100 },
  'free': { appointments: 30, users: 1, storage: 100 },
  'pet_gold': { appointments: -1, users: 3, storage: 1000 },
  'pet_platinum': { appointments: -1, users: 5, storage: 5000 },
  'pet_platinum_anual': { appointments: -1, users: 5, storage: 10000 },
};

const PLAN_INFO: Record<string, { name: string; color: string; gradient: string; icon: typeof Crown }> = {
  'gratuito': { name: 'Plano Gratuito', color: 'slate', gradient: 'from-slate-500 to-slate-600', icon: Star },
  'free': { name: 'Plano Gratuito', color: 'slate', gradient: 'from-slate-500 to-slate-600', icon: Star },
  'pet_gold': { name: 'Pet Gold Mensal', color: 'amber', gradient: 'from-amber-400 to-yellow-500', icon: Sparkles },
  'pet_platinum': { name: 'Pet Platinum Mensal', color: 'slate', gradient: 'from-slate-300 to-slate-500', icon: Crown },
  'pet_platinum_anual': { name: 'Pet Platinum Anual', color: 'slate', gradient: 'from-slate-300 to-slate-500', icon: Crown },
};

const ProfessionalSubscription = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<{
    plan: string;
    expiresAt: string | null;
    caktoId: string | null;
  }>({ plan: 'gratuito', expiresAt: null, caktoId: null });
  const [usage, setUsage] = useState({
    appointmentsThisMonth: 0,
    activeUsers: 1,
    storageUsed: 0,
  });

  useEffect(() => {
    if (user) {
      loadSubscriptionData();
    }
  }, [user]);

  const loadSubscriptionData = async () => {
    setLoading(true);
    try {
      // Load pet shop subscription data
      const { data: petShop } = await supabase
        .from("pet_shops")
        .select("id, subscription_plan, subscription_expires_at, cakto_subscription_id")
        .eq("owner_id", user?.id)
        .single();

      if (petShop) {
        setSubscription({
          plan: petShop.subscription_plan || 'gratuito',
          expiresAt: petShop.subscription_expires_at,
          caktoId: petShop.cakto_subscription_id,
        });

        // Load usage statistics
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        
        const { count: appointmentsCount } = await supabase
          .from("appointments")
          .select("*", { count: "exact", head: true })
          .eq("pet_shop_id", petShop.id)
          .gte("scheduled_date", startOfMonth.toISOString().split('T')[0]);

        const { count: usersCount } = await supabase
          .from("petshop_employees")
          .select("*", { count: "exact", head: true })
          .eq("pet_shop_id", petShop.id)
          .eq("active", true);

        setUsage({
          appointmentsThisMonth: appointmentsCount || 0,
          activeUsers: (usersCount || 0) + 1, // +1 for owner
          storageUsed: 50, // Placeholder - would need storage API
        });
      }
    } catch (error) {
      console.error("Error loading subscription:", error);
    } finally {
      setLoading(false);
    }
  };

  const getUsagePercentage = (current: number, limit: number) => {
    if (limit === -1) return 0; // Unlimited
    return Math.min((current / limit) * 100, 100);
  };

  const isNearLimit = (current: number, limit: number) => {
    if (limit === -1) return false;
    return current >= limit * 0.8;
  };

  const planInfo = PLAN_INFO[subscription.plan] || PLAN_INFO['gratuito'];
  const limits = PLAN_LIMITS[subscription.plan] || PLAN_LIMITS['gratuito'];
  const PlanIcon = planInfo.icon;
  const isGold = subscription.plan.includes('gold');
  const isPlatinum = subscription.plan.includes('platinum');
  const isFree = subscription.plan === 'gratuito' || subscription.plan === 'free';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Minha Assinatura</h1>
        <p className="text-muted-foreground">
          Gerencie seu plano e acompanhe seu uso
        </p>
      </div>

      {/* Current Plan Card */}
      <Card className={`relative overflow-hidden border-2 ${
        isGold ? 'border-amber-400/50 bg-gradient-to-br from-amber-500/5 via-yellow-500/5 to-amber-400/10' :
        isPlatinum ? 'border-slate-300/50 bg-gradient-to-br from-slate-300/5 via-slate-400/5 to-slate-300/10' :
        'border-border bg-card'
      }`}>
        {(isGold || isPlatinum) && (
          <div className={`absolute inset-0 ${
            isGold ? 'bg-gradient-to-r from-amber-400/10 via-transparent to-yellow-500/10' :
            'bg-gradient-to-r from-slate-300/10 via-transparent to-slate-400/10'
          }`} />
        )}
        
        <CardHeader className="relative">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`p-4 rounded-2xl bg-gradient-to-br ${planInfo.gradient} shadow-lg`}>
                <PlanIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl">{planInfo.name}</CardTitle>
                <CardDescription className="mt-1">
                  {isFree ? 'Período de teste gratuito' : 'Assinatura ativa'}
                </CardDescription>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge 
                variant="secondary" 
                className={`px-3 py-1 ${
                  isGold ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400' :
                  isPlatinum ? 'bg-slate-300/20 text-slate-600 dark:text-slate-300' :
                  'bg-green-500/20 text-green-600 dark:text-green-400'
                }`}
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                Ativo
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="relative space-y-6">
          {/* Expiration Info */}
          {subscription.expiresAt && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                {new Date(subscription.expiresAt) > new Date() 
                  ? `Renova em ${format(new Date(subscription.expiresAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}`
                  : 'Assinatura expirada'
                }
              </span>
            </div>
          )}

          {/* Usage Statistics */}
          <div className="grid md:grid-cols-3 gap-4">
            {/* Appointments */}
            <div className="p-4 rounded-xl bg-muted/50 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Agendamentos</span>
                </div>
                {isNearLimit(usage.appointmentsThisMonth, limits.appointments) && (
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                )}
              </div>
              <div className="space-y-2">
                <div className="flex items-end justify-between">
                  <span className="text-2xl font-bold">{usage.appointmentsThisMonth}</span>
                  <span className="text-sm text-muted-foreground">
                    / {limits.appointments === -1 ? '∞' : limits.appointments}
                  </span>
                </div>
                {limits.appointments !== -1 && (
                  <Progress 
                    value={getUsagePercentage(usage.appointmentsThisMonth, limits.appointments)} 
                    className={`h-2 ${isNearLimit(usage.appointmentsThisMonth, limits.appointments) ? '[&>div]:bg-amber-500' : ''}`}
                  />
                )}
              </div>
            </div>

            {/* Users */}
            <div className="p-4 rounded-xl bg-muted/50 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Usuários</span>
                </div>
                {isNearLimit(usage.activeUsers, limits.users) && (
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                )}
              </div>
              <div className="space-y-2">
                <div className="flex items-end justify-between">
                  <span className="text-2xl font-bold">{usage.activeUsers}</span>
                  <span className="text-sm text-muted-foreground">/ {limits.users}</span>
                </div>
                <Progress 
                  value={getUsagePercentage(usage.activeUsers, limits.users)} 
                  className={`h-2 ${isNearLimit(usage.activeUsers, limits.users) ? '[&>div]:bg-amber-500' : ''}`}
                />
              </div>
            </div>

            {/* Storage placeholder */}
            <div className="p-4 rounded-xl bg-muted/50 space-y-3">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Armazenamento</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-end justify-between">
                  <span className="text-2xl font-bold">{usage.storageUsed} MB</span>
                  <span className="text-sm text-muted-foreground">/ {limits.storage} MB</span>
                </div>
                <Progress 
                  value={getUsagePercentage(usage.storageUsed, limits.storage)} 
                  className="h-2"
                />
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button 
              onClick={() => navigate('/professional/plans')}
              className={`flex-1 ${
                isGold ? 'bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-amber-950' :
                isPlatinum ? 'bg-gradient-to-r from-slate-400 to-slate-500 hover:from-slate-500 hover:to-slate-600' :
                ''
              }`}
            >
              {isFree ? 'Fazer Upgrade' : 'Alterar Plano'}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            
            {!isFree && (
              <Button variant="outline" className="flex-1">
                <CreditCard className="h-4 w-4 mr-2" />
                Gerenciar Pagamento
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Benefits Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Benefícios do seu plano
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { text: 'Agendamentos ' + (limits.appointments === -1 ? 'ilimitados' : `até ${limits.appointments}/mês`), active: true },
              { text: `Até ${limits.users} usuários simultâneos`, active: true },
              { text: 'Lembretes automáticos por email', active: !isFree },
              { text: 'WhatsApp Business integrado', active: isPlatinum },
              { text: 'Programa de fidelidade', active: isPlatinum },
              { text: 'Multi-unidades e franquias', active: isPlatinum },
              { text: 'Relatórios avançados', active: !isFree },
              { text: 'Suporte prioritário', active: !isFree },
            ].map((benefit, idx) => (
              <div 
                key={idx} 
                className={`flex items-center gap-3 p-3 rounded-lg ${
                  benefit.active ? 'bg-primary/5' : 'bg-muted/50 opacity-60'
                }`}
              >
                <CheckCircle className={`h-5 w-5 ${benefit.active ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className={benefit.active ? 'font-medium' : 'text-muted-foreground line-through'}>
                  {benefit.text}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Upgrade CTA for free users */}
      {isFree && (
        <Card className="border-primary/50 bg-gradient-to-br from-primary/5 via-secondary/5 to-primary/10">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-secondary">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Desbloqueie todo o potencial</h3>
                  <p className="text-muted-foreground text-sm">
                    Faça upgrade para ter agendamentos ilimitados e recursos avançados
                  </p>
                </div>
              </div>
              <Button 
                size="lg"
                className="bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                onClick={() => navigate('/professional/plans')}
              >
                Ver Planos
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProfessionalSubscription;