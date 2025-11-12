import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Validation schema
const checkoutSchema = z.object({
  plan: z.enum(['pet_gold', 'pet_platinum', 'pet_gold_anual', 'pet_platinum_anual'], {
    errorMap: () => ({ message: 'Invalid plan' })
  }),
  petshop_id: z.string().uuid('Invalid petshop ID'),
});

const PLAN_PRICES = {
  pet_gold: 7990, // R$ 79,90 in cents
  pet_platinum: 14990, // R$ 149,90 in cents
  pet_gold_anual: 79900, // R$ 799,00 in cents (10 meses pelo preço de 12)
  pet_platinum_anual: 149900, // R$ 1.499,00 in cents (10 meses pelo preço de 12)
};

const PLAN_NAMES = {
  pet_gold: 'Pet Gold Mensal',
  pet_platinum: 'Pet Platinum Mensal',
  pet_gold_anual: 'Pet Gold Anual',
  pet_platinum_anual: 'Pet Platinum Anual',
};

// Direct payment links from Cakto dashboard (already created offers)
const PLAN_CHECKOUT_URLS = {
  pet_gold: 'https://pay.cakto.com.br/f72gob9_634441',
  pet_platinum: 'https://pay.cakto.com.br/qym84js_634453',
  pet_gold_anual: 'https://pay.cakto.com.br/f72gob9_634441', // TODO: Replace with annual checkout URL
  pet_platinum_anual: 'https://pay.cakto.com.br/qym84js_634453', // TODO: Replace with annual checkout URL
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // 1. Extract and verify JWT token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('ERROR: No authorization header provided');
      return new Response(
        JSON.stringify({ error: 'Unauthorized - No token provided' }), 
        { status: 401, headers: corsHeaders }
      );
    }
    
    const token = authHeader.replace('Bearer ', '');
    console.log('Authorization token extracted');
    
    // 2. Create admin client for operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    // 3. Get authenticated user from JWT
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      console.error('ERROR: Authentication failed', { error: authError?.message });
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Invalid token' }), 
        { status: 401, headers: corsHeaders }
      );
    }
    
    console.log('User authenticated', { user_id: user.id, email: user.email });

    // Validate input with Zod
    const rawBody = await req.json();
    const validation = checkoutSchema.safeParse(rawBody);
    
    if (!validation.success) {
      console.error('Validation error:', validation.error);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid input data',
          details: validation.error.errors[0].message 
        }),
        { status: 400, headers: corsHeaders }
      );
    }

    const { plan, petshop_id } = validation.data;

    // 4. CRITICAL: Verify ownership before proceeding
    const { data: petShop, error: petShopError } = await supabaseAdmin
      .from('pet_shops')
      .select('*')
      .eq('id', petshop_id)
      .eq('owner_id', user.id)  // ← OWNERSHIP CHECK
      .single();

    if (petShopError || !petShop) {
      console.error('Pet shop access denied', { 
        error: petShopError, 
        user_id: user.id, 
        petshop_id 
      });
      return new Response(
        JSON.stringify({ 
          error: 'Pet shop not found or you do not have permission to manage it' 
        }), 
        { status: 403, headers: corsHeaders }
      );
    }
    
    // 5. Add audit logging
    await supabaseAdmin.from('audit_logs').insert({
      user_id: user.id,
      table_name: 'pet_shops',
      operation: 'PAYMENT_CHECKOUT_CREATED',
      record_id: petshop_id,
      new_data: { plan, checkout_initiated_at: new Date().toISOString() }
    });

    // SIMPLIFIED APPROACH: Use pre-created checkout links with custom metadata
    // The links already exist in Cakto dashboard, we just need to track the upgrade
    const checkoutUrl = PLAN_CHECKOUT_URLS[plan];
    
    if (!checkoutUrl) {
      throw new Error('Checkout link not found for plan');
    }

    // Add success and cancel URLs as query parameters
    const successUrl = `${req.headers.get('origin')}/professional/payment-success?plan=${plan}&petshop_id=${petshop_id}`;
    const cancelUrl = `${req.headers.get('origin')}/professional/plans?cancelled=true`;
    
    // Build final URL with metadata
    const finalCheckoutUrl = `${checkoutUrl}?success_url=${encodeURIComponent(successUrl)}&cancel_url=${encodeURIComponent(cancelUrl)}&metadata[petshop_id]=${petshop_id}&metadata[user_id]=${user.id}`;

    console.log('Checkout URL prepared:', {
      petshop_id,
      plan,
      checkout_url: checkoutUrl,
    });

    return new Response(
      JSON.stringify({
        checkout_url: finalCheckoutUrl,
        plan_name: PLAN_NAMES[plan],
        plan_price: PLAN_PRICES[plan],
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in cakto-checkout:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
