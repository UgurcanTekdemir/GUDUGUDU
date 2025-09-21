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
        .from('audit_trail')
        .select(`
          id,
          actor_id,
          actor_type,
          event_type,
          event_name,
          description,
          severity,
          status,
          occurred_at,
          metadata
        `)
        .order('occurred_at', { ascending: false })
        .limit(50);

      if (fetchError) {
        throw fetchError;
      }

      // Use data directly from audit_trail table
      const events: SecurityEvent[] = (data || []).map(auditLog => ({
        id: auditLog.id,
        event_type: auditLog.event_type,
        actor_id: auditLog.actor_id || 'unknown',
        actor_email: 'user@example.com',
        ip_address: '0.0.0.0',
        description: auditLog.description,
        severity: auditLog.severity,
        risk_score: calculateRiskScore(auditLog),
        status: auditLog.status,
        occurred_at: auditLog.occurred_at,
        metadata: auditLog.metadata
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

  const calculateRiskScore = (auditLog: any): number => {
    let score = 0;
    
    // Severity-based scoring
    switch (auditLog.severity) {
      case 'critical': score += 90; break;
      case 'high': score += 70; break;
      case 'medium': score += 50; break;
      case 'low': score += 30; break;
      default: score += 40;
    }
    
    // Status-based scoring
    switch (auditLog.status) {
      case 'failure': score += 20; break;
      case 'pending': score += 15; break;
      case 'success': score += 5; break;
      default: score += 10;
    }
    
    // Event type-based scoring
    if (auditLog.event_type?.includes('security')) score += 25;
    if (auditLog.event_type?.includes('fraud')) score += 30;
    
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