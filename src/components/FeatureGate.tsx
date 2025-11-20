import { ReactNode } from "react";
import { useFeatureGating } from "@/hooks/useFeatureGating";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface FeatureGateProps {
  featureKey: string;
  children: ReactNode;
  fallback?: ReactNode;
  showUpgrade?: boolean;
}

export const FeatureGate = ({ 
  featureKey, 
  children, 
  fallback,
  showUpgrade = true 
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
      return (
        <Alert className="border-primary/50">
          <Lock className="h-4 w-4" />
          <AlertTitle>Funcionalidade Exclusiva</AlertTitle>
          <AlertDescription className="space-y-2">
            <p>Esta funcionalidade está disponível apenas no Plano Platinum.</p>
            <Button 
              variant="default" 
              size="sm"
              onClick={() => navigate('/pricing')}
            >
              Fazer Upgrade
            </Button>
          </AlertDescription>
        </Alert>
      );
    }

    return null;
  }

  return <>{children}</>;
};
