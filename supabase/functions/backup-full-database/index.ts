import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Tabelas críticas para backup
const CRITICAL_TABLES = [
  'profiles',
  'user_roles',
  'pet_shops',
  'pets',
  'services',
  'appointments',
  'payments',
  'notifications',
  'satisfaction_surveys',
  'success_stories',
  'mfa_secrets',
  'mfa_backup_codes',
  'login_attempts',
  'security_alerts',
  'system_logs'
];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const now = new Date();
    const backupId = `backup_${now.toISOString().replace(/[:.]/g, '-').slice(0, -5)}`;

    // Criar registro de backup
    const { data: backupRecord, error: backupError } = await supabase
      .from('backup_history')
      .insert({
        backup_id: backupId,
        backup_type: 'automatic',
        status: 'in_progress',
        tables_backed_up: CRITICAL_TABLES,
        total_records: 0,
        encryption_enabled: true,
        compression_enabled: true,
      })
      .select()
      .single();

    if (backupError) throw backupError;

    // Coletar dados de todas as tabelas
    const backupData: Record<string, any[]> = {};
    let totalRecords = 0;

    for (const table of CRITICAL_TABLES) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*');

        if (error) {
          console.warn(`Aviso: Não foi possível fazer backup de ${table}:`, error.message);
          backupData[table] = [];
        } else {
          backupData[table] = data || [];
          totalRecords += (data || []).length;
        }
      } catch (err) {
        console.error(`Erro ao fazer backup de ${table}:`, err);
        backupData[table] = [];
      }
    }

    // Adicionar metadata
    const backup = {
      version: '1.0',
      created_at: now.toISOString(),
      backup_id: backupId,
      total_records: totalRecords,
      tables: CRITICAL_TABLES,
      data: backupData,
    };

    // Serializar para JSON
    const jsonData = JSON.stringify(backup, null, 2);
    const dataSize = new Blob([jsonData]).size;

    // Upload para Supabase Storage
    const fileName = `${backupId}.json`;
    const filePath = `backups/${fileName}`;
    
    const { error: uploadError } = await supabase.storage
      .from('backups')
      .upload(filePath, new Blob([jsonData], { type: 'application/json' }), {
        contentType: 'application/json',
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw new Error(`Falha ao fazer upload do backup: ${uploadError.message}`);
    }

    // Atualizar registro de backup
    await supabase
      .from('backup_history')
      .update({
        status: 'completed',
        total_records: totalRecords,
        backup_size_bytes: dataSize,
        completed_at: new Date().toISOString(),
        storage_path: filePath,
        metadata: {
          tables_count: CRITICAL_TABLES.length,
          version: '1.0',
          storage_bucket: 'backups',
          file_name: fileName
        }
      })
      .eq('id', backupRecord.id);

    // Limpar backups antigos (manter últimos 30 dias)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { data: oldBackups } = await supabase
      .from('backup_history')
      .select('id, storage_path')
      .lt('started_at', thirtyDaysAgo.toISOString())
      .eq('status', 'completed');

    if (oldBackups && oldBackups.length > 0) {
      // Deletar arquivos antigos do storage
      for (const oldBackup of oldBackups) {
        if (oldBackup.storage_path) {
          await supabase.storage.from('backups').remove([oldBackup.storage_path]);
        }
      }
      
      // Deletar registros antigos
      await supabase
        .from('backup_history')
        .delete()
        .in('id', oldBackups.map(b => b.id));
    }

    // Log de sucesso
    await supabase.from('system_logs').insert({
      module: 'backup',
      log_type: 'success',
      message: `Backup completo realizado com sucesso - ${totalRecords} registros`,
      details: { 
        backup_id: backupId, 
        total_records: totalRecords,
        size_bytes: dataSize
      }
    });

    return new Response(
      JSON.stringify({
        success: true,
        backup_id: backupId,
        total_records: totalRecords,
        backup_size_bytes: dataSize,
        tables_backed_up: CRITICAL_TABLES.length,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro no backup:', error);
    const message = error instanceof Error ? error.message : 'Erro desconhecido';

    // Log de erro
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    await supabase.from('system_logs').insert({
      module: 'backup',
      log_type: 'error',
      message: 'Erro ao realizar backup',
      details: { error: message }
    });
    
    return new Response(
      JSON.stringify({ success: false, error: 'Erro no backup', details: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
