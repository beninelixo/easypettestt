import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const alertSchema = z.object({
  alert_type: z.string().min(1),
  severity: z.enum(['info', 'warning', 'critical', 'emergency']),
  title: z.string().min(1).max(200),
  message: z.string().min(1).max(2000),
  context: z.record(z.any()).optional(),
});

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const validation = alertSchema.safeParse(body);

    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: 'Invalid request', details: validation.error.issues }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const alertData = validation.data;

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`🚨 Sending ${alertData.severity} alert: ${alertData.title}`);

    // ============================================
    // 1. BUSCAR TODOS OS ADMINS
    // ============================================
    const { data: adminUsers } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'admin');

    if (!adminUsers || adminUsers.length === 0) {
      console.warn('No admin users found to notify');
      return new Response(
        JSON.stringify({ success: true, message: 'No admins to notify' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const adminIds = adminUsers.map(u => u.user_id);
    const notificationChannels: string[] = [];

    // ============================================
    // 2. CRIAR REGISTRO NO HISTÓRICO
    // ============================================
    const { data: alertHistory, error: historyError } = await supabase
      .from('admin_alert_history')
      .insert({
        alert_type: alertData.alert_type,
        severity: alertData.severity,
        title: alertData.title,
        message: alertData.message,
        context: alertData.context || {},
        notified_admins: adminIds,
        notification_channels: [],
      })
      .select()
      .single();

    if (historyError) {
      console.error('Error creating alert history:', historyError);
      throw historyError;
    }

    // ============================================
    // 3. ENVIAR NOTIFICAÇÕES POR EMAIL (LOOPS)
    // ============================================
    if (['critical', 'emergency'].includes(alertData.severity)) {
      console.log('📧 Sending email notifications to admins...');
      
      const { data: adminAuth } = await supabase.auth.admin.listUsers();
      const adminEmails = adminAuth?.users
        ?.filter(u => adminIds.includes(u.id))
        ?.map(u => u.email)
        ?.filter(Boolean) || [];

      for (const email of adminEmails) {
        try {
          await supabase.functions.invoke('send-loops-email', {
            body: {
              email,
              transactionalId: 'admin-critical-alert',
              dataVariables: {
                alertTitle: alertData.title,
                alertMessage: alertData.message,
                alertSeverity: alertData.severity,
                alertType: alertData.alert_type,
                alertContext: JSON.stringify(alertData.context || {}, null, 2),
                dashboardUrl: `${supabaseUrl.replace('supabase.co', 'lovable.app')}/admin/maintenance`,
              },
            },
          });
          notificationChannels.push('email');
        } catch (emailError) {
          console.error(`Failed to send email to ${email}:`, emailError);
        }
      }
    }

    // ============================================
    // 4. CRIAR ALERTA NO PAINEL ADMIN
    // ============================================
    const { error: adminAlertError } = await supabase
      .from('admin_alerts')
      .insert({
        alert_type: alertData.alert_type,
        severity: alertData.severity,
        title: alertData.title,
        message: alertData.message,
        context: alertData.context || {},
      });

    if (adminAlertError) {
      console.error('Error creating admin alert:', adminAlertError);
    } else {
      notificationChannels.push('dashboard');
    }

    // ============================================
    // 5. ENVIAR VIA WEBHOOKS EXTERNOS
    // ============================================
    if (['critical', 'emergency'].includes(alertData.severity)) {
      console.log('🔔 Triggering webhooks...');
      
      const { data: webhooks } = await supabase
        .from('webhook_configs')
        .select('*')
        .eq('active', true)
        .contains('events', [alertData.alert_type]);

      if (webhooks && webhooks.length > 0) {
        for (const webhook of webhooks) {
          try {
            await supabase.functions.invoke('trigger-webhooks', {
              body: {
                webhook_id: webhook.id,
                alert: {
                  title: alertData.title,
                  message: alertData.message,
                  severity: alertData.severity,
                  alert_type: alertData.alert_type,
                  context: alertData.context,
                },
                event_type: alertData.alert_type,
              },
            });
            notificationChannels.push(`webhook_${webhook.platform}`);
          } catch (webhookError) {
            console.error(`Failed to trigger webhook ${webhook.name}:`, webhookError);
          }
        }
      }
    }

    // ============================================
    // 6. ATUALIZAR HISTÓRICO COM CANAIS NOTIFICADOS
    // ============================================
    await supabase
      .from('admin_alert_history')
      .update({ notification_channels: notificationChannels })
      .eq('id', alertHistory.id);

    console.log(`✅ Alert sent via: ${notificationChannels.join(', ')}`);

    return new Response(
      JSON.stringify({
        success: true,
        alert_id: alertHistory.id,
        notified_admins: adminIds.length,
        channels: notificationChannels,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Error sending alert:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
