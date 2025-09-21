import { supabase } from '@/integrations/supabase/client';
import { AuditEventType, AuditSeverity, ActorType } from '@/hooks/useAuditTrail';

// Audit middleware for automatic event logging
export class AuditMiddleware {
  private static instance: AuditMiddleware;
  private eventQueue: Array<() => Promise<void>> = [];
  private isProcessing = false;
  private batchSize = 10;
  private processingInterval = 1000; // 1 second

  private constructor() {
    this.startBatchProcessor();
  }

  public static getInstance(): AuditMiddleware {
    if (!AuditMiddleware.instance) {
      AuditMiddleware.instance = new AuditMiddleware();
    }
    return AuditMiddleware.instance;
  }

  // Start batch processor for queued events
  private startBatchProcessor(): void {
    setInterval(async () => {
      if (!this.isProcessing && this.eventQueue.length > 0) {
        await this.processBatch();
      }
    }, this.processingInterval);
  }

  // Process batch of events
  private async processBatch(): Promise<void> {
    this.isProcessing = true;
    const batch = this.eventQueue.splice(0, this.batchSize);
    
    try {
      await Promise.allSettled(batch.map(event => event()));
    } catch (error) {
      console.error('Error processing audit batch:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  // Log audit event (queued for batch processing)
  public async logEvent(eventData: {
    event_type: AuditEventType;
    actor_type: ActorType;
    actor_id?: string;
    actor_email?: string;
    action: string;
    description: string;
    target_type?: string;
    target_id?: string;
    target_name?: string;
    old_values?: any;
    new_values?: any;
    metadata?: any;
    severity?: AuditSeverity;
    risk_score?: number;
    compliance_flags?: string[];
    security_flags?: string[];
  }): Promise<void> {
    const event = async () => {
      try {
        await this.insertAuditEvent(eventData);
      } catch (error) {
        console.error('Error logging audit event:', error);
      }
    };

    this.eventQueue.push(event);
  }

  // Insert audit event directly to database
  private async insertAuditEvent(eventData: any): Promise<void> {
    const clientInfo = await this.getClientInfo();
    
    const auditEntry = {
      ...eventData,
      actor_ip_address: clientInfo.ip_address,
      actor_user_agent: clientInfo.user_agent,
      actor_device_fingerprint: clientInfo.device_fingerprint,
      actor_session_id: clientInfo.session_id,
      timezone: clientInfo.timezone,
      country_code: clientInfo.country_code,
      occurred_at: new Date().toISOString(),
      status: 'completed',
      severity: eventData.severity || 'medium',
      risk_score: eventData.risk_score || 0,
      compliance_flags: eventData.compliance_flags || [],
      security_flags: eventData.security_flags || [],
      metadata: {
        ...eventData.metadata,
        client_info: clientInfo,
        timestamp: Date.now()
      }
    };

    const { error } = await supabase
      .from('audit_trail')
      .insert(auditEntry);

    if (error) {
      throw error;
    }
  }

  // Get client information
  private async getClientInfo(): Promise<{
    ip_address: string;
    user_agent: string;
    device_fingerprint: string;
    session_id: string;
    timezone: string;
    country_code: string;
  }> {
    return {
      ip_address: await this.getClientIP(),
      user_agent: navigator.userAgent,
      device_fingerprint: await this.generateDeviceFingerprint(),
      session_id: this.getSessionId(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      country_code: await this.getCountryCode()
    };
  }

  private async getClientIP(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return 'unknown';
    }
  }

  private async generateDeviceFingerprint(): Promise<string> {
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
    
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    
    return Math.abs(hash).toString(36);
  }

  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('session_id');
    if (!sessionId) {
      sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('session_id', sessionId);
    }
    return sessionId;
  }

  private async getCountryCode(): Promise<string> {
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      return data.country_code || 'unknown';
    } catch {
      return 'unknown';
    }
  }
}

// Higher-order function to wrap API calls with audit logging
export function withAuditLogging<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  auditConfig: {
    event_type: AuditEventType;
    actor_type: ActorType;
    action: string;
    description: string;
    target_type?: string;
    getTargetId?: (...args: T) => string;
    getMetadata?: (...args: T) => any;
    severity?: AuditSeverity;
    risk_score?: number;
  }
) {
  return async (...args: T): Promise<R> => {
    const auditMiddleware = AuditMiddleware.getInstance();
    const startTime = Date.now();
    
    try {
      const result = await fn(...args);
      const duration = Date.now() - startTime;
      
      // Log successful operation
      await auditMiddleware.logEvent({
        event_type: auditConfig.event_type,
        actor_type: auditConfig.actor_type,
        action: auditConfig.action,
        description: auditConfig.description,
        target_type: auditConfig.target_type,
        target_id: auditConfig.getTargetId?.(...args),
        metadata: {
          ...auditConfig.getMetadata?.(...args),
          duration_ms: duration,
          success: true
        },
        severity: auditConfig.severity,
        risk_score: auditConfig.risk_score
      });
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      // Log failed operation
      await auditMiddleware.logEvent({
        event_type: auditConfig.event_type,
        actor_type: auditConfig.actor_type,
        action: auditConfig.action,
        description: `${auditConfig.description} - FAILED: ${error instanceof Error ? error.message : 'Unknown error'}`,
        target_type: auditConfig.target_type,
        target_id: auditConfig.getTargetId?.(...args),
        metadata: {
          ...auditConfig.getMetadata?.(...args),
          duration_ms: duration,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        },
        severity: 'high',
        risk_score: 80
      });
      
      throw error;
    }
  };
}

// Specific audit decorators for common operations
export const auditDecorators = {
  // User authentication
  userLogin: (userId: string, email: string) => 
    withAuditLogging(
      async () => {},
      {
        event_type: 'user_login',
        actor_type: 'user',
        action: 'LOGIN',
        description: `User ${email} logged in`,
        target_type: 'user',
        getTargetId: () => userId,
        getMetadata: () => ({ email }),
        severity: 'low'
      }
    ),

  userLogout: (userId: string, email: string) =>
    withAuditLogging(
      async () => {},
      {
        event_type: 'user_logout',
        actor_type: 'user',
        action: 'LOGOUT',
        description: `User ${email} logged out`,
        target_type: 'user',
        getTargetId: () => userId,
        getMetadata: () => ({ email }),
        severity: 'low'
      }
    ),

  // Financial operations
  deposit: (userId: string, amount: number, currency: string, method: string) =>
    withAuditLogging(
      async () => {},
      {
        event_type: 'deposit',
        actor_type: 'user',
        action: 'CREATE',
        description: `Deposit of ${amount} ${currency} via ${method}`,
        target_type: 'payment',
        getTargetId: () => userId,
        getMetadata: () => ({ amount, currency, method }),
        severity: 'medium',
        risk_score: amount > 10000 ? 70 : 30
      }
    ),

  withdrawal: (userId: string, amount: number, currency: string, method: string) =>
    withAuditLogging(
      async () => {},
      {
        event_type: 'withdrawal',
        actor_type: 'user',
        action: 'CREATE',
        description: `Withdrawal request of ${amount} ${currency} via ${method}`,
        target_type: 'withdrawal',
        getTargetId: () => userId,
        getMetadata: () => ({ amount, currency, method }),
        severity: 'high',
        risk_score: amount > 5000 ? 80 : 50
      }
    ),

  // Admin operations
  adminAction: (adminId: string, action: string, targetType: string, targetId: string, description: string) =>
    withAuditLogging(
      async () => {},
      {
        event_type: 'admin_action',
        actor_type: 'admin',
        action: action,
        description: description,
        target_type: targetType,
        getTargetId: () => targetId,
        getMetadata: () => ({ admin_id: adminId }),
        severity: 'medium'
      }
    ),

  // Security events
  securityEvent: (eventType: AuditEventType, description: string, severity: AuditSeverity, riskScore: number) =>
    withAuditLogging(
      async () => {},
      {
        event_type: eventType,
        actor_type: 'system',
        action: 'DETECT',
        description: description,
        severity: severity,
        risk_score: riskScore
      }
    ),

  // Data operations
  dataModification: (userId: string, targetType: string, targetId: string, oldValues: any, newValues: any) =>
    withAuditLogging(
      async () => {},
      {
        event_type: 'data_modification',
        actor_type: 'user',
        action: 'UPDATE',
        description: `Modified ${targetType} record`,
        target_type: targetType,
        getTargetId: () => targetId,
        getMetadata: () => ({ user_id: userId }),
        severity: 'medium'
      }
    ),

  dataDeletion: (userId: string, targetType: string, targetId: string) =>
    withAuditLogging(
      async () => {},
      {
        event_type: 'data_deletion',
        actor_type: 'user',
        action: 'DELETE',
        description: `Deleted ${targetType} record`,
        target_type: targetType,
        getTargetId: () => targetId,
        getMetadata: () => ({ user_id: userId }),
        severity: 'high',
        risk_score: 70
      }
    )
};

// React hook for audit middleware
export const useAuditMiddleware = () => {
  const auditMiddleware = AuditMiddleware.getInstance();

  const logEvent = async (eventData: {
    event_type: AuditEventType;
    actor_type: ActorType;
    actor_id?: string;
    actor_email?: string;
    action: string;
    description: string;
    target_type?: string;
    target_id?: string;
    target_name?: string;
    old_values?: any;
    new_values?: any;
    metadata?: any;
    severity?: AuditSeverity;
    risk_score?: number;
    compliance_flags?: string[];
    security_flags?: string[];
  }) => {
    await auditMiddleware.logEvent(eventData);
  };

  return {
    logEvent,
    auditDecorators
  };
};

// Export singleton instance
export const auditMiddleware = AuditMiddleware.getInstance();
