import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { Resend } from 'npm:resend@4.0.0';

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('🔔 Iniciando envio de lembretes de agendamentos...');

    // Calcular data de amanhã (24h de antecedência)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowDate = tomorrow.toISOString().split('T')[0];

    console.log(`📅 Buscando agendamentos para: ${tomorrowDate}`);

    // Buscar agendamentos confirmados ou pendentes para amanhã
    const { data: appointments, error: appointmentsError } = await supabase
      .from('appointments')
      .select(`
        id,
        scheduled_date,
        scheduled_time,
        status,
        client_id,
        service:services(name, duration_minutes),
        pet:pets(name),
        pet_shop:pet_shops(name, phone)
      `)
      .eq('scheduled_date', tomorrowDate)
      .in('status', ['pending', 'confirmed'])
      .order('scheduled_time');

    if (appointmentsError) {
      console.error('❌ Erro ao buscar agendamentos:', appointmentsError);
      throw appointmentsError;
    }

    console.log(`📊 Encontrados ${appointments?.length || 0} agendamentos para lembretes`);

    if (!appointments || appointments.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No reminders to send', count: 0 }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    let successCount = 0;
    let failCount = 0;

    // Enviar lembretes para cada agendamento
    for (const appointment of appointments) {
      try {
        // Buscar email do cliente
        const { data: userData, error: userError } = await supabase.auth.admin.getUserById(
          appointment.client_id
        );

        if (userError || !userData.user?.email) {
          console.error(`⚠️ Email não encontrado para cliente ${appointment.client_id}`);
          failCount++;
          continue;
        }

        const email = userData.user.email;
        const appointmentTime = appointment.scheduled_time.substring(0, 5);
        const serviceName = appointment.service?.name || 'Serviço';
        const petName = appointment.pet?.name || 'seu pet';
        const petShopName = appointment.pet_shop?.name || 'o estabelecimento';

        // Formatar data em português
        const dateObj = new Date(appointment.scheduled_date + 'T00:00:00');
        const formattedDate = dateObj.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        });

        console.log(`📧 Enviando lembrete para: ${email}`);

        // Enviar email via Resend
        const { error: emailError } = await resend.emails.send({
          from: 'EasyPet <onboarding@resend.dev>',
          to: [email],
          subject: '🔔 Lembrete: Agendamento amanhã!',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #2563eb; margin-bottom: 20px;">🐾 Lembrete de Agendamento</h1>
              
              <p style="font-size: 16px; line-height: 1.5;">Olá!</p>
              
              <p style="font-size: 16px; line-height: 1.5;">
                Este é um lembrete de que você tem um agendamento amanhã:
              </p>
              
              <div style="background-color: #f3f4f6; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <p style="margin: 10px 0;"><strong>📅 Data:</strong> ${formattedDate}</p>
                <p style="margin: 10px 0;"><strong>⏰ Horário:</strong> ${appointmentTime}</p>
                <p style="margin: 10px 0;"><strong>🐕 Pet:</strong> ${petName}</p>
                <p style="margin: 10px 0;"><strong>✨ Serviço:</strong> ${serviceName}</p>
                <p style="margin: 10px 0;"><strong>🏪 Local:</strong> ${petShopName}</p>
              </div>
              
              <p style="font-size: 16px; line-height: 1.5;">
                Por favor, chegue com alguns minutos de antecedência.
              </p>
              
              <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
                Se precisar cancelar ou reagendar, acesse sua conta no EasyPet.
              </p>
              
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
              
              <p style="font-size: 12px; color: #9ca3af; text-align: center;">
                EasyPet - Sistema de Gestão para Pet Shops<br>
                Este é um email automático, por favor não responda.
              </p>
            </div>
          `,
        });

        if (emailError) {
          console.error(`❌ Erro ao enviar email para ${email}:`, emailError);
          failCount++;
          continue;
        }

        // Registrar envio no banco
        await supabase.from('notifications').insert({
          client_id: appointment.client_id,
          appointment_id: appointment.id,
          notification_type: 'lembrete',
          channel: 'email',
          message: `Lembrete: Agendamento amanhã às ${appointmentTime}`,
          status: 'enviada',
          sent_at: new Date().toISOString(),
        });

        console.log(`✅ Lembrete enviado com sucesso para ${email}`);
        successCount++;
      } catch (error) {
        console.error(`❌ Erro ao processar agendamento ${appointment.id}:`, error);
        failCount++;
      }
    }

    const summary = {
      total: appointments.length,
      success: successCount,
      failed: failCount,
      date: tomorrowDate,
    };

    console.log('📊 Resumo do envio de lembretes:', summary);

    return new Response(
      JSON.stringify({ 
        message: 'Reminders processing completed',
        summary 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
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
