import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SuccessStory {
  id: string;
  pet_shop_id: string;
  business_name: string;
  owner_name: string;
  location: string;
  segment: 'petshop' | 'banhotosa' | 'clinica';
  revenue_growth_percent?: number;
  total_clients?: number;
  satisfaction_rating?: number;
  testimonial: string;
  highlight: string;
  image_url?: string;
  video_url?: string;
  approved: boolean;
  featured: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export const useSuccessStories = (approvedOnly = true) => {
  return useQuery({
    queryKey: ['success-stories', approvedOnly],
    queryFn: async () => {
      let query = supabase
        .from('success_stories')
        .select('*')
        .order('featured', { ascending: false })
        .order('display_order', { ascending: true });

      if (approvedOnly) {
        query = query.eq('approved', true);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as SuccessStory[];
    },
  });
};

export const useSuccessStoriesBySegment = (segment: string) => {
  return useQuery({
    queryKey: ['success-stories', segment],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('success_stories')
        .select('*')
        .eq('approved', true)
        .eq('segment', segment)
        .order('featured', { ascending: false })
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data as SuccessStory[];
    },
  });
};

export const useCreateSuccessStory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (story: Omit<SuccessStory, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('success_stories')
        .insert([story])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['success-stories'] });
    },
  });
};

export const useUpdateSuccessStory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<SuccessStory> }) => {
      const { data, error } = await supabase
        .from('success_stories')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['success-stories'] });
    },
  });
};

export const useDeleteSuccessStory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('success_stories')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['success-stories'] });
    },
  });
};

export const useHasSuccessStories = () => {
  return useQuery({
    queryKey: ['has-success-stories'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('success_stories')
        .select('*', { count: 'exact', head: true })
        .eq('approved', true);

      if (error) throw error;
      return (count ?? 0) > 0;
    },
    staleTime: 5 * 60 * 1000, // Cache por 5 minutos
  });
};
