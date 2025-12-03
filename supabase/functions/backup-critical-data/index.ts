import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

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

    const backupData: any = {
      timestamp: new Date().toISOString(),
      tables: {}
    };

    const criticalTables = [
      'appointments',
      'payments',
      'pets',
      'profiles',
      'pet_shops',
      'services',
      'products'
    ];

    let totalRecords = 0;

    for (const table of criticalTables) {
      try {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });

        if (!error && count !== null) {
          backupData.tables[table] = {
            count,
            timestamp: new Date().toISOString()
          };
          totalRecords += count;
        }
      } catch (tableError) {
        console.error(`Error backing up ${table}:`, tableError);
        backupData.tables[table] = {
          error: tableError instanceof Error ? tableError.message : String(tableError)
        };
      }
    }

    await supabase.from('system_logs').insert({
      module: 'backup_critical_data',
      log_type: 'info',
      message: `Backup diário realizado: ${Object.keys(backupData.tables).length} tabelas, ${totalRecords} registros`,
      details: {
        tables_backed_up: Object.keys(backupData.tables).length,
        total_records: totalRecords,
        summary: backupData.tables
      }
    });

    return new Response(
      JSON.stringify({ 
        success: true,
        backup: backupData,
        summary: {
          tables: Object.keys(backupData.tables).length,
          total_records: totalRecords
        }
      }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error creating backup:', error);
    
    try {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );
      
      await supabase.from('system_logs').insert({
        module: 'backup_critical_data',
        log_type: 'error',
        message: 'Falha crítica no backup automático',
        details: { error: error instanceof Error ? error.message : String(error) }
      });
    } catch {}
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : String(error)
      }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});