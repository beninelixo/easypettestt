import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RippleButton } from "@/components/ui/ripple-button";
import { ProgressIndicator } from "@/components/ui/progress-indicator";
import { LoadingOverlay } from "@/components/ui/loading-overlay";
import { StaggerContainer } from "@/components/ui/stagger-container";
import { 
  ProfileSkeleton, 
  DashboardSkeleton, 
  ListSkeleton, 
  GridSkeleton,
  FormSkeleton,
  TableSkeleton
} from "@/components/ui/skeleton-variants";
import { useAsyncOperation } from "@/hooks/useAsyncOperation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Save, Download, Loader2 } from "lucide-react";

// Exemplo de operação assíncrona simulada
const simulateAsyncOperation = (progressCallback?: (progress: number) => void) => {
  return new Promise((resolve) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      progressCallback?.(progress);
      
      if (progress >= 100) {
        clearInterval(interval);
        resolve({ success: true, data: "Operação concluída!" });
      }
    }, 300);
  });
};

export const AsyncOperationDemo = () => {
  const [showSkeletons, setShowSkeletons] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [inputState, setInputState] = useState<"default" | "success" | "error">("default");

  const uploadOperation = useAsyncOperation(
    simulateAsyncOperation,
    {
      successMessage: "Upload realizado com sucesso!",
      errorMessage: "Erro ao fazer upload",
      trackProgress: true,
    }
  );

  const saveOperation = useAsyncOperation(
    simulateAsyncOperation,
    {
      successMessage: "Dados salvos com sucesso!",
      trackProgress: true,
    }
  );

  const handleInputValidation = () => {
    if (inputValue.length < 3) {
      setInputState("error");
      setTimeout(() => setInputState("default"), 2000);
    } else {
      setInputState("success");
      setTimeout(() => setInputState("default"), 2000);
    }
  };

  return (
    <div className="container mx-auto p-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Sistema de Feedback Avançado
        </h1>
        <p className="text-muted-foreground">
          Demonstração de loading states, progress indicators, ripple effects, stagger animations e skeleton screens.
        </p>
      </div>

      {/* Progress Indicators */}
      <Card>
        <CardHeader>
          <CardTitle>Progress Indicators</CardTitle>
          <CardDescription>Indicadores visuais de progresso para operações assíncronas</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold">Circular</h3>
              <ProgressIndicator variant="circular" progress={uploadOperation.progress} label="Upload" />
              <RippleButton onClick={uploadOperation.execute} disabled={uploadOperation.isLoading} className="w-full">
                <Upload className="mr-2 h-4 w-4" />
                {uploadOperation.isLoading ? "Uploading..." : "Simular Upload"}
              </RippleButton>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Linear</h3>
              <ProgressIndicator variant="linear" progress={saveOperation.progress} label="Salvando" />
              <RippleButton onClick={saveOperation.execute} disabled={saveOperation.isLoading} variant="secondary" className="w-full">
                <Save className="mr-2 h-4 w-4" />
                {saveOperation.isLoading ? "Salvando..." : "Simular Salvamento"}
              </RippleButton>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Dots</h3>
              <ProgressIndicator variant="dots" label="Carregando" size="md" />
              <RippleButton variant="outline" className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Download
              </RippleButton>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ripple Buttons */}
      <Card>
        <CardHeader>
          <CardTitle>Ripple Effect Buttons</CardTitle>
          <CardDescription>Botões com efeito ripple ao clicar (feedback tátil)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <RippleButton>Default Ripple</RippleButton>
            <RippleButton variant="secondary">Secondary</RippleButton>
            <RippleButton variant="outline">Outline</RippleButton>
            <RippleButton variant="gradient">Gradient</RippleButton>
            <RippleButton variant="premium">Premium</RippleButton>
            <RippleButton variant="glow">Glow Effect</RippleButton>
          </div>
        </CardContent>
      </Card>

      {/* Form Feedback */}
      <Card>
        <CardHeader>
          <CardTitle>Form Field Feedback</CardTitle>
          <CardDescription>Animações de sucesso/erro em campos de formulário</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="demo-input">Digite pelo menos 3 caracteres</Label>
            <Input
              id="demo-input"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onBlur={handleInputValidation}
              className={
                inputState === "success" 
                  ? "input-success" 
                  : inputState === "error" 
                  ? "input-error" 
                  : ""
              }
              placeholder="Digite algo..."
            />
            {inputState === "success" && (
              <p className="text-sm text-accent animate-fade-in">✓ Validação bem-sucedida!</p>
            )}
            {inputState === "error" && (
              <p className="text-sm text-destructive animate-fade-in">✗ Mínimo 3 caracteres necessários</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stagger Animations */}
      <Card>
        <CardHeader>
          <CardTitle>Stagger Animations</CardTitle>
          <CardDescription>Animações escalonadas para listas e grids</CardDescription>
        </CardHeader>
        <CardContent>
          <StaggerContainer staggerDelay={100} animation="fade-up">
            {[1, 2, 3, 4, 5].map((item) => (
              <Card key={item} className="p-4">
                <p className="font-medium">Item {item}</p>
                <p className="text-sm text-muted-foreground">Aparece com delay escalonado</p>
              </Card>
            ))}
          </StaggerContainer>
        </CardContent>
      </Card>

      {/* Skeleton Screens */}
      <Card>
        <CardHeader>
          <CardTitle>Skeleton Screens</CardTitle>
          <CardDescription>Diferentes tipos de skeleton loaders com shimmer effect</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <RippleButton onClick={() => setShowSkeletons("profile")} variant="outline" size="sm">
              Profile Skeleton
            </RippleButton>
            <RippleButton onClick={() => setShowSkeletons("dashboard")} variant="outline" size="sm">
              Dashboard Skeleton
            </RippleButton>
            <RippleButton onClick={() => setShowSkeletons("list")} variant="outline" size="sm">
              List Skeleton
            </RippleButton>
            <RippleButton onClick={() => setShowSkeletons("grid")} variant="outline" size="sm">
              Grid Skeleton
            </RippleButton>
            <RippleButton onClick={() => setShowSkeletons("form")} variant="outline" size="sm">
              Form Skeleton
            </RippleButton>
            <RippleButton onClick={() => setShowSkeletons("table")} variant="outline" size="sm">
              Table Skeleton
            </RippleButton>
            <RippleButton onClick={() => setShowSkeletons(null)} variant="destructive" size="sm">
              Limpar
            </RippleButton>
          </div>

          <div className="border rounded-lg p-4 min-h-[200px]">
            {showSkeletons === "profile" && <ProfileSkeleton />}
            {showSkeletons === "dashboard" && <DashboardSkeleton />}
            {showSkeletons === "list" && <ListSkeleton items={5} />}
            {showSkeletons === "grid" && <GridSkeleton items={6} columns={3} />}
            {showSkeletons === "form" && <FormSkeleton />}
            {showSkeletons === "table" && <TableSkeleton rows={5} columns={4} />}
            {!showSkeletons && (
              <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                Selecione um tipo de skeleton para visualizar
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Loading Overlay */}
      <Card>
        <CardHeader>
          <CardTitle>Loading Overlay</CardTitle>
          <CardDescription>Overlay com blur para operações em andamento</CardDescription>
        </CardHeader>
        <CardContent>
          <LoadingOverlay isLoading={uploadOperation.isLoading} progress={uploadOperation.progress} blur>
            <div className="p-8 border rounded-lg space-y-4">
              <h3 className="text-lg font-semibold">Conteúdo Protegido</h3>
              <p className="text-muted-foreground">
                Este conteúdo fica bloqueado durante operações assíncronas.
              </p>
              <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-24 bg-muted rounded-lg" />
                ))}
              </div>
            </div>
          </LoadingOverlay>
        </CardContent>
      </Card>
    </div>
  );
};
