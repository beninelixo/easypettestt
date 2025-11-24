import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, LogOut } from "lucide-react";
import { useImpersonate } from "@/hooks/useImpersonate";

export const ImpersonationBanner = () => {
  const { isImpersonating, stopImpersonation } = useImpersonate();
  const [impersonatedEmail, setImpersonatedEmail] = useState<string>('');

  useEffect(() => {
    // Verificar se há sessão de impersonação
    const originalSession = localStorage.getItem('original_session');
    if (originalSession) {
      const original = JSON.parse(originalSession);
      // Pegar email do usuário atual (que é o impersonado)
      const getCurrentUser = async () => {
        const { data: { user } } = await (await import('@/integrations/supabase/client')).supabase.auth.getUser();
        if (user) {
          setImpersonatedEmail(user.email || '');
        }
      };
      getCurrentUser();
    }
  }, []);

  if (!isImpersonating) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] bg-destructive text-destructive-foreground p-3 shadow-lg border-b-4 border-destructive/50">
      <div className="container mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-5 w-5 animate-pulse" />
          <div>
            <p className="font-bold text-sm">🎭 MODO IMPERSONAÇÃO ATIVO</p>
            <p className="text-xs opacity-90">
              Você está visualizando como: <strong>{impersonatedEmail}</strong>
            </p>
          </div>
          <Badge variant="outline" className="bg-destructive-foreground/10 border-destructive-foreground/30">
            SUPORTE
          </Badge>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={stopImpersonation}
          className="bg-destructive-foreground text-destructive hover:bg-destructive-foreground/90 border-0"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Voltar à Minha Conta
        </Button>
      </div>
    </div>
  );
};