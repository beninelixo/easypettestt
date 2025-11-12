import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, Zap, Building2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const planIcons: Record<string, any> = {
  gratuito: Zap,
  pet_gold: Sparkles,
  pet_platinum: Building2,
};

const planNames: Record<string, string> = {
  gratuito: "Plano Gratuito",
  pet_gold: "Pet Gold",
  pet_platinum: "Pet Platinum",
};

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);
  const [planData, setPlanData] = useState<{
    plan: string;
    expiresAt: string | null;
  } | null>(null);

  const plan = searchParams.get("plan") || "pet_gold";
  const Icon = planIcons[plan] || Sparkles;

  useEffect(() => {
    // Fetch updated plan data
    const fetchPlanData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: petShop } = await supabase
        .from("pet_shops")
        .select("subscription_plan, subscription_expires_at")
        .eq("owner_id", user.id)
        .single();

      if (petShop) {
        setPlanData({
          plan: petShop.subscription_plan || "gratuito",
          expiresAt: petShop.subscription_expires_at,
        });
      }
    };

    fetchPlanData();
  }, []);

  useEffect(() => {
    // Countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate("/professional-dashboard");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-50 via-green-50 to-blue-50 dark:from-cyan-950 dark:via-green-950 dark:to-blue-950 p-4">
      <Card className="max-w-2xl w-full border-2 shadow-2xl animate-in fade-in zoom-in duration-500">
        <CardHeader className="text-center space-y-6 pb-8">
          {/* Animated Success Icon */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-green-500 rounded-full blur-2xl opacity-50 animate-pulse" />
              <div className="relative h-32 w-32 rounded-full bg-gradient-to-r from-cyan-500 to-green-500 flex items-center justify-center animate-bounce">
                <Check className="h-16 w-16 text-white animate-in zoom-in duration-700 delay-300" />
              </div>
            </div>
          </div>

          {/* Success Message */}
          <div className="space-y-2 animate-in slide-in-from-bottom duration-700 delay-500">
            <CardTitle className="text-4xl font-bold bg-gradient-to-r from-cyan-600 to-green-600 bg-clip-text text-transparent">
              🎉 Pagamento Confirmado!
            </CardTitle>
            <p className="text-muted-foreground text-lg">
              Seu plano foi ativado com sucesso
            </p>
          </div>

          {/* Confetti Animation */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-confetti"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: "-10%",
                  animationDelay: `${Math.random() * 2}s`,
                  fontSize: `${Math.random() * 20 + 20}px`,
                }}
              >
                {["🎊", "🎉", "✨", "⭐", "🌟"][Math.floor(Math.random() * 5)]}
              </div>
            ))}
          </div>
        </CardHeader>

        <CardContent className="space-y-6 animate-in slide-in-from-bottom duration-700 delay-700">
          {/* Plan Details */}
          <Card className="border-primary bg-gradient-to-r from-cyan-50/50 to-green-50/50 dark:from-cyan-950/30 dark:to-green-950/30">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-r from-cyan-500 to-green-500 flex items-center justify-center">
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">{planNames[plan]}</h3>
                    <Badge className="mt-1 bg-gradient-to-r from-cyan-500 to-green-500">
                      Plano Ativo
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Acesso completo a todos os recursos</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Suporte prioritário</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Agendamentos ilimitados</span>
                </div>
                {plan === "pet_platinum" && (
                  <>
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary" />
                      <span>Multi-unidades e franquias</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary" />
                      <span>WhatsApp Business integrado</span>
                    </div>
                  </>
                )}
              </div>

              {planData?.expiresAt && (
                <div className="mt-6 pt-6 border-t">
                  <p className="text-sm text-muted-foreground">
                    Próxima renovação:{" "}
                    <span className="font-semibold text-foreground">
                      {new Date(planData.expiresAt).toLocaleDateString("pt-BR")}
                    </span>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-4">🚀 Próximos Passos</h3>
              <ol className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-primary">1.</span>
                  <span>Configure seus serviços e horários de atendimento</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-primary">2.</span>
                  <span>Adicione sua equipe de profissionais</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-primary">3.</span>
                  <span>Comece a aceitar agendamentos online</span>
                </li>
              </ol>
            </CardContent>
          </Card>

          {/* Countdown and Action */}
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Redirecionando para o dashboard em{" "}
                <span className="font-bold text-primary text-xl">{countdown}</span>{" "}
                segundos...
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => navigate("/professional-dashboard")}
                className="flex-1 bg-gradient-to-r from-cyan-500 to-green-500 hover:from-cyan-600 hover:to-green-600"
                size="lg"
              >
                Ir para Dashboard
              </Button>
              <Button
                onClick={() => navigate("/professional/plans")}
                variant="outline"
                size="lg"
              >
                Ver Planos
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <style>{`
        @keyframes confetti {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-confetti {
          animation: confetti 3s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default PaymentSuccess;
