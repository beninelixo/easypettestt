import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { HelpCircle, MessageCircle, Phone, Mail } from "lucide-react";

const FAQ = () => {
  const faqs = [
    {
      question: "Como faço para agendar um banho e tosa?",
      answer: "Você pode agendar através do nosso sistema online acessando sua conta, pelo aplicativo mobile ou entrando em contato diretamente com o pet shop de sua preferência. O sistema permite visualizar horários disponíveis em tempo real e enviar lembretes automáticos via WhatsApp."
    },
    {
      question: "Quais são as formas de pagamento aceitas?",
      answer: "Aceitamos todas as principais formas de pagamento: cartões de crédito e débito (Visa, Mastercard, Elo, American Express), PIX, dinheiro e parcelamento em até 12x sem juros para planos anuais. Cada pet shop parceiro pode ter condições específicas adicionais."
    },
    {
      question: "Posso reagendar ou cancelar um horário?",
      answer: "Sim! Você pode reagendar ou cancelar seu horário diretamente pelo sistema até 24 horas antes do agendamento, sem custos adicionais. Cancelamentos com menos de 24 horas de antecedência podem estar sujeitos a taxas, conforme política de cada estabelecimento."
    },
    {
      question: "Como funciona o sistema para franqueados?",
      answer: "Nosso sistema oferece gestão completa para franquias: controle de múltiplas unidades, dashboard consolidado, gestão de royalties, relatórios unificados, padrões de marca, suporte técnico dedicado e treinamento completo da equipe. Entre em contato para conhecer nossos planos de franquia."
    },
    {
      question: "Há suporte técnico disponível?",
      answer: "Sim! Oferecemos suporte técnico 24/7 em português através de chat online, WhatsApp, e-mail e telefone. Clientes dos planos Premium e Enterprise têm acesso a suporte prioritário com atendimento em até 15 minutos."
    },
    {
      question: "O sistema funciona offline?",
      answer: "O sistema é baseado em nuvem, mas possui funcionalidades offline limitadas no aplicativo mobile. Você pode visualizar agendamentos já sincronizados e adicionar novos que serão enviados assim que houver conexão. Recomendamos conexão estável para funcionalidade completa."
    },
    {
      question: "Como funciona a integração com WhatsApp?",
      answer: "Nosso sistema se integra nativamente com WhatsApp Business, permitindo envio automático de confirmações, lembretes, avisos de chegada, fotos do pet após o serviço e campanhas de marketing. A configuração é simples e guiada pelo nosso time de suporte."
    },
    {
      question: "Vocês oferecem treinamento para minha equipe?",
      answer: "Sim! Todo novo cliente recebe onboarding completo com treinamento ao vivo para toda equipe, materiais em vídeo, base de conhecimento e suporte contínuo. Oferecemos também treinamentos avançados e certificações para gestores."
    },
    {
      question: "Posso migrar dados do meu sistema atual?",
      answer: "Sim! Nossa equipe auxilia na migração completa e gratuita de dados: cadastro de clientes, histórico de pets, agendamentos, produtos e relatórios financeiros. O processo leva de 3 a 7 dias úteis dependendo do volume de dados."
    },
    {
      question: "O sistema é compatível com nota fiscal eletrônica?",
      answer: "Sim! Emitimos automaticamente NF-e e NFS-e integradas com a Receita Federal e prefeituras. O sistema calcula impostos, gerencia séries e envia automaticamente para o cliente por e-mail. Incluso em todos os planos sem custos adicionais."
    },
    {
      question: "Como funciona o programa de fidelidade?",
      answer: "Nosso sistema de fidelidade é gamificado: clientes ganham pontos a cada serviço, podem resgatar descontos e prêmios, participar de rankings e desafios. Você configura as regras (pontos por real gasto, recompensas, validade) e o sistema gerencia tudo automaticamente."
    },
    {
      question: "Posso testar antes de contratar?",
      answer: "Sim! Oferecemos teste grátis de 14 dias com acesso completo a todas as funcionalidades, sem necessidade de cartão de crédito. Nossa equipe fica à disposição durante o período de teste para auxiliar na configuração e tirar dúvidas."
    }
  ];

  const categories = [
    { name: "Agendamento", count: 3 },
    { name: "Pagamentos", count: 2 },
    { name: "Suporte", count: 2 },
    { name: "Franquias", count: 2 },
    { name: "Integrações", count: 3 }
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Perguntas Frequentes - FAQ | EasyPet"
        description="Tire suas dúvidas sobre agendamentos, pagamentos, suporte técnico, franquias e integrações. Encontre respostas rápidas para as perguntas mais comuns sobre o EasyPet."
        url="https://fee7e0fa-1989-41d0-b964-a2da81396f8b.lovableproject.com/faq"
      />
      <Navigation />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 bg-gradient-to-br from-primary/5 via-secondary/5 to-background relative overflow-hidden">
        <div className="absolute inset-0 bg-dot-pattern opacity-30" aria-hidden="true" />
        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="text-center space-y-6 max-w-4xl mx-auto animate-fade-in">
            <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center mx-auto">
              <HelpCircle className="h-10 w-10 text-primary" aria-hidden="true" />
            </div>
            <h1 className="text-5xl lg:text-7xl font-black leading-tight">
              Perguntas Frequentes
            </h1>
            <p className="text-xl lg:text-2xl text-muted-foreground leading-relaxed">
              Encontre respostas rápidas para as dúvidas mais comuns sobre nosso sistema
            </p>
          </div>
        </div>
      </section>

      {/* Quick Categories */}
      <section className="py-8 px-4 border-b border-border">
        <div className="container mx-auto max-w-5xl">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category) => (
              <Button
                key={category.name}
                variant="outline"
                className="rounded-full px-6"
                aria-label={`Filtrar por ${category.name}`}
              >
                {category.name}
                <span className="ml-2 text-xs bg-primary/10 text-primary rounded-full px-2 py-0.5">
                  {category.count}
                </span>
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-5xl">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border-2 border-border rounded-xl px-6 hover:border-primary transition-colors duration-300 data-[state=open]:border-primary"
              >
                <AccordionTrigger className="text-left text-lg font-semibold hover:text-primary py-6 hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-base text-muted-foreground leading-relaxed pb-6">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* JSON-LD Schema for FAQPage */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": faqs.map(faq => ({
            "@type": "Question",
            "name": faq.question,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": faq.answer
            }
          }))
        })}
      </script>

      {/* Contact CTA */}
      <section className="py-24 px-4 bg-muted">
        <div className="container mx-auto max-w-5xl">
          <Card className="border-2 border-border">
            <CardContent className="p-12 text-center space-y-8">
              <div className="space-y-4">
                <h2 className="text-3xl lg:text-4xl font-black">
                  Não encontrou o que procurava?
                </h2>
                <p className="text-xl text-muted-foreground">
                  Nossa equipe está pronta para ajudar você
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
                <Link to="/contact" className="group">
                  <Card className="border-2 border-border hover:border-primary hover:shadow-xl transition-all duration-300 cursor-pointer h-full">
                    <CardContent className="p-6 text-center space-y-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                        <MessageCircle className="h-6 w-6 text-primary" />
                      </div>
                      <div className="font-bold">Chat Online</div>
                      <div className="text-sm text-muted-foreground">
                        Atendimento 24/7
                      </div>
                    </CardContent>
                  </Card>
                </Link>

                <a href="tel:+551199999999" className="group">
                  <Card className="border-2 border-border hover:border-primary hover:shadow-xl transition-all duration-300 cursor-pointer h-full">
                    <CardContent className="p-6 text-center space-y-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                        <Phone className="h-6 w-6 text-primary" />
                      </div>
                      <div className="font-bold">Telefone</div>
                      <div className="text-sm text-muted-foreground">
                        (11) 99999-9999
                      </div>
                    </CardContent>
                  </Card>
                </a>

                <a href="mailto:contato@easypet.com.br" className="group">
                  <Card className="border-2 border-border hover:border-primary hover:shadow-xl transition-all duration-300 cursor-pointer h-full">
                    <CardContent className="p-6 text-center space-y-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                        <Mail className="h-6 w-6 text-primary" />
                      </div>
                      <div className="font-bold">E-mail</div>
                      <div className="text-sm text-muted-foreground">
                        contato@easypet.com.br
                      </div>
                    </CardContent>
                  </Card>
                </a>
              </div>

              <Link to="/auth">
                <Button size="lg" className="px-12 py-6 text-lg font-bold">
                  Começar teste grátis
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default FAQ;
