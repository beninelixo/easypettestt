import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Image, Loader2, Download, CheckCircle2, XCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { images, generateImage } from "@/scripts/regenerate-images";
import type { ImageConfig } from "@/scripts/regenerate-images";

export default function RegenerateImages() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentImage, setCurrentImage] = useState<string>("");
  const [generatedImages, setGeneratedImages] = useState<Record<string, string>>({});
  const [results, setResults] = useState<{ success: string[]; failed: string[] }>({ success: [], failed: [] });
  const { toast } = useToast();

  const downloadImage = (base64Url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = base64Url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRegenerateAll = async () => {
    setIsGenerating(true);
    setProgress(0);
    setGeneratedImages({});
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
      
      // Aguardar 2 segundos entre cada geração
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

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          🎨 Regenerar Imagens com IA
        </h1>
        <p className="text-muted-foreground">
          Gere imagens profissionais de alta qualidade para o sistema usando Lovable AI
        </p>
      </div>

      <Alert className="mb-6">
        <Image className="h-4 w-4" />
        <AlertDescription>
          Este processo irá gerar {images.length} imagens usando IA. Cada imagem leva aproximadamente 5-10 segundos.
          As imagens serão geradas em base64 - você pode baixá-las e substituir os arquivos em src/assets/.
        </AlertDescription>
      </Alert>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Controle de Geração</CardTitle>
          <CardDescription>
            Gere todas as imagens principais do sistema de uma vez
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
                Gerando {currentImage}...
              </>
            ) : (
              <>
                <Image className="mr-2 h-5 w-5" />
                Gerar Todas as Imagens
              </>
            )}
          </Button>

          {isGenerating && (
            <div className="space-y-2">
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-muted-foreground text-center">
                {Math.round(progress)}% completo
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lista de imagens para gerar */}
      <div className="grid gap-4 md:grid-cols-2">
        {images.map((config) => (
          <Card key={config.filename} className={generatedImages[config.filename] ? "border-green-500" : ""}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                {generatedImages[config.filename] ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : results.failed.includes(config.filename) ? (
                  <XCircle className="h-5 w-5 text-destructive" />
                ) : (
                  <Image className="h-5 w-5" />
                )}
                {config.filename}
              </CardTitle>
              <CardDescription>
                Aspect ratio: {config.aspectRatio}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {generatedImages[config.filename] ? (
                <div className="space-y-3">
                  <img 
                    src={generatedImages[config.filename]} 
                    alt={config.filename}
                    className="w-full rounded-lg border"
                  />
                  <Button
                    onClick={() => downloadImage(generatedImages[config.filename], config.filename)}
                    variant="outline"
                    className="w-full"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Baixar Imagem
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {config.prompt}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Resumo dos resultados */}
      {(results.success.length > 0 || results.failed.length > 0) && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>📊 Resumo da Geração</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {results.success.length > 0 && (
              <div>
                <h3 className="font-semibold text-green-600 mb-2">
                  ✅ Sucesso ({results.success.length})
                </h3>
                <ul className="list-disc list-inside text-sm text-muted-foreground">
                  {results.success.map(name => (
                    <li key={name}>{name}</li>
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
