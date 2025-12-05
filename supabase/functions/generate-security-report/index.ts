import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';
import { verifyAdminAccess } from '../_shared/schemas.ts';

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
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

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

    // Check admin role using helper (supports multiple roles)
    const { isAdmin } = await verifyAdminAccess(supabase, user.id);
    
    if (!isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Forbidden - Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate input with Zod
    const requestSchema = z.object({
      start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
      end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
      report_type: z.enum(['monthly', 'weekly', 'custom']).optional()
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

    const { start_date, end_date, report_type = 'monthly' } = validation.data;

    // Calcular datas se não fornecidas
    let startDate: Date;
    let endDate: Date = new Date();

    if (start_date && end_date) {
      startDate = new Date(start_date);
      endDate = new Date(end_date);
    } else if (report_type === 'monthly') {
      startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);
    } else if (report_type === 'weekly') {
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
    } else {
      startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);
    }

    // Buscar dados de segurança com tratamento de erro
    const [loginAttempts, blockedIps, backups, auditLogs, adminAlerts] = await Promise.all([
      supabase.from('login_attempts').select('*').gte('attempt_time', startDate.toISOString()).lte('attempt_time', endDate.toISOString()),
      supabase.from('blocked_ips').select('*').gte('blocked_at', startDate.toISOString()).lte('blocked_at', endDate.toISOString()),
      supabase.from('backup_history').select('*').gte('started_at', startDate.toISOString()).lte('started_at', endDate.toISOString()),
      supabase.from('audit_logs').select('*').gte('created_at', startDate.toISOString()).lte('created_at', endDate.toISOString()),
      supabase.from('admin_alerts').select('*').gte('created_at', startDate.toISOString()).lte('created_at', endDate.toISOString()),
    ]);

    // Calcular estatísticas
    const loginData = loginAttempts.data || [];
    const blockedData = blockedIps.data || [];
    const backupData = backups.data || [];
    const auditData = auditLogs.data || [];
    const alertData = adminAlerts.data || [];

    const stats = {
      period: {
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0],
        type: report_type
      },
      security: {
        total_alerts: alertData.length,
        critical_alerts: alertData.filter(a => a.severity === 'critical' || a.severity === 'error').length,
        high_alerts: alertData.filter(a => a.severity === 'high' || a.severity === 'warn').length,
        resolved_alerts: alertData.filter(a => a.resolved).length,
        resolution_rate: alertData.length 
          ? ((alertData.filter(a => a.resolved).length / alertData.length) * 100).toFixed(1)
          : '0'
      },
      login_attempts: {
        total: loginData.length,
        successful: loginData.filter(a => a.success).length,
        failed: loginData.filter(a => !a.success).length,
        success_rate: loginData.length
          ? ((loginData.filter(a => a.success).length / loginData.length) * 100).toFixed(1)
          : '0'
      },
      blocked_ips: {
        total: blockedData.length,
        auto_blocked: blockedData.filter(b => b.auto_blocked).length,
        manual_blocked: blockedData.filter(b => !b.auto_blocked).length
      },
      backups: {
        total: backupData.length,
        completed: backupData.filter(b => b.status === 'completed').length,
        failed: backupData.filter(b => b.status === 'failed').length,
        total_size_mb: backupData
          .filter(b => b.status === 'completed')
          .reduce((sum, b) => sum + (b.backup_size_bytes || 0), 0) / 1024 / 1024,
        success_rate: backupData.length
          ? ((backupData.filter(b => b.status === 'completed').length / backupData.length) * 100).toFixed(1)
          : '0'
      },
      audit: {
        total_actions: auditData.length,
        operations: {
          insert: auditData.filter(a => a.operation === 'INSERT').length,
          update: auditData.filter(a => a.operation === 'UPDATE').length,
          delete: auditData.filter(a => a.operation === 'DELETE').length
        }
      }
    };

    // Gerar HTML do relatório
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Relatório de Segurança e Compliance</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; color: #333; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; margin-bottom: 30px; }
    .header h1 { margin: 0 0 10px 0; }
    .period { opacity: 0.9; font-size: 14px; }
    .section { background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 20px; }
    .section h2 { margin-top: 0; color: #1f2937; border-bottom: 2px solid #667eea; padding-bottom: 10px; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-top: 15px; }
    .stat-card { background: #f9fafb; padding: 15px; border-radius: 6px; border-left: 4px solid #667eea; }
    .stat-label { font-size: 12px; color: #6b7280; text-transform: uppercase; margin-bottom: 5px; }
    .stat-value { font-size: 24px; font-weight: bold; color: #1f2937; }
    .alert-critical { border-left-color: #dc2626; }
    .alert-high { border-left-color: #f59e0b; }
    .alert-success { border-left-color: #10b981; }
    .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>📊 Relatório de Segurança e Compliance</h1>
    <div class="period">
      Período: ${stats.period.start} até ${stats.period.end}<br>
      Tipo: ${stats.period.type === 'monthly' ? 'Mensal' : stats.period.type === 'weekly' ? 'Semanal' : 'Personalizado'}
    </div>
  </div>

  <div class="section">
    <h2>🛡️ Alertas de Segurança</h2>
    <div class="stats-grid">
      <div class="stat-card"><div class="stat-label">Total de Alertas</div><div class="stat-value">${stats.security.total_alerts}</div></div>
      <div class="stat-card alert-critical"><div class="stat-label">Alertas Críticos</div><div class="stat-value">${stats.security.critical_alerts}</div></div>
      <div class="stat-card alert-high"><div class="stat-label">Alertas Altos</div><div class="stat-value">${stats.security.high_alerts}</div></div>
      <div class="stat-card alert-success"><div class="stat-label">Taxa de Resolução</div><div class="stat-value">${stats.security.resolution_rate}%</div></div>
    </div>
  </div>

  <div class="section">
    <h2>🔐 Tentativas de Login</h2>
    <div class="stats-grid">
      <div class="stat-card"><div class="stat-label">Total de Tentativas</div><div class="stat-value">${stats.login_attempts.total}</div></div>
      <div class="stat-card alert-success"><div class="stat-label">Login Bem-sucedidos</div><div class="stat-value">${stats.login_attempts.successful}</div></div>
      <div class="stat-card alert-critical"><div class="stat-label">Login Falhados</div><div class="stat-value">${stats.login_attempts.failed}</div></div>
      <div class="stat-card"><div class="stat-label">Taxa de Sucesso</div><div class="stat-value">${stats.login_attempts.success_rate}%</div></div>
    </div>
  </div>

  <div class="section">
    <h2>🚫 IPs Bloqueados</h2>
    <div class="stats-grid">
      <div class="stat-card"><div class="stat-label">Total Bloqueados</div><div class="stat-value">${stats.blocked_ips.total}</div></div>
      <div class="stat-card"><div class="stat-label">Bloqueios Automáticos</div><div class="stat-value">${stats.blocked_ips.auto_blocked}</div></div>
      <div class="stat-card"><div class="stat-label">Bloqueios Manuais</div><div class="stat-value">${stats.blocked_ips.manual_blocked}</div></div>
    </div>
  </div>

  <div class="section">
    <h2>💾 Backups</h2>
    <div class="stats-grid">
      <div class="stat-card"><div class="stat-label">Total de Backups</div><div class="stat-value">${stats.backups.total}</div></div>
      <div class="stat-card alert-success"><div class="stat-label">Backups Completos</div><div class="stat-value">${stats.backups.completed}</div></div>
      <div class="stat-card alert-critical"><div class="stat-label">Backups Falhados</div><div class="stat-value">${stats.backups.failed}</div></div>
      <div class="stat-card"><div class="stat-label">Tamanho Total</div><div class="stat-value">${stats.backups.total_size_mb?.toFixed(2)} MB</div></div>
    </div>
  </div>

  <div class="section">
    <h2>📝 Logs de Auditoria</h2>
    <div class="stats-grid">
      <div class="stat-card"><div class="stat-label">Total de Ações</div><div class="stat-value">${stats.audit.total_actions}</div></div>
      <div class="stat-card"><div class="stat-label">Inserções</div><div class="stat-value">${stats.audit.operations.insert}</div></div>
      <div class="stat-card"><div class="stat-label">Atualizações</div><div class="stat-value">${stats.audit.operations.update}</div></div>
      <div class="stat-card"><div class="stat-label">Exclusões</div><div class="stat-value">${stats.audit.operations.delete}</div></div>
    </div>
  </div>

  <div class="footer">
    <p>Relatório gerado automaticamente em ${new Date().toLocaleString('pt-BR')}</p>
    <p>Sistema de Segurança e Auditoria EasyPet v1.0</p>
  </div>
</body>
</html>
    `;

    // Log da geração do relatório
    await supabase.from('system_logs').insert({
      module: 'security_report',
      log_type: 'info',
      message: `Relatório de segurança gerado`,
      details: {
        period: stats.period,
        total_alerts: stats.security.total_alerts,
        total_backups: stats.backups.total
      }
    });

    return new Response(html, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="security-report-${stats.period.start}-to-${stats.period.end}.html"`
      }
    });

  } catch (error) {
    console.error('Generate report error:', error);
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
