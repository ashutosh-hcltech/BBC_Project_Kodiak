
-- DDL for creating the assessments table
CREATE TABLE IF NOT EXISTS assessments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    engagement_details TEXT NOT NULL,
    score TEXT NOT NULL,
    triage TEXT NOT NULL,
    explanation TEXT NOT NULL,
    human_override_score TEXT,
    human_override_triage TEXT,
    human_override_explanation TEXT,
    human_override_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
