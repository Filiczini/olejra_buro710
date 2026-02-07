-- Migration: Add dynamic sections support to projects table
-- Version: 003
-- Description: Enables fully CMS-driven product pages with dynamic content sections
--
-- This migration adds support for storing all page sections (including Hero)
-- as a JSONB array, allowing flexible, editable content structures.

-- Add sections array column
-- This will store all page sections (hero, metadata, about, concept, etc.)
-- as JSONB with GIN index for fast querying
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS sections JSONB DEFAULT '[]';

-- Create GIN index on sections array
-- Enables efficient querying of specific section types and ordering
CREATE INDEX IF NOT EXISTS idx_projects_sections
  ON projects USING GIN (sections);

-- Add created_at and updated_at triggers for auto-updating timestamps
-- Note: These triggers may already exist, so we check first
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to projects table
DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Note: No separate hero_* columns are created
-- Hero is now just another section in the sections array with type: 'hero'
-- Legacy hero fields (image_url, title, subtitle, short_description) will be
-- migrated to a 'hero' section during the data migration script

-- Verification query (optional, for manual verification):
-- SELECT id, title, sections FROM projects LIMIT 5;

-- Expected output after migration:
-- sections column should exist with default value '[]'
-- GIN index idx_projects_sections should be present
-- Trigger update_projects_updated_at should be active
