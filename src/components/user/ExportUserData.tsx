import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, FileJson, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface ExportData {
  profile: any;
  pets: any[];
  appointments: any[];
  exportDate: string;
  version: string;
}

export function ExportUserData() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);

  const exportData = async () => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para exportar seus dados.",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);
    setExportComplete(false);

    try {
      // Fetch user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }

      // Fetch user's pets
      const { data: pets, error: petsError } = await supabase
        .from('pets')
        .select('*')
        .eq('owner_id', user.id)
        .is('deleted_at', null);

      if (petsError) throw petsError;

      // Fetch user's appointments
      const { data: appointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select(`
          *,
          services (name, price),
          pet_shops (name)
        `)
        .eq('client_id', user.id)
        .is('deleted_at', null);

      if (appointmentsError) throw appointmentsError;

      // Prepare export data
      const exportData: ExportData = {
        profile: profile ? {
          full_name: profile.full_name,
          phone: profile.phone,
          address: profile.address,
          contact_preference: profile.contact_preference,
          created_at: profile.created_at,
          updated_at: profile.updated_at,
        } : null,
        pets: (pets || []).map(pet => ({
          name: pet.name,
          species: pet.species,
          breed: pet.breed,
          age: pet.age,
          weight: pet.weight,
          gender: pet.gender,
          coat_color: pet.coat_color,
          coat_type: pet.coat_type,
          size: pet.size,
          neutered: pet.neutered,
          temperament: pet.temperament,
          allergies: pet.allergies,
          chronic_diseases: pet.chronic_diseases,
          observations: pet.observations,
          grooming_preferences: pet.grooming_preferences,
          restrictions: pet.restrictions,
          birth_date: pet.birth_date,
          vaccination_history: pet.vaccination_history,
          created_at: pet.created_at,
        })),
        appointments: (appointments || []).map(apt => ({
          scheduled_date: apt.scheduled_date,
          scheduled_time: apt.scheduled_time,
          status: apt.status,
          service_name: apt.services?.name,
          service_price: apt.services?.price,
          pet_shop_name: apt.pet_shops?.name,
          notes: apt.notes,
          created_at: apt.created_at,
          completed_at: apt.completed_at,
        })),
        exportDate: new Date().toISOString(),
        version: '1.0',
      };

      // Create and download JSON file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `easypet_meus_dados_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setExportComplete(true);
      toast({
        title: "Exportação Concluída",
        description: "Seus dados foram exportados com sucesso!",
      });

      // Reset success state after 5 seconds
      setTimeout(() => setExportComplete(false), 5000);

    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: "Erro na Exportação",
        description: "Não foi possível exportar seus dados. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileJson className="h-5 w-5 text-primary" aria-hidden="true" />
          Exportar Meus Dados
        </CardTitle>
        <CardDescription>
          Conforme a LGPD (Art. 18), você tem direito a receber uma cópia dos seus dados pessoais em formato legível.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground space-y-2">
          <p>O arquivo exportado incluirá:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Seu perfil (nome, contato, endereço)</li>
            <li>Seus pets cadastrados</li>
            <li>Histórico de agendamentos</li>
          </ul>
          <p className="text-xs mt-3">
            O arquivo será baixado no formato JSON, que pode ser aberto em qualquer editor de texto ou importado em outras aplicações.
          </p>
        </div>

        <Button
          onClick={exportData}
          disabled={isExporting}
          className="w-full sm:w-auto"
          aria-label={isExporting ? "Exportando dados..." : "Baixar meus dados em formato JSON"}
        >
          {isExporting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden="true" />
              Exportando...
            </>
          ) : exportComplete ? (
            <>
              <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" aria-hidden="true" />
              Exportado!
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" aria-hidden="true" />
              Baixar Meus Dados
            </>
          )}
        </Button>

        {!user && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
            <AlertCircle className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
            <span>Você precisa estar logado para exportar seus dados.</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default ExportUserData;
