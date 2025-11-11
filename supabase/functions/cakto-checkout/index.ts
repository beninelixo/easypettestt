import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CheckoutRequest {
  plan: 'pet_gold' | 'pet_platinum';
  petshop_id: string;
}

const PLAN_PRICES = {
  pet_gold: 7990, // R$ 79,90 in cents
  pet_platinum: 14990, // R$ 149,90 in cents
};

const PLAN_NAMES = {
  pet_gold: 'Pet Gold',
  pet_platinum: 'Pet Platinum',
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

    const { plan, petshop_id }: CheckoutRequest = await req.json();

    if (!plan || !petshop_id) {
      throw new Error('Plan and petshop_id are required');
    }

    if (!['pet_gold', 'pet_platinum'].includes(plan)) {
      throw new Error('Invalid plan');
    }

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

    const caktoApiKey = Deno.env.get('CAKTO_API_KEY');
    if (!caktoApiKey) {
      throw new Error('CAKTO_API_KEY not configured');
    }

    // Create or get customer in Cakto
    let caktoCustomerId = petShop.cakto_customer_id;
    
    if (!caktoCustomerId) {
      const customerResponse = await fetch('https://api.cakto.com.br/v1/customers', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${caktoApiKey}`,
          'Content-Type': 'application/json',
        },
      body: JSON.stringify({
        name: petShop.name,
        email: petShop.email || user.email,
        phone: petShop.phone,
        document: petShop.cnpj || '',
      }),
      });

      if (!customerResponse.ok) {
        const errorText = await customerResponse.text();
        console.error('Error creating customer:', errorText);
        throw new Error('Failed to create customer in Cakto');
      }

      const customerData = await customerResponse.json();
      caktoCustomerId = customerData.id;

      // Update pet_shops with cakto_customer_id
      await supabaseAdmin
        .from('pet_shops')
        .update({ cakto_customer_id: caktoCustomerId })
        .eq('id', petshop_id);
    }

    // Create subscription checkout
    const checkoutResponse = await fetch('https://api.cakto.com.br/v1/checkout/subscription', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${caktoApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customer_id: caktoCustomerId,
        plan_name: PLAN_NAMES[plan],
        amount: PLAN_PRICES[plan],
        interval: 'monthly',
        success_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/cakto-success?petshop_id=${petshop_id}&plan=${plan}`,
        cancel_url: `${req.headers.get('origin')}/professional/plans?cancelled=true`,
        metadata: {
          petshop_id,
          plan,
        },
      }),
    });

    if (!checkoutResponse.ok) {
      const errorText = await checkoutResponse.text();
      console.error('Error creating checkout:', errorText);
      throw new Error('Failed to create checkout in Cakto');
    }

    const checkoutData = await checkoutResponse.json();

    console.log('Checkout created successfully:', {
      petshop_id,
      plan,
      checkout_id: checkoutData.id,
    });

    return new Response(
      JSON.stringify({
        checkout_url: checkoutData.checkout_url,
        checkout_id: checkoutData.id,
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
