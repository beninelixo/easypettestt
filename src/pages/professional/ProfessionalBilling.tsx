import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Crown, CreditCard, Calendar, Users, Clock, 
  ArrowRight, CheckCircle, AlertTriangle, Sparkles,
  TrendingUp, Shield, Star, Zap, Building2, Check, Wallet
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface PlanLimits {
  appointments: number;
  users: number;
  storage: number;
}

interface PlanFeature {
  text: string;
  included: boolean;
}

interface Plan {
  id: string;
  name: string;
  price: number;
  description: string;
  icon: React.ElementType;
  features: PlanFeature[];
  popular?: boolean;
}

const PLAN_LIMITS: Record<string, PlanLimits> = {
  'gratuito': { appointments: 30, users: 1, storage: 100 },
  'free': { appointments: 30, users: 1, storage: 100 },
  'pet_gold': { appointments: -1, users: 3, storage: 1000 },
  'pet_platinum': { appointments: -1, users: 5, storage: 5000 },
  'pet_platinum_anual': { appointments: -1, users: 5, storage: 10000 },
};

const PLAN_INFO: Record<string, { name: string; color: string; gradient: string; icon: React.ElementType }> = {
  'gratuito': { name: 'Plano Gratuito', color: 'slate', gradient: 'from-slate-500 to-slate-600', icon: Star },
  'free': { name: 'Plano Gratuito', color: 'slate', gradient: 'from-slate-500 to-slate-600', icon: Star },
  'pet_gold': { name: 'Pet Gold Mensal', color: 'amber', gradient: 'from-amber-400 to-yellow-500', icon: Sparkles },
  'pet_platinum': { name: 'Pet Platinum Mensal', color: 'slate', gradient: 'from-slate-300 to-slate-500', icon: Crown },
  'pet_platinum_anual': { name: 'Pet Platinum Anual', color: 'slate', gradient: 'from-slate-300 to-slate-500', icon: Crown },
};

const plans: Plan[] = [
  {
    id: "gratuito",
    name: "Plano Gratuito",
    price: 0,
    description: "Teste grátis por 30 dias",
    icon: Zap,
    features: [
      { text: "30 agendamentos/mês", included: true },
      { text: "1 usuário", included: true },
      { text: "Calendário básico", included: true },
      { text: "Gestão de clientes", included: true },
      { text: "Lembretes automáticos", included: false },
      { text: "Relatórios avançados", included: false },
    ],
  },
  {
    id: "pet_gold",
    name: "Pet Gold Mensal",
    price: 79.90,
    description: "Ideal para crescimento",
    icon: Sparkles,
    popular: true,
    features: [
      { text: "Agendamentos ilimitados", included: true },
      { text: "Até 3 usuários", included: true },
      { text: "Gestão completa", included: true },
      { text: "Lembretes automáticos", included: true },
      { text: "Relatórios financeiros", included: true },
      { text: "WhatsApp Business", included: false },
    ],
  },
  {
    id: "pet_platinum",
    name: "Pet Platinum Mensal",
    price: 149.90,
    description: "Para operações profissionais",
    icon: Building2,
    features: [
      { text: "Tudo do Pet Gold", included: true },
      { text: "Até 5 usuários", included: true },
      { text: "Multi-unidades", included: true },
      { text: "WhatsApp Business", included: true },
      { text: "Programa de fidelidade", included: true },
      { text: "Suporte 24/7", included: true },
    ],
  },
  {
    id: "pet_platinum_anual",
    name: "Pet Platinum Anual",
    price: 1348.50,
    description: "25% de economia",
    icon: Crown,
    features: [
      { text: "Tudo do Platinum", included: true },
      { text: "25% de desconto", included: true },
      { text: "R$ 112,38/mês", included: true },
      { text: "Preço bloqueado 12 meses", included: true },
      { text: "Treinamento gratuito", included: true },
      { text: "Consultoria trimestral", included: true },
    ],
  },
];

const ProfessionalBilling = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
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
  const [petShopId, setPetShopId] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [processingUpgrade, setProcessingUpgrade] = useState(false);

  useEffect(() => {
    if (user) {
      loadSubscriptionData();
    }
  }, [user]);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "plans") {
      setActiveTab("plans");
    }
  }, [searchParams]);

  const loadSubscriptionData = async () => {
    setLoading(true);
    try {
      const { data: petShop } = await supabase
        .from("pet_shops")
        .select("id, subscription_plan, subscription_expires_at, cakto_subscription_id")
        .eq("owner_id", user?.id)
        .single();

      if (petShop) {
        setPetShopId(petShop.id);
        setSubscription({
          plan: petShop.subscription_plan || 'gratuito',
          expiresAt: petShop.subscription_expires_at,
          caktoId: petShop.cakto_subscription_id,
        });

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
          activeUsers: (usersCount || 0) + 1,
          storageUsed: 50,
        });
      }
    } catch (error) {
      console.error("Error loading subscription:", error);
    } finally {
      setLoading(false);
    }
  };

  const getUsagePercentage = (current: number, limit: number) => {
    if (limit === -1) return 0;
    return Math.min((current / limit) * 100, 100);
  };

  const isNearLimit = (current: number, limit: number) => {
    if (limit === -1) return false;
    return current >= limit * 0.8;
  };

  const handleUpgradeClick = (planId: string) => {
    setSelectedPlan(planId);
    setShowConfirmDialog(true);
  };

  const handleConfirmUpgrade = async () => {
    if (!selectedPlan || !petShopId) return;

    setProcessingUpgrade(true);
    setShowConfirmDialog(false);

    try {
      const { data, error } = await supabase.functions.invoke("cakto-checkout", {
        body: { plan: selectedPlan, petshop_id: petShopId },
      });

      if (error) throw error;

      if (data?.checkout_url) {
        toast({
          title: "Redirecionando...",
          description: "Você será redirecionado para o pagamento seguro.",
        });
        setTimeout(() => {
          window.location.href = data.checkout_url;
        }, 1000);
      }
    } catch (error: any) {
      toast({
        title: "Erro ao processar upgrade",
        description: error.message || "Tente novamente mais tarde",
        variant: "destructive",
      });
    } finally {
      setProcessingUpgrade(false);
    }
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
    <div className="container mx-auto py-8 space-y-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-secondary">
          <Wallet className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Assinatura & Planos</h1>
          <p className="text-muted-foreground">
            Gerencie sua assinatura e escolha o plano ideal
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Minha Assinatura
          </TabsTrigger>
          <TabsTrigger value="plans" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Ver Planos
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Current Plan Card */}
          <Card className={`relative overflow-hidden border-2 ${
            isGold ? 'border-amber-400/50 bg-gradient-to-br from-amber-500/5 via-yellow-500/5 to-amber-400/10' :
            isPlatinum ? 'border-slate-300/50 bg-gradient-to-br from-slate-300/5 via-slate-400/5 to-slate-300/10' :
            'border-border bg-card'
          }`}>
            <CardHeader>
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
            </CardHeader>

            <CardContent className="space-y-6">
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
                    <Progress value={getUsagePercentage(usage.storageUsed, limits.storage)} className="h-2" />
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button 
                  onClick={() => setActiveTab("plans")}
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
        </TabsContent>

        {/* Plans Tab */}
        <TabsContent value="plans" className="space-y-6">
          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
            {plans.map((plan) => {
              const Icon = plan.icon;
              const isActive = plan.id === subscription.plan;
              const isGoldPlan = plan.id.includes("gold");
              const isPlatinumPlan = plan.id.includes("platinum");

              const getPlanStyles = () => {
                if (isGoldPlan) {
                  return {
                    card: "border-2 border-amber-400/60 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 dark:from-amber-950/40 dark:via-yellow-950/30 dark:to-orange-950/20",
                    badge: "bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-950",
                    button: "bg-gradient-to-r from-amber-400 via-yellow-500 to-orange-500 hover:from-amber-500 hover:via-yellow-600 hover:to-orange-600 text-amber-950",
                    checkIcon: "text-amber-600 dark:text-amber-400",
                  };
                }
                if (isPlatinumPlan) {
                  return {
                    card: "border-2 border-slate-400/60 bg-gradient-to-br from-slate-50 via-gray-100 to-zinc-100 dark:from-slate-900/60 dark:via-gray-900/40 dark:to-zinc-900/30",
                    badge: "bg-gradient-to-r from-slate-300 to-gray-400 text-slate-900",
                    button: "bg-gradient-to-r from-slate-400 via-gray-500 to-slate-600 hover:from-slate-500 hover:via-gray-600 hover:to-slate-700 text-white",
                    checkIcon: "text-slate-600 dark:text-slate-300",
                  };
                }
                return {
                  card: "",
                  badge: "bg-primary",
                  button: "",
                  checkIcon: "text-primary",
                };
              };

              const styles = getPlanStyles();

              return (
                <Card
                  key={plan.id}
                  className={`relative transition-all duration-300 hover:scale-[1.02] ${styles.card} ${
                    plan.popular && !isGoldPlan && !isPlatinumPlan ? "border-primary shadow-lg" : ""
                  } ${isActive ? "ring-2 ring-primary ring-offset-2" : ""}`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className={styles.badge}>
                        {isGoldPlan ? "⭐ Mais Popular" : isPlatinumPlan ? "💎 Premium" : "Mais Popular"}
                      </Badge>
                    </div>
                  )}

                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <div className={`p-2 rounded-xl ${isGoldPlan ? 'bg-gradient-to-br from-amber-200 to-yellow-300' : isPlatinumPlan ? 'bg-gradient-to-br from-slate-200 to-gray-300' : 'bg-primary/10'}`}>
                        <Icon className="h-8 w-8" />
                      </div>
                      {isActive && (
                        <Badge variant="secondary" className="bg-green-500 text-white">✓ Ativo</Badge>
                      )}
                    </div>
                    <CardTitle>{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>

                  <CardContent>
                    <div className="mb-6">
                      <div className="text-3xl font-bold">
                        R$ {plan.price.toFixed(2).replace('.', ',')}
                        <span className="text-lg font-normal text-muted-foreground">
                          {plan.id.includes('anual') ? '/ano' : '/mês'}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {plan.features.map((feature, idx) => (
                        <div
                          key={idx}
                          className={`flex items-start gap-2 text-sm ${
                            !feature.included ? "text-muted-foreground" : ""
                          }`}
                        >
                          {feature.included ? (
                            <Check className={`h-4 w-4 flex-shrink-0 mt-0.5 ${styles.checkIcon}`} />
                          ) : (
                            <span className="h-4 w-4 flex-shrink-0">—</span>
                          )}
                          <span>{feature.text}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>

                  <CardFooter>
                    <Button
                      className={`w-full ${isActive ? '' : styles.button}`}
                      variant={isActive ? "secondary" : "default"}
                      disabled={isActive || processingUpgrade}
                      onClick={() => handleUpgradeClick(plan.id)}
                    >
                      {isActive ? "Plano Atual" : "Escolher Plano"}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Confirm Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Upgrade</AlertDialogTitle>
            <AlertDialogDescription>
              Você será redirecionado para o checkout seguro para completar a assinatura do plano{" "}
              <strong>{plans.find(p => p.id === selectedPlan)?.name}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmUpgrade}>
              Continuar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProfessionalBilling;
