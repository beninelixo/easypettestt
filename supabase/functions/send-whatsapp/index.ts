import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// IMPORTANT: Configure this with your WhatsApp Business Phone Number ID
// Get it from: https://business.facebook.com/settings/whatsapp-business-accounts
const WHATSAPP_PHONE_NUMBER_ID = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID') || 'YOUR_PHONE_NUMBER_ID';

// Validation schema
const whatsappMessageSchema = z.object({
  to: z.string()
    .regex(/^\+?[1-9]\d{10,14}$/, 'Invalid phone number. Use format: +5521959262880')
    .transform(val => val.replace(/\D/g, '')), // Remove non-digits
  template_name: z.string()
    .min(1, 'Template name required')
    .max(100, 'Template name too long'),
  template_language: z.string()
    .regex(/^[a-z]{2}_[A-Z]{2}$/, 'Invalid language code. Use format: pt_BR')
    .default('pt_BR'),
  parameters: z.array(
    z.object({
      type: z.enum(['text', 'currency', 'date_time']),
      text: z.string().optional(),
    })
  ).optional(),
});

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('WHATSAPP_API_KEY');
    if (!apiKey) {
      throw new Error('WHATSAPP_API_KEY not configured');
    }

    // Validate input with Zod
    const rawBody = await req.json();
    const validation = whatsappMessageSchema.safeParse(rawBody);
    
    if (!validation.success) {
      console.error('Validation error:', validation.error);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Invalid input data',
          details: validation.error.errors[0].message 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { to, template_name, template_language, parameters } = validation.data;
    const phoneNumber = to || '';

    console.log(`📱 Sending WhatsApp to: ${phoneNumber.substring(0, 4)}****`);

    // WhatsApp Business Cloud API
    const whatsappUrl = `https://graph.facebook.com/v18.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`;
    
    const messagePayload: any = {
      messaging_product: 'whatsapp',
      to: phoneNumber,
      type: 'template',
      template: {
        name: template_name,
        language: { code: template_language },
      }
    };

    // Add parameters if provided
    if (parameters && parameters.length > 0) {
      messagePayload.template.components = [
        {
          type: 'body',
          parameters: parameters,
        }
      ];
    }

    const response = await fetch(whatsappUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messagePayload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('WhatsApp API error:', errorData);
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to send WhatsApp message',
          details: errorData 
        }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const responseData = await response.json();
    console.log('✅ WhatsApp sent successfully:', responseData);

    // Log to database for tracking
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    await supabase.from('system_logs').insert({
      module: 'whatsapp',
      log_type: 'success',
      message: `WhatsApp sent to ${phoneNumber.substring(0, 4)}****`,
      details: {
        template: template_name,
        message_id: responseData.messages?.[0]?.id,
      }
    });

    return new Response(
      JSON.stringify({ 
        success: true,
        message_id: responseData.messages?.[0]?.id 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error sending WhatsApp:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
