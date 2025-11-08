import { Card, CardContent } from "@/components/ui/card";
import { Star, Quote } from "lucide-react";
import vetCareImg from "@/assets/vet-care.jpg";

const Testimonials = () => {
  const testimonials = [
    {
      name: "Dr. Carlos Mendes",
      role: "Veterinário - Pet Care Center",
      location: "São Paulo, SP",
      image: "https://ui-avatars.com/api/?name=Carlos+Mendes&background=0D8ABC&color=fff&size=128",
      rating: 5,
      text: "Estou extremamente satisfeito com o Easy Pet. Testei vários sistemas ao longo de 12 anos e este é o primeiro que realmente atende todas as necessidades da minha clínica. Sistema completo e intuitivo!",
    },
    {
      name: "Ana Paula Silva",
      role: "Proprietária - Banho & Tosa Feliz",
      location: "Rio de Janeiro, RJ",
      image: "https://ui-avatars.com/api/?name=Ana+Silva&background=0D8ABC&color=fff&size=128",
      rating: 5,
      text: "O controle de agendamentos melhorou 300% nossa produtividade. Os lembretes automáticos reduziram drasticamente o número de faltas. Recomendo muito!",
    },
    {
      name: "Roberto Costa",
      role: "Gerente - Pet Shop Vida Animal",
      location: "Belo Horizonte, MG",
      image: "https://ui-avatars.com/api/?name=Roberto+Costa&background=0D8ABC&color=fff&size=128",
      rating: 5,
      text: "Conseguimos integrar nossa clínica, pet shop e banho e tosa em um único sistema. Antes eram três plataformas diferentes. Economizamos tempo e dinheiro!",
    },
  ];

  return (
    <section className="py-20 px-4 bg-muted">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl font-bold">O que nossos clientes dizem</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Histórias reais de profissionais que transformaram sua gestão com o Easy Pet
          </p>
        </div>

        <div className="mb-16">
          <div className="relative max-w-4xl mx-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl blur-xl" />
            <img
              src={vetCareImg}
              alt="Veterinária cuidando de pet com carinho e profissionalismo"
              className="relative rounded-2xl shadow-xl w-full h-auto object-cover"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className="border-border hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
            >
              <CardContent className="p-6 space-y-4">
                <Quote className="h-10 w-10 text-primary/20" />
                
                <div className="flex gap-1">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-secondary text-secondary" />
                  ))}
                </div>

                <p className="text-muted-foreground leading-relaxed">
                  "{testimonial.text}"
                </p>

                <div className="flex items-center gap-4 pt-4 border-t border-border">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <p className="font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    <p className="text-xs text-muted-foreground">{testimonial.location}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
