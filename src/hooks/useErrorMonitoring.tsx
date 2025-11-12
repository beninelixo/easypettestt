import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ErrorContext {
  [key: string]: any;
}

export const useErrorMonitoring = () => {
  const { toast } = useToast();

  useEffect(() => {
    // Global error handler
    const handleError = async (event: ErrorEvent) => {
      await logError('global', event.message, {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
      });
    };

    // Unhandled promise rejection handler
    const handleUnhandledRejection = async (event: PromiseRejectionEvent) => {
      await logError('promise', event.reason?.toString() || 'Unhandled rejection', {
        reason: event.reason,
      });
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  const logError = async (
    module: string,
    message: string,
    context: ErrorContext = {},
    level: 'error' | 'critical' = 'error'
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      await supabase.from('structured_logs').insert({
        level,
        module,
        message,
        context,
        user_id: user?.id,
        ip_address: null,
        user_agent: navigator.userAgent,
      });

      // Show toast for critical errors
      if (level === 'critical') {
        toast({
          variant: 'destructive',
          title: 'Erro Crítico',
          description: 'Um erro grave foi detectado. Nossa equipe foi notificada.',
        });
      }
    } catch (err) {
      console.error('Failed to log error:', err);
    }
  };

  const logInfo = async (module: string, message: string, context: ErrorContext = {}) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      await supabase.from('structured_logs').insert({
        level: 'info',
        module,
        message,
        context,
        user_id: user?.id,
        user_agent: navigator.userAgent,
      });
    } catch (err) {
      console.error('Failed to log info:', err);
    }
  };

  return { logError, logInfo };
};
