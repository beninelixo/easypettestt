import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Validation schema
const updateUserSchema = z.object({
  userId: z.string().uuid("ID de usuário inválido"),
  full_name: z.string().min(2, "Nome deve ter no mínimo 2 caracteres").max(100).optional(),
  email: z.string().email("Email inválido").optional(),
  phone: z.string().regex(/^\+?[1-9]\d{10,14}$/, "Telefone inválido").optional().or(z.literal('')),
  role: z.enum(['client', 'pet_shop', 'admin', 'super_admin'], {
    errorMap: () => ({ message: "Role inválido" })
  }).optional(),
  action: z.enum(['update', 'delete']).default('update'),
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
      return new Response(
        JSON.stringify({ error: 'Cabeçalho de autorização ausente' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user: adminUser }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !adminUser) {
      return new Response(
        JSON.stringify({ error: 'Não autorizado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verificar se é admin
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', adminUser.id)
      .maybeSingle();

    if (roleError) {
      console.error('Error checking admin role:', roleError);
      return new Response(
        JSON.stringify({ error: 'Erro ao verificar permissões de admin' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const isAdmin = roleData?.role === 'admin' || roleData?.role === 'super_admin' || adminUser.email === 'beninelixo@gmail.com';
    
    if (!isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Acesso negado: você precisa ser admin para executar esta ação' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate input
    const body = await req.json();
    const validationResult = updateUserSchema.safeParse(body);
    
    if (!validationResult.success) {
      const errors = validationResult.error.errors.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', ');
      return new Response(
        JSON.stringify({ 
          error: "Erro de validação", 
          details: errors 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { userId, full_name, email, phone, role, action } = validationResult.data;

    // Verificar se usuário alvo existe
    const { data: targetUser, error: targetError } = await supabase.auth.admin.getUserById(userId);
    if (targetError || !targetUser) {
      return new Response(
        JSON.stringify({ error: 'Usuário não encontrado' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Não permitir alterar/deletar o God User
    if (targetUser.user.email === 'beninelixo@gmail.com' && (action === 'delete' || (role && role !== roleData?.role))) {
      return new Response(
        JSON.stringify({ error: 'Não é possível modificar o usuário god' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Se a ação é deletar, executar deleção
    if (action === 'delete') {
      // Deletar usuário do auth
      const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);
      
      if (deleteError) {
        console.error('Error deleting user:', deleteError);
        return new Response(
          JSON.stringify({ error: 'Erro ao deletar usuário', details: deleteError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Registrar em audit logs
      await supabase.from('audit_logs').insert({
        user_id: adminUser.id,
        table_name: 'auth.users',
        operation: 'DELETE_USER_ADMIN',
        record_id: userId,
        old_data: { email: targetUser.user.email, full_name }
      });

      console.log(`✅ User ${userId} deleted by admin ${adminUser.email}`);

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Usuário deletado com sucesso'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Atualizar perfil se fornecido
    if (full_name !== undefined || phone !== undefined) {
      const profileUpdates: any = {};
      if (full_name !== undefined) profileUpdates.full_name = full_name;
      if (phone !== undefined) profileUpdates.phone = phone === '' ? null : phone;

      const { error: profileError } = await supabase
        .from('profiles')
        .update(profileUpdates)
        .eq('id', userId);

      if (profileError) {
        console.error('Error updating profile:', profileError);
        return new Response(
          JSON.stringify({ error: 'Erro ao atualizar perfil do usuário', details: profileError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Atualizar email se fornecido e diferente
    if (email && email !== targetUser.user.email) {
      const { error: emailError } = await supabase.auth.admin.updateUserById(
        userId,
        { email: email, email_confirm: true }
      );

      if (emailError) {
        console.error('Error updating email:', emailError);
        return new Response(
          JSON.stringify({ error: 'Erro ao atualizar email do usuário', details: emailError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Atualizar role se fornecido
    if (role) {
      // Verificar se role já existe
      const { data: existingRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();

      if (existingRole) {
        // Atualizar role existente
        const { error: roleError } = await supabase
          .from('user_roles')
          .update({ role })
          .eq('user_id', userId);

        if (roleError) {
          console.error('Error updating role:', roleError);
          return new Response(
            JSON.stringify({ error: 'Erro ao atualizar role do usuário', details: roleError.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      } else {
        // Inserir nova role
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role });

        if (roleError) {
          console.error('Error inserting role:', roleError);
          return new Response(
            JSON.stringify({ error: 'Erro ao criar role do usuário', details: roleError.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }
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
      JSON.stringify({ 
        success: true, 
        message: 'Usuário atualizado com sucesso',
        updated: { full_name, email, phone, role }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Error updating user:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});