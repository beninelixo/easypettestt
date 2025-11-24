import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const IMPERSONATION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

export const useImpersonate = () => {
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [impersonatedUser, setImpersonatedUser] = useState<{
    id: string;
    email: string;
    full_name?: string;
  } | null>(null);
  const { toast } = useToast();

  // Check if impersonation is active on mount
  useEffect(() => {
    const checkImpersonationStatus = () => {
      const originalSessionData = localStorage.getItem('original_session');
      const isImpersonatingFlag = localStorage.getItem('is_impersonating');
      
      if (originalSessionData && isImpersonatingFlag === 'true') {
        try {
          const original = JSON.parse(originalSessionData);
          
          // Check if session is expired
          if (original.stored_at && (Date.now() - original.stored_at > IMPERSONATION_TIMEOUT)) {
            console.warn('⏰ Impersonation session expired');
            localStorage.removeItem('original_session');
            localStorage.removeItem('is_impersonating');
            toast({
              title: "⏰ Sessão Expirada",
              description: "Sua sessão de impersonação expirou. Faça login novamente.",
              variant: "destructive",
            });
            supabase.auth.signOut();
            window.location.href = '/auth';
            return;
          }
          
          setIsImpersonating(true);
        } catch (error) {
          console.error('Error parsing impersonation session:', error);
          localStorage.removeItem('original_session');
          localStorage.removeItem('is_impersonating');
        }
      }
    };

    checkImpersonationStatus();
  }, []);

  const startImpersonation = async (targetUserId: string, reason: string = "Suporte técnico") => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "❌ Erro de Autenticação",
          description: "Você precisa estar autenticado para impersonar usuários",
          variant: "destructive",
        });
        return { success: false };
      }

      // Validate reason
      if (!reason || reason.trim().length < 5) {
        toast({
          title: "⚠️ Motivo Obrigatório",
          description: "Por favor, informe um motivo com pelo menos 5 caracteres",
          variant: "destructive",
        });
        return { success: false };
      }

      // Call edge function to start impersonation
      const { data, error } = await supabase.functions.invoke('impersonate-user', {
        body: { targetUserId, reason: reason.trim() }
      });

      if (error) {
        throw new Error(error.message || 'Erro ao iniciar impersonação');
      }

      // Check for errors in the response
      if (data && typeof data === 'object' && 'error' in data) {
        throw new Error((data as any).error || 'Erro ao iniciar impersonação');
      }

      if (!data || !data.magic_link) {
        throw new Error('Resposta inválida do servidor');
      }

      // Extrair tokens do magic link
      const url = new URL(data.magic_link);
      const access_token = url.searchParams.get('access_token');
      const refresh_token = url.searchParams.get('refresh_token');

      if (!access_token || !refresh_token) {
        throw new Error('Tokens inválidos recebidos do servidor');
      }

      // Store original session with timestamp
      localStorage.setItem('original_session', JSON.stringify({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        user: session.user,
        stored_at: Date.now()
      }));
      localStorage.setItem('is_impersonating', 'true');

      // Set the new session
      const { error: sessionError } = await supabase.auth.setSession({
        access_token,
        refresh_token
      });

      if (sessionError) {
        throw new Error('Erro ao iniciar sessão de impersonação');
      }

      setIsImpersonating(true);
      setImpersonatedUser({
        id: data.target_user.id,
        email: data.target_user.email,
        full_name: data.target_user.full_name
      });

      toast({
        title: "🎭 Impersonação Iniciada",
        description: `Você agora está visualizando como ${data.target_user.email}`,
      });

      // Redirect based on target user's role
      const targetRole = data.target_user.role || 'client';
      setTimeout(() => {
        if (targetRole === 'admin' || targetRole === 'super_admin') {
          window.location.href = '/admin/dashboard';
        } else if (targetRole === 'pet_shop') {
          window.location.href = '/professional/dashboard';
        } else {
          window.location.href = '/client/pets';
        }
      }, 1000);

      return { success: true };
    } catch (error: any) {
      console.error('❌ Impersonation error:', error);
      
      // Parse error message for better UX
      let errorMessage = error.message || 'Erro desconhecido ao iniciar impersonação';
      
      if (errorMessage.includes('same user') || errorMessage.includes('yourself')) {
        errorMessage = 'Você não pode impersonar a si mesmo';
      } else if (errorMessage.includes('god user')) {
        errorMessage = 'Não é possível impersonar o usuário god';
      } else if (errorMessage.includes('Permission denied') || errorMessage.includes('Acesso negado')) {
        errorMessage = 'Você não tem permissão para impersonar usuários';
      } else if (errorMessage.includes('not found') || errorMessage.includes('não encontrado')) {
        errorMessage = 'Usuário não encontrado';
      }
      
      toast({
        title: "❌ Erro na Impersonação",
        description: errorMessage,
        variant: "destructive",
      });
      
      return { success: false };
    }
  };

  const stopImpersonation = async () => {
    try {
      const originalSessionStr = localStorage.getItem('original_session');
      if (!originalSessionStr) {
        toast({
          title: "⚠️ Erro",
          description: "Sessão original não encontrada. Redirecionando para login...",
          variant: "destructive",
        });
        localStorage.removeItem('is_impersonating');
        await supabase.auth.signOut();
        window.location.href = '/auth';
        return;
      }

      const originalSession = JSON.parse(originalSessionStr);
      
      // Check if session is expired
      if (originalSession.stored_at && (Date.now() - originalSession.stored_at > IMPERSONATION_TIMEOUT)) {
        toast({
          title: "⏰ Sessão Expirada",
          description: "Sua sessão de impersonação expirou. Faça login novamente.",
          variant: "destructive",
        });
        localStorage.removeItem('original_session');
        localStorage.removeItem('is_impersonating');
        await supabase.auth.signOut();
        window.location.href = '/auth';
        return;
      }

      // Restore original session
      const { error } = await supabase.auth.setSession({
        access_token: originalSession.access_token,
        refresh_token: originalSession.refresh_token
      });

      if (error) {
        throw new Error('Erro ao restaurar sessão original');
      }

      // Clean up
      localStorage.removeItem('original_session');
      localStorage.removeItem('is_impersonating');
      setIsImpersonating(false);
      setImpersonatedUser(null);

      toast({
        title: "✅ Impersonação Encerrada",
        description: "Você voltou à sua conta de admin",
      });

      // Redirect to admin dashboard
      setTimeout(() => {
        window.location.href = '/admin/dashboard';
      }, 500);
    } catch (error: any) {
      console.error('❌ Error stopping impersonation:', error);
      
      let errorMessage = error.message || 'Erro ao encerrar impersonação';
      
      toast({
        title: "❌ Erro ao Encerrar Impersonação",
        description: errorMessage,
        variant: "destructive",
      });
      
      // Force logout on error
      localStorage.removeItem('original_session');
      localStorage.removeItem('is_impersonating');
      await supabase.auth.signOut();
      window.location.href = '/auth';
    }
  };

  return {
    isImpersonating,
    impersonatedUser,
    startImpersonation,
    stopImpersonation: stopImpersonation
  };
};
