import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Fallback images from assets
const fallbackImages: Record<string, string> = {
  'hero-petshop': '/src/assets/hero-petshop.jpg',
  'system-dashboard': '/src/assets/system-dashboard.jpg',
  'happy-clients': '/src/assets/happy-clients.jpg',
  'vet-care': '/src/assets/vet-care.jpg',
};

// Hook para carregar todas as imagens do blog de uma vez (mais eficiente)
export function useBlogImages() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['blog-images'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_images')
        .select('key, url')
        .like('key', 'blog-%');

      // On permission error, return empty - use fallbacks
      if (error) {
        console.warn('Blog images fetch error (using fallbacks):', error.message);
        return {};
      }
      
      // Retorna mapa: { 'slug': 'url', ... }
      return (data || []).reduce((acc, img) => {
        const slug = img.key.replace('blog-', '');
        acc[slug] = img.url;
        return acc;
      }, {} as Record<string, string>);
    },
    staleTime: 1 * 60 * 1000, // 1 minuto para atualização mais rápida
    gcTime: 5 * 60 * 1000,
    retry: false, // Don't retry on permission errors
  });

  return {
    images: data || {},
    isLoading,
    error,
    refetch,
  };
}

// Hook para invalidar cache de imagens do blog (usado após upload)
export function useInvalidateBlogImages() {
  const queryClient = useQueryClient();
  
  return () => {
    queryClient.invalidateQueries({ queryKey: ['blog-images'] });
    queryClient.invalidateQueries({ queryKey: ['site-images'] });
    queryClient.invalidateQueries({ queryKey: ['site-image'] });
  };
}

interface SiteImage {
  id: string;
  key: string;
  url: string;
  alt_text: string | null;
  category: string;
  updated_at: string;
}

export function useSiteImage(key: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['site-image', key],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_images')
        .select('*')
        .eq('key', key)
        .maybeSingle(); // Usar maybeSingle() para evitar erro quando não há resultado

      // On any error, return null - will use fallback
      if (error) {
        console.warn(`Site image "${key}" fetch error (using fallback):`, error.message);
        return null;
      }
      return data as SiteImage;
    },
    staleTime: 1 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: false, // Don't retry on permission errors
  });

  // Return URL with fallback - prioritize fallback on error
  const imageUrl = data?.url || fallbackImages[key] || '';
  const altText = data?.alt_text || key;

  return {
    url: imageUrl,
    alt: altText,
    isLoading,
    error,
    data,
  };
}

export function useSiteImages(category?: string) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['site-images', category],
    queryFn: async () => {
      let query = supabase.from('site_images').select('*');
      
      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;
      
      // On permission error, return empty array
      if (error) {
        console.warn('Site images fetch error (using fallbacks):', error.message);
        return [];
      }
      return data as SiteImage[];
    },
    staleTime: 1 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: false, // Don't retry on permission errors
  });

  return {
    images: data || [],
    isLoading,
    error,
    refetch,
  };
}

export async function updateSiteImage(key: string, url: string, userId?: string) {
  const { error } = await supabase
    .from('site_images')
    .upsert({
      key,
      url,
      updated_at: new Date().toISOString(),
      updated_by: userId,
    }, {
      onConflict: 'key',
    });

  if (error) throw error;
  return true;
}