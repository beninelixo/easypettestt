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
        .regex(/[a-z]/, 'Deve conter pelo menos uma letra minúscula')
        .regex(/[A-Z]/, 'Deve conter pelo menos uma letra maiúscula')
        .regex(/[0-9]/, 'Deve conter pelo menos um número')
    });

    const body = await req.json();
    const validation = requestSchema.safeParse(body);
    
    if (!validation.success) {
      console.error('Validation error:', validation.error.issues);
      return new Response(
        JSON.stringify({ 
          error: `⚠️ ${validation.error.issues[0].message}`,
          code: 'validation_error'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { email, code, newPassword } = validation.data;
    console.log('Password reset attempt received', { email, codeLength: code.length });

    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check codes exist (no sensitive data logged)
    const { data: allCodes } = await supabase
      .from('password_resets')
      .select('id, expires_at, used')
      .eq('email', email.toLowerCase().trim());
    
    console.log('Codes found for email:', allCodes?.length || 0);

    // Verify code from database with detailed logging
    const { data: resetData, error: queryError } = await supabase
      .from('password_resets')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .eq('code', code.trim())
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();
    
    console.log('Code validation result:', queryError ? 'error' : (resetData ? 'valid' : 'invalid'));
    
    // Enhanced logging for debugging
    if (!resetData && !queryError) {
      console.log('Code validation failed - Details:', {
        emailMatch: allCodes?.some(c => !c.used),
        hasUnusedCodes: allCodes?.filter(c => !c.used).length,
        codeProvided: code.substring(0, 2) + '****'
      });
    }

    if (queryError) {
      console.error('Query error:', queryError);
      return new Response(
        JSON.stringify({ error: 'Erro ao verificar código' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!resetData) {
      return new Response(
        JSON.stringify({ 
          error: '❌ Código de verificação inválido ou expirado. Por favor, solicite um novo código.',
          code: 'invalid_code'
        }),
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
        JSON.stringify({ 
          error: '❌ Usuário não encontrado. Verifique se o email está correto.',
          code: 'user_not_found'
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update password using admin API FIRST
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      { password: newPassword }
    );

    if (updateError) {
      console.error('Error updating password:', updateError);
      
      // Handle specific password error types with clear user-friendly messages
      if (updateError.code === 'weak_password') {
        const reasons = (updateError as any).reasons || [];
        
        // Check if password is in a compromised database
        if (reasons.includes('pwned')) {
          return new Response(
            JSON.stringify({ 
              error: '🚨 Esta senha foi encontrada em vazamentos de dados e não é segura. Por favor, escolha uma senha completamente diferente que você nunca usou antes.',
              code: 'password_compromised'
            }),
            { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        // Generic weak password
        return new Response(
          JSON.stringify({ 
            error: '⚠️ Senha muito fraca. Use pelo menos 8 caracteres com letras maiúsculas, minúsculas, números e símbolos especiais (@, #, $, etc.).',
            code: 'weak_password'
          }),
          { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Other auth errors
      if (updateError.message) {
        return new Response(
          JSON.stringify({ 
            error: `Erro ao atualizar senha: ${updateError.message}`,
            code: 'auth_error'
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ 
          error: 'Erro ao atualizar senha. Tente novamente ou entre em contato com o suporte.',
          code: 'unknown_error'
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Only mark code as used AFTER password is successfully updated
    const { error: updateCodeError } = await supabase
      .from('password_resets')
      .update({ used: true })
      .eq('id', resetData.id);

    if (updateCodeError) {
      console.error('Error marking code as used:', updateCodeError);
    }

    console.log('Password reset completed successfully');
    
    // Log successful password reset to structured logs
    await supabase.from('structured_logs').insert({
      level: 'info',
      module: 'password_reset',
      message: 'Password reset successful',
      context: { 
        email: email.substring(0, 3) + '***',
        userId: user.id
      }
    });

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
