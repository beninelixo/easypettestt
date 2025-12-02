import { Navigate, useLocation } from "react-router-dom";
import { useSettingsProtection } from "@/hooks/useSettingsProtection";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useRef } from "react";

interface SettingsProtectedRouteProps {
  children: React.ReactNode;
}

export const SettingsProtectedRoute = ({ children }: SettingsProtectedRouteProps) => {
  const { isUnlocked } = useSettingsProtection();
  const location = useLocation();
  const { toast } = useToast();
  const hasShownToast = useRef(false);

  useEffect(() => {
    if (!isUnlocked && !hasShownToast.current) {
      hasShownToast.current = true;
      toast({
        title: "🔒 Acesso Protegido",
        description: "Digite a senha de configurações para acessar esta área.",
        variant: "destructive",
      });
    }
  }, [isUnlocked, toast]);

  if (!isUnlocked) {
    // Redirect to settings page to enter password
    return <Navigate to="/professional/settings" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
};
