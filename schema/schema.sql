-- BrainSAIT RCM Validation System Database Schema
-- Version 2.0.0
-- For Cloudflare D1 Database

-- Drop existing tables if they exist
DROP TABLE IF EXISTS survey_responses;
DROP TABLE IF EXISTS audit_log;
DROP TABLE IF EXISTS analytics_summary;

-- Survey Responses Table
CREATE TABLE survey_responses (
    id TEXT PRIMARY KEY,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    -- Contact Information
    contact_name TEXT NOT NULL,
    contact_email TEXT NOT NULL,
    contact_organization TEXT NOT NULL,
    contact_phone TEXT,
    contact_location TEXT,
    contact_job_title TEXT,
    
    -- Q1: Role
    role_value TEXT,
    role_text TEXT,
    role_score INTEGER DEFAULT 0,
    
    -- Q2: Organization Size
    organization_size_value TEXT,
    organization_size_text TEXT,
    organization_size_score INTEGER DEFAULT 0,
    
    -- Q3: Primary Challenge
    primary_challenge_value TEXT,
    primary_challenge_text TEXT,
    primary_challenge_score INTEGER DEFAULT 0,
    
    -- Q4: Financial Impact
    financial_impact_value TEXT,
    financial_impact_text TEXT,
    financial_impact_sar REAL,
    financial_impact_score INTEGER DEFAULT 0,
    
    -- Q5: AI Readiness
    ai_readiness_value TEXT,
    ai_readiness_text TEXT,
    ai_readiness_score INTEGER DEFAULT 0,
    
    -- Scoring and Analysis
    total_score INTEGER NOT NULL,
    qualification_level TEXT CHECK(qualification_level IN ('critical', 'high', 'medium', 'low', 'minimal')),
    ai_recommendations TEXT, -- JSON array
    priority_score INTEGER,
    
    -- Metadata
    processing_status TEXT DEFAULT 'pending' CHECK(processing_status IN ('pending', 'processed', 'contacted', 'converted')),
    language_preference TEXT DEFAULT 'en' CHECK(language_preference IN ('en', 'ar')),
    source_campaign TEXT,
    referral_source TEXT,
    
    -- Computed columns for analytics
    created_month TEXT GENERATED ALWAYS AS (strftime('%Y-%m', timestamp)) STORED,
    created_week TEXT GENERATED ALWAYS AS (strftime('%Y-W%W', timestamp)) STORED,
    
    -- Indexes for performance
    INDEX idx_email (contact_email),
    INDEX idx_organization (contact_organization),
    INDEX idx_qualification (qualification_level),
    INDEX idx_timestamp (timestamp),
    INDEX idx_processing_status (processing_status)
);

-- Audit Log Table for Compliance
CREATE TABLE audit_log (
    id TEXT PRIMARY KEY,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    event_type TEXT NOT NULL,
    action TEXT NOT NULL,
    user_id TEXT,
    ip_address TEXT,
    details TEXT, -- JSON object
    success BOOLEAN DEFAULT TRUE,
    error_message TEXT,
    compliance_flags TEXT, -- JSON array of compliance standards met
    
    INDEX idx_audit_timestamp (timestamp),
    INDEX idx_audit_event (event_type),
    INDEX idx_audit_user (user_id)
);

-- Analytics Summary Table (for caching)
CREATE TABLE analytics_summary (
    id TEXT PRIMARY KEY,
    summary_date DATE NOT NULL,
    metric_type TEXT NOT NULL,
    metric_value REAL,
    details TEXT, -- JSON object
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(summary_date, metric_type),
    INDEX idx_summary_date (summary_date),
    INDEX idx_metric_type (metric_type)
);

-- Create views for analytics
CREATE VIEW IF NOT EXISTS qualification_distribution AS
SELECT 
    qualification_level,
    COUNT(*) as count,
    AVG(total_score) as avg_score,
    AVG(financial_impact_sar) as avg_financial_impact
FROM survey_responses
GROUP BY qualification_level;

CREATE VIEW IF NOT EXISTS challenge_analysis AS
SELECT 
    primary_challenge_value,
    COUNT(*) as frequency,
    AVG(total_score) as avg_score,
    GROUP_CONCAT(DISTINCT organization_size_value) as org_sizes
FROM survey_responses
WHERE primary_challenge_value IS NOT NULL
GROUP BY primary_challenge_value
ORDER BY frequency DESC;

CREATE VIEW IF NOT EXISTS monthly_trends AS
SELECT 
    created_month,
    COUNT(*) as total_responses,
    AVG(total_score) as avg_score,
    SUM(CASE WHEN qualification_level IN ('critical', 'high') THEN 1 ELSE 0 END) as high_priority_count,
    AVG(financial_impact_sar) as avg_financial_impact
FROM survey_responses
GROUP BY created_month
ORDER BY created_month DESC;

-- Insert initial audit log entry
INSERT INTO audit_log (id, event_type, action, details, compliance_flags)
VALUES (
    'init_' || hex(randomblob(16)),
    'system',
    'database_initialized',
    '{"version": "2.0.0", "schema": "production"}',
    '["GDPR", "HIPAA", "NPHIES", "Saudi_PDPL"]'
);