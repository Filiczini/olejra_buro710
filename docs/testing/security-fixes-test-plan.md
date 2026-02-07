# Security Fixes Testing Plan

**Date**: 2025-02-07
**Purpose**: Test all security fixes before deployment

## Test Environment

**Base URL**: http://localhost:3000

**Required Tools**:
- `curl` - For API testing
- `npm` - For server control

---

## Test 1: Environment Variable Validation

### Test 1.1: Missing JWT_SECRET
**Purpose**: Verify server fails with clear error if JWT_SECRET missing

**Steps**:
1. Stop server
2. Remove `JWT_SECRET` from `.env`
3. Start server: `npm run dev:backend`

**Expected**:
```
Error: Missing required environment variables: JWT_SECRET
```

**Actual**:

**Status**: PASS | FAIL

---

### Test 1.2: Missing ADMIN_EMAIL
**Purpose**: Verify validation catches missing ADMIN_EMAIL

**Steps**:
1. Stop server
2. Remove `ADMIN_EMAIL` from `.env`
3. Start server

**Expected**:
```
Error: Missing required environment variables: ADMIN_EMAIL
```

**Actual**:

**Status**: PASS | FAIL

---

### Test 1.3: All Variables Present
**Purpose**: Verify server starts successfully with all required vars

**Steps**:
1. Ensure all required vars in `.env`:
   - JWT_SECRET
   - ADMIN_EMAIL
   - ADMIN_PASSWORD
   - SUPABASE_URL
   - SUPABASE_ANON_KEY
   - SUPABASE_SERVICE_ROLE_KEY
   - ALLOWED_ORIGINS
2. Start server

**Expected**:
```
Server running on port 3000
```

**Actual**:

**Status**: PASS | FAIL

---

## Test 2: CORS Configuration

### Test 2.1: Allowed Origin Request
**Purpose**: Verify CORS allows requests from whitelisted origins

**Steps**:
```bash
curl -i \
  -H "Origin: http://localhost:5173" \
  -H "Content-Type: application/json" \
  http://localhost:3000/api/portfolio
```

**Expected Headers**:
```
Access-Control-Allow-Origin: http://localhost:5173
Access-Control-Allow-Credentials: true
```

**Actual**:

**Status**: PASS | FAIL

---

### Test 2.2: Disallowed Origin Request
**Purpose**: Verify CORS blocks requests from non-whitelisted origins

**Steps**:
```bash
curl -i \
  -H "Origin: https://evil.com" \
  http://localhost:3000/api/portfolio
```

**Expected**:
```
Access-Control-Allow-Origin: NOT present (or error)
Status: CORS error
```

**Actual**:

**Status**: PASS | FAIL

---

### Test 2.3: Request with No Origin
**Purpose**: Verify CORS allows requests with no origin (curl, mobile apps)

**Steps**:
```bash
curl -i http://localhost:3000/api/portfolio
```

**Expected**: Returns data (no CORS restriction)

**Actual**:

**Status**: PASS | FAIL

---

## Test 3: Rate Limiting

### Test 3.1: Login Rate Limiting (Brute Force Protection)
**Purpose**: Verify 6th login attempt returns 429

**Steps**:
```bash
# Make 6 rapid login attempts
for i in {1..6}; do
  echo "Attempt $i:"
  curl -i -X POST \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}' \
    http://localhost:3000/api/admin/login
  echo "---"
done
```

**Expected**:
- Attempts 1-5: Return 401 or 400
- Attempt 6: Return 429 with "Too many login attempts" message
- Includes `Retry-After` header

**Actual**:

**Status**: PASS | FAIL

---

### Test 3.2: API Rate Limiting (DoS Protection)
**Purpose**: Verify standard API rate limiting works

**Steps**:
```bash
# Make 101 rapid requests
for i in {1..101}; do
  curl -s http://localhost:3000/api/portfolio > /dev/null
  if [ $i -eq 1 ] || [ $i -eq 50 ] || [ $i -eq 100 ] || [ $i -eq 101 ]; then
    echo "Request $i: $(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/portfolio)"
  fi
done
```

**Expected**:
- Requests 1-100: Return 200
- Request 101: Return 429 with "Too many requests" message

**Actual**:

**Status**: PASS | FAIL

---

### Test 3.3: Rate Limit Reset After Window
**Purpose**: Verify rate limit resets after window expires

**Steps**:
```bash
# This test requires waiting, skipping for manual verification
# Rate limits: 15 minutes for login, 1 minute for API
```

**Expected**: After window expires, requests return 200 again

**Status**: SKIPPED (manual verification needed)

---

## Test 4: JWT Configuration

### Test 4.1: JWT Fallback Removed
**Purpose**: Verify server fails if JWT_SECRET is invalid/fallback

**Steps**:
1. Set `JWT_SECRET=insecure` in `.env`
2. Start server

**Expected**: Server starts (insecure but no hardcoded fallback)

**Actual**:

**Status**: PASS | FAIL (PASS = no hardcoded fallback)

---

### Test 4.2: JWT Token Generation
**Purpose**: Verify login generates valid JWT token

**Steps**:
```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}' \
  http://localhost:3000/api/admin/login
```

**Expected**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { "email": "admin@example.com" }
}
```

**Actual**:

**Status**: PASS | FAIL

---

### Test 4.3: JWT Token Expiry Configurable
**Purpose**: Verify JWT_EXPIRES_IN can be configured

**Steps**:
1. Set `JWT_EXPIRES_IN=1h` in `.env`
2. Login and decode token (use jwt.io)
3. Check `exp` timestamp

**Expected**: Token expires 1 hour from `iat`

**Status**: SKIPPED (manual verification)

---

## Test 5: Security Headers (Helmet)

### Test 5.1: Content Security Policy (CSP)
**Purpose**: Verify CSP header is present

**Steps**:
```bash
curl -i http://localhost:3000/api/portfolio | grep -i "content-security-policy"
```

**Expected**:
```
Content-Security-Policy: default-src 'self'; style-src 'self' 'unsafe-inline'; ...
```

**Actual**:

**Status**: PASS | FAIL

---

### Test 5.2: HSTS (HTTP Strict Transport Security)
**Purpose**: Verify HSTS header is present

**Steps**:
```bash
curl -i http://localhost:3000/api/portfolio | grep -i "strict-transport-security"
```

**Expected**:
```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

**Actual**:

**Status**: PASS | FAIL

---

### Test 5.3: X-Frame-Options
**Purpose**: Verify clickjacking protection

**Steps**:
```bash
curl -i http://localhost:3000/api/portfolio | grep -i "x-frame-options"
```

**Expected**:
```
X-Frame-Options: SAMEORIGIN
```

**Actual**:

**Status**: PASS | FAIL

---

### Test 5.4: X-Content-Type-Options
**Purpose**: Verify MIME sniffing protection

**Steps**:
```bash
curl -i http://localhost:3000/api/portfolio | grep -i "x-content-type-options"
```

**Expected**:
```
X-Content-Type-Options: nosniff
```

**Actual**:

**Status**: PASS | FAIL

---

### Test 5.5: X-XSS-Protection
**Purpose**: Verify XSS protection

**Steps**:
```bash
curl -i http://localhost:3000/api/portfolio | grep -i "x-xss-protection"
```

**Expected**:
```
X-XSS-Protection: 1; mode=block
```

**Actual**:

**Status**: PASS | FAIL

---

### Test 5.6: Referrer-Policy
**Purpose**: Verify referrer policy

**Steps**:
```bash
curl -i http://localhost:3000/api/portfolio | grep -i "referrer-policy"
```

**Expected**:
```
Referrer-Policy: strict-origin-when-cross-origin
```

**Actual**:

**Status**: PASS | FAIL

---

## Test 6: Dual Supabase Clients

### Test 6.1: Anon Client Exists
**Purpose**: Verify supabaseAnon client is available

**Steps**:
1. Check `src/server/config/supabase.ts` exports
2. Verify `export const supabaseAnon = ...`

**Expected**: supabaseAnon exported and uses SUPABASE_ANON_KEY

**Actual**:

**Status**: PASS | FAIL

---

### Test 6.2: Admin Client Exists
**Purpose**: Verify supabaseAdmin client is available

**Steps**:
1. Check `src/server/config/supabase.ts` exports
2. Verify `export const supabaseAdmin = ...`

**Expected**: supabaseAdmin exported and uses SUPABASE_SERVICE_ROLE_KEY

**Actual**:

**Status**: PASS | FAIL

---

### Test 6.3: Backward Compatibility
**Purpose**: Verify default export exists for existing code

**Steps**:
1. Check `src/server/config/supabase.ts` exports
2. Verify `export const supabase = supabaseAdmin`

**Expected**: Default export points to supabaseAdmin

**Actual**:

**Status**: PASS | FAIL

---

## Test 7: Functionality Tests

### Test 7.1: Health Endpoint
**Purpose**: Verify health endpoint works

**Steps**:
```bash
curl -i http://localhost:3000/health
```

**Expected**:
```json
{
  "status": "ok",
  "timestamp": "2026-02-07T..."
}
```

**Actual**:

**Status**: PASS | FAIL

---

### Test 7.2: Login Success
**Purpose**: Verify login with valid credentials works

**Steps**:
```bash
curl -i -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}' \
  http://localhost:3000/api/admin/login
```

**Expected**:
- Status: 200
- Response contains `token` and `user`
- Token can be used for authenticated requests

**Actual**:

**Status**: PASS | FAIL

---

### Test 7.3: Login Failure (Wrong Email)
**Purpose**: Verify login fails with wrong email

**Steps**:
```bash
curl -i -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"wrong@example.com","password":"admin123"}' \
  http://localhost:3000/api/admin/login
```

**Expected**:
- Status: 401
- Response: `{"error":"Invalid credentials"}`

**Actual**:

**Status**: PASS | FAIL

---

### Test 7.4: Login Failure (Wrong Password)
**Purpose**: Verify login fails with wrong password

**Steps**:
```bash
curl -i -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"wrongpassword"}' \
  http://localhost:3000/api/admin/login
```

**Expected**:
- Status: 401
- Response: `{"error":"Invalid credentials"}`

**Actual**:

**Status**: PASS | FAIL

---

### Test 7.5: Logout Endpoint
**Purpose**: Verify logout endpoint requires auth

**Steps**:
```bash
# Without token
curl -i -X POST http://localhost:3000/api/admin/logout

# With valid token
TOKEN="your-jwt-token-here"
curl -i -X POST \
  -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/admin/logout
```

**Expected**:
- Without token: 401 Unauthorized
- With token: 200 OK with `{"message":"Logged out successfully"}`

**Actual**:

**Status**: PASS | FAIL

---

### Test 7.6: Public Portfolio Endpoint
**Purpose**: Verify public endpoints work without auth

**Steps**:
```bash
curl -i http://localhost:3000/api/portfolio
```

**Expected**:
- Status: 200
- Response contains projects data

**Actual**:

**Status**: PASS | FAIL

---

## Test 8: Database Migrations

### Test 8.1: Migration Files Exist
**Purpose**: Verify migration files created

**Steps**:
```bash
ls -la *.sql
```

**Expected**:
```
001-init.sql
002-rls-policies.sql
```

**Actual**:

**Status**: PASS | FAIL

---

### Test 8.2: Migration Idempotency
**Purpose**: Verify migrations can run multiple times

**Steps**:
1. Check if migrations use `IF NOT EXISTS`
2. Check if policies use `DROP POLICY IF EXISTS`

**Expected**:
- CREATE TABLE uses `IF NOT EXISTS`
- CREATE POLICY uses `DROP POLICY IF EXISTS` first

**Actual**:

**Status**: PASS | FAIL

---

### Test 8.3: Migration Documentation
**Purpose**: Verify migrations are documented

**Steps**:
1. Check `001-init.sql` for comments
2. Check `002-rls-policies.sql` for comments

**Expected**:
- Comments describe tables and columns
- Comments explain policies

**Actual**:

**Status**: PASS | FAIL

---

## Test 9: RLS Policies

### Test 9.1: RLS Enabled
**Purpose**: Verify RLS is enabled on tables

**Steps**:
Run in Supabase SQL Editor or via psql:
```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('projects', 'site_settings');
```

**Expected**:
```
projects      | t
site_settings | t
```

**Actual**:

**Status**: PASS | FAIL

---

### Test 9.2: Public Read Policy Exists
**Purpose**: Verify public read policy exists

**Steps**:
```sql
SELECT tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('projects', 'site_settings');
```

**Expected**:
- "Public read access" policy exists
- `permissive` is `true`
- `roles` includes `anon`, `authenticated`, or `pg_public`

**Actual**:

**Status**: PASS | FAIL

---

### Test 9.3: Admin Write Policy Exists
**Purpose**: Verify admin write policy exists

**Steps**:
```sql
SELECT tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('projects', 'site_settings');
```

**Expected**:
- "Admin write access" policy exists
- `cmd` includes `INSERT`, `UPDATE`, `DELETE`

**Actual**:

**Status**: PASS | FAIL

---

## Test 10: Configuration Files

### Test 10.1: .env.example Updated
**Purpose**: Verify .env.example has all required variables

**Steps**:
```bash
grep -E "^(JWT_SECRET|ADMIN_EMAIL|ADMIN_PASSWORD|SUPABASE_URL|SUPABASE_ANON_KEY|SUPABASE_SERVICE_ROLE_KEY|ALLOWED_ORIGINS)" .env.example
```

**Expected**: All 7 variables present with example values

**Actual**:

**Status**: PASS | FAIL

---

### Test 10.2: Dependencies Installed
**Purpose**: Verify security packages installed

**Steps**:
```bash
grep -E "(helmet|express-rate-limit)" package.json
```

**Expected**:
```
"helmet": "^7.x.x",
"express-rate-limit": "^7.x.x"
```

**Actual**:

**Status**: PASS | FAIL

---

## Summary Report

### Test Results

| Test # | Description | Status | Notes |
|--------|-------------|--------|-------|
| 1.1 | Missing JWT_SECRET validation | | |
| 1.2 | Missing ADMIN_EMAIL validation | | |
| 1.3 | All vars present | | |
| 2.1 | Allowed origin CORS | | |
| 2.2 | Disallowed origin CORS | | |
| 2.3 | No origin CORS | | |
| 3.1 | Login rate limiting | | |
| 3.2 | API rate limiting | | |
| 3.3 | Rate limit reset | | |
| 4.1 | JWT fallback removed | | |
| 4.2 | JWT generation | | |
| 4.3 | JWT expiry configurable | | |
| 5.1 | CSP header | | |
| 5.2 | HSTS header | | |
| 5.3 | X-Frame-Options | | |
| 5.4 | X-Content-Type-Options | | |
| 5.5 | X-XSS-Protection | | |
| 5.6 | Referrer-Policy | | |
| 6.1 | Anon client exists | | |
| 6.2 | Admin client exists | | |
| 6.3 | Backward compatibility | | |
| 7.1 | Health endpoint | | |
| 7.2 | Login success | | |
| 7.3 | Login wrong email | | |
| 7.4 | Login wrong password | | |
| 7.5 | Logout endpoint | | |
| 7.6 | Public portfolio | | |
| 8.1 | Migration files | | |
| 8.2 | Migration idempotency | | |
| 8.3 | Migration documentation | | |
| 9.1 | RLS enabled | | |
| 9.2 | Public read policy | | |
| 9.3 | Admin write policy | | |
| 10.1 | .env.example updated | | |
| 10.2 | Dependencies installed | | |

### Pass/Fail Summary

- **Total Tests**: 33
- **Passed**: 0
- **Failed**: 0
- **Skipped**: 0
- **Pass Rate**: 0%

### Critical Issues Found

List any blocking issues that must be fixed before deployment:

1. 
2. 
3. 

### Warnings

List non-blocking issues that should be addressed soon:

1. 
2. 
3. 

---

## Deployment Checklist

Before deploying to production, ensure:

- [ ] All critical tests (Tests 1, 3, 5, 9) pass
- [ ] Environment variables configured with production values
- [ ] JWT_SECRET is strong (minimum 32 characters, random)
- [ ] ADMIN_PASSWORD is strong (minimum 12 characters, mix of types)
- [ ] ALLOWED_ORIGINS set to production domain(s) only
- [ ] Database migrations run successfully on production DB
- [ ] RLS policies tested on production DB
- [ ] All console.log/debug statements removed or logged properly
- [ ] HTTPS/TLS configured on production server
- [ ] Monitoring/logging configured

---

## Test Execution Log

**Tested By**: OpenAgent
**Tested Date**: 2025-02-07
**Test Environment**: Local development
**Server Version**: 0.0.0 (security-fixes branch)
