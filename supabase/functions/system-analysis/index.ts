import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnalysisRequest {
  timeframe?: string; // 'last_hour' | 'last_24h' | 'last_week'
  modules?: string[]; // ['auth', 'appointments', 'payments', etc]
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify admin role
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check admin role
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (roleError || roleData?.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Forbidden - Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate input with Zod
    const requestSchema = z.object({
      timeframe: z.enum(['last_hour', 'last_24h', 'last_week']).optional(),
      modules: z.array(z.string()).optional()
    });

    const rawBody = await req.json();
    const validation = requestSchema.safeParse(rawBody);
    
    if (!validation.success) {
      console.error('Validation error:', validation.error);
      return new Response(
        JSON.stringify({ 
          error: validation.error.errors[0].message 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = validation.data;
    const timeframe = body.timeframe || 'last_24h';

    // Definir período de análise
    const timeRanges: Record<string, string> = {
      last_hour: "now() - interval '1 hour'",
      last_24h: "now() - interval '24 hours'",
      last_week: "now() - interval '7 days'",
    };

    const timeCondition = timeRanges[timeframe] || timeRanges.last_24h;

    // 1. Buscar logs do período
    const { data: logs, error: logsError } = await supabase
      .from('system_logs')
      .select('*')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })
      .limit(200);

    if (logsError) throw logsError;

    // 2. Buscar health checks
    const { data: health, error: healthError } = await supabase
      .from('system_health')
      .select('*')
      .order('last_check', { ascending: false });

    if (healthError) throw healthError;

    // 3. Buscar estatísticas gerais
    const { data: stats } = await supabase.rpc('get_system_stats');

    // 4. Buscar erros de autenticação (últimas 24h)
    const { count: failedLogins } = await supabase
      .from('system_logs')
      .select('*', { count: 'exact', head: true })
      .eq('module', 'authentication')
      .eq('log_type', 'error')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    // 5. Preparar contexto para análise da IA
    const context = {
      timeframe,
      stats,
      health_checks: health,
      error_logs: logs?.filter(l => l.log_type === 'error').slice(0, 20) || [],
      warning_logs: logs?.filter(l => l.log_type === 'warning').slice(0, 20) || [],
      failed_logins_count: failedLogins || 0,
      total_logs: logs?.length || 0,
    };

    // 6. Usar Lovable AI para análise
    const prompt = `Você é um especialista em análise de sistemas. Analise os seguintes dados de um sistema de pet shop e forneça um relatório detalhado.

DADOS DO SISTEMA:
${JSON.stringify(context, null, 2)}

Por favor, forneça:

1. **STATUS GERAL**: Classificação do sistema (🟢 Funcional | 🟡 Aviso | 🔴 Crítico)

2. **ANÁLISE POR MÓDULO**:
   - Autenticação/Login
   - Cadastro
   - Agendamentos
   - Pagamentos
   - Estoque
   - Segurança
   
   Para cada módulo, indique: Status (OK/Aviso/Crítico), problemas encontrados

3. **ALERTAS PRIORITÁRIOS**:
   - 🔴 Alta Prioridade
   - 🟡 Média Prioridade
   - 🟢 Baixa Prioridade

4. **SUGESTÕES DE CORREÇÃO**:
   Para cada problema, forneça:
   - Descrição do problema
   - Causa provável
   - Passo a passo para correção
   - Exemplo de código (se aplicável)

5. **MÉTRICAS DE SAÚDE**:
   - Tempo de resposta médio
   - Taxa de erros
   - Pontos de atenção

6. **RECOMENDAÇÕES GERAIS**:
   - Otimizações sugeridas
   - Melhorias de segurança
   - Próximos passos

Forneça a resposta em formato JSON estruturado.`;

    const { data: aiData, error: aiError } = await supabase.functions.invoke('lovable-ai', {
      body: {
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        model: 'google/gemini-2.5-flash',
      },
    });

    if (aiError) throw aiError;

    const aiResponse = aiData?.choices?.[0]?.message?.content || 'Análise não disponível';

    // 7. Registrar análise no log
    await supabase.from('system_logs').insert({
      module: 'system_analysis',
      log_type: 'info',
      message: 'Análise de sistema realizada com IA',
      details: {
        timeframe,
        analyzed_logs: logs?.length || 0,
        ai_response_preview: aiResponse.substring(0, 200),
      },
    });

    // 8. Tentar parsear resposta JSON da IA
    let analysisResult;
    try {
      // Extrair JSON da resposta (pode vir com markdown)
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0]);
      } else {
        analysisResult = { raw_analysis: aiResponse };
      }
    } catch {
      analysisResult = { raw_analysis: aiResponse };
    }

    return new Response(
      JSON.stringify({
        success: true,
        timestamp: new Date().toISOString(),
        timeframe,
        context: {
          total_logs: logs?.length || 0,
          error_count: context.error_logs.length,
          warning_count: context.warning_logs.length,
          failed_logins: failedLogins || 0,
        },
        analysis: analysisResult,
        raw_ai_response: aiResponse,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('System analysis error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: errorMessage,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});