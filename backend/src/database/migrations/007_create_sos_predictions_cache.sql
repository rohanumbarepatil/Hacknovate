-- SafeCity Database Migration 007: SOS Alerts & Predictions

-- SOS Alerts
CREATE TABLE IF NOT EXISTS sos_alerts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    citizen_id      UUID REFERENCES users(id) NOT NULL,
    location        GEOMETRY(Point, 4326) NOT NULL,
    status          VARCHAR(20) DEFAULT 'active'
                    CHECK (status IN ('active', 'acknowledged', 'responding',
                                      'resolved', 'false_alarm')),
    responder_id    UUID REFERENCES emergency_units(id),
    response_time   INTEGER,
    notes           TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    resolved_at     TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_sos_location ON sos_alerts USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_sos_status ON sos_alerts(status);
CREATE INDEX IF NOT EXISTS idx_sos_created ON sos_alerts(created_at DESC);

-- Predictions (AI-generated)
CREATE TABLE IF NOT EXISTS predictions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    zone_id         UUID REFERENCES zones(id),
    prediction_type VARCHAR(30) NOT NULL
                    CHECK (prediction_type IN ('forecast', 'cluster', 'recommendation')),
    data            JSONB NOT NULL,
    confidence      DECIMAL(4, 3),
    valid_from      TIMESTAMPTZ DEFAULT NOW(),
    valid_until     TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_predictions_zone ON predictions(zone_id);
CREATE INDEX IF NOT EXISTS idx_predictions_type ON predictions(prediction_type);

-- Analytics Cache
CREATE TABLE IF NOT EXISTS analytics_cache (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cache_key       VARCHAR(255) UNIQUE NOT NULL,
    data            JSONB NOT NULL,
    expires_at      TIMESTAMPTZ NOT NULL,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cache_key ON analytics_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_cache_expires ON analytics_cache(expires_at);
