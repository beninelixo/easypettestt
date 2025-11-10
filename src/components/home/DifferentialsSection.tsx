import { CheckCircle2, Zap, Smartphone, Wallet, Building2, HeadphonesIcon, Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const DifferentialsSection = () => {
  const differentials = [
    {
      icon: Smartphone,
      title: "API Aberta para Integrações",
      description: "Conecte com outros sistemas facilmente",
    },
    {
      icon: Wallet,
      title: "WhatsApp Business Integrado",
      description: "Comunicação automática com seus clientes",
    },
    {
      icon: Award,
      title: "Sistema de Fidelidade Gamificado",
      description: "Aumente a retenção de clientes automaticamente",
    },
    {
      icon: Building2,
      title: "Controle Multi-unidades e Franquias",
      description: "Gerencie várias unidades em uma única plataforma",
    },
    {
      icon: Zap,
      title: "Notas Fiscais Automáticas",
      description: "Emissão automática e integrada com a contabilidade",
    },
    {
      icon: HeadphonesIcon,
      title: "Suporte 24/7 em Português",
      description: "Equipe sempre disponível para ajudar",
    },
  ];

  return (
    <section className="py-24 px-4 bg-background" aria-labelledby="differentials-heading">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-semibold mb-4">
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            Diferenciais Exclusivos
          </div>
          <h2 id="differentials-heading" className="text-4xl lg:text-5xl font-black">
            O que nos torna únicos no mercado
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Recursos exclusivos que transformam a gestão do seu negócio pet
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {differentials.map((item, index) => (
            <Card
              key={index}
              className="border-2 border-border hover:border-primary hover:shadow-xl transition-all duration-500 hover:-translate-y-2 animate-fade-in bg-muted group cursor-pointer"
              style={{ animationDelay: `${index * 0.1}s` }}
              tabIndex={0}
              role="article"
              aria-label={item.title}
            >
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                  <item.icon className="h-6 w-6 text-primary" aria-hidden="true" />
                </div>
                <h3 className="font-bold text-lg group-hover:text-primary transition-colors duration-300">
                  {item.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {item.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};