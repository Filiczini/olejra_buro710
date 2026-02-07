# Database Migrations Guide

## Overview

This document provides comprehensive information about the database migrations for the Buro710 Portfolio Site.

---

## Migration Files

### 001-init.sql
**Description**: Create initial database schema for projects and site_settings
**Version**: 1.0
**Status**: ✅ Complete

**Tables Created**:
- `projects` - Portfolio projects with comprehensive metadata
- `site_settings` - Site configuration key-value pairs

**Indexes Created**:
- `projects_created_at_idx` - For sorting projects by date
- `projects_tags_gin` - For querying projects by tags
- `projects_location_idx` - For filtering by location
- `projects_year_idx` - For filtering by year
- `site_settings_key_idx` - For fast key-value lookups (critical for RLS performance)

---

### 002-rls-policies.sql
**Description**: Enable Row Level Security (RLS) and create access policies
**Version**: 1.1
**Status**: ✅ Complete and Idempotent

**Policies Created**:

#### projects table

**Public Read Access**:
- **Policy Name**: "Public read access"
- **Roles**: `anon`, `authenticated`
- **Operation**: `SELECT`
- **Rule**: Allow everyone to read project data
- **Purpose**: Portfolio projects should be publicly accessible

**Admin Write Access**:
- **Policy Name**: "Admin write access"
- **Roles**: `authenticated` only
- **Operations**: `ALL` (INSERT, UPDATE, DELETE)
- **Rule**: Only the authenticated admin email can modify projects
- **Purpose**: Secure admin operations through JWT verification

#### site_settings table

**Public Read Access**:
- **Policy Name**: "Public read access"
- **Roles**: `anon`, `authenticated`
- **Operation**: `SELECT`
- **Rule**: Allow everyone to read site settings
- **Purpose**: Site configuration should be publicly readable

**Admin Write Access**:
- **Policy Name**: "Admin write access"
- **Roles**: `authenticated` only
- **Operations**: `ALL` (INSERT, UPDATE, DELETE)
- **Rule**: Only the authenticated admin email can modify settings
- **Purpose**: Secure admin operations through JWT verification

---

## How RLS Works

### Architecture

The RLS policies use a **dynamic admin email lookup** pattern:

1. **Admin Email Storage**: The admin email is stored in `site_settings` table with key `admin_email`
2. **JWT Verification**: On each request, Supabase extracts the JWT and checks `auth.jwt() ->> 'email'`
3. **Dynamic Authorization**: The policy queries the `site_settings` table to get the current admin email
4. **Access Control**: If the JWT email matches the stored admin email, access is granted

### Benefits

✅ **Flexible Admin Management**: Change admin email by updating `site_settings` table
✅ **Security**: Admin email is not hardcoded in policies
✅ **Audit Trail**: All admin operations can be tracked
✅ **Defense in Depth**: RLS works even if API layer is compromised

### Performance Considerations

- The `site_settings_key_idx` index ensures fast lookups for admin_email
- `LIMIT 1` prevents multiple rows from being returned
- `auth.jwt() IS NOT NULL` check prevents unnecessary queries for unauthenticated users
- Policies specify roles (`TO authenticated`) so they only execute for authenticated requests

---

## Migration Execution Order

Migrations must be executed in this order:

1. `001-init.sql` - Create tables and indexes
2. `002-rls-policies.sql` - Enable RLS and create policies

### Why This Order Matters

- RLS policies require tables to exist first
- Policies depend on the `site_settings_key_idx` for performance
- ALTER TABLE ENABLE ROW LEVEL SECURITY must precede CREATE POLICY

---

## Applying Migrations

### Using psql (Direct)

```bash
# Apply migration 001
psql -h db.xxx.supabase.co -U postgres -d postgres -f 001-init.sql

# Apply migration 002
psql -h db.xxx.supabase.co -U postgres -d postgres -f 002-rls-policies.sql
```

### Using Supabase CLI (Recommended)

```bash
# Initialize Supabase project (if not already done)
supabase init

# Link to your project
supabase link --project-ref <your-project-ref>

# Apply migrations to local database
supabase db reset

# Apply migrations to remote database
supabase db push
```

### Checking Migration Status

```sql
-- View all applied migrations
SELECT * FROM supabase_migrations.schema_migrations ORDER BY version;

-- View all tables
SELECT tablename FROM pg_tables WHERE schemaname = 'public';

-- View RLS status
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('projects', 'site_settings');

-- View all policies
SELECT * FROM pg_policies WHERE schemaname = 'public';
```

---

## Idempotency

All migrations are designed to be **idempotent** - they can be run multiple times without errors.

### 001-init.sql

- Uses `CREATE TABLE IF NOT EXISTS` for tables
- Uses `CREATE INDEX IF NOT EXISTS` for indexes
- Can be run multiple times safely

### 002-rls-policies.sql

- Uses `DROP POLICY IF EXISTS` before `CREATE POLICY`
- Uses `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` (idempotent)
- Wrapped in transaction (`BEGIN; ... COMMIT;`)
- Can be run multiple times safely

---

## Rolling Back Migrations

### Rollback 002-rls-policies.sql

```sql
BEGIN;

-- Disable RLS on tables
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings DISABLE ROW LEVEL SECURITY;

-- Note: Policies are automatically dropped when RLS is disabled

COMMIT;
```

### Rollback 001-init.sql

⚠️ **Warning**: Rolling back table migrations will delete all data!

```sql
BEGIN;

-- Drop tables (CASCADE will drop dependent objects like policies)
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS site_settings CASCADE;

COMMIT;
```

---

## Best Practices

1. **Always test migrations in development/staging first**
2. **Backup production database before applying migrations**
3. **Use transactions for related changes**
4. **Test idempotency by running migrations twice**
5. **Monitor migration execution time in production**
6. **Document all migration changes**

---

## Troubleshooting

### Issue: Migration Fails Due to Existing Policy

**Error**: `policy "policy_name" on table "table_name" already exists`

**Solution**: The 002-rls-policies.sql migration uses `DROP POLICY IF EXISTS`, so this should not happen. If it does, manually drop the policy:

```sql
DROP POLICY IF EXISTS "policy_name" ON table_name;
```

### Issue: Slow Query Performance with RLS

**Symptoms**: Queries to `projects` table are slow

**Solution**: Ensure the `site_settings_key_idx` index exists:

```sql
-- Check if index exists
SELECT indexname FROM pg_indexes
WHERE tablename = 'site_settings'
AND indexname = 'site_settings_key_idx';

-- If missing, create it
CREATE INDEX IF NOT EXISTS site_settings_key_idx
ON site_settings (key);
```

### Issue: Admin Cannot Access Data After Email Change

**Symptoms**: After changing admin email in `site_settings`, admin operations fail

**Solution**: The user needs to log out and log back in to get a new JWT with the updated email. JWTs contain the email at the time of login and are not refreshed until re-authentication.

---

## Additional Resources

- [Supabase RLS Guide](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [PostgreSQL CREATE POLICY](https://www.postgresql.org/docs/current/sql-createpolicy.html)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli)
- [PostgreSQL Indexes](https://www.postgresql.org/docs/current/indexes.html)
