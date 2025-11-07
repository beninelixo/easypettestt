import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Target, Zap, Users, TrendingUp, Award, Shield, Clock, CheckCircle2 } from "lucide-react";
import { siteMetrics, getDynamicMetrics } from "@/data/metrics";
import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { useCountUp } from "@/hooks/useCountUp";

const About = () => {
  const metrics = getDynamicMetrics();
  
  // Animated counters
  const petShopsCounter = useCountUp({ end: metrics.petShopsServed });
  const appointmentsCounter = useCountUp({ end: metrics.totalAppointments });
  const satisfactionCounter = useCountUp({ end: metrics.satisfactionRate });

  const values = [
    {
      icon: Heart,
      title: "Paixão por Pets",
      description: "Criado por quem ama e entende profundamente o universo pet. Cada funcionalidade foi pensada com carinho."
    },
    {
      icon: Target,
      title: "Foco no Cliente",
      description: "Cada detalhe do sistema foi desenvolvido para facilitar seu dia a dia e fazer seu negócio crescer."
    },
    {
      icon: Zap,
      title: "Tecnologia de Ponta",
      description: "Sistema rápido, moderno e sempre atualizado com as últimas inovações do mercado tech."
    },
    {
      icon: Users,
      title: "Suporte Humanizado",
      description: "Equipe brasileira pronta para ajudar 24/7, falando sua língua e entendendo suas necessidades."
    }
  ];

  const timeline = [
    { year: "2023", title: "Fundação", description: "Nasceu o EasyPet com a missão de revolucionar a gestão pet no Brasil" },
    { year: "2024", title: "Crescimento Acelerado", description: "Alcançamos 500+ pet shops e lançamos o sistema multi-unidades" },
    { year: "2025", title: "Expansão Nacional", description: "Presentes em 32 cidades, +5.000 usuários ativos e novos recursos de IA" }
  ];

  const certifications = [
    { icon: Shield, title: "LGPD Compliant", description: "100% em conformidade com Lei Geral de Proteção de Dados" },
    { icon: Clock, title: "Uptime 99.9%", description: "Disponibilidade garantida para seu negócio nunca parar" },
    { icon: Award, title: "ISO 27001", description: "Certificação internacional de segurança da informação" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Sobre o EasyPet - Nossa História, Missão e Valores"
        description="Conheça a história do EasyPet, o sistema de gestão veterinária que já ajudou 520+ pet shops a crescerem. Tecnologia brasileira, suporte humanizado e resultados reais."
        url="https://fee7e0fa-1989-41d0-b964-a2da81396f8b.lovableproject.com/about"
      />
      <Navigation />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto max-w-5xl text-center space-y-6 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary font-semibold mb-4">
            <Heart className="h-5 w-5" />
            Nossa História
          </div>
          <h1 className="text-5xl lg:text-6xl font-black leading-tight">
            Sobre o <span className="text-primary">EasyPet</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Desenvolvido com amor e tecnologia de ponta para facilitar a vida de quem cuida de pets
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 mb-20">
            <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <CardHeader>
                <CardTitle className="text-3xl">Nossa Missão</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Simplificar radicalmente a gestão de pet shops, banho e tosa e clínicas veterinárias,
                  proporcionando ferramentas modernas, intuitivas e eficientes que permitem aos
                  profissionais focarem no que realmente importa: <strong>o cuidado e bem-estar dos pets</strong>.
                </p>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <CardHeader>
                <CardTitle className="text-3xl">Nossa Visão</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Ser a <strong>plataforma líder</strong> em gestão para o setor pet no Brasil e América Latina,
                  reconhecida pela qualidade, inovação tecnológica e pela capacidade de transformar
                  a experiência de proprietários de pet shops e seus clientes, criando relacionamentos
                  duradouros e negócios prósperos.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Values */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black mb-4">Nossos Valores</h2>
            <p className="text-xl text-muted-foreground">O que nos move todos os dias</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card 
                key={index} 
                className="text-center hover:shadow-2xl hover:-translate-y-3 transition-all duration-300 group"
              >
                <CardHeader>
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">
                    <value.icon className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{value.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 px-4 bg-gradient-to-br from-muted/30 to-background">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black mb-4">Nossa Jornada</h2>
            <p className="text-xl text-muted-foreground">A evolução do EasyPet ao longo dos anos</p>
          </div>
          
          <div className="space-y-12">
            {timeline.map((item, index) => (
              <div 
                key={index} 
                className="flex gap-8 items-start animate-fade-in"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center text-white font-black text-xl shadow-lg">
                    {item.year}
                  </div>
                </div>
                <Card className="flex-1 hover:shadow-xl transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="text-2xl">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg text-muted-foreground">{item.description}</p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section with Animation */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 rounded-3xl p-12">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-black mb-4">Números que Impressionam</h2>
              <p className="text-xl text-muted-foreground">Resultados reais de quem confia no EasyPet</p>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div ref={petShopsCounter.ref} className="text-5xl font-black text-primary mb-2">{petShopsCounter.count}+</div>
                <div className="text-muted-foreground font-semibold">Pet Shops Atendidos</div>
              </div>
              <div className="text-center">
                <div ref={appointmentsCounter.ref} className="text-5xl font-black text-primary mb-2">{Math.floor(appointmentsCounter.count / 1000)}k+</div>
                <div className="text-muted-foreground font-semibold">Agendamentos Realizados</div>
              </div>
              <div className="text-center">
                <div ref={satisfactionCounter.ref} className="text-5xl font-black text-primary mb-2">{satisfactionCounter.count}%</div>
                <div className="text-muted-foreground font-semibold">Clientes Satisfeitos</div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-black text-primary mb-2">{metrics.citiesInBrazil}</div>
                <div className="text-muted-foreground font-semibold">Cidades no Brasil</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black mb-4">Certificações e Garantias</h2>
            <p className="text-xl text-muted-foreground">Segurança e qualidade certificadas</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {certifications.map((cert, index) => (
              <Card key={index} className="text-center hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                <CardHeader>
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <cert.icon className="h-8 w-8 text-green-600" />
                  </div>
                  <CardTitle className="text-2xl">{cert.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{cert.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose EasyPet */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-2 border-primary/20">
            <CardHeader className="text-center">
              <CardTitle className="text-4xl font-black mb-4">Por que escolher o EasyPet?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-lg text-center text-muted-foreground">
                Sabemos que gerenciar um pet shop ou serviço de banho e tosa pode ser desafiador.
                Com o EasyPet, você tem <strong>todas as ferramentas necessárias</strong> em uma plataforma única,
                intuitiva e acessível de qualquer lugar.
              </p>
              
              <div className="grid md:grid-cols-2 gap-4 mt-8">
                {[
                  "Interface intuitiva e fácil de usar",
                  "Suporte em português 24/7",
                  "Treinamento gratuito para equipe",
                  "Atualizações constantes sem custo",
                  "Backup automático na nuvem",
                  "Sem fidelidade, cancele quando quiser"
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0" />
                    <span className="font-semibold">{item}</span>
                  </div>
                ))}
              </div>

              <div className="text-center mt-12">
                <Link to="/pricing">
                  <Button size="lg" className="text-xl px-12 py-8 font-bold shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                    Experimente Grátis por 14 Dias
                    <TrendingUp className="ml-2 h-6 w-6" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
