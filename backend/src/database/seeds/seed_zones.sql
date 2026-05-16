-- SafeCity Seed Data: Demo Zones for Satara
-- Inserts zone records for the Satara Municipal Council wards

INSERT INTO zones (name, ward_number, population, category) VALUES
  ('Shanivar Peth',      'W01', 15200, 'commercial'),
  ('Ravivar Peth',       'W02', 12800, 'residential'),
  ('Somvar Peth',        'W03', 11500, 'residential'),
  ('Mangalwar Peth',     'W04', 13700, 'mixed'),
  ('Guruvar Peth',       'W05', 14100, 'commercial'),
  ('Shukrawar Peth',     'W06', 10300, 'residential'),
  ('Sadar Bazar',        'W07', 18500, 'commercial'),
  ('Powai Naka',         'W08', 16200, 'mixed'),
  ('Godoli',             'W09', 20100, 'residential'),
  ('Saidapur',           'W10', 8900,  'industrial'),
  ('Yawateshwar',        'W11', 11200, 'residential'),
  ('Maharaj Bag',        'W12', 9800,  'institutional')
ON CONFLICT (ward_number) DO NOTHING;

-- Seed demo emergency units
INSERT INTO emergency_units (unit_type, call_sign, status, crew_count) VALUES
  ('police',    'ALPHA-01', 'available', 4),
  ('police',    'ALPHA-02', 'available', 3),
  ('police',    'BRAVO-01', 'available', 4),
  ('ambulance', 'MED-01',   'available', 2),
  ('ambulance', 'MED-02',   'available', 2),
  ('fire',      'FIRE-01',  'available', 6),
  ('fire',      'FIRE-02',  'offline',   6),
  ('rescue',    'RESCUE-01','available', 4)
ON CONFLICT (call_sign) DO NOTHING;
