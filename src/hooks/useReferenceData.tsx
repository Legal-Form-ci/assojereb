import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Family, House, ContributionCategory } from '@/types/database';

export function useFamilies() {
  return useQuery({
    queryKey: ['families'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('families')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data as Family[];
    },
  });
}

export function useHouses() {
  return useQuery({
    queryKey: ['houses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('houses')
        .select('*')
        .order('house_number', { ascending: true });

      if (error) throw error;
      return data as House[];
    },
  });
}

export function useContributionCategories() {
  return useQuery({
    queryKey: ['contribution-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contribution_categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data as ContributionCategory[];
    },
  });
}
