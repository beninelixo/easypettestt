import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import systemDashboardImg from "@/assets/system-dashboard.jpg";

const HowItWorks = () => {
  const steps = [
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
    <section className="py-20 px-4 bg-gradient-to-b from-background to-muted">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium">
            <CheckCircle2 className="h-4 w-4" />
            Simples e Rápido
          </div>
          <h2 className="text-4xl font-bold">Como Funciona</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Em apenas 4 passos simples você transforma a gestão do seu pet shop
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl blur-xl" />
            <img
              src={systemDashboardImg}
              alt="Gestão profissional de pet shop com sistema moderno"
              className="relative rounded-2xl shadow-xl w-full h-auto object-cover"
            />
          </div>
          <div className="space-y-6">
            <h3 className="text-3xl font-bold">Gerencie Tudo em Um Só Lugar</h3>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Dashboard intuitivo que centraliza agendamentos, clientes, serviços e relatórios. 
              Acesse de qualquer dispositivo e tenha controle total do seu negócio na palma da mão.
            </p>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                <span className="text-muted-foreground">Interface moderna e fácil de usar</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                <span className="text-muted-foreground">Sincronização automática em tempo real</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                <span className="text-muted-foreground">Relatórios e métricas detalhadas</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {steps.map((step, index) => (
            <div
              key={index}
              className="relative group"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-2xl opacity-0 group-hover:opacity-100 blur-xl transition-all duration-500" />
              <div className="relative bg-background border border-border rounded-2xl p-8 hover:shadow-2xl transition-all duration-500">
                <div className="flex items-start gap-6">
                  <div className="text-6xl font-bold text-primary/20 group-hover:text-primary/40 transition-colors duration-300">
                    {step.number}
                  </div>
                  <div className="flex-1 space-y-4">
                    <h3 className="text-2xl font-bold group-hover:text-primary transition-colors duration-300">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {step.description}
                    </p>
                    <ul className="space-y-2">
                      {step.items.map((item, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-accent flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link to="/auth">
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary-light text-lg px-10 py-6 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group"
            >
              Começar Agora - É Grátis
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-2 transition-transform duration-300" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
