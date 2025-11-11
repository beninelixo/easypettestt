import React, { useState, useEffect } from 'react';
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';
import { useLocation } from 'react-router-dom';

interface OnboardingProps {
  role: 'client' | 'pet_shop' | 'admin';
}

export function InteractiveOnboarding({ role }: OnboardingProps) {
  const [run, setRun] = useState(false);
  const location = useLocation();

  // Verificar se já viu o onboarding
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem(`onboarding_completed_${role}`);
    if (!hasSeenOnboarding) {
      // Aguardar 1 segundo para página carregar
      setTimeout(() => setRun(true), 1000);
    }
  }, [role]);

  // Steps específicos por tipo de usuário
  const getSteps = (): Step[] => {
    if (role === 'client') {
      return [
        {
          target: 'body',
          content: (
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-foreground">Bem-vindo ao EasyPet! 🐾</h3>
              <p className="text-muted-foreground">Vamos fazer um tour rápido pelas principais funcionalidades.</p>
            </div>
          ),
          placement: 'center',
          disableBeacon: true,
        },
        {
          target: '[data-tour="pets-menu"]',
          content: 'Aqui você gerencia todos os seus pets. Adicione fotos, vacinas e histórico médico!',
          placement: 'bottom',
        },
        {
          target: '[data-tour="appointments-menu"]',
          content: 'Agende serviços de banho, tosa, consultas veterinárias e muito mais.',
          placement: 'bottom',
        },
        {
          target: '[data-tour="petshops-menu"]',
          content: 'Encontre pet shops próximos e veja avaliações de outros clientes.',
          placement: 'bottom',
        },
        {
          target: '[data-tour="profile-menu"]',
          content: 'Personalize seu perfil, veja seus pontos de fidelidade e gerencie notificações.',
          placement: 'left',
        },
      ];
    }

    if (role === 'pet_shop') {
      return [
        {
          target: 'body',
          content: (
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-foreground">Bem-vindo ao EasyPet! 🏪</h3>
              <p className="text-muted-foreground">Configure seu pet shop em minutos e comece a receber agendamentos!</p>
            </div>
          ),
          placement: 'center',
          disableBeacon: true,
        },
        {
          target: '[data-tour="calendar-menu"]',
          content: 'Gerencie todos os seus agendamentos em um calendário visual e intuitivo.',
          placement: 'bottom',
        },
        {
          target: '[data-tour="clients-menu"]',
          content: 'Veja o histórico completo de cada cliente e seus pets.',
          placement: 'bottom',
        },
        {
          target: '[data-tour="services-menu"]',
          content: 'Configure seus serviços, preços e duração. Crie combos promocionais!',
          placement: 'bottom',
        },
        {
          target: '[data-tour="analytics-menu"]',
          content: 'Acompanhe seu faturamento, serviços mais vendidos e horários de pico.',
          placement: 'bottom',
        },
        {
          target: '[data-tour="settings-menu"]',
          content: 'Configure horário de funcionamento, formas de pagamento e notificações automáticas.',
          placement: 'left',
        },
      ];
    }

    // Admin
    return [
      {
        target: 'body',
        content: (
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-foreground">Painel de Administração 🔧</h3>
            <p className="text-muted-foreground">Controle total sobre o sistema EasyPet.</p>
          </div>
        ),
        placement: 'center',
        disableBeacon: true,
      },
      {
        target: '[data-tour="monitoring-menu"]',
        content: 'Monitore a saúde do sistema em tempo real: uptime, erros, performance.',
        placement: 'bottom',
      },
      {
        target: '[data-tour="security-menu"]',
        content: 'Dashboard de segurança com alertas, tentativas de login e IPs bloqueados.',
        placement: 'bottom',
      },
      {
        target: '[data-tour="users-menu"]',
        content: 'Gerencie usuários, pet shops e permissões do sistema.',
        placement: 'bottom',
      },
      {
        target: '[data-tour="backups-menu"]',
        content: 'Configure backups automáticos e restaure dados se necessário.',
        placement: 'bottom',
      },
    ];
  };

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;

    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      // Marcar como concluído
      localStorage.setItem(`onboarding_completed_${role}`, 'true');
      setRun(false);
    }
  };

  // Resetar onboarding se mudar de página drasticamente
  useEffect(() => {
    setRun(false);
  }, [location.pathname]);

  return (
    <Joyride
      steps={getSteps()}
      run={run}
      continuous
      showProgress
      showSkipButton
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: 'hsl(var(--primary))',
          textColor: 'hsl(var(--foreground))',
          backgroundColor: 'hsl(var(--background))',
          overlayColor: 'rgba(0, 0, 0, 0.5)',
          arrowColor: 'hsl(var(--background))',
          zIndex: 10000,
        },
        tooltip: {
          borderRadius: '8px',
          padding: '16px',
        },
        buttonNext: {
          backgroundColor: 'hsl(var(--primary))',
          borderRadius: '6px',
          padding: '8px 16px',
        },
        buttonBack: {
          color: 'hsl(var(--muted-foreground))',
        },
        buttonSkip: {
          color: 'hsl(var(--muted-foreground))',
        },
      }}
      locale={{
        back: 'Voltar',
        close: 'Fechar',
        last: 'Finalizar',
        next: 'Próximo',
        skip: 'Pular',
      }}
    />
  );
}