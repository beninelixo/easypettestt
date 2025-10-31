import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Stethoscope, Scissors, Store, Star, ArrowRight } from "lucide-react";

export const SegmentationSection = () => {
  const segments = [
    {
      icon: Stethoscope,
      title: "Clínicas Veterinárias",
      description: "Prontuário eletrônico completo, prescrições digitais, controle de vacinas e agenda médica integrada.",
      link: "/clinicas",
      color: "primary"
    },
    {
      icon: Store,
      title: "Pet Shops",
      description: "PDV moderno, controle de estoque inteligente, programa de fidelidade e análise de vendas em tempo real.",
      link: "/petshops",
      color: "secondary"
    },
    {
      icon: Scissors,
      title: "Banho e Tosa",
      description: "Agenda especializada com fotos antes/depois, galeria profissional e comunicação automática com tutores.",
      link: "/banho-tosa",
      color: "accent"
    }
  ];

  return (
    <section className="py-24 px-4" aria-labelledby="segmentation-heading">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-semibold mb-4">
            <Star className="h-4 w-4" aria-hidden="true" />
            Soluções Especializadas
          </div>
          <h2 id="segmentation-heading" className="text-4xl lg:text-5xl font-black">
            Ideal para qualquer negócio pet
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Funcionalidades específicas e otimizadas para cada segmento do mercado veterinário
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {segments.map((segment, index) => (
            <Link 
              key={index} 
              to={segment.link} 
              className="group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-lg"
              aria-label={`Explorar recursos para ${segment.title}`}
            >
              <Card className={`border-2 border-border hover:border-${segment.color} hover:shadow-2xl hover:-translate-y-4 transition-all duration-500 cursor-pointer h-full relative overflow-hidden hover-lift`}>
                <div className={`absolute inset-0 bg-gradient-to-br from-${segment.color}/0 via-${segment.color}/5 to-${segment.color}/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500`} aria-hidden="true" />
                <CardHeader className="relative space-y-4 pb-6">
                  <div className={`w-16 h-16 bg-gradient-to-br from-${segment.color}/20 to-${segment.color}/10 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg`}>
                    <segment.icon className={`h-9 w-9 text-${segment.color}`} aria-hidden="true" />
                  </div>
                  <CardTitle className={`text-2xl font-bold group-hover:text-${segment.color} transition-colors duration-300`}>
                    {segment.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 relative">
                  <CardDescription className="text-base leading-relaxed">
                    {segment.description}
                  </CardDescription>
                  <div className={`flex items-center text-${segment.color} font-semibold group-hover:gap-4 transition-all duration-300`}>
                    Explorar recursos
                    <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-3 transition-transform duration-300" aria-hidden="true" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
