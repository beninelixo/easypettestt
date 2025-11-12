import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';

const LOOPS_API_KEY = Deno.env.get('LOOPS_API_KEY');
const LOOPS_API_URL = 'https://app.loops.so/api/v1';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WelcomeEmailRequest {
  userId: string;
  email: string;
  fullName?: string;
  role: 'client' | 'pet_shop' | 'admin';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, email, fullName, role }: WelcomeEmailRequest = await req.json();

    if (!LOOPS_API_KEY) {
      throw new Error('LOOPS_API_KEY not configured');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get user profile data
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', userId)
      .single();

    const userName = fullName || profile?.full_name || 'Usuário';
    const firstName = userName.split(' ')[0];

    // Create contact in Loops with role segmentation
    const createContactResponse = await fetch(`${LOOPS_API_URL}/contacts/create`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOOPS_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email.toLowerCase(),
        firstName: firstName,
        userGroup: role,
        subscribed: true,
      }),
    });

    const contactData = await createContactResponse.json();
    console.log('Contact created in Loops:', contactData);

    // Define role-specific welcome content
    const roleContent = {
      client: {
        subject: '🐾 Bem-vindo ao EasyPet!',
        message: `Olá ${firstName}! Estamos muito felizes em ter você conosco. Com o EasyPet, você pode agendar serviços para seu pet de forma rápida e fácil, acompanhar o histórico de cuidados e muito mais!`,
        cta: 'Comece agora encontrando um pet shop próximo e agendando o primeiro serviço para seu pet.',
        tips: [
          '📅 Agende serviços com antecedência',
          '🔔 Ative notificações para não perder compromissos',
          '💰 Acumule pontos de fidelidade'
        ]
      },
      pet_shop: {
        subject: '🎉 Bem-vindo ao EasyPet Business!',
        message: `Olá ${firstName}! Seja bem-vindo à plataforma EasyPet. Agora você pode gerenciar agendamentos, clientes, serviços e muito mais, tudo em um só lugar!`,
        cta: 'Configure seu perfil, adicione seus serviços e comece a receber agendamentos.',
        tips: [
          '⚙️ Configure seus horários de atendimento',
          '📋 Cadastre seus serviços e preços',
          '👥 Gerencie sua equipe de profissionais',
          '📊 Acompanhe métricas em tempo real'
        ]
      },
      admin: {
        subject: '👑 Bem-vindo ao EasyPet Admin',
        message: `Olá ${firstName}! Você agora tem acesso completo ao painel administrativo do EasyPet. Gerencie todo o sistema, monitore segurança e acompanhe o crescimento da plataforma.`,
        cta: 'Acesse o painel administrativo e explore todas as funcionalidades.',
        tips: [
          '🔒 Configure alertas de segurança',
          '📈 Monitore métricas do sistema',
          '👥 Gerencie usuários e permissões',
          '🛡️ Execute auditorias de segurança'
        ]
      }
    };

    const content = roleContent[role];

    // Send welcome email via Loops transactional API
    const emailResponse = await fetch(`${LOOPS_API_URL}/transactional`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOOPS_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transactionalId: 'welcome-email', // Must be created in Loops dashboard
        email: email.toLowerCase(),
        dataVariables: {
          firstName: firstName,
          userName: userName,
          subject: content.subject,
          message: content.message,
          cta: content.cta,
          tips: content.tips,
          role: role,
        },
      }),
    });

    const emailData = await emailResponse.json();
    
    if (!emailResponse.ok) {
      console.error('Loops email error:', emailData);
      throw new Error(emailData.message || 'Failed to send welcome email');
    }

    console.log('Welcome email sent:', emailData);

    // Trigger onboarding automation sequence
    const eventResponse = await fetch(`${LOOPS_API_URL}/events/send`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOOPS_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email.toLowerCase(),
        eventName: 'user_registered',
        eventProperties: {
          role: role,
          registrationDate: new Date().toISOString(),
        },
      }),
    });

    const eventData = await eventResponse.json();
    console.log('Onboarding event triggered:', eventData);

    // Log to system
    await supabase.from('system_logs').insert({
      module: 'welcome_email',
      log_type: 'info',
      message: `Welcome email sent to ${role} user`,
      details: {
        userId,
        email,
        role,
        contactCreated: contactData.success,
        emailSent: emailData.success,
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Welcome email sent successfully',
        data: { emailData, eventData, contactData },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
    console.error('Error in send-welcome-email function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
