// Biblioteca centralizada de dicas para erros administrativos

export interface ErrorTip {
  title: string;
  description: string;
  steps: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  documentationUrl?: string;
  quickAction?: {
    label: string;
    route: string;
  };
}

export const ERROR_TIPS: Record<string, ErrorTip> = {
  // Performance Issues
  performance_degradation: {
    title: 'Performance Degradada',
    description: 'O sistema está respondendo mais lento que o normal. Isso pode afetar a experiência dos usuários.',
    steps: [
      'Acesse o Dashboard de Performance para identificar gargalos',
      'Verifique se há queries lentas no banco de dados via Logs',
      'Considere aumentar o tamanho da instância em Configurações Avançadas',
      'Revise se há loops infinitos ou memory leaks no código',
      'Verifique o uso de memória e CPU nos métricas do sistema'
    ],
    severity: 'high',
    category: 'Performance',
    quickAction: { label: 'Ver Performance', route: '/admin/performance' }
  },

  // Security Issues
  login_blocked: {
    title: 'Login Bloqueado por Rate Limiting',
    description: 'Um usuário ou IP foi bloqueado após muitas tentativas de login falhadas.',
    steps: [
      'Acesse "Segurança" para ver a lista de IPs bloqueados',
      'Verifique se o bloqueio foi legítimo ou falso positivo',
      'Se necessário, desbloqueie o IP/usuário manualmente',
      'Considere ajustar os limites se houver muitos falsos positivos',
      'Notifique o usuário sobre a tentativa de acesso bloqueada'
    ],
    severity: 'medium',
    category: 'Segurança',
    quickAction: { label: 'Gerenciar IPs', route: '/admin/security' }
  },

  security_alert: {
    title: 'Alerta de Segurança Detectado',
    description: 'Uma atividade suspeita foi detectada no sistema que pode indicar tentativa de invasão.',
    steps: [
      'Revise os logs de autenticação para identificar o padrão',
      'Verifique se há IPs desconhecidos tentando acessar o sistema',
      'Considere bloquear IPs suspeitos temporariamente',
      'Notifique os administradores sobre a atividade',
      'Se necessário, force logout de sessões ativas suspeitas'
    ],
    severity: 'critical',
    category: 'Segurança',
    quickAction: { label: 'Ver Segurança', route: '/admin/security' }
  },

  brute_force_detected: {
    title: 'Ataque de Força Bruta Detectado',
    description: 'Múltiplas tentativas de login falhadas de um mesmo IP indicam possível ataque.',
    steps: [
      'O IP foi bloqueado automaticamente por 30 minutos',
      'Verifique se é um usuário legítimo ou ataque real',
      'Revise os logs para identificar o padrão de ataque',
      'Considere adicionar o IP à lista de bloqueio permanente',
      'Notifique a equipe de segurança se necessário'
    ],
    severity: 'critical',
    category: 'Segurança',
    quickAction: { label: 'Ver IPs Bloqueados', route: '/admin/ip-whitelist' }
  },

  // Database Issues
  database_error: {
    title: 'Erro de Banco de Dados',
    description: 'Falha ao acessar ou modificar dados no banco. Pode indicar problema de conexão ou permissão.',
    steps: [
      'Verifique a conexão com o banco de dados',
      'Revise as políticas RLS que podem estar bloqueando acesso',
      'Confira se os tipos de dados estão corretos na query',
      'Verifique os logs de auditoria para mais detalhes',
      'Se persistir, reinicie a conexão com o banco'
    ],
    severity: 'high',
    category: 'Banco de Dados',
    quickAction: { label: 'Ver Logs', route: '/admin/logs' }
  },

  rls_policy_error: {
    title: 'Erro de Política RLS',
    description: 'Uma política de segurança está bloqueando o acesso aos dados solicitados.',
    steps: [
      'Verifique se o usuário tem a role necessária para acessar os dados',
      'Revise a política RLS da tabela em questão',
      'Confirme se o user_id está correto na sessão',
      'Teste a query diretamente no console do Supabase',
      'Se necessário, ajuste a política RLS para permitir o acesso correto'
    ],
    severity: 'medium',
    category: 'Banco de Dados',
    quickAction: { label: 'Ver Segurança', route: '/admin/security' }
  },

  // Edge Function Issues
  edge_function_error: {
    title: 'Erro em Edge Function',
    description: 'Uma função de backend falhou durante a execução.',
    steps: [
      'Acesse os logs da edge function específica',
      'Verifique se todos os secrets necessários estão configurados',
      'Revise o timeout da função (padrão 30s)',
      'Confira se o payload de entrada está correto',
      'Teste a função manualmente com dados de teste'
    ],
    severity: 'high',
    category: 'Backend',
    quickAction: { label: 'Ver Logs', route: '/admin/logs' }
  },

  edge_function_timeout: {
    title: 'Timeout em Edge Function',
    description: 'A função demorou mais que o tempo limite para responder.',
    steps: [
      'Identifique qual operação está causando a lentidão',
      'Considere dividir a função em operações menores',
      'Otimize queries de banco de dados na função',
      'Aumente o timeout se a operação realmente precisa de mais tempo',
      'Implemente processamento assíncrono se possível'
    ],
    severity: 'medium',
    category: 'Backend',
    quickAction: { label: 'Ver Logs', route: '/admin/logs' }
  },

  // Backup Issues
  backup_failed: {
    title: 'Falha no Backup',
    description: 'O backup automático do sistema falhou. Dados podem estar em risco.',
    steps: [
      'Verifique o espaço disponível no storage',
      'Confira as permissões de escrita no bucket de backups',
      'Revise os logs do backup para identificar o erro',
      'Execute um backup manual para testar',
      'Verifique se o último backup válido está acessível'
    ],
    severity: 'critical',
    category: 'Infraestrutura',
    quickAction: { label: 'Gerenciar Backups', route: '/admin/backup' }
  },

  backup_verification_failed: {
    title: 'Verificação de Backup Falhou',
    description: 'O backup foi criado mas a verificação de integridade falhou.',
    steps: [
      'Não confie neste backup para restauração',
      'Execute um novo backup completo imediatamente',
      'Verifique se há corrupção nos dados de origem',
      'Revise os logs de verificação para detalhes',
      'Mantenha backups anteriores até confirmar um novo válido'
    ],
    severity: 'critical',
    category: 'Infraestrutura',
    quickAction: { label: 'Gerenciar Backups', route: '/admin/backup' }
  },

  // Admin Route Issues
  admin_route_error: {
    title: 'Erro na Rota Admin',
    description: 'Uma página administrativa encontrou um erro durante o carregamento.',
    steps: [
      'Tente recarregar a página (F5 ou Ctrl+R)',
      'Limpe o cache do navegador se o erro persistir',
      'Verifique se você tem permissões de admin ativas',
      'Revise os logs do sistema para identificar o erro',
      'Se persistir, entre em contato com o suporte técnico'
    ],
    severity: 'high',
    category: 'Interface',
    quickAction: { label: 'Ver Dashboard', route: '/admin/dashboard' }
  },

  professional_route_crash: {
    title: 'Erro na Área Profissional',
    description: 'Uma página da área profissional encontrou um erro crítico.',
    steps: [
      'Verifique se o pet shop do usuário está configurado corretamente',
      'Confirme que todas as permissões necessárias estão ativas',
      'Revise os dados do pet shop no banco de dados',
      'Verifique se há dados corrompidos ou incompletos',
      'Teste com outro usuário profissional para comparar'
    ],
    severity: 'high',
    category: 'Interface',
    quickAction: { label: 'Ver Usuários', route: '/admin/users' }
  },

  // Webhook Issues
  webhook_failed: {
    title: 'Falha no Webhook',
    description: 'Um webhook não conseguiu entregar a notificação ao endpoint configurado.',
    steps: [
      'Verifique se o URL do endpoint está correto e acessível',
      'Confirme que o endpoint aceita o método HTTP configurado',
      'Revise se o payload está no formato esperado pelo endpoint',
      'Verifique se há problemas de SSL/TLS no endpoint',
      'Teste o webhook manualmente com dados de exemplo'
    ],
    severity: 'medium',
    category: 'Integrações',
    quickAction: { label: 'Gerenciar Webhooks', route: '/admin/webhooks' }
  },

  // Health Check Issues
  health_check_critical: {
    title: 'Health Check Crítico',
    description: 'O sistema de saúde detectou um problema crítico que requer atenção imediata.',
    steps: [
      'Acesse o Dashboard de Saúde para ver detalhes completos',
      'Identifique qual componente está com problema',
      'Verifique se há serviços down ou degradados',
      'Revise os alertas relacionados para contexto',
      'Considere escalar a instância se for problema de recursos'
    ],
    severity: 'critical',
    category: 'Infraestrutura',
    quickAction: { label: 'Ver Saúde do Sistema', route: '/admin/system-health' }
  },

  disk_usage_high: {
    title: 'Uso de Disco Elevado',
    description: 'O armazenamento está acima de 80% da capacidade.',
    steps: [
      'Revise arquivos temporários que podem ser removidos',
      'Verifique logs antigos que podem ser arquivados',
      'Considere aumentar o espaço de armazenamento',
      'Identifique backups antigos que podem ser excluídos',
      'Implemente política de retenção de dados se ainda não existe'
    ],
    severity: 'high',
    category: 'Infraestrutura',
    quickAction: { label: 'Ver Métricas', route: '/admin/system-health' }
  },

  // Authentication Issues
  auth_error: {
    title: 'Erro de Autenticação',
    description: 'Houve um problema durante o processo de autenticação do usuário.',
    steps: [
      'Verifique se o token de sessão está válido',
      'Confirme que as credenciais do usuário estão corretas',
      'Revise os logs de autenticação para detalhes',
      'Verifique se há problemas com o provedor de auth',
      'Limpe cookies e cache do navegador se for um usuário específico'
    ],
    severity: 'medium',
    category: 'Autenticação',
    quickAction: { label: 'Ver Auth Monitor', route: '/admin/auth-monitor' }
  },

  mfa_error: {
    title: 'Erro de MFA',
    description: 'Houve um problema com a verificação de autenticação de dois fatores.',
    steps: [
      'Verifique se o código TOTP está sincronizado',
      'Confirme que o secret MFA do usuário está correto',
      'Ofereça opção de usar código de backup',
      'Se necessário, desabilite MFA temporariamente para o usuário',
      'Revise os logs para identificar o padrão de falha'
    ],
    severity: 'medium',
    category: 'Autenticação',
    quickAction: { label: 'Ver Usuários', route: '/admin/users' }
  },

  // Payment Issues
  payment_failed: {
    title: 'Falha no Pagamento',
    description: 'Um pagamento não foi processado corretamente.',
    steps: [
      'Verifique o status do pagamento no gateway (Cakto)',
      'Confirme que os dados do cartão estão corretos',
      'Revise se há problemas com a integração de pagamento',
      'Entre em contato com o cliente para atualizar dados se necessário',
      'Verifique logs do webhook de pagamento'
    ],
    severity: 'high',
    category: 'Financeiro',
    quickAction: { label: 'Ver Logs', route: '/admin/logs' }
  },

  // Notification Issues
  notification_failed: {
    title: 'Falha no Envio de Notificação',
    description: 'Uma notificação (email, SMS ou push) não foi entregue.',
    steps: [
      'Verifique se o serviço de notificação está configurado',
      'Confirme que os dados do destinatário estão corretos',
      'Revise os limites de envio do provedor',
      'Verifique se o template de mensagem está válido',
      'Tente reenviar a notificação manualmente'
    ],
    severity: 'medium',
    category: 'Notificações',
    quickAction: { label: 'Ver Logs', route: '/admin/logs' }
  },

  // Rate Limiting
  rate_limit_exceeded: {
    title: 'Limite de Requisições Excedido',
    description: 'Muitas requisições foram feitas em um curto período de tempo.',
    steps: [
      'Aguarde alguns minutos antes de tentar novamente',
      'Verifique se há automações fazendo requisições em excesso',
      'Revise se o limite está configurado adequadamente',
      'Considere implementar cache para reduzir requisições',
      'Se for tráfego legítimo, considere aumentar os limites'
    ],
    severity: 'low',
    category: 'Performance',
    quickAction: { label: 'Ver Configurações', route: '/admin/system-health' }
  },

  // Generic Errors
  unknown_error: {
    title: 'Erro Desconhecido',
    description: 'Um erro inesperado ocorreu no sistema.',
    steps: [
      'Revise os logs do sistema para identificar o erro',
      'Verifique se há atualizações recentes que podem ter causado o problema',
      'Tente reproduzir o erro para identificar o padrão',
      'Se persistir, entre em contato com o suporte técnico',
      'Documente os passos que levaram ao erro'
    ],
    severity: 'medium',
    category: 'Sistema',
    quickAction: { label: 'Ver Logs', route: '/admin/logs' }
  },

  network_error: {
    title: 'Erro de Rede',
    description: 'Não foi possível conectar ao servidor. Verifique sua conexão.',
    steps: [
      'Verifique sua conexão com a internet',
      'Tente acessar outras páginas para confirmar conectividade',
      'Aguarde alguns segundos e tente novamente',
      'Se estiver em rede corporativa, verifique firewall/proxy',
      'Limpe o cache DNS se necessário (ipconfig /flushdns)'
    ],
    severity: 'medium',
    category: 'Conectividade',
    quickAction: { label: 'Verificar Status', route: '/admin/system-health' }
  },

  permission_denied: {
    title: 'Permissão Negada',
    description: 'Você não tem permissão para acessar este recurso.',
    steps: [
      'Verifique se você está logado com a conta correta',
      'Confirme que sua role possui as permissões necessárias',
      'Entre em contato com um administrador para solicitar acesso',
      'Verifique se sua sessão não expirou',
      'Tente fazer logout e login novamente'
    ],
    severity: 'low',
    category: 'Autenticação',
    quickAction: { label: 'Ver Perfil', route: '/admin/dashboard' }
  },

  validation_error: {
    title: 'Erro de Validação',
    description: 'Os dados fornecidos não passaram na validação.',
    steps: [
      'Revise os campos obrigatórios marcados com erro',
      'Verifique se os formatos estão corretos (email, telefone, etc)',
      'Confirme que não há caracteres especiais inválidos',
      'Se for upload, verifique tamanho e tipo de arquivo',
      'Consulte a documentação para requisitos específicos'
    ],
    severity: 'low',
    category: 'Validação',
    quickAction: { label: 'Ver Ajuda', route: '/admin/dashboard' }
  }
};

// Função para detectar tipo de erro baseado na mensagem
export function detectErrorType(message: string): string {
  const patterns: [RegExp, string][] = [
    [/rate limit|too many requests/i, 'rate_limit_exceeded'],
    [/permission|unauthorized|forbidden|403/i, 'permission_denied'],
    [/network|fetch|connection|offline/i, 'network_error'],
    [/timeout|timed out/i, 'edge_function_timeout'],
    [/backup|restore/i, 'backup_failed'],
    [/database|query|sql|rls|row level/i, 'database_error'],
    [/auth|login|logout|session|token/i, 'auth_error'],
    [/mfa|2fa|totp|two.factor/i, 'mfa_error'],
    [/payment|charge|card|billing/i, 'payment_failed'],
    [/webhook/i, 'webhook_failed'],
    [/notification|email|sms|push/i, 'notification_failed'],
    [/health.check|critical|degraded/i, 'health_check_critical'],
    [/brute.force|attack/i, 'brute_force_detected'],
    [/blocked|ban/i, 'login_blocked'],
    [/security|suspicious/i, 'security_alert'],
    [/edge.function|function.error/i, 'edge_function_error'],
    [/validation|invalid|required/i, 'validation_error'],
    [/disk|storage|space/i, 'disk_usage_high'],
  ];

  for (const [pattern, type] of patterns) {
    if (pattern.test(message)) {
      return type;
    }
  }

  return 'unknown_error';
}

// Função para obter dica baseada no tipo de alerta
export function getErrorTip(alertType: string): ErrorTip | null {
  return ERROR_TIPS[alertType] || ERROR_TIPS['unknown_error'];
}

// Função para obter dica baseada na mensagem de erro
export function getErrorTipFromMessage(message: string): ErrorTip | null {
  const errorType = detectErrorType(message);
  return getErrorTip(errorType);
}

// Cores de severidade
export function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'critical': return 'text-red-600 bg-red-50 border-red-200';
    case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
    case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
    default: return 'text-gray-600 bg-gray-50 border-gray-200';
  }
}

// Badge de severidade
export function getSeverityBadgeVariant(severity: string): 'destructive' | 'default' | 'secondary' | 'outline' {
  switch (severity) {
    case 'critical': return 'destructive';
    case 'high': return 'destructive';
    case 'medium': return 'default';
    case 'low': return 'secondary';
    default: return 'outline';
  }
}
