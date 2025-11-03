import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SecurityCheck {
  type: string;
  status: 'ok' | 'warning' | 'critical';
  message: string;
  autoFixed?: boolean;
}

interface PerformanceMetric {
  endpoint: string;
  avgResponseTime: number;
  errorRate: number;
}

interface AuditReport {
  timestamp: string;
  securityScore: number;
  checks: SecurityCheck[];
  performance: PerformanceMetric[];
  autoCorrections: string[];
  suggestions: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const report: AuditReport = {
      timestamp: new Date().toISOString(),
      securityScore: 10,
      checks: [],
      performance: [],
      autoCorrections: [],
      suggestions: [],
    };

    // 1. Security Checks
    console.log('🔍 Running security audit...');

    // Check for tables without RLS
    const { data: tables } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');

    for (const table of tables || []) {
      const { data: rlsEnabled } = await supabase.rpc('has_rls_enabled', {
        schema_name: 'public',
        table_name: table.table_name,
      });

      if (!rlsEnabled) {
        report.checks.push({
          type: 'RLS',
          status: 'critical',
          message: `Table ${table.table_name} does not have RLS enabled`,
        });
        report.securityScore -= 2;
      }
    }

    // Check for expired sessions
    const { data: expiredSessions } = await supabase.rpc('get_expired_sessions');
    if (expiredSessions && expiredSessions.length > 0) {
      report.checks.push({
        type: 'Session',
        status: 'warning',
        message: `Found ${expiredSessions.length} expired sessions`,
      });
      
      // Auto-fix: Clean expired sessions
      await supabase.rpc('cleanup_expired_sessions');
      report.autoCorrections.push(`Cleaned ${expiredSessions.length} expired sessions`);
    }

    // Check for failed login attempts (brute force detection)
    const { data: failedLogins } = await supabase
      .from('login_attempts')
      .select('ip_address, count')
      .eq('success', false)
      .gte('attempt_time', new Date(Date.now() - 15 * 60 * 1000).toISOString());

    const suspiciousIPs = failedLogins?.filter(l => l.count > 5) || [];
    if (suspiciousIPs.length > 0) {
      report.checks.push({
        type: 'BruteForce',
        status: 'warning',
        message: `Detected ${suspiciousIPs.length} IPs with excessive failed logins`,
      });
      report.securityScore -= 1;
    }

    // 2. Performance Audit
    console.log('⚡ Analyzing performance...');

    // Check average query times
    const { data: slowQueries } = await supabase
      .from('system_logs')
      .select('module, details')
      .eq('log_type', 'performance')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    // Check for orphaned data
    const { data: orphanedPets } = await supabase
      .from('pets')
      .select('id')
      .is('owner_id', null);

    if (orphanedPets && orphanedPets.length > 0) {
      report.checks.push({
        type: 'DataIntegrity',
        status: 'warning',
        message: `Found ${orphanedPets.length} orphaned pets without owners`,
      });
      report.suggestions.push('Review and assign orphaned pets to owners');
    }

    // 3. Check for duplicates
    const { data: duplicateProfiles } = await supabase.rpc('find_duplicate_profiles');
    if (duplicateProfiles && duplicateProfiles.length > 0) {
      report.checks.push({
        type: 'Duplicates',
        status: 'warning',
        message: `Found ${duplicateProfiles.length} duplicate profiles`,
      });
      report.suggestions.push('Merge duplicate user profiles');
    }

    // 4. Check system health
    const { data: healthData } = await supabase.rpc('get_system_health');
    if (healthData) {
      if (healthData.overdue_appointments > 10) {
        report.checks.push({
          type: 'DataCleaning',
          status: 'warning',
          message: `${healthData.overdue_appointments} overdue appointments need attention`,
        });
      }
      
      if (healthData.negative_stock_products > 0) {
        report.checks.push({
          type: 'DataIntegrity',
          status: 'critical',
          message: `${healthData.negative_stock_products} products with negative stock`,
        });
        report.securityScore -= 1;
      }
    }

    // Log the report
    await supabase.from('system_logs').insert({
      module: 'ai_monitor',
      log_type: 'info',
      message: `Automated audit completed - Security Score: ${report.securityScore}/10`,
      details: report,
    });

    // Send alerts if critical issues found
    const criticalIssues = report.checks.filter(c => c.status === 'critical');
    if (criticalIssues.length > 0) {
      // TODO: Send notification to admin
      console.log('🚨 Critical issues detected:', criticalIssues);
    }

    return new Response(JSON.stringify(report), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('AI Monitor error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
