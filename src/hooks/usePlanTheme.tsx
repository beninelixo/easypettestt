import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type PlanType = "free" | "gold" | "platinum";

export interface PlanTheme {
  plan: PlanType;
  primaryColor: string;
  secondaryColor: string;
  gradientClass: string;
  badgeClass: string;
  glowClass: string;
  borderClass: string;
  textClass: string;
  loading: boolean;
}

export const usePlanTheme = () => {
  const { user } = useAuth();
  const [theme, setTheme] = useState<PlanTheme>({
    plan: "free",
    primaryColor: "hsl(var(--primary))",
    secondaryColor: "hsl(var(--secondary))",
    gradientClass: "from-primary to-secondary",
    badgeClass: "bg-primary/10 text-primary",
    glowClass: "shadow-glow",
    borderClass: "border-primary/20",
    textClass: "text-primary",
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

        let plan: PlanType = "free";

        if (ownedShop?.subscription_plan) {
          plan = ownedShop.subscription_plan as PlanType;
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
              plan = shopData.subscription_plan as PlanType;
            }
          }
        }

        // Definir tema baseado no plano
        let planTheme: PlanTheme;

        switch (plan) {
          case "gold":
            planTheme = {
              plan: "gold",
              primaryColor: "hsl(var(--plan-gold-primary))",
              secondaryColor: "hsl(var(--plan-gold-secondary))",
              gradientClass: "from-plan-gold-primary via-plan-gold-secondary to-plan-gold-accent",
              badgeClass: "bg-plan-gold-primary/10 text-plan-gold-primary border-plan-gold-primary/30",
              glowClass: "shadow-[0_0_40px_hsl(var(--plan-gold-primary)/0.4)]",
              borderClass: "border-plan-gold-primary/30",
              textClass: "text-plan-gold-primary",
              loading: false,
            };
            break;

          case "platinum":
            planTheme = {
              plan: "platinum",
              primaryColor: "hsl(var(--plan-platinum-primary))",
              secondaryColor: "hsl(var(--plan-platinum-secondary))",
              gradientClass: "from-plan-platinum-primary via-plan-platinum-secondary to-plan-platinum-accent",
              badgeClass: "bg-plan-platinum-primary/10 text-plan-platinum-primary border-plan-platinum-primary/30",
              glowClass: "shadow-[0_0_40px_hsl(var(--plan-platinum-primary)/0.5)]",
              borderClass: "border-plan-platinum-primary/30",
              textClass: "text-plan-platinum-primary",
              loading: false,
            };
            break;

          default:
            planTheme = {
              plan: "free",
              primaryColor: "hsl(var(--primary))",
              secondaryColor: "hsl(var(--secondary))",
              gradientClass: "from-primary to-secondary",
              badgeClass: "bg-primary/10 text-primary border-primary/30",
              glowClass: "shadow-glow",
              borderClass: "border-primary/20",
              textClass: "text-primary",
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
