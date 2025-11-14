import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import { Loader2 } from "lucide-react";

const clientSchema = z.object({
  full_name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(10, "Telefone inválido"),
  address: z.string().min(5, "Endereço incompleto"),
  document: z.string().regex(/^\d{11}$|^\d{14}$/, "CPF (11 dígitos) ou CNPJ (14 dígitos) inválido"),
  contact_preference: z.enum(['phone', 'whatsapp', 'email']).default('whatsapp'),
});

interface ClientFormCompleteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const ClientFormComplete = ({ open, onOpenChange, onSuccess }: ClientFormCompleteProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    address: "",
    document: "",
    contact_preference: "whatsapp",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validar dados
      const validated = clientSchema.parse(formData);

      // Criar usuário no auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: validated.email,
        password: Math.random().toString(36).slice(-12), // Senha temporária
        options: {
          data: {
            full_name: validated.full_name,
            phone: validated.phone,
            user_type: 'client',
          },
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Falha ao criar usuário");

      // Atualizar perfil com dados completos
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          address: validated.address,
          document: validated.document,
          contact_preference: validated.contact_preference,
        })
        .eq("id", authData.user.id);

      if (profileError) throw profileError;

      toast({
        title: "Cliente cadastrado com sucesso!",
        description: "Um email de confirmação foi enviado ao cliente.",
      });

      onSuccess();
      onOpenChange(false);
      setFormData({
        full_name: "",
        email: "",
        phone: "",
        address: "",
        document: "",
        contact_preference: "whatsapp",
      });
    } catch (error: any) {
      console.error("Erro ao criar cliente:", error);
      
      if (error.name === "ZodError") {
        const firstError = error.errors[0];
        toast({
          title: "Erro de validação",
          description: firstError.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erro ao cadastrar cliente",
          description: error.message || "Tente novamente mais tarde",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Cadastrar Novo Cliente</DialogTitle>
          <DialogDescription>
            Preencha os dados completos do tutor (cliente)
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic">Dados Básicos</TabsTrigger>
              <TabsTrigger value="contact">Contato e Endereço</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Nome Completo *</Label>
                <Input
                  id="full_name"
                  placeholder="Nome completo do cliente"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@exemplo.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="document">CPF ou CNPJ *</Label>
                <Input
                  id="document"
                  placeholder="00000000000 ou 00000000000000"
                  value={formData.document}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    setFormData({ ...formData, document: value });
                  }}
                  maxLength={14}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Apenas números: CPF (11 dígitos) ou CNPJ (14 dígitos)
                </p>
              </div>
            </TabsContent>

            <TabsContent value="contact" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone *</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(00) 00000-0000"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_preference">Preferência de Contato *</Label>
                <Select
                  value={formData.contact_preference}
                  onValueChange={(value) => setFormData({ ...formData, contact_preference: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    <SelectItem value="phone">Ligação</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Endereço Completo *</Label>
                <Textarea
                  id="address"
                  placeholder="Rua, número, bairro, cidade, estado, CEP"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={3}
                  required
                />
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-3 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cadastrando...
                </>
              ) : (
                "Cadastrar Cliente"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
