import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AdminStats {
  pending_deposits: number;
  pending_withdrawals: number;
  active_sessions: number;
  new_users_today: number;
  total_revenue_today: number;
  pending_bonus_requests: number;
}

interface RecentActivity {
  id: string;
  user_id: string;
  action_type: string;
  action_details: any;
  amount?: number;
  created_at: string;
  user_name?: string;
  user_email?: string;
}

export const useRealTimeAdminData = () => {
  const [stats, setStats] = useState<AdminStats>({
    pending_deposits: 0,
    pending_withdrawals: 0,
    active_sessions: 0,
    new_users_today: 0,
    total_revenue_today: 0,
    pending_bonus_requests: 0
  });

  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [pendingDeposits, setPendingDeposits] = useState<any[]>([]);
  const [pendingWithdrawals, setPendingWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch initial data
  const fetchStats = async () => {
    try {
      // Get pending deposits count (payments)
      const { count: depositsCount } = await supabase
        .from('payments')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // Get pending withdrawals count
      const { count: withdrawalsCount } = await supabase
        .from('withdrawals')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // Get active game sessions count
      const { count: sessionsCount } = await supabase
        .from('game_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      // Get new users today
      const today = new Date().toISOString().split('T')[0];
      const { count: newUsersCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today + 'T00:00:00.000Z');

      // Get today's confirmed deposits sum
      const { data: revenueData } = await supabase
        .from('payments')
        .select('amount')
        .eq('status', 'completed')
        .gte('created_at', today + 'T00:00:00.000Z');

      const totalRevenue = revenueData?.reduce((sum, dep) => sum + (dep.amount || 0), 0) || 0;

      // Get pending bonus requests count
      const { count: bonusRequestsCount } = await supabase
        .from('bonus_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      setStats({
        pending_deposits: depositsCount || 0,
        pending_withdrawals: withdrawalsCount || 0,
        active_sessions: sessionsCount || 0,
        new_users_today: newUsersCount || 0,
        total_revenue_today: totalRevenue,
        pending_bonus_requests: bonusRequestsCount || 0
      });

    } catch (error) {
      console.error('Error fetching admin stats:', error);
    }
  };

  const fetchRecentActivities = async () => {
    try {
      // Get recent activities with user information
      const { data } = await supabase
        .from('user_behavior_logs')
        .select(`
          id,
          user_id,
          action_type,
          metadata,
          amount,
          created_at
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      if (data) {
        // Get user profiles separately to avoid foreign key issues
        const userIds = [...new Set(data.map(activity => activity.user_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, first_name, last_name')
          .in('id', userIds);

        const profilesMap = profiles?.reduce((map, profile) => {
          map[profile.id] = profile;
          return map;
        }, {} as Record<string, any>) || {};

        const activities = data.map(activity => {
          const profile = profilesMap[activity.user_id];
          const metadata = activity.metadata as any;
          return {
            id: activity.id,
            user_id: activity.user_id,
            action_type: activity.action_type,
            action_details: metadata,
            amount: activity.amount || (metadata && typeof metadata === 'object' ? metadata.amount : null),
            created_at: activity.created_at,
            user_name: profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : 'Bilinmeyen Kullanıcı'
          };
        });

        setRecentActivities(activities);
      }
    } catch (error) {
      console.error('Error fetching recent activities:', error);
    }
  };

  const fetchPendingDeposits = async () => {
    try {
      // Step 1: fetch payments
      const { data: rows, error } = await supabase
        .from('payments')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(10);
      if (error) throw error;

      // Step 2: fetch users for those payments
      const userIds = [...new Set((rows || []).map(r => r.user_id).filter(Boolean))];
      let usersMap: Record<string, any> = {};
      if (userIds.length) {
        const { data: users } = await supabase
          .from('users')
          .select('id, first_name, last_name, email')
          .in('id', userIds);
        usersMap = (users || []).reduce((acc: Record<string, any>, u: any) => {
          acc[u.id] = u; return acc;
        }, {});
      }

      const combined = (rows || []).map(r => ({
        ...r,
        profiles: usersMap[r.user_id]
          ? {
              first_name: usersMap[r.user_id].first_name,
              last_name: usersMap[r.user_id].last_name,
              email: usersMap[r.user_id].email,
            }
          : null,
      }));

      setPendingDeposits(combined);
    } catch (error) {
      console.error('Error fetching pending deposits:', error);
    }
  };

  const fetchPendingWithdrawals = async () => {
    try {
      // Step 1: fetch withdrawals
      const { data: rows, error } = await supabase
        .from('withdrawals')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(10);
      if (error) throw error;

      // Step 2: fetch users
      const userIds = [...new Set((rows || []).map(r => r.user_id).filter(Boolean))];
      let usersMap: Record<string, any> = {};
      if (userIds.length) {
        const { data: users } = await supabase
          .from('users')
          .select('id, first_name, last_name, email')
          .in('id', userIds);
        usersMap = (users || []).reduce((acc: Record<string, any>, u: any) => {
          acc[u.id] = u; return acc;
        }, {});
      }

      const combined = (rows || []).map(r => ({
        ...r,
        profiles: usersMap[r.user_id]
          ? {
              first_name: usersMap[r.user_id].first_name,
              last_name: usersMap[r.user_id].last_name,
              email: usersMap[r.user_id].email,
            }
          : null,
      }));

      setPendingWithdrawals(combined);
    } catch (error) {
      console.error('Error fetching pending withdrawals:', error);
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      await Promise.all([
        fetchStats(),
        fetchRecentActivities(),
        fetchPendingDeposits(),
        fetchPendingWithdrawals()
      ]);
      setLoading(false);
    };

    initializeData();

    // Set up real-time subscriptions
    const depositChannel = supabase
      .channel('payments_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payments'
        },
        () => {
          fetchStats();
          fetchPendingDeposits();
          fetchRecentActivities();
        }
      )
      .subscribe();

    const withdrawalChannel = supabase
      .channel('withdrawals_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'withdrawals'
        },
        () => {
          fetchStats();
          fetchPendingWithdrawals();
          fetchRecentActivities();
        }
      )
      .subscribe();

    const gameSessionChannel = supabase
      .channel('game_sessions_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_sessions'
        },
        () => {
          fetchStats();
          fetchRecentActivities();
        }
      )
      .subscribe();

    const behaviorLogsChannel = supabase
      .channel('behavior_logs_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_behavior_logs'
        },
        () => {
          fetchRecentActivities();
        }
      )
      .subscribe();

    const bonusRequestsChannel = supabase
      .channel('bonus_requests_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bonus_requests'
        },
        () => {
          fetchStats();
          fetchRecentActivities();
        }
      )
      .subscribe();

    const profilesChannel = supabase
      .channel('profiles_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'profiles'
        },
        () => {
          fetchStats();
        }
      )
      .subscribe();

    // Refresh stats every 30 seconds
    const statsInterval = setInterval(fetchStats, 30000);

    return () => {
      supabase.removeChannel(depositChannel);
      supabase.removeChannel(withdrawalChannel);
      supabase.removeChannel(gameSessionChannel);
      supabase.removeChannel(behaviorLogsChannel);
      supabase.removeChannel(bonusRequestsChannel);
      supabase.removeChannel(profilesChannel);
      clearInterval(statsInterval);
    };
  }, []);

  return {
    stats,
    recentActivities,
    pendingDeposits,
    pendingWithdrawals,
    loading,
    refreshData: () => {
      fetchStats();
      fetchRecentActivities();
      fetchPendingDeposits();
      fetchPendingWithdrawals();
    }
  };
};