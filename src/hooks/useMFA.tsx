import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MFASetupResponse {
  success: boolean;
  secret?: string;
  qr_code_url?: string;
  backup_codes?: string[];
  error?: string;
}

interface MFAVerifyResponse {
  valid: boolean;
  mfa_enabled?: boolean;
  error?: string;
}

export function useMFA() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const setupMFA = async (): Promise<MFASetupResponse> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('setup-mfa');
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('MFA setup error:', error);
      toast({
        title: "Erro ao configurar MFA",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
      return { success: false, error: error instanceof Error ? error.message : "Erro desconhecido" };
    } finally {
      setLoading(false);
    }
  };

  const verifyToken = async (token: string, enableMFA: boolean = false): Promise<MFAVerifyResponse> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('verify-mfa-token', {
        body: { token, enable_mfa: enableMFA }
      });
      
      if (error) throw error;
      
      if (data.valid && enableMFA) {
        toast({
          title: "✅ MFA Ativado",
          description: "Autenticação de dois fatores ativada com sucesso!",
        });
      }
      
      return data;
    } catch (error) {
      console.error('MFA verify error:', error);
      toast({
        title: "Erro ao verificar token",
        description: error instanceof Error ? error.message : "Token inválido",
        variant: "destructive",
      });
      return { valid: false, error: error instanceof Error ? error.message : "Token inválido" };
    } finally {
      setLoading(false);
    }
  };

  const checkMFAStatus = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session?.user?.id) return false;

      const { data, error } = await supabase
        .from('mfa_secrets')
        .select('enabled')
        .eq('user_id', session.session.user.id)
        .maybeSingle();
      
      if (error) {
        console.error('Check MFA status error:', error);
        return false;
      }
      
      return data?.enabled || false;
    } catch (error) {
      console.error('Check MFA status error:', error);
      return false;
    }
  };

  return {
    loading,
    setupMFA,
    verifyToken,
    checkMFAStatus,
  };
}
