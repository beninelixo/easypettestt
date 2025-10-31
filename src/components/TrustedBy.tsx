import { Building2, Users, TrendingUp, Award, CheckCircle2 } from "lucide-react";
import { useCountUp } from "@/hooks/useCountUp";
import happyClientsImg from "@/assets/happy-clients.jpg";

const StatCard = ({ stat, index }: { stat: any; index: number }) => {
  const isPercentage = stat.value.includes("%");
  const isYears = stat.label === "No Mercado";
  const numValue = parseInt(stat.value.replace(/[^0-9]/g, ""));
  
  const { count, ref } = useCountUp({ 
    end: numValue, 
    duration: 2500,
    start: 0 
  });

  const formatValue = () => {
    if (isPercentage) return `${count}%`;
    if (isYears) return `${count} Anos`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k+`;
    return `${count}+`;
  };

  return (
    <div
      ref={ref}
      className="text-center space-y-3 p-6 rounded-2xl hover:bg-muted transition-all duration-500 hover:scale-105 hover:shadow-lg cursor-pointer group animate-slide-up"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto group-hover:bg-primary/20 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
        <stat.icon className="h-7 w-7 text-primary group-hover:scale-110 transition-transform duration-300" />
      </div>
      <div className="text-4xl font-bold text-primary transition-all duration-300 group-hover:scale-110">
        {formatValue()}
      </div>
      <div className="font-semibold text-foreground">{stat.label}</div>
      <p className="text-sm text-muted-foreground">{stat.description}</p>
    </div>
  );
};

const TrustedBy = () => {
  const stats = [
    {
      icon: Building2,
      value: "350+",
      label: "Pet Shops Ativos",
      description: "Empresas usando diariamente",
    },
    {
      icon: Users,
      value: "15000+",
      label: "Pets Cadastrados",
      description: "Animais em nossa plataforma",
    },
    {
      icon: TrendingUp,
      value: "98%",
      label: "Satisfação",
      description: "Clientes satisfeitos",
    },
    {
      icon: Award,
      value: "3",
      label: "No Mercado",
      description: "Evoluindo constantemente",
    },
  ];

  return (
    <section className="py-20 px-4 bg-background">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium">
            <Award className="h-4 w-4" />
            Confiança e Resultados
          </div>
          <h2 className="text-4xl font-bold">
            Construindo a gestão do futuro para pet shops
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Sistema líder em inovação, focado em simplificar sua rotina e aumentar seus resultados
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <StatCard key={index} stat={stat} index={index} />
          ))}
        </div>

        <div className="mt-16 grid lg:grid-cols-2 gap-8 items-center">
          <div className="relative order-2 lg:order-1">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl blur-xl" />
            <img
              src={happyClientsImg}
              alt="Clientes satisfeitos com seus pets em ambiente de pet shop"
              className="relative rounded-2xl shadow-xl w-full h-auto object-cover"
            />
          </div>
          <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-3xl p-8 md:p-12 order-1 lg:order-2">
            <h3 className="text-2xl font-bold mb-8 text-center">Por Que Somos Confiáveis</h3>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div>
                  <p className="text-foreground font-semibold mb-1">100% Cloud & Seguro</p>
                  <p className="text-sm text-muted-foreground">
                    Seus dados protegidos com criptografia e acessíveis de qualquer lugar
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div>
                  <p className="text-foreground font-semibold mb-1">Suporte 24/7</p>
                  <p className="text-sm text-muted-foreground">
                    Equipe especializada pronta para ajudar quando você precisar
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div>
                  <p className="text-foreground font-semibold mb-1">+50 Atualizações por Ano</p>
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
  );
};

export default TrustedBy;
