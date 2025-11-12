import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from 'https://esm.sh/resend@2.0.0';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AlertEmailRequest {
  severity: 'critical' | 'warning' | 'info';
  module: string;
  subject: string;
  message: string;
  details?: any;
}

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check admin role
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!roleData || roleData.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Forbidden - Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate input with Zod
    const requestSchema = z.object({
      severity: z.enum(['critical', 'warning', 'info']),
      module: z.string().min(1).max(100),
      subject: z.string().min(1).max(200),
      message: z.string().min(1).max(1000),
      details: z.any().optional()
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

    const { severity, module, subject, message, details } = validation.data;

    // Buscar emails dos admins
    const { data: admins, error: adminsError } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'admin');

    if (adminsError) throw adminsError;

    if (!admins || admins.length === 0) {
      console.log('Nenhum admin encontrado para enviar alertas');
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Nenhum admin cadastrado' 
        }), 
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Buscar emails dos admins
    const { data: adminProfiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id')
      .in('id', admins.map(a => a.user_id));

    if (profilesError) throw profilesError;

    // Buscar auth.users para pegar emails
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError) throw usersError;

    const adminEmails = users
      .filter(user => admins.some(admin => admin.user_id === user.id))
      .map(user => user.email)
      .filter((email): email is string => !!email);

    if (adminEmails.length === 0) {
      console.log('Nenhum email de admin encontrado');
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Nenhum email de admin válido' 
        }), 
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Definir cores e ícones baseado na severidade
    const severityConfig = {
      critical: {
        color: '#dc2626',
        icon: '🚨',
        label: 'CRÍTICO'
      },
      warning: {
        color: '#f59e0b',
        icon: '⚠️',
        label: 'AVISO'
      },
      info: {
        color: '#3b82f6',
        icon: 'ℹ️',
        label: 'INFORMAÇÃO'
      }
    };

    const config = severityConfig[severity];

    // Montar HTML do email
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Alerta do Sistema</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: ${config.color}; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">
              ${config.icon} ${config.label}
            </h1>
          </div>
          
          <div style="background-color: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; border-top: none;">
            <h2 style="margin-top: 0; color: #111827;">${subject}</h2>
            
            <div style="background-color: white; padding: 15px; border-radius: 6px; margin: 15px 0;">
              <p style="margin: 0;"><strong>Módulo:</strong> ${module}</p>
              <p style="margin: 10px 0 0;"><strong>Data/Hora:</strong> ${new Date().toLocaleString('pt-BR')}</p>
            </div>
            
            <div style="background-color: white; padding: 15px; border-radius: 6px; margin: 15px 0;">
              <h3 style="margin-top: 0; color: #374151;">Mensagem</h3>
              <p style="margin: 0;">${message}</p>
            </div>
            
            ${details ? `
              <div style="background-color: white; padding: 15px; border-radius: 6px; margin: 15px 0;">
                <h3 style="margin-top: 0; color: #374151;">Detalhes</h3>
                <pre style="background-color: #f3f4f6; padding: 10px; border-radius: 4px; overflow-x: auto; font-size: 12px;">${JSON.stringify(details, null, 2)}</pre>
              </div>
            ` : ''}
            
            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; font-size: 14px; color: #6b7280;">
                <strong>Próximos passos:</strong>
              </p>
              <ul style="margin: 10px 0; padding-left: 20px; color: #6b7280; font-size: 14px;">
                ${severity === 'critical' ? `
                  <li>Verifique o sistema imediatamente</li>
                  <li>Acesse o painel de administração</li>
                  <li>Revise os logs do sistema</li>
                ` : severity === 'warning' ? `
                  <li>Revise a situação nas próximas 24h</li>
                  <li>Considere agendamento de manutenção</li>
                ` : `
                  <li>Anote para revisão posterior</li>
                `}
              </ul>
            </div>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 12px;">
            <p style="margin: 0;">
              Este é um email automático do sistema EasyPet.
            </p>
            <p style="margin: 5px 0 0;">
              Por favor, não responda a este email.
            </p>
          </div>
        </body>
      </html>
    `;

    // Enviar email para todos os admins
    const emailResults = await Promise.allSettled(
      adminEmails.map(email => 
        resend.emails.send({
          from: 'EasyPet <easypetc@gmail.com>',
          to: [email],
          subject: `[${config.label}] ${subject}`,
          html: htmlContent,
        })
      )
    );

    const successCount = emailResults.filter(r => r.status === 'fulfilled').length;
    const failCount = emailResults.filter(r => r.status === 'rejected').length;

    // Registrar envio no log
    await supabase.from('system_logs').insert({
      module: 'send_alert_email',
      log_type: failCount > 0 ? 'warning' : 'info',
      message: `Alerta enviado: ${successCount} sucesso, ${failCount} falhas`,
      details: {
        severity,
        subject,
        admin_count: adminEmails.length,
        success_count: successCount,
        fail_count: failCount
      }
    });

    console.log(`Email alert sent: ${subject} to ${successCount} admin(s)`);

    return new Response(
      JSON.stringify({ 
        success: true,
        emails_sent: successCount,
        emails_failed: failCount
      }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error sending alert email:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : String(error)
      }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
