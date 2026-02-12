-- Migration: Cleanup database to match new minimal schema
-- Run this in Supabase SQL Editor
-- WARNING: This will DELETE ALL DATA!

-- ============================================
-- STEP 1: Delete all data
-- ============================================

-- Delete all files from storage bucket
DELETE FROM storage.objects WHERE bucket_id = 'projects';

-- Truncate all tables (CASCADE to handle foreign keys)
TRUNCATE TABLE media CASCADE;
TRUNCATE TABLE activity_logs CASCADE;
TRUNCATE TABLE projects CASCADE;

-- ============================================
-- STEP 2: Remove unused columns from projects
-- ============================================

ALTER TABLE projects
  DROP COLUMN IF EXISTS short_description,
  DROP COLUMN IF EXISTS category,
  DROP COLUMN IF EXISTS category_primary,
  DROP COLUMN IF EXISTS category_secondary,
  DROP COLUMN IF EXISTS photo_credits,
  DROP COLUMN IF EXISTS challenge_title,
  DROP COLUMN IF EXISTS materials_title,
  DROP COLUMN IF EXISTS context_title,
  DROP COLUMN IF EXISTS figure_number,
  DROP COLUMN IF EXISTS figure_caption,
  DROP COLUMN IF EXISTS challenge_description,
  DROP COLUMN IF EXISTS quote_text,
  DROP COLUMN IF EXISTS context_description,
  DROP COLUMN IF EXISTS next_project_link_title,
  DROP COLUMN IF EXISTS next_project_link_subtitle,
  DROP COLUMN IF EXISTS other_projects_title,
  DROP COLUMN IF EXISTS team,
  DROP COLUMN IF EXISTS architects,
  DROP COLUMN IF EXISTS concept_heading,
  DROP COLUMN IF EXISTS concept_caption,
  DROP COLUMN IF EXISTS concept_quote,
  DROP COLUMN IF EXISTS description,
  DROP COLUMN IF EXISTS project_images,
  DROP COLUMN IF EXISTS design_zones,
  DROP COLUMN IF EXISTS materials;

-- ============================================
-- STEP 3: Ensure subtitle column exists
-- ============================================

ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS subtitle TEXT;

-- ============================================
-- STEP 4: Constrain media role to 'hero' only
-- ============================================

-- Remove any gallery records
DELETE FROM media WHERE role = 'gallery';

-- Update constraint
ALTER TABLE media DROP CONSTRAINT IF EXISTS media_role_check;
ALTER TABLE media ADD CONSTRAINT media_role_check CHECK (role = 'hero');

-- ============================================
-- DONE! Final schema:
-- 
-- projects: id, title, subtitle, image_url, tags, 
--           location, year, area, created_at, updated_at
-- 
-- media: id, project_id, url, role ('hero'), sort_order, alt
-- ============================================
