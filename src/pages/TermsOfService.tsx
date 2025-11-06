import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, FileText, Scale } from "lucide-react";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Termos de Uso - EasyPet | Condições de Uso do Sistema"
        description="Leia os termos e condições de uso do EasyPet. Conheça seus direitos e responsabilidades ao utilizar nossa plataforma de gestão pet."
        url="https://fee7e0fa-1989-41d0-b964-a2da81396f8b.lovableproject.com/terms"
      />
      <Navigation />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 bg-gradient-to-br from-primary/5 via-secondary/5 to-background relative overflow-hidden">
        <div className="absolute inset-0 bg-dot-pattern opacity-30" aria-hidden="true" />
        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="text-center space-y-6 max-w-4xl mx-auto animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-full text-primary text-sm font-semibold">
              <Scale className="h-4 w-4" aria-hidden="true" />
              Legal
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-black leading-tight">
              Termos de Uso
            </h1>
            
            <p className="text-xl lg:text-2xl text-muted-foreground leading-relaxed">
              Última atualização: 06 de janeiro de 2025
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <FileText className="h-6 w-6 text-primary" />
                  1. Aceitação dos Termos
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-lg dark:prose-invert max-w-none">
                <p>
                  Ao acessar e utilizar o EasyPet ("Plataforma"), você concorda em cumprir e estar vinculado aos 
                  seguintes termos e condições de uso. Se você não concordar com qualquer parte destes termos, 
                  não deverá usar nossa plataforma.
                </p>
                <p>
                  A EasyPet é uma plataforma SaaS (Software as a Service) que oferece soluções de gestão para 
                  pet shops, clínicas veterinárias, serviços de banho e tosa, e estabelecimentos relacionados ao 
                  mercado pet.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Shield className="h-6 w-6 text-primary" />
                  2. Licença de Uso
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-lg dark:prose-invert max-w-none">
                <p>
                  A EasyPet concede a você uma licença limitada, não exclusiva, intransferível e revogável para 
                  acessar e usar a plataforma de acordo com estes termos.
                </p>
                <p><strong>Você NÃO PODE:</strong></p>
                <ul>
                  <li>Copiar, modificar, distribuir ou vender qualquer parte da plataforma</li>
                  <li>Fazer engenharia reversa ou tentar extrair o código-fonte</li>
                  <li>Usar a plataforma para finalidades ilegais ou não autorizadas</li>
                  <li>Interferir ou interromper a integridade ou performance da plataforma</li>
                  <li>Tentar obter acesso não autorizado a sistemas ou redes conectadas à plataforma</li>
                  <li>Usar a plataforma para enviar spam ou conteúdo malicioso</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">3. Conta de Usuário</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-lg dark:prose-invert max-w-none">
                <p>
                  Para utilizar determinadas funcionalidades da plataforma, você deverá criar uma conta. 
                  Você é responsável por:
                </p>
                <ul>
                  <li>Manter a confidencialidade de suas credenciais de acesso</li>
                  <li>Todas as atividades que ocorrem sob sua conta</li>
                  <li>Notificar-nos imediatamente sobre qualquer uso não autorizado</li>
                  <li>Fornecer informações precisas e atualizadas no cadastro</li>
                </ul>
                <p>
                  Reservamo-nos o direito de suspender ou encerrar sua conta caso detectemos violação destes termos 
                  ou atividades suspeitas.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">4. Planos e Pagamentos</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-lg dark:prose-invert max-w-none">
                <p>
                  <strong>Planos Disponíveis:</strong> Oferecemos diferentes planos de assinatura (Pet Gold, Pet Platinum, etc.) 
                  com funcionalidades e preços específicos.
                </p>
                <p>
                  <strong>Período de Teste:</strong> Alguns planos podem incluir um período de teste gratuito. 
                  Ao final do período, você será cobrado automaticamente, a menos que cancele antes do término.
                </p>
                <p>
                  <strong>Renovação Automática:</strong> Assinaturas são renovadas automaticamente ao final de cada período 
                  (mensal ou anual), a menos que você cancele com antecedência.
                </p>
                <p>
                  <strong>Política de Cancelamento e Reembolso:</strong>
                </p>
                <ul>
                  <li>Você pode cancelar sua assinatura a qualquer momento através das configurações da conta</li>
                  <li>Oferecemos garantia de reembolso de 7 dias para novas contratações</li>
                  <li>Cancelamentos efetuados após o período de garantia não geram reembolso</li>
                  <li>Após o cancelamento, você manterá acesso até o final do período já pago</li>
                </ul>
                <p>
                  <strong>Alterações de Preço:</strong> Reservamo-nos o direito de modificar nossos preços mediante 
                  notificação prévia de 30 dias. Alterações não afetam assinaturas já pagas.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">5. Propriedade Intelectual</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-lg dark:prose-invert max-w-none">
                <p>
                  Todo o conteúdo da plataforma, incluindo mas não se limitando a textos, gráficos, logos, ícones, 
                  imagens, clipes de áudio, downloads digitais e compilações de dados, é propriedade exclusiva da 
                  EasyPet ou de seus fornecedores de conteúdo e está protegido por leis de direitos autorais brasileiras 
                  e internacionais.
                </p>
                <p>
                  Os dados que você insere na plataforma (informações de clientes, pets, agendamentos, etc.) 
                  permanecem de sua propriedade. Concedemos a você o direito de exportar seus dados a qualquer momento.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">6. Privacidade e Proteção de Dados (LGPD)</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-lg dark:prose-invert max-w-none">
                <p>
                  Nossa coleta e uso de informações pessoais está descrita em nossa{" "}
                  <a href="/privacy" className="text-primary hover:underline">Política de Privacidade</a>.
                </p>
                <p>
                  Estamos em total conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018). 
                  Você tem direito a:
                </p>
                <ul>
                  <li>Acessar seus dados pessoais</li>
                  <li>Corrigir dados incompletos, inexatos ou desatualizados</li>
                  <li>Solicitar a anonimização, bloqueio ou eliminação de dados</li>
                  <li>Solicitar a portabilidade de dados para outro fornecedor</li>
                  <li>Revogar o consentimento</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">7. Limitação de Responsabilidade</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-lg dark:prose-invert max-w-none">
                <p>
                  A EasyPet não se responsabiliza por:
                </p>
                <ul>
                  <li>Perda de dados causada por falhas técnicas, desde que tenhamos realizado backups regulares</li>
                  <li>Lucros cessantes ou danos indiretos resultantes do uso ou impossibilidade de uso da plataforma</li>
                  <li>Decisões tomadas com base nas informações fornecidas pela plataforma</li>
                  <li>Interrupções temporárias do serviço para manutenção programada (com aviso prévio)</li>
                  <li>Ações de terceiros, incluindo ataques cibernéticos, desde que tenhamos implementado medidas de segurança adequadas</li>
                </ul>
                <p>
                  <strong>Garantia de Uptime:</strong> Nos comprometemos a manter um uptime de 99,5% no plano Platinum 
                  e 99% nos demais planos. Caso não atinjamos essas metas, você terá direito a créditos proporcionais.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">8. Modificações dos Termos</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-lg dark:prose-invert max-w-none">
                <p>
                  Reservamo-nos o direito de modificar estes termos a qualquer momento. Alterações significativas 
                  serão notificadas por email com antecedência mínima de 30 dias.
                </p>
                <p>
                  O uso continuado da plataforma após as modificações constitui aceitação dos novos termos.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">9. Lei Aplicável e Foro</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-lg dark:prose-invert max-w-none">
                <p>
                  Estes termos são regidos pelas leis da República Federativa do Brasil.
                </p>
                <p>
                  Quaisquer disputas decorrentes destes termos serão submetidas ao foro da comarca de São Paulo, SP, 
                  com exclusão de qualquer outro, por mais privilegiado que seja.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">10. Contato</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-lg dark:prose-invert max-w-none">
                <p>
                  Para questões relacionadas a estes termos de uso, entre em contato conosco:
                </p>
                <ul>
                  <li><strong>Email:</strong> contato@easypet.com.br</li>
                  <li><strong>Telefone:</strong> (11) 99999-9999</li>
                  <li><strong>Endereço:</strong> São Paulo, SP, Brasil</li>
                </ul>
                <p>
                  <strong>Encarregado de Dados (DPO):</strong> dpo@easypet.com.br
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default TermsOfService;
