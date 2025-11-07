import { SEO } from "@/components/SEO";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Quote, TrendingUp, Users, Star } from "lucide-react";
import { Link } from "react-router-dom";

const successStories = {
  petshop: [
    {
      name: "Pet Paradise",
      owner: "Marina Silva",
      location: "São Paulo, SP",
      segment: "Pet Shop",
      image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400",
      results: {
        revenue: "+145%",
        clients: "850+",
        satisfaction: "4.9/5"
      },
      story: "Antes do sistema, perdíamos muitos agendamentos por telefone e não tínhamos controle do estoque. Agora, tudo é automatizado e nosso faturamento cresceu 145% em 8 meses. O sistema de fidelidade trouxe 60% dos nossos clientes de volta.",
      highlight: "Crescimento de 145% em faturamento"
    },
    {
      name: "PetMania",
      owner: "Carlos Roberto",
      location: "Rio de Janeiro, RJ",
      segment: "Pet Shop",
      image: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400",
      results: {
        revenue: "+98%",
        clients: "620+",
        satisfaction: "4.8/5"
      },
      story: "O controle de estoque e as notificações automáticas mudaram completamente nossa operação. Reduzimos perdas em 80% e aumentamos a satisfação dos clientes. O WhatsApp integrado facilita muito a comunicação.",
      highlight: "Redução de 80% em perdas de estoque"
    }
  ],
  banhotosa: [
    {
      name: "Banho & Tosa Luxo",
      owner: "Juliana Oliveira",
      location: "Belo Horizonte, MG",
      segment: "Banho & Tosa",
      image: "https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=400",
      results: {
        revenue: "+180%",
        clients: "450+",
        satisfaction: "5.0/5"
      },
      story: "Conseguimos triplicar nossa capacidade de atendimento com a agenda inteligente. Os clientes adoram receber fotos do pet após o banho pelo sistema. Nossa avaliação no Google subiu para 5 estrelas!",
      highlight: "Triplicou capacidade de atendimento"
    },
    {
      name: "Spa Canino Premium",
      owner: "Roberto Dias",
      location: "Curitiba, PR",
      segment: "Banho & Tosa",
      image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400",
      results: {
        revenue: "+125%",
        clients: "380+",
        satisfaction: "4.9/5"
      },
      story: "O sistema nos permitiu profissionalizar completamente o negócio. Agora temos controle total de agendamentos, comissões dos funcionários e relatórios financeiros. Nosso ticket médio aumentou 40%.",
      highlight: "Ticket médio aumentou 40%"
    }
  ],
  clinica: [
    {
      name: "Clínica Vet Care",
      owner: "Dra. Patricia Mendes",
      location: "Porto Alegre, RS",
      segment: "Clínica Veterinária",
      image: "https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=400",
      results: {
        revenue: "+165%",
        clients: "1200+",
        satisfaction: "4.9/5"
      },
      story: "Como veterinária, preciso focar nos animais e não em burocracias. O sistema cuida de tudo: agendamentos, prontuários, lembretes de vacinas. Minha equipe economiza 15 horas por semana em tarefas administrativas.",
      highlight: "Economiza 15h/semana em tarefas administrativas"
    },
    {
      name: "Hospital Pet Life",
      owner: "Dr. Fernando Costa",
      location: "Brasília, DF",
      segment: "Clínica Veterinária",
      image: "https://images.unsplash.com/photo-1581888227599-779811939961?w=400",
      results: {
        revenue: "+210%",
        clients: "2100+",
        satisfaction: "5.0/5"
      },
      story: "Abrimos 3 novas unidades em 1 ano graças ao sistema multi-unidades. O dashboard consolidado nos dá visão completa do negócio. O sistema de prontuário eletrônico é impecável e facilitou muito nosso dia a dia.",
      highlight: "3 novas unidades em 1 ano"
    }
  ]
};

export default function SuccessStories() {
  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Casos de Sucesso - Histórias Reais de Crescimento"
        description="Conheça histórias reais de pet shops, banho & tosa e clínicas que transformaram seus negócios. Resultados comprovados de crescimento e satisfação."
      />
      <Navigation />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10">
        <div className="container mx-auto max-w-7xl text-center space-y-6">
          <Badge className="text-lg px-6 py-2">Casos de Sucesso</Badge>
          <h1 className="text-5xl lg:text-6xl font-black">
            Histórias Reais de{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Transformação
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Descubra como negócios pet em todo o Brasil estão crescendo e fidelizando clientes com nosso sistema
          </p>
        </div>
      </section>

      {/* Stats Overview */}
      <section className="py-12 px-4 border-y">
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-black text-primary mb-2">+2.500</div>
              <p className="text-muted-foreground">Negócios Ativos</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-black text-primary mb-2">+150%</div>
              <p className="text-muted-foreground">Crescimento Médio</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-black text-primary mb-2">4.8/5</div>
              <p className="text-muted-foreground">Satisfação Média</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-black text-primary mb-2">650+</div>
              <p className="text-muted-foreground">Cidades Atendidas</p>
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories by Segment */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-7xl">
          <Tabs defaultValue="petshop" className="space-y-12">
            <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-3">
              <TabsTrigger value="petshop">Pet Shops</TabsTrigger>
              <TabsTrigger value="banhotosa">Banho & Tosa</TabsTrigger>
              <TabsTrigger value="clinica">Clínicas</TabsTrigger>
            </TabsList>

            {Object.entries(successStories).map(([key, stories]) => (
              <TabsContent key={key} value={key} className="space-y-8">
                {stories.map((story, index) => (
                  <Card key={index} className="overflow-hidden hover:shadow-xl transition-shadow">
                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="relative h-64 md:h-auto">
                        <img 
                          src={story.image} 
                          alt={story.name}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      </div>
                      
                      <div className="md:col-span-2 p-6 space-y-6">
                        <CardHeader className="p-0 space-y-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-2xl font-bold">{story.name}</h3>
                              <p className="text-muted-foreground">{story.owner} • {story.location}</p>
                            </div>
                            <Badge variant="secondary">{story.segment}</Badge>
                          </div>
                          
                          <div className="flex gap-6">
                            <div className="flex items-center gap-2">
                              <TrendingUp className="h-5 w-5 text-green-600" />
                              <div>
                                <div className="font-bold text-lg">{story.results.revenue}</div>
                                <div className="text-xs text-muted-foreground">Faturamento</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="h-5 w-5 text-primary" />
                              <div>
                                <div className="font-bold text-lg">{story.results.clients}</div>
                                <div className="text-xs text-muted-foreground">Clientes</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Star className="h-5 w-5 text-yellow-500" />
                              <div>
                                <div className="font-bold text-lg">{story.results.satisfaction}</div>
                                <div className="text-xs text-muted-foreground">Satisfação</div>
                              </div>
                            </div>
                          </div>
                        </CardHeader>

                        <CardContent className="p-0 space-y-4">
                          <div className="relative pl-6 border-l-4 border-primary">
                            <Quote className="absolute -left-3 top-0 h-6 w-6 text-primary bg-background" />
                            <p className="text-lg italic text-muted-foreground leading-relaxed">
                              "{story.story}"
                            </p>
                          </div>
                          
                          <div className="bg-primary/5 p-4 rounded-lg">
                            <p className="font-semibold text-primary">✨ {story.highlight}</p>
                          </div>
                        </CardContent>
                      </div>
                    </div>
                  </Card>
                ))}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary to-accent">
        <div className="container mx-auto max-w-3xl text-center space-y-6">
          <h2 className="text-4xl font-black text-white">
            Pronto para escrever sua história de sucesso?
          </h2>
          <p className="text-xl text-white/90">
            Junte-se a mais de 2.500 negócios que já transformaram sua gestão
          </p>
          <Link to="/pricing">
            <Button size="lg" className="bg-white text-primary hover:bg-gray-100 text-xl px-12 py-8 font-bold">
              Começar Agora - 14 Dias Grátis
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
