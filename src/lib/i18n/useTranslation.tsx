import { ptBR, Translation } from './pt-BR';

type DeepKeys<T> = T extends object
  ? {
      [K in keyof T]: K extends string
        ? T[K] extends object
          ? `${K}` | `${K}.${DeepKeys<T[K]>}`
          : `${K}`
        : never;
    }[keyof T]
  : never;

type TranslationKey = DeepKeys<Translation>;

function getNestedValue(obj: any, path: string): string {
  return path.split('.').reduce((acc, part) => acc?.[part], obj) || path;
}

export function useTranslation() {
  const t = (key: TranslationKey, params?: Record<string, string | number>): string => {
    let translation = getNestedValue(ptBR, key);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        translation = translation.replace(`{{${key}}}`, String(value));
      });
    }
    
    return translation;
  };

  return { t };
}
