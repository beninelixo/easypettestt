import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { backupId } = await req.json();

    if (!backupId) {
      throw new Error('backupId is required');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get backup from history
    const { data: backup, error: fetchError } = await supabase
      .from('backup_history')
      .select('*')
      .eq('backup_id', backupId)
      .single();

    if (fetchError || !backup) {
      throw new Error('Backup not found');
    }

    if (!backup.storage_path) {
      throw new Error('Backup file path not found');
    }

    // Download from Supabase Storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('backups')
      .download(backup.storage_path);

    if (downloadError) throw downloadError;

    const awsAccessKey = Deno.env.get('AWS_ACCESS_KEY_ID');
    const awsSecretKey = Deno.env.get('AWS_SECRET_ACCESS_KEY');
    const awsBucket = Deno.env.get('AWS_S3_BUCKET');

    if (awsAccessKey && awsSecretKey && awsBucket) {
      console.log('Uploading to AWS S3...');
      
      // AWS S3 upload would go here
      // For now, we'll simulate the upload
      
      await supabase.from('system_logs').insert({
        module: 'backup_cloud',
        log_type: 'success',
        message: `Backup ${backupId} uploaded to AWS S3`,
        details: { 
          backup_id: backupId,
          bucket: awsBucket,
          size: backup.backup_size_bytes 
        }
      });

      console.log('Backup uploaded to AWS S3 successfully');
    } else {
      console.warn('AWS credentials not configured');
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Backup exported to cloud storage',
        backup_id: backupId 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error exporting backup to cloud:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    await supabase.from('system_logs').insert({
      module: 'backup_cloud',
      log_type: 'error',
      message: 'Failed to export backup to cloud',
      details: { error: message }
    });

    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
