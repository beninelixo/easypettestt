import { Card, CardContent } from "@/components/ui/card";
import { Star, Quote } from "lucide-react";
import { useSiteImage } from "@/hooks/useSiteImages";
import vetCareFallback from "@/assets/vet-care.jpg";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { AnimatedGradientText } from "@/components/ui/animated-gradient-text";
import { GlowingBorder } from "@/components/ui/glowing-border";
import { cn } from "@/lib/utils";

const Testimonials = () => {
  const imageReveal = useScrollReveal({ threshold: 0.3 });
  
  const { url: vetCareUrl } = useSiteImage('vet-care');
  const vetCareImg = vetCareUrl && !vetCareUrl.includes('/src/assets/') 
    ? vetCareUrl 
    : vetCareFallback;

  const testimonials = [
    {
      name: "Dr. Carlos Mendes",
      role: "Veterinário - Pet Care Center",
      location: "São Paulo, SP",
      image: "https://ui-avatars.com/api/?name=Carlos+Mendes&background=0D8ABC&color=fff&size=128",
      rating: 5,
      text: "Estou extremamente satisfeito com o EasyPet. Testei vários sistemas ao longo de 12 anos e este é o primeiro que realmente atende todas as necessidades da minha clínica. Sistema completo e intuitivo!",
      highlight: "realmente atende todas as necessidades",
    },
    {
      name: "Ana Paula Silva",
      role: "Proprietária - Banho & Tosa Feliz",
      location: "Rio de Janeiro, RJ",
      image: "https://ui-avatars.com/api/?name=Ana+Silva&background=0D8ABC&color=fff&size=128",
      rating: 5,
      text: "O controle de agendamentos melhorou 300% nossa produtividade. Os lembretes automáticos reduziram drasticamente o número de faltas. Recomendo muito!",
      highlight: "melhorou 300% nossa produtividade",
    },
    {
      name: "Roberto Costa",
      role: "Gerente - Pet Shop Vida Animal",
      location: "Belo Horizonte, MG",
      image: "https://ui-avatars.com/api/?name=Roberto+Costa&background=0D8ABC&color=fff&size=128",
      rating: 5,
      text: "Conseguimos integrar nossa clínica, pet shop e banho e tosa em um único sistema. Antes eram três plataformas diferentes. Economizamos tempo e dinheiro!",
      highlight: "Economizamos tempo e dinheiro",
    },
  ];

  return (
    <section className="py-20 px-4 bg-muted relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute top-10 right-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: "5s" }} />
      <div className="absolute bottom-10 left-10 w-64 h-64 bg-secondary/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: "6s", animationDelay: "1s" }} />
      
      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl font-bold">
            O que nossos <AnimatedGradientText shimmer>clientes dizem</AnimatedGradientText>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Histórias reais de profissionais que transformaram sua gestão com o EasyPet
          </p>
        </div>

        <div className="mb-16">
          <div 
            ref={imageReveal.ref}
            className={`relative max-w-4xl mx-auto scroll-reveal scroll-reveal-zoom ${imageReveal.isVisible ? 'visible' : ''} group`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500" />
            <img
              src={vetCareImg}
              alt="Veterinária cuidando de pet com carinho e profissionalismo"
              className="relative rounded-2xl shadow-xl w-full h-auto object-cover group-hover:scale-[1.02] transition-transform duration-500"
            />
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-background/50 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => {
            const { ref, isVisible } = useScrollReveal({ threshold: 0.2 });
            
            return (
              <div
                key={index}
                ref={ref}
                className={`scroll-reveal scroll-reveal-up ${isVisible ? 'visible' : ''}`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <GlowingBorder
                  glowColor="hsl(var(--primary))"
                  intensity="low"
                  borderRadius="1rem"
                >
                  <Card className="border-border hover:shadow-2xl transition-all duration-500 h-full group bg-card">
                    <CardContent className="p-6 space-y-4">
                      {/* Quote icon */}
                      <Quote className="h-10 w-10 text-primary/20 group-hover:text-primary/40 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500" />
                      
                      {/* Stars */}
                      <div className="flex gap-1">
                        {Array.from({ length: testimonial.rating }).map((_, i) => (
                          <Star 
                            key={i} 
                            className="h-5 w-5 fill-secondary text-secondary transition-all duration-300 hover:scale-125"
                            style={{ animationDelay: `${i * 100}ms` }}
                          />
                        ))}
                      </div>

                      {/* Testimonial text */}
                      <p className="text-muted-foreground leading-relaxed group-hover:text-foreground/80 transition-colors">
                        "{testimonial.text}"
                      </p>

                      {/* Author info */}
                      <div className="flex items-center gap-4 pt-4 border-t border-border">
                        <div className="relative">
                          <div className="absolute inset-0 bg-primary/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                          <img
                            src={testimonial.image}
                            alt={testimonial.name}
                            className="w-12 h-12 rounded-full relative group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground group-hover:text-primary transition-colors">{testimonial.name}</p>
                          <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                          <p className="text-xs text-muted-foreground">{testimonial.location}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </GlowingBorder>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
