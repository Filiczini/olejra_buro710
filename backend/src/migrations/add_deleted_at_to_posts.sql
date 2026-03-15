-- Soft delete support for posts
-- Run this in Supabase SQL Editor before deploying

ALTER TABLE posts ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_posts_deleted_at ON posts (deleted_at) WHERE deleted_at IS NULL;
