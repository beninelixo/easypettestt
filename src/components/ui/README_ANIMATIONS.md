# Sistema de Animações e Feedback Visual

Este documento descreve todos os componentes de feedback visual, animações e loading states disponíveis na aplicação.

## 📦 Componentes Disponíveis

### 1. Progress Indicators (`progress-indicator.tsx`)

Indicadores visuais de progresso para operações assíncronas.

**Variantes:**
- `circular`: Loader circular com ou sem porcentagem
- `linear`: Barra de progresso horizontal
- `dots`: Três pontos pulsantes

**Uso:**
```tsx
import { ProgressIndicator } from "@/components/ui/progress-indicator";

// Circular com progresso
<ProgressIndicator variant="circular" progress={75} label="Uploading..." />

// Linear
<ProgressIndicator variant="linear" progress={50} />

// Dots (sem progresso)
<ProgressIndicator variant="dots" label="Carregando" />
```

**Props:**
- `variant`: "circular" | "linear" | "dots"
- `size`: "sm" | "md" | "lg"
- `progress`: number (0-100) - opcional
- `label`: string - opcional
- `className`: string - opcional

---

### 2. Ripple Button (`ripple-button.tsx`)

Botão com efeito ripple (onda) ao clicar para feedback tátil.

**Uso:**
```tsx
import { RippleButton } from "@/components/ui/ripple-button";

<RippleButton variant="default" onClick={handleClick}>
  Click me
</RippleButton>

// Com cor customizada
<RippleButton rippleColor="rgba(255, 0, 0, 0.5)">
  Red Ripple
</RippleButton>
```

**Props:**
- Herda todas as props de `Button`
- `rippleColor`: string - cor do efeito ripple (padrão: branco transparente)

---

### 3. Stagger Container (`stagger-container.tsx`)

Container para animações escalonadas em listas e grids.

**Uso:**
```tsx
import { StaggerContainer } from "@/components/ui/stagger-container";

<StaggerContainer staggerDelay={100} animation="fade-up">
  <Card>Item 1</Card>
  <Card>Item 2</Card>
  <Card>Item 3</Card>
</StaggerContainer>

// Ou usar StaggerItem diretamente
import { StaggerItem } from "@/components/ui/stagger-container";

<StaggerItem delay={200}>
  <Card>Item com delay customizado</Card>
</StaggerItem>
```

**Props StaggerContainer:**
- `staggerDelay`: number (ms) - delay entre cada item (padrão: 100)
- `initialDelay`: number (ms) - delay inicial (padrão: 0)
- `animation`: "fade-up" | "fade-in" | "scale-in" | "slide-left" | "slide-right"

**Props StaggerItem:**
- `delay`: number (ms)
- `className`: string

---

### 4. Skeleton Variants (`skeleton-variants.tsx`)

Skeleton screens personalizados para diferentes tipos de conteúdo.

**Tipos Disponíveis:**
- `ProfileSkeleton`: Para páginas de perfil
- `DashboardSkeleton`: Para dashboards com stats e gráficos
- `ListSkeleton`: Para listas de itens
- `GridSkeleton`: Para grids de cards
- `TableSkeleton`: Para tabelas
- `FormSkeleton`: Para formulários
- `CardSkeleton`: Para cards individuais

**Uso:**
```tsx
import { 
  ProfileSkeleton, 
  DashboardSkeleton, 
  ListSkeleton,
  GridSkeleton 
} from "@/components/ui/skeleton-variants";

// Loading state
{isLoading ? (
  <DashboardSkeleton />
) : (
  <DashboardContent data={data} />
)}

// Com opções customizadas
<ListSkeleton items={10} />
<GridSkeleton items={6} columns={3} />
<TableSkeleton rows={8} columns={5} />
```

**Props:**
- `ProfileSkeleton`: className
- `DashboardSkeleton`: className
- `ListSkeleton`: items (número de itens), className
- `GridSkeleton`: items, columns (2, 3 ou 4), className
- `TableSkeleton`: rows, columns, className
- `FormSkeleton`: className
- `CardSkeleton`: className

---

### 5. Loading Overlay (`loading-overlay.tsx`)

Overlay para bloquear conteúdo durante operações.

**Uso:**
```tsx
import { LoadingOverlay } from "@/components/ui/loading-overlay";

<LoadingOverlay 
  isLoading={isUploading} 
  progress={uploadProgress}
  label="Enviando arquivos..."
  blur
>
  <div>
    Conteúdo que será bloqueado
  </div>
</LoadingOverlay>

// Fullscreen overlay
<LoadingOverlay 
  isLoading={isProcessing}
  fullscreen
  variant="circular"
/>
```

**Props:**
- `isLoading`: boolean
- `label`: string - opcional
- `variant`: "circular" | "linear" | "dots"
- `progress`: number (0-100) - opcional
- `blur`: boolean - aplicar blur no backdrop
- `fullscreen`: boolean - ocupar tela inteira
- `children`: React.ReactNode - conteúdo a ser sobreposto

---

### 6. useAsyncOperation Hook (`useAsyncOperation.tsx`)

Hook para gerenciar operações assíncronas com feedback visual automático.

**Uso:**
```tsx
import { useAsyncOperation } from "@/hooks/useAsyncOperation";

const MyComponent = () => {
  const uploadOperation = useAsyncOperation(
    async (progressCallback) => {
      // Sua operação assíncrona
      // Use progressCallback(percent) para atualizar progresso
      return await uploadFile(file, progressCallback);
    },
    {
      successMessage: "Upload concluído!",
      errorMessage: "Erro no upload",
      trackProgress: true,
      onSuccess: (data) => console.log("Success:", data),
      onError: (error) => console.error("Error:", error),
    }
  );

  return (
    <>
      <RippleButton 
        onClick={uploadOperation.execute}
        disabled={uploadOperation.isLoading}
      >
        {uploadOperation.isLoading ? "Uploading..." : "Upload"}
      </RippleButton>
      
      {uploadOperation.isLoading && (
        <ProgressIndicator progress={uploadOperation.progress} />
      )}
    </>
  );
};
```

**Retorno:**
- `isLoading`: boolean
- `error`: Error | null
- `data`: T | null
- `progress`: number (0-100)
- `execute()`: função para executar operação
- `reset()`: função para resetar estado

**Opções:**
- `successMessage`: string - mensagem de sucesso (toast)
- `errorMessage`: string - mensagem de erro (toast)
- `trackProgress`: boolean - rastrear progresso
- `onSuccess`: (data) => void - callback de sucesso
- `onError`: (error) => void - callback de erro

---

## 🎨 Classes CSS de Animação

### Feedback de Formulários

```tsx
// Input com sucesso
<Input className="input-success" />

// Input com erro
<Input className="input-error" />
```

### Efeitos Visuais

```tsx
// Efeito shimmer (usado em skeletons)
<div className="shimmer-effect" />

// Efeito shine (usado em botões)
<div className="shine" />

// Transform 3D
<div className="preserve-3d perspective" />

// Card com hover 3D
<div className="card-3d" />
```

### Backdrop Blur

```tsx
<div className="backdrop-blur-sm" />
<div className="backdrop-blur-md" />
<div className="backdrop-blur-lg" />
<div className="backdrop-blur-xl" />
```

---

## 🚀 Exemplos de Uso Completos

### Upload com Progress

```tsx
const FileUpload = () => {
  const upload = useAsyncOperation(
    (progressCallback) => uploadToServer(file, progressCallback),
    {
      successMessage: "Arquivo enviado!",
      trackProgress: true,
    }
  );

  return (
    <LoadingOverlay isLoading={upload.isLoading} progress={upload.progress} blur>
      <div>
        <RippleButton onClick={upload.execute}>
          Upload File
        </RippleButton>
      </div>
    </LoadingOverlay>
  );
};
```

### Lista com Stagger

```tsx
const ItemList = ({ items, isLoading }) => {
  if (isLoading) return <ListSkeleton items={5} />;
  
  return (
    <StaggerContainer staggerDelay={100} animation="fade-up">
      {items.map(item => (
        <Card key={item.id}>{item.name}</Card>
      ))}
    </StaggerContainer>
  );
};
```

### Dashboard com Loading States

```tsx
const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);

  if (isLoading) return <DashboardSkeleton />;

  return (
    <div>
      <StaggerContainer staggerDelay={150}>
        <StatCard />
        <StatCard />
        <StatCard />
      </StaggerContainer>
    </div>
  );
};
```

---

## 📝 Notas Importantes

1. **Shimmer Effect**: Automaticamente aplicado em skeleton screens
2. **Performance**: Todos os componentes são otimizados com React.memo quando apropriado
3. **Acessibilidade**: Loading states incluem labels para screen readers
4. **Responsividade**: Todos os componentes são mobile-first
5. **Temas**: Todos os componentes respeitam tema claro/escuro

---

## 🔧 Customização

Você pode customizar as animações editando:
- `src/index.css`: Keyframes e classes de animação
- `tailwind.config.ts`: Configurações de transição e timing

Para adicionar novas variantes de skeleton, edite `src/components/ui/skeleton-variants.tsx`.
