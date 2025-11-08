import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ReportOptions {
  start_date?: string;
  end_date?: string;
  report_type?: 'monthly' | 'weekly' | 'custom';
}

export function useSecurityReport() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const generateReport = async (options: ReportOptions = {}) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-security-report', {
        body: options
      });
      
      if (error) throw error;

      // Create a blob from the HTML response
      const blob = new Blob([data], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      
      // Create download link
      const a = document.createElement('a');
      a.href = url;
      a.download = `security-report-${new Date().toISOString().split('T')[0]}.html`;
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "✅ Relatório Gerado",
        description: "O relatório foi baixado com sucesso.",
      });

      return true;
    } catch (error) {
      console.error('Generate report error:', error);
      toast({
        title: "Erro ao Gerar Relatório",
        description: "Não foi possível gerar o relatório.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    generateReport,
  };
}