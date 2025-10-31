import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

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
    const { email } = await req.json();
    console.log('Password reset requested for:', email);

    // Validate email
    if (!email || !email.includes('@')) {
      return new Response(
        JSON.stringify({ error: 'Email inválido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check if email exists in profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, full_name')
      .ilike('id', `%${email}%`)
      .maybeSingle();

    // Also check in auth.users
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
    const user = users?.find(u => u.email?.toLowerCase() === email.toLowerCase());

    if (!user) {
      console.log('Email not found in system');
      // Don't reveal if email exists or not for security
      return new Response(
        JSON.stringify({ success: true, message: 'Se o email existir, você receberá um código' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check rate limit - max 3 codes per hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { data: recentCodes, error: rateLimitError } = await supabase
      .from('password_resets')
      .select('id')
      .eq('email', email.toLowerCase())
      .gte('created_at', oneHourAgo);

    if (rateLimitError) {
      console.error('Rate limit check error:', rateLimitError);
    }

    if (recentCodes && recentCodes.length >= 3) {
      return new Response(
        JSON.stringify({ error: 'Limite de tentativas excedido. Tente novamente em 1 hora.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('Generated code:', code);

    // Delete old codes for this email
    await supabase
      .from('password_resets')
      .delete()
      .eq('email', email.toLowerCase());

    // Save code to database (expires in 10 minutes)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    const { error: insertError } = await supabase
      .from('password_resets')
      .insert({
        email: email.toLowerCase(),
        code: code,
        expires_at: expiresAt,
        used: false,
      });

    if (insertError) {
      console.error('Error saving code:', insertError);
      throw new Error('Erro ao salvar código');
    }

    // Send email via Resend
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      console.error('RESEND_API_KEY not configured');
      throw new Error('Serviço de email não configurado');
    }

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #0F766E 0%, #14B8A6 100%); padding: 40px 20px; text-align: center; }
            .header h1 { color: white; margin: 0; font-size: 28px; }
            .header .icon { font-size: 48px; margin-bottom: 10px; }
            .content { padding: 40px 30px; }
            .greeting { font-size: 18px; color: #333; margin-bottom: 20px; }
            .code-container { background: #F0FDFA; border: 2px solid #0F766E; border-radius: 8px; padding: 30px; margin: 30px 0; text-align: center; }
            .code { font-size: 42px; font-weight: bold; color: #0F766E; letter-spacing: 8px; font-family: 'Courier New', monospace; }
            .warning { background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 15px; margin: 20px 0; border-radius: 4px; }
            .warning-text { color: #92400E; margin: 0; font-size: 14px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; border-top: 1px solid #eee; }
            .paw { color: #F59E0B; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="icon">🔐</div>
              <h1>Recuperação de Senha</h1>
            </div>
            <div class="content">
              <p class="greeting">Olá! 👋</p>
              <p>Recebemos uma solicitação para redefinir sua senha no <strong>PetChopShop</strong>.</p>
              <p>Seu código de verificação é:</p>
              
              <div class="code-container">
                <div class="code">${code}</div>
              </div>
              
              <div class="warning">
                <p class="warning-text">⏱️ <strong>Atenção:</strong> Este código expira em <strong>10 minutos</strong>.</p>
              </div>
              
              <p>Se você não solicitou esta redefinição de senha, pode ignorar este email com segurança.</p>
            </div>
            <div class="footer">
              <p>Atenciosamente,<br><strong>Equipe PetChopShop</strong> <span class="paw">🐾</span></p>
            </div>
          </div>
        </body>
      </html>
    `;

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'PetChopShop <onboarding@resend.dev>',
        to: [email.toLowerCase()],
        subject: '🔐 Código de Verificação - PetChopShop 🐾',
        html: emailHtml,
      }),
    });

    const emailData = await emailResponse.json();

    if (!emailResponse.ok) {
      console.error('Resend API error:', emailData);
      
      // Handle specific Resend errors
      if (emailData.statusCode === 403 && emailData.message?.includes('testing emails')) {
        // Do not propagate 403 to client to avoid error overlays in frontend
        return new Response(
          JSON.stringify({ 
            success: true,
            testMode: true,
            message: 'Em modo de teste, só é possível enviar para o email cadastrado na conta Resend. Verifique um domínio em resend.com/domains para enviar para qualquer email.',
            details: emailData.message,
            devCode: code,
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(emailData.message || 'Erro ao enviar email');
    }

    console.log('Email sent successfully:', emailData);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Código enviado com sucesso! Verifique seu email.' 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in send-reset-code function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
