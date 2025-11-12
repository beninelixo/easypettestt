import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { Resend } from 'https://esm.sh/resend@2.0.0';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// HTML sanitization helper
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Validation schema for appointment data from database
const appointmentSchema = z.object({
  id: z.string().uuid(),
  scheduled_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  scheduled_time: z.string(),
  status: z.enum(['pending', 'confirmed']),
  client_id: z.string().uuid(),
  service: z.object({
    name: z.string().max(100),
  }).nullable(),
  pet: z.object({
    name: z.string().max(100),
  }).nullable(),
  pet_shop: z.object({
    name: z.string().max(200),
    phone: z.string().max(20),
  }).nullable(),
});

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Verify service role authentication (for cron/internal calls)
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader || !authHeader.includes(supabaseServiceKey)) {
      console.error('❌ Unauthorized: Invalid or missing service role key');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        }
      );
    }

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
        // Validate appointment data
        const validation = appointmentSchema.safeParse(appointment);
        if (!validation.success) {
          console.error(`⚠️ Dados inválidos para agendamento ${appointment.id}:`, validation.error);
          failCount++;
          continue;
        }

        const validAppointment = validation.data;

        // Buscar email e telefone do cliente
        const { data: userData, error: userError } = await supabase.auth.admin.getUserById(
          validAppointment.client_id
        );

        if (userError || (!userData.user?.email && !userData.user?.user_metadata?.phone)) {
          console.error(`⚠️ Nenhum contato encontrado para cliente ${validAppointment.client_id}`);
          failCount++;
          continue;
        }

        const email = userData.user?.email;
        const phone = userData.user?.user_metadata?.phone;
        const appointmentTime = validAppointment.scheduled_time.substring(0, 5);
        
        // Sanitize user-controlled data for HTML
        const serviceName = escapeHtml(validAppointment.service?.name || 'Serviço');
        const petName = escapeHtml(validAppointment.pet?.name || 'seu pet');
        const petShopName = escapeHtml(validAppointment.pet_shop?.name || 'o estabelecimento');

        // Formatar data em português
        const dateObj = new Date(validAppointment.scheduled_date + 'T00:00:00');
        const formattedDate = dateObj.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        });

        // Send WhatsApp reminder if phone is available
        if (phone) {
          try {
            const whatsappResponse = await fetch(`${supabaseUrl}/functions/v1/send-whatsapp`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${supabaseServiceKey}`,
              },
              body: JSON.stringify({
                to: phone,
                template_name: 'appointment_reminder',
                template_language: 'pt_BR',
                parameters: [
                  { type: 'text', text: validAppointment.pet?.name || 'seu pet' },
                  { type: 'text', text: validAppointment.service?.name || 'serviço' },
                  { type: 'text', text: formattedDate },
                  { type: 'text', text: appointmentTime },
                  { type: 'text', text: validAppointment.pet_shop?.name || 'pet shop' }
                ]
              }),
            });

            if (whatsappResponse.ok) {
              console.log(`✅ WhatsApp reminder sent to ${phone.substring(0, 4)}****`);
              
              // Registrar envio no banco
              await supabase.from('notifications').insert({
                client_id: validAppointment.client_id,
                appointment_id: validAppointment.id,
                notification_type: 'lembrete',
                channel: 'whatsapp',
                message: `Lembrete WhatsApp: Agendamento amanhã às ${appointmentTime}`,
                status: 'enviada',
                sent_at: new Date().toISOString(),
              });
            } else {
              console.warn(`⚠️ WhatsApp failed for ${phone.substring(0, 4)}****`);
            }
          } catch (whatsappError) {
            console.error('WhatsApp error:', whatsappError);
            // Continue to email if WhatsApp fails
          }
        }

        // Enviar email via Resend if available
        if (!email) {
          successCount++;
          continue;
        }

        const { error: emailError } = await resend.emails.send({
          from: 'EasyPet <easypetc@gmail.com>',
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
          client_id: validAppointment.client_id,
          appointment_id: validAppointment.id,
          notification_type: 'lembrete',
          channel: 'email',
          message: `Lembrete: Agendamento amanhã às ${appointmentTime}`,
          status: 'enviada',
          sent_at: new Date().toISOString(),
        });

        console.log(`✅ Lembrete enviado com sucesso para ${email}`);
        successCount++;
      } catch (error: any) {
        console.error(`❌ Erro ao processar agendamento ${(appointment as any).id}:`, error);
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
