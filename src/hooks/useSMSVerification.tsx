import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useSMSVerification() {
  const [loading, setLoading] = useState(false);
  const [codeSent, setCodeSent] = useState(false);

  const sendVerificationCode = async (phoneNumber: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-sms-verification', {
        body: { phoneNumber }
      });

      if (error) throw error;

      if (data?.success) {
        setCodeSent(true);
        toast.success('Código de verificação enviado por SMS');
        return true;
      }

      throw new Error('Failed to send verification code');
    } catch (error) {
      console.error('Error sending SMS:', error);
      toast.error('Erro ao enviar código de verificação');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async (code: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('verify-sms-code', {
        body: { code }
      });

      if (error) throw error;

      if (data?.verified) {
        toast.success('Telefone verificado com sucesso!');
        return true;
      }

      throw new Error('Invalid verification code');
    } catch (error) {
      console.error('Error verifying code:', error);
      toast.error('Código inválido ou expirado');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    codeSent,
    sendVerificationCode,
    verifyCode,
    setCodeSent
  };
}
