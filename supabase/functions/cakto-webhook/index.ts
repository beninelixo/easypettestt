import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-cakto-signature',
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

    // Verify webhook signature
    const signature = req.headers.get('x-cakto-signature');
    const webhookSecret = Deno.env.get('CAKTO_WEBHOOK_SECRET');
    
    if (!webhookSecret) {
      console.error('CAKTO_WEBHOOK_SECRET not configured');
      throw new Error('Webhook secret not configured');
    }

    const body = await req.text();
    
    // Verify signature (simplified - adjust based on Cakto's signature method)
    if (signature !== webhookSecret && signature) {
      console.error('Invalid webhook signature');
      throw new Error('Invalid signature');
    }

    const event = JSON.parse(body);
    console.log('Received webhook event:', event.type);

    const { type, data } = event;
    const { metadata } = data;

    if (!metadata?.petshop_id) {
      console.error('No petshop_id in metadata');
      throw new Error('Missing petshop_id in metadata');
    }

    const petshopId = metadata.petshop_id;
    const plan = metadata.plan;

    // Handle different event types
    switch (type) {
      case 'subscription.created':
      case 'subscription.payment_approved': {
        console.log(`Processing subscription activation for ${petshopId}`);
        
        // Calculate expiration date (30 days from now)
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);

        // Update pet_shops table
        const { error: updateError } = await supabaseClient
          .from('pet_shops')
          .update({
            subscription_plan: plan,
            subscription_expires_at: expiresAt.toISOString(),
            cakto_subscription_id: data.id,
          })
          .eq('id', petshopId);

        if (updateError) {
          console.error('Error updating subscription:', updateError);
          throw updateError;
        }

        // Get pet shop and owner info for notification
        const { data: petShop } = await supabaseClient
          .from('pet_shops')
          .select('name, owner_id, profiles:owner_id(full_name, email)')
          .eq('id', petshopId)
          .single();

        if (petShop) {
          // Create notification for the owner
          await supabaseClient.from('notifications').insert({
            client_id: petShop.owner_id,
            notification_type: 'sistema',
            channel: 'email',
            message: `🎉 Seu plano ${plan.toUpperCase()} foi ativado com sucesso! Aproveite todos os novos recursos.`,
            status: 'pendente',
          });
        }

        console.log(`Subscription activated successfully for ${petshopId}`);
        break;
      }

      case 'subscription.payment_failed': {
        console.log(`Payment failed for ${petshopId}`);
        
        // Get pet shop info
        const { data: petShop } = await supabaseClient
          .from('pet_shops')
          .select('owner_id')
          .eq('id', petshopId)
          .single();

        if (petShop) {
          // Notify owner about payment failure
          await supabaseClient.from('notifications').insert({
            client_id: petShop.owner_id,
            notification_type: 'sistema',
            channel: 'email',
            message: '⚠️ Falha no pagamento da sua assinatura. Por favor, atualize sua forma de pagamento.',
            status: 'pendente',
          });
        }

        console.log(`Payment failure notification sent for ${petshopId}`);
        break;
      }

      case 'subscription.cancelled':
      case 'subscription.expired': {
        console.log(`Subscription ${type} for ${petshopId}`);
        
        // Downgrade to free plan
        const { error: updateError } = await supabaseClient
          .from('pet_shops')
          .update({
            subscription_plan: 'gratuito',
            subscription_expires_at: null,
          })
          .eq('id', petshopId);

        if (updateError) {
          console.error('Error downgrading subscription:', updateError);
          throw updateError;
        }

        // Get pet shop info
        const { data: petShop } = await supabaseClient
          .from('pet_shops')
          .select('owner_id')
          .eq('id', petshopId)
          .single();

        if (petShop) {
          // Notify owner
          await supabaseClient.from('notifications').insert({
            client_id: petShop.owner_id,
            notification_type: 'sistema',
            channel: 'email',
            message: 'ℹ️ Sua assinatura foi cancelada. Você foi movido para o plano gratuito.',
            status: 'pendente',
          });
        }

        console.log(`Subscription downgraded to free for ${petshopId}`);
        break;
      }

      default:
        console.log(`Unhandled event type: ${type}`);
    }

    // Log the webhook event
    await supabaseClient.from('system_logs').insert({
      module: 'cakto_webhook',
      log_type: 'info',
      message: `Webhook event processed: ${type}`,
      details: {
        event_type: type,
        petshop_id: petshopId,
        plan,
        subscription_id: data.id,
      },
    });

    return new Response(
      JSON.stringify({ received: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in cakto-webhook:', error);
    
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
