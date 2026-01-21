import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DashboardStats } from '@/types/database';

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async (): Promise<DashboardStats> => {
      // Fetch members count
      const { count: totalMembers } = await supabase
        .from('members')
        .select('*', { count: 'exact', head: true });

      const { count: activeMembers } = await supabase
        .from('members')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'actif');

      // Fetch contributions stats
      const { count: totalContributions } = await supabase
        .from('contributions')
        .select('*', { count: 'exact', head: true });

      const { count: pendingContributions } = await supabase
        .from('contributions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'en_attente');

      // Monthly revenue (current month)
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      
      const { data: monthlyData } = await supabase
        .from('contributions')
        .select('amount')
        .eq('status', 'payee')
        .eq('period_month', currentMonth)
        .eq('period_year', currentYear);

      const monthlyRevenue = monthlyData?.reduce((sum, c) => sum + (c.amount || 0), 0) || 0;

      // Members by family
      const { data: familyData } = await supabase
        .from('members')
        .select('family:families(name)');

      const familyCounts: Record<string, number> = {};
      familyData?.forEach((m: { family: { name: string } | null }) => {
        const name = m.family?.name || 'Non assigné';
        familyCounts[name] = (familyCounts[name] || 0) + 1;
      });
      const membersByFamily = Object.entries(familyCounts).map(([name, count]) => ({ name, count }));

      // Members by zone
      const { data: zoneData } = await supabase
        .from('members')
        .select('geographic_zone');

      const zoneCounts: Record<string, number> = {};
      zoneData?.forEach((m: { geographic_zone: string }) => {
        const zone = m.geographic_zone || 'Non défini';
        zoneCounts[zone] = (zoneCounts[zone] || 0) + 1;
      });
      const membersByZone = Object.entries(zoneCounts).map(([zone, count]) => ({ zone, count }));

      // Contributions by month (last 6 months)
      const contributionsByMonth: { month: string; amount: number }[] = [];
      const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
      
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        
        const { data } = await supabase
          .from('contributions')
          .select('amount')
          .eq('status', 'payee')
          .eq('period_month', month)
          .eq('period_year', year);

        const amount = data?.reduce((sum, c) => sum + (c.amount || 0), 0) || 0;
        contributionsByMonth.push({ month: months[date.getMonth()], amount });
      }

      return {
        totalMembers: totalMembers || 0,
        activeMembers: activeMembers || 0,
        totalContributions: totalContributions || 0,
        pendingContributions: pendingContributions || 0,
        monthlyRevenue,
        membersByFamily,
        membersByZone,
        contributionsByMonth,
      };
    },
  });
}
