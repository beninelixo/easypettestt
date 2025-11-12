import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Validation schema
const webhookTriggerSchema = z.object({
  alert: z.object({
    title: z.string().max(200, 'Title too long'),
    message: z.string().max(1000, 'Message too long'),
    severity: z.enum(['critical', 'emergency', 'warning', 'info']),
    alert_type: z.string().max(100, 'Alert type too long'),
  }),
  event_type: z.string().max(100, 'Event type too long'),
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Validate input with Zod
    const rawBody = await req.json();
    const validation = webhookTriggerSchema.safeParse(rawBody);
    
    if (!validation.success) {
      console.error('Validation error:', validation.error);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid input data',
          details: validation.error.errors[0].message 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { alert, event_type } = validation.data;

    console.log('🔔 Triggering webhooks for event:', event_type);

    // Buscar webhooks habilitados que estão inscritos nesse tipo de evento
    const { data: webhooks, error: fetchError } = await supabase
      .from('webhook_endpoints')
      .select('*')
      .eq('enabled', true)
      .contains('events', [event_type]);

    if (fetchError) {
      console.error('Error fetching webhooks:', fetchError);
      throw fetchError;
    }

    if (!webhooks || webhooks.length === 0) {
      console.log('No webhooks configured for this event type');
      return new Response(
        JSON.stringify({ success: true, webhooks_triggered: 0 }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📤 Sending to ${webhooks.length} webhook(s)`);

    const results = await Promise.allSettled(
      webhooks.map(async (webhook) => {
        try {
          const payload = formatPayloadForService(webhook.service_type, alert);
          
          console.log(`Sending to ${webhook.service_type}: ${webhook.name}`);

          const response = await fetch(webhook.url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(webhook.secret_token && { 'Authorization': `Bearer ${webhook.secret_token}` })
            },
            body: JSON.stringify(payload)
          });

          // Atualizar status do webhook
          await supabase
            .from('webhook_endpoints')
            .update({
              last_triggered_at: new Date().toISOString(),
              last_status_code: response.status,
              last_error: response.ok ? null : await response.text()
            })
            .eq('id', webhook.id);

          if (!response.ok) {
            console.error(`Webhook ${webhook.name} failed:`, response.status);
            return { webhook: webhook.name, success: false, status: response.status };
          }

          console.log(`✅ Webhook ${webhook.name} sent successfully`);
          return { webhook: webhook.name, success: true, status: response.status };
        } catch (error: any) {
          console.error(`Error sending webhook ${webhook.name}:`, error);
          
          // Registrar erro
          await supabase
            .from('webhook_endpoints')
            .update({
              last_error: error.message
            })
            .eq('id', webhook.id);

          return { webhook: webhook.name, success: false, error: error.message };
        }
      })
    );

    const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
    const failed = results.length - successful;

    console.log(`✅ Webhooks sent: ${successful} successful, ${failed} failed`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        webhooks_triggered: webhooks.length,
        successful,
        failed,
        results: results.map(r => r.status === 'fulfilled' ? r.value : { error: 'rejected' })
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('❌ Error in trigger-webhooks:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Formatar payload de acordo com o serviço
function formatPayloadForService(serviceType: string, alert: any) {
  const severityEmoji = {
    critical: '🚨',
    emergency: '🔥',
    warning: '⚠️',
    info: 'ℹ️'
  };

  const emoji = severityEmoji[alert.severity as keyof typeof severityEmoji] || '📢';
  const title = `${emoji} ${alert.title}`;
  const colorMap: Record<string, string> = {
    critical: '#dc2626',
    emergency: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6'
  };
  const color = colorMap[alert.severity as string] || '#6b7280';

  switch (serviceType) {
    case 'slack':
      return {
        text: title,
        blocks: [
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: title,
              emoji: true
            }
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: alert.message
            }
          },
          {
            type: 'context',
            elements: [
              {
                type: 'mrkdwn',
                text: `*Tipo:* ${alert.alert_type} | *Severidade:* ${alert.severity}`
              }
            ]
          }
        ]
      };

    case 'discord':
      return {
        embeds: [
          {
            title,
            description: alert.message,
            color: parseInt(color.replace('#', ''), 16),
            fields: [
              {
                name: 'Tipo',
                value: alert.alert_type,
                inline: true
              },
              {
                name: 'Severidade',
                value: alert.severity,
                inline: true
              }
            ],
            timestamp: new Date().toISOString()
          }
        ]
      };

    case 'teams':
      return {
        '@type': 'MessageCard',
        '@context': 'http://schema.org/extensions',
        themeColor: color.replace('#', ''),
        summary: title,
        sections: [
          {
            activityTitle: title,
            activitySubtitle: alert.message,
            facts: [
              {
                name: 'Tipo:',
                value: alert.alert_type
              },
              {
                name: 'Severidade:',
                value: alert.severity
              }
            ]
          }
        ]
      };

    default:
      return {
        title,
        message: alert.message,
        alert_type: alert.alert_type,
        severity: alert.severity
      };
  }
}
