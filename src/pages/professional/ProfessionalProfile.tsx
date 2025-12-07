import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState, useRef } from "react";
import { Store, Clock, MapPin, Phone, Mail, FileText, Plus, Save, User, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { PrivacyNotice } from "@/components/shared/PrivacyNotice";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { petShopProfileSchema, PetShopProfileFormData, formatCNPJ, formatPhone } from "@/lib/schemas/profile.schema";

const ProfessionalProfile = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<PetShopProfileFormData>({
    resolver: zodResolver(petShopProfileSchema),
    defaultValues: {
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
    },
  });

  const logoUrl = watch("logo_url");

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
        setValue("name", petShop.name || "");
        setValue("cnpj", "");
        setValue("phone", petShop.phone || "");
        setValue("email", petShop.email || "");
        setValue("address", petShop.address || "");
        setValue("city", petShop.city || "");
        setValue("state", petShop.state || "");
        setValue("hours", petShop.hours || "");
        setValue("description", petShop.description || "");
        setValue("logo_url", petShop.logo_url || "");
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Erro",
        description: "Por favor, selecione uma imagem válida.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Erro",
        description: "A imagem deve ter no máximo 5MB.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
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

      if (logoUrl) {
        const oldPath = logoUrl.split('/').pop();
        if (oldPath) {
          await supabase.storage
            .from('avatars')
            .remove([`${user?.id}/${oldPath}`]);
        }
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user?.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from("pet_shops")
        .update({ logo_url: publicUrl })
        .eq("id", petShop.id);

      if (updateError) throw updateError;

      setValue("logo_url", publicUrl);

      toast({
        title: "Foto atualizada!",
        description: "Sua foto de perfil foi atualizada com sucesso.",
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Erro",
        description: "Não foi possível fazer upload da imagem.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (data: PetShopProfileFormData) => {
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
          name: data.name,
          phone: data.phone,
          email: data.email,
          address: data.address,
          city: data.city,
          state: data.state?.toUpperCase(),
          hours: data.hours,
          description: data.description,
          logo_url: data.logo_url,
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

  const handleCNPJChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCNPJ(e.target.value);
    setValue("cnpj", formatted, { shouldValidate: true });
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setValue("phone", formatted, { shouldValidate: true });
  };

  if (loading) {
    return <p className="text-muted-foreground">Carregando...</p>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Perfil do PetShop</h1>
        <Button type="submit" disabled={saving || !isDirty}>
          <Save className="mr-2 h-4 w-4" />
          {saving ? "Salvando..." : "Salvar Alterações"}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-center">Foto de Perfil</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <div className="relative">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={handleAvatarClick}
                disabled={uploading}
                className="relative group h-32 w-32 rounded-full overflow-hidden border-4 border-primary/20 hover:border-primary transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-primary/50"
              >
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt="Foto de perfil"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-muted flex items-center justify-center">
                    <User className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
                
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  {uploading ? (
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
                  ) : (
                    <Plus className="h-12 w-12 text-white" />
                  )}
                </div>
              </button>
              
              <p className="text-center text-sm text-muted-foreground mt-2">
                Clique para alterar a foto
              </p>
              <PrivacyNotice 
                message="O logo do seu pet shop será visível publicamente para seus clientes."
                className="mt-3 max-w-xs"
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
              <Label>Nome do PetShop *</Label>
              <Input
                {...register("name")}
                placeholder="Nome do estabelecimento"
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <Label>CNPJ</Label>
              <Input
                {...register("cnpj")}
                onChange={handleCNPJChange}
                placeholder="00.000.000/0000-00"
                maxLength={18}
                className={errors.cnpj ? "border-red-500" : ""}
              />
              {errors.cnpj && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.cnpj.message}
                </p>
              )}
            </div>

            <div>
              <Label>
                <Phone className="inline h-4 w-4 mr-1" />
                Telefone
              </Label>
              <Input
                {...register("phone")}
                onChange={handlePhoneChange}
                placeholder="(00) 00000-0000"
                maxLength={15}
                className={errors.phone ? "border-red-500" : ""}
              />
              {errors.phone && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.phone.message}
                </p>
              )}
            </div>

            <div>
              <Label>
                <Mail className="inline h-4 w-4 mr-1" />
                Email
              </Label>
              <Input
                type="email"
                {...register("email")}
                placeholder="contato@petshop.com"
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.email.message}
                </p>
              )}
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
                {...register("address")}
                placeholder="Rua, número, bairro"
                className={errors.address ? "border-red-500" : ""}
              />
              {errors.address && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.address.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Cidade</Label>
                <Input
                  {...register("city")}
                  placeholder="Cidade"
                  className={errors.city ? "border-red-500" : ""}
                />
                {errors.city && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.city.message}
                  </p>
                )}
              </div>

              <div>
                <Label>Estado</Label>
                <Input
                  {...register("state")}
                  placeholder="UF"
                  maxLength={2}
                  className={`uppercase ${errors.state ? "border-red-500" : ""}`}
                />
                {errors.state && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.state.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label>
                <Clock className="inline h-4 w-4 mr-1" />
                Horário de Funcionamento
              </Label>
              <Input
                {...register("hours")}
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
              {...register("description")}
              placeholder="Descreva seu petshop, serviços oferecidos, diferenciais..."
              maxLength={1000}
              rows={6}
              className={errors.description ? "border-red-500" : ""}
            />
            <div className="flex justify-between mt-2">
              {errors.description && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.description.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground ml-auto">
                {watch("description")?.length || 0}/1000 caracteres
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </form>
  );
};

export default ProfessionalProfile;
