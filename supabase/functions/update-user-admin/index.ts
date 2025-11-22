import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    // Verificar se é admin
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', adminUser.id)
      .single();

    const isAdmin = roleData?.role === 'admin' || roleData?.role === 'super_admin' || adminUser.email === 'beninelixo@gmail.com';
    
    if (!isAdmin) {
      throw new Error('Permission denied: Admin access required');
    }

    // Obter dados do corpo da requisição
    const { userId, full_name, email, phone, role } = await req.json();

    if (!userId) {
      throw new Error('Missing userId');
    }

    // Não permitir alterar role do God User
    const { data: targetUser } = await supabase.auth.admin.getUserById(userId);
    if (targetUser?.user?.email === 'beninelixo@gmail.com' && role) {
      throw new Error('Cannot change God User role');
    }

    // Atualizar perfil
    const profileUpdates: any = {};
    if (full_name !== undefined) profileUpdates.full_name = full_name;
    if (phone !== undefined) profileUpdates.phone = phone;

    if (Object.keys(profileUpdates).length > 0) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update(profileUpdates)
        .eq('id', userId);

      if (profileError) throw profileError;
    }

    // Atualizar role se fornecido
    if (role) {
      // Deletar roles existentes
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      // Inserir nova role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: role
        });

      if (roleError) throw roleError;
    }

    // Atualizar email no auth se fornecido
    if (email && email !== targetUser?.user?.email) {
      const { error: emailError } = await supabase.auth.admin.updateUserById(
        userId,
        { email: email }
      );

      if (emailError) throw emailError;
    }

    // Registrar em audit logs
    await supabase.from('audit_logs').insert({
      user_id: adminUser.id,
      table_name: 'profiles',
      operation: 'UPDATE_USER_ADMIN',
      record_id: userId,
      new_data: { full_name, email, phone, role }
    });

    console.log(`✅ User ${userId} updated by admin ${adminUser.email}`);

    return new Response(
      JSON.stringify({ success: true, message: 'Usuário atualizado com sucesso' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Error updating user:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});