-- SafeCity Database Migration 006: Risk Scores Table

CREATE TABLE IF NOT EXISTS risk_scores (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    zone_id         UUID UNIQUE REFERENCES zones(id) ON DELETE CASCADE,
    overall_score   DECIMAL(5, 2) CHECK (overall_score BETWEEN 0 AND 100),
    crime_factor    DECIMAL(4, 3),
    accident_factor DECIMAL(4, 3),
    complaint_factor DECIMAL(4, 3),
    time_factor     DECIMAL(4, 3),
    historical_factor DECIMAL(4, 3),
    risk_level      VARCHAR(20) GENERATED ALWAYS AS (
                      CASE
                        WHEN overall_score >= 70 THEN 'critical'
                        WHEN overall_score >= 50 THEN 'high'
                        WHEN overall_score >= 30 THEN 'moderate'
                        ELSE 'low'
                      END
                    ) STORED,
    calculated_at   TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_risk_zone ON risk_scores(zone_id);
CREATE INDEX IF NOT EXISTS idx_risk_level ON risk_scores(risk_level);
