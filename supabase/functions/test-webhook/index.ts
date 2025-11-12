import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { webhook_id, simulate_failure, test_retry } = await req.json();

    console.log('🧪 Testing webhook:', webhook_id);

    // Buscar webhook
    const { data: webhook, error: fetchError } = await supabase
      .from('webhook_endpoints')
      .select('*')
      .eq('id', webhook_id)
      .single();

    if (fetchError || !webhook) {
      throw new Error('Webhook não encontrado');
    }

    const testResults = {
      webhook_id,
      webhook_name: webhook.name,
      service_type: webhook.service_type,
      tests_performed: [] as any[],
      overall_status: 'success' as string,
      timestamp: new Date().toISOString()
    };

    // Teste 1: Validação de Payload
    console.log('📋 Test 1: Payload Validation');
    const payloadTest = validatePayload(webhook.service_type);
    testResults.tests_performed.push(payloadTest);

    if (!payloadTest.passed) {
      testResults.overall_status = 'failed';
    }

    // Teste 2: Envio Normal
    if (!simulate_failure) {
      console.log('📤 Test 2: Normal Send');
      const sendTest = await testWebhookSend(webhook, false);
      testResults.tests_performed.push(sendTest);

      if (!sendTest.passed) {
        testResults.overall_status = 'failed';
      }
    }

    // Teste 3: Simulação de Falha
    if (simulate_failure) {
      console.log('❌ Test 3: Failure Simulation');
      const failureTest = await testWebhookSend(webhook, true);
      testResults.tests_performed.push(failureTest);

      // Teste 4: Retry Automático
      if (test_retry && !failureTest.passed) {
        console.log('🔄 Test 4: Automatic Retry');
        const retryTest = await testRetryMechanism(webhook);
        testResults.tests_performed.push(retryTest);

        if (!retryTest.passed) {
          testResults.overall_status = 'failed';
        }
      }
    }

    // Atualizar webhook com resultados do teste
    await supabase
      .from('webhook_endpoints')
      .update({
        last_triggered_at: new Date().toISOString(),
        last_status_code: testResults.overall_status === 'success' ? 200 : 500
      })
      .eq('id', webhook_id);

    return new Response(
      JSON.stringify({ success: true, results: testResults }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('❌ Error in test-webhook:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function validatePayload(serviceType: string) {
  const test = {
    test_name: 'Payload Validation',
    service_type: serviceType,
    passed: false,
    details: '',
    timestamp: new Date().toISOString()
  };

  try {
    const testAlert = {
      title: 'Test Alert',
      message: 'This is a test message',
      severity: 'info',
      alert_type: 'test'
    };

    let payload;
    
    switch (serviceType) {
      case 'slack':
        payload = formatSlackPayload(testAlert);
        if (payload.text && payload.blocks && Array.isArray(payload.blocks)) {
          test.passed = true;
          test.details = 'Slack payload válido com text e blocks';
        } else {
          test.details = 'Slack payload inválido: missing text or blocks';
        }
        break;

      case 'discord':
        payload = formatDiscordPayload(testAlert);
        if (payload.embeds && Array.isArray(payload.embeds) && payload.embeds[0].title) {
          test.passed = true;
          test.details = 'Discord payload válido com embeds';
        } else {
          test.details = 'Discord payload inválido: missing embeds';
        }
        break;

      case 'teams':
        payload = formatTeamsPayload(testAlert);
        if (payload['@type'] === 'MessageCard' && payload.sections) {
          test.passed = true;
          test.details = 'Teams payload válido com MessageCard';
        } else {
          test.details = 'Teams payload inválido: missing MessageCard structure';
        }
        break;

      default:
        test.details = `Tipo de serviço desconhecido: ${serviceType}`;
    }
  } catch (error: any) {
    test.details = `Erro na validação: ${error.message}`;
  }

  return test;
}

async function testWebhookSend(webhook: any, simulateFailure: boolean) {
  const test = {
    test_name: simulateFailure ? 'Failure Simulation' : 'Normal Send',
    passed: false,
    status_code: 0,
    response_time_ms: 0,
    details: '',
    timestamp: new Date().toISOString()
  };

  const startTime = Date.now();

  try {
    const testAlert = {
      title: simulateFailure ? '❌ Test Failure' : '✅ Test Success',
      message: simulateFailure 
        ? 'This is a simulated failure test' 
        : 'This is a normal webhook test',
      severity: simulateFailure ? 'critical' : 'info',
      alert_type: 'test'
    };

    let payload;
    switch (webhook.service_type) {
      case 'slack':
        payload = formatSlackPayload(testAlert);
        break;
      case 'discord':
        payload = formatDiscordPayload(testAlert);
        break;
      case 'teams':
        payload = formatTeamsPayload(testAlert);
        break;
      default:
        payload = testAlert;
    }

    // Se simular falha, usa URL inválida
    const url = simulateFailure ? 'https://invalid-webhook-url.example.com/fail' : webhook.url;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(webhook.secret_token && { 'Authorization': `Bearer ${webhook.secret_token}` })
      },
      body: JSON.stringify(payload)
    });

    test.response_time_ms = Date.now() - startTime;
    test.status_code = response.status;

    if (response.ok) {
      test.passed = true;
      test.details = `Webhook enviado com sucesso (${test.response_time_ms}ms)`;
    } else {
      test.details = `Falha no envio: ${response.status} - ${await response.text()}`;
    }
  } catch (error: any) {
    test.response_time_ms = Date.now() - startTime;
    test.details = `Erro na requisição: ${error.message}`;
    
    if (simulateFailure) {
      test.passed = true; // Falha esperada
      test.details = `Falha simulada com sucesso: ${error.message}`;
    }
  }

  return test;
}

async function testRetryMechanism(webhook: any) {
  const test = {
    test_name: 'Automatic Retry',
    passed: false,
    retry_attempts: 0,
    max_retries: 3,
    details: '',
    timestamp: new Date().toISOString()
  };

  const delays = [1000, 2000, 4000]; // Exponential backoff

  for (let i = 0; i < test.max_retries; i++) {
    test.retry_attempts = i + 1;
    
    console.log(`🔄 Retry attempt ${test.retry_attempts}/${test.max_retries}`);

    const result = await testWebhookSend(webhook, false);
    
    if (result.passed) {
      test.passed = true;
      test.details = `Retry bem-sucedido na tentativa ${test.retry_attempts}`;
      break;
    }

    if (i < test.max_retries - 1) {
      await new Promise(resolve => setTimeout(resolve, delays[i]));
    }
  }

  if (!test.passed) {
    test.details = `Todas as ${test.max_retries} tentativas de retry falharam`;
  }

  return test;
}

function formatSlackPayload(alert: any) {
  const emoji = alert.severity === 'critical' ? '🚨' : 
                alert.severity === 'warning' ? '⚠️' : 'ℹ️';
  
  return {
    text: `${emoji} ${alert.title}`,
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `${emoji} ${alert.title}`,
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
}

function formatDiscordPayload(alert: any) {
  const colorMap: Record<string, string> = {
    critical: '#dc2626',
    warning: '#f59e0b',
    info: '#3b82f6'
  };

  return {
    embeds: [
      {
        title: alert.title,
        description: alert.message,
        color: parseInt(colorMap[alert.severity]?.replace('#', '') || '6b7280', 16),
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
}

function formatTeamsPayload(alert: any) {
  const colorMap: Record<string, string> = {
    critical: 'dc2626',
    warning: 'f59e0b',
    info: '3b82f6'
  };

  return {
    '@type': 'MessageCard',
    '@context': 'http://schema.org/extensions',
    themeColor: colorMap[alert.severity] || '6b7280',
    summary: alert.title,
    sections: [
      {
        activityTitle: alert.title,
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
}
