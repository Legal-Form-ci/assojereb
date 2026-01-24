import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Member, Gender, GeographicZone, MemberStatus } from '@/types/database';
import { toast } from 'sonner';

export interface MemberFormData {
  first_name: string;
  last_name: string;
  gender: Gender;
  date_of_birth?: string;
  family_id: string;
  house_id?: string;
  profession?: string;
  contribution_category_id?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  geographic_zone: GeographicZone;
  address?: string;
  status: MemberStatus;
  photo_url?: string;
  notes?: string;
  password?: string; // Pour la création d'un compte utilisateur
}

export function useMembers() {
  const queryClient = useQueryClient();

  const { data: members = [], isLoading, error } = useQuery({
    queryKey: ['members'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('members')
        .select(`
          *,
          family:families(*),
          house:houses(*),
          contribution_category:contribution_categories(*)
        `)
        .order('last_name', { ascending: true });

      if (error) throw error;
      return data as Member[];
    },
  });

  const createMember = useMutation({
    mutationFn: async (memberData: MemberFormData) => {
      const { password, ...memberDataWithoutPassword } = memberData;
      
      // Si un email et mot de passe sont fournis, créer un compte utilisateur
      let userId: string | null = null;
      if (memberData.email && password) {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: memberData.email,
          password: password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              full_name: `${memberData.first_name} ${memberData.last_name}`,
            },
          },
        });
        
        if (authError) throw authError;
        userId = authData.user?.id || null;
        
        // Créer le profil avec must_change_password = true
        if (userId) {
          await supabase.from('profiles').insert({
            user_id: userId,
            full_name: `${memberData.first_name} ${memberData.last_name}`,
            phone: memberData.phone,
            must_change_password: true,
          });
          
          // Assigner le rôle membre
          await supabase.from('user_roles').insert({
            user_id: userId,
            role: 'membre',
            family_id: memberData.family_id,
          });
        }
      }
      
      // Créer le membre avec le user_id si disponible
      const { data, error } = await supabase
        .from('members')
        .insert({
          ...memberDataWithoutPassword,
          user_id: userId,
        } as never)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      toast.success('Membre créé avec succès');
    },
    onError: (error) => {
      toast.error('Erreur lors de la création du membre: ' + error.message);
    },
  });

  const updateMember = useMutation({
    mutationFn: async ({ id, ...memberData }: MemberFormData & { id: string }) => {
      const { data, error } = await supabase
        .from('members')
        .update(memberData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      toast.success('Membre mis à jour avec succès');
    },
    onError: (error) => {
      toast.error('Erreur lors de la mise à jour: ' + error.message);
    },
  });

  const deleteMember = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('members')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      toast.success('Membre supprimé avec succès');
    },
    onError: (error) => {
      toast.error('Erreur lors de la suppression: ' + error.message);
    },
  });

  return {
    members,
    isLoading,
    error,
    createMember,
    updateMember,
    deleteMember,
  };
}

export function useMember(id: string | undefined) {
  return useQuery({
    queryKey: ['members', id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('members')
        .select(`
          *,
          family:families(*),
          house:houses(*),
          contribution_category:contribution_categories(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Member;
    },
    enabled: !!id,
  });
}
