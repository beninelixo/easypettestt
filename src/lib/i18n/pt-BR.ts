export const ptBR = {
  // Navigation
  nav: {
    dashboard: "Painel de Controle",
    users: "Usuários",
    appointments: "Agendamentos",
    services: "Serviços",
    products: "Produtos",
    reports: "Relatórios",
    settings: "Configurações",
    logout: "Sair",
    profile: "Perfil",
    help: "Ajuda",
    notifications: "Notificações",
    search: "Buscar"
  },

  // Admin Dashboard
  admin: {
    title: "Administração",
    overview: "Visão Geral",
    users: {
      title: "Gestão de Usuários",
      total: "Total de Usuários",
      active: "Usuários Ativos",
      new: "Novos Usuários",
      role: "Função",
      status: "Status",
      actions: "Ações",
      invite: "Convidar Usuário",
      edit: "Editar Usuário",
      delete: "Excluir Usuário",
      roles: {
        admin: "Administrador",
        pet_shop: "Pet Shop",
        client: "Cliente"
      }
    },
    security: {
      title: "Segurança",
      alerts: "Alertas de Segurança",
      loginAttempts: "Tentativas de Login",
      blockedIPs: "IPs Bloqueados",
      mfa: "Autenticação Multi-Fator",
      audit: "Auditoria",
      scan: "Varredura de Segurança"
    },
    backup: {
      title: "Backups",
      create: "Criar Backup",
      restore: "Restaurar",
      history: "Histórico",
      status: "Status",
      size: "Tamanho",
      lastBackup: "Último Backup"
    },
    monitoring: {
      title: "Monitoramento",
      health: "Saúde do Sistema",
      performance: "Performance",
      errors: "Erros",
      uptime: "Tempo de Atividade",
      latency: "Latência",
      requests: "Requisições"
    },
    logs: {
      title: "Logs do Sistema",
      level: "Nível",
      timestamp: "Data/Hora",
      message: "Mensagem",
      module: "Módulo",
      filter: "Filtrar",
      export: "Exportar"
    }
  },

  // Professional Dashboard
  professional: {
    title: "Profissional",
    dashboard: "Painel",
    clients: "Clientes",
    calendar: "Agenda",
    services: "Serviços",
    products: "Produtos",
    reports: "Relatórios",
    backup: "Backup",
    settings: "Configurações"
  },

  // Client Dashboard
  client: {
    title: "Cliente",
    dashboard: "Meus Agendamentos",
    pets: "Meus Pets",
    history: "Histórico",
    profile: "Meu Perfil",
    appointments: "Agendamentos"
  },

  // Common
  common: {
    save: "Salvar",
    cancel: "Cancelar",
    delete: "Excluir",
    edit: "Editar",
    view: "Visualizar",
    add: "Adicionar",
    remove: "Remover",
    confirm: "Confirmar",
    close: "Fechar",
    loading: "Carregando...",
    error: "Erro",
    success: "Sucesso",
    warning: "Aviso",
    info: "Informação",
    yes: "Sim",
    no: "Não",
    back: "Voltar",
    next: "Próximo",
    previous: "Anterior",
    submit: "Enviar",
    search: "Buscar",
    filter: "Filtrar",
    export: "Exportar",
    import: "Importar",
    download: "Baixar",
    upload: "Enviar",
    refresh: "Atualizar",
    reset: "Resetar"
  },

  // Forms
  forms: {
    required: "Campo obrigatório",
    invalid: "Campo inválido",
    email: "Email inválido",
    phone: "Telefone inválido",
    password: "Senha inválida",
    passwordMismatch: "As senhas não coincidem",
    minLength: "Mínimo de {{count}} caracteres",
    maxLength: "Máximo de {{count}} caracteres"
  },

  // Messages
  messages: {
    success: {
      saved: "Salvo com sucesso",
      deleted: "Excluído com sucesso",
      updated: "Atualizado com sucesso",
      created: "Criado com sucesso"
    },
    error: {
      generic: "Ocorreu um erro",
      network: "Erro de conexão",
      notFound: "Não encontrado",
      unauthorized: "Não autorizado",
      forbidden: "Acesso negado"
    }
  }
};

export type Translation = typeof ptBR;
