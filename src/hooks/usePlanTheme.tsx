import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type PlanType = "free" | "gold" | "platinum";

export interface PlanTheme {
  plan: PlanType;
  rawPlan: string;
  planName: string;
  primaryColor: string;
  secondaryColor: string;
  gradientClass: string;
  badgeClass: string;
  glowClass: string;
  borderClass: string;
  textClass: string;
  cardBgClass: string;
  loading: boolean;
}

// Normalize plan names to base types
const normalizePlan = (plan: string | null): PlanType => {
  if (!plan) return "free";
  const lowerPlan = plan.toLowerCase();
  
  if (lowerPlan.includes("gold")) return "gold";
  if (lowerPlan.includes("platinum")) return "platinum";
  if (lowerPlan === "gratuito" || lowerPlan === "free") return "free";
  
  return "free";
};

export const usePlanTheme = () => {
  const { user } = useAuth();
  const [theme, setTheme] = useState<PlanTheme>({
    plan: "free",
    rawPlan: "gratuito",
    planName: "Plano Gratuito",
    primaryColor: "hsl(var(--primary))",
    secondaryColor: "hsl(var(--secondary))",
    gradientClass: "from-primary to-secondary",
    badgeClass: "bg-primary/10 text-primary border-primary/30",
    glowClass: "shadow-glow",
    borderClass: "border-primary/20",
    textClass: "text-primary",
    cardBgClass: "bg-card",
    loading: true,
  });

  useEffect(() => {
    if (!user) return;

    const fetchPlan = async () => {
      try {
        // Buscar pet shop do usuário (como owner)
        const { data: ownedShop } = await supabase
          .from("pet_shops")
          .select("subscription_plan")
          .eq("owner_id", user.id)
          .maybeSingle();

        let rawPlan = "gratuito";

        if (ownedShop?.subscription_plan) {
          rawPlan = ownedShop.subscription_plan;
        } else {
          // Se não é owner, verificar se é funcionário
          const { data: employeeShop } = await supabase
            .from("petshop_employees")
            .select("pet_shop_id")
            .eq("user_id", user.id)
            .eq("active", true)
            .maybeSingle();

          if (employeeShop) {
            const { data: shopData } = await supabase
              .from("pet_shops")
              .select("subscription_plan")
              .eq("id", employeeShop.pet_shop_id)
              .single();

            if (shopData?.subscription_plan) {
              rawPlan = shopData.subscription_plan;
            }
          }
        }

        const plan = normalizePlan(rawPlan);
        
        // Get display name for plan
        const getPlanName = (raw: string): string => {
          const names: Record<string, string> = {
            'gratuito': 'Plano Gratuito',
            'pet_gold': 'Pet Gold',
            'pet_platinum': 'Pet Platinum',
            'pet_platinum_anual': 'Pet Platinum Anual',
          };
          return names[raw.toLowerCase()] || 'Plano Gratuito';
        };

        // Definir tema baseado no plano normalizado
        let planTheme: PlanTheme;

        switch (plan) {
          case "gold":
            planTheme = {
              plan: "gold",
              rawPlan,
              planName: getPlanName(rawPlan),
              primaryColor: "hsl(var(--plan-gold-primary))",
              secondaryColor: "hsl(var(--plan-gold-secondary))",
              gradientClass: "from-amber-400 via-yellow-500 to-orange-500",
              badgeClass: "bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-950 border-amber-400/50",
              glowClass: "shadow-[0_0_40px_hsl(45_93%_57%/0.4)]",
              borderClass: "border-amber-400/50",
              textClass: "text-amber-500",
              cardBgClass: "bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 dark:from-amber-950/30 dark:via-yellow-950/20 dark:to-orange-950/10",
              loading: false,
            };
            break;

          case "platinum":
            planTheme = {
              plan: "platinum",
              rawPlan,
              planName: getPlanName(rawPlan),
              primaryColor: "hsl(var(--plan-platinum-primary))",
              secondaryColor: "hsl(var(--plan-platinum-secondary))",
              gradientClass: "from-slate-300 via-gray-400 to-slate-500",
              badgeClass: "bg-gradient-to-r from-slate-300 to-gray-400 text-slate-900 border-slate-400/50",
              glowClass: "shadow-[0_0_40px_hsl(240_5%_74%/0.5)]",
              borderClass: "border-slate-400/50",
              textClass: "text-slate-500",
              cardBgClass: "bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-100 dark:from-slate-900/50 dark:via-gray-900/30 dark:to-zinc-900/20",
              loading: false,
            };
            break;

          default:
            planTheme = {
              plan: "free",
              rawPlan,
              planName: getPlanName(rawPlan),
              primaryColor: "hsl(var(--primary))",
              secondaryColor: "hsl(var(--secondary))",
              gradientClass: "from-primary to-secondary",
              badgeClass: "bg-primary/10 text-primary border-primary/30",
              glowClass: "shadow-glow",
              borderClass: "border-primary/20",
              textClass: "text-primary",
              cardBgClass: "bg-card",
              loading: false,
            };
        }

        setTheme(planTheme);
      } catch (error) {
        console.error("Error fetching plan theme:", error);
        setTheme((prev) => ({ ...prev, loading: false }));
      }
    };

    fetchPlan();
  }, [user]);

  return theme;
};
