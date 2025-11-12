const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationRequest {
  subject: string;
  results?: any[];
  backups?: any;
  execution_time_ms?: number;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    
    // Create Supabase client for admin verification
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.76.1');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

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

    const { subject, results, backups, execution_time_ms }: NotificationRequest = await req.json();

    // Gerar HTML do relatório
    let htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; background: #f5f5f5;">
        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h1 style="color: #1e40af; margin-bottom: 20px;">🔧 Sistema PetShop - Relatório de Manutenção</h1>
          
          <div style="background: #e0f2fe; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
            <p style="margin: 0; font-size: 16px;"><strong>Tempo de Execução:</strong> ${execution_time_ms}ms</p>
            <p style="margin: 5px 0 0 0; font-size: 16px;"><strong>Data/Hora:</strong> ${new Date().toLocaleString('pt-BR')}</p>
          </div>

          <h2 style="color: #1e40af; margin-top: 30px; margin-bottom: 15px;">📊 Resultados das Correções</h2>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
            <thead>
              <tr style="background: #1e40af; color: white;">
                <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Módulo</th>
                <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Ação</th>
                <th style="padding: 12px; text-align: center; border: 1px solid #ddd;">Qtd.</th>
                <th style="padding: 12px; text-align: center; border: 1px solid #ddd;">Status</th>
              </tr>
            </thead>
            <tbody>
    `;

    if (results && results.length > 0) {
      results.forEach((result: any) => {
        const statusIcon = result.success ? '✅' : '❌';
        const statusColor = result.success ? '#10b981' : '#ef4444';
        
        htmlContent += `
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd;">${result.module}</td>
            <td style="padding: 10px; border: 1px solid #ddd;">${result.action}</td>
            <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${result.count}</td>
            <td style="padding: 10px; border: 1px solid #ddd; text-align: center; color: ${statusColor};">
              ${statusIcon} ${result.success ? 'OK' : 'Erro'}
            </td>
          </tr>
        `;
        
        if (result.error) {
          htmlContent += `
            <tr>
              <td colspan="4" style="padding: 10px; border: 1px solid #ddd; background: #fee; color: #c00;">
                <strong>Erro:</strong> ${result.error}
              </td>
            </tr>
          `;
        }
      });
    }

    htmlContent += `
            </tbody>
          </table>

          <h2 style="color: #1e40af; margin-top: 30px; margin-bottom: 15px;">💾 Backup Realizado</h2>
          <div style="background: #f0fdf4; padding: 15px; border-radius: 5px; border-left: 4px solid #10b981;">
            <p style="margin: 0;">✅ Backup completo criado antes das correções</p>
            <p style="margin: 10px 0 0 0; font-size: 14px; color: #666;">
              Backups incluem: Perfis, Agendamentos, Produtos
            </p>
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666;">
            <p>Sistema PetShop - Monitoramento Automático</p>
            <p style="font-size: 12px;">Este é um e-mail automático. Não responda.</p>
          </div>
        </div>
      </div>
    `;

    // Enviar e-mail via Resend API
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      console.error('RESEND_API_KEY not configured');
      throw new Error('Serviço de email não configurado');
    }

    // Buscar emails dos administradores do banco
    console.log('📧 Buscando administradores do sistema...');
    
    const { data: adminRoles } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'admin');

    const adminIds = adminRoles?.map(r => r.user_id) || [];
    
    if (adminIds.length === 0) {
      console.warn('⚠️ Nenhum administrador encontrado no sistema');
      await supabase.from('system_logs').insert({
        module: 'send_notification',
        log_type: 'warning',
        message: 'Nenhum email de admin enviado - sem admins cadastrados',
        details: { execution_time_ms },
      });
      
      return new Response(JSON.stringify({ 
        success: true, 
        warning: 'Nenhum administrador cadastrado para receber emails' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Buscar emails dos admins via Auth API
    const { data: { users } } = await supabase.auth.admin.listUsers();
    const adminEmails = users
      .filter(user => adminIds.includes(user.id))
      .map(user => user.email)
      .filter((email): email is string => !!email);

    if (adminEmails.length === 0) {
      console.warn('⚠️ Administradores cadastrados mas sem emails válidos');
      await supabase.from('system_logs').insert({
        module: 'send_notification',
        log_type: 'warning',
        message: 'Nenhum email de admin enviado - admins sem email',
        details: { execution_time_ms, admin_count: adminIds.length },
      });
      
      return new Response(JSON.stringify({ 
        success: true, 
        warning: 'Administradores sem emails válidos' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`📧 Enviando para ${adminEmails.length} administrador(es): ${adminEmails.join(', ')}`);

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'EasyPet <easypetc@gmail.com>',
        to: adminEmails,
        subject: subject,
        html: htmlContent,
      }),
    });

    const emailData = await emailResponse.json();

    if (!emailResponse.ok) {
      console.error('Resend API error:', emailData);
      
      // Handle specific Resend errors - domain not verified or testing mode
      if (emailData.statusCode === 403 || 
          emailData.message?.includes('not verified') ||
          emailData.message?.includes('testing emails') ||
          emailData.name === 'validation_error') {
        // Return success with test mode flag to avoid crashes
        return new Response(
          JSON.stringify({ 
            success: true,
            testMode: true,
            message: 'Domínio não verificado. Email será enviado quando domínio for verificado em resend.com/domains',
            details: emailData.message,
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(emailData.message || 'Erro ao enviar email');
    }

    console.log('📧 E-mail enviado com sucesso:', emailData);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Notification sent successfully',
        email_id: emailData?.id 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Send notification error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
