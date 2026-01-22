import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Tables } from '@/integrations/supabase/types';

type Contribution = Tables<'contributions'>;
type ContributionType = 'mensuelle' | 'exceptionnelle' | 'adhesion';
type ContributionStatus = 'payee' | 'en_attente' | 'en_retard' | 'annulee';

export interface ContributionFormData {
  member_id: string;
  contribution_type: ContributionType;
  amount: number;
  period_month?: number;
  period_year?: number;
  exceptional_contribution_id?: string;
  status: ContributionStatus;
  payment_method?: string;
  payment_reference?: string;
  paid_at?: string;
  notes?: string;
}

export function useContributions(memberId?: string) {
  const queryClient = useQueryClient();

  // Query for member-specific contributions
  const { data: memberContributions = [], isLoading: memberLoading } = useQuery({
    queryKey: ['contributions', 'member', memberId],
    queryFn: async () => {
      if (!memberId) return [];
      
      const { data, error } = await supabase
        .from('contributions')
        .select('*')
        .eq('member_id', memberId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Contribution[];
    },
    enabled: !!memberId,
  });

  // Query for all contributions
  const { data: allContributions = [], isLoading: allLoading } = useQuery({
    queryKey: ['contributions', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contributions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Contribution[];
    },
  });

  const createContribution = useMutation({
    mutationFn: async (contributionData: ContributionFormData) => {
      const { data: userData } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('contributions')
        .insert({
          ...contributionData,
          recorded_by: userData.user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contributions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Cotisation enregistrée avec succès');
    },
    onError: (error) => {
      toast.error('Erreur lors de l\'enregistrement: ' + error.message);
    },
  });

  const updateContribution = useMutation({
    mutationFn: async ({ id, ...data }: ContributionFormData & { id: string }) => {
      const { data: result, error } = await supabase
        .from('contributions')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contributions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Cotisation mise à jour');
    },
    onError: (error) => {
      toast.error('Erreur: ' + error.message);
    },
  });

  const deleteContribution = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('contributions')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contributions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Cotisation supprimée');
    },
    onError: (error) => {
      toast.error('Erreur: ' + error.message);
    },
  });

  // Calculate stats from all contributions
  const stats = {
    totalCollected: allContributions.filter(c => c.status === 'payee').reduce((sum, c) => sum + c.amount, 0),
    paidCount: allContributions.filter(c => c.status === 'payee').length,
    pendingCount: allContributions.filter(c => c.status === 'en_attente').length,
    lateCount: allContributions.filter(c => c.status === 'en_retard').length,
  };

  return {
    contributions: memberId ? memberContributions : allContributions,
    allContributions,
    isLoading: memberLoading || allLoading,
    error: null,
    createContribution,
    updateContribution,
    deleteContribution,
    stats,
  };
}
