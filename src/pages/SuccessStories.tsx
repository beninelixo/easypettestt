import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, Users, Star, CheckCircle2 } from "lucide-react";
import { SEO } from "@/components/SEO";
import { useSuccessStoriesBySegment } from "@/hooks/useSuccessStories";
import { useGlobalMetrics } from "@/hooks/useGlobalMetrics";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";

const SuccessStories = () => {
  const { data: metrics, isLoading: metricsLoading } = useGlobalMetrics();
  const { data: petshopStories, isLoading: petshopLoading } = useSuccessStoriesBySegment('petshop');
  const { data: banhotosaStories, isLoading: banhotosaLoading } = useSuccessStoriesBySegment('banhotosa');
  const { data: clinicaStories, isLoading: clinicaLoading } = useSuccessStoriesBySegment('clinica');

  const getMetricValue = (metricName: string) => {
    const metric = metrics?.find(m => m.metric_name === metricName);
    return metric?.metric_value || 0;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toString();
  };

  const getSegmentLabel = (segment: string) => {
    const labels: Record<string, string> = {
      petshop: 'Pet Shops',
      banhotosa: 'Banho & Tosa',
      clinica: 'Clínicas',
    };
    return labels[segment] || segment;
  };

  const StoryCard = ({ story }: { story: any }) => (
    <Card className="hover:shadow-lg transition-all duration-300">
      <CardContent className="p-8">
        <div className="flex items-start gap-4 mb-6">
          {story.image_url && (
            <img
              src={story.image_url}
              alt={story.business_name}
              className="w-20 h-20 rounded-lg object-cover"
            />
          )}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-2xl font-bold">{story.business_name}</h3>
              <CheckCircle2 className="h-5 w-5 text-primary" />
            </div>
            <p className="text-muted-foreground">
              {story.owner_name} • {story.location}
            </p>
            <Badge className="mt-2">{getSegmentLabel(story.segment)}</Badge>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg mb-6">
          {story.revenue_growth_percent && (
            <div className="text-center">
              <TrendingUp className="h-5 w-5 text-primary mx-auto mb-1" />
              <div className="text-2xl font-bold text-primary">
                +{story.revenue_growth_percent}%
              </div>
              <p className="text-xs text-muted-foreground">Faturamento</p>
            </div>
          )}
          {story.total_clients && (
            <div className="text-center">
              <Users className="h-5 w-5 text-primary mx-auto mb-1" />
              <div className="text-2xl font-bold text-primary">
                {formatNumber(story.total_clients)}+
              </div>
              <p className="text-xs text-muted-foreground">Clientes</p>
            </div>
          )}
          {story.satisfaction_rating && (
            <div className="text-center">
              <Star className="h-5 w-5 text-primary mx-auto mb-1" />
              <div className="text-2xl font-bold text-primary">
                {story.satisfaction_rating}/5
              </div>
              <p className="text-xs text-muted-foreground">Satisfação</p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-primary/5 border-l-4 border-primary rounded-r-lg">
            <p className="font-bold text-primary italic">"{story.highlight}"</p>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            {story.testimonial}
          </p>
        </div>
      </CardContent>
    </Card>
  );

  const LoadingSkeleton = () => (
    <div className="space-y-6">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardContent className="p-8">
            <Skeleton className="h-20 w-full mb-4" />
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Casos de Sucesso - Histórias Reais de Crescimento"
        description="Conheça histórias reais de pet shops, banho & tosa e clínicas que transformaram seus negócios. Resultados comprovados de crescimento e satisfação."
      />
      <Navigation />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10">
        <div className="container mx-auto max-w-7xl text-center space-y-6">
          <Badge className="text-lg px-6 py-2">Casos de Sucesso Verificados ✓</Badge>
          <h1 className="text-5xl lg:text-6xl font-black">
            Histórias Reais de{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Transformação
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Descubra como negócios pet em todo o Brasil estão crescendo e fidelizando clientes com nosso sistema
          </p>
        </div>
      </section>

      {/* Stats Overview */}
      <section className="py-12 px-4 border-y">
        <div className="container mx-auto max-w-7xl">
          {metricsLoading ? (
            <div className="grid md:grid-cols-4 gap-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="text-center">
                  <Skeleton className="h-12 w-32 mx-auto mb-2" />
                  <Skeleton className="h-4 w-40 mx-auto" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-4xl font-black text-primary mb-2">
                  {formatNumber(getMetricValue('total_active_petshops'))}+
                </div>
                <p className="text-muted-foreground">Negócios Ativos</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-black text-primary mb-2">
                  +{getMetricValue('average_growth_percent').toFixed(0)}%
                </div>
                <p className="text-muted-foreground">Crescimento Médio</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-black text-primary mb-2">
                  {getMetricValue('average_satisfaction').toFixed(1)}/5
                </div>
                <p className="text-muted-foreground">Satisfação Média</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-black text-primary mb-2">
                  {formatNumber(getMetricValue('cities_covered'))}+
                </div>
                <p className="text-muted-foreground">Cidades Atendidas</p>
              </div>
            </div>
          )}
          <p className="text-center text-sm text-muted-foreground mt-6">
            Dados atualizados em {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </p>
        </div>
      </section>

      {/* Success Stories by Segment */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-7xl">
          <Tabs defaultValue="petshop" className="space-y-12">
            <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-3">
              <TabsTrigger value="petshop">Pet Shops</TabsTrigger>
              <TabsTrigger value="banhotosa">Banho & Tosa</TabsTrigger>
              <TabsTrigger value="clinica">Clínicas</TabsTrigger>
            </TabsList>

            <TabsContent value="petshop" className="space-y-8">
              {petshopLoading ? (
                <LoadingSkeleton />
              ) : petshopStories && petshopStories.length > 0 ? (
                petshopStories.map((story) => (
                  <StoryCard key={story.id} story={story} />
                ))
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">
                      Nenhum caso de sucesso disponível ainda para Pet Shops.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="banhotosa" className="space-y-8">
              {banhotosaLoading ? (
                <LoadingSkeleton />
              ) : banhotosaStories && banhotosaStories.length > 0 ? (
                banhotosaStories.map((story) => (
                  <StoryCard key={story.id} story={story} />
                ))
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">
                      Nenhum caso de sucesso disponível ainda para Banho & Tosa.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="clinica" className="space-y-8">
              {clinicaLoading ? (
                <LoadingSkeleton />
              ) : clinicaStories && clinicaStories.length > 0 ? (
                clinicaStories.map((story) => (
                  <StoryCard key={story.id} story={story} />
                ))
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">
                      Nenhum caso de sucesso disponível ainda para Clínicas.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10">
        <div className="container mx-auto max-w-4xl text-center space-y-8">
          <h2 className="text-4xl lg:text-5xl font-black">
            Pronto para Escrever Sua{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              História de Sucesso?
            </span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Junte-se a milhares de negócios que já transformaram sua gestão
          </p>
          <Link to="/pricing">
            <Button size="lg" className="gap-2 text-lg px-8 py-6">
              Começar Agora
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default SuccessStories;
