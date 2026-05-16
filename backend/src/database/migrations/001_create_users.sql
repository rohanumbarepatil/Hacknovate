-- SafeCity Database Migration 001: Users Table
-- Run: psql -U postgres -d safecity -f 001_create_users.sql

CREATE EXTENSION IF NOT EXISTS "pgcrypto";  -- For gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS postgis;      -- For geospatial support
CREATE EXTENSION IF NOT EXISTS pg_trgm;      -- For text search

CREATE TABLE IF NOT EXISTS users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    firebase_uid    VARCHAR(128) UNIQUE NOT NULL,
    name            VARCHAR(255) NOT NULL,
    email           VARCHAR(255) UNIQUE NOT NULL,
    phone           VARCHAR(20),
    role            VARCHAR(20) NOT NULL DEFAULT 'citizen'
                    CHECK (role IN ('citizen', 'authority', 'police', 'admin')),
    avatar_url      TEXT,
    ward_id         UUID,
    is_active       BOOLEAN DEFAULT TRUE,
    last_login      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_firebase_uid ON users(firebase_uid);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
