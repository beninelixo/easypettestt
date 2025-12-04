import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Check, CreditCard, Sparkles, Zap, Building2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
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

interface PlanFeature {
  text: string;
  included: boolean;
}

interface Plan {
  id: string;
  name: string;
  price: number;
  description: string;
  icon: any;
  features: PlanFeature[];
  popular?: boolean;
}

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
      { text: "Upgrade a qualquer momento", included: true },
      { text: "Lembretes automáticos", included: false },
      { text: "Relatórios avançados", included: false },
      { text: "Multi-unidades", included: false },
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
      { text: "Até 3 usuários simultâneos", included: true },
      { text: "Gestão completa de clientes e pets", included: true },
      { text: "Controle de estoque básico", included: true },
      { text: "Calendário e agenda online", included: true },
      { text: "Relatórios financeiros básicos", included: true },
      { text: "Lembretes automáticos por email", included: true },
      { text: "App mobile completo", included: true },
      { text: "Suporte prioritário", included: true },
      { text: "WhatsApp Business", included: false },
      { text: "Programa de fidelidade", included: false },
      { text: "Multi-unidades", included: false },
    ],
  },
  {
    id: "pet_platinum",
    name: "Pet Platinum Mensal",
    price: 149.90,
    description: "Para operações profissionais",
    icon: Building2,
    features: [
      { text: "✨ Tudo do Pet Gold, mais:", included: true },
      { text: "Até 5 usuários simultâneos", included: true },
      { text: "Multi-unidades e franquias", included: true },
      { text: "WhatsApp Business integrado", included: true },
      { text: "Programa de fidelidade avançado", included: true },
      { text: "Relatórios financeiros avançados", included: true },
      { text: "API aberta para integrações", included: true },
      { text: "White label (marca própria)", included: true },
      { text: "Gerente de conta dedicado", included: true },
      { text: "Consultoria estratégica mensal", included: true },
      { text: "Suporte técnico 24/7 Premium", included: true },
      { text: "SLA de uptime 99.9%", included: true },
    ],
  },
  {
    id: "pet_platinum_anual",
    name: "Pet Platinum Anual",
    price: 1348.50,
    description: "25% de economia - Melhor custo-benefício",
    icon: Building2,
    features: [
      { text: "✨ Tudo do Pet Platinum, mais:", included: true },
      { text: "Economia de R$ 450,30/ano (25% OFF)", included: true },
      { text: "Equivalente a R$ 112,38/mês", included: true },
      { text: "Preço bloqueado por 12 meses", included: true },
      { text: "Prioridade máxima no suporte", included: true },
      { text: "Treinamento gratuito para equipe", included: true },
      { text: "Consultoria trimestral presencial", included: true },
      { text: "Onboarding personalizado", included: true },
      { text: "Backup premium com retenção estendida", included: true },
      { text: "Suporte dedicado WhatsApp", included: true },
    ],
  },
];

const ProfessionalPlans = () => {
  const { toast } = useToast();
  const [currentPlan, setCurrentPlan] = useState<string>("gratuito");
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [processingUpgrade, setProcessingUpgrade] = useState(false);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    fetchCurrentPlan();
  }, []);

  // Auto-ativar teste gratuito se veio do pricing com startFree=1
  useEffect(() => {
    if (!loading) {
      const startFree = searchParams.get("startFree");
      if (startFree === "1" && currentPlan !== "gratuito") {
        handleFreePlanActivation();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, searchParams, currentPlan]);

  const fetchCurrentPlan = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: petShop, error } = await supabase
        .from("pet_shops")
        .select("subscription_plan, subscription_expires_at, cakto_subscription_id")
        .eq("owner_id", user.id)
        .single();

      if (error) throw error;

      if (petShop) {
        setCurrentPlan(petShop.subscription_plan || "gratuito");
        setExpiresAt(petShop.subscription_expires_at);
      }
    } catch (error) {
      console.error("Error fetching plan:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgradeClick = (planId: string) => {
    setSelectedPlan(planId);
    setShowConfirmDialog(true);
  };

  const handleFreePlanActivation = async () => {
    setProcessingUpgrade(true);

    try {
      const { data, error } = await supabase.functions.invoke("activate-free-plan");

      if (error) throw error;

      toast({
        title: "Plano Gratuito Ativado! 🎉",
        description: "Você tem 30 dias para testar todas as funcionalidades do sistema.",
      });

      // Refresh current plan
      await fetchCurrentPlan();
    } catch (error: any) {
      console.error("Error activating free plan:", error);
      toast({
        title: "Erro ao ativar plano gratuito",
        description: error.message || "Tente novamente mais tarde",
        variant: "destructive",
      });
    } finally {
      setProcessingUpgrade(false);
    }
  };

  const handleConfirmUpgrade = async () => {
    if (!selectedPlan) return;

    setProcessingUpgrade(true);
    setShowConfirmDialog(false);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { data: petShop } = await supabase
        .from("pet_shops")
        .select("id")
        .eq("owner_id", user.id)
        .single();

      if (!petShop) throw new Error("Pet shop não encontrado");

      // Call edge function to create checkout
      const { data, error } = await supabase.functions.invoke("cakto-checkout", {
        body: {
          plan: selectedPlan,
          petshop_id: petShop.id,
        },
      });

      if (error) throw error;

      if (data?.checkout_url) {
        // Redirect to Cakto checkout
        toast({
          title: "Redirecionando...",
          description: "Você será redirecionado para o pagamento seguro.",
        });
        setTimeout(() => {
          window.location.href = data.checkout_url;
        }, 1000);
      } else {
        console.error("No checkout URL received", data);
        toast({
          title: "Erro ao processar checkout",
          description: "Não foi possível gerar o link de pagamento. Verifique sua conexão com a Cakto.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error creating checkout:", error);
      
      let errorMessage = error.message || "Tente novamente mais tarde";
      
      // Provide more specific error messages
      if (error.message?.includes("CAKTO_API_KEY")) {
        errorMessage = "Sistema de pagamento não configurado. Entre em contato com o suporte.";
      } else if (error.message?.includes("Pet shop not found")) {
        errorMessage = "Pet shop não encontrado. Faça logout e entre novamente.";
      }
      
      toast({
        title: "Erro ao processar upgrade",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setProcessingUpgrade(false);
    }
  };

  const getPlanButtonText = (planId: string) => {
    if (planId === currentPlan) return "Plano Atual";
    
    // Special case for free plan
    if (planId === "gratuito" && currentPlan !== "gratuito") {
      return "🎁 Começar Teste Gratuito";
    }
    
    const planIndex = plans.findIndex(p => p.id === planId);
    const currentPlanIndex = plans.findIndex(p => p.id === currentPlan);
    
    if (planIndex > currentPlanIndex) return "Fazer Upgrade";
    return "Downgrade";
  };

  const isPlanActive = (planId: string) => planId === currentPlan;

  const getExpirationText = () => {
    if (!expiresAt) return null;
    const date = new Date(expiresAt);
    const now = new Date();
    const isExpired = date < now;
    
    return isExpired ? "Expirado" : `Renovação em ${date.toLocaleDateString("pt-BR")}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Carregando planos...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Planos e Assinaturas</h1>
        <p className="text-muted-foreground">
          Escolha o plano ideal para o seu negócio
        </p>
      </div>

      {/* Current Plan Section */}
      <Card className="border-primary bg-primary/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Seu Plano Atual
              </CardTitle>
              <CardDescription className="mt-2">
                Plano <strong>{plans.find(p => p.id === currentPlan)?.name}</strong>
              </CardDescription>
            </div>
            <Badge variant="default" className="text-sm">
              Ativo
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-3xl font-bold">
              R$ {plans.find(p => p.id === currentPlan)?.price}
              <span className="text-lg font-normal text-muted-foreground">
                {currentPlan.includes('anual') ? '/ano' : '/mês'}
              </span>
            </div>
            
            {expiresAt && (
              <p className="text-sm text-muted-foreground">
                {getExpirationText()}
              </p>
            )}

            <div className="space-y-2 pt-4">
              {plans
                .find(p => p.id === currentPlan)
                ?.features.filter(f => f.included)
                .map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary" />
                    <span>{feature.text}</span>
                  </div>
                ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Plans */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Planos Disponíveis</h2>
        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const isActive = isPlanActive(plan.id);
            const canUpgrade = plans.findIndex(p => p.id === plan.id) > 
                              plans.findIndex(p => p.id === currentPlan);
            const isFreePlan = plan.id === "gratuito";
            const isGold = plan.id.includes("gold");
            const isPlatinum = plan.id.includes("platinum");

            // Plan-specific styles
            const getPlanStyles = () => {
              if (isGold) {
                return {
                  card: "border-2 border-amber-400/60 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 dark:from-amber-950/40 dark:via-yellow-950/30 dark:to-orange-950/20 shadow-[0_0_30px_hsl(51_100%_50%/0.25)]",
                  badge: "bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-950",
                  icon: "text-amber-500",
                  checkIcon: "text-amber-600 dark:text-amber-400",
                  button: "bg-gradient-to-r from-amber-400 via-yellow-500 to-orange-500 hover:from-amber-500 hover:via-yellow-600 hover:to-orange-600 text-amber-950 font-semibold shadow-lg shadow-amber-500/30",
                  price: "text-amber-600 dark:text-amber-400",
                };
              }
              if (isPlatinum) {
                return {
                  card: "border-2 border-slate-400/60 bg-gradient-to-br from-slate-50 via-gray-100 to-zinc-100 dark:from-slate-900/60 dark:via-gray-900/40 dark:to-zinc-900/30 shadow-[0_0_30px_hsl(210_10%_75%/0.35)]",
                  badge: "bg-gradient-to-r from-slate-300 to-gray-400 text-slate-900",
                  icon: "text-slate-500",
                  checkIcon: "text-slate-600 dark:text-slate-300",
                  button: "bg-gradient-to-r from-slate-400 via-gray-500 to-slate-600 hover:from-slate-500 hover:via-gray-600 hover:to-slate-700 text-white font-semibold shadow-lg shadow-slate-500/30",
                  price: "text-slate-600 dark:text-slate-300",
                };
              }
              return {
                card: "",
                badge: "bg-primary",
                icon: "text-primary",
                checkIcon: "text-primary",
                button: "",
                price: "",
              };
            };

            const styles = getPlanStyles();

            return (
              <Card
                key={plan.id}
                className={`relative transition-all duration-300 hover:scale-[1.02] ${styles.card} ${
                  plan.popular && !isGold && !isPlatinum ? "border-primary shadow-lg" : ""
                } ${isActive ? "ring-2 ring-primary ring-offset-2" : ""}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className={styles.badge}>
                      {isGold ? "⭐ Mais Popular" : isPlatinum ? "💎 Premium" : "Mais Popular"}
                    </Badge>
                  </div>
                )}
                {isFreePlan && !isActive && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-green-500">TESTE GRÁTIS - 30 DIAS</Badge>
                  </div>
                )}

                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-2 rounded-xl ${isGold ? 'bg-gradient-to-br from-amber-200 to-yellow-300' : isPlatinum ? 'bg-gradient-to-br from-slate-200 to-gray-300' : 'bg-primary/10'}`}>
                      <Icon className={`h-8 w-8 ${styles.icon}`} />
                    </div>
                    {isActive && (
                      <Badge variant="secondary" className="bg-green-500 text-white">✓ Ativo</Badge>
                    )}
                  </div>
                  <CardTitle className={isGold ? "text-amber-700 dark:text-amber-300" : isPlatinum ? "text-slate-700 dark:text-slate-200" : ""}>
                    {plan.name}
                  </CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="mb-6">
                    <div className={`text-3xl font-bold ${styles.price}`}>
                      R$ {plan.price}
                      <span className="text-lg font-normal text-muted-foreground">
                        {plan.id.includes('anual') ? '/ano' : '/mês'}
                      </span>
                    </div>
                    {plan.id.includes('anual') && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Equivalente a R$ {(plan.price / 10).toFixed(2)}/mês
                      </p>
                    )}
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
                    className={`w-full ${(isGold || isPlatinum) && !isActive ? styles.button : ""}`}
                    variant={isActive ? "secondary" : plan.popular && !isGold && !isPlatinum ? "default" : isFreePlan ? "default" : "outline"}
                    disabled={isActive || processingUpgrade}
                    onClick={() => {
                      if (isFreePlan && !isActive) {
                        handleFreePlanActivation();
                      } else if (canUpgrade) {
                        handleUpgradeClick(plan.id);
                      }
                    }}
                  >
                    {processingUpgrade && (isFreePlan ? !isActive : selectedPlan === plan.id)
                      ? "Processando..."
                      : getPlanButtonText(plan.id)}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle>Comparação de Recursos</CardTitle>
          <CardDescription>
            Veja todos os recursos disponíveis em cada plano
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Recurso</th>
                  {plans.map((plan) => (
                    <th key={plan.id} className="text-center py-3 px-4">
                      {plan.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  "Agendamentos",
                  "Usuários",
                  "Lembretes automáticos",
                  "Relatórios",
                  "Sistema de fidelidade",
                  "Multi-unidades",
                  "Suporte",
                ].map((feature, idx) => (
                  <tr key={idx} className="border-b">
                    <td className="py-3 px-4 font-medium">{feature}</td>
                    {plans.map((plan) => {
                      const hasFeature = plan.features.some(
                        (f) => f.included && f.text.toLowerCase().includes(feature.toLowerCase())
                      );
                      return (
                        <td key={plan.id} className="text-center py-3 px-4">
                          {hasFeature ? (
                            <Check className="h-5 w-5 text-primary mx-auto" />
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Confirmar Upgrade para {plans.find(p => p.id === selectedPlan)?.name}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Você será redirecionado para o checkout seguro da Cakto para completar o pagamento.
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span>Plano atual:</span>
                    <span className="font-medium">
                      {plans.find(p => p.id === currentPlan)?.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Novo plano:</span>
                    <span className="font-medium">
                      {plans.find(p => p.id === selectedPlan)?.name}
                    </span>
                  </div>
                  <div className="flex justify-between text-base font-bold pt-2 border-t">
                    <span>Valor mensal:</span>
                    <span>R$ {plans.find(p => p.id === selectedPlan)?.price}</span>
                  </div>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmUpgrade}>
              Continuar para Pagamento
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProfessionalPlans;
