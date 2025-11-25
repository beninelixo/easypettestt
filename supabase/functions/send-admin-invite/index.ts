import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Validation schema
const inviteSchema = z.object({
  email: z.string().email('Email inválido').max(255, 'Email muito longo').toLowerCase().trim()
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const loopsApiKey = Deno.env.get("LOOPS_API_KEY")!;

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Authorization header required");
    }

    const token = authHeader.replace("Bearer ", "");
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify admin user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    // Check if user is admin
    const { data: roleData, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (roleError || roleData?.role !== "admin") {
      throw new Error("Only admins can send invites");
    }

    // Validate input
    const rawBody = await req.json();
    const validation = inviteSchema.safeParse(rawBody);
    
    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: validation.error.errors[0].message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { email } = validation.data;

    // Check if user already has admin role
    const { data: existingUser } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", (await supabase.rpc("get_user_id_by_email", { email_input: email })))
      .single();

    if (existingUser) {
      const { data: existingRole } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", existingUser.id)
        .single();

      if (existingRole?.role === "admin") {
        throw new Error("User is already an admin");
      }
    }

    // Generate unique token
    const token_value = crypto.randomUUID();

    // Create invite
    const { data: invite, error: inviteError } = await supabase
      .from("admin_invites")
      .insert({
        email,
        invited_by: user.id,
        token: token_value,
      })
      .select()
      .single();

    if (inviteError) {
      throw inviteError;
    }

    // Send email via Loops.so
    const inviteUrl = `${req.headers.get("origin")}/admin/accept-invite?token=${token_value}`;

    const loopsResponse = await fetch("https://app.loops.so/api/v1/transactional", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${loopsApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        transactionalId: "admin-invite",
        email: email,
        dataVariables: {
          inviteUrl: inviteUrl,
          expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString("pt-BR"),
        },
      }),
    });

    if (!loopsResponse.ok) {
      const errorText = await loopsResponse.text();
      console.error("Loops API error:", errorText);
      throw new Error(`Failed to send email via Loops: ${errorText}`);
    }

    console.log("Admin invite sent successfully:", { email, token: token_value });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Convite enviado com sucesso",
        invite_id: invite.id,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error sending admin invite:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});