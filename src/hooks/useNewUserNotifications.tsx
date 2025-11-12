import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './useAuth';

export const useNewUserNotifications = () => {
  const { toast } = useToast();
  const { user, userRole } = useAuth();

  useEffect(() => {
    // Only subscribe if user is an admin
    if (userRole !== 'admin') return;

    // Subscribe to new user registrations via profiles table
    const channel = supabase
      .channel('new-user-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'profiles'
        },
        async (payload) => {
          console.log('New user registered:', payload);
          
          // Get user details
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, id')
            .eq('id', payload.new.id)
            .single();

          // Get email from auth
          const { data: authData } = await supabase.auth.admin.getUserById(payload.new.id);

          toast({
            title: '🎉 Novo usuário registrado!',
            description: `${profile?.full_name || 'Usuário'} (${authData?.user?.email || 'Email não disponível'}) acabou de se registrar no sistema.`,
            duration: 10000,
          });

          // Send admin alert via edge function
          try {
            await supabase.functions.invoke('send-notification', {
              body: {
                type: 'new_user_registration',
                title: 'Novo Usuário Registrado',
                message: `${profile?.full_name || 'Usuário'} (${authData?.user?.email}) se registrou no sistema`,
                severity: 'info',
                metadata: {
                  user_id: payload.new.id,
                  full_name: profile?.full_name,
                  email: authData?.user?.email,
                  created_at: payload.new.created_at
                }
              }
            });
          } catch (error) {
            console.error('Error sending admin notification:', error);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userRole, toast]);
};
