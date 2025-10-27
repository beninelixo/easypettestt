import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Target, Zap, Users } from "lucide-react";
const About = () => {
  return <div className="min-h-screen bg-background">
      <Navigation />

      <section className="pt-32 pb-20 px-4 bg-gradient-to-b from-muted to-background">
        <div className="container mx-auto max-w-4xl text-center space-y-6 animate-fade-in">
          <h1 className="text-5xl font-bold">Sobre o Bointhosa Pet System</h1>
          <p className="text-xl text-muted-foreground">
            Desenvolvido com amor para facilitar a vida de quem cuida de pets
          </p>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 mb-20">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold">Nossa Missão</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Simplificar a gestão de pet shops, banho e tosa e clínicas de estética animal,
                proporcionando ferramentas modernas, intuitivas e eficientes que permitem aos
                profissionais focarem no que realmente importa: o cuidado e bem-estar dos pets.
              </p>
            </div>
            <div className="space-y-4">
              <h2 className="text-3xl font-bold">Nossa Visão</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Ser a plataforma líder em gestão para o setor pet, reconhecida pela qualidade,
                inovação e pela capacidade de transformar a experiência de proprietários de pet shops
                e seus clientes, criando relacionamentos duradouros e negócios prósperos.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[{
            icon: Heart,
            title: "Paixão por Pets",
            description: "Criado por quem ama e entende o universo pet"
          }, {
            icon: Target,
            title: "Foco no Cliente",
            description: "Cada funcionalidade pensada para facilitar seu dia a dia"
          }, {
            icon: Zap,
            title: "Tecnologia de Ponta",
            description: "Sistema rápido, moderno e sempre atualizado"
          }, {
            icon: Users,
            title: "Suporte Dedicado",
            description: "Equipe pronta para ajudar quando você precisar"
          }].map((value, index) => <Card key={index} className="text-center border-border hover:shadow-lg transition-all">
                <CardHeader>
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <value.icon className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{value.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>)}
          </div>

          <div className="mt-20 bg-muted rounded-3xl p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Por que escolher o Bointhosa?</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-8">
              Sabemos que gerenciar um pet shop ou serviço de banho e tosa pode ser desafiador.
              Com o Bointhosa, você tem todas as ferramentas necessárias em uma plataforma única,
              intuitiva e acessível de qualquer lugar. Menos tempo organizando, mais tempo cuidando
              dos pets e fazendo seu negócio crescer.
            </p>
            <div className="grid sm:grid-cols-3 gap-8 mt-12">
              <div>
                <div className="text-4xl font-bold text-primary mb-2">233+</div>
                <div className="text-muted-foreground">Pet Shops Atendidos</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">260k+</div>
                <div className="text-muted-foreground">Agendamentos Realizados</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">98%</div>
                <div className="text-muted-foreground">Clientes Satisfeitos</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>;
};
export default About;