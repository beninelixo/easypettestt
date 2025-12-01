/**
 * Mensagens padronizadas de notificação para todo o sistema EasyPet
 * Todas as mensagens são claras, amigáveis e orientadas à ação
 */

export const TOAST_MESSAGES = {
  auth: {
    loginSuccess: (name: string) => ({
      title: `🎉 Bem-vindo, ${name}!`,
      description: "Login realizado com sucesso.",
    }),
    loginBlocked: {
      title: "⏱️ Conta Temporariamente Bloqueada",
      description: "Muitas tentativas de login. Aguarde 15 minutos e tente novamente.",
    },
    loginInvalidCredentials: {
      title: "🔒 Credenciais Inválidas",
      description: "Email ou senha incorretos. Verifique e tente novamente.",
    },
    logoutSuccess: {
      title: "👋 Até logo!",
      description: "Você foi desconectado com segurança.",
    },
    signupSuccess: {
      title: "✅ Conta Criada!",
      description: "Sua conta foi criada com sucesso. Bem-vindo ao EasyPet!",
    },
    signupEmailExists: {
      title: "📧 Email Já Cadastrado",
      description: "Este email já está em uso. Tente fazer login ou recuperar sua senha.",
    },
    signupWeakPassword: {
      title: "⚠️ Senha Muito Fraca",
      description: "Use pelo menos 8 caracteres com letras, números e símbolos.",
    },
    passwordResetSent: {
      title: "📧 Email Enviado!",
      description: "Verifique sua caixa de entrada para redefinir sua senha.",
    },
    passwordResetSuccess: {
      title: "✅ Senha Alterada!",
      description: "Sua senha foi atualizada com sucesso.",
    },
    sessionExpired: {
      title: "⏰ Sessão Expirada",
      description: "Por segurança, faça login novamente.",
    },
    networkError: {
      title: "🌐 Erro de Conexão",
      description: "Verifique sua internet e tente novamente.",
    },
    serverError: {
      title: "⚠️ Erro no Servidor",
      description: "Tente novamente em alguns instantes.",
    },
  },

  appointments: {
    createSuccess: {
      title: "📅 Agendamento Confirmado!",
      description: "Seu pet está agendado. Você receberá uma confirmação por email.",
    },
    updateSuccess: {
      title: "✅ Agendamento Atualizado",
      description: "As alterações foram salvas com sucesso.",
    },
    cancelSuccess: {
      title: "🗑️ Agendamento Cancelado",
      description: "O agendamento foi cancelado. Você pode reagendar a qualquer momento.",
    },
    conflictError: {
      title: "⚠️ Horário Indisponível",
      description: "Este horário já está ocupado. Escolha outro horário.",
    },
    reminderSent: {
      title: "🔔 Lembrete Enviado",
      description: "O cliente foi notificado sobre o agendamento.",
    },
  },

  pets: {
    createSuccess: {
      title: "🐾 Pet Cadastrado!",
      description: "Seu pet foi adicionado com sucesso.",
    },
    updateSuccess: {
      title: "✅ Pet Atualizado",
      description: "As informações do pet foram atualizadas.",
    },
    deleteSuccess: {
      title: "🗑️ Pet Removido",
      description: "O pet foi removido do sistema.",
    },
  },

  security: {
    suspiciousActivity: {
      title: "🚨 Atividade Suspeita",
      description: "Detectamos atividade incomum. Verifique sua conta.",
    },
    mfaEnabled: {
      title: "🔐 2FA Ativado!",
      description: "Sua conta agora está mais segura com autenticação em duas etapas.",
    },
    ipBlocked: {
      title: "🛡️ IP Bloqueado",
      description: "Um IP suspeito foi bloqueado automaticamente.",
    },
    backupComplete: {
      title: "💾 Backup Concluído",
      description: "O backup do sistema foi realizado com sucesso.",
    },
  },

  admin: {
    userUpdated: {
      title: "✅ Usuário Atualizado",
      description: "As permissões do usuário foram atualizadas.",
    },
    userBlocked: {
      title: "🚫 Usuário Bloqueado",
      description: "O usuário foi bloqueado com sucesso.",
    },
    systemHealthOk: {
      title: "💚 Sistema Saudável",
      description: "Todos os serviços estão funcionando normalmente.",
    },
    systemHealthWarning: {
      title: "⚠️ Atenção no Sistema",
      description: "Alguns serviços precisam de atenção.",
    },
    systemHealthCritical: {
      title: "🔴 Sistema Crítico",
      description: "Ação imediata necessária!",
    },
  },

  payments: {
    success: {
      title: "💳 Pagamento Confirmado!",
      description: "Seu plano foi ativado com sucesso.",
    },
    failed: {
      title: "❌ Pagamento Recusado",
      description: "Verifique os dados do cartão e tente novamente.",
    },
    subscriptionActive: {
      title: "🎉 Assinatura Ativa!",
      description: "Aproveite todos os recursos do seu plano.",
    },
  },

  general: {
    saveSuccess: {
      title: "✅ Salvo!",
      description: "Alterações salvas com sucesso.",
    },
    deleteSuccess: {
      title: "🗑️ Removido",
      description: "Item removido com sucesso.",
    },
    copySuccess: {
      title: "📋 Copiado!",
      description: "Conteúdo copiado para a área de transferência.",
    },
    uploadSuccess: {
      title: "📤 Upload Concluído",
      description: "Arquivo enviado com sucesso.",
    },
    loadingError: {
      title: "⚠️ Erro ao Carregar",
      description: "Não foi possível carregar os dados. Tente novamente.",
    },
    permissionDenied: {
      title: "🚫 Acesso Negado",
      description: "Você não tem permissão para esta ação.",
    },
  },
};

/**
 * Cores semânticas para toasts baseadas no tipo
 */
export const TOAST_VARIANTS = {
  success: "default" as const,
  error: "destructive" as const,
  warning: "default" as const,
  info: "default" as const,
};

/**
 * Helper para criar toast de sucesso genérico
 */
export const successToast = (title: string, description?: string) => ({
  title: `✅ ${title}`,
  description,
});

/**
 * Helper para criar toast de erro genérico
 */
export const errorToast = (title: string, description?: string) => ({
  title: `❌ ${title}`,
  description,
  variant: "destructive" as const,
});

/**
 * Helper para criar toast de loading
 */
export const loadingToast = (title: string, description?: string) => ({
  title: `⏳ ${title}`,
  description,
});
