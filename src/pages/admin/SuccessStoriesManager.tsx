import { useState } from 'react';
import { useSuccessStories, useUpdateSuccessStory, useDeleteSuccessStory } from '@/hooks/useSuccessStories';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, X, Star, StarOff, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export default function SuccessStoriesManager() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: stories, isLoading } = useSuccessStories(false);
  const updateStory = useUpdateSuccessStory();
  const deleteStory = useDeleteSuccessStory();
  const [searchTerm, setSearchTerm] = useState('');

  // Check if user is admin
  if (!user) {
    navigate('/auth');
    return null;
  }

  const handleApprove = async (id: string) => {
    try {
      await updateStory.mutateAsync({ id, updates: { approved: true } });
      toast.success('Caso de sucesso aprovado!');
    } catch (error) {
      toast.error('Erro ao aprovar caso de sucesso');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await updateStory.mutateAsync({ id, updates: { approved: false } });
      toast.success('Caso de sucesso rejeitado');
    } catch (error) {
      toast.error('Erro ao rejeitar caso de sucesso');
    }
  };

  const handleToggleFeatured = async (id: string, currentFeatured: boolean) => {
    try {
      await updateStory.mutateAsync({ id, updates: { featured: !currentFeatured } });
      toast.success(currentFeatured ? 'Removido dos destaques' : 'Adicionado aos destaques');
    } catch (error) {
      toast.error('Erro ao atualizar destaque');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este caso de sucesso?')) return;
    
    try {
      await deleteStory.mutateAsync(id);
      toast.success('Caso de sucesso excluído');
    } catch (error) {
      toast.error('Erro ao excluir caso de sucesso');
    }
  };

  const handleChangeOrder = async (id: string, currentOrder: number, direction: 'up' | 'down') => {
    const newOrder = direction === 'up' ? currentOrder - 1 : currentOrder + 1;
    try {
      await updateStory.mutateAsync({ id, updates: { display_order: newOrder } });
      toast.success('Ordem atualizada');
    } catch (error) {
      toast.error('Erro ao atualizar ordem');
    }
  };

  const filteredStories = stories?.filter(story =>
    story.business_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    story.owner_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    story.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingStories = filteredStories?.filter(s => !s.approved);
  const approvedStories = filteredStories?.filter(s => s.approved);

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Carregando...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Gerenciar Casos de Sucesso</CardTitle>
          <Input
            placeholder="Buscar por nome, proprietário ou localização..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mt-4"
          />
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pending">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="pending">
                Pendentes ({pendingStories?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="approved">
                Aprovados ({approvedStories?.length || 0})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="space-y-4 mt-6">
              {pendingStories?.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Nenhum caso pendente de aprovação
                </p>
              ) : (
                pendingStories?.map((story) => (
                  <Card key={story.id}>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold">{story.business_name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {story.owner_name} • {story.location}
                          </p>
                          <Badge className="mt-2">{story.segment}</Badge>
                          
                          <div className="mt-4 space-y-2">
                            <p className="text-sm">
                              <strong>Crescimento:</strong> {story.revenue_growth_percent}%
                            </p>
                            <p className="text-sm">
                              <strong>Clientes:</strong> {story.total_clients}
                            </p>
                            <p className="text-sm">
                              <strong>Satisfação:</strong> {story.satisfaction_rating}/5
                            </p>
                          </div>

                          <p className="mt-4 text-sm italic">"{story.highlight}"</p>
                          <p className="mt-2 text-sm">{story.testimonial}</p>
                        </div>

                        <div className="flex flex-col gap-2 ml-4">
                          <Button
                            size="sm"
                            onClick={() => handleApprove(story.id)}
                            className="gap-2"
                          >
                            <Check className="h-4 w-4" />
                            Aprovar
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(story.id)}
                            className="gap-2"
                          >
                            <Trash2 className="h-4 w-4" />
                            Excluir
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="approved" className="space-y-4 mt-6">
              {approvedStories?.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Nenhum caso aprovado ainda
                </p>
              ) : (
                approvedStories?.map((story) => (
                  <Card key={story.id}>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-xl font-bold">{story.business_name}</h3>
                            {story.featured && (
                              <Badge variant="secondary" className="gap-1">
                                <Star className="h-3 w-3" />
                                Destaque
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {story.owner_name} • {story.location}
                          </p>
                          <Badge className="mt-2">{story.segment}</Badge>
                          
                          <p className="mt-4 text-sm italic">"{story.highlight}"</p>
                        </div>

                        <div className="flex flex-col gap-2 ml-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleToggleFeatured(story.id, story.featured)}
                            className="gap-2"
                          >
                            {story.featured ? (
                              <>
                                <StarOff className="h-4 w-4" />
                                Remover Destaque
                              </>
                            ) : (
                              <>
                                <Star className="h-4 w-4" />
                                Destacar
                              </>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleChangeOrder(story.id, story.display_order, 'up')}
                            className="gap-2"
                          >
                            <ArrowUp className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleChangeOrder(story.id, story.display_order, 'down')}
                            className="gap-2"
                          >
                            <ArrowDown className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReject(story.id)}
                            className="gap-2"
                          >
                            <X className="h-4 w-4" />
                            Desaprovar
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(story.id)}
                            className="gap-2"
                          >
                            <Trash2 className="h-4 w-4" />
                            Excluir
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
