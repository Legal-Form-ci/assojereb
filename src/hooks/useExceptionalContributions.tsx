import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ExceptionalContribution } from '@/types/database';

export interface ExceptionalContributionFormData {
  title: string;
  description?: string;
  amount: number;
  due_date?: string;
  is_mandatory: boolean;
  is_active: boolean;
}

export function useExceptionalContributions() {
  const queryClient = useQueryClient();

  const { data: exceptionalContributions = [], isLoading } = useQuery({
    queryKey: ['exceptional-contributions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exceptional_contributions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as ExceptionalContribution[];
    },
  });

  const createExceptionalContribution = useMutation({
    mutationFn: async (data: ExceptionalContributionFormData) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data: result, error } = await supabase
        .from('exceptional_contributions')
        .insert({
          ...data,
          created_by: user?.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exceptional-contributions'] });
      toast.success('Cotisation exceptionnelle créée');
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });

  const updateExceptionalContribution = useMutation({
    mutationFn: async ({ id, ...data }: ExceptionalContributionFormData & { id: string }) => {
      const { data: result, error } = await supabase
        .from('exceptional_contributions')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exceptional-contributions'] });
      toast.success('Cotisation exceptionnelle modifiée');
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });

  const deleteExceptionalContribution = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('exceptional_contributions')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exceptional-contributions'] });
      toast.success('Cotisation exceptionnelle supprimée');
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });

  return {
    exceptionalContributions,
    isLoading,
    createExceptionalContribution,
    updateExceptionalContribution,
    deleteExceptionalContribution,
  };
}
