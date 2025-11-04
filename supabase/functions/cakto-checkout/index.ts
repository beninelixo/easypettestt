import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CheckoutRequest {
  plan: 'profissional' | 'enterprise';
  petshop_id: string;
}

const PLAN_PRICES = {
  profissional: 7900, // R$ 79,00 in cents
  enterprise: 19900, // R$ 199,00 in cents
};

const PLAN_NAMES = {
  profissional: 'Plano Profissional',
  enterprise: 'Plano Enterprise',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { plan, petshop_id }: CheckoutRequest = await req.json();

    if (!plan || !petshop_id) {
      throw new Error('Plan and petshop_id are required');
    }

    if (!['profissional', 'enterprise'].includes(plan)) {
      throw new Error('Invalid plan');
    }

    // Get pet shop details
    const { data: petShop, error: petShopError } = await supabaseClient
      .from('pet_shops')
      .select('*, profiles:owner_id(*)')
      .eq('id', petshop_id)
      .single();

    if (petShopError || !petShop) {
      throw new Error('Pet shop not found');
    }

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
          email: petShop.email || petShop.profiles?.email,
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
      await supabaseClient
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
