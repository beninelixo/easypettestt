import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Fallback images from assets
const fallbackImages: Record<string, string> = {
  'hero-petshop': '/src/assets/hero-petshop.jpg',
  'system-dashboard': '/src/assets/system-dashboard.jpg',
  'happy-clients': '/src/assets/happy-clients.jpg',
  'vet-care': '/src/assets/vet-care.jpg',
};

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
        .single();

      if (error) throw error;
      return data as SiteImage;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Return URL with fallback
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
      if (error) throw error;
      return data as SiteImage[];
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
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
