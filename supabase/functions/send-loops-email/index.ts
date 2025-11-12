import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const LOOPS_API_KEY = Deno.env.get('LOOPS_API_KEY');
const LOOPS_API_URL = 'https://app.loops.so/api/v1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LoopsEmailRequest {
  transactionalId?: string;
  email: string;
  dataVariables?: Record<string, any>;
  addToAudience?: boolean;
}

interface LoopsContactRequest {
  email: string;
  firstName?: string;
  lastName?: string;
  userGroup?: string;
  subscribed?: boolean;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate input with Zod
    const requestSchema = z.object({
      action: z.enum(['send_transactional', 'create_contact', 'update_contact', 'delete_contact', 'send_event']),
      email: z.string().email().optional(),
      transactionalId: z.string().optional(),
      dataVariables: z.record(z.any()).optional(),
      addToAudience: z.boolean().optional(),
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      userGroup: z.string().optional(),
      subscribed: z.boolean().optional(),
      eventName: z.string().optional(),
      eventProperties: z.record(z.any()).optional()
    });

    const rawBody = await req.json();
    const validation = requestSchema.safeParse(rawBody);
    
    if (!validation.success) {
      console.error('Validation error:', validation.error);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: validation.error.errors[0].message 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { action, ...payload } = validation.data;

    if (!LOOPS_API_KEY) {
      throw new Error('LOOPS_API_KEY not configured');
    }

    let response;
    const headers = {
      'Authorization': `Bearer ${LOOPS_API_KEY}`,
      'Content-Type': 'application/json',
    };

    switch (action) {
      case 'send_transactional':
        // Send transactional email
        response = await fetch(`${LOOPS_API_URL}/transactional`, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload as LoopsEmailRequest),
        });
        break;

      case 'create_contact':
        // Create or update contact
        response = await fetch(`${LOOPS_API_URL}/contacts/create`, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload as LoopsContactRequest),
        });
        break;

      case 'update_contact':
        // Update contact
        response = await fetch(`${LOOPS_API_URL}/contacts/update`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(payload as LoopsContactRequest),
        });
        break;

      case 'send_event':
        // Send custom event for automation triggers
        response = await fetch(`${LOOPS_API_URL}/events/send`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            email: payload.email,
            eventName: payload.eventName,
            eventProperties: payload.eventProperties || {},
          }),
        });
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    const data = await response.json();

    if (!response.ok) {
      console.error('Loops API error:', data);
      throw new Error(data.message || 'Loops API request failed');
    }

    console.log('Loops action completed:', action, data);

    return new Response(
      JSON.stringify({ success: true, data }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
    console.error('Error in send-loops-email function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
