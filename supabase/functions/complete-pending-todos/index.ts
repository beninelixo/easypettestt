import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { verifyAdminAccess } from '../_shared/schemas.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      console.error('❌ Unauthorized access attempt to maintenance function');
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const token = authHeader.replace('Bearer ', '');
    
    // Check if it's service role key (cron job)
    const isServiceRole = token === supabaseServiceKey;
    
    if (!isServiceRole) {
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      
      if (authError || !user) {
        console.error('❌ Invalid token');
        return new Response(
          JSON.stringify({ error: 'Unauthorized - Invalid token' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Check admin role using helper (supports multiple roles)
      const { isAdmin } = await verifyAdminAccess(supabase, user.id);
      
      if (!isAdmin) {
        console.error('❌ Non-admin user attempted to run maintenance');
        return new Response(
          JSON.stringify({ error: 'Forbidden - Admin access required' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    console.log('🔧 Iniciando completamento de TODOs pendentes...');

    // Enviar notificações para perfis incompletos
    const { data: incompleteProfiles } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .or('full_name.eq.,phone.eq.');

    if (incompleteProfiles && incompleteProfiles.length > 0) {
      console.log(`📧 Enviando emails para ${incompleteProfiles.length} perfis incompletos`);
      
      for (const profile of incompleteProfiles) {
        const { data: authUser } = await supabase.auth.admin.getUserById(profile.id);
        
        if (authUser?.user?.email) {
          await supabase.from('notifications').insert({
            client_id: profile.id,
            notification_type: 'reminder',
            channel: 'email',
            message: 'Complete seu cadastro para aproveitar todos os recursos do EasyPet!',
            status: 'pendente',
          });
        }
      }
    }

    // Processar agendamentos atrasados
    const { data: overdueAppointments } = await supabase
      .from('appointments')
      .select('id, client_id, scheduled_date')
      .eq('status', 'pending')
      .lt('scheduled_date', new Date().toISOString().split('T')[0]);

    if (overdueAppointments && overdueAppointments.length > 0) {
      console.log(`📅 Processando ${overdueAppointments.length} agendamentos atrasados`);
      
      await supabase
        .from('appointments')
        .update({ status: 'cancelled' })
        .in('id', overdueAppointments.map(a => a.id));

      for (const appointment of overdueAppointments) {
        await supabase.from('notifications').insert({
          client_id: appointment.client_id,
          appointment_id: appointment.id,
          notification_type: 'cancellation',
          channel: 'email',
          message: 'Seu agendamento foi cancelado automaticamente por atraso.',
          status: 'pendente',
        });
      }
    }

    // Auto-correção de dados inconsistentes
    const corrections = [];

    // Corrigir pagamentos pendentes antigos (mais de 30 dias)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { data: oldPendingPayments } = await supabase
      .from('payments')
      .select('id, appointment_id')
      .eq('status', 'pendente')
      .lt('created_at', thirtyDaysAgo.toISOString());

    if (oldPendingPayments && oldPendingPayments.length > 0) {
      console.log(`💳 Corrigindo ${oldPendingPayments.length} pagamentos antigos`);
      
      await supabase
        .from('payments')
        .update({ status: 'cancelled' })
        .in('id', oldPendingPayments.map(p => p.id));
      
      corrections.push({
        type: 'old_pending_payments',
        count: oldPendingPayments.length,
      });
    }

    // Limpar produtos com estoque negativo
    const { data: negativeStock } = await supabase
      .from('products')
      .update({ stock_quantity: 0 })
      .lt('stock_quantity', 0)
      .select('id');

    if (negativeStock && negativeStock.length > 0) {
      console.log(`📦 Corrigindo ${negativeStock.length} produtos com estoque negativo`);
      corrections.push({
        type: 'negative_stock',
        count: negativeStock.length,
      });
    }

    // Criar alerta para admin se houver muitas correções
    if (corrections.length > 0) {
      await supabase.from('admin_alerts').insert({
        alert_type: 'system_auto_correction',
        severity: 'info',
        title: 'Auto-correções executadas',
        message: `O sistema executou ${corrections.length} tipos de auto-correção`,
        context: { corrections },
      });
    }

    console.log('✅ Completamento de TODOs finalizado');

    return new Response(
      JSON.stringify({
        success: true,
        incompleteProfiles: incompleteProfiles?.length || 0,
        overdueAppointments: overdueAppointments?.length || 0,
        corrections,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('❌ Error completing TODOs:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});