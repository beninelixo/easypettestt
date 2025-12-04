import { CheckCircle2, Zap, Smartphone, Wallet, Building2, HeadphonesIcon, Award, LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { AnimatedGradientText } from "@/components/ui/animated-gradient-text";
import { cn } from "@/lib/utils";

interface DifferentialData {
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
}

interface DifferentialCardProps {
  item: DifferentialData;
  index: number;
}

// Componente separado para evitar erro de Hooks
const DifferentialCard = ({ item, index }: DifferentialCardProps) => {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.2 });
  const direction = index % 2 === 0 ? 'scroll-reveal-left' : 'scroll-reveal-right';
  
  return (
    <div
      ref={ref}
      className={`scroll-reveal ${direction} ${isVisible ? 'visible' : ''}`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <Card
        className="border-2 border-border hover:border-primary/50 hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 bg-card group cursor-pointer h-full relative overflow-hidden"
        tabIndex={0}
        role="article"
        aria-label={item.title}
      >
        {/* Gradient border effect on hover */}
        <div className={cn(
          "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500",
          "bg-gradient-to-r",
          item.color,
          "blur-xl -z-10"
        )} />
        
        <CardContent className="p-6 space-y-4 relative">
          <div className={cn(
            "w-14 h-14 rounded-xl flex items-center justify-center",
            "bg-gradient-to-br shadow-lg",
            "group-hover:scale-110 group-hover:rotate-12 transition-all duration-500",
            "group-hover:shadow-xl",
            item.color.replace('from-', 'from-').replace('to-', 'to-') + '/20'
          )}>
            <item.icon className="h-7 w-7 text-primary group-hover:text-white transition-colors duration-300" aria-hidden="true" />
          </div>
          <h3 className="font-bold text-lg group-hover:text-primary transition-colors duration-300">
            {item.title}
          </h3>
          <p className="text-muted-foreground text-sm leading-relaxed group-hover:text-foreground/80 transition-colors">
            {item.description}
          </p>
          
          {/* Decorative line */}
          <div className="h-1 w-0 group-hover:w-full bg-gradient-to-r from-primary to-secondary transition-all duration-500 rounded-full" />
        </CardContent>
      </Card>
    </div>
  );
};

export const DifferentialsSection = () => {
  const differentials: DifferentialData[] = [
    {
      icon: Smartphone,
      title: "API Aberta para Integrações",
      description: "Conecte com outros sistemas facilmente",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Wallet,
      title: "WhatsApp Business Integrado",
      description: "Comunicação automática com seus clientes",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: Award,
      title: "Sistema de Fidelidade Gamificado",
      description: "Aumente a retenção de clientes automaticamente",
      color: "from-yellow-500 to-amber-500",
    },
    {
      icon: Building2,
      title: "Controle Multi-unidades e Franquias",
      description: "Gerencie várias unidades em uma única plataforma",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: Zap,
      title: "Notas Fiscais Automáticas",
      description: "Emissão automática e integrada com a contabilidade",
      color: "from-orange-500 to-red-500",
    },
    {
      icon: HeadphonesIcon,
      title: "Suporte 24/7 em Português",
      description: "Equipe sempre disponível para ajudar",
      color: "from-indigo-500 to-violet-500",
    },
  ];

  return (
    <section className="py-24 px-4 bg-background relative overflow-hidden" aria-labelledby="differentials-heading">
      {/* Animated background elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: "6s" }} />
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-secondary/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: "7s", animationDelay: "2s" }} />
      
      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-semibold mb-4 animate-fade-in hover:bg-primary/20 transition-colors cursor-default group">
            <CheckCircle2 className="h-4 w-4 group-hover:scale-125 transition-transform" aria-hidden="true" />
            <span className="group-hover:translate-x-1 transition-transform">Diferenciais Exclusivos</span>
          </div>
          <h2 id="differentials-heading" className="text-4xl lg:text-5xl font-black">
            O que nos torna <AnimatedGradientText shimmer glow>únicos</AnimatedGradientText> no mercado
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Recursos exclusivos que transformam a gestão do seu negócio pet
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {differentials.map((item, index) => (
            <DifferentialCard key={index} item={item} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};
