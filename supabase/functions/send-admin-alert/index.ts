import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const alertSchema = z.object({
  alert_type: z.enum([
    'system_error', 'security_breach', 'performance_degradation',
    'edge_function_failure', 'database_issue', 'api_timeout',
    'high_error_rate', 'suspicious_activity', 'backup_failure'
  ]),
  severity: z.enum(['info', 'warning', 'critical', 'emergency']),
  title: z.string().min(1).max(200),
  message: z.string().min(1).max(1000),
  source_module: z.string().optional(),
  source_function: z.string().optional(),
  context: z.record(z.any()).optional(),
  metadata: z.record(z.any()).optional()
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const validation = alertSchema.safeParse(body);

    if (!validation.success) {
      console.error('Validation error:', validation.error);
      return new Response(
        JSON.stringify({ error: validation.error.issues[0].message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const alertData = validation.data;

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log(`🚨 Creating ${alertData.severity} alert: ${alertData.title}`);

    // Criar alerta no banco
    const { data: alert, error: insertError } = await supabase
      .from('admin_alerts')
      .insert({
        alert_type: alertData.alert_type,
        severity: alertData.severity,
        title: alertData.title,
        message: alertData.message,
        source_module: alertData.source_module,
        source_function: alertData.source_function,
        context: alertData.context || {},
        metadata: alertData.metadata || {}
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating alert:', insertError);
      throw insertError;
    }

    console.log(`✅ Alert created: ${alert.id}`);

    // Se for crítico ou emergência, enviar email para admins
    if (['critical', 'emergency'].includes(alertData.severity)) {
      console.log('📧 Sending email notification to admins...');
      
      // Buscar todos os admins (incluindo super_admin)
      const { data: adminUsers } = await supabase
        .from('user_roles')
        .select('user_id, profiles!inner(full_name)')
        .in('role', ['admin', 'super_admin']);

      const { data: adminAuth } = await supabase.auth.admin.listUsers();
      const adminEmails = adminAuth?.users
        ?.filter(u => adminUsers?.some(au => au.user_id === u.id))
        ?.map(u => u.email)
        ?.filter(Boolean) || [];

      // Enviar email via edge function de notificação
      if (adminEmails.length > 0) {
        for (const email of adminEmails) {
          try {
            await supabase.functions.invoke('send-alert-email', {
              body: {
                to: email,
                alert: alert
              }
            });
          } catch (emailError) {
            console.error(`Failed to send email to ${email}:`, emailError);
          }
        }
        console.log(`📬 Sent ${adminEmails.length} email notifications`);
      }

      // Trigger webhooks for critical/emergency alerts
      console.log('🔔 Triggering webhooks...');
      try {
        const { error: webhookError } = await supabase.functions.invoke('trigger-webhooks', {
          body: {
            alert: {
              title: alertData.title,
              message: alertData.message,
              severity: alertData.severity,
              alert_type: alertData.alert_type,
              context: alertData.context
            },
            event_type: `${alertData.severity}_alert`
          }
        });

        if (webhookError) {
          console.error('Warning: Failed to trigger webhooks:', webhookError);
          // Não falhar o envio do alerta se webhooks falharem
        } else {
          console.log('✅ Webhooks triggered');
        }
      } catch (webhookError) {
        console.error('Warning: Error triggering webhooks:', webhookError);
        // Continuar mesmo se webhooks falharem
      }
    }

    // Log para structured_logs
    await supabase.from('structured_logs').insert({
      level: alertData.severity === 'info' ? 'info' : 'warn',
      module: alertData.source_module || 'admin_alerts',
      message: `Admin alert created: ${alertData.title}`,
      context: {
        alert_id: alert.id,
        alert_type: alertData.alert_type,
        severity: alertData.severity
      }
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        alert_id: alert.id,
        message: 'Alert created successfully'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('❌ Error in send-admin-alert:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
