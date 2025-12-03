import { supabase } from '@/integrations/supabase/client';

interface SyncTestResults {
  connection: boolean;
  auth: boolean;
  realtime: boolean;
}

interface SyncStatus {
  synced: boolean;
  tests: SyncTestResults;
  projectId: string;
  timestamp: string;
}

export const checkSync = async (): Promise<SyncStatus> => {
  const tests: SyncTestResults = {
    connection: false,
    auth: false,
    realtime: false,
  };

  // Test database connection
  try {
    const { error } = await supabase.from('profiles').select('id').limit(1);
    tests.connection = !error;
  } catch {
    tests.connection = false;
  }

  // Test auth system
  try {
    const { data, error } = await supabase.auth.getSession();
    tests.auth = !error && data !== null;
  } catch {
    tests.auth = false;
  }

  // Test realtime
  try {
    const channel = supabase.channel('sync-test-channel');
    tests.realtime = await new Promise<boolean>((resolve) => {
      const timeout = setTimeout(() => {
        channel.unsubscribe();
        resolve(false);
      }, 3000);

      channel.subscribe((status) => {
        clearTimeout(timeout);
        if (status === 'SUBSCRIBED') {
          channel.unsubscribe();
          resolve(true);
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          channel.unsubscribe();
          resolve(false);
        }
      });
    });
  } catch {
    tests.realtime = false;
  }

  const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID || 'unknown';

  return {
    synced: Object.values(tests).every((v) => v),
    tests,
    projectId,
    timestamp: new Date().toISOString(),
  };
};
