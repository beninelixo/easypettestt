import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AuthEvent {
  id: string;
  user_id: string | null;
  event_type: string;
  event_status: string;
  role_source: string | null;
  user_role: string | null;
  ip_address: string | null;
  user_agent: string | null;
  error_message: string | null;
  metadata: any; // Use any for Json type from Supabase
  created_at: string;
}

export const useAuthMonitor = () => {
  const [events, setEvents] = useState<AuthEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
    const { data, error } = await supabase
      .from('auth_events_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (!error && data) {
      setEvents(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEvents();

    // Realtime subscription
    const channel = supabase
      .channel('auth_events_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'auth_events_log',
        },
        (payload) => {
          setEvents((prev) => [payload.new as AuthEvent, ...prev].slice(0, 100));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { events, loading, refresh: fetchEvents };
};
