import { EnhancedClientDashboard } from "@/components/client/EnhancedClientDashboard";
import { SEO } from "@/components/SEO";

export default function ClientDashboard() {
  return (
    <>
      <SEO 
        title="Painel do Cliente | EasyPet"
        description="Gerencie seus pets, agendamentos e acompanhe seu programa de fidelidade"
      />
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Painel do Cliente</h1>
          <p className="text-muted-foreground mt-2">
            Bem-vindo de volta! Aqui está um resumo das suas atividades.
          </p>
        </div>
        
        <EnhancedClientDashboard />
      </div>
    </>
  );
}