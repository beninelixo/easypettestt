import { useState, useEffect } from "react";
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
    name: "Gratuito",
    price: 0,
    description: "Para começar",
    icon: Zap,
    features: [
      { text: "30 agendamentos/mês", included: true },
      { text: "1 usuário", included: true },
      { text: "Calendário básico", included: true },
      { text: "Gestão de clientes", included: true },
      { text: "Lembretes automáticos", included: false },
      { text: "Relatórios avançados", included: false },
      { text: "Multi-unidades", included: false },
    ],
  },
  {
    id: "profissional",
    name: "Profissional",
    price: 79,
    description: "Para crescer",
    icon: Sparkles,
    popular: true,
    features: [
      { text: "Agendamentos ilimitados", included: true },
      { text: "Até 5 usuários", included: true },
      { text: "Lembretes WhatsApp e Email", included: true },
      { text: "Relatórios básicos", included: true },
      { text: "Sistema de fidelidade", included: true },
      { text: "Suporte prioritário", included: true },
      { text: "Multi-unidades", included: false },
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 199,
    description: "Para escalar",
    icon: Building2,
    features: [
      { text: "Tudo do Profissional", included: true },
      { text: "Usuários ilimitados", included: true },
      { text: "Multi-unidades (franquias)", included: true },
      { text: "Relatórios avançados", included: true },
      { text: "API personalizada", included: true },
      { text: "Suporte dedicado 24/7", included: true },
      { text: "Onboarding personalizado", included: true },
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

  useEffect(() => {
    fetchCurrentPlan();
  }, []);

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
        window.location.href = data.checkout_url;
      }
    } catch (error: any) {
      console.error("Error creating checkout:", error);
      toast({
        title: "Erro ao processar upgrade",
        description: error.message || "Tente novamente mais tarde",
        variant: "destructive",
      });
    } finally {
      setProcessingUpgrade(false);
    }
  };

  const getPlanButtonText = (planId: string) => {
    if (planId === currentPlan) return "Plano Atual";
    
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
              <span className="text-lg font-normal text-muted-foreground">/mês</span>
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
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const isActive = isPlanActive(plan.id);
            const canUpgrade = plans.findIndex(p => p.id === plan.id) > 
                              plans.findIndex(p => p.id === currentPlan);

            return (
              <Card
                key={plan.id}
                className={`relative ${
                  plan.popular ? "border-primary shadow-lg" : ""
                } ${isActive ? "bg-muted/50" : ""}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary">Mais Popular</Badge>
                  </div>
                )}

                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Icon className="h-8 w-8 text-primary" />
                    {isActive && (
                      <Badge variant="secondary">Ativo</Badge>
                    )}
                  </div>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="mb-6">
                    <div className="text-3xl font-bold">
                      R$ {plan.price}
                      <span className="text-lg font-normal text-muted-foreground">
                        /mês
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
                          <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
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
                    className="w-full"
                    variant={isActive ? "secondary" : plan.popular ? "default" : "outline"}
                    disabled={isActive || processingUpgrade}
                    onClick={() => canUpgrade && handleUpgradeClick(plan.id)}
                  >
                    {processingUpgrade && selectedPlan === plan.id
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
