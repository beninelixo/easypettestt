import { lazy, Suspense, ComponentType } from 'react';
import { LucideProps } from 'lucide-react';
import dynamicIconImports from 'lucide-react/dynamicIconImports';

// Fallback enquanto carrega o ícone
const IconFallback = () => (
  <div 
    className="inline-block animate-pulse bg-muted rounded" 
    style={{ width: 24, height: 24 }} 
  />
);

interface DynamicIconProps extends Omit<LucideProps, 'ref'> {
  name: keyof typeof dynamicIconImports;
  fallback?: ComponentType;
}

/**
 * Componente de ícone dinâmico com lazy loading
 * Carrega ícones do Lucide React sob demanda para reduzir bundle inicial
 * 
 * @example
 * <DynamicIcon name="home" size={24} className="text-primary" />
 */
export const DynamicIcon = ({ name, fallback: CustomFallback, ...props }: DynamicIconProps) => {
  const LucideIcon = lazy(dynamicIconImports[name]);
  const Fallback = CustomFallback || IconFallback;

  return (
    <Suspense fallback={<Fallback />}>
      <LucideIcon {...props} />
    </Suspense>
  );
};

export default DynamicIcon;
