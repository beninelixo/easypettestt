import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[VERIFY-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }
    logStep("Stripe key verified");

    const { email } = await req.json();
    
    if (!email) {
      logStep("ERROR: No email provided");
      return new Response(
        JSON.stringify({ 
          error: "Email é obrigatório",
          canCreateProfessional: false 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    logStep("Checking subscription for email", { email });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    
    // Buscar customer pelo email
    const customers = await stripe.customers.list({ email, limit: 1 });
    
    if (customers.data.length === 0) {
      logStep("No customer found for email", { email });
      return new Response(
        JSON.stringify({ 
          canCreateProfessional: false,
          message: "Nenhum plano encontrado. É necessário adquirir o Plano Pet Gold ou Pet Platinum para criar uma conta profissional."
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    // Buscar subscriptions ativas
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 10,
    });

    if (subscriptions.data.length === 0) {
      logStep("No active subscriptions found", { customerId });
      return new Response(
        JSON.stringify({ 
          canCreateProfessional: false,
          message: "Nenhuma assinatura ativa encontrada. É necessário adquirir o Plano Pet Gold ou Pet Platinum para criar uma conta profissional."
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Verificar se alguma subscription é Gold ou Platinum
    let hasValidPlan = false;
    let planName = "";

    for (const subscription of subscriptions.data) {
      const productId = subscription.items.data[0].price.product as string;
      
      // Buscar detalhes do produto
      const product = await stripe.products.retrieve(productId);
      const productName = product.name.toLowerCase();
      
      logStep("Checking product", { productId, productName });

      // Verificar se é Pet Gold ou Pet Platinum
      if (productName.includes("gold") || productName.includes("platinum")) {
        hasValidPlan = true;
        planName = product.name;
        logStep("Valid plan found", { planName, subscriptionId: subscription.id });
        break;
      }
    }

    if (!hasValidPlan) {
      logStep("No valid plan found", { customerId });
      return new Response(
        JSON.stringify({ 
          canCreateProfessional: false,
          message: "Seu plano atual não permite criar conta profissional. É necessário o Plano Pet Gold ou Pet Platinum."
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    logStep("Valid subscription confirmed", { email, planName });

    return new Response(
      JSON.stringify({ 
        canCreateProfessional: true,
        planName,
        message: `Plano ${planName} confirmado! Você pode criar sua conta profissional.`
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in verify-subscription", { message: errorMessage });
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        canCreateProfessional: false 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
