import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
      switch (action) {
        case 'cleanup':
          await supabase.functions.invoke('cleanup-job');
          break;
        case 'backup':
          await supabase.functions.invoke('backup-full-database');
          break;
        case 'ai_analysis':
          await supabase.functions.invoke('system-analysis');
          break;
        case 'fix_rls':
          // Verificar RLS policies via edge function
          await supabase.functions.invoke('generate-security-report');
          break;
        case 'fix_duplicates':
          // Detectar duplicatas via análise do sistema
          await supabase.functions.invoke('auto-diagnostico');
          break;
      }

      toast({
        title: "✅ Ação concluída!",
        description: `${getActionName(action)} executado com sucesso`,
      });
      
      setLoadingAction(null);
      return true;
    } catch (error) {
      console.error('Erro ao executar ação:', error);
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
    };
    return names[action] || action;
  };

  return { executeAction, loadingAction };
}
