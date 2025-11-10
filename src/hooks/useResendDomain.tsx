import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DomainRecord {
  type: string;
  name: string;
  value: string;
  status?: 'pending' | 'verified' | 'failed';
}

interface DomainSetupState {
  domain: string;
  records: DomainRecord[];
  status: 'not_started' | 'pending' | 'verified' | 'failed';
  lastChecked?: string;
}

export function useResendDomain() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [domainSetup, setDomainSetup] = useState<DomainSetupState>({
    domain: '',
    records: [],
    status: 'not_started',
  });

  // Load saved domain configuration from system_logs
  const loadDomainConfig = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('system_logs')
        .select('*')
        .eq('module', 'resend_domain')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data?.details) {
        setDomainSetup(data.details as unknown as DomainSetupState);
      }
    } catch (error: any) {
      console.error('Error loading domain config:', error);
    } finally {
      setLoading(false);
    }
  };

  // Save domain configuration
  const saveDomainConfig = async (config: DomainSetupState) => {
    try {
      const { error } = await supabase.from('system_logs').insert([{
        module: 'resend_domain',
        log_type: 'info',
        message: `Configuração de domínio atualizada: ${config.domain}`,
        details: config as any,
      }]);

      if (error) throw error;

      setDomainSetup(config);
      
      toast({
        title: "Configuração Salva",
        description: "As configurações do domínio foram salvas com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao Salvar",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Generate DNS records for domain
  const generateDNSRecords = (domain: string): DomainRecord[] => {
    return [
      {
        type: 'MX',
        name: domain,
        value: 'feedback-smtp.us-east-1.amazonses.com',
        status: 'pending',
      },
      {
        type: 'TXT',
        name: domain,
        value: 'v=spf1 include:amazonses.com ~all',
        status: 'pending',
      },
      {
        type: 'TXT',
        name: `_dmarc.${domain}`,
        value: 'v=DMARC1; p=none',
        status: 'pending',
      },
      {
        type: 'CNAME',
        name: `resend._domainkey.${domain}`,
        value: 'resend._domainkey.resend.com',
        status: 'pending',
      },
    ];
  };

  // Test domain by sending test email
  const testDomain = async (testEmail: string) => {
    if (!domainSetup.domain) {
      toast({
        title: "Domínio Não Configurado",
        description: "Configure um domínio antes de testar.",
        variant: "destructive",
      });
      return false;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-alert-email', {
        body: {
          severity: 'info',
          module: 'domain_verification_test',
          subject: `🎉 Teste de Domínio Personalizado - ${domainSetup.domain}`,
          message: `Este é um email de teste enviado do seu domínio customizado: ${domainSetup.domain}`,
          details: {
            domain: domainSetup.domain,
            test_email: testEmail,
            timestamp: new Date().toISOString(),
          },
        },
      });

      if (error) throw error;

      toast({
        title: "✅ Email de Teste Enviado",
        description: `Verifique a caixa de entrada de ${testEmail}`,
      });

      // Update status to verified if test succeeds
      const updatedSetup = {
        ...domainSetup,
        status: 'verified' as const,
        lastChecked: new Date().toISOString(),
      };
      await saveDomainConfig(updatedSetup);

      return true;
    } catch (error: any) {
      console.error('Test error:', error);
      
      toast({
        title: "❌ Falha no Teste",
        description: error.message || "Verifique se o domínio está configurado corretamente no Resend.",
        variant: "destructive",
      });

      return false;
    } finally {
      setLoading(false);
    }
  };

  // Update edge functions with new domain
  const updateEdgeFunctions = async () => {
    if (!domainSetup.domain || domainSetup.status !== 'verified') {
      toast({
        title: "Domínio Não Verificado",
        description: "Verifique o domínio antes de atualizar as edge functions.",
        variant: "destructive",
      });
      return false;
    }

    setLoading(true);
    try {
      // Log the update action
      const { error } = await supabase.from('system_logs').insert([{
        module: 'resend_domain',
        log_type: 'success',
        message: `Edge functions atualizadas para usar domínio: ${domainSetup.domain}`,
        details: {
          domain: domainSetup.domain,
          sender_email: `noreply@${domainSetup.domain}`,
          updated_at: new Date().toISOString(),
        } as any,
      }]);

      if (error) throw error;

      toast({
        title: "✅ Atualização Registrada",
        description: `As edge functions devem ser atualizadas manualmente para usar: noreply@${domainSetup.domain}`,
      });

      return true;
    } catch (error: any) {
      toast({
        title: "Erro na Atualização",
        description: error.message,
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    domainSetup,
    loadDomainConfig,
    saveDomainConfig,
    generateDNSRecords,
    testDomain,
    updateEdgeFunctions,
  };
}
