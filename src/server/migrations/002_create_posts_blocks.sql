-- ============================================================================
-- Migration: 002_create_posts_blocks
-- Description: Create posts and blocks tables for Page Builder CRM
-- Author: CoderAgent
-- Created: 2026-02-13
-- Applies to: posts, blocks
-- ============================================================================

-- ============================================================================
-- DOWN: Rollback (executed on rollback)
-- ============================================================================

DROP TABLE IF EXISTS blocks CASCADE;
DROP TABLE IF EXISTS posts CASCADE;
DROP TYPE IF EXISTS block_type;
DROP TYPE IF EXISTS post_status;

-- ============================================================================
-- UP: Apply migration (executed on migrate up)
-- ============================================================================

-- 1. Create ENUM types first
CREATE TYPE post_status AS ENUM ('draft', 'published');
CREATE TYPE block_type AS ENUM ('text_full', 'image_full', 'text_image', 'image_text');

-- 2. Create posts table
CREATE TABLE posts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    slug text UNIQUE NOT NULL,
    status post_status NOT NULL DEFAULT 'draft',
    seo_title text,
    seo_description text,
    og_image_url text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- 3. Create blocks table
CREATE TABLE blocks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    type block_type NOT NULL,
    data jsonb NOT NULL DEFAULT '{}',
    sort_order integer NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- 4. Create indexes
CREATE INDEX idx_posts_slug ON posts (slug);
CREATE INDEX idx_posts_status ON posts (status);
CREATE INDEX idx_blocks_post_id ON blocks (post_id);
CREATE INDEX idx_blocks_sort_order ON blocks (post_id, sort_order);

-- 5. Add comments
COMMENT ON TABLE posts IS 'Dynamic pages with Page Builder - composed of ordered blocks';
COMMENT ON TABLE blocks IS 'Content blocks for Page Builder posts, ordered by sort_order';
COMMENT ON COLUMN blocks.data IS 'JSONB data specific to block type: text_full={content}, image_full={image_url,alt}, text_image={text,image_url,image_alt}, image_text={text,image_url,image_alt}';
COMMENT ON COLUMN blocks.sort_order IS 'Display order within the post (0-based)';

-- 6. Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_posts_updated_at
    BEFORE UPDATE ON posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
