import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get auth token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    console.log('Activating free plan for user:', user.id);

    // Get pet shop
    const { data: petShop, error: petShopError } = await supabase
      .from('pet_shops')
      .select('id, owner_id, subscription_plan')
      .eq('owner_id', user.id)
      .single();

    if (petShopError || !petShop) {
      throw new Error('Pet shop não encontrado');
    }

    // Check if already has an active plan
    if (petShop.subscription_plan && petShop.subscription_plan !== 'gratuito') {
      throw new Error('Você já possui um plano ativo');
    }

    // Calculate expiration date (30 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    // Update pet shop with free plan
    const { error: updateError } = await supabase
      .from('pet_shops')
      .update({
        subscription_plan: 'gratuito',
        subscription_expires_at: expiresAt.toISOString(),
      })
      .eq('id', petShop.id);

    if (updateError) {
      throw updateError;
    }

    // Log the action in audit_logs
    await supabase
      .from('audit_logs')
      .insert({
        user_id: user.id,
        table_name: 'pet_shops',
        operation: 'UPDATE',
        record_id: petShop.id,
        new_data: {
          subscription_plan: 'gratuito',
          subscription_expires_at: expiresAt.toISOString(),
        },
      });

    console.log('Free plan activated successfully for pet shop:', petShop.id);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Plano gratuito ativado com sucesso!',
        expires_at: expiresAt.toISOString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error activating free plan:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Erro ao ativar plano gratuito',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
