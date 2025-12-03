import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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

export function useGodActions() {
  const { toast } = useToast();
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const executeAction = async (action: string) => {
    setLoadingAction(action);
    
    toast({
      title: "⚡ Executando ação DEUS",
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
      }

      // Registrar sucesso na auditoria
      await logGodAction(action, true, result.data);

      toast({
        title: "✅ Ação concluída!",
        description: `${getActionName(action)} executado com sucesso`,
      });
      
      setLoadingAction(null);
      return true;
    } catch (error) {
      console.error('Erro ao executar ação:', error);
      
      // Registrar falha na auditoria
      await logGodAction(action, false, { 
        error: error instanceof Error ? error.message : "Erro desconhecido" 
      });
      
      toast({
        title: "❌ Erro na execução",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
      setLoadingAction(null);
      return false;
    }
  };

  const getActionName = (action: string): string => {
    const names: Record<string, string> = {
      cleanup: 'Limpeza de dados antigos',
      backup: 'Backup completo',
      ai_analysis: 'Análise com IA',
      fix_rls: 'Verificação RLS',
      fix_duplicates: 'Detecção de duplicatas',
      cleanup_users: 'Limpeza de usuários de teste',
    };
    return names[action] || action;
  };

  return { executeAction, loadingAction };
}
