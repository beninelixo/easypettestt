import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Store, Loader2 } from "lucide-react";

export default function PetShopSetup() {
  const navigate = useNavigate();
  const { user, userRole } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [checkingPetShop, setCheckingPetShop] = useState(true);
  
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    phone: "",
    email: "",
    description: "",
    hours: "",
  });

  useEffect(() => {
    // Pre-fill from signup if available
    const urlParams = new URLSearchParams(window.location.search);
    const prefilledName = urlParams.get('name');
    const prefilledCity = urlParams.get('city');
    
    if (prefilledName || prefilledCity) {
      setFormData(prev => ({
        ...prev,
        name: prefilledName || prev.name,
        city: prefilledCity || prev.city,
      }));
    }
  }, []);

  useEffect(() => {
    const checkExistingPetShop = async () => {
      if (!user) {
        setCheckingPetShop(false);
        return;
      }

      if (userRole !== 'pet_shop') {
        // User is not a pet shop professional, redirect to appropriate dashboard
        navigate('/client/pets');
        return;
      }

      try {
        // Check if user already has a pet shop
        const { data, error } = await supabase
          .from('pet_shops')
          .select('id')
          .eq('owner_id', user.id)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          console.error('Error checking pet shop:', error);
        }

        if (data) {
          // User already has a pet shop, redirect to dashboard
          navigate('/petshop-dashboard');
        }
      } catch (error) {
        console.error('Error in checkExistingPetShop:', error);
      } finally {
        setCheckingPetShop(false);
      }
    };

    checkExistingPetShop();
  }, [user, userRole, navigate]);

  if (checkingPetShop) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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
          email: formData.email,
          description: formData.description,
          hours: formData.hours,
          code: codeData,
        });

      if (insertError) throw insertError;

      toast({
        title: "🎉 Pet Shop cadastrado com sucesso!",
        description: `Seu código exclusivo é ${codeData} — compartilhe com seus clientes para que possam escolher seu petshop.`,
        duration: 5000,
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
          <CardTitle className="text-3xl">🏪 Cadastrar Meu Petshop</CardTitle>
          <CardDescription>
            Preencha as informações do seu estabelecimento para começar a receber clientes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                🏪 Nome do Pet Shop *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: PetChop do Zé"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  ☎️ Telefone de Contato *
                </Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(98) 99999-9999"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  💌 E-mail Comercial
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="contato@petchop.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address" className="flex items-center gap-2">
                📍 Endereço Completo
              </Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Rua dos Bichos, 123 - Bairro"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city" className="flex items-center gap-2">
                🌆 Cidade *
              </Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Ex: São Luís/MA"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hours" className="flex items-center gap-2">
                🕒 Horário de Funcionamento
              </Label>
              <Input
                id="hours"
                value={formData.hours}
                onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                placeholder="Ex: 08h às 18h"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="flex items-center gap-2">
                📋 Descrição do Petshop
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Ex: Banho, tosa e cuidados especiais para o seu pet com amor e qualidade!"
                rows={3}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando Petshop...
                </>
              ) : (
                "💾 Salvar Petshop"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}