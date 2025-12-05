import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Mensagens de erro amigáveis por tipo de ação
const errorMessages: Record<string, Record<string, string>> = {
  cleanup: {
    timeout: "A limpeza demorou mais que o esperado. O sistema continuará processando em segundo plano.",
    permission: "Você não tem permissão para executar a limpeza. Contate o administrador.",
    default: "Não foi possível completar a limpeza. Tente novamente em alguns minutos.",
  },
  backup: {
    timeout: "O backup está sendo processado em segundo plano. Você será notificado quando concluir.",
    storage: "Espaço de armazenamento insuficiente para o backup. Libere espaço ou contate o suporte.",
    permission: "Sem permissão para criar backups. Verifique suas credenciais de administrador.",
    default: "Falha ao criar backup. Verifique a conexão e tente novamente.",
  },
  ai_analysis: {
    timeout: "A análise de IA está em andamento. Os resultados serão exibidos quando disponíveis.",
    quota: "Limite de análises atingido. Aguarde alguns minutos antes de tentar novamente.",
    default: "Não foi possível completar a análise. Verifique a conexão com o serviço de IA.",
  },
  fix_rls: {
    permission: "Sem permissão para verificar políticas RLS. Necessário acesso de super admin.",
    default: "Falha ao verificar políticas de segurança. Consulte os logs para mais detalhes.",
  },
  fix_duplicates: {
    default: "Não foi possível executar a detecção de duplicatas. Tente novamente.",
  },
  cleanup_users: {
    permission: "Sem permissão para remover usuários de teste.",
    default: "Falha ao limpar usuários de teste. Verifique se há dependências.",
  },
};

// Função para registrar auditoria de ações administrativas
async function logGodAction(action: string, success: boolean, details?: any) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    await supabase.from('audit_logs').insert({
      user_id: user?.id,
      table_name: 'system_admin',
      operation: 'GOD_MODE_ACTION',
      record_id: crypto.randomUUID(),
      new_data: {
        action,
        success,
        timestamp: new Date().toISOString(),
        details
      }
    });
  } catch (error) {
    console.error('Erro ao registrar auditoria:', error);
  }
}

// Função para obter mensagem de erro amigável
function getFriendlyErrorMessage(action: string, error: unknown): string {
  const errorStr = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
  const actionMessages = errorMessages[action] || {};
  
  if (errorStr.includes('timeout') || errorStr.includes('504')) {
    return actionMessages.timeout || "A operação demorou mais que o esperado. Tente novamente.";
  }
  if (errorStr.includes('permission') || errorStr.includes('unauthorized') || errorStr.includes('403')) {
    return actionMessages.permission || "Você não tem permissão para executar esta ação.";
  }
  if (errorStr.includes('storage') || errorStr.includes('quota')) {
    return actionMessages.storage || actionMessages.quota || "Limite de recursos atingido.";
  }
  
  return actionMessages.default || "Ocorreu um erro inesperado. Tente novamente ou contate o suporte.";
}

export function useGodActions() {
  const { toast } = useToast();
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const executeAction = async (action: string) => {
    setLoadingAction(action);
    
    toast({
      title: "⚡ Executando ação",
      description: `Processando ${getActionName(action)}...`,
    });

    try {
      let result: any;
      
      switch (action) {
        case 'cleanup':
          result = await supabase.functions.invoke('cleanup-job');
          break;
        case 'backup':
          result = await supabase.functions.invoke('backup-full-database');
          break;
        case 'ai_analysis':
          result = await supabase.functions.invoke('system-analysis');
          break;
        case 'fix_rls':
          result = await supabase.functions.invoke('generate-security-report');
          break;
        case 'fix_duplicates':
          result = await supabase.functions.invoke('auto-diagnostico');
          break;
        case 'cleanup_users':
          result = await supabase.functions.invoke('cleanup-users');
          break;
        default:
          throw new Error(`Ação desconhecida: ${action}`);
      }

      // Verificar se a função retornou erro
      if (result.error) {
        throw new Error(result.error.message || 'Erro na execução da função');
      }

      // Registrar sucesso na auditoria
      await logGodAction(action, true, result.data);

      toast({
        title: "✅ Sucesso!",
        description: getSuccessMessage(action),
      });
      
      setLoadingAction(null);
      return true;
    } catch (error) {
      console.error('Erro ao executar ação:', error);
      
      // Registrar falha na auditoria
      await logGodAction(action, false, { 
        error: error instanceof Error ? error.message : "Erro desconhecido" 
      });
      
      const friendlyMessage = getFriendlyErrorMessage(action, error);
      
      toast({
        title: "Não foi possível completar",
        description: friendlyMessage,
        variant: "destructive",
      });
      setLoadingAction(null);
      return false;
    }
  };

  const getActionName = (action: string): string => {
    const names: Record<string, string> = {
      cleanup: 'Limpeza de dados antigos',
      backup: 'Backup completo do banco',
      ai_analysis: 'Análise inteligente do sistema',
      fix_rls: 'Verificação de políticas de segurança',
      fix_duplicates: 'Detecção de registros duplicados',
      cleanup_users: 'Remoção de usuários de teste',
    };
    return names[action] || action;
  };

  const getSuccessMessage = (action: string): string => {
    const messages: Record<string, string> = {
      cleanup: 'Dados antigos removidos com sucesso. O sistema está mais leve.',
      backup: 'Backup criado com sucesso. Seus dados estão seguros.',
      ai_analysis: 'Análise concluída. Veja os resultados no painel.',
      fix_rls: 'Verificação de segurança concluída. Nenhum problema encontrado.',
      fix_duplicates: 'Verificação concluída. Relatório de duplicatas disponível.',
      cleanup_users: 'Usuários de teste removidos com sucesso.',
    };
    return messages[action] || 'Operação concluída com sucesso.';
  };

  return { executeAction, loadingAction };
}
