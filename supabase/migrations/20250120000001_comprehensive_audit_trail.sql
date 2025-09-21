-- Comprehensive Audit Trail System Migration
-- This migration creates a complete audit trail system for compliance and security

-- Create audit event types enum
DO $$ BEGIN
    CREATE TYPE audit_event_type AS ENUM (
        'user_login', 'user_logout', 'user_registration', 'user_profile_update',
        'password_change', 'password_reset', 'email_change', 'phone_change',
        'deposit', 'withdrawal', 'bet_placed', 'bet_won', 'bet_lost',
        'bonus_granted', 'bonus_used', 'bonus_expired', 'bonus_cancelled',
        'game_session_start', 'game_session_end', 'game_launch', 'game_close',
        'admin_login', 'admin_logout', 'admin_action', 'admin_permission_change',
        'system_config_change', 'system_maintenance', 'system_error', 'system_warning',
        'security_event', 'fraud_detection', 'risk_assessment', 'compliance_check',
        'data_export', 'data_import', 'data_deletion', 'data_modification',
        'api_access', 'api_error', 'rate_limit_exceeded', 'suspicious_activity',
        'payment_processed', 'payment_failed', 'payment_refunded', 'payment_disputed',
        'kyc_submitted', 'kyc_approved', 'kyc_rejected', 'kyc_expired',
        'account_suspended', 'account_activated', 'account_deleted', 'account_restored',
        'notification_sent', 'notification_failed', 'email_sent', 'sms_sent',
        'file_uploaded', 'file_downloaded', 'file_deleted', 'file_modified',
        'session_created', 'session_expired', 'session_terminated', 'session_hijacked',
        'database_backup', 'database_restore', 'database_migration', 'database_maintenance'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create audit severity levels enum
DO $$ BEGIN
    CREATE TYPE audit_severity AS ENUM ('low', 'medium', 'high', 'critical');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create audit status enum
DO $$ BEGIN
    CREATE TYPE audit_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create comprehensive audit trail table
CREATE TABLE IF NOT EXISTS public.audit_trail (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Event identification
    event_type audit_event_type NOT NULL,
    event_id VARCHAR(255) UNIQUE, -- External event ID for correlation
    correlation_id UUID, -- For grouping related events
    
    -- Actor information (who performed the action)
    actor_type VARCHAR(50) NOT NULL CHECK (actor_type IN ('user', 'admin', 'system', 'api', 'bot', 'external')),
    actor_id UUID, -- User/Admin ID
    actor_email VARCHAR(255), -- Cached email for quick reference
    actor_ip_address INET,
    actor_user_agent TEXT,
    actor_device_fingerprint VARCHAR(255),
    actor_session_id VARCHAR(255),
    
    -- Target information (what was affected)
    target_type VARCHAR(100), -- Table or entity type
    target_id UUID, -- ID of the affected record
    target_name VARCHAR(255), -- Human-readable name
    
    -- Action details
    action VARCHAR(100) NOT NULL, -- CREATE, UPDATE, DELETE, READ, etc.
    description TEXT NOT NULL,
    old_values JSONB, -- Previous state (for updates)
    new_values JSONB, -- New state (for creates/updates)
    metadata JSONB DEFAULT '{}', -- Additional context
    
    -- Security and compliance
    severity audit_severity DEFAULT 'medium',
    status audit_status DEFAULT 'completed',
    risk_score INTEGER DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
    compliance_flags TEXT[] DEFAULT '{}',
    security_flags TEXT[] DEFAULT '{}',
    
    -- Location and context
    country_code VARCHAR(2),
    region VARCHAR(100),
    city VARCHAR(100),
    timezone VARCHAR(50),
    
    -- Timing
    occurred_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    processed_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE, -- For data retention
    
    -- Audit trail metadata
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    -- Indexes will be created separately for better performance
    CONSTRAINT audit_trail_actor_check CHECK (
        (actor_type = 'user' AND actor_id IS NOT NULL) OR
        (actor_type = 'admin' AND actor_id IS NOT NULL) OR
        (actor_type = 'system') OR
        (actor_type = 'api') OR
        (actor_type = 'bot') OR
        (actor_type = 'external')
    )
);

-- Create audit trail indexes for performance
CREATE INDEX IF NOT EXISTS idx_audit_trail_event_type ON public.audit_trail(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_trail_actor_type_id ON public.audit_trail(actor_type, actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_trail_target_type_id ON public.audit_trail(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_audit_trail_occurred_at ON public.audit_trail(occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_trail_correlation_id ON public.audit_trail(correlation_id);
CREATE INDEX IF NOT EXISTS idx_audit_trail_severity ON public.audit_trail(severity);
CREATE INDEX IF NOT EXISTS idx_audit_trail_status ON public.audit_trail(status);
CREATE INDEX IF NOT EXISTS idx_audit_trail_risk_score ON public.audit_trail(risk_score);
CREATE INDEX IF NOT EXISTS idx_audit_trail_actor_ip ON public.audit_trail(actor_ip_address);
CREATE INDEX IF NOT EXISTS idx_audit_trail_country ON public.audit_trail(country_code);
CREATE INDEX IF NOT EXISTS idx_audit_trail_expires_at ON public.audit_trail(expires_at);

-- Create audit trail partitions for better performance (monthly partitions)
-- This will be handled by a separate function

-- Create audit trail configuration table
CREATE TABLE IF NOT EXISTS public.audit_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type audit_event_type NOT NULL UNIQUE,
    is_enabled BOOLEAN DEFAULT true,
    retention_days INTEGER DEFAULT 2555, -- 7 years default
    severity_threshold audit_severity DEFAULT 'medium',
    auto_alert BOOLEAN DEFAULT false,
    alert_recipients TEXT[] DEFAULT '{}',
    custom_fields JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create audit trail alerts table
CREATE TABLE IF NOT EXISTS public.audit_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    audit_trail_id UUID NOT NULL REFERENCES public.audit_trail(id) ON DELETE CASCADE,
    alert_type VARCHAR(50) NOT NULL,
    severity audit_severity NOT NULL,
    message TEXT NOT NULL,
    recipients TEXT[] DEFAULT '{}',
    sent_at TIMESTAMP WITH TIME ZONE,
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    acknowledged_by UUID,
    resolution TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create audit trail reports table
CREATE TABLE IF NOT EXISTS public.audit_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_type VARCHAR(50) NOT NULL,
    report_name VARCHAR(255) NOT NULL,
    report_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    report_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    filters JSONB DEFAULT '{}',
    generated_by UUID NOT NULL,
    file_path TEXT,
    file_size BIGINT,
    download_count INTEGER DEFAULT 0,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create audit trail statistics table for performance monitoring
CREATE TABLE IF NOT EXISTS public.audit_statistics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,
    event_type audit_event_type NOT NULL,
    total_events INTEGER DEFAULT 0,
    successful_events INTEGER DEFAULT 0,
    failed_events INTEGER DEFAULT 0,
    avg_processing_time_ms INTEGER DEFAULT 0,
    max_processing_time_ms INTEGER DEFAULT 0,
    unique_actors INTEGER DEFAULT 0,
    unique_targets INTEGER DEFAULT 0,
    high_risk_events INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    UNIQUE(date, event_type)
);

-- Enable RLS on all audit tables
ALTER TABLE public.audit_trail ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_statistics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for audit trail
CREATE POLICY "Authenticated users can view audit trail"
ON public.audit_trail
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "System can insert audit trail"
ON public.audit_trail
FOR INSERT
WITH CHECK (true);

CREATE POLICY "System can update audit trail"
ON public.audit_trail
FOR UPDATE
USING (true);

-- RLS policies for audit config
CREATE POLICY "Admins can manage audit config"
ON public.audit_config
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.admins 
        WHERE id = auth.uid() 
        AND role_type IN ('super_admin', 'admin')
    )
);

-- RLS policies for audit alerts
CREATE POLICY "Authenticated users can view audit alerts"
ON public.audit_alerts
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "System can manage audit alerts"
ON public.audit_alerts
FOR ALL
WITH CHECK (true);

-- RLS policies for audit reports
CREATE POLICY "Admins can manage audit reports"
ON public.audit_reports
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.admins 
        WHERE id = auth.uid() 
        AND role_type IN ('super_admin', 'admin', 'auditor')
    )
);

-- RLS policies for audit statistics
CREATE POLICY "Admins can view audit statistics"
ON public.audit_statistics
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.admins 
        WHERE id = auth.uid() 
        AND role_type IN ('super_admin', 'admin', 'auditor')
    )
);

CREATE POLICY "System can manage audit statistics"
ON public.audit_statistics
FOR ALL
WITH CHECK (true);

-- Create function to automatically set expires_at based on event type
CREATE OR REPLACE FUNCTION set_audit_expiry()
RETURNS TRIGGER AS $$
BEGIN
    -- Set expiry date based on event type configuration
    SELECT expires_at INTO NEW.expires_at
    FROM (
        SELECT (occurred_at + INTERVAL '1 day' * retention_days) as expires_at
        FROM public.audit_config
        WHERE event_type = NEW.event_type
        AND is_enabled = true
    ) config;
    
    -- Default to 7 years if no config found
    IF NEW.expires_at IS NULL THEN
        NEW.expires_at = NEW.occurred_at + INTERVAL '7 years';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic expiry setting
CREATE TRIGGER set_audit_expiry_trigger
    BEFORE INSERT ON public.audit_trail
    FOR EACH ROW
    EXECUTE FUNCTION set_audit_expiry();

-- Create function to update audit statistics
CREATE OR REPLACE FUNCTION update_audit_statistics()
RETURNS TRIGGER AS $$
DECLARE
    processing_time_ms INTEGER;
BEGIN
    -- Calculate processing time if processed_at is set
    IF NEW.processed_at IS NOT NULL AND OLD.processed_at IS NULL THEN
        processing_time_ms := EXTRACT(EPOCH FROM (NEW.processed_at - NEW.occurred_at)) * 1000;
        
        -- Update statistics
        INSERT INTO public.audit_statistics (
            date, event_type, total_events, successful_events, 
            avg_processing_time_ms, max_processing_time_ms
        ) VALUES (
            DATE(NEW.occurred_at), NEW.event_type, 1, 1,
            processing_time_ms, processing_time_ms
        )
        ON CONFLICT (date, event_type) DO UPDATE SET
            total_events = audit_statistics.total_events + 1,
            successful_events = audit_statistics.successful_events + 1,
            avg_processing_time_ms = (
                (audit_statistics.avg_processing_time_ms * audit_statistics.total_events + processing_time_ms) 
                / (audit_statistics.total_events + 1)
            ),
            max_processing_time_ms = GREATEST(audit_statistics.max_processing_time_ms, processing_time_ms),
            updated_at = now();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for statistics update
CREATE TRIGGER update_audit_statistics_trigger
    AFTER UPDATE ON public.audit_trail
    FOR EACH ROW
    EXECUTE FUNCTION update_audit_statistics();

-- Create function to generate audit event ID
CREATE OR REPLACE FUNCTION generate_audit_event_id()
RETURNS TRIGGER AS $$
BEGIN
    -- Generate unique event ID if not provided
    IF NEW.event_id IS NULL THEN
        NEW.event_id := 'AUDIT_' || 
                       EXTRACT(EPOCH FROM NEW.occurred_at)::BIGINT || '_' ||
                       SUBSTRING(NEW.id::TEXT, 1, 8);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for event ID generation
CREATE TRIGGER generate_audit_event_id_trigger
    BEFORE INSERT ON public.audit_trail
    FOR EACH ROW
    EXECUTE FUNCTION generate_audit_event_id();

-- Create function to detect high-risk events
CREATE OR REPLACE FUNCTION detect_high_risk_events()
RETURNS TRIGGER AS $$
DECLARE
    risk_threshold INTEGER := 70;
BEGIN
    -- Check if this is a high-risk event
    IF NEW.risk_score >= risk_threshold THEN
        -- Create alert
        INSERT INTO public.audit_alerts (
            audit_trail_id, alert_type, severity, message, recipients
        ) VALUES (
            NEW.id, 'high_risk_event', NEW.severity,
            'High-risk audit event detected: ' || NEW.description,
            ARRAY['security@gudubet.com', 'admin@gudubet.com']
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for high-risk event detection
CREATE TRIGGER detect_high_risk_events_trigger
    AFTER INSERT ON public.audit_trail
    FOR EACH ROW
    EXECUTE FUNCTION detect_high_risk_events();

-- Insert default audit configuration
INSERT INTO public.audit_config (event_type, is_enabled, retention_days, severity_threshold, auto_alert) VALUES
-- User events
('user_login', true, 2555, 'low', false),
('user_logout', true, 2555, 'low', false),
('user_registration', true, 2555, 'medium', true),
('user_profile_update', true, 2555, 'low', false),
('password_change', true, 2555, 'medium', true),
('password_reset', true, 2555, 'medium', true),
('email_change', true, 2555, 'high', true),
('phone_change', true, 2555, 'high', true),

-- Financial events
('deposit', true, 2555, 'medium', true),
('withdrawal', true, 2555, 'high', true),
('payment_processed', true, 2555, 'medium', false),
('payment_failed', true, 2555, 'medium', true),
('payment_refunded', true, 2555, 'high', true),
('payment_disputed', true, 2555, 'critical', true),

-- Gaming events
('bet_placed', true, 2555, 'low', false),
('bet_won', true, 2555, 'low', false),
('bet_lost', true, 2555, 'low', false),
('game_session_start', true, 2555, 'low', false),
('game_session_end', true, 2555, 'low', false),
('game_launch', true, 2555, 'low', false),
('game_close', true, 2555, 'low', false),

-- Bonus events
('bonus_granted', true, 2555, 'medium', true),
('bonus_used', true, 2555, 'low', false),
('bonus_expired', true, 2555, 'low', false),
('bonus_cancelled', true, 2555, 'medium', true),

-- Admin events
('admin_login', true, 2555, 'medium', true),
('admin_logout', true, 2555, 'low', false),
('admin_action', true, 2555, 'medium', true),
('admin_permission_change', true, 2555, 'high', true),

-- System events
('system_config_change', true, 2555, 'high', true),
('system_maintenance', true, 2555, 'medium', true),
('system_error', true, 2555, 'high', true),
('system_warning', true, 2555, 'medium', true),

-- Security events
('security_event', true, 2555, 'high', true),
('fraud_detection', true, 2555, 'critical', true),
('risk_assessment', true, 2555, 'medium', true),
('compliance_check', true, 2555, 'medium', true),
('suspicious_activity', true, 2555, 'critical', true),

-- Data events
('data_export', true, 2555, 'high', true),
('data_import', true, 2555, 'high', true),
('data_deletion', true, 2555, 'critical', true),
('data_modification', true, 2555, 'medium', true),

-- API events
('api_access', true, 2555, 'low', false),
('api_error', true, 2555, 'medium', true),
('rate_limit_exceeded', true, 2555, 'medium', true),

-- KYC events
('kyc_submitted', true, 2555, 'medium', true),
('kyc_approved', true, 2555, 'medium', true),
('kyc_rejected', true, 2555, 'medium', true),
('kyc_expired', true, 2555, 'medium', true),

-- Account events
('account_suspended', true, 2555, 'high', true),
('account_activated', true, 2555, 'medium', true),
('account_deleted', true, 2555, 'critical', true),
('account_restored', true, 2555, 'high', true),

-- Communication events
('notification_sent', true, 2555, 'low', false),
('notification_failed', true, 2555, 'medium', true),
('email_sent', true, 2555, 'low', false),
('sms_sent', true, 2555, 'low', false),

-- File events
('file_uploaded', true, 2555, 'medium', true),
('file_downloaded', true, 2555, 'medium', true),
('file_deleted', true, 2555, 'high', true),
('file_modified', true, 2555, 'medium', true),

-- Session events
('session_created', true, 2555, 'low', false),
('session_expired', true, 2555, 'low', false),
('session_terminated', true, 2555, 'medium', true),
('session_hijacked', true, 2555, 'critical', true),

-- Database events
('database_backup', true, 2555, 'medium', true),
('database_restore', true, 2555, 'critical', true),
('database_migration', true, 2555, 'high', true),
('database_maintenance', true, 2555, 'medium', true)

ON CONFLICT (event_type) DO NOTHING;

-- Create function to clean up expired audit records
CREATE OR REPLACE FUNCTION cleanup_expired_audit_records()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Delete expired audit records
    DELETE FROM public.audit_trail 
    WHERE expires_at < now();
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Log the cleanup
    INSERT INTO public.audit_trail (
        event_type, actor_type, action, description, 
        metadata, severity
    ) VALUES (
        'system_maintenance', 'system', 'CLEANUP',
        'Cleaned up ' || deleted_count || ' expired audit records',
        jsonb_build_object('deleted_count', deleted_count),
        'low'
    );
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Create function to generate audit reports
CREATE OR REPLACE FUNCTION generate_audit_report(
    p_report_type VARCHAR(50),
    p_start_date TIMESTAMP WITH TIME ZONE,
    p_end_date TIMESTAMP WITH TIME ZONE,
    p_filters JSONB DEFAULT '{}',
    p_generated_by UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    report_id UUID;
    report_data JSONB;
BEGIN
    -- Generate report data based on type
    CASE p_report_type
        WHEN 'security_events' THEN
            SELECT jsonb_agg(
                jsonb_build_object(
                    'id', id,
                    'event_type', event_type,
                    'actor_type', actor_type,
                    'actor_id', actor_id,
                    'action', action,
                    'description', description,
                    'severity', severity,
                    'risk_score', risk_score,
                    'occurred_at', occurred_at
                )
            ) INTO report_data
            FROM public.audit_trail
            WHERE event_type IN ('security_event', 'fraud_detection', 'suspicious_activity', 'session_hijacked')
            AND occurred_at BETWEEN p_start_date AND p_end_date;
            
        WHEN 'financial_events' THEN
            SELECT jsonb_agg(
                jsonb_build_object(
                    'id', id,
                    'event_type', event_type,
                    'actor_id', actor_id,
                    'target_id', target_id,
                    'action', action,
                    'description', description,
                    'old_values', old_values,
                    'new_values', new_values,
                    'occurred_at', occurred_at
                )
            ) INTO report_data
            FROM public.audit_trail
            WHERE event_type IN ('deposit', 'withdrawal', 'payment_processed', 'payment_failed', 'payment_refunded')
            AND occurred_at BETWEEN p_start_date AND p_end_date;
            
        WHEN 'admin_activities' THEN
            SELECT jsonb_agg(
                jsonb_build_object(
                    'id', id,
                    'event_type', event_type,
                    'actor_id', actor_id,
                    'actor_email', actor_email,
                    'action', action,
                    'description', description,
                    'target_type', target_type,
                    'target_id', target_id,
                    'occurred_at', occurred_at
                )
            ) INTO report_data
            FROM public.audit_trail
            WHERE actor_type = 'admin'
            AND occurred_at BETWEEN p_start_date AND p_end_date;
            
        ELSE
            report_data := '[]'::jsonb;
    END CASE;
    
    -- Create report record
    INSERT INTO public.audit_reports (
        report_type, report_name, report_period_start, report_period_end,
        filters, generated_by, expires_at
    ) VALUES (
        p_report_type, 
        p_report_type || '_report_' || to_char(p_start_date, 'YYYY_MM_DD'),
        p_start_date, p_end_date,
        p_filters, p_generated_by,
        now() + INTERVAL '30 days'
    ) RETURNING id INTO report_id;
    
    RETURN report_id;
END;
$$ LANGUAGE plpgsql;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_audit_trail_composite_1 ON public.audit_trail(event_type, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_trail_composite_2 ON public.audit_trail(actor_type, actor_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_trail_composite_3 ON public.audit_trail(target_type, target_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_trail_composite_4 ON public.audit_trail(severity, risk_score, occurred_at DESC);

-- Create partial indexes for common queries
CREATE INDEX IF NOT EXISTS idx_audit_trail_high_risk ON public.audit_trail(occurred_at DESC) 
WHERE risk_score >= 70;

CREATE INDEX IF NOT EXISTS idx_audit_trail_critical_events ON public.audit_trail(occurred_at DESC) 
WHERE severity = 'critical';

CREATE INDEX IF NOT EXISTS idx_audit_trail_financial ON public.audit_trail(occurred_at DESC) 
WHERE event_type IN ('deposit', 'withdrawal', 'payment_processed', 'payment_failed', 'payment_refunded');

CREATE INDEX IF NOT EXISTS idx_audit_trail_security ON public.audit_trail(occurred_at DESC) 
WHERE event_type IN ('security_event', 'fraud_detection', 'suspicious_activity', 'session_hijacked');

-- Create function to get audit trail summary
CREATE OR REPLACE FUNCTION get_audit_summary(
    p_start_date TIMESTAMP WITH TIME ZONE DEFAULT now() - INTERVAL '24 hours',
    p_end_date TIMESTAMP WITH TIME ZONE DEFAULT now()
)
RETURNS TABLE(
    event_type audit_event_type,
    total_count BIGINT,
    unique_actors BIGINT,
    high_risk_count BIGINT,
    critical_count BIGINT,
    avg_risk_score NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        at.event_type,
        COUNT(*) as total_count,
        COUNT(DISTINCT at.actor_id) as unique_actors,
        COUNT(*) FILTER (WHERE at.risk_score >= 70) as high_risk_count,
        COUNT(*) FILTER (WHERE at.severity = 'critical') as critical_count,
        ROUND(AVG(at.risk_score), 2) as avg_risk_score
    FROM public.audit_trail at
    WHERE at.occurred_at BETWEEN p_start_date AND p_end_date
    GROUP BY at.event_type
    ORDER BY total_count DESC;
END;
$$ LANGUAGE plpgsql;
