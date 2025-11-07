import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateSuccessStory } from '@/hooks/useSuccessStories';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { z } from 'zod';

const successStorySchema = z.object({
  business_name: z.string()
    .trim()
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(200, 'Nome deve ter no máximo 200 caracteres'),
  owner_name: z.string()
    .trim()
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(200, 'Nome deve ter no máximo 200 caracteres'),
  location: z.string()
    .trim()
    .min(3, 'Localização inválida')
    .max(200, 'Localização muito longa'),
  segment: z.enum(['petshop', 'banhotosa', 'clinica']),
  revenue_growth_percent: z.number()
    .min(0, 'Crescimento não pode ser negativo')
    .max(1000, 'Valor muito alto')
    .optional(),
  total_clients: z.number()
    .int('Deve ser número inteiro')
    .min(0, 'Não pode ser negativo')
    .max(1000000, 'Valor muito alto')
    .optional(),
  satisfaction_rating: z.number()
    .min(0, 'Avaliação mínima é 0')
    .max(5, 'Avaliação máxima é 5')
    .optional(),
  testimonial: z.string()
    .trim()
    .min(50, 'Depoimento muito curto (mínimo 50 caracteres)')
    .max(2000, 'Depoimento muito longo (máximo 2000 caracteres)'),
  highlight: z.string()
    .trim()
    .min(10, 'Destaque muito curto (mínimo 10 caracteres)')
    .max(300, 'Destaque muito longo (máximo 300 caracteres)'),
  image_url: z.string().url('URL inválida').optional().or(z.literal('')),
});

export default function SubmitSuccessStory() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const createStory = useCreateSuccessStory();
  
  const [formData, setFormData] = useState({
    business_name: '',
    owner_name: '',
    location: '',
    segment: 'petshop' as 'petshop' | 'banhotosa' | 'clinica',
    revenue_growth_percent: '',
    total_clients: '',
    satisfaction_rating: '',
    testimonial: '',
    highlight: '',
    image_url: '',
  });

  const [petShopId, setPetShopId] = useState<string>('');

  // Load pet shop data
  useState(() => {
    const loadPetShop = async () => {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('pet_shops')
        .select('*')
        .eq('owner_id', user.id)
        .single();

      if (error) {
        toast.error('Erro ao carregar dados do pet shop');
        return;
      }

      if (data) {
        setPetShopId(data.id);
        setFormData(prev => ({
          ...prev,
          business_name: data.name || '',
          location: `${data.city || ''}, ${data.state || ''}`,
        }));
      }
    };

    loadPetShop();
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!petShopId) {
      toast.error('Pet shop não encontrado');
      return;
    }

    try {
      // Validate input data with Zod schema
      const validatedData = successStorySchema.parse({
        business_name: formData.business_name,
        owner_name: formData.owner_name,
        location: formData.location,
        segment: formData.segment,
        revenue_growth_percent: formData.revenue_growth_percent ? parseFloat(formData.revenue_growth_percent) : undefined,
        total_clients: formData.total_clients ? parseInt(formData.total_clients) : undefined,
        satisfaction_rating: formData.satisfaction_rating ? parseFloat(formData.satisfaction_rating) : undefined,
        testimonial: formData.testimonial,
        highlight: formData.highlight,
        image_url: formData.image_url || undefined,
      });

      await createStory.mutateAsync({
        pet_shop_id: petShopId,
        business_name: validatedData.business_name,
        owner_name: validatedData.owner_name,
        location: validatedData.location,
        segment: validatedData.segment,
        revenue_growth_percent: validatedData.revenue_growth_percent,
        total_clients: validatedData.total_clients,
        satisfaction_rating: validatedData.satisfaction_rating,
        testimonial: validatedData.testimonial,
        highlight: validatedData.highlight,
        image_url: validatedData.image_url,
        approved: false,
        featured: false,
        display_order: 0,
      });

      toast.success('Caso de sucesso enviado para aprovação!');
      navigate('/petshop-dashboard');
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
        return;
      }
      console.error('Erro ao enviar caso de sucesso:', error);
      toast.error('Erro ao enviar caso de sucesso');
    }
  };

  if (!user) {
    navigate('/auth');
    return null;
  }

  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Compartilhe Seu Caso de Sucesso</CardTitle>
          <CardDescription>
            Conte sua história e inspire outros profissionais. Após revisão, seu caso será publicado na página de casos de sucesso.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="business_name">Nome do Negócio *</Label>
              <Input
                id="business_name"
                value={formData.business_name}
                onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="owner_name">Seu Nome *</Label>
              <Input
                id="owner_name"
                value={formData.owner_name}
                onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Localização (Cidade, Estado) *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="segment">Segmento *</Label>
              <Select
                value={formData.segment}
                onValueChange={(value: any) => setFormData({ ...formData, segment: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="petshop">Pet Shop</SelectItem>
                  <SelectItem value="banhotosa">Banho & Tosa</SelectItem>
                  <SelectItem value="clinica">Clínica Veterinária</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="revenue_growth">Crescimento de Faturamento (%)</Label>
                <Input
                  id="revenue_growth"
                  type="number"
                  step="0.01"
                  value={formData.revenue_growth_percent}
                  onChange={(e) => setFormData({ ...formData, revenue_growth_percent: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="total_clients">Total de Clientes</Label>
                <Input
                  id="total_clients"
                  type="number"
                  value={formData.total_clients}
                  onChange={(e) => setFormData({ ...formData, total_clients: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="satisfaction">Satisfação (0-5)</Label>
                <Input
                  id="satisfaction"
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  value={formData.satisfaction_rating}
                  onChange={(e) => setFormData({ ...formData, satisfaction_rating: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="highlight">Destaque Principal (máx. 300 caracteres) *</Label>
              <Input
                id="highlight"
                maxLength={300}
                value={formData.highlight}
                onChange={(e) => setFormData({ ...formData, highlight: e.target.value })}
                required
                placeholder="Ex: Aumentei meu faturamento em 150% em 6 meses"
              />
              <p className="text-xs text-muted-foreground">
                {formData.highlight.length}/300 caracteres
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="testimonial">Seu Depoimento *</Label>
              <Textarea
                id="testimonial"
                rows={8}
                value={formData.testimonial}
                onChange={(e) => setFormData({ ...formData, testimonial: e.target.value })}
                required
                placeholder="Conte sua história: Como o sistema ajudou seu negócio? Quais foram os principais benefícios? Qual sua experiência?"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image_url">URL da Imagem (opcional)</Label>
              <Input
                id="image_url"
                type="url"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                placeholder="https://exemplo.com/imagem.jpg"
              />
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">
                ℹ️ Seu caso de sucesso será revisado por nossa equipe antes de ser publicado. Você receberá uma notificação quando for aprovado.
              </p>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={createStory.isPending}>
                {createStory.isPending ? 'Enviando...' : 'Enviar para Aprovação'}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/petshop-dashboard')}>
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
