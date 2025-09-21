import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Audit event types
export type AuditEventType = 
  | 'user_login' | 'user_logout' | 'user_registration' | 'user_profile_update'
  | 'password_change' | 'password_reset' | 'email_change' | 'phone_change'
  | 'deposit' | 'withdrawal' | 'bet_placed' | 'bet_won' | 'bet_lost'
  | 'bonus_granted' | 'bonus_used' | 'bonus_expired' | 'bonus_cancelled'
  | 'game_session_start' | 'game_session_end' | 'game_launch' | 'game_close'
  | 'admin_login' | 'admin_logout' | 'admin_action' | 'admin_permission_change'
  | 'system_config_change' | 'system_maintenance' | 'system_error' | 'system_warning'
  | 'security_event' | 'fraud_detection' | 'risk_assessment' | 'compliance_check'
  | 'data_export' | 'data_import' | 'data_deletion' | 'data_modification'
  | 'api_access' | 'api_error' | 'rate_limit_exceeded' | 'suspicious_activity'
  | 'payment_processed' | 'payment_failed' | 'payment_refunded' | 'payment_disputed'
  | 'kyc_submitted' | 'kyc_approved' | 'kyc_rejected' | 'kyc_expired'
  | 'account_suspended' | 'account_activated' | 'account_deleted' | 'account_restored'
  | 'notification_sent' | 'notification_failed' | 'email_sent' | 'sms_sent'
  | 'file_uploaded' | 'file_downloaded' | 'file_deleted' | 'file_modified'
  | 'session_created' | 'session_expired' | 'session_terminated' | 'session_hijacked'
  | 'database_backup' | 'database_restore' | 'database_migration' | 'database_maintenance';

export type AuditSeverity = 'low' | 'medium' | 'high' | 'critical';
export type AuditStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
export type ActorType = 'user' | 'admin' | 'system' | 'api' | 'bot' | 'external';

export interface AuditTrailEntry {
  id?: string;
  event_type: AuditEventType;
  event_id?: string;
  correlation_id?: string;
  actor_type: ActorType;
  actor_id?: string;
  actor_email?: string;
  actor_ip_address?: string;
  actor_user_agent?: string;
  actor_device_fingerprint?: string;
  actor_session_id?: string;
  target_type?: string;
  target_id?: string;
  target_name?: string;
  action: string;
  description: string;
  old_values?: any;
  new_values?: any;
  metadata?: any;
  severity?: AuditSeverity;
  status?: AuditStatus;
  risk_score?: number;
  compliance_flags?: string[];
  security_flags?: string[];
  country_code?: string;
  region?: string;
  city?: string;
  timezone?: string;
  occurred_at?: string;
  processed_at?: string;
  expires_at?: string;
}

export interface AuditTrailFilter {
  event_type?: AuditEventType;
  actor_type?: ActorType;
  actor_id?: string;
  target_type?: string;
  target_id?: string;
  severity?: AuditSeverity;
  status?: AuditStatus;
  start_date?: string;
  end_date?: string;
  risk_score_min?: number;
  risk_score_max?: number;
  country_code?: string;
  limit?: number;
  offset?: number;
}

export interface AuditTrailSummary {
  event_type: AuditEventType;
  total_count: number;
  unique_actors: number;
  high_risk_count: number;
  critical_count: number;
  avg_risk_score: number;
}

export interface AuditReport {
  id: string;
  report_type: string;
  report_name: string;
  report_period_start: string;
  report_period_end: string;
  filters: any;
  generated_by: string;
  file_path?: string;
  file_size?: number;
  download_count: number;
  expires_at?: string;
  created_at: string;
}

export const useAuditTrail = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Log audit event
  const logAuditEvent = useCallback(async (entry: AuditTrailEntry): Promise<string | null> => {
    try {
      setLoading(true);
      setError(null);

      // Get current user context
      const { data: { user } } = await supabase.auth.getUser();
      
      // Get client information
      const clientInfo = {
        ip_address: await getClientIP(),
        user_agent: navigator.userAgent,
        device_fingerprint: await generateDeviceFingerprint(),
        session_id: getSessionId(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        country_code: await getCountryCode()
      };

      // Prepare audit entry
      const auditEntry: AuditTrailEntry = {
        ...entry,
        actor_id: entry.actor_id || user?.id,
        actor_email: entry.actor_email || user?.email,
        actor_ip_address: entry.actor_ip_address || clientInfo.ip_address,
        actor_user_agent: entry.actor_user_agent || clientInfo.user_agent,
        actor_device_fingerprint: entry.actor_device_fingerprint || clientInfo.device_fingerprint,
        actor_session_id: entry.actor_session_id || clientInfo.session_id,
        timezone: entry.timezone || clientInfo.timezone,
        country_code: entry.country_code || clientInfo.country_code,
        occurred_at: entry.occurred_at || new Date().toISOString(),
        status: entry.status || 'completed',
        severity: entry.severity || 'medium',
        risk_score: entry.risk_score || 0,
        compliance_flags: entry.compliance_flags || [],
        security_flags: entry.security_flags || [],
        metadata: {
          ...entry.metadata,
          client_info: clientInfo,
          timestamp: Date.now()
        }
      };

      // Insert audit record
      const { data, error: insertError } = await supabase
        .from('audit_trail')
        .insert(auditEntry)
        .select('id')
        .single();

      if (insertError) {
        throw insertError;
      }

      return data?.id || null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Error logging audit event:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get audit trail entries
  const getAuditTrail = useCallback(async (filter: AuditTrailFilter = {}): Promise<AuditTrailEntry[]> => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('audit_trail')
        .select('*')
        .order('occurred_at', { ascending: false });

      // Apply filters
      if (filter.event_type) {
        query = query.eq('event_type', filter.event_type);
      }
      if (filter.actor_type) {
        query = query.eq('actor_type', filter.actor_type);
      }
      if (filter.actor_id) {
        query = query.eq('actor_id', filter.actor_id);
      }
      if (filter.target_type) {
        query = query.eq('target_type', filter.target_type);
      }
      if (filter.target_id) {
        query = query.eq('target_id', filter.target_id);
      }
      if (filter.severity) {
        query = query.eq('severity', filter.severity);
      }
      if (filter.status) {
        query = query.eq('status', filter.status);
      }
      if (filter.start_date) {
        query = query.gte('occurred_at', filter.start_date);
      }
      if (filter.end_date) {
        query = query.lte('occurred_at', filter.end_date);
      }
      if (filter.risk_score_min !== undefined) {
        query = query.gte('risk_score', filter.risk_score_min);
      }
      if (filter.risk_score_max !== undefined) {
        query = query.lte('risk_score', filter.risk_score_max);
      }
      if (filter.country_code) {
        query = query.eq('country_code', filter.country_code);
      }
      if (filter.limit) {
        query = query.limit(filter.limit);
      }
      if (filter.offset) {
        query = query.range(filter.offset, filter.offset + (filter.limit || 50) - 1);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        throw fetchError;
      }

      return data || [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Error fetching audit trail:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Get audit trail summary
  const getAuditSummary = useCallback(async (
    startDate?: string,
    endDate?: string
  ): Promise<AuditTrailSummary[]> => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: summaryError } = await supabase
        .rpc('get_audit_summary', {
          p_start_date: startDate || new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          p_end_date: endDate || new Date().toISOString()
        });

      if (summaryError) {
        throw summaryError;
      }

      return data || [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Error fetching audit summary:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Generate audit report
  const generateAuditReport = useCallback(async (
    reportType: string,
    startDate: string,
    endDate: string,
    filters: any = {},
    generatedBy?: string
  ): Promise<string | null> => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: reportError } = await supabase
        .rpc('generate_audit_report', {
          p_report_type: reportType,
          p_start_date: startDate,
          p_end_date: endDate,
          p_filters: filters,
          p_generated_by: generatedBy
        });

      if (reportError) {
        throw reportError;
      }

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Error generating audit report:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get audit reports
  const getAuditReports = useCallback(async (): Promise<AuditReport[]> => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: reportsError } = await supabase
        .from('audit_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (reportsError) {
        throw reportsError;
      }

      return data || [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Error fetching audit reports:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Clean up expired audit records
  const cleanupExpiredRecords = useCallback(async (): Promise<number> => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: cleanupError } = await supabase
        .rpc('cleanup_expired_audit_records');

      if (cleanupError) {
        throw cleanupError;
      }

      return data || 0;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Error cleaning up expired records:', err);
      return 0;
    } finally {
      setLoading(false);
    }
  }, []);

  // Helper functions
  const getClientIP = async (): Promise<string> => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return 'unknown';
    }
  };

  const generateDeviceFingerprint = async (): Promise<string> => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('Device fingerprint', 2, 2);
    }
    
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      canvas.toDataURL()
    ].join('|');
    
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    return Math.abs(hash).toString(36);
  };

  const getSessionId = (): string => {
    let sessionId = sessionStorage.getItem('session_id');
    if (!sessionId) {
      sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('session_id', sessionId);
    }
    return sessionId;
  };

  const getCountryCode = async (): Promise<string> => {
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      return data.country_code || 'unknown';
    } catch {
      return 'unknown';
    }
  };

  // Predefined audit event creators
  const createUserLoginEvent = useCallback((userId: string, email: string, metadata?: any) => {
    return logAuditEvent({
      event_type: 'user_login',
      actor_type: 'user',
      actor_id: userId,
      actor_email: email,
      action: 'LOGIN',
      description: `User ${email} logged in successfully`,
      severity: 'low',
      metadata: metadata
    });
  }, [logAuditEvent]);

  const createUserLogoutEvent = useCallback((userId: string, email: string, metadata?: any) => {
    return logAuditEvent({
      event_type: 'user_logout',
      actor_type: 'user',
      actor_id: userId,
      actor_email: email,
      action: 'LOGOUT',
      description: `User ${email} logged out`,
      severity: 'low',
      metadata: metadata
    });
  }, [logAuditEvent]);

  const createDepositEvent = useCallback((userId: string, amount: number, currency: string, method: string, metadata?: any) => {
    return logAuditEvent({
      event_type: 'deposit',
      actor_type: 'user',
      actor_id: userId,
      action: 'CREATE',
      description: `Deposit of ${amount} ${currency} via ${method}`,
      target_type: 'payment',
      new_values: { amount, currency, method },
      severity: 'medium',
      risk_score: amount > 10000 ? 70 : 30,
      metadata: metadata
    });
  }, [logAuditEvent]);

  const createWithdrawalEvent = useCallback((userId: string, amount: number, currency: string, method: string, metadata?: any) => {
    return logAuditEvent({
      event_type: 'withdrawal',
      actor_type: 'user',
      actor_id: userId,
      action: 'CREATE',
      description: `Withdrawal request of ${amount} ${currency} via ${method}`,
      target_type: 'withdrawal',
      new_values: { amount, currency, method },
      severity: 'high',
      risk_score: amount > 5000 ? 80 : 50,
      metadata: metadata
    });
  }, [logAuditEvent]);

  const createAdminActionEvent = useCallback((adminId: string, action: string, targetType: string, targetId: string, description: string, metadata?: any) => {
    return logAuditEvent({
      event_type: 'admin_action',
      actor_type: 'admin',
      actor_id: adminId,
      action: action,
      description: description,
      target_type: targetType,
      target_id: targetId,
      severity: 'medium',
      metadata: metadata
    });
  }, [logAuditEvent]);

  const createSecurityEvent = useCallback((eventType: AuditEventType, description: string, severity: AuditSeverity, riskScore: number, metadata?: any) => {
    return logAuditEvent({
      event_type: eventType,
      actor_type: 'system',
      action: 'DETECT',
      description: description,
      severity: severity,
      risk_score: riskScore,
      metadata: metadata
    });
  }, [logAuditEvent]);

  return {
    // State
    loading,
    error,
    
    // Core functions
    logAuditEvent,
    getAuditTrail,
    getAuditSummary,
    generateAuditReport,
    getAuditReports,
    cleanupExpiredRecords,
    
    // Predefined event creators
    createUserLoginEvent,
    createUserLogoutEvent,
    createDepositEvent,
    createWithdrawalEvent,
    createAdminActionEvent,
    createSecurityEvent,
    
    // Helper functions
    getClientIP,
    generateDeviceFingerprint,
    getSessionId,
    getCountryCode
  };
};
