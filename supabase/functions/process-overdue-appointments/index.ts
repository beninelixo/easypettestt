import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { verifyAdminAccess } from '../_shared/schemas.ts';

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

    // Check admin role using helper (supports multiple roles)
    const { isAdmin } = await verifyAdminAccess(supabase, user.id);
    
    if (!isAdmin) {
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