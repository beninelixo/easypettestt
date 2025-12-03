import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';
import { TOTP } from 'https://deno.land/x/god_crypto@v1.4.11/mod.ts';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SETUP-MFA] ${step}${detailsStr}`);
};

// Base32 encoder simples
function base32Encode(buffer: Uint8Array): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = 0;
  let value = 0;
  let output = '';

  for (let i = 0; i < buffer.length; i++) {
    value = (value << 8) | buffer[i];
    bits += 8;

    while (bits >= 5) {
      output += alphabet[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) {
    output += alphabet[(value << (5 - bits)) & 31];
  }

  return output;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation schema - setup-mfa doesn't require body input
const requestSchema = z.object({}).optional();

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verificar autenticação
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Não autenticado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Gerar secret TOTP
    const secret = new Uint8Array(20);
    crypto.getRandomValues(secret);
    const base32Secret = base32Encode(secret);

    // Gerar URL do QR code (formato otpauth://)
    const qrCodeUrl = `otpauth://totp/EasyPet:${encodeURIComponent(user.email || 'Usuario')}?secret=${base32Secret}&issuer=EasyPet&algorithm=SHA1&digits=6&period=30`;

    // Gerar códigos de backup (10 códigos de 8 caracteres)
    const backupCodes: string[] = [];
    for (let i = 0; i < 10; i++) {
      const code = Array.from({ length: 8 }, () => 
        'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 32)]
      ).join('');
      backupCodes.push(code);
    }

    // Salvar secret no banco (ainda não ativado)
    const { error: insertError } = await supabase
      .from('mfa_secrets')
      .upsert({
        user_id: user.id,
        secret_key: base32Secret, // Em produção, criptografar com MFA_ENCRYPTION_KEY
        enabled: false,
        backup_codes_generated: true,
      });

    if (insertError) throw insertError;

    // Fazer hash dos códigos de backup e salvar
    for (const code of backupCodes) {
      // Em produção, usar bcrypt para hash
      const codeHash = btoa(code); // Simplificado para demo
      await supabase.from('mfa_backup_codes').insert({
        user_id: user.id,
        code_hash: codeHash,
        used: false,
      });
    }

    // Log da ação
    await supabase.from('system_logs').insert({
      module: 'mfa',
      log_type: 'info',
      message: 'MFA setup iniciado',
      details: { user_id: user.id, email: user.email }
    });

    return new Response(
      JSON.stringify({
        success: true,
        secret: base32Secret,
        qr_code_url: qrCodeUrl,
        backup_codes: backupCodes,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro ao configurar MFA:', error);
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    
    return new Response(
      JSON.stringify({ success: false, error: 'Erro ao configurar MFA', details: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
