-- SafeCity Database Migration 005: Emergency Units Table

CREATE TABLE IF NOT EXISTS emergency_units (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unit_type       VARCHAR(30) NOT NULL
                    CHECK (unit_type IN ('police', 'ambulance', 'fire', 'rescue')),
    call_sign       VARCHAR(20) UNIQUE NOT NULL,
    current_location GEOMETRY(Point, 4326),
    status          VARCHAR(20) DEFAULT 'available'
                    CHECK (status IN ('available', 'dispatched', 'en_route',
                                      'on_scene', 'returning', 'offline')),
    speed           DECIMAL(6, 2),
    heading         DECIMAL(6, 2),
    assigned_zone   UUID REFERENCES zones(id),
    assigned_incident UUID REFERENCES incidents(id),
    crew_count      INTEGER DEFAULT 2,
    last_ping       TIMESTAMPTZ DEFAULT NOW(),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_units_location ON emergency_units USING GIST(current_location);
CREATE INDEX IF NOT EXISTS idx_units_status ON emergency_units(status);
CREATE INDEX IF NOT EXISTS idx_units_type ON emergency_units(unit_type);

-- Now add the foreign key on incidents.assigned_unit
ALTER TABLE incidents
  ADD CONSTRAINT fk_incidents_assigned_unit
  FOREIGN KEY (assigned_unit) REFERENCES emergency_units(id)
  ON DELETE SET NULL;
