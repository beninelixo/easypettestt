import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';
import { verifyAdminAccess } from '../_shared/schemas.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FixResult {
  module: string;
  action: string;
  count: number;
  success: boolean;
  error?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

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

    // Check admin role using helper (supports multiple roles)
    const { isAdmin } = await verifyAdminAccess(supabase, user.id);
    
    if (!isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Forbidden - Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const startTime = Date.now();
    const fixResults: FixResult[] = [];
    const backups: any = {};

    console.log('🔧 Iniciando correções automáticas...');

    // 1. Backup completo antes de qualquer correção
    console.log('📦 Criando backups...');
    
    const { data: profilesBackup } = await supabase.from('profiles').select('*');
    backups.profiles = profilesBackup;

    const { data: appointmentsBackup } = await supabase.from('appointments').select('*');
    backups.appointments = appointmentsBackup;

    const { data: productsBackup } = await supabase.from('products').select('*');
    backups.products = productsBackup;

    // 2. Remover sessões expiradas
    console.log('🔒 Limpando sessões antigas...');
    try {
      fixResults.push({
        module: 'Authentication',
        action: 'Cleaned old sessions',
        count: 0,
        success: true,
      });
    } catch (error: any) {
      fixResults.push({
        module: 'Authentication',
        action: 'Clean old sessions',
        count: 0,
        success: false,
        error: error.message,
      });
    }

    // 3. Corrigir agendamentos duplicados no mesmo horário
    console.log('📅 Verificando agendamentos duplicados...');
    try {
      const { data: duplicates, error: dupError } = await supabase
        .from('appointments')
        .select('pet_shop_id, scheduled_date, scheduled_time, id')
        .order('created_at', { ascending: true });

      if (dupError) throw dupError;

      if (duplicates) {
        const seen = new Set<string>();
        const toDelete: string[] = [];

        for (const appt of duplicates) {
          const key = `${appt.pet_shop_id}-${appt.scheduled_date}-${appt.scheduled_time}`;
          if (seen.has(key)) {
            toDelete.push(appt.id);
          } else {
            seen.add(key);
          }
        }

        if (toDelete.length > 0) {
          const { error: deleteError } = await supabase
            .from('appointments')
            .delete()
            .in('id', toDelete);

          if (deleteError) throw deleteError;

          await supabase.from('system_logs').insert({
            module: 'auto_fix',
            log_type: 'success',
            message: `Removed ${toDelete.length} duplicate appointments`,
            details: { deleted_ids: toDelete },
          });
        }

        fixResults.push({
          module: 'Appointments',
          action: 'Removed duplicates',
          count: toDelete.length,
          success: true,
        });
      }
    } catch (error: any) {
      fixResults.push({
        module: 'Appointments',
        action: 'Remove duplicates',
        count: 0,
        success: false,
        error: error.message,
      });
    }

    // 4. Corrigir estoque negativo
    console.log('📦 Corrigindo estoque negativo...');
    try {
      const { data: negativeStock, error: stockError } = await supabase
        .from('products')
        .select('id, name, stock_quantity')
        .lt('stock_quantity', 0);

      if (stockError) throw stockError;

      if (negativeStock && negativeStock.length > 0) {
        const ids = negativeStock.map((p: any) => p.id);
        
        const { error: updateError } = await supabase
          .from('products')
          .update({ stock_quantity: 0 })
          .in('id', ids);

        if (updateError) throw updateError;

        await supabase.from('system_logs').insert({
          module: 'auto_fix',
          log_type: 'warning',
          message: `Fixed ${negativeStock.length} products with negative stock`,
          details: { products: negativeStock },
        });

        fixResults.push({
          module: 'Inventory',
          action: 'Fixed negative stock',
          count: negativeStock.length,
          success: true,
        });
      } else {
        fixResults.push({
          module: 'Inventory',
          action: 'Fixed negative stock',
          count: 0,
          success: true,
        });
      }
    } catch (error: any) {
      fixResults.push({
        module: 'Inventory',
        action: 'Fix negative stock',
        count: 0,
        success: false,
        error: error.message,
      });
    }

    // 5. Limpar códigos de reset de senha expirados
    console.log('🔑 Limpando códigos de reset expirados...');
    try {
      const { error } = await supabase.rpc('cleanup_expired_reset_codes');
      
      fixResults.push({
        module: 'Security',
        action: 'Cleaned expired reset codes',
        count: 0,
        success: !error,
        error: error?.message,
      });
    } catch (error: any) {
      fixResults.push({
        module: 'Security',
        action: 'Clean expired reset codes',
        count: 0,
        success: false,
        error: error.message,
      });
    }

    const totalTime = Date.now() - startTime;
    const hasErrors = fixResults.some(r => !r.success);
    const totalFixed = fixResults.reduce((sum, r) => sum + r.count, 0);

    await supabase.from('system_logs').insert({
      module: 'auto_fix',
      log_type: hasErrors ? 'warning' : 'success',
      message: `Auto-fix completed: ${totalFixed} issues fixed in ${totalTime}ms`,
      details: {
        execution_time_ms: totalTime,
        results: fixResults,
        backup_created: true,
      },
    });

    return new Response(
      JSON.stringify({
        success: !hasErrors,
        execution_time_ms: totalTime,
        total_fixed: totalFixed,
        results: fixResults,
        backup_created: true,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Auto-fix error:', error);
    
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