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
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('🔔 Worker de Notificações iniciado');

    // Buscar notificações pendentes
    const { data: pendingNotifications, error: fetchError } = await supabase
      .from('notifications_log')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_for', new Date().toISOString())
      .lt('attempt_count', 3)
      .order('scheduled_for', { ascending: true })
      .limit(10);

    if (fetchError) throw fetchError;

    console.log(`📊 ${pendingNotifications?.length || 0} notificações para processar`);

    const results = {
      processed: 0,
      sent: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (const notification of pendingNotifications || []) {
      try {
        // Marcar como processando
        await supabase
          .from('notifications_log')
          .update({ status: 'processing', attempt_count: notification.attempt_count + 1 })
          .eq('id', notification.id);

        // Simular envio (aqui você integraria com serviços reais)
        let success = false;

        switch (notification.channel) {
          case 'email':
            // Integração com serviço de email
            console.log(`📧 Enviando email para ${notification.recipient}`);
            success = await sendEmail(notification);
            break;
          case 'whatsapp':
            // Integração com WhatsApp API
            console.log(`💬 Enviando WhatsApp para ${notification.recipient}`);
            success = await sendWhatsApp(notification);
            break;
          case 'sms':
            console.log(`📱 Enviando SMS para ${notification.recipient}`);
            success = true; // Placeholder
            break;
          default:
            success = false;
        }

        if (success) {
          await supabase
            .from('notifications_log')
            .update({ 
              status: 'sent', 
              sent_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('id', notification.id);
          results.sent++;
        } else {
          throw new Error('Falha no envio');
        }

        results.processed++;
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Erro desconhecido';
        console.error(`❌ Erro ao processar ${notification.id}:`, errorMsg);

        const newStatus = notification.attempt_count + 1 >= notification.max_attempts ? 'failed' : 'retrying';
        
        await supabase
          .from('notifications_log')
          .update({ 
            status: newStatus,
            last_error: errorMsg,
            updated_at: new Date().toISOString()
          })
          .eq('id', notification.id);

        results.failed++;
        results.errors.push(`${notification.id}: ${errorMsg}`);
      }
    }

    // Registrar métricas
    await supabase.from('monitoramento_sistema').insert({
      service_name: 'worker-notifications',
      metric_type: 'queue_size',
      value: pendingNotifications?.length || 0,
      status: 'healthy',
      metadata: results,
    });

    await supabase.from('system_logs').insert({
      module: 'worker-notifications',
      log_type: 'success',
      message: `Worker executado com sucesso`,
      details: results,
    });

    return new Response(JSON.stringify({ success: true, ...results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('❌ Erro fatal no worker:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function sendEmail(notification: any): Promise<boolean> {
  // Placeholder - integrar com serviço real (Resend, SendGrid, etc)
  const apiKey = Deno.env.get('EMAIL_API_KEY');
  if (!apiKey) {
    console.warn('⚠️ EMAIL_API_KEY não configurada');
    return false;
  }
  
  // Simular sucesso para teste
  await new Promise(resolve => setTimeout(resolve, 100));
  return true;
}

async function sendWhatsApp(notification: any): Promise<boolean> {
  // Placeholder - integrar com WhatsApp Business API
  const apiKey = Deno.env.get('WHATSAPP_API_KEY');
  if (!apiKey) {
    console.warn('⚠️ WHATSAPP_API_KEY não configurada');
    return false;
  }
  
  // Simular sucesso para teste
  await new Promise(resolve => setTimeout(resolve, 100));
  return true;
}
