-- ============================================================================
-- Migration: 003_add_hero_to_posts
-- Description: Add hero section fields to posts table for CRM pages
-- Author: CoderAgent
-- Created: 2026-02-13
-- ============================================================================

-- ============================================================================
-- DOWN: Rollback
-- ============================================================================

ALTER TABLE posts DROP COLUMN IF EXISTS hero_image_url;
ALTER TABLE posts DROP COLUMN IF EXISTS hero_title;
ALTER TABLE posts DROP COLUMN IF EXISTS hero_subtitle;
ALTER TABLE posts DROP COLUMN IF EXISTS hero_tags;
ALTER TABLE posts DROP COLUMN IF EXISTS hero_location;
ALTER TABLE posts DROP COLUMN IF EXISTS hero_year;

-- ============================================================================
-- UP: Apply migration
-- ============================================================================

ALTER TABLE posts ADD COLUMN hero_image_url TEXT;
ALTER TABLE posts ADD COLUMN hero_title TEXT;
ALTER TABLE posts ADD COLUMN hero_subtitle TEXT;
ALTER TABLE posts ADD COLUMN hero_tags TEXT[] DEFAULT '{}';
ALTER TABLE posts ADD COLUMN hero_location TEXT;
ALTER TABLE posts ADD COLUMN hero_year TEXT;

-- Comments
COMMENT ON COLUMN posts.hero_image_url IS 'Hero section background image URL';
COMMENT ON COLUMN posts.hero_title IS 'Hero section title (can differ from post.title)';
COMMENT ON COLUMN posts.hero_subtitle IS 'Hero section subtitle/description';
COMMENT ON COLUMN posts.hero_tags IS 'Hero section tags/badges array';
COMMENT ON COLUMN posts.hero_location IS 'Hero section location text';
COMMENT ON COLUMN posts.hero_year IS 'Hero section year';
