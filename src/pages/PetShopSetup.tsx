import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Store } from "lucide-react";

export default function PetShopSetup() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    phone: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Generate unique code
      const { data: codeData, error: codeError } = await supabase.rpc('generate_pet_shop_code');
      
      if (codeError) throw codeError;

      // Create pet shop
      const { error: insertError } = await supabase
        .from('pet_shops')
        .insert({
          owner_id: user.id,
          name: formData.name,
          address: formData.address,
          city: formData.city,
          phone: formData.phone,
          code: codeData,
        });

      if (insertError) throw insertError;

      toast({
        title: "Sucesso!",
        description: `Pet Shop criado com código: ${codeData}`,
      });

      navigate('/petshop-dashboard');
    } catch (error: any) {
      console.error('Error creating pet shop:', error);
      toast({
        title: "Erro ao criar Pet Shop",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Store className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-3xl">Configure seu Pet Shop</CardTitle>
          <CardDescription>
            Preencha as informações do seu estabelecimento para começar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Pet Shop *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Pet Shop Amor Animal"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Endereço</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Rua, número, bairro"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">Cidade *</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Ex: São Paulo"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefone de Contato *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="(11) 98765-4321"
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Criando..." : "Criar Pet Shop"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}