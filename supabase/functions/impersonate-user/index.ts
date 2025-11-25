import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Validation schema
const impersonateSchema = z.object({
  targetUserId: z.string().uuid('ID de usuário inválido'),
  reason: z.string().min(5, 'Motivo deve ter no mínimo 5 caracteres').max(500, 'Motivo muito longo').optional()
});

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verificar autenticação
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing Authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user: adminUser }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !adminUser) {
      throw new Error('Unauthorized');
    }

    // Verificar se é admin ou god user
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', adminUser.id)
      .single();

    const isAdmin = roleData?.role === 'admin' || roleData?.role === 'super_admin' || adminUser.email === 'beninelixo@gmail.com';
    
    if (!isAdmin) {
      throw new Error('Permission denied: Admin access required');
    }

    // Validate input with Zod
    const rawBody = await req.json();
    const validation = impersonateSchema.safeParse(rawBody);
    
    if (!validation.success) {
      console.error('Validation error:', validation.error);
      return new Response(
        JSON.stringify({ 
          error: 'Dados inválidos',
          details: validation.error.errors.map((e: any) => e.message).join(', ')
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { targetUserId, reason } = validation.data;

    if (!targetUserId) {
      throw new Error('Missing targetUserId');
    }

    // Não permitir impersonar a si mesmo
    if (targetUserId === adminUser.id) {
      throw new Error('Cannot impersonate yourself');
    }

    // Buscar dados do usuário alvo
    const { data: targetUser, error: targetError } = await supabase.auth.admin.getUserById(targetUserId);
    
    if (targetError || !targetUser) {
      throw new Error('Target user not found');
    }

    // Criar sessão de impersonação
    const { data: impSession, error: impError } = await supabase
      .from('impersonation_sessions')
      .insert({
        admin_user_id: adminUser.id,
        target_user_id: targetUserId,
        ip_address: req.headers.get('x-forwarded-for') || 'unknown',
        user_agent: req.headers.get('user-agent') || 'unknown',
        reason: reason || 'Suporte técnico'
      })
      .select()
      .single();

    if (impError) throw impError;

    // Gerar token de acesso para o usuário alvo
    if (!targetUser.user.email) {
      throw new Error('Target user has no email');
    }

    const { data: sessionData, error: sessionError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: targetUser.user.email,
    });

    if (sessionError) throw sessionError;

    // Registrar em audit logs
    await supabase.from('audit_logs').insert({
      user_id: adminUser.id,
      table_name: 'impersonation_sessions',
      operation: 'IMPERSONATE',
      record_id: targetUserId,
      new_data: { 
        admin_email: adminUser.email,
        target_email: targetUser.user.email,
        session_id: impSession.id
      }
    });

    // Criar alerta de segurança
    await supabase.from('admin_alerts').insert({
      alert_type: 'user_impersonation',
      severity: 'high',
      title: 'Impersonação Iniciada',
      message: `Admin ${adminUser.email} está impersonando ${targetUser.user.email}`,
      context: {
        admin_id: adminUser.id,
        target_id: targetUserId,
        session_id: impSession.id,
        reason
      }
    });

    console.log(`✅ Impersonation started: ${adminUser.email} -> ${targetUser.user.email}`);

    return new Response(
      JSON.stringify({
        success: true,
        session_id: impSession.id,
        target_user: {
          id: targetUser.user.id,
          email: targetUser.user.email,
          full_name: targetUser.user.user_metadata?.full_name
        },
        magic_link: sessionData.properties.action_link
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Error creating impersonation:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});