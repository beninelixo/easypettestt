import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';
import { Resend } from 'https://esm.sh/resend@4.0.0';

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
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const resend = resendApiKey ? new Resend(resendApiKey) : null;

    const { alert_id, alert_type, severity, description, metadata }: AlertEmailRequest = await req.json();

    // Buscar emails de admins
    const { data: adminRoles, error: adminsError } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'admin');

    if (adminsError) throw adminsError;

    // Buscar profiles dos admins para obter emails
    const adminIds = adminRoles.map(role => role.user_id);
    const { data: users } = await supabase.auth.admin.listUsers();
    const adminEmails = users?.users
      .filter(user => adminIds.includes(user.id))
      .map(user => user.email)
      .filter(Boolean) as string[];

    if (!adminEmails.length) {
      throw new Error('Nenhum email de admin encontrado');
    }

    // Enviar email se RESEND_API_KEY estiver configurado
    if (resend && severity === 'critical') {
      const emailPromises = adminEmails.map(email => 
        resend.emails.send({
          from: 'EasyPet Security <onboarding@resend.dev>',
          to: email,
          subject: `🚨 Alerta Crítico de Segurança - ${alert_type}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #dc2626; border-bottom: 3px solid #dc2626; padding-bottom: 10px;">
                🚨 Alerta Crítico de Segurança
              </h1>
              
              <div style="background: #fee2e2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0;">
                <h2 style="margin-top: 0; color: #991b1b;">Tipo: ${alert_type}</h2>
                <p style="font-size: 16px; color: #7f1d1d;">${description}</p>
              </div>
              
              <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0;">Detalhes:</h3>
                <pre style="background: white; padding: 10px; border-radius: 4px; overflow-x: auto;">${JSON.stringify(metadata, null, 2)}</pre>
              </div>
              
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                <p style="color: #6b7280; font-size: 14px;">
                  Este é um alerta automático do sistema de segurança.
                  <br>
                  ID do Alerta: ${alert_id}
                  <br>
                  Data: ${new Date().toLocaleString('pt-BR')}
                </p>
              </div>
            </div>
          `,
        })
      );

      await Promise.all(emailPromises);
      
      await supabase.from('system_logs').insert({
        module: 'security_email',
        log_type: 'success',
        message: `Emails de alerta crítico enviados para ${adminEmails.length} admins`,
        details: { 
          alert_id, 
          alert_type,
          severity,
          recipients: adminEmails.length
        }
      });

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Emails enviados para ${adminEmails.length} admins`,
          recipients: adminEmails.length
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      // Log se não for crítico ou se RESEND_API_KEY não estiver configurado
      await supabase.from('system_logs').insert({
        module: 'security_email',
        log_type: 'info',
        message: resend 
          ? `Alerta ${severity} não enviado (apenas críticos são enviados por email)`
          : `RESEND_API_KEY não configurado - email não enviado`,
        details: { 
          alert_id, 
          alert_type,
          severity,
          description,
          recipients_count: adminEmails.length
        }
      });

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: resend 
            ? 'Alerta registrado (apenas alertas críticos são enviados por email)'
            : 'Configure RESEND_API_KEY para enviar emails',
          admins_to_notify: adminEmails.length
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('Error processing security alert:', error);
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
