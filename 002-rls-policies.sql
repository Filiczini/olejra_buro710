-- Migration: 002-rls-policies.sql
-- Description: Enable Row Level Security and create policies for projects and site_settings
-- Version: 1.1
-- Changes: Made migration idempotent with DROP POLICY IF EXISTS, added TO clause, added null checks

BEGIN;

-- Enable RLS on projects (idempotent - ENABLE doesn't fail if already enabled)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Public read policy for projects (idempotent - DROP then CREATE)
DROP POLICY IF EXISTS "Public read access" ON projects;
CREATE POLICY "Public read access" ON projects
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Admin write policy for projects (idempotent - DROP then CREATE)
DROP POLICY IF EXISTS "Admin write access" ON projects;
CREATE POLICY "Admin write access" ON projects
  FOR ALL
  TO authenticated
  USING (
    auth.jwt() IS NOT NULL
    AND auth.jwt() ->> 'email' = (
      SELECT value
      FROM site_settings
      WHERE key = 'admin_email'
      LIMIT 1
    )
  )
  WITH CHECK (
    auth.jwt() IS NOT NULL
    AND auth.jwt() ->> 'email' = (
      SELECT value
      FROM site_settings
      WHERE key = 'admin_email'
      LIMIT 1
    )
  );

-- Enable RLS on site_settings (idempotent - ENABLE doesn't fail if already enabled)
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Public read policy for site_settings (idempotent - DROP then CREATE)
DROP POLICY IF EXISTS "Public read access" ON site_settings;
CREATE POLICY "Public read access" ON site_settings
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Admin write policy for site_settings (idempotent - DROP then CREATE)
DROP POLICY IF EXISTS "Admin write access" ON site_settings;
CREATE POLICY "Admin write access" ON site_settings
  FOR ALL
  TO authenticated
  USING (
    auth.jwt() IS NOT NULL
    AND auth.jwt() ->> 'email' = (
      SELECT value
      FROM site_settings
      WHERE key = 'admin_email'
      LIMIT 1
    )
  )
  WITH CHECK (
    auth.jwt() IS NOT NULL
    AND auth.jwt() ->> 'email' = (
      SELECT value
      FROM site_settings
      WHERE key = 'admin_email'
      LIMIT 1
    )
  );

COMMIT;
