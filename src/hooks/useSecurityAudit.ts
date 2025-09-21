import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SecurityEvent {
  id: string;
  event_type: string;
  actor_id: string;
  actor_email?: string;
  ip_address: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  risk_score: number;
  status: 'success' | 'failure' | 'pending' | 'info' | 'warning';
  occurred_at: string;
  metadata?: any;
}

export interface SecurityMetrics {
  total_events: number;
  critical_events: number;
  high_risk_events: number;
  risk_score_avg: number;
  events_last_24h: number;
  unique_actors: number;
}

export const useSecurityAudit = () => {
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [securityMetrics, setSecurityMetrics] = useState<SecurityMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSecurityEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // For now, use wallet_transactions to simulate security events
      const { data, error: fetchError } = await supabase
        .from('wallet_transactions')
        .select(`
          id,
          user_id,
          type,
          amount,
          currency,
          status,
          created_at,
          description
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (fetchError) {
        throw fetchError;
      }

      // Transform data to SecurityEvent format
      const events: SecurityEvent[] = (data || []).map(transaction => ({
        id: transaction.id,
        event_type: transaction.type === 'deposit' ? 'deposit_initiated' : 'withdrawal_initiated',
        actor_id: transaction.user_id || 'unknown',
        actor_email: 'user@example.com',
        ip_address: '0.0.0.0',
        description: `${transaction.type} of ${transaction.amount} ${transaction.currency}`,
        severity: transaction.status === 'pending' ? 'medium' : 'low',
        risk_score: calculateRiskScore(transaction),
        status: transaction.status === 'completed' ? 'success' : 'pending',
        occurred_at: transaction.created_at,
        metadata: { amount: transaction.amount, currency: transaction.currency }
      }));

      setSecurityEvents(events);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load security events');
      console.error('Error loading security events:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadSecurityMetrics = useCallback(async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('wallet_transactions')
        .select('status, created_at, user_id');

      if (fetchError) {
        throw fetchError;
      }

      const now = new Date();
      const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      const metrics: SecurityMetrics = {
        total_events: data?.length || 0,
        critical_events: data?.filter(e => e.status === 'failed').length || 0,
        high_risk_events: data?.filter(e => e.status === 'pending').length || 0,
        risk_score_avg: calculateAverageRiskScore(data || []),
        events_last_24h: data?.filter(e => new Date(e.created_at) > last24h).length || 0,
        unique_actors: new Set(data?.map(e => e.user_id)).size || 0
      };

      setSecurityMetrics(metrics);
    } catch (err) {
      console.error('Error loading security metrics:', err);
    }
  }, []);

  const calculateRiskScore = (transaction: any): number => {
    let score = 0;
    
    // Base score by status
    switch (transaction.status) {
      case 'failed': score += 90; break;
      case 'pending': score += 70; break;
      case 'completed': score += 30; break;
      default: score += 40;
    }

    // Additional risk factors
    if (transaction.type === 'withdrawal') score += 20;
    if (transaction.amount > 1000) score += 15;
    if (transaction.status === 'pending') score += 25;

    return Math.min(100, score);
  };

  const calculateAverageRiskScore = (events: any[]): number => {
    if (events.length === 0) return 0;
    
    const totalScore = events.reduce((sum, event) => {
      return sum + calculateRiskScore(event);
    }, 0);
    
    return Math.round(totalScore / events.length);
  };

  return {
    securityEvents,
    securityMetrics,
    loading,
    error,
    loadSecurityEvents,
    loadSecurityMetrics
  };
};