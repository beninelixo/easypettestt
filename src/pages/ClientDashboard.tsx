import { EnhancedClientDashboard } from "@/components/client/EnhancedClientDashboard";
import { SEO } from "@/components/SEO";

export default function ClientDashboard() {
  return (
    <>
      <SEO 
        title="Painel do Cliente | EasyPet"
        description="Gerencie seus pets, agendamentos e acompanhe seu programa de fidelidade"
      />
      <div className="container mx-auto py-8 px-4 lg:px-6 animate-fade-in">
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
            Painel do Cliente
          </h1>
          <p className="text-muted-foreground mt-2 text-base">
            Bem-vindo de volta! Aqui está um resumo das suas atividades.
          </p>
        </div>
        
        <EnhancedClientDashboard />
      </div>
    </>
  );
}