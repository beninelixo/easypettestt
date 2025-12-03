import { supabase } from '@/integrations/supabase/client';

export const EXPECTED_PROJECT_ID = 'zxdbsimthnfprrthszoh';
export const EXPECTED_URL = 'https://zxdbsimthnfprrthszoh.supabase.co';

interface DiagnosticResult {
  test: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: string;
}

interface ConfigReport {
  currentProjectId: string;
  expectedProjectId: string;
  currentUrl: string;
  expectedUrl: string;
  isCorrect: boolean;
  anonKeyProjectId: string;
}

export const extractProjectIdFromJwt = (jwt: string): string | null => {
  try {
    const payload = JSON.parse(atob(jwt.split('.')[1]));
    return payload.ref || null;
  } catch {
    return null;
  }
};

export const getConfigReport = (): ConfigReport => {
  const currentProjectId = import.meta.env.VITE_SUPABASE_PROJECT_ID || 'unknown';
  const currentUrl = import.meta.env.VITE_SUPABASE_URL || 'unknown';
  const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';
  const anonKeyProjectId = extractProjectIdFromJwt(anonKey) || 'unknown';

  return {
    currentProjectId,
    expectedProjectId: EXPECTED_PROJECT_ID,
    currentUrl,
    expectedUrl: EXPECTED_URL,
    isCorrect: anonKeyProjectId === EXPECTED_PROJECT_ID,
    anonKeyProjectId,
  };
};

export const runDiagnostics = async (): Promise<DiagnosticResult[]> => {
  const results: DiagnosticResult[] = [];
  const config = getConfigReport();

  // Test 1: Check project ID match
  results.push({
    test: 'Project ID Validation',
    status: config.isCorrect ? 'success' : 'error',
    message: config.isCorrect 
      ? `Project ID correto: ${config.anonKeyProjectId}`
      : `Project ID incorreto! Esperado: ${config.expectedProjectId}, Atual: ${config.anonKeyProjectId}`,
    details: `JWT ref: ${config.anonKeyProjectId}, ENV: ${config.currentProjectId}`,
  });

  // Test 2: Database connection
  try {
    const { error } = await supabase.from('profiles').select('id').limit(1);
    results.push({
      test: 'Database Connection',
      status: error ? 'error' : 'success',
      message: error ? `Erro: ${error.message}` : 'Conexão com database OK',
      details: error?.code,
    });
  } catch (err) {
    results.push({
      test: 'Database Connection',
      status: 'error',
      message: `Exceção: ${err instanceof Error ? err.message : 'Unknown'}`,
    });
  }

  // Test 3: Auth system
  try {
    const { data, error } = await supabase.auth.getSession();
    results.push({
      test: 'Auth System',
      status: error ? 'error' : 'success',
      message: error ? `Erro: ${error.message}` : (data.session ? 'Sessão ativa' : 'Auth OK (sem sessão)'),
    });
  } catch (err) {
    results.push({
      test: 'Auth System',
      status: 'error',
      message: `Exceção: ${err instanceof Error ? err.message : 'Unknown'}`,
    });
  }

  // Test 4: Realtime
  try {
    const channel = supabase.channel('diagnostic-test');
    const realtimeOk = await new Promise<boolean>((resolve) => {
      const timeout = setTimeout(() => {
        channel.unsubscribe();
        resolve(false);
      }, 5000);

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

    results.push({
      test: 'Realtime WebSocket',
      status: realtimeOk ? 'success' : 'error',
      message: realtimeOk ? 'WebSocket conectado' : 'Falha na conexão WebSocket',
    });
  } catch (err) {
    results.push({
      test: 'Realtime WebSocket',
      status: 'error',
      message: `Exceção: ${err instanceof Error ? err.message : 'Unknown'}`,
    });
  }

  // Test 5: Insert/Read test (only if connected)
  if (config.isCorrect) {
    try {
      // Try to read from a public table
      const { data, error } = await supabase
        .from('global_metrics')
        .select('metric_name')
        .limit(1);

      results.push({
        test: 'Read Test',
        status: error ? 'warning' : 'success',
        message: error ? `Leitura falhou: ${error.message}` : `Leitura OK (${data?.length || 0} registros)`,
      });
    } catch (err) {
      results.push({
        test: 'Read Test',
        status: 'error',
        message: `Exceção: ${err instanceof Error ? err.message : 'Unknown'}`,
      });
    }
  }

  return results;
};

export const logDiagnosticError = (context: string, error: unknown) => {
  const timestamp = new Date().toISOString();
  const errorMessage = error instanceof Error ? error.message : String(error);
  console.error(`[${timestamp}] [SUPABASE DIAGNOSTIC] [${context}]:`, errorMessage);
};
