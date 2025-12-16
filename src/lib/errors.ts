export class AppError extends Error {
  constructor(
    message: string,
    public userMessage: string,
    public code?: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const errorMessages: Record<string, string> = {
  // Authentication errors
  'auth/invalid-credentials': 'Email ou senha incorretos',
  'auth/email-already-exists': 'Este email já está cadastrado',
  'auth/weak-password': 'A senha deve ter pelo menos 10 caracteres com maiúsculas, minúsculas, números e símbolos',
  'auth/too-many-requests': 'Muitas tentativas. Tente novamente em alguns minutos',
  'auth/user-not-found': 'Usuário não encontrado',
  'auth/invalid-token': 'Token inválido ou expirado',
  'auth/session-expired': 'Sua sessão expirou. Faça login novamente',
  
  // Database errors
  'db/not-found': 'Registro não encontrado',
  'db/constraint-violation': 'Operação não permitida devido a restrições',
  'db/duplicate-entry': 'Este registro já existe',
  'db/connection-error': 'Erro de conexão com o banco de dados',
  
  // Permission errors
  'permission/denied': 'Você não tem permissão para esta ação',
  'permission/unauthorized': 'Acesso não autorizado',
  
  // Validation errors
  'validation/invalid-input': 'Por favor, verifique os dados informados',
  'validation/required-field': 'Preencha todos os campos obrigatórios',
  'validation/invalid-email': 'Email inválido',
  'validation/invalid-phone': 'Telefone inválido',
  'validation/invalid-cpf': 'CPF inválido',
  'validation/invalid-cnpj': 'CNPJ inválido',
  
  // Network errors
  'network/timeout': 'Tempo de conexão esgotado. Tente novamente',
  'network/offline': 'Você está offline. Verifique sua conexão',
  'network/server-error': 'Erro no servidor. Tente novamente mais tarde',
  
  // Business logic errors
  'appointment/slot-unavailable': 'Este horário não está mais disponível',
  'appointment/past-date': 'Não é possível agendar para datas passadas',
  'payment/failed': 'Falha no pagamento. Verifique os dados do cartão',
  'subscription/expired': 'Sua assinatura expirou',
  
  // Generic
  'unknown': 'Ocorreu um erro inesperado',
};

export function getErrorMessage(code: string): string {
  return errorMessages[code] || errorMessages['unknown'];
}

export function handleError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof Error) {
    const anyError = error as any;
    
    // Handle Supabase errors
    if (anyError.code) {
      const userMessage = getErrorMessage(anyError.code);
      return new AppError(error.message, userMessage, anyError.code);
    }
    
    // Handle fetch/network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return new AppError(error.message, errorMessages['network/offline'], 'network/offline');
    }
    
    // Handle timeout errors
    if (error.message.includes('timeout')) {
      return new AppError(error.message, errorMessages['network/timeout'], 'network/timeout');
    }
    
    return new AppError(error.message, errorMessages['unknown'], 'unknown');
  }

  return new AppError(
    String(error),
    errorMessages['unknown'],
    'unknown'
  );
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}
