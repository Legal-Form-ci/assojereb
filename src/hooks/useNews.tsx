import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { News } from '@/types/database';

export interface NewsFormData {
  title: string;
  content: string;
  category: string;
  image_url?: string;
  media_urls?: string[];
  is_published: boolean;
}

export const NEWS_CATEGORIES = [
  { value: 'deces', label: 'Décès', color: 'bg-gray-600' },
  { value: 'mariage', label: 'Mariage', color: 'bg-pink-500' },
  { value: 'anniversaire', label: 'Anniversaire', color: 'bg-yellow-500' },
  { value: 'communique', label: 'Communiqué', color: 'bg-blue-500' },
  { value: 'opportunite', label: 'Opportunité', color: 'bg-green-500' },
  { value: 'projet', label: 'Projet', color: 'bg-purple-500' },
  { value: 'evenement', label: 'Événement', color: 'bg-orange-500' },
  { value: 'general', label: 'Général', color: 'bg-primary' },
];

export function useNews(onlyPublished = false) {
  const queryClient = useQueryClient();

  const { data: news = [], isLoading } = useQuery({
    queryKey: ['news', onlyPublished],
    queryFn: async () => {
      let query = supabase
        .from('news')
        .select('*')
        .order('published_at', { ascending: false });
      
      if (onlyPublished) {
        query = query.eq('is_published', true);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as News[];
    },
  });

  const createNews = useMutation({
    mutationFn: async (newsData: NewsFormData) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('news')
        .insert({
          title: newsData.title,
          content: newsData.content,
          category: newsData.category,
          image_url: newsData.image_url,
          media_urls: newsData.media_urls || [],
          is_published: newsData.is_published,
          created_by: user?.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news'] });
      toast.success('Actualité créée avec succès');
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });

  const updateNews = useMutation({
    mutationFn: async ({ id, ...newsData }: NewsFormData & { id: string }) => {
      const { data, error } = await supabase
        .from('news')
        .update({
          title: newsData.title,
          content: newsData.content,
          category: newsData.category,
          image_url: newsData.image_url,
          media_urls: newsData.media_urls || [],
          is_published: newsData.is_published,
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news'] });
      toast.success('Actualité modifiée avec succès');
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });

  const deleteNews = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('news')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news'] });
      toast.success('Actualité supprimée');
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });

  return {
    news,
    isLoading,
    createNews,
    updateNews,
    deleteNews,
  };
}

export function useNewsBySlug(slugOrId: string | undefined) {
  return useQuery({
    queryKey: ['news', 'detail', slugOrId],
    queryFn: async () => {
      if (!slugOrId) return null;

      // Try by slug first, then by ID
      let { data, error } = await supabase
        .from('news')
        .select('*')
        .eq('slug', slugOrId)
        .single();

      if (error || !data) {
        // Fallback to ID
        const result = await supabase
          .from('news')
          .select('*')
          .eq('id', slugOrId)
          .single();
        data = result.data;
        error = result.error;
      }

      if (error) throw error;
      return data as News;
    },
    enabled: !!slugOrId,
  });
}
