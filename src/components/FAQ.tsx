import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

const FAQ = () => {
  const faqs = [
    {
      question: "Qual a diferença entre os planos?",
      answer: "O Pet Gold (R$ 79,90/mês) é ideal para clínicas em crescimento com até 3 usuários. O Pet Platinum (R$ 149,90/mês) oferece usuários ilimitados, multi-unidades e white label. O Platinum Anual (R$ 1.798/ano) tem o melhor custo-benefício com economia de R$ 200,80 no ano."
    },
    {
      question: "Posso mudar de plano depois?",
      answer: "Sim! Você pode fazer upgrade ou downgrade a qualquer momento. No upgrade, você paga proporcionalmente. No downgrade, o novo valor começa a valer no próximo ciclo de cobrança."
    },
    {
      question: "Como funciona o pagamento anual?",
      answer: "No plano anual, você paga R$ 1.798,00 de uma única vez e tem acesso ao sistema por 12 meses completos. Isso equivale a pagar 10 meses e ganhar 2 de graça, economizando R$ 200,80 no ano."
    },
    {
      question: "Qual a economia do plano anual?",
      answer: "No plano mensal Platinum você pagaria R$ 149,90 x 12 = R$ 1.998,80. No anual você paga R$ 1.798,00, economizando R$ 200,80 (equivalente a 2 meses grátis)."
    },
    {
      question: "Como funciona o pagamento?",
      answer: "O pagamento é processado de forma 100% segura através da plataforma Cakto. Aceitamos cartão de crédito, PIX e boleto. Após a confirmação, você recebe acesso imediato ao sistema."
    },
    {
      question: "Quais formas de pagamento são aceitas?",
      answer: "Aceitamos cartão de crédito, PIX e boleto bancário através da plataforma Cakto. O pagamento é 100% seguro e você recebe a confirmação por email imediatamente."
    },
    {
      question: "O que acontece após o pagamento?",
      answer: "Após a confirmação do pagamento, você recebe por email suas credenciais de acesso e pode começar a usar o sistema imediatamente. Nosso suporte está disponível 24/7 para ajudar com qualquer dúvida."
    },
    {
      question: "Posso cancelar a qualquer momento?",
      answer: "Sim, sem burocracia! Nos planos mensais, você pode cancelar quando quiser sem taxas. No plano anual, você mantém o acesso até o fim do período contratado, mas não há renovação automática se cancelar."
    },
    {
      question: "O que acontece se eu cancelar no meio do ano?",
      answer: "No plano anual, você mantém o acesso até o fim dos 12 meses contratados, mas não há reembolso proporcional. Por isso recomendamos começar com o plano mensal se ainda estiver testando."
    },
    {
      question: "Há garantia de reembolso?",
      answer: "Sim! Oferecemos garantia de 7 dias. Se você não ficar 100% satisfeito, devolvemos seu dinheiro sem fazer perguntas."
    },
    {
      question: "Preciso de conhecimentos técnicos para usar o sistema?",
      answer: "Não! O EasyPet foi desenvolvido para ser extremamente intuitivo. Qualquer pessoa consegue usar sem treinamento técnico. Além disso, oferecemos suporte completo para tirar qualquer dúvida."
    },
    {
      question: "Meus dados estão seguros?",
      answer: "Absolutamente. Utilizamos criptografia de ponta e realizamos backups diários automáticos. Seus dados ficam armazenados em servidores seguros com certificação internacional."
    },
    {
      question: "Funciona no celular?",
      answer: "Perfeitamente! O sistema é 100% responsivo e funciona em qualquer dispositivo - computador, tablet ou smartphone. Gerencie seu negócio de onde estiver."
    },
    {
      question: "Tem limite de agendamentos?",
      answer: "Não há limite de agendamentos no Plano Pet Gold. Você pode receber quantos agendamentos quiser, e o sistema aguenta o volume sem problemas."
    },
    {
      question: "Como funciona o suporte?",
      answer: "Oferecemos suporte prioritário 24/7 via chat, email e WhatsApp. Nossa equipe responde rapidamente e está sempre pronta para ajudar. Além disso, temos uma base de conhecimento completa com tutoriais em vídeo."
    },
    {
      question: "Posso migrar de outro sistema?",
      answer: "Sim! Nossa equipe te ajuda a migrar seus dados de outros sistemas ou planilhas. O processo é simples e rápido, e você não perde nenhuma informação importante."
    },
    {
      question: "Quantos usuários podem usar o sistema simultaneamente?",
      answer: "O Plano Pet Gold permite até 3 usuários simultâneos. Isso é perfeito para clínicas e pet shops que precisam de múltiplos funcionários acessando o sistema ao mesmo tempo."
    }
  ];

  return (
    <section className="py-20 px-4 bg-muted">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium">
            <HelpCircle className="h-4 w-4" />
            Perguntas Frequentes
          </div>
          <h2 className="text-4xl font-bold">Tire Suas Dúvidas</h2>
          <p className="text-xl text-muted-foreground">
            Respostas para as perguntas mais comuns sobre o EasyPet
          </p>
        </div>

        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="bg-background border-2 rounded-xl px-6 hover:border-primary/50 transition-colors duration-300"
            >
              <AccordionTrigger className="text-left text-lg font-semibold hover:text-primary hover:no-underline py-6">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-base pb-6 leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="mt-12 text-center">
          <p className="text-muted-foreground mb-4">Ainda tem dúvidas?</p>
          <a 
            href="mailto:easypetc@gmail.com" 
            className="text-primary font-semibold hover:underline inline-flex items-center gap-2 text-lg"
          >
            Entre em contato conosco
            <HelpCircle className="h-5 w-5" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
