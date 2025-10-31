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
import { Store, Loader2, ArrowLeft } from "lucide-react";

export default function EditarPetshop() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [petShopId, setPetShopId] = useState<string>("");
  const [petShopCode, setPetShopCode] = useState<string>("");
  
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
    const loadPetShop = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('pet_shops')
          .select('*')
          .eq('owner_id', user.id)
          .single();

        if (error) throw error;

        if (data) {
          setPetShopId(data.id);
          setPetShopCode(data.code);
          setFormData({
            name: data.name || "",
            address: data.address || "",
            city: data.city || "",
            phone: data.phone || "",
            email: data.email || "",
            description: data.description || "",
            hours: data.hours || "",
          });
        }
      } catch (error: any) {
        console.error('Error loading pet shop:', error);
        toast({
          title: "Erro ao carregar dados",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoadingData(false);
      }
    };

    loadPetShop();
  }, [user, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !petShopId) {
      toast({
        title: "Erro",
        description: "Dados do petshop não encontrados",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('pet_shops')
        .update({
          name: formData.name,
          address: formData.address,
          city: formData.city,
          phone: formData.phone,
          email: formData.email,
          description: formData.description,
          hours: formData.hours,
        })
        .eq('id', petShopId);

      if (error) throw error;

      toast({
        title: "✅ Alterações salvas!",
        description: "As informações do seu petshop foram atualizadas com sucesso.",
      });

      navigate('/petshop-dashboard/configuracoes');
    } catch (error: any) {
      console.error('Error updating pet shop:', error);
      toast({
        title: "Erro ao salvar alterações",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        onClick={() => navigate('/petshop-dashboard/configuracoes')}
        className="flex items-center gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para Configurações
      </Button>

      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Store className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl">🏪 Editar Informações do Petshop</CardTitle>
              <CardDescription>
                Código do Petshop: <span className="font-semibold text-primary">{petShopCode}</span>
              </CardDescription>
            </div>
          </div>
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

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => navigate('/petshop-dashboard/configuracoes')}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "💾 Salvar Alterações"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
