import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, Lock, Eye, Database, UserCheck } from "lucide-react";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Política de Privacidade - EasyPet | Proteção de Dados e LGPD"
        description="Conheça nossa política de privacidade conforme LGPD. Saiba como coletamos, usamos e protegemos seus dados na plataforma EasyPet."
        url="https://fee7e0fa-1989-41d0-b964-a2da81396f8b.lovableproject.com/privacy"
      />
      <Navigation />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 bg-gradient-to-br from-primary/5 via-secondary/5 to-background relative overflow-hidden">
        <div className="absolute inset-0 bg-dot-pattern opacity-30" aria-hidden="true" />
        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="text-center space-y-6 max-w-4xl mx-auto animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-full text-primary text-sm font-semibold">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              LGPD Compliant
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-black leading-tight">
              Política de Privacidade
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
                  <Eye className="h-6 w-6 text-primary" />
                  1. Introdução
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-lg dark:prose-invert max-w-none">
                <p>
                  A EasyPet ("nós", "nosso" ou "plataforma") está comprometida em proteger a privacidade e 
                  segurança dos dados pessoais de nossos usuários ("você", "seu").
                </p>
                <p>
                  Esta Política de Privacidade descreve como coletamos, usamos, armazenamos e protegemos suas 
                  informações pessoais em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018) 
                  e demais legislações aplicáveis.
                </p>
                <p>
                  <strong>Controlador de Dados:</strong> EasyPet - easypetc@gmail.com
                </p>
                <p>
                  <strong>Encarregado de Dados (DPO):</strong> dpo@easypet.com.br
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Database className="h-6 w-6 text-primary" />
                  2. Dados Coletados
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-lg dark:prose-invert max-w-none">
                <p><strong>2.1. Dados de Cadastro (fornecidos por você):</strong></p>
                <ul>
                  <li><strong>Usuário Cliente:</strong> Nome completo, email, telefone, endereço</li>
                  <li><strong>Usuário Profissional:</strong> Nome completo, email, telefone, nome do estabelecimento, 
                  endereço comercial, CNPJ (quando aplicável), estado, cidade</li>
                  <li><strong>Dados de Pets:</strong> Nome, espécie, raça, idade, peso, histórico médico, vacinas, 
                  fotos, observações comportamentais</li>
                </ul>
                
                <p><strong>2.2. Dados de Uso da Plataforma (coletados automaticamente):</strong></p>
                <ul>
                  <li>Endereço IP</li>
                  <li>Tipo de navegador e dispositivo</li>
                  <li>Páginas visitadas e tempo de permanência</li>
                  <li>Data e hora de acesso</li>
                  <li>Geolocalização aproximada (baseada no IP)</li>
                  <li>Interações com funcionalidades da plataforma</li>
                </ul>

                <p><strong>2.3. Dados Financeiros (processados por terceiros):</strong></p>
                <ul>
                  <li>Informações de pagamento processadas pela Cakto (gateway de pagamento)</li>
                  <li>Não armazenamos dados completos de cartão de crédito</li>
                  <li>Mantemos apenas registros de transações (valor, data, status)</li>
                </ul>

                <p><strong>2.4. Cookies e Tecnologias Similares:</strong></p>
                <ul>
                  <li><strong>Cookies Essenciais:</strong> Necessários para funcionamento da plataforma (sessão, autenticação)</li>
                  <li><strong>Cookies de Preferência:</strong> Armazenam suas configurações (idioma, tema escuro/claro)</li>
                  <li><strong>Cookies Analíticos:</strong> Ajudam-nos a entender como você usa a plataforma</li>
                </ul>
                <p>
                  Você pode gerenciar cookies nas configurações do seu navegador, mas isso pode afetar 
                  funcionalidades da plataforma.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <UserCheck className="h-6 w-6 text-primary" />
                  3. Finalidade e Base Legal do Tratamento de Dados
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-lg dark:prose-invert max-w-none">
                <p>Utilizamos seus dados pessoais para:</p>
                
                <p><strong>3.1. Execução do Contrato (Art. 7º, V da LGPD):</strong></p>
                <ul>
                  <li>Fornecer e operar a plataforma EasyPet</li>
                  <li>Processar agendamentos, pagamentos e transações</li>
                  <li>Gerenciar sua conta e preferências</li>
                  <li>Enviar notificações relacionadas ao serviço (confirmações, lembretes)</li>
                </ul>

                <p><strong>3.2. Cumprimento de Obrigação Legal (Art. 7º, II da LGPD):</strong></p>
                <ul>
                  <li>Emissão de notas fiscais</li>
                  <li>Atendimento a requisições de autoridades competentes</li>
                  <li>Cumprimento de obrigações tributárias e contábeis</li>
                </ul>

                <p><strong>3.3. Consentimento (Art. 7º, I da LGPD):</strong></p>
                <ul>
                  <li>Envio de comunicações de marketing (newsletters, promoções)</li>
                  <li>Uso de dados para pesquisas de satisfação</li>
                  <li>Compartilhamento de dados com parceiros comerciais (quando aplicável)</li>
                </ul>

                <p><strong>3.4. Legítimo Interesse (Art. 7º, IX da LGPD):</strong></p>
                <ul>
                  <li>Melhoria e desenvolvimento de novos recursos da plataforma</li>
                  <li>Análise de uso e geração de estatísticas agregadas</li>
                  <li>Prevenção de fraudes e garantia de segurança</li>
                  <li>Suporte técnico e resolução de problemas</li>
                </ul>

                <p className="font-semibold text-primary">
                  Você pode revogar seu consentimento a qualquer momento sem prejuízo ao serviço contratado.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Lock className="h-6 w-6 text-primary" />
                  4. Compartilhamento de Dados
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-lg dark:prose-invert max-w-none">
                <p>
                  Seus dados podem ser compartilhados nas seguintes situações:
                </p>

                <p><strong>4.1. Prestadores de Serviços:</strong></p>
                <ul>
                  <li><strong>Supabase (USA):</strong> Armazenamento de dados e infraestrutura de backend</li>
                  <li><strong>Cakto (Brasil):</strong> Processamento de pagamentos</li>
                  <li><strong>Resend (USA):</strong> Envio de emails transacionais e notificações</li>
                  <li>Todos os prestadores são contratualmente obrigados a proteger seus dados e usar apenas 
                  para os fins especificados</li>
                </ul>

                <p><strong>4.2. Transferência Internacional de Dados:</strong></p>
                <p>
                  Alguns de nossos prestadores de serviço estão localizados fora do Brasil (EUA). 
                  Garantimos que essas empresas:
                </p>
                <ul>
                  <li>Possuem certificação de adequação de proteção de dados (Privacy Shield sucessor, 
                  Standard Contractual Clauses)</li>
                  <li>Implementam medidas de segurança equivalentes à LGPD</li>
                  <li>Respeitam todos os direitos dos titulares de dados</li>
                </ul>

                <p><strong>4.3. Requisições Legais:</strong></p>
                <p>
                  Podemos divulgar seus dados quando exigido por lei, ordem judicial, ou solicitação de 
                  autoridades governamentais.
                </p>

                <p><strong>4.4. Venda ou Fusão:</strong></p>
                <p>
                  Em caso de venda, fusão ou aquisição da EasyPet, seus dados poderão ser transferidos. 
                  Você será notificado e terá a opção de deletar sua conta antes da transferência.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">5. Armazenamento e Segurança dos Dados</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-lg dark:prose-invert max-w-none">
                <p><strong>5.1. Período de Retenção:</strong></p>
                <ul>
                  <li><strong>Dados de Conta Ativa:</strong> Mantidos enquanto sua conta estiver ativa</li>
                  <li><strong>Após Cancelamento:</strong> Dados anonimizados ou deletados em até 90 dias, 
                  exceto se houver obrigação legal de retenção</li>
                  <li><strong>Dados Fiscais:</strong> Mantidos por 5 anos conforme legislação brasileira</li>
                  <li><strong>Logs de Segurança:</strong> Mantidos por 6 meses</li>
                </ul>

                <p><strong>5.2. Medidas de Segurança Implementadas:</strong></p>
                <ul>
                  <li><strong>Criptografia:</strong> Dados em trânsito (TLS 1.3) e em repouso (AES-256)</li>
                  <li><strong>Autenticação:</strong> Senhas hasheadas com bcrypt, suporte a autenticação de 2 fatores</li>
                  <li><strong>Controle de Acesso:</strong> Princípio do menor privilégio (least privilege)</li>
                  <li><strong>Firewall e Monitoramento:</strong> Proteção contra ataques DDoS, SQL injection, XSS</li>
                  <li><strong>Backups:</strong> Realizados diariamente com criptografia</li>
                  <li><strong>Testes de Segurança:</strong> Auditorias e testes de penetração regulares</li>
                  <li><strong>Treinamento:</strong> Equipe treinada em boas práticas de segurança e LGPD</li>
                </ul>

                <p className="font-semibold text-primary">
                  Apesar de implementarmos medidas robustas de segurança, nenhum método de transmissão ou 
                  armazenamento eletrônico é 100% seguro. Não podemos garantir segurança absoluta.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">6. Seus Direitos (LGPD)</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-lg dark:prose-invert max-w-none">
                <p>
                  Conforme a LGPD, você tem os seguintes direitos em relação aos seus dados pessoais:
                </p>

                <ul>
                  <li><strong>Confirmação e Acesso (Art. 18, I e II):</strong> Saber se tratamos seus dados e 
                  acessá-los</li>
                  <li><strong>Correção (Art. 18, III):</strong> Corrigir dados incompletos, inexatos ou desatualizados</li>
                  <li><strong>Anonimização, Bloqueio ou Eliminação (Art. 18, IV):</strong> Solicitar anonimização ou 
                  exclusão de dados desnecessários ou tratados em desconformidade</li>
                  <li><strong>Portabilidade (Art. 18, V):</strong> Receber seus dados em formato estruturado e 
                  interoperável</li>
                  <li><strong>Informação sobre Compartilhamento (Art. 18, VII):</strong> Saber com quem 
                  compartilhamos seus dados</li>
                  <li><strong>Revogação do Consentimento (Art. 18, IX):</strong> Retirar consentimento para 
                  tratamentos baseados nessa base legal</li>
                  <li><strong>Oposição (Art. 18, § 2º):</strong> Opor-se a tratamentos realizados com base em 
                  legítimo interesse</li>
                </ul>

                <p><strong>Como Exercer Seus Direitos:</strong></p>
                <ul>
                  <li><strong>Dentro da Plataforma:</strong> Acesse "Configurações" → "Privacidade" → 
                  "Gerenciar Dados"</li>
                  <li><strong>Por Email:</strong> dpo@easypet.com.br (resposta em até 15 dias)</li>
                  <li><strong>Suporte:</strong> easypetc@gmail.com</li>
                </ul>

                <p>
                  <strong>Importante:</strong> Alguns direitos podem ter limitações legais. Por exemplo, não 
                  podemos deletar dados que somos obrigados a manter por lei (registros fiscais).
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">7. Dados de Menores de Idade</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-lg dark:prose-invert max-w-none">
                <p>
                  A plataforma EasyPet não é direcionada a menores de 18 anos. Não coletamos conscientemente 
                  dados pessoais de menores sem consentimento dos pais ou responsáveis.
                </p>
                <p>
                  Dados de pets que são de propriedade de menores devem ser cadastrados por seus responsáveis legais.
                </p>
                <p>
                  Se tomarmos conhecimento de que coletamos dados de menores sem autorização, deletaremos essas 
                  informações imediatamente.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">8. Alterações nesta Política</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-lg dark:prose-invert max-w-none">
                <p>
                  Podemos atualizar esta Política de Privacidade periodicamente para refletir mudanças em nossas 
                  práticas ou por requisitos legais.
                </p>
                <p>
                  Alterações significativas serão notificadas por:
                </p>
                <ul>
                  <li>Email para o endereço cadastrado (com 30 dias de antecedência mínima)</li>
                  <li>Notificação destacada na plataforma</li>
                  <li>Atualização da data "Última atualização" no topo desta página</li>
                </ul>
                <p>
                  Recomendamos revisar esta política periodicamente.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">9. Contato e Reclamações</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-lg dark:prose-invert max-w-none">
                <p><strong>Entre em contato conosco:</strong></p>
                <ul>
                  <li><strong>Encarregado de Dados (DPO):</strong> dpo@easypet.com.br</li>
                  <li><strong>Suporte Geral:</strong> easypetc@gmail.com</li>
                  <li><strong>Telefone:</strong> (21) 95926-2880</li>
                  <li><strong>Endereço:</strong> São Paulo, SP, Brasil</li>
                </ul>

                <p><strong>Direito de Reclamação:</strong></p>
                <p>
                  Se você acredita que seus direitos de privacidade foram violados, você tem o direito de apresentar 
                  uma reclamação à Autoridade Nacional de Proteção de Dados (ANPD):
                </p>
                <ul>
                  <li><strong>Site:</strong> https://www.gov.br/anpd/</li>
                  <li><strong>Email:</strong> comunicacao@anpd.gov.br</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <ShieldCheck className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-lg mb-2">Compromisso com a Privacidade</h3>
                    <p className="text-muted-foreground">
                      A EasyPet está comprometida em proteger sua privacidade e cumprir rigorosamente a LGPD e 
                      demais legislações aplicáveis. Tratamos a segurança dos seus dados com a máxima seriedade 
                      e transparência.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
