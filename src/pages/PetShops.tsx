import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, CreditCard, BarChart3, Users, TrendingUp, Bell, CheckCircle } from "lucide-react";

const PetShops = () => {
  const features = [
    {
      icon: Package,
      title: "Gestão de Estoque Inteligente",
      description: "Controle entrada e saída de produtos, alertas de reposição automáticos e relatórios de validade próxima ao vencimento.",
    },
    {
      icon: CreditCard,
      title: "Ponto de Venda Integrado",
      description: "PDV completo com múltiplas formas de pagamento, emissão de nota fiscal e controle de créditos e débitos do cliente.",
    },
    {
      icon: BarChart3,
      title: "Análise de Vendas",
      description: "Veja produtos mais vendidos, margem de lucro por item, ticket médio e faturamento em tempo real.",
    },
    {
      icon: Users,
      title: "Programa de Fidelidade",
      description: "Crie campanhas de pontos, descontos progressivos e recompense seus clientes mais fiéis automaticamente.",
    },
    {
      icon: TrendingUp,
      title: "Controle Financeiro",
      description: "Fluxo de caixa completo, contas a pagar e receber, comissões de vendedores e análise de lucratividade.",
    },
    {
      icon: Bell,
      title: "Alertas Inteligentes",
      description: "Notificações de produtos em falta, vencimento próximo e oportunidades de recompra automática.",
    },
  ];

  const benefits = [
    "Código de barras e leitura por scanner",
    "Gestão de fornecedores e pedidos de compra",
    "Controle de múltiplos pontos de venda",
    "Relatórios de curva ABC e giro de estoque",
    "Integração com balanças e impressoras",
    "Promoções e descontos programados",
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 bg-gradient-to-b from-muted to-background">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/20 rounded-full text-secondary-foreground text-sm font-medium">
                <Package className="h-4 w-4" />
                Para Pet Shops
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                Potencialize suas{" "}
                <span className="bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">
                  vendas
                </span>
              </h1>
              <p className="text-xl text-muted-foreground">
                Sistema completo para pet shops com controle de estoque, PDV integrado, análise de vendas e muito mais.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link to="/auth">
                  <Button size="lg" className="w-full sm:w-auto bg-secondary hover:bg-secondary/90">
                    Começar Grátis
                  </Button>
                </Link>
                <Link to="/funcionalidades">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    Ver Funcionalidades
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative animate-scale-in">
              <div className="absolute inset-0 bg-gradient-to-r from-secondary/20 to-primary/20 rounded-3xl blur-3xl" />
              <img
                src="https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800&auto=format&fit=crop"
                alt="Pet shop"
                className="relative rounded-3xl shadow-2xl w-full h-auto object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl font-bold">Perfeito para pet shops</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Ferramentas essenciais para vender mais e gerenciar melhor
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="border-border hover:shadow-lg hover:-translate-y-2 transition-all duration-300"
              >
                <CardHeader>
                  <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-secondary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 bg-muted">
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative order-2 md:order-1">
              <img
                src="https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=800&auto=format&fit=crop"
                alt="Gestão de pet shop"
                className="rounded-2xl shadow-xl"
              />
            </div>
            <div className="space-y-6 order-1 md:order-2">
              <h2 className="text-4xl font-bold">
                Venda mais com gestão inteligente
              </h2>
              <p className="text-xl text-muted-foreground">
                Ferramentas desenvolvidas para aumentar suas vendas e reduzir desperdícios
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-accent flex-shrink-0 mt-0.5" />
                    <span className="text-lg">{benefit}</span>
                  </div>
                ))}
              </div>
              <Link to="/auth">
                <Button size="lg" className="mt-6 bg-secondary hover:bg-secondary/90">
                  Experimente Grátis por 14 Dias
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="bg-gradient-to-r from-secondary/10 via-primary/10 to-accent/10 rounded-3xl p-12">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Resultados Reais</h2>
              <p className="text-muted-foreground text-lg">
                Veja o impacto do Bointhosa em pet shops como o seu
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-secondary mb-2">+35%</div>
                <p className="text-foreground font-semibold mb-1">Aumento nas Vendas</p>
                <p className="text-sm text-muted-foreground">
                  Com análises e controle preciso
                </p>
              </div>
              <div>
                <div className="text-4xl font-bold text-secondary mb-2">-60%</div>
                <p className="text-foreground font-semibold mb-1">Redução de Perdas</p>
                <p className="text-sm text-muted-foreground">
                  Com alertas de validade
                </p>
              </div>
              <div>
                <div className="text-4xl font-bold text-secondary mb-2">4h/dia</div>
                <p className="text-foreground font-semibold mb-1">Tempo Economizado</p>
                <p className="text-sm text-muted-foreground">
                  Em tarefas administrativas
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-20 px-4 bg-muted">
        <div className="container mx-auto max-w-4xl">
          <Card className="border-secondary/20 bg-gradient-to-r from-secondary/5 to-primary/5">
            <CardContent className="p-8 md:p-12">
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <img
                  src="https://ui-avatars.com/api/?name=Mariana+Costa&background=F5A623&color=fff&size=128"
                  alt="Mariana Costa"
                  className="w-24 h-24 rounded-full"
                />
                <div className="space-y-4 flex-1 text-center md:text-left">
                  <p className="text-lg leading-relaxed">
                    "O controle de estoque do Bointhosa revolucionou minha gestão. Sei exatamente quando repor produtos, economizei muito com perdas por vencimento e aumentei minhas vendas em 40% no primeiro ano!"
                  </p>
                  <div>
                    <p className="font-bold text-lg">Mariana Costa</p>
                    <p className="text-muted-foreground">Pet Shop Amor Animal - Fortaleza, CE</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-secondary text-secondary-foreground">
        <div className="container mx-auto text-center space-y-6 max-w-3xl">
          <h2 className="text-4xl font-bold">
            Transforme seu pet shop hoje
          </h2>
          <p className="text-xl opacity-90">
            Teste grátis por 14 dias. Configure em minutos. Sem cartão de crédito.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <Link to="/auth">
              <Button size="lg" variant="default" className="w-full sm:w-auto bg-primary hover:bg-primary-light">
                Começar Agora
              </Button>
            </Link>
            <Link to="/pricing">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto bg-transparent border-secondary-foreground text-secondary-foreground hover:bg-secondary-foreground hover:text-secondary"
              >
                Ver Preços
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PetShops;
