# Dynamic Icons - Lazy Loading de Ícones Lucide

## 📦 O que é?

O componente `DynamicIcon` implementa **lazy loading automático** para ícones do Lucide React, carregando ícones sob demanda apenas quando necessários. Isso reduz significativamente o tamanho do bundle inicial.

## 🎯 Quando usar?

✅ **Use DynamicIcon quando:**
- Você tem muitos ícones diferentes em uma página
- Os ícones são renderizados condicionalmente (ex: baseado em dados de API)
- Você quer otimizar o carregamento inicial
- Você tem listas longas com ícones variados

❌ **NÃO use DynamicIcon quando:**
- O ícone é crítico para o First Paint (use import direto)
- Você tem poucos ícones fixos na página
- O ícone aparece acima da dobra (fold) na página inicial

## 📚 Como usar

### Importação
```tsx
import { DynamicIcon } from '@/components/ui/dynamic-icon';
```

### Uso básico
```tsx
<DynamicIcon name="home" size={24} />
```

### Com props personalizadas
```tsx
<DynamicIcon 
  name="settings" 
  size={32}
  color="red"
  strokeWidth={2.5}
  className="text-primary hover:text-primary-foreground transition-colors"
/>
```

### Com fallback customizado
```tsx
const CustomLoader = () => (
  <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
);

<DynamicIcon 
  name="loader" 
  fallback={CustomLoader}
/>
```

### Em listas dinâmicas
```tsx
interface MenuItem {
  id: string;
  label: string;
  icon: keyof typeof dynamicIconImports;
}

const menuItems: MenuItem[] = [
  { id: '1', label: 'Home', icon: 'home' },
  { id: '2', label: 'Settings', icon: 'settings' },
  { id: '3', label: 'Profile', icon: 'user' },
];

// Renderizar
{menuItems.map(item => (
  <div key={item.id} className="flex items-center gap-2">
    <DynamicIcon name={item.icon} size={20} />
    <span>{item.label}</span>
  </div>
))}
```

### Com dados de API
```tsx
interface Feature {
  title: string;
  iconName: keyof typeof dynamicIconImports;
}

const { data: features } = useQuery<Feature[]>(['features']);

return (
  <div className="grid grid-cols-3 gap-4">
    {features?.map(feature => (
      <Card key={feature.title}>
        <DynamicIcon name={feature.iconName} size={48} />
        <h3>{feature.title}</h3>
      </Card>
    ))}
  </div>
);
```

## ⚙️ Props disponíveis

Todas as props do Lucide React são suportadas:

| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| `name` | `keyof typeof dynamicIconImports` | - | Nome do ícone (kebab-case) |
| `size` | `number` | 24 | Tamanho do ícone |
| `color` | `string` | currentColor | Cor do ícone |
| `strokeWidth` | `number` | 2 | Largura do traço |
| `className` | `string` | - | Classes CSS customizadas |
| `fallback` | `ComponentType` | - | Componente de fallback customizado |

## 📊 Impacto no Bundle

### Antes (import direto)
```tsx
import { Home, Settings, User, Bell, Mail, Calendar, Search, Filter } from 'lucide-react';
// Bundle: ~45KB para 8 ícones
```

### Depois (DynamicIcon)
```tsx
import { DynamicIcon } from '@/components/ui/dynamic-icon';
// Bundle inicial: ~3KB
// Cada ícone carrega separadamente: ~5-6KB por ícone
// Total carregado: apenas ícones usados
```

## 🔍 Nomes de ícones disponíveis

Todos os ícones do Lucide React estão disponíveis em formato kebab-case:
- `home` → Home
- `settings` → Settings  
- `chevron-right` → ChevronRight
- `arrow-up-right` → ArrowUpRight

Lista completa: https://lucide.dev/icons/

## 🎨 Exemplo completo

```tsx
import { DynamicIcon } from '@/components/ui/dynamic-icon';
import { Card } from '@/components/ui/card';

export function FeatureCard({ iconName, title, description }) {
  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-primary/10 rounded-lg">
          <DynamicIcon 
            name={iconName}
            size={32}
            className="text-primary"
          />
        </div>
        <div>
          <h3 className="font-semibold text-lg">{title}</h3>
          <p className="text-muted-foreground text-sm">{description}</p>
        </div>
      </div>
    </Card>
  );
}

// Uso
<FeatureCard 
  iconName="zap"
  title="Performance"
  description="Otimização automática de bundle"
/>
```

## ⚡ Performance Tips

1. **Pré-carregue ícones críticos** se souber que serão usados:
```tsx
// Pré-carregar no topo do componente
import('lucide-react/dynamicIconImports').then(m => m['home']);
```

2. **Use memoização** em listas grandes:
```tsx
const MemoizedIcon = memo(DynamicIcon);
```

3. **Combine com virtual scrolling** para listas longas com ícones

## 🐛 Troubleshooting

**Erro: "Cannot find module 'lucide-react/dynamicIconImports'"**
- Certifique-se que `lucide-react` está atualizado (≥0.400.0)

**Ícone não aparece**
- Verifique se o nome está em kebab-case
- Use o console do navegador para ver erros de carregamento

**Performance não melhorou**
- Verifique se você tem muitos ícones na página
- Use o React DevTools Profiler para medir re-renders
