import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AlertEmailRequest {
  alert_id: string;
  alert_type: string;
  severity: string;
  description: string;
  metadata?: any;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { alert_id, alert_type, severity, description, metadata }: AlertEmailRequest = await req.json();

    // Buscar emails de admins
    const { data: admins, error: adminsError } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'admin');

    if (adminsError) throw adminsError;

    // TODO: Configurar RESEND_API_KEY e descomentar código de envio de email
    // Por enquanto, apenas registrar que o email deveria ser enviado
    
    // Log do alerta para email
    await supabase.from('system_logs').insert({
      module: 'security_email',
      log_type: 'info',
      message: `Alerta de segurança detectado - email deveria ser enviado para ${admins.length} admins`,
      details: { 
        alert_id, 
        alert_type,
        severity,
        description,
        recipients_count: admins.length,
        note: 'Configure RESEND_API_KEY para enviar emails reais'
      }
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Alerta registrado. Configure RESEND_API_KEY para enviar emails.',
        admins_to_notify: admins.length
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing security alert:', error);
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
