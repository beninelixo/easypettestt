import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Iniciando atualização de métricas globais...');

    // Executar a função SQL que atualiza todas as métricas
    const { error } = await supabase.rpc('update_global_metrics');

    if (error) {
      console.error('Erro ao atualizar métricas:', error);
      throw error;
    }

    console.log('Métricas globais atualizadas com sucesso');

    // Buscar as métricas atualizadas para retornar
    const { data: metrics, error: metricsError } = await supabase
      .from('global_metrics')
      .select('*');

    if (metricsError) {
      console.error('Erro ao buscar métricas:', metricsError);
      throw metricsError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Métricas atualizadas com sucesso',
        metrics,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Erro na função update-global-metrics:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
