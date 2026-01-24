import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface FamilyDashboardStats {
  familyName: string;
  totalMembers: number;
  activeMembers: number;
  pendingContributions: number;
  monthlyRevenue: number;
  membersByStatus: { status: string; count: number }[];
  membersByZone: { zone: string; count: number }[];
  contributionsByMonth: { month: string; amount: number }[];
  recentContributions: {
    id: string;
    memberName: string;
    amount: number;
    status: string;
    date: string;
  }[];
}

export function useFamilyDashboardStats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['family-dashboard-stats', user?.id],
    queryFn: async (): Promise<FamilyDashboardStats | null> => {
      if (!user?.id) return null;

      // Get the user's family_id from user_roles
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('family_id')
        .eq('user_id', user.id)
        .eq('role', 'responsable')
        .maybeSingle();

      if (!roleData?.family_id) return null;

      const familyId = roleData.family_id;

      // Get family name
      const { data: familyData } = await supabase
        .from('families')
        .select('name')
        .eq('id', familyId)
        .single();

      const familyName = familyData?.name || 'Ma famille';

      // Fetch members count for this family
      const { count: totalMembers } = await supabase
        .from('members')
        .select('*', { count: 'exact', head: true })
        .eq('family_id', familyId);

      const { count: activeMembers } = await supabase
        .from('members')
        .select('*', { count: 'exact', head: true })
        .eq('family_id', familyId)
        .eq('status', 'actif');

      // Get member IDs for this family
      const { data: familyMembers } = await supabase
        .from('members')
        .select('id, status, geographic_zone')
        .eq('family_id', familyId);

      const memberIds = familyMembers?.map(m => m.id) || [];

      // Members by status
      const statusCounts: Record<string, number> = {};
      familyMembers?.forEach(m => {
        statusCounts[m.status] = (statusCounts[m.status] || 0) + 1;
      });
      const membersByStatus = Object.entries(statusCounts).map(([status, count]) => ({ status, count }));

      // Members by zone
      const zoneCounts: Record<string, number> = {};
      familyMembers?.forEach(m => {
        zoneCounts[m.geographic_zone] = (zoneCounts[m.geographic_zone] || 0) + 1;
      });
      const membersByZone = Object.entries(zoneCounts).map(([zone, count]) => ({ zone, count }));

      // Pending contributions for family members
      let pendingContributions = 0;
      if (memberIds.length > 0) {
        const { count } = await supabase
          .from('contributions')
          .select('*', { count: 'exact', head: true })
          .in('member_id', memberIds)
          .eq('status', 'en_attente');
        pendingContributions = count || 0;
      }

      // Monthly revenue for this family
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      
      let monthlyRevenue = 0;
      if (memberIds.length > 0) {
        const { data: monthlyData } = await supabase
          .from('contributions')
          .select('amount')
          .in('member_id', memberIds)
          .eq('status', 'payee')
          .eq('period_month', currentMonth)
          .eq('period_year', currentYear);
        monthlyRevenue = monthlyData?.reduce((sum, c) => sum + (c.amount || 0), 0) || 0;
      }

      // Contributions by month (last 6 months)
      const contributionsByMonth: { month: string; amount: number }[] = [];
      const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
      
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        
        let amount = 0;
        if (memberIds.length > 0) {
          const { data } = await supabase
            .from('contributions')
            .select('amount')
            .in('member_id', memberIds)
            .eq('status', 'payee')
            .eq('period_month', month)
            .eq('period_year', year);
          amount = data?.reduce((sum, c) => sum + (c.amount || 0), 0) || 0;
        }
        contributionsByMonth.push({ month: months[date.getMonth()], amount });
      }

      // Recent contributions
      let recentContributions: FamilyDashboardStats['recentContributions'] = [];
      if (memberIds.length > 0) {
        const { data: recentData } = await supabase
          .from('contributions')
          .select(`
            id,
            amount,
            status,
            created_at,
            member:members(first_name, last_name)
          `)
          .in('member_id', memberIds)
          .order('created_at', { ascending: false })
          .limit(5);

        recentContributions = recentData?.map(c => ({
          id: c.id,
          memberName: `${(c.member as any)?.first_name || ''} ${(c.member as any)?.last_name || ''}`.trim(),
          amount: c.amount,
          status: c.status,
          date: c.created_at,
        })) || [];
      }

      return {
        familyName,
        totalMembers: totalMembers || 0,
        activeMembers: activeMembers || 0,
        pendingContributions,
        monthlyRevenue,
        membersByStatus,
        membersByZone,
        contributionsByMonth,
        recentContributions,
      };
    },
    enabled: !!user?.id,
  });
}
