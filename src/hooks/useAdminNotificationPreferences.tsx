import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface NotificationPreferences {
  id?: string;
  admin_id: string;
  email_enabled: boolean;
  push_enabled: boolean;
  whatsapp_enabled: boolean;
  security_alerts: boolean;
  system_health_alerts: boolean;
  backup_alerts: boolean;
  payment_alerts: boolean;
  user_activity_alerts: boolean;
  performance_alerts: boolean;
  whatsapp_number?: string | null;
}

export const useAdminNotificationPreferences = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch current preferences
  const { data: preferences, isLoading } = useQuery({
    queryKey: ['admin-notification-preferences'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('admin_notification_preferences')
        .select('*')
        .eq('admin_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      // Return default preferences if none exist
      return data || {
        admin_id: user.id,
        email_enabled: true,
        push_enabled: true,
        whatsapp_enabled: false,
        security_alerts: true,
        system_health_alerts: true,
        backup_alerts: true,
        payment_alerts: true,
        user_activity_alerts: false,
        performance_alerts: true,
        whatsapp_number: null,
      };
    },
  });

  // Update preferences
  const updatePreferences = useMutation({
    mutationFn: async (newPreferences: Partial<NotificationPreferences>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('admin_notification_preferences')
        .upsert({
          admin_id: user.id,
          ...newPreferences,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notification-preferences'] });
      toast({
        title: 'Preferências Atualizadas',
        description: 'Suas preferências de notificação foram salvas com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao Salvar',
        description: error.message || 'Não foi possível salvar as preferências.',
        variant: 'destructive',
      });
    },
  });

  return {
    preferences,
    isLoading,
    updatePreferences: updatePreferences.mutate,
    isUpdating: updatePreferences.isPending,
  };
};
