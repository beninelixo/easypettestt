import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { updateSiteImage } from "@/hooks/useSiteImages";
import { useAuth } from "@/hooks/useAuth";
import { 
  Image, RefreshCw, Download, CheckCircle2, XCircle, 
  Loader2, Sparkles, AlertTriangle, Upload, Globe 
} from "lucide-react";
import { blogPosts } from "@/data/blogPosts";

interface BlogImageConfig {
  id: number;
  slug: string;
  title: string;
  prompt: string;
  currentImage: string;
}

// Ultra-realistic 8K professional prompts for blog images
const blogImageConfigs: BlogImageConfig[] = [
  {
    id: 1,
    slug: "como-aumentar-faturamento-clinica-veterinaria-2025",
    title: "Faturamento Clínica Veterinária",
    currentImage: blogPosts[0]?.image || "",
    prompt: `[PHOTOREALISM MASTERCLASS - 8K ULTRA HD]

📸 CAMERA: Sony A7R V with Zeiss 35mm f/1.4 | 61MP Full Frame | ISO 100
💡 LIGHTING: Natural golden hour + professional LED fill | 15+ stops HDR

SCENE: Modern Brazilian veterinary clinic reception with sleek glass desk displaying financial growth charts on large curved monitor. Young female veterinary clinic manager (late 20s, professional white coat) analyzing revenue data on tablet with confident smile. Beautiful golden retriever sitting calmly in luxurious waiting area with designer pet furniture. Clean minimalist interior with premium finishes, large Monstera plants, warm Brazilian sunlight through floor-to-ceiling windows.

TECHNICAL: f/2.8 aperture, shallow DOF, tack-sharp focus on subject's eyes. Magazine editorial color grading with warm skin tones. Individual hair strands visible, fabric texture discernible.

🚫 NO text, NO logos, NO watermarks, NO CGI artifacts`
  },
  {
    id: 2,
    slug: "tecnicas-modernas-grooming-pet-2025",
    title: "Técnicas de Grooming",
    currentImage: blogPosts[1]?.image || "",
    prompt: `[PHOTOREALISM MASTERCLASS - 8K ULTRA HD]

📸 CAMERA: Canon EOS R5 with RF 85mm f/1.2L | 45MP | ISO 200
💡 LIGHTING: Professional studio ring lights + natural daylight | Soft diffused shadows

SCENE: Brazilian female groomer (mid-20s, genuine concentrated expression) in premium teal uniform performing creative artistic grooming on adorable fluffy white Toy Poodle on professional hydraulic grooming table. Modern upscale grooming salon with chrome fixtures, LED ring lights, professional grooming tools organized on magnetic strip. Dog calm and happy with tongue out. Visible professional equipment: Japanese scissors, premium clippers, slicker brushes.

TECHNICAL: f/1.8 portrait depth, ultra-detailed fur texture with individual strands, catchlights in both human and dog eyes. Commercial photography color grading.

🚫 NO text, NO logos, NO watermarks, NO artificial look`
  },
  {
    id: 3,
    slug: "produtos-essenciais-pet-shop-2025",
    title: "Produtos Pet Shop",
    currentImage: blogPosts[2]?.image || "",
    prompt: `[PHOTOREALISM MASTERCLASS - 8K ULTRA HD]

📸 CAMERA: Phase One IQ4 150MP with Schneider 80mm | Medium Format | ISO 50
💡 LIGHTING: Professional product photography setup | Multiple softboxes | Color-accurate 5500K

SCENE: Modern premium Brazilian pet shop interior with beautifully organized natural wood shelving displaying colorful premium pet products in artistic arrangement. Gourmet pet food bags, elegant ceramic bowls, premium toys, organic health supplements, designer collars and leashes. Warm ambient spotlighting highlighting product packaging. Clean minimalist aesthetic with white walls, natural wood elements, small indoor plants.

TECHNICAL: f/8 for maximum sharpness, focus stacking for edge-to-edge clarity. Luxury retail catalog style with vibrant but natural colors. Ultra-detailed product textures visible.

🚫 NO readable text on products, NO logos, NO watermarks`
  },
  {
    id: 4,
    slug: "comportamento-felino-gatos-entenda-seu-pet",
    title: "Comportamento Felino",
    currentImage: blogPosts[3]?.image || "",
    prompt: `[PHOTOREALISM MASTERCLASS - 8K ULTRA HD]

📸 CAMERA: Nikon Z9 with NIKKOR Z 85mm f/1.2 S | 45.7MP | ISO 400
💡 LIGHTING: Natural golden hour sunlight through large window | Warm ambient fill

SCENE: Beautiful orange tabby cat in artistic relaxed pose on modern Scandinavian design cat tree, making slow blink expression directly at camera showing trust and contentment. Elegant contemporary living room with large window letting in soft golden hour sunlight creating warm glow. Cat showing relaxed body language with tail curled around paws. Visible enrichment: sisal scratching posts, feather toys.

TECHNICAL: f/1.4 ultra-shallow DOF with creamy bokeh, critical focus on cat's eyes. National Geographic wildlife photography quality. Ultra-detailed fur texture with individual whiskers visible.

🚫 NO text, NO logos, NO watermarks, NO artificial lighting`
  },
  {
    id: 5,
    slug: "prontuario-eletronico-clinica-veterinaria",
    title: "Prontuário Eletrônico",
    currentImage: blogPosts[4]?.image || "",
    prompt: `[PHOTOREALISM MASTERCLASS - 8K ULTRA HD]

📸 CAMERA: Sony A1 with GM 50mm f/1.4 | 50.1MP | ISO 100
💡 LIGHTING: Clean clinical LED panels + tablet screen glow | 5000K color temperature

SCENE: Young Brazilian female veterinarian (late 20s, caring expression) in pristine white coat using modern tablet displaying clean pet medical records interface. Modern veterinary examination room with stainless steel table, medical equipment in soft-focus background. Adorable beagle puppy sitting on examination table looking up at vet with trusting eyes. Clean bright clinical environment with professional appearance.

TECHNICAL: f/2.0 environmental portrait depth, focus on vet's hands and tablet. Healthcare technology editorial style. Natural skin tones, professional trustworthy appearance.

🚫 NO readable text on screens, NO logos, NO watermarks`
  },
  {
    id: 6,
    slug: "marketing-digital-veterinarios-guia-completo",
    title: "Marketing Digital Veterinário",
    currentImage: blogPosts[5]?.image || "",
    prompt: `[PHOTOREALISM MASTERCLASS - 8K ULTRA HD]

📸 CAMERA: Canon EOS R5 with RF 35mm f/1.8 | 45MP | ISO 200
💡 LIGHTING: Large window natural light + monitor glow | Modern office ambient

SCENE: Young Brazilian marketing professional (late 20s, confident smile) working on MacBook Pro showing social media analytics dashboard for veterinary clinic. Modern co-working space with whiteboard showing marketing strategy mind-map in soft focus background. Smartphone on desk displaying Instagram-style pet photos. Coffee cup, small succulent plant on clean minimalist desk. Casual business attire (light blazer).

TECHNICAL: f/2.8 environmental portrait, warm lifestyle photography color grading. Tech startup editorial style. Genuine confident expression.

🚫 NO readable text on screens, NO logos, NO watermarks`
  },
  {
    id: 7,
    slug: "gestao-estoque-pet-shop-guia-completo",
    title: "Gestão de Estoque Pet Shop",
    currentImage: blogPosts[6]?.image || "",
    prompt: `[PHOTOREALISM MASTERCLASS - 8K ULTRA HD]

📸 CAMERA: Sony A7R IV with 35mm f/1.4 | 61MP | ISO 400
💡 LIGHTING: Warehouse LED lighting + natural light from windows | Even illumination

SCENE: Young Brazilian male employee (mid-20s, focused professional expression) using handheld barcode scanner checking organized shelves of premium pet products in modern warehouse-style storage area. Tablet on nearby cart showing inventory management dashboard. Clean organized shelving with labeled sections, colorful premium pet food bags, accessories neatly arranged. Professional operations aesthetic.

TECHNICAL: f/2.8 environmental depth, business operations editorial style. Focus on employee and scanner. Ultra-detailed product packaging textures.

🚫 NO readable text, NO logos, NO watermarks`
  },
  {
    id: 8,
    slug: "fidelizacao-clientes-veterinaria-guia",
    title: "Fidelização de Clientes",
    currentImage: blogPosts[7]?.image || "",
    prompt: `[PHOTOREALISM MASTERCLASS - 8K ULTRA HD]

📸 CAMERA: Nikon Z9 with 50mm f/1.2 | 45.7MP | ISO 200
💡 LIGHTING: Warm welcoming ambient + large window natural light | Soft shadows

SCENE: Happy diverse Brazilian family at modern veterinary clinic reception. Mother (30s), father (30s), young daughter (8 years, excited expression) with their adorable yellow Labrador puppy receiving loyalty rewards card from friendly female receptionist in professional uniform. Modern clinic interior with comfortable seating, plants. Everyone showing genuine happiness and warm connection.

TECHNICAL: f/1.8 group portrait depth, lifestyle commercial photography style. Genuine warm expressions with crinkled-eye smiles. Ultra-detailed facial features and textures.

🚫 NO readable text, NO logos, NO watermarks`
  },
  {
    id: 9,
    slug: "inteligencia-artificial-medicina-veterinaria",
    title: "IA na Medicina Veterinária",
    currentImage: blogPosts[8]?.image || "",
    prompt: `[PHOTOREALISM MASTERCLASS - 8K ULTRA HD]

📸 CAMERA: Sony A1 with 24mm f/1.4 GM | 50.1MP | ISO 100
💡 LIGHTING: Blue-cyan tech accent lights + clinical white ambient | Futuristic atmosphere

SCENE: Brazilian veterinarian (early 30s, analytical expression) analyzing AI-assisted diagnostic display on large curved ultrawide monitor showing X-ray with highlighted diagnostic areas. Modern high-tech veterinary diagnostic lab with sleek equipment. Calm grey cat patient on examination table with non-invasive monitoring sensors. Blue and cyan accent lighting creating sophisticated tech atmosphere. Clean futuristic medical environment.

TECHNICAL: f/2.0 environmental depth, sci-fi medical editorial style. Focus on vet and monitor. Ultra-detailed technology and equipment textures.

🚫 NO readable text on screens, NO logos, NO watermarks`
  }
];

export default function RegenerateBlogImages() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentImage, setCurrentImage] = useState<string>("");
  const [generatedImages, setGeneratedImages] = useState<Record<number, string>>({});
  const [appliedImages, setAppliedImages] = useState<Record<number, boolean>>({});
  const [results, setResults] = useState<{ success: string[]; failed: string[] }>({
    success: [],
    failed: []
  });
  const [replacingImage, setReplacingImage] = useState<number | null>(null);
  const { user } = useAuth();

  const downloadImage = (base64Url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = base64Url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleApplyToBlog = async (config: BlogImageConfig, base64Url: string) => {
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

      const filename = `blog-${config.slug}.jpg`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('blog-images')
        .upload(filename, blob, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('blog-images')
        .getPublicUrl(filename);

      // Update site_images table with blog category
      await updateSiteImage(`blog-${config.slug}`, urlData.publicUrl, user?.id);

      setAppliedImages(prev => ({ ...prev, [config.id]: true }));

      toast.success(`Imagem aplicada no blog! URL: ${urlData.publicUrl}`);

    } catch (error) {
      console.error('Erro ao aplicar imagem do blog:', error);
      toast.error(`Falha ao aplicar imagem no blog`);
    } finally {
      setReplacingImage(null);
    }
  };

  const handleApplyAllToBlog = async () => {
    const imagesToApply = Object.entries(generatedImages);
    if (imagesToApply.length === 0) {
      toast.error("Gere as imagens primeiro antes de aplicar");
      return;
    }

    for (const [idStr, base64Url] of imagesToApply) {
      const id = parseInt(idStr);
      const config = blogImageConfigs.find(c => c.id === id);
      if (config && !appliedImages[id]) {
        await handleApplyToBlog(config, base64Url);
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    toast.success("Todas as imagens foram aplicadas no blog!");
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
    toast.info(`Gerando imagem 8K: ${config.title}...`);

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
    setAppliedImages({});

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

  const allGenerated = Object.keys(generatedImages).length === blogImageConfigs.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <Sparkles className="h-8 w-8 text-primary" />
          Regenerar Imagens do Blog
        </h1>
        <p className="text-muted-foreground mt-2">
          Gere imagens ultra-realistas 8K com IA e aplique automaticamente nos posts do blog
        </p>
      </div>

      <Alert className="border-primary/20 bg-primary/5">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Qualidade Profissional 8K:</strong> Todas as imagens são geradas com especificações de câmera profissional 
          (Sony A7R V, Canon EOS R5, Phase One), HDR 15+ stops, e pós-produção editorial. 
          Clique em <strong>"Aplicar no Blog"</strong> para substituir automaticamente.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="h-5 w-5" />
            Gerar Todas as Imagens
          </CardTitle>
          <CardDescription>
            Clique para gerar imagens ultra-realistas 8K para os {blogImageConfigs.length} posts do blog
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Button
              onClick={handleRegenerateAll}
              disabled={isGenerating}
              className="flex-1"
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
                  Gerar Todas ({blogImageConfigs.length})
                </>
              )}
            </Button>

            {allGenerated && (
              <Button
                onClick={handleApplyAllToBlog}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                size="lg"
              >
                <Globe className="mr-2 h-5 w-5" />
                Aplicar Todas no Blog
              </Button>
            )}
          </div>

          {isGenerating && (
            <div className="space-y-2">
              <Progress value={progress} className="h-3" />
              <p className="text-sm text-muted-foreground text-center">
                Processando: {currentImage} (Qualidade 8K Ultra HD)
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {blogImageConfigs.map((config) => {
          const generated = generatedImages[config.id];
          const applied = appliedImages[config.id];
          const isSuccess = results.success.includes(config.title);
          const isFailed = results.failed.includes(config.title);

          return (
            <Card 
              key={config.id} 
              className={`overflow-hidden transition-all duration-300 ${
                applied ? "border-green-500 bg-green-500/5" : generated ? "border-primary/50" : ""
              }`}
            >
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
                
                {applied && (
                  <Badge className="absolute top-2 right-2 bg-green-500">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Aplicado
                  </Badge>
                )}
                {isSuccess && !applied && (
                  <Badge className="absolute top-2 right-2 bg-primary">
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
                        onClick={() => handleApplyToBlog(config, generated)}
                        disabled={replacingImage === config.id || applied}
                        className={applied ? 'bg-green-500' : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'}
                      >
                        {replacingImage === config.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : applied ? (
                          <CheckCircle2 className="h-4 w-4" />
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
            <CardTitle className="flex items-center gap-2">
              Resumo da Geração
              {Object.keys(appliedImages).length > 0 && (
                <Badge variant="secondary">
                  {Object.keys(appliedImages).length} aplicadas no blog
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {results.success.length > 0 && (
              <div className="p-4 bg-green-500/10 rounded-lg">
                <h3 className="font-semibold text-green-600 mb-2 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  Sucesso ({results.success.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {results.success.map(name => (
                    <Badge key={name} variant="outline" className="text-green-600">
                      {name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {results.failed.length > 0 && (
              <div className="p-4 bg-destructive/10 rounded-lg">
                <h3 className="font-semibold text-destructive mb-2 flex items-center gap-2">
                  <XCircle className="h-5 w-5" />
                  Falhas ({results.failed.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {results.failed.map(name => (
                    <Badge key={name} variant="outline" className="text-destructive">
                      {name}
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
