import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Validation schema
const verificationRequestSchema = z.object({
  backup_id: z.string().uuid('Invalid backup ID format'),
  sample_size: z.number().int().min(10).max(1000).optional().default(100),
});

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Verify admin authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.includes(supabaseServiceKey)) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Validate request body
    const rawBody = await req.json();
    const validation = verificationRequestSchema.safeParse(rawBody);
    
    if (!validation.success) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid input data',
          details: validation.error.errors[0].message 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { backup_id, sample_size } = validation.data;

    console.log(`🔍 Starting backup verification for backup: ${backup_id}`);

    // Create verification record
    const { data: verification, error: verificationError } = await supabase
      .from('backup_verifications')
      .insert({
        backup_id,
        verification_status: 'in_progress',
      })
      .select()
      .single();

    if (verificationError) {
      throw new Error(`Failed to create verification record: ${verificationError.message}`);
    }

    // Get backup details
    const { data: backup, error: backupError } = await supabase
      .from('backup_history')
      .select('*')
      .eq('id', backup_id)
      .single();

    if (backupError || !backup) {
      throw new Error('Backup not found');
    }

    if (backup.status !== 'completed') {
      throw new Error('Cannot verify incomplete backup');
    }

    console.log(`📊 Backup found: ${backup.backup_id}`);

    // Tables to verify
    const criticalTables = [
      'profiles',
      'pet_shops',
      'appointments',
      'pets',
      'services',
      'payments',
      'products',
      'user_roles',
    ];

    let tablesVerified = 0;
    let recordsVerified = 0;
    let checksPassedCount = 0;
    let checksFailedCount = 0;
    const verificationResults: any = {};

    // Verify each critical table
    for (const tableName of criticalTables) {
      try {
        console.log(`Verifying table: ${tableName}`);
        
        // Count total records
        const { count: totalCount, error: countError } = await supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true });

        if (countError) {
          verificationResults[tableName] = {
            status: 'error',
            error: countError.message,
          };
          checksFailedCount++;
          continue;
        }

        // Sample records for integrity check
        const { data: sampleRecords, error: sampleError } = await supabase
          .from(tableName)
          .select('*')
          .limit(Math.min(sample_size, totalCount || 0));

        if (sampleError) {
          verificationResults[tableName] = {
            status: 'error',
            error: sampleError.message,
          };
          checksFailedCount++;
          continue;
        }

        // Verify record integrity
        const hasValidStructure = sampleRecords && sampleRecords.length > 0;
        const allRecordsHaveId = sampleRecords?.every(r => r.id !== null && r.id !== undefined);
        const allRecordsHaveCreatedAt = sampleRecords?.every(r => r.created_at !== null);

        const integrityScore = [
          hasValidStructure,
          allRecordsHaveId,
          allRecordsHaveCreatedAt,
        ].filter(Boolean).length / 3;

        verificationResults[tableName] = {
          status: integrityScore >= 0.9 ? 'passed' : 'warning',
          total_records: totalCount || 0,
          sampled_records: sampleRecords?.length || 0,
          integrity_score: integrityScore,
          checks: {
            valid_structure: hasValidStructure,
            all_have_ids: allRecordsHaveId,
            all_have_timestamps: allRecordsHaveCreatedAt,
          },
        };

        tablesVerified++;
        recordsVerified += sampleRecords?.length || 0;
        
        if (integrityScore >= 0.9) {
          checksPassedCount++;
        } else {
          checksFailedCount++;
        }

        console.log(`✅ ${tableName}: ${totalCount} records, integrity ${(integrityScore * 100).toFixed(1)}%`);
      } catch (error: any) {
        console.error(`❌ Error verifying ${tableName}:`, error);
        verificationResults[tableName] = {
          status: 'error',
          error: error.message,
        };
        checksFailedCount++;
      }
    }

    // Calculate overall status
    const overallStatus = checksFailedCount === 0 ? 'success' : 
                         checksPassedCount > checksFailedCount ? 'success' : 'failed';

    // Update verification record
    await supabase
      .from('backup_verifications')
      .update({
        verification_status: overallStatus,
        completed_at: new Date().toISOString(),
        tables_verified: tablesVerified,
        records_verified: recordsVerified,
        integrity_checks_passed: checksPassedCount,
        integrity_checks_failed: checksFailedCount,
        verification_results: verificationResults,
      })
      .eq('id', verification.id);

    // Create admin alert if verification failed
    if (overallStatus === 'failed') {
      await supabase.from('admin_alerts').insert({
        alert_type: 'backup_verification',
        severity: 'high',
        title: 'Backup Verification Failed',
        message: `Backup ${backup.backup_id} failed integrity verification`,
        context: {
          backup_id,
          verification_id: verification.id,
          checks_failed: checksFailedCount,
          checks_passed: checksPassedCount,
        },
      });
    }

    console.log(`✅ Backup verification completed: ${overallStatus}`);
    console.log(`📊 Summary: ${checksPassedCount} passed, ${checksFailedCount} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        verification_id: verification.id,
        status: overallStatus,
        summary: {
          tables_verified: tablesVerified,
          records_verified: recordsVerified,
          checks_passed: checksPassedCount,
          checks_failed: checksFailedCount,
        },
        results: verificationResults,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error in backup verification:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
