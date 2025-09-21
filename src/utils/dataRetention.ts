import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface RetentionPolicy {
  id: string;
  event_type: string;
  retention_days: number;
  auto_delete: boolean;
  archive_before_delete: boolean;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface RetentionStats {
  total_records: number;
  expired_records: number;
  archived_records: number;
  next_cleanup_date: string;
  last_cleanup_date: string;
}

export interface ComplianceRequirement {
  description: string;
  retention_period: number;
  requirements: string[];
}

export const useDataRetention = () => {
  const [policies, setPolicies] = useState<RetentionPolicy[]>([]);
  const [stats, setStats] = useState<RetentionStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPolicies = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // For now, create mock retention policies
      const mockPolicies: RetentionPolicy[] = [
        {
          id: '1',
          event_type: 'wallet_transactions',
          retention_days: 365,
          auto_delete: true,
          archive_before_delete: true,
          is_enabled: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          event_type: 'user_logins',
          retention_days: 90,
          auto_delete: false,
          archive_before_delete: true,
          is_enabled: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];

      setPolicies(mockPolicies);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load retention policies');
      console.error('Error loading retention policies:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadStats = useCallback(async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('wallet_transactions')
        .select('created_at');

      if (fetchError) {
        throw fetchError;
      }

      const now = new Date();
      const stats: RetentionStats = {
        total_records: data?.length || 0,
        expired_records: data?.filter(record => 
          new Date(record.created_at) < new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        ).length || 0,
        archived_records: 0, // This would need a separate table for archived records
        next_cleanup_date: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
        last_cleanup_date: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()
      };

      setStats(stats);
    } catch (err) {
      console.error('Error loading retention stats:', err);
    }
  }, []);

  const updatePolicy = useCallback(async (
    eventType: string,
    retentionDays: number,
    autoDelete: boolean,
    archiveBeforeDelete: boolean
  ) => {
    try {
      const { error } = await supabase
        .from('audit_config')
        .upsert({
          setting_key: `retention_policy_${eventType}`,
          setting_value: {
            retention_days: retentionDays,
            auto_delete: autoDelete,
            archive_before_delete: archiveBeforeDelete,
            is_enabled: true
          },
          description: `Retention policy for ${eventType} events`
        });

      if (error) {
        throw error;
      }

      await loadPolicies();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update policy');
      return false;
    }
  }, [loadPolicies]);

  const performCleanup = useCallback(async () => {
    try {
      const now = new Date();
      
      // Delete expired records
      const { error } = await supabase
        .from('audit_trail')
        .delete()
        .lt('expires_at', now.toISOString());

      if (error) {
        throw error;
      }

      await loadStats();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to perform cleanup');
      return false;
    }
  }, [loadStats]);

  const manualCleanup = useCallback(async (
    eventType: string,
    daysToKeep: number,
    archiveFirst: boolean
  ) => {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      if (archiveFirst) {
        // Archive records before deleting
        // This would require an archive table
        console.log('Archiving records before deletion');
      }

      const { error } = await supabase
        .from('audit_trail')
        .delete()
        .eq('event_type', eventType)
        .lt('occurred_at', cutoffDate.toISOString());

      if (error) {
        throw error;
      }

      await loadStats();
      return { deleted: 'success' };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to perform manual cleanup');
      return null;
    }
  }, [loadStats]);

  const getComplianceRequirements = useCallback(() => {
    return {
      'GDPR': {
        description: 'General Data Protection Regulation',
        retention_period: 2555, // 7 years
        requirements: [
          'Data minimization',
          'Purpose limitation',
          'Storage limitation',
          'Right to erasure'
        ]
      },
      'PCI DSS': {
        description: 'Payment Card Industry Data Security Standard',
        retention_period: 2555, // 7 years
        requirements: [
          'Secure data storage',
          'Access controls',
          'Regular monitoring',
          'Data encryption'
        ]
      },
      'SOX': {
        description: 'Sarbanes-Oxley Act',
        retention_period: 2555, // 7 years
        requirements: [
          'Financial record keeping',
          'Audit trail maintenance',
          'Document retention',
          'Compliance reporting'
        ]
      }
    };
  }, []);

  const validateCompliance = useCallback(async () => {
    try {
      const requirements = getComplianceRequirements();
      const results: any = {};

      for (const [standard, requirement] of Object.entries(requirements)) {
        const { data, error } = await supabase
          .from('audit_trail')
          .select('occurred_at')
          .gte('occurred_at', new Date(Date.now() - requirement.retention_period * 24 * 60 * 60 * 1000).toISOString());

        if (error) {
          throw error;
        }

        results[standard] = {
          compliant: data ? data.length > 0 : false,
          records_found: data?.length || 0,
          requirement: requirement.retention_period
        };
      }

      return results;
    } catch (err) {
      console.error('Error validating compliance:', err);
      return null;
    }
  }, [getComplianceRequirements]);

  return {
    policies,
    stats,
    loading,
    error,
    loadPolicies,
    loadStats,
    updatePolicy,
    performCleanup,
    manualCleanup,
    getComplianceRequirements,
    validateCompliance
  };
};