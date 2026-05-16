-- SafeCity Database Migration 004: Complaints Table

CREATE TABLE IF NOT EXISTS complaints (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category        VARCHAR(50) NOT NULL
                    CHECK (category IN ('road_damage', 'street_light', 'water',
                                        'sanitation', 'traffic', 'harassment',
                                        'noise', 'encroachment', 'other')),
    description     TEXT NOT NULL,
    location        GEOMETRY(Point, 4326),
    address         TEXT,
    priority_score  INTEGER DEFAULT 5 CHECK (priority_score BETWEEN 1 AND 10),
    urgency_label   VARCHAR(20) DEFAULT 'MEDIUM'
                    CHECK (urgency_label IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    status          VARCHAR(30) DEFAULT 'pending'
                    CHECK (status IN ('pending', 'assigned', 'in_progress',
                                      'resolved', 'rejected')),
    sentiment_score DECIMAL(4, 3),
    filed_by        UUID REFERENCES users(id),
    zone_id         UUID REFERENCES zones(id),
    assigned_to     UUID REFERENCES users(id),
    photo_urls      TEXT[],
    resolved_at     TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_complaints_location ON complaints USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_complaints_category ON complaints(category);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_urgency ON complaints(urgency_label);
CREATE INDEX IF NOT EXISTS idx_complaints_zone ON complaints(zone_id);
CREATE INDEX IF NOT EXISTS idx_complaints_created ON complaints(created_at DESC);
