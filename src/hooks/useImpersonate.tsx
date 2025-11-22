import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useImpersonate = () => {
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [impersonatedUser, setImpersonatedUser] = useState<{
    id: string;
    email: string;
    full_name?: string;
  } | null>(null);
  const [originalSession, setOriginalSession] = useState<any>(null);
  const { toast } = useToast();

  const startImpersonation = async (userId: string, reason?: string) => {
    try {
      // Salvar sessão original
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      localStorage.setItem('original_session', JSON.stringify({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        user: session.user
      }));
      setOriginalSession(session);

      // Chamar edge function para criar impersonação
      const { data, error } = await supabase.functions.invoke('impersonate-user', {
        body: { targetUserId: userId, reason: reason || 'Suporte técnico' }
      });

      if (error) throw error;

      if (!data || !data.magic_link) {
        throw new Error('Failed to generate impersonation session');
      }

      // Extrair token do magic link
      const url = new URL(data.magic_link);
      const access_token = url.searchParams.get('access_token');
      const refresh_token = url.searchParams.get('refresh_token');

      if (!access_token || !refresh_token) {
        throw new Error('Invalid magic link tokens');
      }

      // Fazer login com o token do usuário alvo
      const { error: setSessionError } = await supabase.auth.setSession({
        access_token,
        refresh_token
      });

      if (setSessionError) throw setSessionError;

      setIsImpersonating(true);
      setImpersonatedUser({
        id: data.target_user.id,
        email: data.target_user.email,
        full_name: data.target_user.full_name
      });

      toast({
        title: "🎭 Impersonação Iniciada",
        description: `Você está agora como ${data.target_user.email}`,
        variant: "default",
      });

      // Forçar reload para atualizar todo o estado da aplicação
      window.location.reload();

      return { success: true };
    } catch (error: any) {
      console.error('Error starting impersonation:', error);
      toast({
        title: "Erro ao Impersonar",
        description: error.message,
        variant: "destructive",
      });
      return { success: false, error };
    }
  };

  const endImpersonation = async () => {
    try {
      const originalSessionData = localStorage.getItem('original_session');
      if (!originalSessionData) {
        throw new Error('No original session found');
      }

      const original = JSON.parse(originalSessionData);

      // Restaurar sessão original
      const { error: setSessionError } = await supabase.auth.setSession({
        access_token: original.access_token,
        refresh_token: original.refresh_token
      });

      if (setSessionError) throw setSessionError;

      // Limpar estado
      localStorage.removeItem('original_session');
      setIsImpersonating(false);
      setImpersonatedUser(null);
      setOriginalSession(null);

      toast({
        title: "✅ Impersonação Encerrada",
        description: "Você voltou à sua conta original",
      });

      // Forçar reload para atualizar todo o estado da aplicação
      window.location.href = '/admin/superadmin';

      return { success: true };
    } catch (error: any) {
      console.error('Error ending impersonation:', error);
      toast({
        title: "Erro ao Encerrar Impersonação",
        description: error.message,
        variant: "destructive",
      });
      return { success: false, error };
    }
  };

  // Verificar se há impersonação ativa ao carregar
  useState(() => {
    const originalSessionData = localStorage.getItem('original_session');
    if (originalSessionData) {
      setIsImpersonating(true);
      const original = JSON.parse(originalSessionData);
      setOriginalSession(original);
    }
  });

  return {
    isImpersonating,
    impersonatedUser,
    startImpersonation,
    endImpersonation
  };
};