import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RecordAttemptRequest {
  email: string;
  success: boolean;
  ip_address?: string;
  user_agent?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { email, success, ip_address, user_agent }: RecordAttemptRequest = await req.json();

    if (!email || success === undefined) {
      return new Response(
        JSON.stringify({ error: 'Email and success status are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Record the login attempt
    const { error: insertError } = await supabase
      .from('login_attempts')
      .insert({
        email: email.toLowerCase(),
        success,
        ip_address,
        user_agent,
        attempt_time: new Date().toISOString()
      });

    if (insertError) {
      console.error('Error recording attempt:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to record attempt' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If successful, clear old failed attempts for this email
    if (success) {
      await supabase
        .from('login_attempts')
        .delete()
        .eq('email', email.toLowerCase())
        .eq('success', false);
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Attempt recorded' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Record attempt error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
