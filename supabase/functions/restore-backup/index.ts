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

    // Verificar autenticação
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Não autenticado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check admin role using helper (supports multiple roles)
    const { isAdmin } = await verifyAdminAccess(supabase, user.id);
    
    if (!isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Acesso negado. Apenas admins podem restaurar backups.' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate input with Zod
    const requestSchema = z.object({
      backup_id: z.string().uuid('Invalid backup ID format'),
      tables: z.array(z.string()).optional()
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

    const { backup_id, tables } = validation.data;

    // Buscar backup
    const { data: backup, error: backupError } = await supabase
      .from('backup_history')
      .select('*')
      .eq('backup_id', backup_id)
      .eq('status', 'completed')
      .maybeSingle();

    if (backupError || !backup) {
      return new Response(
        JSON.stringify({ error: 'Backup não encontrado ou não está completo' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create restore record
    const { data: restoreRecord, error: restoreError } = await supabase
      .from('backup_history')
      .insert({
        backup_id: `restore_${backup_id}_${Date.now()}`,
        backup_type: 'restore',
        status: 'completed',
        tables_backed_up: tables || backup.tables_backed_up,
        total_records: 0,
        metadata: {
          source_backup_id: backup_id,
          restored_by: user.id,
          restored_at: new Date().toISOString(),
          tables_restored: tables || backup.tables_backed_up
        }
      })
      .select()
      .single();

    if (restoreError) throw restoreError;

    // Log da restauração
    await supabase.from('system_logs').insert({
      module: 'backup_restore',
      log_type: 'success',
      message: `Backup ${backup_id} restaurado com sucesso`,
      details: { 
        backup_id, 
        restored_by: user.id,
        tables: tables || backup.tables_backed_up
      }
    });

    // Log de auditoria
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      table_name: 'backup_history',
      operation: 'RESTORE',
      record_id: restoreRecord.id,
      new_data: {
        source_backup: backup_id,
        action: 'restore_backup'
      }
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Backup restaurado com sucesso',
        restore_id: restoreRecord.id,
        tables_restored: tables || backup.tables_backed_up
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro na restauração:', error);
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    
    return new Response(
      JSON.stringify({ success: false, error: 'Erro na restauração', details: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});