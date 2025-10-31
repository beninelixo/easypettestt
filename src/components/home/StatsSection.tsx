import { useCountUp } from "@/hooks/useCountUp";

export const StatsSection = () => {
  const activeUsers = useCountUp({ end: 2500 });
  const cities = useCountUp({ end: 650 });
  const appointments = useCountUp({ end: 2100 });
  const sales = useCountUp({ end: 1800 });

  return (
    <section className="py-12 px-4 bg-gradient-to-r from-primary via-secondary to-primary relative overflow-hidden" aria-label="Estatísticas da plataforma">
      <div className="absolute inset-0 bg-grid-pattern opacity-10" aria-hidden="true" />
      <div className="container mx-auto relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center space-y-2 animate-fade-in" ref={activeUsers.ref}>
            <div className="text-5xl lg:text-6xl font-black text-white" aria-label={`Mais de ${activeUsers.count} usuários ativos`}>
              +{activeUsers.count.toLocaleString('pt-BR')}
            </div>
            <div className="text-sm lg:text-base font-semibold text-white/90 uppercase tracking-wide">
              Usuários Ativos
            </div>
          </div>
          <div className="text-center space-y-2 animate-fade-in" style={{ animationDelay: "0.1s" }} ref={cities.ref}>
            <div className="text-5xl lg:text-6xl font-black text-white" aria-label={`Mais de ${cities.count} cidades`}>
              +{cities.count}
            </div>
            <div className="text-sm lg:text-base font-semibold text-white/90 uppercase tracking-wide">
              Cidades no Brasil
            </div>
          </div>
          <div className="text-center space-y-2 animate-fade-in" style={{ animationDelay: "0.2s" }} ref={appointments.ref}>
            <div className="text-5xl lg:text-6xl font-black text-white" aria-label={`Mais de ${(appointments.count / 1000).toFixed(1)} milhões de atendimentos`}>
              +{(appointments.count / 1000).toFixed(1)} mi
            </div>
            <div className="text-sm lg:text-base font-semibold text-white/90 uppercase tracking-wide">
              Atendimentos
            </div>
          </div>
          <div className="text-center space-y-2 animate-fade-in" style={{ animationDelay: "0.3s" }} ref={sales.ref}>
            <div className="text-5xl lg:text-6xl font-black text-white" aria-label={`Mais de ${(sales.count / 1000).toFixed(1)} milhões de vendas`}>
              +{(sales.count / 1000).toFixed(1)} mi
            </div>
            <div className="text-sm lg:text-base font-semibold text-white/90 uppercase tracking-wide">
              Vendas Realizadas
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
