-- Add new columns to projects table for enhanced design

-- Category columns
ALTER TABLE projects ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS category_primary TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS category_secondary TEXT;

-- Description columns
ALTER TABLE projects ADD COLUMN IF NOT EXISTS short_description TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS subtitle TEXT;

-- Credits column
ALTER TABLE projects ADD COLUMN IF NOT EXISTS photo_credits TEXT;

-- Project images (JSONB array of objects)
ALTER TABLE projects ADD COLUMN IF NOT EXISTS project_images JSONB DEFAULT '[]'::jsonb;

-- Design zones (JSONB array of objects)
ALTER TABLE projects ADD COLUMN IF NOT EXISTS design_zones JSONB DEFAULT '[]'::jsonb;

-- Materials (JSONB array of objects)
ALTER TABLE projects ADD COLUMN IF NOT EXISTS materials JSONB DEFAULT '[]'::jsonb;

-- Add GIN index for JSONB columns for better query performance
CREATE INDEX IF NOT EXISTS projects_design_zones_gin ON projects USING GIN (design_zones);
CREATE INDEX IF NOT EXISTS project_images_gin ON projects USING GIN (project_images);

-- Add indexes for new text columns
CREATE INDEX IF NOT EXISTS projects_category_idx ON projects (category);
CREATE INDEX IF NOT EXISTS projects_category_primary_idx ON projects (category_primary);

COMMENT ON COLUMN projects.category IS 'Full category string (e.g., "Residential / Modern")';
COMMENT ON COLUMN projects.category_primary IS 'Primary category (e.g., "Residential")';
COMMENT ON COLUMN projects.category_secondary IS 'Secondary category (e.g., "Modern")';
COMMENT ON COLUMN projects.short_description IS 'Short description for hero section';
COMMENT ON COLUMN projects.subtitle IS 'Subtitle or slogan';
COMMENT ON COLUMN projects.photo_credits IS 'Photographer credits';
COMMENT ON COLUMN projects.project_images IS 'Array of additional project images';
COMMENT ON COLUMN projects.design_zones IS 'Array of design zones with layout info';
COMMENT ON COLUMN projects.materials IS 'Array of material palette with colors';
