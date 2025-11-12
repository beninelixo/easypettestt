import { useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send,
  MessageSquare,
  Sparkles,
  CheckCircle2
} from "lucide-react";


const contactSchema = z.object({
  name: z.string().trim().min(2, "Nome muito curto").max(100, "Nome muito longo"),
  email: z.string().trim().email("Email inválido").max(255, "Email muito longo"),
  phone: z.string().trim().max(15, "Telefone muito longo").optional(),
  subject: z.string().trim().min(3, "Assunto muito curto").max(200, "Assunto muito longo"),
  message: z.string().trim().min(10, "Mensagem muito curta").max(1000, "Mensagem muito longa"),
});

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  });
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    // Validação com zod
    const validation = contactSchema.safeParse(formData);

    if (!validation.success) {
      const errors: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        if (err.path[0]) {
          errors[err.path[0] as string] = err.message;
        }
      });
      setFormErrors(errors);
      toast({
        title: 'Erro de validação',
        description: 'Por favor, corrija os erros no formulário.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    // Simulate API call (you can replace this with actual backend call)
    await new Promise(resolve => setTimeout(resolve, 1000));

    toast({
      title: "Mensagem enviada com sucesso!",
      description: "Nossa equipe entrará em contato em breve.",
    });

    setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const contactInfo = [
    {
      icon: Mail,
      title: "E-mail",
      content: "contato@easypet.com.br",
      description: "Resposta em até 24h",
      color: "primary"
    },
    {
      icon: Phone,
      title: "WhatsApp Business",
      content: "(21) 95926-2880",
      description: "Atendimento rápido 24/7",
      color: "secondary"
    },
    {
      icon: MapPin,
      title: "Endereço",
      content: "São Paulo, SP",
      description: "Brasil",
      color: "accent"
    },
    {
      icon: Clock,
      title: "Horário",
      content: "Seg a Sex: 9h às 18h",
      description: "Sáb: 9h às 13h",
      color: "primary"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Contato - EasyPet | Fale Conosco"
        description="Entre em contato com nossa equipe de especialistas. Tire dúvidas, agende uma demonstração ou solicite consultoria gratuita. Atendimento de segunda a sábado."
        url="https://fee7e0fa-1989-41d0-b964-a2da81396f8b.lovableproject.com/contact"
      />
      <Navigation />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 bg-gradient-to-br from-primary/5 via-secondary/5 to-background relative overflow-hidden">
        <div className="absolute inset-0 bg-dot-pattern opacity-30" />
        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="text-center space-y-6 max-w-4xl mx-auto animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-full text-primary text-sm font-semibold">
              <MessageSquare className="h-4 w-4" />
              Estamos Aqui Para Ajudar
            </div>
            <h1 className="text-5xl lg:text-7xl font-black leading-tight">
              Entre em Contato
            </h1>
            <p className="text-xl lg:text-2xl text-muted-foreground leading-relaxed">
              Tem dúvidas? Quer agendar uma demonstração? Fale com nossos especialistas
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map((info, index) => (
              <Card 
                key={index}
                className="border-2 border-border hover:border-primary hover:shadow-lg transition-all duration-300 animate-fade-in hover-lift"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader className="space-y-4">
                  <div className={`w-14 h-14 bg-gradient-to-br from-${info.color}/20 to-${info.color}/10 rounded-xl flex items-center justify-center`}>
                    <info.icon className={`h-7 w-7 text-${info.color}`} />
                  </div>
                  <CardTitle className="text-xl">{info.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="font-semibold text-lg">{info.content}</p>
                  <p className="text-sm text-muted-foreground">{info.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-16 px-4 bg-muted">
        <div className="container mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Form */}
            <Card className="border-2 border-border shadow-xl">
              <CardHeader className="space-y-2">
                <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <Send className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-3xl font-bold">Envie sua mensagem</CardTitle>
                <CardDescription className="text-base">
                  Preencha o formulário abaixo e nossa equipe entrará em contato
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome completo *</Label>
                    <Input 
                      id="name"
                      name="name"
                      placeholder="Seu nome"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="h-12"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">E-mail *</Label>
                      <Input 
                        id="email"
                        name="email"
                        type="email"
                        placeholder="seu@email.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="h-12"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefone</Label>
                      <Input 
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="(11) 99999-9999"
                        value={formData.phone}
                        onChange={handleChange}
                        className="h-12"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Assunto *</Label>
                    <Input 
                      id="subject"
                      name="subject"
                      placeholder="Sobre o que você gostaria de falar?"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Mensagem *</Label>
                    <Textarea 
                      id="message"
                      name="message"
                      placeholder="Conte-nos mais detalhes..."
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      className="resize-none"
                    />
                    {formErrors.message && (
                      <p className="text-sm text-destructive">⚠️ {formErrors.message}</p>
                    )}
                  </div>

                  <Button
                    type="submit" 
                    size="lg"
                    className="w-full py-6 text-lg font-bold"
                    disabled={loading}
                  >
                    {loading ? "Enviando..." : "Enviar Mensagem"}
                    <Send className="ml-2 h-5 w-5" />
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Info & Benefits */}
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-semibold">
                  <Sparkles className="h-4 w-4" />
                  Por que falar conosco?
                </div>
                <h2 className="text-4xl font-black">
                  Suporte especializado para seu sucesso
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Nossa equipe de especialistas está pronta para ajudar você a transformar sua clínica veterinária.
                </p>
              </div>

              <div className="space-y-4">
                {[
                  "Resposta rápida e personalizada",
                  "Consultoria gratuita com especialistas",
                  "Demonstração ao vivo do sistema",
                  "Suporte técnico especializado",
                  "Treinamento completo da equipe",
                  "Migração de dados sem custo adicional"
                ].map((benefit, index) => (
                  <div 
                    key={index}
                    className="flex items-start gap-4 p-4 rounded-xl bg-background border border-border hover:border-primary hover:shadow-md transition-all duration-300 animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-accent/20 to-accent/10 rounded-full flex items-center justify-center mt-1">
                      <CheckCircle2 className="h-4 w-4 text-accent" />
                    </div>
                    <span className="text-base font-medium">{benefit}</span>
                  </div>
                ))}
              </div>

              {/* CTA Card */}
              <Card className="border-2 border-primary bg-gradient-to-br from-primary/5 to-secondary/5">
                <CardContent className="p-8 text-center space-y-4">
                  <h3 className="text-2xl font-bold">
                    Prefere falar pelo WhatsApp?
                  </h3>
                  <p className="text-muted-foreground">
                    Clique e converse agora com um especialista
                  </p>
                  <a 
                    href="https://wa.me/5521959262880?text=Olá!%20Gostaria%20de%20saber%20mais%20sobre%20o%20EasyPet" 
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button size="lg" className="w-full py-6 text-lg font-bold bg-[#25D366] hover:bg-[#20BA5A] text-white">
                      <MessageSquare className="mr-2 h-5 w-5" />
                      Abrir WhatsApp
                    </Button>
                  </a>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;
