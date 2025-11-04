import { useCountUp } from "@/hooks/useCountUp";

export const StatsSection = () => {
  const activeUsers = useCountUp({ end: 2500 });
  const cities = useCountUp({ end: 650 });
  const appointments = useCountUp({ end: 2100 });

  return (
    <section className="py-12 px-4 bg-gradient-to-r from-primary via-secondary to-primary relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-10" />
      <div className="container mx-auto relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center space-y-2 animate-fade-in" ref={activeUsers.ref}>
            <div className="text-5xl lg:text-6xl font-black text-white">
              +{activeUsers.count.toLocaleString('pt-BR')}
            </div>
            <div className="text-sm lg:text-base font-semibold text-white/90 uppercase tracking-wide">
              Usuários Ativos
            </div>
          </div>
          <div className="text-center space-y-2 animate-fade-in" style={{ animationDelay: "0.1s" }} ref={cities.ref}>
            <div className="text-5xl lg:text-6xl font-black text-white">
              +{cities.count}
            </div>
            <div className="text-sm lg:text-base font-semibold text-white/90 uppercase tracking-wide">
              Cidades no Brasil
            </div>
          </div>
          <div className="text-center space-y-2 animate-fade-in" style={{ animationDelay: "0.2s" }} ref={appointments.ref}>
            <div className="text-5xl lg:text-6xl font-black text-white">
              +{(appointments.count / 1000).toFixed(1)} mi
            </div>
            <div className="text-sm lg:text-base font-semibold text-white/90 uppercase tracking-wide">
              Atendimentos
            </div>
          </div>
          <div className="text-center space-y-2 animate-fade-in bg-gradient-to-br from-yellow-500/20 to-amber-500/20 rounded-2xl p-4 border-2 border-yellow-500/30" style={{ animationDelay: "0.3s" }}>
            <div className="text-5xl lg:text-6xl font-black text-white">
              R$ 79,90
            </div>
            <div className="text-sm lg:text-base font-semibold text-white/90 uppercase tracking-wide">
              Plano Pet Gold/mês
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
