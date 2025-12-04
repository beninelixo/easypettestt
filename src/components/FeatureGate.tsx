import { ReactNode } from "react";
import { useFeatureGating } from "@/hooks/useFeatureGating";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Lock, Sparkles, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

type RequiredPlan = 'gold' | 'platinum';

interface FeatureGateProps {
  featureKey: string;
  children: ReactNode;
  fallback?: ReactNode;
  showUpgrade?: boolean;
  requiredPlan?: RequiredPlan;
}

const PLAN_CONFIG = {
  gold: {
    name: 'Pet Gold',
    icon: Sparkles,
    color: 'border-amber-500/50 bg-amber-500/5',
    iconColor: 'text-amber-500',
    buttonClass: 'bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-amber-950',
  },
  platinum: {
    name: 'Pet Platinum',
    icon: Crown,
    color: 'border-slate-400/50 bg-slate-400/5',
    iconColor: 'text-slate-500',
    buttonClass: 'bg-gradient-to-r from-slate-400 to-slate-500 hover:from-slate-500 hover:to-slate-600 text-white',
  },
};

export const FeatureGate = ({ 
  featureKey, 
  children, 
  fallback,
  showUpgrade = true,
  requiredPlan = 'platinum'
}: FeatureGateProps) => {
  const { hasFeature, loading } = useFeatureGating();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!hasFeature(featureKey)) {
    if (fallback) return <>{fallback}</>;

    if (showUpgrade) {
      const config = PLAN_CONFIG[requiredPlan];
      const PlanIcon = config.icon;

      return (
        <Alert className={`${config.color}`}>
          <PlanIcon className={`h-4 w-4 ${config.iconColor}`} />
          <AlertTitle className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Funcionalidade Exclusiva
          </AlertTitle>
          <AlertDescription className="space-y-3 mt-2">
            <p className="text-sm">
              Esta funcionalidade está disponível a partir do plano <strong>{config.name}</strong>.
              {requiredPlan === 'gold' && ' Faça upgrade para desbloquear recursos avançados.'}
              {requiredPlan === 'platinum' && ' O plano Platinum oferece todos os recursos premium do sistema.'}
            </p>
            <div className="flex gap-2">
              <Button 
                size="sm"
                className={config.buttonClass}
                onClick={() => navigate('/professional/plans')}
              >
                <PlanIcon className="h-4 w-4 mr-2" />
                Ver Plano {config.name}
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/funcionalidades')}
              >
                Ver funcionalidades
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      );
    }

    return null;
  }

  return <>{children}</>;
};
