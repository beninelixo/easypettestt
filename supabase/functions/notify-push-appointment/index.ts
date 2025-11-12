import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, record, old_record } = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`📲 Processing ${type} event for appointment:`, record.id);

    // Get pet shop professionals
    const { data: petShop, error: petShopError } = await supabase
      .from('pet_shops')
      .select('owner_id, name')
      .eq('id', record.pet_shop_id)
      .single();

    if (petShopError || !petShop) {
      console.error('Pet shop not found:', petShopError);
      return new Response(
        JSON.stringify({ success: false, error: 'Pet shop not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get client name
    const { data: clientData } = await supabase.auth.admin.getUserById(record.client_id);
    const clientName = clientData?.user?.user_metadata?.full_name || 'Cliente';

    // Get service name
    const { data: serviceData } = await supabase
      .from('services')
      .select('name')
      .eq('id', record.service_id)
      .single();
    const serviceName = serviceData?.name || 'Serviço';

    // Determine notification message based on event type
    let title = '';
    let body = '';

    if (type === 'INSERT') {
      title = '🎉 Novo Agendamento!';
      body = `${clientName} agendou ${serviceName} para ${record.scheduled_date} às ${record.scheduled_time}`;
    } else if (type === 'UPDATE') {
      if (old_record.status !== record.status) {
        if (record.status === 'cancelled') {
          title = '❌ Agendamento Cancelado';
          body = `${clientName} cancelou ${serviceName} de ${record.scheduled_date}`;
        } else if (record.status === 'confirmed') {
          title = '✅ Agendamento Confirmado';
          body = `${clientName} - ${serviceName} confirmado para ${record.scheduled_date}`;
        }
      }
    }

    if (!title || !body) {
      return new Response(
        JSON.stringify({ success: true, message: 'No notification needed' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Send push notification to pet shop owner
    const { data: pushData, error: pushError } = await supabase.functions.invoke(
      'send-push-notification',
      {
        body: {
          userId: petShop.owner_id,
          title,
          body,
          data: {
            appointmentId: record.id,
            type: 'appointment',
            action: type.toLowerCase()
          }
        }
      }
    );

    if (pushError) {
      console.error('Push notification error:', pushError);
    } else {
      console.log('✅ Push notification sent:', pushData);
    }

    // Also create in-app notification
    await supabase.from('notifications').insert({
      client_id: petShop.owner_id,
      appointment_id: record.id,
      notification_type: type === 'INSERT' ? 'novo_agendamento' : 'status_mudou',
      channel: 'push',
      message: body,
      status: 'enviada',
      sent_at: new Date().toISOString()
    });

    return new Response(
      JSON.stringify({ success: true, notification: { title, body } }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
