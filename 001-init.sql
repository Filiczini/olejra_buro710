-- Migration: 001-init.sql
-- Description: Create initial database schema for projects and site_settings
-- Version: 1.0

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT[] NOT NULL,
  image_url TEXT,
  tags TEXT[] DEFAULT '{}',
  location TEXT,
  area TEXT,
  year TEXT,
  team TEXT[],
  architects TEXT[],
  concept_heading TEXT,
  concept_caption TEXT,
  concept_quote TEXT,
  category TEXT,
  category_primary TEXT,
  category_secondary TEXT,
  short_description TEXT,
  subtitle TEXT,
  photo_credits TEXT,
  project_images JSONB DEFAULT '[]',
  design_zones JSONB DEFAULT '[]',
  materials JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create site_settings table
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS projects_created_at_idx ON projects (created_at DESC);
CREATE INDEX IF NOT EXISTS projects_tags_gin ON projects USING GIN (tags);
CREATE INDEX IF NOT EXISTS projects_location_idx ON projects (location);
CREATE INDEX IF NOT EXISTS projects_year_idx ON projects (year);
CREATE INDEX IF NOT EXISTS site_settings_key_idx ON site_settings (key);

-- Add comment documenting the migration
COMMENT ON TABLE projects IS 'Portfolio projects table storing all project information including metadata, images, and design zones';
COMMENT ON TABLE site_settings IS 'Site configuration key-value pairs for dynamic settings';
