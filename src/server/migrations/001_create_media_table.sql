-- ============================================================================
-- Migration: 001_create_media_table
-- Description: Create media table with uuid primary key, enum type, and indexes
-- Author: CoderAgent
-- Created: 2026-02-09
-- Applies to: media
-- ============================================================================

-- ============================================================================
-- DOWN: Rollback (executed on rollback)
-- ============================================================================
-- Note: Execute these statements in reverse dependency order

-- Drop the table (automatically drops indexes and cascades to enum)
DROP TABLE IF EXISTS media CASCADE;

-- Drop enum type
DROP TYPE IF EXISTS media_role;

-- ============================================================================
-- UP: Apply migration (executed on migrate up)
-- ============================================================================
-- Note: Execute these statements in dependency order

-- 1. Create ENUM type first (no dependencies)
CREATE TYPE media_role AS ENUM ('hero', 'gallery');

-- 2. Create the table
CREATE TABLE media (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    url text NOT NULL,
    role media_role NOT NULL,
    sort_order integer NOT NULL DEFAULT 0,
    alt text,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- 3. Create indexes after table exists
CREATE INDEX idx_media_project_id ON media (project_id);

-- 4. Add comment for documentation
COMMENT ON TABLE media IS 'Stores media assets (images) for projects with hero and gallery roles';
COMMENT ON COLUMN media.role IS 'Role of the media: hero for hero slider, gallery for project gallery';
COMMENT ON COLUMN media.sort_order IS 'Order for displaying media (lower numbers first)';
