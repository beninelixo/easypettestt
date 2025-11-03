import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

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
    // Validate input with Zod schema
    const requestSchema = z.object({
      email: z.string()
        .email('Formato de email inválido')
        .max(255, 'Email muito longo')
        .toLowerCase()
        .trim(),
      code: z.string()
        .regex(/^\d{6}$/, 'Código deve ter exatamente 6 dígitos'),
      newPassword: z.string()
        .min(8, 'A senha deve ter pelo menos 8 caracteres')
        .max(128, 'Senha muito longa')
        .regex(/[A-Z]/, 'A senha deve conter pelo menos uma letra maiúscula')
        .regex(/[a-z]/, 'A senha deve conter pelo menos uma letra minúscula')
        .regex(/[0-9]/, 'A senha deve conter pelo menos um número')
    });

    const body = await req.json();
    const validation = requestSchema.safeParse(body);
    
    if (!validation.success) {
      console.error('Validation error:', validation.error.issues);
      return new Response(
        JSON.stringify({ error: validation.error.issues[0].message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { email, code, newPassword } = validation.data;
    console.log('Password reset attempt received');

    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify code from database
    const { data: resetData, error: queryError } = await supabase
      .from('password_resets')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .eq('code', code)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();

    if (queryError) {
      console.error('Query error:', queryError);
      return new Response(
        JSON.stringify({ error: 'Erro ao verificar código' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!resetData) {
      return new Response(
        JSON.stringify({ error: 'Código inválido ou expirado' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user by email
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('Error listing users:', listError);
      return new Response(
        JSON.stringify({ error: 'Erro ao buscar usuário' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const user = users?.find(u => u.email?.toLowerCase() === email.toLowerCase());
    
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Usuário não encontrado' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Mark code as used
    const { error: updateCodeError } = await supabase
      .from('password_resets')
      .update({ used: true })
      .eq('id', resetData.id);

    if (updateCodeError) {
      console.error('Error marking code as used:', updateCodeError);
    }

    // Update password using admin API
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      { password: newPassword }
    );

    if (updateError) {
      console.error('Error updating password:', updateError);
      
      // Handle specific error types
      if (updateError.code === 'weak_password') {
        return new Response(
          JSON.stringify({ 
            error: 'Senha muito fraca. Por favor, escolha uma senha mais forte e diferente.' 
          }),
          { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'Erro ao atualizar senha' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Password reset completed successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Senha redefinida com sucesso!' 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in reset-password function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
