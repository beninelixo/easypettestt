import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AppointmentPayload {
  type: 'INSERT' | 'UPDATE';
  record: {
    id: string;
    pet_shop_id: string;
    client_id: string;
    scheduled_date: string;
    scheduled_time: string;
    status: string;
  };
  old_record?: {
    status: string;
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const payload: AppointmentPayload = await req.json();
    console.log('📅 Processando mudança no agendamento:', payload);

    const { record, type, old_record } = payload;

    // Verificar se é criação ou cancelamento
    const isNewAppointment = type === 'INSERT';
    const isCancellation = type === 'UPDATE' && 
      old_record?.status !== 'cancelled' && 
      record.status === 'cancelled';

    if (!isNewAppointment && !isCancellation) {
      console.log('⏭️ Mudança não requer notificação');
      return new Response(JSON.stringify({ message: 'No notification needed' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // Buscar dados do pet shop e owner
    const { data: petShop, error: petShopError } = await supabase
      .from('pet_shops')
      .select('owner_id, name')
      .eq('id', record.pet_shop_id)
      .single();

    if (petShopError || !petShop) {
      console.error('❌ Erro ao buscar pet shop:', petShopError);
      throw new Error('Pet shop não encontrado');
    }

    // Buscar dados do cliente
    const { data: clientProfile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', record.client_id)
      .single();

    const clientName = clientProfile?.full_name || 'Cliente';

    // Criar mensagem
    const message = isNewAppointment
      ? `🎉 Novo agendamento de ${clientName} para ${record.scheduled_date} às ${record.scheduled_time}`
      : `❌ Agendamento cancelado: ${clientName} em ${record.scheduled_date} às ${record.scheduled_time}`;

    console.log(`📨 Enviando notificação para owner_id: ${petShop.owner_id}`);

    // Enviar notificação push
    const { error: notificationError } = await supabase.functions.invoke(
      'send-push-notification',
      {
        body: {
          user_id: petShop.owner_id,
          title: isNewAppointment ? 'Novo Agendamento!' : 'Agendamento Cancelado',
          body: message,
          data: {
            appointment_id: record.id,
            type: isNewAppointment ? 'new_appointment' : 'cancelled_appointment',
            url: '/professional/calendar',
          },
        },
      }
    );

    if (notificationError) {
      console.error('⚠️ Erro ao enviar push notification:', notificationError);
      // Não falhar se push notification não funcionar
    } else {
      console.log('✅ Push notification enviada com sucesso');
    }

    // Registrar notificação no banco
    const { error: logError } = await supabase.from('notifications').insert({
      client_id: petShop.owner_id,
      appointment_id: record.id,
      notification_type: isNewAppointment ? 'novo_agendamento' : 'cancelamento',
      channel: 'push',
      message,
      status: 'enviada',
      sent_at: new Date().toISOString(),
    });

    if (logError) {
      console.error('⚠️ Erro ao registrar notificação:', logError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Notification sent successfully' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('❌ Erro geral:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
