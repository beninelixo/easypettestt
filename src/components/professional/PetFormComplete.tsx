import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import { Loader2 } from "lucide-react";

const petSchema = z.object({
  name: z.string().min(2, "Nome muito curto"),
  species: z.enum(['dog', 'cat', 'bird', 'rabbit', 'other']),
  breed: z.string().optional(),
  gender: z.enum(['male', 'female']).optional(),
  birth_date: z.string().optional(),
  coat_type: z.enum(['short', 'long', 'curly', 'straight', 'hairless']).optional(),
  coat_color: z.string().optional(),
  size: z.enum(['small', 'medium', 'large', 'giant']),
  neutered: z.boolean().default(false),
  allergies: z.string().optional(),
  chronic_diseases: z.string().optional(),
  temperament: z.enum(['docile', 'playful', 'aggressive', 'fearful', 'calm']).optional(),
  restrictions: z.string().optional(),
  grooming_preferences: z.string().optional(),
  observations: z.string().optional(),
});

interface PetFormCompleteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ownerId: string;
  onSuccess: () => void;
}

export const PetFormComplete = ({ open, onOpenChange, ownerId, onSuccess }: PetFormCompleteProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    species: "dog",
    breed: "",
    gender: "",
    birth_date: "",
    coat_type: "",
    coat_color: "",
    size: "medium",
    neutered: false,
    allergies: "",
    chronic_diseases: "",
    temperament: "",
    restrictions: "",
    grooming_preferences: "",
    observations: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validated = petSchema.parse(formData);

      const { error } = await supabase
        .from("pets")
        .insert([{
          name: validated.name,
          species: validated.species,
          breed: validated.breed || null,
          gender: validated.gender || null,
          birth_date: validated.birth_date || null,
          coat_type: validated.coat_type || null,
          coat_color: validated.coat_color || null,
          size: validated.size,
          neutered: validated.neutered,
          allergies: validated.allergies || null,
          chronic_diseases: validated.chronic_diseases || null,
          temperament: validated.temperament || null,
          restrictions: validated.restrictions || null,
          grooming_preferences: validated.grooming_preferences || null,
          observations: validated.observations || null,
          owner_id: ownerId,
        }]);

      if (error) throw error;

      toast({
        title: "Pet cadastrado com sucesso!",
        description: `${validated.name} foi adicionado ao sistema.`,
      });

      onSuccess();
      onOpenChange(false);
      
      // Reset form
      setFormData({
        name: "",
        species: "dog",
        breed: "",
        gender: "",
        birth_date: "",
        coat_type: "",
        coat_color: "",
        size: "medium",
        neutered: false,
        allergies: "",
        chronic_diseases: "",
        temperament: "",
        restrictions: "",
        grooming_preferences: "",
        observations: "",
      });
    } catch (error: any) {
      console.error("Erro ao criar pet:", error);
      
      if (error.name === "ZodError") {
        const firstError = error.errors[0];
        toast({
          title: "Erro de validação",
          description: firstError.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erro ao cadastrar pet",
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
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Cadastrar Novo Pet</DialogTitle>
          <DialogDescription>
            Preencha os dados completos do pet
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Dados Básicos</TabsTrigger>
              <TabsTrigger value="health">Saúde</TabsTrigger>
              <TabsTrigger value="behavior">Comportamento</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Pet *</Label>
                  <Input
                    id="name"
                    placeholder="Nome do pet"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="species">Espécie *</Label>
                  <Select
                    value={formData.species}
                    onValueChange={(value) => setFormData({ ...formData, species: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dog">Cão</SelectItem>
                      <SelectItem value="cat">Gato</SelectItem>
                      <SelectItem value="bird">Pássaro</SelectItem>
                      <SelectItem value="rabbit">Coelho</SelectItem>
                      <SelectItem value="other">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="breed">Raça</Label>
                  <Input
                    id="breed"
                    placeholder="Ex: Poodle, SRD, Persa"
                    value={formData.breed}
                    onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Sexo</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) => setFormData({ ...formData, gender: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Macho</SelectItem>
                      <SelectItem value="female">Fêmea</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="birth_date">Data de Nascimento</Label>
                  <Input
                    id="birth_date"
                    type="date"
                    value={formData.birth_date}
                    onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="size">Porte *</Label>
                  <Select
                    value={formData.size}
                    onValueChange={(value) => setFormData({ ...formData, size: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Pequeno (até 10kg)</SelectItem>
                      <SelectItem value="medium">Médio (10-25kg)</SelectItem>
                      <SelectItem value="large">Grande (25-45kg)</SelectItem>
                      <SelectItem value="giant">Gigante (45kg+)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="coat_type">Tipo de Pelagem</Label>
                  <Select
                    value={formData.coat_type}
                    onValueChange={(value) => setFormData({ ...formData, coat_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="short">Curta</SelectItem>
                      <SelectItem value="long">Longa</SelectItem>
                      <SelectItem value="curly">Encaracolada</SelectItem>
                      <SelectItem value="straight">Lisa</SelectItem>
                      <SelectItem value="hairless">Sem pelo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="coat_color">Cor da Pelagem</Label>
                  <Input
                    id="coat_color"
                    placeholder="Ex: Marrom, Preto, Branco"
                    value={formData.coat_color}
                    onChange={(e) => setFormData({ ...formData, coat_color: e.target.value })}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="health" className="space-y-4 mt-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="neutered"
                  checked={formData.neutered}
                  onCheckedChange={(checked) => setFormData({ ...formData, neutered: checked as boolean })}
                />
                <Label htmlFor="neutered" className="cursor-pointer">Pet castrado</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="allergies">Alergias</Label>
                <Textarea
                  id="allergies"
                  placeholder="Liste alergias conhecidas (medicamentos, alimentos, etc)"
                  value={formData.allergies}
                  onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="chronic_diseases">Doenças Crônicas</Label>
                <Textarea
                  id="chronic_diseases"
                  placeholder="Liste doenças crônicas (diabetes, problemas cardíacos, etc)"
                  value={formData.chronic_diseases}
                  onChange={(e) => setFormData({ ...formData, chronic_diseases: e.target.value })}
                  rows={3}
                />
              </div>
            </TabsContent>

            <TabsContent value="behavior" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="temperament">Temperamento</Label>
                <Select
                  value={formData.temperament}
                  onValueChange={(value) => setFormData({ ...formData, temperament: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="docile">Dócil</SelectItem>
                    <SelectItem value="playful">Brincalhão</SelectItem>
                    <SelectItem value="aggressive">Agressivo</SelectItem>
                    <SelectItem value="fearful">Medroso</SelectItem>
                    <SelectItem value="calm">Calmo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="restrictions">Restrições</Label>
                <Textarea
                  id="restrictions"
                  placeholder="Restrições especiais (não pode se molhar, medo de secador, etc)"
                  value={formData.restrictions}
                  onChange={(e) => setFormData({ ...formData, restrictions: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="grooming_preferences">Preferências de Banho/Tosa</Label>
                <Textarea
                  id="grooming_preferences"
                  placeholder="Preferências do tutor (corte específico, produtos, etc)"
                  value={formData.grooming_preferences}
                  onChange={(e) => setFormData({ ...formData, grooming_preferences: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="observations">Observações Gerais</Label>
                <Textarea
                  id="observations"
                  placeholder="Outras observações importantes"
                  value={formData.observations}
                  onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                  rows={3}
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
                "Cadastrar Pet"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
