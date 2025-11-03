import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check admin role
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!roleData || roleData.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Forbidden - Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const today = new Date().toISOString().split('T')[0];

    // Buscar agendamentos atrasados
    const { data: overdueAppointments, error: fetchError } = await supabase
      .from('appointments')
      .select('id, scheduled_date, scheduled_time, client_id, pet_shop_id')
      .lt('scheduled_date', today)
      .in('status', ['pending', 'confirmed']);

    if (fetchError) throw fetchError;

    if (!overdueAppointments || overdueAppointments.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          processed: 0,
          message: 'Nenhum agendamento atrasado encontrado'
        }), 
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Atualizar para cancelado
    const { error: updateError } = await supabase
      .from('appointments')
      .update({ 
        status: 'cancelled',
        notes: `[AUTO] Cancelado automaticamente por atraso em ${new Date().toISOString()}`
      })
      .in('id', overdueAppointments.map(a => a.id));

    if (updateError) throw updateError;

    // Registrar log
    await supabase.from('system_logs').insert({
      module: 'process_overdue_appointments',
      log_type: 'warning',
      message: `${overdueAppointments.length} agendamentos atrasados cancelados automaticamente`,
      details: {
        count: overdueAppointments.length,
        appointments: overdueAppointments.map(a => ({
          id: a.id,
          date: a.scheduled_date,
          time: a.scheduled_time
        }))
      }
    });

    // Enviar alerta por email se houver muitos agendamentos atrasados
    if (overdueAppointments.length >= 5) {
      try {
        await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-alert-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
          },
          body: JSON.stringify({
            severity: 'warning',
            module: 'process_overdue_appointments',
            subject: `${overdueAppointments.length} agendamentos atrasados cancelados`,
            message: `O sistema detectou e cancelou automaticamente ${overdueAppointments.length} agendamentos com data passada.`,
            details: {
              count: overdueAppointments.length,
              oldest_date: overdueAppointments[0]?.scheduled_date
            }
          })
        });
      } catch (emailError) {
        console.error('Erro ao enviar email de alerta:', emailError);
      }
    }

    // TODO: Enviar notificações para clientes
    // for (const appointment of overdueAppointments) {
    //   await supabase.from('notifications').insert({
    //     client_id: appointment.client_id,
    //     appointment_id: appointment.id,
    //     notification_type: 'cancelamento',
    //     channel: 'email',
    //     message: 'Seu agendamento foi cancelado automaticamente por atraso',
    //     status: 'pendente'
    //   });
    // }

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: overdueAppointments.length,
        appointments: overdueAppointments
      }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing overdue appointments:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : String(error)
      }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});