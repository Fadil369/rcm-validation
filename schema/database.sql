-- RCM Survey Database Schema for D1
-- BrainSAIT Healthcare AI Research Initiative

-- Survey responses table
CREATE TABLE IF NOT EXISTS survey_responses (
    id TEXT PRIMARY KEY,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    contact_name TEXT NOT NULL,
    contact_email TEXT NOT NULL,
    contact_organization TEXT NOT NULL,
    contact_phone TEXT,
    contact_location TEXT,
    contact_job_title TEXT,
    
    -- Survey answers
    role_value TEXT,
    role_text TEXT,
    role_score INTEGER,
    
    organization_size_value TEXT,
    organization_size_text TEXT,
    organization_size_score INTEGER,
    
    primary_challenge_value TEXT,
    primary_challenge_text TEXT,
    primary_challenge_score INTEGER,
    
    financial_impact_value TEXT,
    financial_impact_text TEXT,
    financial_impact_sar INTEGER,
    financial_impact_score INTEGER,
    
    ai_readiness_value TEXT,
    ai_readiness_text TEXT,
    ai_readiness_score INTEGER,
    
    -- Analysis results
    total_score INTEGER NOT NULL,
    qualification_level TEXT NOT NULL,
    ai_recommendations TEXT, -- JSON array
    priority_score INTEGER,
    
    -- Metadata
    user_agent TEXT,
    ip_address TEXT,
    referrer TEXT,
    session_id TEXT,
    language_preference TEXT DEFAULT 'en',
    
    -- Compliance and audit
    consent_given BOOLEAN DEFAULT TRUE,
    data_retention_date DATETIME,
    processing_status TEXT DEFAULT 'pending',
    follow_up_status TEXT DEFAULT 'none',
    
    -- Indexes for analysis
    created_date DATE GENERATED ALWAYS AS (DATE(timestamp)) STORED,
    created_month TEXT GENERATED ALWAYS AS (strftime('%Y-%m', timestamp)) STORED
);

-- Analytics aggregation table
CREATE TABLE IF NOT EXISTS analytics_summary (
    id TEXT PRIMARY KEY,
    summary_date DATE DEFAULT CURRENT_DATE,
    summary_type TEXT NOT NULL, -- 'daily', 'weekly', 'monthly'
    
    total_responses INTEGER DEFAULT 0,
    avg_score REAL DEFAULT 0,
    
    -- Role distribution
    rcm_director_count INTEGER DEFAULT 0,
    practice_admin_count INTEGER DEFAULT 0,
    billing_manager_count INTEGER DEFAULT 0,
    it_manager_count INTEGER DEFAULT 0,
    clinical_supervisor_count INTEGER DEFAULT 0,
    quality_manager_count INTEGER DEFAULT 0,
    finance_controller_count INTEGER DEFAULT 0,
    other_healthcare_count INTEGER DEFAULT 0,
    
    -- Challenge distribution
    nphies_compliance_count INTEGER DEFAULT 0,
    staffing_shortage_count INTEGER DEFAULT 0,
    manual_processes_count INTEGER DEFAULT 0,
    denial_management_count INTEGER DEFAULT 0,
    system_integration_count INTEGER DEFAULT 0,
    cash_flow_count INTEGER DEFAULT 0,
    
    -- Qualification levels
    critical_qualified_count INTEGER DEFAULT 0,
    high_qualified_count INTEGER DEFAULT 0,
    medium_qualified_count INTEGER DEFAULT 0,
    low_qualified_count INTEGER DEFAULT 0,
    minimal_qualified_count INTEGER DEFAULT 0,
    
    -- Financial impact analysis
    avg_financial_impact_sar REAL DEFAULT 0,
    total_financial_impact_sar INTEGER DEFAULT 0,
    
    -- AI readiness
    ai_pioneer_count INTEGER DEFAULT 0,
    very_open_count INTEGER DEFAULT 0,
    open_with_pilot_count INTEGER DEFAULT 0,
    cautious_proven_count INTEGER DEFAULT 0,
    regulatory_concerns_count INTEGER DEFAULT 0,
    traditional_focus_count INTEGER DEFAULT 0,
    
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Audit log table for compliance
CREATE TABLE IF NOT EXISTS audit_log (
    id TEXT PRIMARY KEY,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    event_type TEXT NOT NULL, -- 'survey_submit', 'data_access', 'data_export', 'analysis_run'
    user_id TEXT,
    ip_address TEXT,
    user_agent TEXT,
    resource_id TEXT, -- survey response ID or other resource
    action TEXT NOT NULL,
    details TEXT, -- JSON with additional details
    success BOOLEAN DEFAULT TRUE,
    error_message TEXT,
    compliance_flags TEXT -- JSON array of compliance requirements met
);

-- AI analysis cache table
CREATE TABLE IF NOT EXISTS ai_analysis_cache (
    id TEXT PRIMARY KEY,
    analysis_type TEXT NOT NULL, -- 'trend_analysis', 'recommendation_engine', 'market_insights'
    cache_key TEXT NOT NULL,
    analysis_date DATE DEFAULT CURRENT_DATE,
    input_parameters TEXT, -- JSON
    analysis_result TEXT, -- JSON
    confidence_score REAL,
    expires_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(analysis_type, cache_key)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_survey_responses_timestamp ON survey_responses(timestamp);
CREATE INDEX IF NOT EXISTS idx_survey_responses_qualification ON survey_responses(qualification_level);
CREATE INDEX IF NOT EXISTS idx_survey_responses_organization ON survey_responses(contact_organization);
CREATE INDEX IF NOT EXISTS idx_survey_responses_location ON survey_responses(contact_location);
CREATE INDEX IF NOT EXISTS idx_survey_responses_challenge ON survey_responses(primary_challenge_value);
CREATE INDEX IF NOT EXISTS idx_survey_responses_score ON survey_responses(total_score);
CREATE INDEX IF NOT EXISTS idx_survey_responses_date ON survey_responses(created_date);
CREATE INDEX IF NOT EXISTS idx_survey_responses_month ON survey_responses(created_month);

CREATE INDEX IF NOT EXISTS idx_analytics_date_type ON analytics_summary(summary_date, summary_type);
CREATE INDEX IF NOT EXISTS idx_audit_log_timestamp ON audit_log(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_log_event_type ON audit_log(event_type);
CREATE INDEX IF NOT EXISTS idx_ai_cache_type_key ON ai_analysis_cache(analysis_type, cache_key);
CREATE INDEX IF NOT EXISTS idx_ai_cache_expires ON ai_analysis_cache(expires_at);

-- Initial data for testing
INSERT OR IGNORE INTO analytics_summary (id, summary_type, summary_date) 
VALUES ('daily_' || date('now'), 'daily', date('now'));

INSERT OR IGNORE INTO analytics_summary (id, summary_type, summary_date) 
VALUES ('weekly_' || strftime('%Y-W%W', 'now'), 'weekly', date('now'));

INSERT OR IGNORE INTO analytics_summary (id, summary_type, summary_date) 
VALUES ('monthly_' || strftime('%Y-%m', 'now'), 'monthly', date('now'));
