import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ReportRequest {
  start_date?: string;
  end_date?: string;
  report_type?: 'monthly' | 'weekly' | 'custom';
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { start_date, end_date, report_type = 'monthly' }: ReportRequest = await req.json();

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

    // Buscar dados de segurança
    const { data: alerts } = await supabase
      .from('security_alerts')
      .select('*')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    const { data: loginAttempts } = await supabase
      .from('login_attempts')
      .select('*')
      .gte('attempt_time', startDate.toISOString())
      .lte('attempt_time', endDate.toISOString());

    const { data: blockedIps } = await supabase
      .from('blocked_ips')
      .select('*')
      .gte('blocked_at', startDate.toISOString())
      .lte('blocked_at', endDate.toISOString());

    const { data: backups } = await supabase
      .from('backup_history')
      .select('*')
      .gte('started_at', startDate.toISOString())
      .lte('started_at', endDate.toISOString());

    const { data: auditLogs } = await supabase
      .from('audit_logs')
      .select('*')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    // Calcular estatísticas
    const stats = {
      period: {
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0],
        type: report_type
      },
      security: {
        total_alerts: alerts?.length || 0,
        critical_alerts: alerts?.filter(a => a.severity === 'critical').length || 0,
        high_alerts: alerts?.filter(a => a.severity === 'high').length || 0,
        resolved_alerts: alerts?.filter(a => a.resolved).length || 0,
        resolution_rate: alerts?.length 
          ? ((alerts.filter(a => a.resolved).length / alerts.length) * 100).toFixed(1)
          : '0'
      },
      login_attempts: {
        total: loginAttempts?.length || 0,
        successful: loginAttempts?.filter(a => a.success).length || 0,
        failed: loginAttempts?.filter(a => !a.success).length || 0,
        success_rate: loginAttempts?.length
          ? ((loginAttempts.filter(a => a.success).length / loginAttempts.length) * 100).toFixed(1)
          : '0'
      },
      blocked_ips: {
        total: blockedIps?.length || 0,
        auto_blocked: blockedIps?.filter(b => b.auto_blocked).length || 0,
        manual_blocked: blockedIps?.filter(b => !b.auto_blocked).length || 0
      },
      backups: {
        total: backups?.length || 0,
        completed: backups?.filter(b => b.status === 'completed').length || 0,
        failed: backups?.filter(b => b.status === 'failed').length || 0,
        total_size_mb: backups
          ?.filter(b => b.status === 'completed')
          .reduce((sum, b) => sum + (b.backup_size_bytes || 0), 0) / 1024 / 1024,
        success_rate: backups?.length
          ? ((backups.filter(b => b.status === 'completed').length / backups.length) * 100).toFixed(1)
          : '0'
      },
      audit: {
        total_actions: auditLogs?.length || 0,
        operations: {
          insert: auditLogs?.filter(a => a.operation === 'INSERT').length || 0,
          update: auditLogs?.filter(a => a.operation === 'UPDATE').length || 0,
          delete: auditLogs?.filter(a => a.operation === 'DELETE').length || 0
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
    body {
      font-family: Arial, sans-serif;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      color: #333;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      border-radius: 10px;
      margin-bottom: 30px;
    }
    .header h1 {
      margin: 0 0 10px 0;
    }
    .period {
      opacity: 0.9;
      font-size: 14px;
    }
    .section {
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
    }
    .section h2 {
      margin-top: 0;
      color: #1f2937;
      border-bottom: 2px solid #667eea;
      padding-bottom: 10px;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
      margin-top: 15px;
    }
    .stat-card {
      background: #f9fafb;
      padding: 15px;
      border-radius: 6px;
      border-left: 4px solid #667eea;
    }
    .stat-label {
      font-size: 12px;
      color: #6b7280;
      text-transform: uppercase;
      margin-bottom: 5px;
    }
    .stat-value {
      font-size: 24px;
      font-weight: bold;
      color: #1f2937;
    }
    .alert-critical { border-left-color: #dc2626; }
    .alert-high { border-left-color: #f59e0b; }
    .alert-success { border-left-color: #10b981; }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 15px;
    }
    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #e5e7eb;
    }
    th {
      background: #f3f4f6;
      font-weight: 600;
      color: #374151;
    }
    .footer {
      text-align: center;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      color: #6b7280;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>📊 Relatório de Segurança e Compliance</h1>
    <div class="period">
      Período: ${stats.period.start} até ${stats.period.end}
      <br>
      Tipo: ${stats.period.type === 'monthly' ? 'Mensal' : stats.period.type === 'weekly' ? 'Semanal' : 'Personalizado'}
    </div>
  </div>

  <div class="section">
    <h2>🛡️ Alertas de Segurança</h2>
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">Total de Alertas</div>
        <div class="stat-value">${stats.security.total_alerts}</div>
      </div>
      <div class="stat-card alert-critical">
        <div class="stat-label">Alertas Críticos</div>
        <div class="stat-value">${stats.security.critical_alerts}</div>
      </div>
      <div class="stat-card alert-high">
        <div class="stat-label">Alertas Altos</div>
        <div class="stat-value">${stats.security.high_alerts}</div>
      </div>
      <div class="stat-card alert-success">
        <div class="stat-label">Taxa de Resolução</div>
        <div class="stat-value">${stats.security.resolution_rate}%</div>
      </div>
    </div>
  </div>

  <div class="section">
    <h2>🔐 Tentativas de Login</h2>
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">Total de Tentativas</div>
        <div class="stat-value">${stats.login_attempts.total}</div>
      </div>
      <div class="stat-card alert-success">
        <div class="stat-label">Login Bem-sucedidos</div>
        <div class="stat-value">${stats.login_attempts.successful}</div>
      </div>
      <div class="stat-card alert-critical">
        <div class="stat-label">Login Falhados</div>
        <div class="stat-value">${stats.login_attempts.failed}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Taxa de Sucesso</div>
        <div class="stat-value">${stats.login_attempts.success_rate}%</div>
      </div>
    </div>
  </div>

  <div class="section">
    <h2>🚫 IPs Bloqueados</h2>
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">Total Bloqueados</div>
        <div class="stat-value">${stats.blocked_ips.total}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Bloqueios Automáticos</div>
        <div class="stat-value">${stats.blocked_ips.auto_blocked}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Bloqueios Manuais</div>
        <div class="stat-value">${stats.blocked_ips.manual_blocked}</div>
      </div>
    </div>
  </div>

  <div class="section">
    <h2>💾 Backups</h2>
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">Total de Backups</div>
        <div class="stat-value">${stats.backups.total}</div>
      </div>
      <div class="stat-card alert-success">
        <div class="stat-label">Backups Completos</div>
        <div class="stat-value">${stats.backups.completed}</div>
      </div>
      <div class="stat-card alert-critical">
        <div class="stat-label">Backups Falhados</div>
        <div class="stat-value">${stats.backups.failed}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Tamanho Total</div>
        <div class="stat-value">${stats.backups.total_size_mb?.toFixed(2)} MB</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Taxa de Sucesso</div>
        <div class="stat-value">${stats.backups.success_rate}%</div>
      </div>
    </div>
  </div>

  <div class="section">
    <h2>📝 Logs de Auditoria</h2>
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">Total de Ações</div>
        <div class="stat-value">${stats.audit.total_actions}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Inserções</div>
        <div class="stat-value">${stats.audit.operations.insert}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Atualizações</div>
        <div class="stat-value">${stats.audit.operations.update}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Exclusões</div>
        <div class="stat-value">${stats.audit.operations.delete}</div>
      </div>
    </div>
  </div>

  <div class="footer">
    <p>Relatório gerado automaticamente em ${new Date().toLocaleString('pt-BR')}</p>
    <p>Sistema de Segurança e Auditoria v1.0</p>
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