import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

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
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Validate input with Zod
    const requestSchema = z.object({
      notificationId: z.string().uuid('Invalid notification ID format')
    });

    const rawBody = await req.json();
    const validation = requestSchema.safeParse(rawBody);
    
    if (!validation.success) {
      console.error('Validation error:', validation.error);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: validation.error.errors[0].message 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { notificationId } = validation.data;

    console.log(`🔄 Reprocessando notificação ${notificationId}`);

    // Resetar status e attempt_count
    const { data, error } = await supabase
      .from('notifications_log')
      .update({
        status: 'pending',
        attempt_count: 0,
        last_error: null,
        scheduled_for: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', notificationId)
      .select()
      .single();

    if (error) throw error;

    await supabase.from('system_logs').insert({
      module: 'requeue-notification',
      log_type: 'info',
      message: `Notificação ${notificationId} reprocessada`,
      details: { notificationId, data },
    });

    return new Response(
      JSON.stringify({ success: true, message: 'Notificação reenfileirada', data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Erro ao reprocessar:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
