import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { UserPermissions, ROLE_LABELS, AppRole } from '@/types/database';

export function usePermissions() {
  const { user, userRole } = useAuth();

  const { data: permissions, isLoading } = useQuery({
    queryKey: ['permissions', user?.id],
    queryFn: async (): Promise<UserPermissions> => {
      if (!user?.id) {
        return getPermissionsFromRole(null);
      }

      const { data, error } = await supabase
        .rpc('get_user_permissions', { _user_id: user.id });

      if (error || !data || data.length === 0) {
        return getPermissionsFromRole(userRole);
      }

      return data[0] as UserPermissions;
    },
    enabled: !!user?.id,
  });

  const role = userRole as string | null;

  return {
    permissions: permissions || getPermissionsFromRole(role),
    isLoading,
    roleLabel: role ? ROLE_LABELS[role as AppRole] || role : 'Membre',
    isSuperAdmin: role === 'admin',
    isPresident: role === 'president' || role === 'president_adjoint',
    isTresorier: role === 'tresorier' || role === 'tresorier_adjoint',
    isChefFamille: role === 'chef_famille',
    isCommissaire: role === 'commissaire_comptes',
  };
}

function getPermissionsFromRole(role: string | null): UserPermissions {
  const adminRoles = ['admin', 'president'];
  const managerRoles = [...adminRoles, 'president_adjoint', 'chef_famille', 'responsable'];
  const financeRoles = [...adminRoles, 'president_adjoint', 'tresorier', 'tresorier_adjoint'];
  const auditRoles = ['admin', 'commissaire_comptes'];

  return {
    can_manage_members: managerRoles.includes(role || ''),
    can_manage_contributions: [...financeRoles, 'chef_famille', 'responsable'].includes(role || ''),
    can_manage_news: adminRoles.includes(role || '') || role === 'president_adjoint',
    can_view_reports: [...financeRoles, 'commissaire_comptes'].includes(role || ''),
    can_manage_roles: role === 'admin',
    can_audit: auditRoles.includes(role || ''),
    family_id: null,
  };
}
