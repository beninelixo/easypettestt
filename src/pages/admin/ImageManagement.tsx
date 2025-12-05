import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { toast as sonnerToast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { updateSiteImage, useInvalidateBlogImages } from "@/hooks/useSiteImages";
import { useAuth } from "@/hooks/useAuth";
import { images, generateImage } from "@/scripts/regenerate-images";
import { blogPosts } from "@/data/blogPosts";
import { 
  Image, RefreshCw, Download, CheckCircle2, XCircle, 
  Loader2, Sparkles, AlertTriangle, Upload, Globe,
  FileImage, Database, HardDrive
} from "lucide-react";

// Blog image configurations
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
    prompt: `[PHOTOREALISM MASTERCLASS - 8K ULTRA HD] Modern Brazilian veterinary clinic reception with financial growth charts. Young female vet manager analyzing revenue data on tablet. Golden retriever in waiting area. Clean minimalist interior. 🚫 NO text, NO logos, NO watermarks`
  },
  {
    id: 2,
    slug: "tecnicas-modernas-grooming-pet-2025",
    title: "Técnicas de Grooming",
    currentImage: blogPosts[1]?.image || "",
    prompt: `[PHOTOREALISM MASTERCLASS - 8K ULTRA HD] Brazilian female groomer performing artistic grooming on white Toy Poodle. Modern upscale salon with professional equipment. 🚫 NO text, NO logos, NO watermarks`
  },
  {
    id: 3,
    slug: "produtos-essenciais-pet-shop-2025",
    title: "Produtos Pet Shop",
    currentImage: blogPosts[2]?.image || "",
    prompt: `[PHOTOREALISM MASTERCLASS - 8K ULTRA HD] Premium Brazilian pet shop with organized natural wood shelving, colorful products. Clean minimalist aesthetic. 🚫 NO readable text, NO logos, NO watermarks`
  },
  {
    id: 4,
    slug: "comportamento-felino-gatos-entenda-seu-pet",
    title: "Comportamento Felino",
    currentImage: blogPosts[3]?.image || "",
    prompt: `[PHOTOREALISM MASTERCLASS - 8K ULTRA HD] Orange tabby cat in relaxed pose on modern cat tree, golden hour sunlight. National Geographic quality. 🚫 NO text, NO logos, NO watermarks`
  },
  {
    id: 5,
    slug: "prontuario-eletronico-clinica-veterinaria",
    title: "Prontuário Eletrônico",
    currentImage: blogPosts[4]?.image || "",
    prompt: `[PHOTOREALISM MASTERCLASS - 8K ULTRA HD] Young Brazilian female vet using tablet with medical records interface. Beagle puppy on examination table. 🚫 NO readable text, NO logos, NO watermarks`
  },
  {
    id: 6,
    slug: "marketing-digital-veterinarios-guia-completo",
    title: "Marketing Digital Veterinário",
    currentImage: blogPosts[5]?.image || "",
    prompt: `[PHOTOREALISM MASTERCLASS - 8K ULTRA HD] Young Brazilian marketing professional working on MacBook with social media analytics. Modern co-working space. 🚫 NO readable text, NO logos, NO watermarks`
  },
  {
    id: 7,
    slug: "gestao-estoque-pet-shop-guia-completo",
    title: "Gestão de Estoque Pet Shop",
    currentImage: blogPosts[6]?.image || "",
    prompt: `[PHOTOREALISM MASTERCLASS - 8K ULTRA HD] Brazilian male employee using barcode scanner in modern warehouse-style pet storage. Organized shelving. 🚫 NO readable text, NO logos, NO watermarks`
  },
  {
    id: 8,
    slug: "fidelizacao-clientes-veterinaria-guia",
    title: "Fidelização de Clientes",
    currentImage: blogPosts[7]?.image || "",
    prompt: `[PHOTOREALISM MASTERCLASS - 8K ULTRA HD] Happy diverse Brazilian family at vet clinic with yellow Labrador puppy receiving loyalty card. Warm connection. 🚫 NO readable text, NO logos, NO watermarks`
  },
  {
    id: 9,
    slug: "inteligencia-artificial-medicina-veterinaria",
    title: "IA na Medicina Veterinária",
    currentImage: blogPosts[8]?.image || "",
    prompt: `[PHOTOREALISM MASTERCLASS - 8K ULTRA HD] Brazilian vet analyzing AI diagnostic display. Grey cat with monitoring sensors. Blue-cyan tech accent lighting. 🚫 NO readable text, NO logos, NO watermarks`
  }
];

// Storage bucket info
interface BucketInfo {
  name: string;
  public: boolean;
  fileCount?: number;
}

export default function ImageManagement() {
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'site';
  
  // Site images state
  const [isGeneratingSite, setIsGeneratingSite] = useState(false);
  const [progressSite, setProgressSite] = useState(0);
  const [currentImageSite, setCurrentImageSite] = useState<string>("");
  const [generatedSiteImages, setGeneratedSiteImages] = useState<Record<string, string>>({});
  const [appliedSiteImages, setAppliedSiteImages] = useState<Record<string, boolean>>({});
  const [resultsSite, setResultsSite] = useState<{ success: string[]; failed: string[] }>({ success: [], failed: [] });
  const [replacingImageSite, setReplacingImageSite] = useState<string | null>(null);
  const [uploadingSite, setUploadingSite] = useState<string | null>(null);
  
  // Blog images state
  const [isGeneratingBlog, setIsGeneratingBlog] = useState(false);
  const [progressBlog, setProgressBlog] = useState(0);
  const [currentImageBlog, setCurrentImageBlog] = useState<string>("");
  const [generatedBlogImages, setGeneratedBlogImages] = useState<Record<number, string>>({});
  const [appliedBlogImages, setAppliedBlogImages] = useState<Record<number, boolean>>({});
  const [resultsBlog, setResultsBlog] = useState<{ success: string[]; failed: string[] }>({ success: [], failed: [] });
  const [replacingImageBlog, setReplacingImageBlog] = useState<number | null>(null);
  const [uploadingBlog, setUploadingBlog] = useState<number | null>(null);
  
  // Storage state
  const [buckets, setBuckets] = useState<BucketInfo[]>([]);
  const [loadingBuckets, setLoadingBuckets] = useState(false);
  
  const { toast } = useToast();
  const { user } = useAuth();
  const invalidateBlogImages = useInvalidateBlogImages();

  useEffect(() => {
    loadBuckets();
  }, []);

  const loadBuckets = async () => {
    setLoadingBuckets(true);
    try {
      const { data, error } = await supabase.storage.listBuckets();
      if (error) throw error;
      setBuckets(data?.map(b => ({ name: b.name, public: b.public || false })) || []);
    } catch (error) {
      console.error('Error loading buckets:', error);
    } finally {
      setLoadingBuckets(false);
    }
  };

  // Site image functions
  const downloadImage = (base64Url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = base64Url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleApplyToSite = async (filename: string, key: string, base64Url: string) => {
    setReplacingImageSite(filename);
    try {
      const base64Data = base64Url.split(',')[1];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/jpeg' });

      const { error: uploadError } = await supabase.storage
        .from('site-images')
        .upload(filename, blob, { cacheControl: '3600', upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('site-images').getPublicUrl(filename);
      await updateSiteImage(key, urlData.publicUrl, user?.id);

      // Invalida o cache para atualização imediata em todo o site
      invalidateBlogImages();

      setAppliedSiteImages(prev => ({ ...prev, [filename]: true }));
      toast({ title: "✅ Aplicado no Site!", description: `${filename} foi aplicada com sucesso.` });
    } catch (error) {
      console.error('Erro ao aplicar imagem:', error);
      toast({ title: "❌ Erro ao aplicar", description: `Falha ao aplicar ${filename}`, variant: "destructive" });
    } finally {
      setReplacingImageSite(null);
    }
  };

  // Manual upload for site images
  const handleManualUploadSite = async (config: typeof images[0], file: File) => {
    setUploadingSite(config.filename);
    try {
      const { error: uploadError } = await supabase.storage
        .from('site-images')
        .upload(config.filename, file, { cacheControl: '3600', upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('site-images').getPublicUrl(config.filename);
      await updateSiteImage(config.key, urlData.publicUrl, user?.id);

      // Invalida o cache para atualização imediata em todo o site
      invalidateBlogImages();

      setAppliedSiteImages(prev => ({ ...prev, [config.filename]: true }));
      toast({ title: "✅ Upload realizado!", description: `${config.filename} foi aplicada com sucesso.` });
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      toast({ title: "❌ Erro no upload", description: `Falha ao enviar ${config.filename}`, variant: "destructive" });
    } finally {
      setUploadingSite(null);
    }
  };

  const handleRegenerateAllSite = async () => {
    setIsGeneratingSite(true);
    setProgressSite(0);
    setGeneratedSiteImages({});
    setAppliedSiteImages({});
    setResultsSite({ success: [], failed: [] });

    const newResults = { success: [] as string[], failed: [] as string[] };

    for (let i = 0; i < images.length; i++) {
      const config = images[i];
      setCurrentImageSite(config.filename);
      
      try {
        const imageUrl = await generateImage(config);
        setGeneratedSiteImages(prev => ({ ...prev, [config.filename]: imageUrl }));
        newResults.success.push(config.filename);
        toast({ title: "✅ Imagem gerada", description: `${config.filename} foi gerada com sucesso!` });
      } catch (error) {
        console.error(`❌ Erro ao gerar ${config.filename}:`, error);
        newResults.failed.push(config.filename);
        toast({ title: "❌ Erro ao gerar imagem", description: `Falha ao gerar ${config.filename}`, variant: "destructive" });
      }
      
      setProgressSite(((i + 1) / images.length) * 100);
      if (i < images.length - 1) await new Promise(resolve => setTimeout(resolve, 2000));
    }

    setResultsSite(newResults);
    setIsGeneratingSite(false);
    setCurrentImageSite("");
    toast({ title: "🎉 Processo concluído", description: `${newResults.success.length} imagens geradas, ${newResults.failed.length} falhas.` });
  };

  // Blog image functions
  const handleApplyToBlog = async (config: BlogImageConfig, base64Url: string) => {
    setReplacingImageBlog(config.id);
    try {
      const base64Data = base64Url.split(',')[1];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/jpeg' });

      const filename = `blog-${config.slug}.jpg`;

      const { error: uploadError } = await supabase.storage
        .from('blog-images')
        .upload(filename, blob, { cacheControl: '3600', upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('blog-images').getPublicUrl(filename);
      await updateSiteImage(`blog-${config.slug}`, urlData.publicUrl, user?.id);

      // Invalida o cache para atualização imediata nas páginas do blog
      invalidateBlogImages();

      setAppliedBlogImages(prev => ({ ...prev, [config.id]: true }));
      sonnerToast.success(`Imagem aplicada no blog! Páginas atualizadas.`);
    } catch (error) {
      console.error('Erro ao aplicar imagem do blog:', error);
      sonnerToast.error(`Falha ao aplicar imagem no blog`);
    } finally {
      setReplacingImageBlog(null);
    }
  };

  // Manual upload for blog images
  const handleManualUploadBlog = async (config: BlogImageConfig, file: File) => {
    setUploadingBlog(config.id);
    try {
      const filename = `blog-${config.slug}.jpg`;

      const { error: uploadError } = await supabase.storage
        .from('blog-images')
        .upload(filename, file, { cacheControl: '3600', upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('blog-images').getPublicUrl(filename);
      await updateSiteImage(`blog-${config.slug}`, urlData.publicUrl, user?.id);

      // Invalida o cache para atualização imediata nas páginas do blog
      invalidateBlogImages();

      setAppliedBlogImages(prev => ({ ...prev, [config.id]: true }));
      sonnerToast.success(`Upload realizado! Imagem aplicada no blog.`);
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      sonnerToast.error(`Falha ao enviar imagem`);
    } finally {
      setUploadingBlog(null);
    }
  };

  const generateSingleBlogImage = async (config: BlogImageConfig): Promise<string | null> => {
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

  const handleRegenerateAllBlog = async () => {
    setIsGeneratingBlog(true);
    setProgressBlog(0);
    setResultsBlog({ success: [], failed: [] });
    setGeneratedBlogImages({});
    setAppliedBlogImages({});

    const successList: string[] = [];
    const failedList: string[] = [];

    for (let i = 0; i < blogImageConfigs.length; i++) {
      const config = blogImageConfigs[i];
      setCurrentImageBlog(config.title);
      setProgressBlog(((i) / blogImageConfigs.length) * 100);

      sonnerToast.info(`Gerando (${i + 1}/${blogImageConfigs.length}): ${config.title}`);

      const imageUrl = await generateSingleBlogImage(config);

      if (imageUrl) {
        setGeneratedBlogImages(prev => ({ ...prev, [config.id]: imageUrl }));
        successList.push(config.title);
      } else {
        failedList.push(config.title);
      }

      if (i < blogImageConfigs.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }

    setProgressBlog(100);
    setCurrentImageBlog("");
    setIsGeneratingBlog(false);
    setResultsBlog({ success: successList, failed: failedList });

    if (failedList.length === 0) {
      sonnerToast.success(`Todas as ${blogImageConfigs.length} imagens foram geradas!`);
    } else {
      sonnerToast.warning(`${successList.length} geradas, ${failedList.length} falharam`);
    }
  };

  const allSiteGenerated = Object.keys(generatedSiteImages).length === images.length;
  const allBlogGenerated = Object.keys(generatedBlogImages).length === blogImageConfigs.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <Sparkles className="h-8 w-8 text-primary" />
          Gerenciamento de Imagens
        </h1>
        <p className="text-muted-foreground mt-2">
          Gere e gerencie imagens do site, blog e storage em um só lugar
        </p>
      </div>

      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="site" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Imagens do Site
          </TabsTrigger>
          <TabsTrigger value="blog" className="flex items-center gap-2">
            <FileImage className="h-4 w-4" />
            Imagens do Blog
          </TabsTrigger>
          <TabsTrigger value="storage" className="flex items-center gap-2">
            <HardDrive className="h-4 w-4" />
            Storage Buckets
          </TabsTrigger>
        </TabsList>

        {/* Site Images Tab */}
        <TabsContent value="site" className="space-y-6">
          <Alert className="border-primary/20 bg-primary/5">
            <Image className="h-4 w-4" />
            <AlertDescription>
              <strong>Prompts Ultra-Realistas:</strong> Imagens 8K com especificações profissionais. 
              Após gerar, clique em <strong>"Aplicar no Site"</strong> para substituir automaticamente.
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                Controle de Geração - Site
              </CardTitle>
              <CardDescription>
                Gere e aplique todas as imagens principais do sistema ({images.length} imagens)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <Button onClick={handleRegenerateAllSite} disabled={isGeneratingSite} className="flex-1" size="lg">
                  {isGeneratingSite ? (
                    <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Gerando {currentImageSite}...</>
                  ) : (
                    <><Sparkles className="mr-2 h-5 w-5" />Gerar Todas ({images.length})</>
                  )}
                </Button>

                {allSiteGenerated && (
                  <Button
                    onClick={async () => {
                      for (const [filename, base64Url] of Object.entries(generatedSiteImages)) {
                        const config = images.find(img => img.filename === filename);
                        if (config && !appliedSiteImages[filename]) {
                          await handleApplyToSite(filename, config.key, base64Url);
                          await new Promise(resolve => setTimeout(resolve, 500));
                        }
                      }
                    }}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                    size="lg"
                  >
                    <Globe className="mr-2 h-5 w-5" />
                    Aplicar Todas
                  </Button>
                )}
              </div>

              {isGeneratingSite && (
                <div className="space-y-2">
                  <Progress value={progressSite} className="w-full h-3" />
                  <p className="text-sm text-muted-foreground text-center">{Math.round(progressSite)}% completo</p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            {images.map((config) => (
              <Card key={config.filename} className={`transition-all duration-300 ${appliedSiteImages[config.filename] ? "border-green-500 bg-green-500/5" : generatedSiteImages[config.filename] ? "border-primary/50" : ""}`}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-lg">
                    <span className="flex items-center gap-2">
                      {appliedSiteImages[config.filename] ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : generatedSiteImages[config.filename] ? <CheckCircle2 className="h-5 w-5 text-primary" /> : <Image className="h-5 w-5 text-muted-foreground" />}
                      {config.filename}
                    </span>
                    {appliedSiteImages[config.filename] && <Badge className="bg-green-500">✅ Aplicado</Badge>}
                  </CardTitle>
                  <CardDescription>Key: {config.key}</CardDescription>
                </CardHeader>
                <CardContent>
                  {generatedSiteImages[config.filename] ? (
                    <div className="space-y-3">
                      <img src={generatedSiteImages[config.filename]} alt={config.filename} className="w-full rounded-lg border shadow-lg" />
                      <div className="flex gap-2">
                        <Button onClick={() => downloadImage(generatedSiteImages[config.filename], config.filename)} variant="outline" className="flex-1" size="sm">
                          <Download className="mr-2 h-4 w-4" />Baixar
                        </Button>
                        <Button
                          onClick={() => handleApplyToSite(config.filename, config.key, generatedSiteImages[config.filename])}
                          disabled={replacingImageSite === config.filename || appliedSiteImages[config.filename]}
                          className={`flex-1 ${appliedSiteImages[config.filename] ? 'bg-green-500' : 'bg-gradient-to-r from-green-500 to-emerald-600'}`}
                          size="sm"
                        >
                          {replacingImageSite === config.filename ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : appliedSiteImages[config.filename] ? <CheckCircle2 className="mr-2 h-4 w-4" /> : <Upload className="mr-2 h-4 w-4" />}
                          {appliedSiteImages[config.filename] ? 'Aplicado!' : 'Aplicar'}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="bg-muted/50 rounded-lg p-4">
                        <p className="text-xs text-muted-foreground line-clamp-3 font-mono">{config.prompt.substring(0, 150)}...</p>
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="file"
                          id={`upload-site-${config.filename}`}
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleManualUploadSite(config, file);
                            e.target.value = '';
                          }}
                        />
                        <Button
                          onClick={() => document.getElementById(`upload-site-${config.filename}`)?.click()}
                          disabled={uploadingSite === config.filename}
                          variant="outline"
                          className="flex-1"
                          size="sm"
                        >
                          {uploadingSite === config.filename ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Upload className="mr-2 h-4 w-4" />
                          )}
                          Upload Manual
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Blog Images Tab */}
        <TabsContent value="blog" className="space-y-6">
          <Alert className="border-primary/20 bg-primary/5">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Qualidade 8K:</strong> Imagens com especificações profissionais para os {blogImageConfigs.length} posts do blog. 
              Clique em <strong>"Aplicar no Blog"</strong> para substituir automaticamente.
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileImage className="h-5 w-5 text-primary" />
                Controle de Geração - Blog
              </CardTitle>
              <CardDescription>
                Gere imagens para os {blogImageConfigs.length} posts do blog
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <Button onClick={handleRegenerateAllBlog} disabled={isGeneratingBlog} className="flex-1" size="lg">
                  {isGeneratingBlog ? (
                    <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Gerando... {Math.round(progressBlog)}%</>
                  ) : (
                    <><RefreshCw className="mr-2 h-5 w-5" />Gerar Todas ({blogImageConfigs.length})</>
                  )}
                </Button>

                {allBlogGenerated && (
                  <Button
                    onClick={async () => {
                      for (const [idStr, base64Url] of Object.entries(generatedBlogImages)) {
                        const id = parseInt(idStr);
                        const config = blogImageConfigs.find(c => c.id === id);
                        if (config && !appliedBlogImages[id]) {
                          await handleApplyToBlog(config, base64Url);
                          await new Promise(resolve => setTimeout(resolve, 500));
                        }
                      }
                    }}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                    size="lg"
                  >
                    <Globe className="mr-2 h-5 w-5" />
                    Aplicar Todas no Blog
                  </Button>
                )}
              </div>

              {isGeneratingBlog && (
                <div className="space-y-2">
                  <Progress value={progressBlog} className="w-full h-3" />
                  <p className="text-sm text-muted-foreground text-center">{currentImageBlog} - {Math.round(progressBlog)}%</p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {blogImageConfigs.map((config) => (
              <Card key={config.id} className={`transition-all duration-300 ${appliedBlogImages[config.id] ? "border-green-500 bg-green-500/5" : generatedBlogImages[config.id] ? "border-primary/50" : ""}`}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-base">
                    <span className="flex items-center gap-2">
                      {appliedBlogImages[config.id] ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : generatedBlogImages[config.id] ? <CheckCircle2 className="h-4 w-4 text-primary" /> : <Image className="h-4 w-4 text-muted-foreground" />}
                      {config.title}
                    </span>
                    {appliedBlogImages[config.id] && <Badge className="bg-green-500 text-xs">✅</Badge>}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {generatedBlogImages[config.id] ? (
                    <div className="space-y-3">
                      <img src={generatedBlogImages[config.id]} alt={config.title} className="w-full rounded-lg border shadow-lg aspect-video object-cover" />
                      <div className="flex gap-2">
                        <Button onClick={() => downloadImage(generatedBlogImages[config.id], `blog-${config.slug}.jpg`)} variant="outline" className="flex-1" size="sm">
                          <Download className="mr-2 h-3 w-3" />Baixar
                        </Button>
                        <Button
                          onClick={() => handleApplyToBlog(config, generatedBlogImages[config.id])}
                          disabled={replacingImageBlog === config.id || appliedBlogImages[config.id]}
                          className={`flex-1 ${appliedBlogImages[config.id] ? 'bg-green-500' : 'bg-gradient-to-r from-green-500 to-emerald-600'}`}
                          size="sm"
                        >
                          {replacingImageBlog === config.id ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : <Upload className="mr-2 h-3 w-3" />}
                          {appliedBlogImages[config.id] ? '✅' : 'Aplicar'}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="bg-muted/50 rounded-lg p-3 aspect-video flex items-center justify-center">
                        <p className="text-xs text-muted-foreground text-center">Clique em "Gerar Todas" ou faça upload</p>
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="file"
                          id={`upload-blog-${config.id}`}
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleManualUploadBlog(config, file);
                            e.target.value = '';
                          }}
                        />
                        <Button
                          onClick={() => document.getElementById(`upload-blog-${config.id}`)?.click()}
                          disabled={uploadingBlog === config.id}
                          variant="outline"
                          className="flex-1"
                          size="sm"
                        >
                          {uploadingBlog === config.id ? (
                            <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                          ) : (
                            <Upload className="mr-2 h-3 w-3" />
                          )}
                          Upload Manual
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Storage Tab */}
        <TabsContent value="storage" className="space-y-6">
          <Alert className="border-primary/20 bg-primary/5">
            <Database className="h-4 w-4" />
            <AlertDescription>
              <strong>Storage Buckets:</strong> Visualize os buckets de armazenamento do Supabase Storage.
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HardDrive className="h-5 w-5 text-primary" />
                Buckets de Armazenamento
              </CardTitle>
              <CardDescription>
                Lista de buckets disponíveis no Supabase Storage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={loadBuckets} disabled={loadingBuckets} variant="outline" className="mb-4">
                {loadingBuckets ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                Atualizar
              </Button>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {buckets.map((bucket) => (
                  <Card key={bucket.name} className="border-muted">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Database className="h-4 w-4 text-primary" />
                        {bucket.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Badge variant={bucket.public ? "default" : "secondary"}>
                        {bucket.public ? "🔓 Público" : "🔒 Privado"}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
                {buckets.length === 0 && !loadingBuckets && (
                  <p className="text-muted-foreground col-span-full text-center py-8">Nenhum bucket encontrado</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
