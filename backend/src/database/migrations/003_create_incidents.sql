-- SafeCity Database Migration 003: Incidents Table

CREATE TABLE IF NOT EXISTS incidents (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type            VARCHAR(50) NOT NULL
                    CHECK (type IN ('crime', 'accident', 'fire', 'flood',
                                    'infrastructure', 'medical', 'other')),
    title           VARCHAR(255) NOT NULL,
    description     TEXT,
    severity        INTEGER CHECK (severity BETWEEN 1 AND 10),
    status          VARCHAR(30) DEFAULT 'reported'
                    CHECK (status IN ('reported', 'verified', 'in_progress',
                                      'resolved', 'closed', 'false_alarm')),
    location        GEOMETRY(Point, 4326) NOT NULL,
    address         TEXT,
    reported_by     UUID REFERENCES users(id),
    zone_id         UUID REFERENCES zones(id),
    assigned_unit   UUID,
    photo_urls      TEXT[],
    response_time   INTEGER,
    resolved_at     TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_incidents_location ON incidents USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_incidents_type ON incidents(type);
CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents(status);
CREATE INDEX IF NOT EXISTS idx_incidents_zone ON incidents(zone_id);
CREATE INDEX IF NOT EXISTS idx_incidents_created ON incidents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_incidents_severity ON incidents(severity DESC);
