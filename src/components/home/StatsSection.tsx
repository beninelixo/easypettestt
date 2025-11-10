import { useCountUp } from "@/hooks/useCountUp";
import { CheckCircle2, Shield, Clock } from "lucide-react";
import happyClientsImg from "@/assets/happy-clients.jpg";
import { useScrollReveal } from "@/hooks/useScrollReveal";

export const StatsSection = () => {
  const activeUsers = useCountUp({ end: 2500 });
  const cities = useCountUp({ end: 650 });
  const appointments = useCountUp({ end: 2100 });
  const imageReveal = useScrollReveal({ threshold: 0.3 });

  return (
    <>
      {/* Stats Bar */}
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

      {/* Trust Section */}
      <section className="py-20 px-4 bg-muted">
        <div className="container mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div 
              ref={imageReveal.ref}
              className={`relative scroll-reveal scroll-reveal-left ${imageReveal.isVisible ? 'visible' : ''}`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl blur-xl" />
              <img
                src={happyClientsImg}
                alt="Clientes satisfeitos com seus pets em ambiente de pet shop"
                className="relative rounded-2xl shadow-xl w-full h-auto object-cover"
              />
            </div>
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl lg:text-4xl font-black mb-4">
                  Por Que Somos Confiáveis
                </h2>
                <p className="text-xl text-muted-foreground">
                  Sistema líder em inovação, focado em simplificar sua rotina
                </p>
              </div>
              <div className="space-y-6">
                <div className="flex items-start gap-4 p-4 rounded-xl bg-background hover:shadow-lg transition-shadow duration-300">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <Shield className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <div>
                    <p className="text-foreground font-bold mb-1">100% Cloud & Seguro</p>
                    <p className="text-sm text-muted-foreground">
                      Seus dados protegidos com criptografia e acessíveis de qualquer lugar
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 rounded-xl bg-background hover:shadow-lg transition-shadow duration-300">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <Clock className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <div>
                    <p className="text-foreground font-bold mb-1">Suporte 24/7</p>
                    <p className="text-sm text-muted-foreground">
                      Equipe especializada pronta para ajudar quando você precisar
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 rounded-xl bg-background hover:shadow-lg transition-shadow duration-300">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <div>
                    <p className="text-foreground font-bold mb-1">+50 Atualizações por Ano</p>
                    <p className="text-sm text-muted-foreground">
                      Sistema sempre evoluindo com novas funcionalidades
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
