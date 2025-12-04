import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useSiteImage } from "@/hooks/useSiteImages";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { AnimatedGradientText } from "@/components/ui/animated-gradient-text";
import { GlassCard } from "@/components/ui/glass-card";
import systemDashboardFallback from "@/assets/system-dashboard.jpg";

interface StepData {
  number: string;
  title: string;
  description: string;
  items: string[];
}

interface StepCardProps {
  step: StepData;
  index: number;
}

// Componente separado para evitar erro de Hooks
const StepCard = ({ step, index }: StepCardProps) => {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.2 });
  const isLeft = index % 2 === 0;
  
  return (
    <div
      ref={ref}
      className={`relative group scroll-reveal ${isLeft ? 'scroll-reveal-left' : 'scroll-reveal-right'} ${isVisible ? 'visible' : ''}`}
      style={{ transitionDelay: `${index * 150}ms` }}
    >
      {/* Step number indicator on the line */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 w-4 h-4 bg-primary rounded-full hidden lg:block z-10 group-hover:scale-150 transition-transform duration-300" />
      
      <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-2xl opacity-0 group-hover:opacity-100 blur-xl transition-all duration-500" />
      <GlassCard hover3D className="relative">
        <div className="flex items-start gap-6">
          <div className="text-6xl font-black bg-gradient-to-br from-primary/20 to-secondary/20 bg-clip-text text-transparent group-hover:from-primary group-hover:to-secondary transition-all duration-500">
            {step.number}
          </div>
          <div className="flex-1 space-y-4">
            <h3 className="text-2xl font-bold group-hover:text-primary transition-colors duration-300">
              {step.title}
            </h3>
            <p className="text-muted-foreground group-hover:text-foreground/80 transition-colors">
              {step.description}
            </p>
            <ul className="space-y-2">
              {step.items.map((item, i) => (
                <li 
                  key={i} 
                  className="flex items-center gap-2 text-sm group/item"
                  style={{ transitionDelay: `${i * 50}ms` }}
                >
                  <CheckCircle2 className="h-4 w-4 text-accent flex-shrink-0 group-hover/item:scale-125 group-hover/item:text-primary transition-all duration-300" />
                  <span className="group-hover/item:text-primary transition-colors">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

const HowItWorks = () => {
  const { url: systemDashboardUrl } = useSiteImage('system-dashboard');
  const systemDashboardImg = systemDashboardUrl && !systemDashboardUrl.includes('/src/assets/') 
    ? systemDashboardUrl 
    : systemDashboardFallback;

  const imageReveal = useScrollReveal({ threshold: 0.3 });

  const steps: StepData[] = [
    {
      number: "01",
      title: "Cadastre-se Gratuitamente",
      description: "Crie sua conta em menos de 2 minutos. Sem burocracia, sem cartão de crédito necessário.",
      items: ["Email e senha", "Dados do negócio", "Pronto para usar"]
    },
    {
      number: "02",
      title: "Configure Seu Pet Shop",
      description: "Personalize horários, serviços e valores. Nossa interface intuitiva torna tudo muito simples.",
      items: ["Defina serviços", "Configure agenda", "Adicione equipe"]
    },
    {
      number: "03",
      title: "Comece a Receber Clientes",
      description: "Seus clientes podem agendar online 24/7. Você recebe notificações e gerencia tudo em tempo real.",
      items: ["Agendamento online", "Lembretes automáticos", "Pagamento integrado"]
    },
    {
      number: "04",
      title: "Acompanhe Seu Crescimento",
      description: "Dashboard completo com métricas, relatórios e insights para aumentar seu faturamento.",
      items: ["Relatórios detalhados", "Análise de vendas", "Crescimento mensal"]
    }
  ];

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-background to-muted relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-20" />
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-secondary to-transparent opacity-20" />
      
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium animate-fade-in hover:bg-primary/20 transition-colors cursor-default group">
            <CheckCircle2 className="h-4 w-4 group-hover:scale-125 transition-transform" />
            <span className="group-hover:translate-x-1 transition-transform">Simples e Rápido</span>
          </div>
          <h2 className="text-4xl font-bold">
            Como <AnimatedGradientText shimmer>Funciona</AnimatedGradientText>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Em apenas 4 passos simples você transforma a gestão do seu pet shop
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          <div 
            ref={imageReveal.ref}
            className={`relative scroll-reveal scroll-reveal-left ${imageReveal.isVisible ? 'visible' : ''} group`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500" />
            <img
              src={systemDashboardImg}
              alt="Gestão profissional de pet shop com sistema moderno"
              className="relative rounded-2xl shadow-xl w-full h-auto object-cover group-hover:scale-[1.02] transition-transform duration-500"
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </div>
          <div className="space-y-6">
            <h3 className="text-3xl font-bold">
              Gerencie Tudo em <AnimatedGradientText>Um Só Lugar</AnimatedGradientText>
            </h3>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Dashboard intuitivo que centraliza agendamentos, clientes, serviços e relatórios. 
              Acesse de qualquer dispositivo e tenha controle total do seu negócio na palma da mão.
            </p>
            <ul className="space-y-3">
              {[
                "Interface moderna e fácil de usar",
                "Sincronização automática em tempo real",
                "Relatórios e métricas detalhadas"
              ].map((item, index) => (
                <li 
                  key={index}
                  className="flex items-start gap-3 group cursor-default animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0 mt-0.5 group-hover:scale-125 group-hover:text-primary transition-all duration-300" />
                  <span className="text-muted-foreground group-hover:text-foreground transition-colors">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Steps with connecting line */}
        <div className="relative">
          {/* Connecting line */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-full bg-gradient-to-b from-primary/20 via-secondary/20 to-primary/20 hidden lg:block rounded-full" />
          
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {steps.map((step, index) => (
              <StepCard key={index} step={step} index={index} />
            ))}
          </div>
        </div>

        <div className="text-center">
          <Link to="/auth">
            <MagneticButton
              strength={0.15}
              glowColor="hsl(var(--primary))"
              className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-10 py-6 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 group"
            >
              <span className="flex items-center gap-2">
                Começar Agora - É Grátis
                <ArrowRight className="h-5 w-5 group-hover:translate-x-2 transition-transform duration-300" />
              </span>
            </MagneticButton>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
