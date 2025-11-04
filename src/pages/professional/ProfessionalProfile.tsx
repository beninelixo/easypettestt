import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import { Store, Clock, MapPin, Phone, Mail, FileText, Camera, Save } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const ProfessionalProfile = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    cnpj: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    hours: "",
    description: "",
    logo_url: "",
  });

  useEffect(() => {
    if (user) {
      loadPetShopData();
    }
  }, [user]);

  const loadPetShopData = async () => {
    try {
      const { data: petShop, error } = await supabase
        .from("pet_shops")
        .select("*")
        .eq("owner_id", user?.id)
        .single();

      if (error) throw error;

      if (petShop) {
        setFormData({
          name: petShop.name || "",
          cnpj: "",
          phone: petShop.phone || "",
          email: petShop.email || "",
          address: petShop.address || "",
          city: petShop.city || "",
          state: petShop.state || "",
          hours: petShop.hours || "",
          description: petShop.description || "",
          logo_url: petShop.logo_url || "",
        });
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: petShop } = await supabase
        .from("pet_shops")
        .select("id")
        .eq("owner_id", user?.id)
        .single();

      if (!petShop) {
        toast({
          title: "Erro",
          description: "PetShop não encontrado.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from("pet_shops")
        .update({
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          hours: formData.hours,
          description: formData.description,
          logo_url: formData.logo_url,
        })
        .eq("id", petShop.id);

      if (error) throw error;

      toast({
        title: "Perfil atualizado!",
        description: "As informações foram salvas com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível salvar as informações.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-muted-foreground">Carregando...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Perfil do PetShop</h1>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="mr-2 h-4 w-4" />
          {saving ? "Salvando..." : "Salvar Alterações"}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Imagem de Perfil
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.logo_url && (
              <div className="flex justify-center">
                <img
                  src={formData.logo_url}
                  alt="Logo"
                  className="h-32 w-32 rounded-full object-cover border-4 border-primary"
                />
              </div>
            )}
            <div>
              <Label>URL da Logo</Label>
              <Input
                value={formData.logo_url}
                onChange={(e) =>
                  setFormData({ ...formData, logo_url: e.target.value })
                }
                placeholder="https://exemplo.com/logo.png"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              Informações Básicas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Nome do PetShop</Label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Nome do estabelecimento"
              />
            </div>

            <div>
              <Label>CNPJ</Label>
              <Input
                value={formData.cnpj}
                onChange={(e) =>
                  setFormData({ ...formData, cnpj: e.target.value })
                }
                placeholder="00.000.000/0000-00"
              />
            </div>

            <div>
              <Label>
                <Phone className="inline h-4 w-4 mr-1" />
                Telefone
              </Label>
              <Input
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="(00) 00000-0000"
              />
            </div>

            <div>
              <Label>
                <Mail className="inline h-4 w-4 mr-1" />
                Email
              </Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="contato@petshop.com"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Localização
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Endereço Completo</Label>
              <Input
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                placeholder="Rua, número, bairro"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Cidade</Label>
                <Input
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                  placeholder="Cidade"
                />
              </div>

              <div>
                <Label>Estado</Label>
                <Input
                  value={formData.state}
                  onChange={(e) =>
                    setFormData({ ...formData, state: e.target.value })
                  }
                  placeholder="UF"
                  maxLength={2}
                />
              </div>
            </div>

            <div>
              <Label>
                <Clock className="inline h-4 w-4 mr-1" />
                Horário de Funcionamento
              </Label>
              <Input
                value={formData.hours}
                onChange={(e) =>
                  setFormData({ ...formData, hours: e.target.value })
                }
                placeholder="Ex: Seg-Sex: 8h-18h, Sáb: 8h-12h"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Descrição
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Descreva seu petshop, serviços oferecidos, diferenciais..."
              maxLength={1000}
              rows={6}
            />
            <p className="text-xs text-muted-foreground mt-2">
              {formData.description.length}/1000 caracteres
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfessionalProfile;
