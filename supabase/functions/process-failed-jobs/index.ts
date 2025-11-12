import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('🔄 Starting failed jobs processor...');

    // Buscar jobs prontos para retry
    const { data: failedJobs, error: fetchError } = await supabase
      .from('failed_jobs')
      .select('*')
      .eq('status', 'pending')
      .lte('next_retry_at', new Date().toISOString())
      .lt('attempt_count', supabase.rpc('max_attempts'))
      .limit(10);

    if (fetchError) {
      console.error('Error fetching failed jobs:', fetchError);
      throw fetchError;
    }

    console.log(`📦 Found ${failedJobs?.length || 0} jobs to retry`);

    const results = {
      processed: 0,
      succeeded: 0,
      failed: 0,
      errors: [] as any[]
    };

    for (const job of failedJobs || []) {
      results.processed++;
      
      try {
        console.log(`🔧 Retrying job: ${job.job_name} (attempt ${job.attempt_count + 1}/${job.max_attempts})`);

        // Marcar como retrying
        await supabase
          .from('failed_jobs')
          .update({ 
            status: 'retrying',
            last_attempted_at: new Date().toISOString()
          })
          .eq('id', job.id);

        // Executar retry baseado no tipo de job
        let success = false;
        let errorMsg = '';

        switch (job.job_type) {
          case 'edge_function':
            success = await retryEdgeFunction(supabase, job);
            break;
          case 'email':
            success = await retryEmail(supabase, job);
            break;
          case 'notification':
            success = await retryNotification(supabase, job);
            break;
          case 'api_call':
            success = await retryApiCall(job);
            break;
          default:
            console.warn(`Unknown job type: ${job.job_type}`);
            success = false;
        }

        if (success) {
          // Job succeeded
          await supabase
            .from('failed_jobs')
            .update({
              status: 'succeeded',
              completed_at: new Date().toISOString()
            })
            .eq('id', job.id);
          
          results.succeeded++;
          console.log(`✅ Job ${job.job_name} succeeded`);
        } else {
          // Job failed again
          const newAttemptCount = job.attempt_count + 1;
          const hasMoreAttempts = newAttemptCount < job.max_attempts;

          if (hasMoreAttempts) {
            // Calculate next retry with exponential backoff
            const nextRetry = calculateNextRetry(newAttemptCount);
            
            await supabase
              .from('failed_jobs')
              .update({
                status: 'pending',
                attempt_count: newAttemptCount,
                next_retry_at: nextRetry.toISOString(),
                last_attempted_at: new Date().toISOString()
              })
              .eq('id', job.id);
            
            console.log(`⏱️ Job ${job.job_name} will retry at ${nextRetry.toISOString()}`);
          } else {
            // Max attempts reached
            await supabase
              .from('failed_jobs')
              .update({
                status: 'failed',
                attempt_count: newAttemptCount,
                completed_at: new Date().toISOString()
              })
              .eq('id', job.id);

            // Create critical alert
            await supabase.rpc('create_critical_alert', {
              p_title: `Job Failed After ${job.max_attempts} Attempts`,
              p_message: `Job ${job.job_name} (${job.job_type}) has permanently failed after ${job.max_attempts} retry attempts.`,
              p_alert_type: 'edge_function_failure',
              p_context: { job_id: job.id, job_name: job.job_name, job_type: job.job_type }
            });

            console.log(`❌ Job ${job.job_name} permanently failed after ${job.max_attempts} attempts`);
          }
          
          results.failed++;
        }
      } catch (error: any) {
        console.error(`Error processing job ${job.id}:`, error);
        results.errors.push({ job_id: job.id, error: error.message });
        
        // Mark job as failed and schedule next retry
        const newAttemptCount = job.attempt_count + 1;
        const nextRetry = calculateNextRetry(newAttemptCount);
        
        await supabase
          .from('failed_jobs')
          .update({
            status: 'pending',
            attempt_count: newAttemptCount,
            next_retry_at: nextRetry.toISOString(),
            error_message: error.message,
            error_stack: error.stack
          })
          .eq('id', job.id);
      }
    }

    console.log('✅ Failed jobs processor completed:', results);

    return new Response(
      JSON.stringify({ success: true, results }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('❌ Error in process-failed-jobs:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Exponential backoff calculation
function calculateNextRetry(attemptCount: number): Date {
  // 2^attempt * 60 seconds, max 1 hour
  const delayMs = Math.min(Math.pow(2, attemptCount) * 60 * 1000, 60 * 60 * 1000);
  return new Date(Date.now() + delayMs);
}

// Retry handlers for different job types
async function retryEdgeFunction(supabase: any, job: any): Promise<boolean> {
  try {
    const { error } = await supabase.functions.invoke(job.payload.function_name, {
      body: job.payload.body || {}
    });
    return !error;
  } catch {
    return false;
  }
}

async function retryEmail(supabase: any, job: any): Promise<boolean> {
  try {
    const { error } = await supabase.functions.invoke('send-notification', {
      body: job.payload
    });
    return !error;
  } catch {
    return false;
  }
}

async function retryNotification(supabase: any, job: any): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('notifications')
      .insert(job.payload);
    return !error;
  } catch {
    return false;
  }
}

async function retryApiCall(job: any): Promise<boolean> {
  try {
    const response = await fetch(job.payload.url, {
      method: job.payload.method || 'POST',
      headers: job.payload.headers || {},
      body: job.payload.body ? JSON.stringify(job.payload.body) : undefined
    });
    return response.ok;
  } catch {
    return false;
  }
}
