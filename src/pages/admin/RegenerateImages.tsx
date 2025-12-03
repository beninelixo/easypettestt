import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Image, Loader2, Download, CheckCircle2, XCircle, Upload, Sparkles, Globe } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { images, generateImage } from "@/scripts/regenerate-images";
import { supabase } from "@/integrations/supabase/client";
import { updateSiteImage } from "@/hooks/useSiteImages";
import { useAuth } from "@/hooks/useAuth";

export default function RegenerateImages() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentImage, setCurrentImage] = useState<string>("");
  const [generatedImages, setGeneratedImages] = useState<Record<string, string>>({});
  const [appliedImages, setAppliedImages] = useState<Record<string, boolean>>({});
  const [results, setResults] = useState<{ success: string[]; failed: string[] }>({ success: [], failed: [] });
  const [replacingImage, setReplacingImage] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const downloadImage = (base64Url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = base64Url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleApplyToSite = async (filename: string, key: string, base64Url: string) => {
    setReplacingImage(filename);
    
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

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('site-images')
        .upload(filename, blob, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('site-images')
        .getPublicUrl(filename);

      // Update database with new URL
      await updateSiteImage(key, urlData.publicUrl, user?.id);

      setAppliedImages(prev => ({ ...prev, [filename]: true }));

      toast({
        title: "✅ Aplicado no Site!",
        description: `${filename} foi aplicada com sucesso. A imagem já está visível no site.`,
      });

    } catch (error) {
      console.error('Erro ao aplicar imagem:', error);
      toast({
        title: "❌ Erro ao aplicar",
        description: `Falha ao aplicar ${filename} no site`,
        variant: "destructive",
      });
    } finally {
      setReplacingImage(null);
    }
  };

  const handleApplyAllToSite = async () => {
    const imagesToApply = Object.entries(generatedImages);
    if (imagesToApply.length === 0) {
      toast({
        title: "⚠️ Nenhuma imagem gerada",
        description: "Gere as imagens primeiro antes de aplicar",
        variant: "destructive",
      });
      return;
    }

    for (const [filename, base64Url] of imagesToApply) {
      const config = images.find(img => img.filename === filename);
      if (config && !appliedImages[filename]) {
        await handleApplyToSite(filename, config.key, base64Url);
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    toast({
      title: "🎉 Todas as imagens aplicadas!",
      description: "O site foi atualizado com as novas imagens",
    });
  };

  const handleRegenerateAll = async () => {
    setIsGenerating(true);
    setProgress(0);
    setGeneratedImages({});
    setAppliedImages({});
    setResults({ success: [], failed: [] });

    const newResults = { success: [] as string[], failed: [] as string[] };

    for (let i = 0; i < images.length; i++) {
      const config = images[i];
      setCurrentImage(config.filename);
      
      try {
        const imageUrl = await generateImage(config);
        setGeneratedImages(prev => ({ ...prev, [config.filename]: imageUrl }));
        newResults.success.push(config.filename);
        
        toast({
          title: "✅ Imagem gerada",
          description: `${config.filename} foi gerada com sucesso!`,
        });
      } catch (error) {
        console.error(`❌ Erro ao gerar ${config.filename}:`, error);
        newResults.failed.push(config.filename);
        
        toast({
          title: "❌ Erro ao gerar imagem",
          description: `Falha ao gerar ${config.filename}`,
          variant: "destructive",
        });
      }
      
      setProgress(((i + 1) / images.length) * 100);
      
      if (i < images.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    setResults(newResults);
    setIsGenerating(false);
    setCurrentImage("");

    toast({
      title: "🎉 Processo concluído",
      description: `${newResults.success.length} imagens geradas, ${newResults.failed.length} falhas.`,
    });
  };

  const allGenerated = Object.keys(generatedImages).length === images.length;
  const someApplied = Object.keys(appliedImages).length > 0;

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent flex items-center gap-3">
          <Sparkles className="h-10 w-10 text-primary" />
          Regenerar Imagens do Site
        </h1>
        <p className="text-muted-foreground">
          Gere imagens ultra-realistas 8K com IA e aplique automaticamente no site
        </p>
      </div>

      <Alert className="mb-6 border-primary/20 bg-primary/5">
        <Image className="h-4 w-4" />
        <AlertDescription>
          <strong>Prompts Ultra-Realistas:</strong> As imagens são geradas com especificações de câmera profissional (Sony A7R V, Canon EOS R5), 
          resolução 8K, HDR 15+ stops, e pós-produção de nível editorial. Após gerar, clique em <strong>"Aplicar no Site"</strong> para 
          substituir automaticamente as imagens em todo o sistema.
        </AlertDescription>
      </Alert>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            Controle de Geração
          </CardTitle>
          <CardDescription>
            Gere e aplique todas as imagens principais do sistema de uma vez
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
                  Gerando {currentImage}...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Gerar Todas ({images.length} imagens)
                </>
              )}
            </Button>

            {allGenerated && (
              <Button
                onClick={handleApplyAllToSite}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                size="lg"
              >
                <Globe className="mr-2 h-5 w-5" />
                Aplicar Todas no Site
              </Button>
            )}
          </div>

          {isGenerating && (
            <div className="space-y-2">
              <Progress value={progress} className="w-full h-3" />
              <p className="text-sm text-muted-foreground text-center">
                {Math.round(progress)}% completo - Gerando com qualidade 8K Ultra HD
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lista de imagens para gerar */}
      <div className="grid gap-4 md:grid-cols-2">
        {images.map((config) => (
          <Card 
            key={config.filename} 
            className={`transition-all duration-300 ${
              appliedImages[config.filename] 
                ? "border-green-500 bg-green-500/5" 
                : generatedImages[config.filename] 
                  ? "border-primary/50" 
                  : ""
            }`}
          >
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-lg">
                <span className="flex items-center gap-2">
                  {appliedImages[config.filename] ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : generatedImages[config.filename] ? (
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  ) : results.failed.includes(config.filename) ? (
                    <XCircle className="h-5 w-5 text-destructive" />
                  ) : (
                    <Image className="h-5 w-5 text-muted-foreground" />
                  )}
                  {config.filename}
                </span>
                {appliedImages[config.filename] && (
                  <Badge className="bg-green-500">✅ Aplicado</Badge>
                )}
              </CardTitle>
              <CardDescription className="flex items-center gap-2">
                <span>Aspect ratio: {config.aspectRatio}</span>
                <span>•</span>
                <span>Key: {config.key}</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              {generatedImages[config.filename] ? (
                <div className="space-y-3">
                  <img 
                    src={generatedImages[config.filename]} 
                    alt={config.filename}
                    className="w-full rounded-lg border shadow-lg"
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={() => downloadImage(generatedImages[config.filename], config.filename)}
                      variant="outline"
                      className="flex-1"
                      size="sm"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Baixar
                    </Button>
                    <Button
                      onClick={() => handleApplyToSite(config.filename, config.key, generatedImages[config.filename])}
                      disabled={replacingImage === config.filename || appliedImages[config.filename]}
                      className={`flex-1 ${appliedImages[config.filename] ? 'bg-green-500' : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'}`}
                      size="sm"
                    >
                      {replacingImage === config.filename ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : appliedImages[config.filename] ? (
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                      ) : (
                        <Upload className="mr-2 h-4 w-4" />
                      )}
                      {appliedImages[config.filename] ? 'Aplicado!' : 'Aplicar no Site'}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-xs text-muted-foreground line-clamp-4 font-mono">
                    {config.prompt.substring(0, 200)}...
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Resumo dos resultados */}
      {(results.success.length > 0 || results.failed.length > 0) && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📊 Resumo da Geração
              {someApplied && (
                <Badge variant="secondary" className="ml-2">
                  {Object.keys(appliedImages).length} aplicadas no site
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {results.success.length > 0 && (
              <div>
                <h3 className="font-semibold text-green-600 mb-2">
                  ✅ Sucesso ({results.success.length})
                </h3>
                <ul className="list-disc list-inside text-sm text-muted-foreground">
                  {results.success.map(name => (
                    <li key={name} className="flex items-center gap-2">
                      {name}
                      {appliedImages[name] && <Badge variant="outline" className="text-xs">Aplicado</Badge>}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {results.failed.length > 0 && (
              <div>
                <h3 className="font-semibold text-destructive mb-2">
                  ❌ Falhas ({results.failed.length})
                </h3>
                <ul className="list-disc list-inside text-sm text-muted-foreground">
                  {results.failed.map(name => (
                    <li key={name}>{name}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
