import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { 
  Image, RefreshCw, Download, CheckCircle2, XCircle, 
  Loader2, Sparkles, AlertTriangle, Upload 
} from "lucide-react";
import { blogPosts } from "@/data/blogPosts";

interface BlogImageConfig {
  id: number;
  slug: string;
  title: string;
  prompt: string;
  currentImage: string;
}

const blogImageConfigs: BlogImageConfig[] = [
  {
    id: 1,
    slug: "como-aumentar-faturamento-clinica-veterinaria-2025",
    title: "Faturamento Clínica Veterinária",
    currentImage: blogPosts[0]?.image || "",
    prompt: "Hyperrealistic 8K professional photography. Modern Brazilian veterinary clinic reception with sleek glass desk displaying financial charts on large monitor screen. Young female veterinary clinic manager in professional white coat analyzing revenue data on tablet. Beautiful golden retriever sitting calmly in luxurious waiting area. Clean minimalist interior with premium finishes, indoor plants, natural warm lighting through large windows. Shot with Canon 5D Mark IV, 35mm f/1.4 lens. Magazine quality editorial photography. Ultra detailed textures. NO text, NO logos, NO watermarks."
  },
  {
    id: 2,
    slug: "tecnicas-modernas-grooming-pet-2025",
    title: "Técnicas de Grooming",
    currentImage: blogPosts[1]?.image || "",
    prompt: "Hyperrealistic 8K professional photography. Brazilian female groomer in teal uniform performing creative grooming on adorable fluffy white Poodle on professional grooming table. Modern grooming salon with chrome fixtures, professional equipment, LED ring lights. Groomer using professional clippers with concentrated expression. Dog looking calm and happy. Visible grooming tools: scissors, brushes, dryer. Soft studio lighting with warm tones. Shot with Sony A7R IV, 85mm f/1.2 portrait lens. Magazine commercial quality. Ultra detailed fur textures. NO text, NO logos, NO watermarks."
  },
  {
    id: 3,
    slug: "produtos-essenciais-pet-shop-2025",
    title: "Produtos Pet Shop",
    currentImage: blogPosts[2]?.image || "",
    prompt: "Hyperrealistic 8K commercial product photography. Modern premium pet shop interior with beautifully organized wooden shelves displaying colorful premium pet products: gourmet pet food bags, elegant pet accessories, premium toys, health supplements. Focus on product display with artistic arrangement. Warm ambient lighting highlighting product packaging. Clean minimalist aesthetic with natural wood and white elements. Shallow depth of field. Shot with Phase One medium format, 80mm lens. Luxury retail catalog style. Ultra detailed product textures. NO text on products, NO logos, NO watermarks."
  },
  {
    id: 4,
    slug: "comportamento-felino-gatos-entenda-seu-pet",
    title: "Comportamento Felino",
    currentImage: blogPosts[3]?.image || "",
    prompt: "Hyperrealistic 8K lifestyle photography. Beautiful orange tabby cat in artistic pose on modern Scandinavian design cat tree, making slow blink expression at camera. Elegant living room with large window letting in golden hour sunlight. Cat showing relaxed body language with tail curled. Visible enrichment elements: scratching posts, cat toys. Warm cozy atmosphere with soft bokeh background. Shot with Canon 5D Mark IV, 85mm f/1.2 portrait lens. National Geographic wildlife quality. Ultra detailed fur and eye textures. NO text, NO logos, NO watermarks."
  },
  {
    id: 5,
    slug: "prontuario-eletronico-clinica-veterinaria",
    title: "Prontuário Eletrônico",
    currentImage: blogPosts[4]?.image || "",
    prompt: "Hyperrealistic 8K professional photography. Young Brazilian female veterinarian in white coat using modern tablet computer displaying pet medical records interface. Veterinary examination room with stainless steel table, medical equipment in background. Cute beagle puppy sitting on examination table looking at vet. Clean bright clinical environment with professional lighting. Focus on technology integration in veterinary practice. Shot with Sony A7R IV, 50mm f/1.4 lens. Healthcare technology editorial style. Ultra detailed. NO text on screens, NO logos, NO watermarks."
  },
  {
    id: 6,
    slug: "marketing-digital-veterinarios-guia-completo",
    title: "Marketing Digital Veterinário",
    currentImage: blogPosts[5]?.image || "",
    prompt: "Hyperrealistic 8K creative photography. Marketing professional working on laptop showing social media analytics dashboard for veterinary clinic. Modern co-working space with whiteboard showing marketing strategy diagrams in background. Smartphone displaying Instagram-style pet photos. Coffee cup and plants on desk. Young Brazilian professional in casual business attire smiling. Soft natural lighting from large windows. Shot with Canon 5D Mark IV, 35mm f/1.8 lens. Tech startup editorial style. Ultra detailed textures. NO readable text, NO logos, NO watermarks."
  },
  {
    id: 7,
    slug: "gestao-estoque-pet-shop-guia-completo",
    title: "Gestão de Estoque Pet Shop",
    currentImage: blogPosts[6]?.image || "",
    prompt: "Hyperrealistic 8K commercial photography. Modern pet shop inventory management scene. Young Brazilian male employee using handheld scanner checking organized shelves of premium pet products. Clean warehouse-style storage area with labeled sections. Tablet showing inventory management system interface. Professional lighting highlighting organized products. Efficient business operation aesthetic. Shot with Sony A7R IV, 35mm f/1.4 lens. Business operations editorial style. Ultra detailed product packaging textures. NO readable text, NO logos, NO watermarks."
  },
  {
    id: 8,
    slug: "fidelizacao-clientes-veterinaria-guia",
    title: "Fidelização de Clientes",
    currentImage: blogPosts[7]?.image || "",
    prompt: "Hyperrealistic 8K lifestyle photography. Happy Brazilian family at veterinary clinic reception receiving loyalty rewards card. Mother, father, and young daughter (8 years) with their adorable Labrador puppy. Friendly female receptionist in professional uniform handing over membership card with warm smile. Modern clinic interior with loyalty program banner visible. Everyone showing genuine happiness. Warm welcoming atmosphere. Shot with Canon 5D Mark IV, 50mm f/1.4 lens. Lifestyle commercial photography. Ultra detailed facial expressions and textures. NO readable text, NO logos, NO watermarks."
  },
  {
    id: 9,
    slug: "inteligencia-artificial-medicina-veterinaria",
    title: "IA na Medicina Veterinária",
    currentImage: blogPosts[8]?.image || "",
    prompt: "Hyperrealistic 8K futuristic photography. Brazilian veterinarian analyzing AI-assisted diagnostic display on large curved monitor showing X-ray with highlighted areas. Modern high-tech veterinary lab with holographic-style interface elements. Cute cat patient on examination table with sensors. Blue and cyan accent lighting creating tech atmosphere. Clean futuristic medical environment. Shot with Sony A7R IV, 24mm f/1.4 lens. Sci-fi medical editorial style. Ultra detailed technology and medical equipment. NO readable text, NO logos, NO watermarks."
  }
];

export default function RegenerateBlogImages() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentImage, setCurrentImage] = useState<string>("");
  const [generatedImages, setGeneratedImages] = useState<Record<number, string>>({});
  const [results, setResults] = useState<{ success: string[]; failed: string[] }>({
    success: [],
    failed: []
  });
  const [replacingImage, setReplacingImage] = useState<number | null>(null);

  const downloadImage = (base64Url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = base64Url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReplaceBlogImage = async (config: BlogImageConfig, base64Url: string) => {
    setReplacingImage(config.id);
    
    try {
      // Convert base64 to blob
      const base64Data = base64Url.split(',')[1];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/jpeg' });

      const filename = `${config.slug}.jpg`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('blog-images')
        .upload(filename, blob, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('blog-images')
        .getPublicUrl(filename);

      toast.success(`Imagem substituída! URL: ${urlData.publicUrl}`);

    } catch (error) {
      console.error('Erro ao substituir imagem do blog:', error);
      toast.error(`Falha ao enviar imagem para o storage`);
    } finally {
      setReplacingImage(null);
    }
  };

  const generateSingleImage = async (config: BlogImageConfig): Promise<string | null> => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-image', {
        body: { prompt: config.prompt }
      });

      if (error) throw error;
      if (!data?.imageUrl) throw new Error('Nenhuma imagem retornada');

      return data.imageUrl;
    } catch (error) {
      console.error(`Erro ao gerar imagem para ${config.title}:`, error);
      return null;
    }
  };

  const handleGenerateSingle = async (config: BlogImageConfig) => {
    setCurrentImage(config.title);
    toast.info(`Gerando imagem: ${config.title}...`);

    const imageUrl = await generateSingleImage(config);

    if (imageUrl) {
      setGeneratedImages(prev => ({ ...prev, [config.id]: imageUrl }));
      toast.success(`Imagem gerada: ${config.title}`);
    } else {
      toast.error(`Falha ao gerar: ${config.title}`);
    }
    setCurrentImage("");
  };

  const handleRegenerateAll = async () => {
    setIsGenerating(true);
    setProgress(0);
    setResults({ success: [], failed: [] });
    setGeneratedImages({});

    const totalImages = blogImageConfigs.length;
    const successList: string[] = [];
    const failedList: string[] = [];

    for (let i = 0; i < totalImages; i++) {
      const config = blogImageConfigs[i];
      setCurrentImage(config.title);
      setProgress(((i) / totalImages) * 100);

      toast.info(`Gerando (${i + 1}/${totalImages}): ${config.title}`);

      const imageUrl = await generateSingleImage(config);

      if (imageUrl) {
        setGeneratedImages(prev => ({ ...prev, [config.id]: imageUrl }));
        successList.push(config.title);
      } else {
        failedList.push(config.title);
      }

      // Delay entre gerações para evitar rate limiting
      if (i < totalImages - 1) {
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }

    setProgress(100);
    setCurrentImage("");
    setIsGenerating(false);
    setResults({ success: successList, failed: failedList });

    if (failedList.length === 0) {
      toast.success(`Todas as ${totalImages} imagens foram geradas com sucesso!`);
    } else {
      toast.warning(`${successList.length} imagens geradas, ${failedList.length} falharam`);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <Sparkles className="h-8 w-8 text-primary" />
          Regenerar Imagens do Blog
        </h1>
        <p className="text-muted-foreground mt-2">
          Gere imagens ultra-realistas com IA para cada post do blog
        </p>
      </div>

      <Alert className="border-primary/20 bg-primary/5">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          As imagens serão geradas usando IA com qualidade 8K fotorealista. 
          Cada geração pode levar alguns segundos. Após gerar, faça download e atualize manualmente 
          as URLs em <code className="text-xs bg-muted px-1 py-0.5 rounded">src/data/blogPosts.ts</code>
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="h-5 w-5" />
            Gerar Todas as Imagens
          </CardTitle>
          <CardDescription>
            Clique para gerar imagens ultra-realistas para os {blogImageConfigs.length} posts do blog
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleRegenerateAll}
            disabled={isGenerating}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Gerando... {Math.round(progress)}%
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-5 w-5" />
                Gerar Todas as Imagens ({blogImageConfigs.length})
              </>
            )}
          </Button>

          {isGenerating && (
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-muted-foreground text-center">
                Processando: {currentImage}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {blogImageConfigs.map((config) => {
          const generated = generatedImages[config.id];
          const isSuccess = results.success.includes(config.title);
          const isFailed = results.failed.includes(config.title);

          return (
            <Card key={config.id} className="overflow-hidden">
              <div className="aspect-video bg-muted relative">
                {generated ? (
                  <img
                    src={generated}
                    alt={config.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Image className="h-12 w-12 text-muted-foreground/30" />
                  </div>
                )}
                
                {isSuccess && (
                  <Badge className="absolute top-2 right-2 bg-green-500">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Gerada
                  </Badge>
                )}
                {isFailed && (
                  <Badge variant="destructive" className="absolute top-2 right-2">
                    <XCircle className="h-3 w-3 mr-1" />
                    Falhou
                  </Badge>
                )}
                {currentImage === config.title && (
                  <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                )}
              </div>
              
              <CardContent className="p-4 space-y-3">
                <div>
                  <h3 className="font-semibold text-sm">{config.title}</h3>
                  <p className="text-xs text-muted-foreground truncate">
                    {config.slug}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleGenerateSingle(config)}
                    disabled={isGenerating || currentImage === config.title}
                  >
                    {currentImage === config.title ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Gerar
                      </>
                    )}
                  </Button>
                  
                  {generated && (
                    <>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => downloadImage(generated, `blog-${config.slug}.png`)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleReplaceBlogImage(config, generated)}
                        disabled={replacingImage === config.id}
                        className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                      >
                        {replacingImage === config.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Upload className="h-4 w-4" />
                        )}
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {(results.success.length > 0 || results.failed.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>Resumo da Geração</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {results.success.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-green-600 mb-2 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Sucesso ({results.success.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {results.success.map((title) => (
                    <Badge key={title} variant="secondary" className="bg-green-100 text-green-800">
                      {title}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {results.failed.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-red-600 mb-2 flex items-center gap-2">
                  <XCircle className="h-4 w-4" />
                  Falhas ({results.failed.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {results.failed.map((title) => (
                    <Badge key={title} variant="destructive">
                      {title}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
