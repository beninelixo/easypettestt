// Edge Function: auto-diagnostico
// Diagnóstico automático completo do sistema com correções

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface DiagnosticResult {
  category: string;
  issue: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'detected' | 'fixed' | 'pending';
  details: string;
  fix_applied?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { auto_fix = false } = await req.json();
    
    const results: DiagnosticResult[] = [];
    let fixedCount = 0;
    let criticalIssues = 0;

    console.log('🔍 Iniciando diagnóstico automático do sistema...');

    // ============================================
    // 1. VERIFICAR AGENDAMENTOS DUPLICADOS
    // ============================================
    console.log('Verificando agendamentos duplicados...');
    
    // Buscar todos os agendamentos não-cancelados e identificar duplicatas manualmente
    const { data: allAppointments } = await supabase
      .from('appointments')
      .select('id, pet_shop_id, scheduled_date, scheduled_time, created_at')
      .not('status', 'eq', 'cancelled')
      .order('created_at');

    // Agrupar por chave de horário e identificar conflitos
    const appointmentMap = new Map<string, any[]>();
    if (allAppointments) {
      for (const apt of allAppointments) {
        const key = `${apt.pet_shop_id}_${apt.scheduled_date}_${apt.scheduled_time}`;
        if (!appointmentMap.has(key)) {
          appointmentMap.set(key, []);
        }
        appointmentMap.get(key)!.push(apt);
      }
    }

    // Filtrar apenas os que têm duplicatas
    const duplicateAppointments = Array.from(appointmentMap.values()).filter(group => group.length > 1);

    if (duplicateAppointments && duplicateAppointments.length > 0) {
      criticalIssues++;
      results.push({
        category: 'Agendamentos',
        issue: 'Agendamentos duplicados detectados',
        severity: 'critical',
        status: 'detected',
        details: `${duplicateAppointments.length} conflitos de horário encontrados`,
      });

      if (auto_fix) {
        // Cancelar agendamentos duplicados mantendo o mais antigo
        for (const group of duplicateAppointments) {
          // Manter o primeiro (mais antigo) e cancelar os demais
          const toCancel = group.slice(1).map(apt => apt.id);
          
          if (toCancel.length > 0) {
            await supabase
              .from('appointments')
              .update({ status: 'cancelled', notes: 'Cancelado automaticamente - duplicata' })
              .in('id', toCancel);
          }
        }

        fixedCount++;
        results[results.length - 1].status = 'fixed';
        results[results.length - 1].fix_applied = 'Agendamentos duplicados cancelados';
      }
    }

    // ============================================
    // 2. VERIFICAR ESTOQUE NEGATIVO
    // ============================================
    console.log('Verificando estoque negativo...');
    const { data: negativeStock } = await supabase
      .from('products')
      .select('id, name, stock_quantity')
      .lt('stock_quantity', 0);

    if (negativeStock && negativeStock.length > 0) {
      criticalIssues++;
      results.push({
        category: 'Estoque',
        issue: 'Produtos com estoque negativo',
        severity: 'high',
        status: 'detected',
        details: `${negativeStock.length} produtos com quantidade negativa`,
      });

      if (auto_fix) {
        for (const product of negativeStock) {
          await supabase
            .from('products')
            .update({ stock_quantity: 0 })
            .eq('id', product.id);

          await supabase.from('system_logs').insert({
            module: 'auto_diagnostico',
            log_type: 'warning',
            message: `Estoque negativo corrigido: ${product.name}`,
            details: { product_id: product.id, old_quantity: product.stock_quantity },
          });
        }

        fixedCount++;
        results[results.length - 1].status = 'fixed';
        results[results.length - 1].fix_applied = 'Estoque zerado para produtos negativos';
      }
    }

    // ============================================
    // 3. VERIFICAR PETS ÓRFÃOS
    // ============================================
    console.log('Verificando pets órfãos...');
    const { data: orphanPets } = await supabase
      .from('pets')
      .select('id, name')
      .is('owner_id', null);

    if (orphanPets && orphanPets.length > 0) {
      results.push({
        category: 'Dados',
        issue: 'Pets sem dono detectados',
        severity: 'medium',
        status: 'detected',
        details: `${orphanPets.length} pets sem owner_id`,
      });

      if (auto_fix) {
        const ids = orphanPets.map(p => p.id);
        await supabase.from('pets').delete().in('id', ids);

        fixedCount++;
        results[results.length - 1].status = 'fixed';
        results[results.length - 1].fix_applied = 'Pets órfãos removidos';
      }
    }

    // ============================================
    // 4. VERIFICAR AGENDAMENTOS ATRASADOS
    // ============================================
    console.log('Verificando agendamentos atrasados...');
    const { data: overdueAppointments } = await supabase
      .from('appointments')
      .select('id, scheduled_date')
      .lt('scheduled_date', new Date().toISOString().split('T')[0])
      .in('status', ['pending', 'confirmed']);

    if (overdueAppointments && overdueAppointments.length > 0) {
      results.push({
        category: 'Agendamentos',
        issue: 'Agendamentos atrasados sem conclusão',
        severity: 'high',
        status: 'detected',
        details: `${overdueAppointments.length} agendamentos passados não finalizados`,
      });

      if (auto_fix && overdueAppointments.length <= 50) {
        const ids = overdueAppointments.map(a => a.id);
        await supabase
          .from('appointments')
          .update({ status: 'cancelled', notes: 'Cancelado automaticamente - data passada' })
          .in('id', ids);

        fixedCount++;
        results[results.length - 1].status = 'fixed';
        results[results.length - 1].fix_applied = 'Agendamentos atrasados cancelados';
      }
    }

    // ============================================
    // 5. VERIFICAR AGENDAMENTOS SEM PAGAMENTO
    // ============================================
    console.log('Verificando agendamentos concluídos sem pagamento...');
    const { data: appointmentsWithoutPayment } = await supabase
      .from('appointments')
      .select('id')
      .eq('status', 'completed');

    let missingPayments = 0;
    if (appointmentsWithoutPayment) {
      for (const apt of appointmentsWithoutPayment) {
        const { data: payment } = await supabase
          .from('payments')
          .select('id')
          .eq('appointment_id', apt.id)
          .maybeSingle();

        if (!payment) {
          missingPayments++;
        }
      }
    }

    if (missingPayments > 0) {
      results.push({
        category: 'Financeiro',
        issue: 'Agendamentos concluídos sem pagamento',
        severity: 'high',
        status: 'detected',
        details: `${missingPayments} agendamentos sem registro de pagamento`,
      });
    }

    // ============================================
    // 6. VERIFICAR PRODUTOS VENCIDOS
    // ============================================
    console.log('Verificando produtos vencidos...');
    const { data: expiredProducts } = await supabase
      .from('products')
      .select('id, name, expiry_date')
      .lt('expiry_date', new Date().toISOString().split('T')[0])
      .eq('active', true);

    if (expiredProducts && expiredProducts.length > 0) {
      results.push({
        category: 'Estoque',
        issue: 'Produtos vencidos ainda ativos',
        severity: 'high',
        status: 'detected',
        details: `${expiredProducts.length} produtos vencidos`,
      });

      if (auto_fix) {
        const ids = expiredProducts.map(p => p.id);
        await supabase
          .from('products')
          .update({ active: false })
          .in('id', ids);

        fixedCount++;
        results[results.length - 1].status = 'fixed';
        results[results.length - 1].fix_applied = 'Produtos vencidos desativados';
      }
    }

    // ============================================
    // 7. VERIFICAR PERFIS INCOMPLETOS
    // ============================================
    console.log('Verificando perfis incompletos...');
    const { data: incompleteProfiles } = await supabase
      .from('profiles')
      .select('id')
      .or('full_name.eq.,phone.eq.');

    if (incompleteProfiles && incompleteProfiles.length > 0) {
      results.push({
        category: 'Usuários',
        issue: 'Perfis com dados incompletos',
        severity: 'medium',
        status: 'detected',
        details: `${incompleteProfiles.length} perfis sem nome ou telefone`,
      });
    }

    // ============================================
    // 8. VERIFICAR TENTATIVAS DE LOGIN SUSPEITAS
    // ============================================
    console.log('Verificando tentativas de login suspeitas...');
    
    // Buscar todas as tentativas de login falhadas na última hora
    const { data: failedLogins } = await supabase
      .from('login_attempts')
      .select('ip_address, attempt_time')
      .eq('success', false)
      .gte('attempt_time', new Date(Date.now() - 3600000).toISOString());

    // Agrupar por IP e contar tentativas
    const ipCounts = new Map<string, number>();
    if (failedLogins) {
      for (const login of failedLogins) {
        const count = ipCounts.get(login.ip_address) || 0;
        ipCounts.set(login.ip_address, count + 1);
      }
    }

    // Filtrar IPs com mais de 10 tentativas
    const suspiciousLogins = Array.from(ipCounts.entries())
      .filter(([_, count]) => count > 10)
      .map(([ip, count]) => ({ ip_address: ip, count }));

    if (suspiciousLogins && suspiciousLogins.length > 0) {
      criticalIssues++;
      results.push({
        category: 'Segurança',
        issue: 'Tentativas de login suspeitas detectadas',
        severity: 'critical',
        status: 'detected',
        details: `${suspiciousLogins.length} IPs com >10 tentativas na última hora`,
      });

      // Enviar alerta crítico
      await fetch(`${supabaseUrl}/functions/v1/send-alert-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({
          severity: 'critical',
          module: 'auto_diagnostico',
          subject: '🚨 Tentativas de Login Suspeitas',
          message: `Detectadas ${suspiciousLogins.length} IPs com mais de 10 tentativas falhas na última hora`,
          details: { ips: suspiciousLogins },
        }),
      });
    }

    // ============================================
    // 9. VERIFICAR SAÚDE DO BANCO DE DADOS
    // ============================================
    console.log('Verificando saúde geral do sistema...');
    const { data: systemHealth } = await supabase.rpc('get_system_health');

    if (systemHealth) {
      const health = systemHealth as any;
      
      if (health.pending_payments > 50) {
        results.push({
          category: 'Financeiro',
          issue: 'Muitos pagamentos pendentes',
          severity: 'medium',
          status: 'detected',
          details: `${health.pending_payments} pagamentos aguardando confirmação`,
        });
      }

      if (health.low_stock_products > 20) {
        results.push({
          category: 'Estoque',
          issue: 'Muitos produtos com estoque baixo',
          severity: 'low',
          status: 'detected',
          details: `${health.low_stock_products} produtos abaixo do estoque mínimo`,
        });
      }
    }

    // ============================================
    // REGISTRAR RESULTADOS DO DIAGNÓSTICO
    // ============================================
    await supabase.from('system_logs').insert({
      module: 'auto_diagnostico',
      log_type: criticalIssues > 0 ? 'error' : 'info',
      message: `Diagnóstico concluído: ${results.length} problemas encontrados`,
      details: {
        total_issues: results.length,
        critical_issues: criticalIssues,
        fixed_count: fixedCount,
        auto_fix_enabled: auto_fix,
        results: results,
      },
    });

    // Enviar alerta se houver problemas críticos
    if (criticalIssues > 0) {
      await fetch(`${supabaseUrl}/functions/v1/send-alert-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({
          severity: 'critical',
          module: 'auto_diagnostico',
          subject: `⚠️ Diagnóstico: ${criticalIssues} Problemas Críticos`,
          message: `Foram encontrados ${criticalIssues} problemas críticos no sistema`,
          details: { results: results.filter(r => r.severity === 'critical') },
        }),
      });
    }

    console.log(`✅ Diagnóstico concluído. ${fixedCount} correções aplicadas.`);

    return new Response(
      JSON.stringify({
        success: true,
        summary: {
          total_issues: results.length,
          critical_issues: criticalIssues,
          fixed_count: fixedCount,
          auto_fix_enabled: auto_fix,
        },
        results: results,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Erro no diagnóstico:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
