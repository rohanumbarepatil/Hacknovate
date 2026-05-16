-- SafeCity Database Migration 002: Zones Table
-- Ward/zone boundaries with PostGIS geometry

CREATE TABLE IF NOT EXISTS zones (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(100) NOT NULL,
    ward_number     VARCHAR(10) UNIQUE NOT NULL,
    boundary        GEOMETRY(Polygon, 4326),
    area_sq_km      DECIMAL(10, 4),
    population      INTEGER,
    category        VARCHAR(50) DEFAULT 'residential',
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_zones_boundary ON zones USING GIST(boundary);
CREATE INDEX IF NOT EXISTS idx_zones_ward_number ON zones(ward_number);

-- Add foreign key to users table now that zones exists
ALTER TABLE users
  ADD CONSTRAINT fk_users_ward
  FOREIGN KEY (ward_id) REFERENCES zones(id)
  ON DELETE SET NULL;
