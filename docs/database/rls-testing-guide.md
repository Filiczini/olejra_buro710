# RLS Policies Testing Guide

## Overview

This guide provides comprehensive testing instructions for verifying the Row Level Security (RLS) policies on the `projects` and `site_settings` tables.

---

## Prerequisites

Before testing RLS policies, ensure:

1. ✅ Migrations `001-init.sql` and `002-rls-policies.sql` have been applied
2. ✅ Supabase project is set up with anon key and service role key
3. ✅ Admin email is stored in `site_settings` table with key `admin_email`
4. ✅ You have valid JWT tokens for authenticated testing

---

## Test Setup

### 1. Set Up Admin Email in Database

```sql
-- Insert admin email into site_settings
INSERT INTO site_settings (key, value)
VALUES ('admin_email', 'admin@buro710.com')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
```

### 2. Get Your Supabase Credentials

From Supabase Dashboard > Settings > API:

- **Project URL**: `https://xxx.supabase.co`
- **Anon Key**: `eyJ...` (for public operations)
- **Service Role Key**: `eyJ...` (for admin operations, bypasses RLS)
- **JWT Secret**: (for generating custom test tokens)

### 3. Generate Test JWT Tokens

For comprehensive testing, you'll need JWT tokens for different scenarios:

```typescript
// Example: Generate test JWT with admin email
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.SUPABASE_JWT_SECRET; // From Supabase Dashboard

// Admin token
const adminToken = jwt.sign(
  { email: 'admin@buro710.com', aud: 'authenticated', role: 'authenticated' },
  JWT_SECRET,
  { expiresIn: '1h' }
);

// Non-admin token
const userToken = jwt.sign(
  { email: 'user@example.com', aud: 'authenticated', role: 'authenticated' },
  JWT_SECRET,
  { expiresIn: '1h' }
);
```

---

## Test Scenarios

### Scenario 1: Public Read Access (No Auth)

**Objective**: Verify that unauthenticated users can read from both tables

**Test Method**: Use Supabase Anon Key (no JWT)

```bash
# Using psql with anon key
psql "postgresql://postgres.xxx:password@aws-0-region.pooler.supabase.com:6543/postgres" -c "SELECT * FROM projects;"

# Using cURL with anon key
curl -X POST "https://xxx.supabase.co/rest/v1/projects" \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"select": "*"}'
```

**Expected Result**: ✅ Query succeeds and returns data

```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Project 1",
      ...
    }
  ],
  "error": null
}
```

---

### Scenario 2: Public Write Access Rejected (No Auth)

**Objective**: Verify that unauthenticated users cannot write to either table

**Test Method**: Use Supabase Anon Key (no JWT)

```bash
# Try to insert into projects
curl -X POST "https://xxx.supabase.co/rest/v1/projects" \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Unauthorized Project",
    "description": ["This should fail"]
  }'
```

**Expected Result**: ✅ Query fails with permission error

```json
{
  "data": null,
  "error": {
    "code": "42501",
    "message": "new row violates row-level security policy"
  }
}
```

---

### Scenario 3: Authenticated Admin Read Access

**Objective**: Verify that authenticated admin can read from both tables

**Test Method**: Use JWT with admin email + Service Role or Anon Key

```bash
curl -X POST "https://xxx.supabase.co/rest/v1/projects" \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"select": "*"}'
```

**Expected Result**: ✅ Query succeeds and returns data

---

### Scenario 4: Authenticated Admin Write Access

**Objective**: Verify that authenticated admin can write to both tables

**Test Method**: Use JWT with admin email + Service Role Key

```bash
# Insert a new project
curl -X POST "https://xxx.supabase.co/rest/v1/projects" \
  -H "apikey: YOUR_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Admin Test Project",
    "description": ["Created by admin"],
    "location": "Kyiv"
  }'

# Update a project
curl -X PATCH "https://xxx.supabase.co/rest/v1/projects?id=eq.UUID" \
  -H "apikey: YOUR_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Title"
  }'

# Delete a project
curl -X DELETE "https://xxx.supabase.co/rest/v1/projects?id=eq.UUID" \
  -H "apikey: YOUR_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

**Expected Result**: ✅ All operations succeed

---

### Scenario 5: Authenticated Non-Admin Write Access Rejected

**Objective**: Verify that authenticated non-admin users cannot write

**Test Method**: Use JWT with non-admin email + Anon Key

```bash
# Try to insert with non-admin JWT
curl -X POST "https://xxx.supabase.co/rest/v1/projects" \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer USER_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Unauthorized Project",
    "description": ["Should fail"]
  }'
```

**Expected Result**: ✅ Query fails with permission error

```json
{
  "data": null,
  "error": {
    "code": "42501",
    "message": "new row violates row-level security policy"
  }
}
```

---

### Scenario 6: Service Role Bypasses RLS

**Objective**: Verify that service role key bypasses RLS (for server operations)

**Test Method**: Use Service Role Key (no JWT or with any JWT)

```bash
curl -X POST "https://xxx.supabase.co/rest/v1/projects" \
  -H "apikey: YOUR_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Service Role Project",
    "description": ["Created with service role"]
  }'
```

**Expected Result**: ✅ Operation succeeds (service role bypasses RLS)

---

## Database-Level Tests

### Test 1: Verify RLS is Enabled

```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('projects', 'site_settings');
```

**Expected Output**:
```
 tablename    | rowsecurity
--------------+-------------
 projects     | t
 site_settings| t
```

---

### Test 2: Verify Policies Exist

```sql
SELECT
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

**Expected Output**:
```
 tablename    | policyname           | permissive | roles            | cmd  | qual
--------------+----------------------+------------+------------------+------+-----
 projects     | Admin write access  | t          | {authenticated}  | *    | ...
 projects     | Public read access  | t          | {anon,authenticated}| SELECT| true
 site_settings| Admin write access  | t          | {authenticated}  | *    | ...
 site_settings| Public read access  | t          | {anon,authenticated}| SELECT| true
```

---

### Test 3: Test RLS with Different Users in psql

Connect to your Supabase database and run these tests:

```sql
-- Test 1: Anon user can read
SET ROLE anon;
SELECT COUNT(*) FROM projects; -- Should work

-- Test 2: Anon user cannot write
SET ROLE anon;
INSERT INTO projects (title, description) VALUES ('Test', ARRAY['Test']);
-- ERROR: new row violates row-level security policy

-- Test 3: Authenticated user can read
SET ROLE authenticated;
SELECT COUNT(*) FROM projects; -- Should work

-- Test 4: Simulate admin write access
-- Note: This requires valid JWT, which is difficult in psql
-- Use HTTP API tests instead
```

---

## Performance Tests

### Test 1: Check Query Execution Plan with RLS

```sql
EXPLAIN ANALYZE
SELECT * FROM projects WHERE location = 'Kyiv';
```

**Expected**: Query should use indexes and complete quickly (< 100ms for typical datasets)

### Test 2: Test RLS Performance Impact

```sql
-- Time queries with RLS enabled
\timing on
SELECT COUNT(*) FROM projects;
SELECT * FROM site_settings WHERE key = 'admin_email';
```

**Expected**: Queries should complete in acceptable time (< 50ms for small datasets)

---

## Edge Cases

### Edge Case 1: Missing Admin Email

**Scenario**: `site_settings` table does not contain `admin_email` key

**Test**:
```sql
DELETE FROM site_settings WHERE key = 'admin_email';

-- Try admin operation
INSERT INTO projects (title, description) VALUES ('Test', ARRAY['Test']);
```

**Expected**: ❌ Query fails with permission error (no admin email = no admin access)

**Recovery**:
```sql
INSERT INTO site_settings (key, value)
VALUES ('admin_email', 'admin@buro710.com');
```

---

### Edge Case 2: Multiple Admin Emails

**Scenario**: Multiple rows in `site_settings` with `admin_email` key (shouldn't happen due to UNIQUE constraint)

**Test**:
```sql
-- Try to insert duplicate (should fail due to UNIQUE constraint)
INSERT INTO site_settings (key, value)
VALUES ('admin_email', 'admin2@buro710.com');
```

**Expected**: ❌ Insert fails due to UNIQUE constraint violation

---

### Edge Case 3: Null JWT Email

**Scenario**: JWT exists but email claim is null

**Test**: Use JWT without email claim

**Expected**: ❌ Query fails due to `auth.jwt() IS NOT NULL` check

---

### Edge Case 4: Admin Email Change During Session

**Scenario**: Admin changes their email while logged in

**Test**:
```sql
-- 1. User logs in (JWT contains old email)
-- 2. Admin updates admin_email in site_settings
UPDATE site_settings
SET value = 'new-admin@buro710.com'
WHERE key = 'admin_email';

-- 3. User tries admin operation with old JWT
-- This will fail because JWT email != stored admin email
```

**Expected**: ❌ Operations fail until user logs out and back in (refreshes JWT)

---

## Test Automation

### Automated Test Script (Node.js)

```typescript
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const jwtSecret = process.env.SUPABASE_JWT_SECRET!;

// Generate test tokens
const adminToken = jwt.sign(
  { email: 'admin@buro710.com', aud: 'authenticated', role: 'authenticated' },
  jwtSecret
);

const userToken = jwt.sign(
  { email: 'user@example.com', aud: 'authenticated', role: 'authenticated' },
  jwtSecret
);

async function runTests() {
  console.log('🧪 Running RLS Tests...\n');

  // Test 1: Public read access
  const publicClient = createClient(supabaseUrl, supabaseAnonKey);
  const { data, error } = await publicClient.from('projects').select('*').limit(1);
  console.log('✅ Test 1 - Public read access:', error ? 'FAIL' : 'PASS');

  // Test 2: Public write access rejected
  const { error: writeError } = await publicClient.from('projects').insert({
    title: 'Unauthorized',
    description: ['Should fail']
  });
  console.log('✅ Test 2 - Public write rejected:', writeError ? 'PASS' : 'FAIL');

  // Test 3: Admin write access
  const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
    global: { headers: { Authorization: `Bearer ${adminToken}` } }
  });
  const { error: adminError } = await adminClient.from('projects').insert({
    title: 'Admin Test',
    description: ['Should succeed']
  });
  console.log('✅ Test 3 - Admin write access:', adminError ? 'FAIL' : 'PASS');

  // Test 4: Non-admin write rejected
  const userClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${userToken}` } }
  });
  const { error: userError } = await userClient.from('projects').insert({
    title: 'Unauthorized',
    description: ['Should fail']
  });
  console.log('✅ Test 4 - Non-admin write rejected:', userError ? 'PASS' : 'FAIL');

  console.log('\n🎉 All tests completed!');
}

runTests();
```

---

## Common Issues and Solutions

### Issue: "new row violates row-level security policy"

**Cause**: User doesn't have permission for the operation

**Solutions**:
1. Verify JWT email matches `site_settings` `admin_email` value
2. Check that RLS is actually enabled on the table
3. Verify the policy exists and is correctly defined
4. Check that the JWT is valid and not expired

---

### Issue: "column auth.jwt() does not exist"

**Cause**: Running tests in psql without proper Supabase auth context

**Solution**: Use HTTP API tests or Supabase CLI for auth-dependent tests

---

### Issue: Slow queries with RLS

**Cause**: Missing indexes on columns used in policies

**Solution**: Ensure `site_settings_key_idx` exists on `site_settings(key)`

---

## Validation Checklist

Before deploying RLS policies to production, verify:

- [ ] Public read access works for both tables
- [ ] Public write access is rejected for both tables
- [ ] Authenticated admin can read both tables
- [ ] Authenticated admin can write to both tables
- [ ] Authenticated non-admin cannot write to either table
- [ ] Service role bypasses RLS
- [ ] RLS is enabled on both tables
- [ ] All policies exist and are correctly defined
- [ ] Indexes exist on `site_settings(key)`
- [ ] Queries complete in acceptable time
- [ ] Edge cases are handled correctly
- [ ] Migration is idempotent (can run multiple times)

---

## Additional Resources

- [Supabase RLS Testing](https://supabase.com/docs/guides/database/postgres/row-level-security#testing)
- [PostgreSQL RLS Testing](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
