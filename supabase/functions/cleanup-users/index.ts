import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    console.log('🧹 Starting user cleanup...');

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
    
    console.log(`Found ${usersToDelete.length} users to delete`);

    const results = {
      total: usersToDelete.length,
      deleted: 0,
      failed: 0,
      errors: [] as string[],
    };

    // Delete each user
    for (const userToDelete of usersToDelete) {
      try {
        const { error: deleteError } = await supabase.auth.admin.deleteUser(userToDelete.id);
        
        if (deleteError) {
          console.error(`Failed to delete user ${userToDelete.email}:`, deleteError);
          results.failed++;
          results.errors.push(`${userToDelete.email}: ${deleteError.message}`);
        } else {
          console.log(`✅ Deleted user: ${userToDelete.email}`);
          results.deleted++;
        }
      } catch (err) {
        console.error(`Error deleting user ${userToDelete.email}:`, err);
        results.failed++;
        results.errors.push(`${userToDelete.email}: ${err instanceof Error ? err.message : 'Unknown error'}`);
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
        results,
        timestamp: new Date().toISOString(),
      },
    });

    console.log('🎉 User cleanup completed:', results);

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
