import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useAdminPasswordReset() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const resetPassword = async (targetEmail: string, newPassword: string) => {
    setLoading(true);
    
    try {
      // Get current session for authorization
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("Você precisa estar logado como God User para usar esta função");
      }

      const { data, error } = await supabase.functions.invoke('admin-reset-password', {
        body: { targetEmail, newPassword }
      });

      if (error) throw error;

      toast({
        title: "✅ Senha redefinida!",
        description: `Senha de ${targetEmail} foi atualizada com sucesso`,
      });

      return { success: true, data };
    } catch (error: any) {
      console.error('[useAdminPasswordReset] Erro:', error);
      toast({
        title: "❌ Erro ao redefinir senha",
        description: error.message || "Erro desconhecido",
        variant: "destructive",
      });
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  return { resetPassword, loading };
}
