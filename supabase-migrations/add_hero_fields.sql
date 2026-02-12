-- Migration: Add hero section fields to projects table
-- Adds fields for full control over hero section content

-- Main Info Section fields
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS short_description TEXT,
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS subtitle TEXT,
ADD COLUMN IF NOT EXISTS photo_credits TEXT;

-- Section Labels fields
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS challenge_title TEXT,
ADD COLUMN IF NOT EXISTS materials_title TEXT,
ADD COLUMN IF NOT EXISTS context_title TEXT,
ADD COLUMN IF NOT EXISTS figure_number TEXT,
ADD COLUMN IF NOT EXISTS figure_caption TEXT;

-- Add comments for documentation
COMMENT ON COLUMN projects.short_description IS 'Brief project description for hero section';
COMMENT ON COLUMN projects.category IS 'Project category (e.g., Residential / Modern)';
COMMENT ON COLUMN projects.subtitle IS 'Project subtitle';
COMMENT ON COLUMN projects.photo_credits IS 'Photographer name';

COMMENT ON COLUMN projects.challenge_title IS 'Title for Challenge section (default: The Challenge)';
COMMENT ON COLUMN projects.materials_title IS 'Title for Materials section (default: Materials)';
COMMENT ON COLUMN projects.context_title IS 'Title for Context section (default: Context)';
COMMENT ON COLUMN projects.figure_number IS 'Figure number (e.g., Figure 01)';
COMMENT ON COLUMN projects.figure_caption IS 'Figure caption (e.g., Main Dining Hall)';
