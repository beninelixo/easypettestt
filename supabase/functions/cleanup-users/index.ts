import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Tables that have user_id foreign key references
const USER_RELATED_TABLES = [
  'audit_logs',
  'structured_logs',
  'auth_events_log',
  'mfa_secrets',
  'mfa_sessions',
  'mfa_backup_codes',
  'admin_alerts',
  'access_audit',
  'login_attempts',
  'impersonation_sessions',
  'admin_notification_preferences',
  'admin_api_rate_limits',
  'user_roles',
  'profiles',
];

// Tables that need soft delete (have deleted_at column)
const SOFT_DELETE_TABLES = [
  { table: 'pets', column: 'owner_id' },
  { table: 'pet_shops', column: 'owner_id' },
  { table: 'appointments', column: 'client_id' },
];

async function cleanupRelatedData(supabase: any, userId: string): Promise<{ success: boolean; errors: string[] }> {
  const errors: string[] = [];
  
  console.log(`🧹 Cleaning up related data for user ${userId}...`);
  
  // First, cleanup direct user_id references
  for (const table of USER_RELATED_TABLES) {
    try {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('user_id', userId);
      
      if (error) {
        // Some tables may not have data for this user, which is fine
        if (!error.message.includes('does not exist')) {
          console.warn(`Warning cleaning ${table}: ${error.message}`);
        }
      } else {
        console.log(`  ✅ Cleaned ${table}`);
      }
    } catch (err) {
      console.warn(`  ⚠️ Could not clean ${table}: ${err}`);
    }
  }
  
  // Handle tables with different column names
  const additionalTables = [
    { table: 'admin_invites', column: 'invited_by' },
    { table: 'blocked_ips', column: 'blocked_by' },
    { table: 'ip_whitelist', column: 'added_by' },
    { table: 'compliance_audits', column: 'auditor_id' },
    { table: 'backup_verifications', column: 'verified_by' },
    { table: 'backup_history', column: 'triggered_by' },
  ];
  
  for (const { table, column } of additionalTables) {
    try {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq(column, userId);
      
      if (error && !error.message.includes('does not exist')) {
        console.warn(`Warning cleaning ${table}.${column}: ${error.message}`);
      }
    } catch (err) {
      // Ignore errors for optional tables
    }
  }
  
  // Soft delete for business data tables
  for (const { table, column } of SOFT_DELETE_TABLES) {
    try {
      const { error } = await supabase
        .from(table)
        .update({ deleted_at: new Date().toISOString() })
        .eq(column, userId)
        .is('deleted_at', null);
      
      if (error) {
        console.warn(`Warning soft-deleting ${table}: ${error.message}`);
      } else {
        console.log(`  ✅ Soft-deleted ${table}`);
      }
    } catch (err) {
      console.warn(`  ⚠️ Could not soft-delete ${table}: ${err}`);
    }
  }
  
  // Handle appointments where user is the client
  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('client_id', userId);
    
    if (!error) {
      console.log(`  ✅ Cleaned notifications`);
    }
  } catch (err) {
    // Ignore
  }
  
  // Handle loyalty_points
  try {
    const { error } = await supabase
      .from('loyalty_points')
      .delete()
      .eq('client_id', userId);
    
    if (!error) {
      console.log(`  ✅ Cleaned loyalty_points`);
    }
  } catch (err) {
    // Ignore
  }
  
  // Handle franchises owner
  try {
    const { error } = await supabase
      .from('franchises')
      .update({ deleted_at: new Date().toISOString() })
      .eq('owner_id', userId);
    
    if (!error) {
      console.log(`  ✅ Soft-deleted franchises`);
    }
  } catch (err) {
    // Ignore
  }
  
  return { success: errors.length === 0, errors };
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Verify caller is god user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user is god user
    if (user.email !== 'beninelixo@gmail.com') {
      return new Response(
        JSON.stringify({ error: 'Only god user can execute this function' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('🧹 Starting comprehensive user cleanup...');

    // Get all users except god user
    const { data: authData, error: listError } = await supabase.auth.admin.listUsers({
      perPage: 1000,
    });

    if (listError) {
      console.error('Error listing users:', listError);
      return new Response(
        JSON.stringify({ error: 'Failed to list users', details: listError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const godUserId = 'bb53e4e1-77b7-463a-878c-07f52784f6c7';
    const usersToDelete = authData.users.filter(u => u.id !== godUserId);
    
    console.log(`Found ${usersToDelete.length} users to delete (excluding God User)`);

    const results = {
      total: usersToDelete.length,
      deleted: 0,
      failed: 0,
      errors: [] as string[],
      cleanupDetails: [] as { email: string; status: string; details?: string }[],
    };

    // Delete each user with proper cleanup
    for (const userToDelete of usersToDelete) {
      try {
        console.log(`\n📧 Processing user: ${userToDelete.email}`);
        
        // Step 1: Clean up all related data first
        const cleanupResult = await cleanupRelatedData(supabase, userToDelete.id);
        
        if (!cleanupResult.success) {
          console.warn(`  ⚠️ Cleanup warnings for ${userToDelete.email}:`, cleanupResult.errors);
        }
        
        // Step 2: Delete the user from auth.users
        const { error: deleteError } = await supabase.auth.admin.deleteUser(userToDelete.id);
        
        if (deleteError) {
          console.error(`  ❌ Failed to delete user ${userToDelete.email}:`, deleteError);
          results.failed++;
          results.errors.push(`${userToDelete.email}: ${deleteError.message}`);
          results.cleanupDetails.push({
            email: userToDelete.email || 'unknown',
            status: 'failed',
            details: deleteError.message,
          });
        } else {
          console.log(`  ✅ Successfully deleted user: ${userToDelete.email}`);
          results.deleted++;
          results.cleanupDetails.push({
            email: userToDelete.email || 'unknown',
            status: 'deleted',
          });
        }
      } catch (err) {
        console.error(`  ❌ Error processing user ${userToDelete.email}:`, err);
        results.failed++;
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        results.errors.push(`${userToDelete.email}: ${errorMessage}`);
        results.cleanupDetails.push({
          email: userToDelete.email || 'unknown',
          status: 'error',
          details: errorMessage,
        });
      }
    }

    // Log action to audit_logs
    await supabase.from('audit_logs').insert({
      user_id: godUserId,
      table_name: 'auth.users',
      operation: 'BULK_DELETE',
      record_id: crypto.randomUUID(),
      new_data: {
        action: 'cleanup-users',
        results: {
          total: results.total,
          deleted: results.deleted,
          failed: results.failed,
        },
        timestamp: new Date().toISOString(),
      },
    });

    console.log('\n🎉 User cleanup completed!');
    console.log(`   Total: ${results.total}`);
    console.log(`   Deleted: ${results.deleted}`);
    console.log(`   Failed: ${results.failed}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Cleanup completed: ${results.deleted} deleted, ${results.failed} failed`,
        results,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Cleanup error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
