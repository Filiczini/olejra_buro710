# Application Audit Report
_Date: 2026-05-06_
_Stack: React 19 + Express 5 + Drizzle ORM + PostgreSQL 16 + Docker + npm workspaces_

---

## Executive Summary
- **Total issues found:** 165+
- **Critical:** 16 | **High:** 40 | **Medium:** 55 | **Low:** 54
- **Agents run:** 10 / 10
- **Overall health score:** 4 / 10

The codebase has strong TypeScript strictness and clean circular-dependency hygiene, but it is undermined by **multiple unpatched HIGH-severity CVEs**, **missing database indexes**, **inconsistent API contracts**, **broken test suites** (4 critical service test files fail to load), and significant **business logic leakage into route handlers**. The most urgent work is patching dependencies, adding database indexes, fixing the broken test files, and moving JWT out of localStorage.

---

## Issues by severity

### 🔴 Critical (must fix immediately)

| # | Agent | File | Line | Issue | Fix |
|---|-------|------|------|-------|-----|
| 1 | Security | `.env`, `backend/.env` | — | Production secrets exist in untracked `.env` files (not in git history, but present in repo directory). Risk of accidental commit. | Ensure `.env` and `backend/.env` remain in `.gitignore`. Consider `.envrc` or 1Password for local secret management. |
| 2 | Security / DevOps | `backend/package.json`, `frontend/package.json` | — | 11 HIGH-severity dependency CVEs: `drizzle-orm` (SQL injection), `multer` (DoS), `express-rate-limit` (IPv6 bypass), `axios` (SSRF), `vite` (path traversal), `undici` (smuggling), `flatted` (DoS), `minimatch` (ReDoS), `picomatch` (ReDoS), `rollup` (path traversal) | Run `npm audit fix` in root, backend, and frontend. Prioritize upgrading `drizzle-orm`, `multer`, `express-rate-limit`, `axios`, `vite`. |
| 3 | Database | `backend/src/db/schema.ts` | — | Zero indexes beyond PKs and one unique constraint. High-traffic columns (`posts.slug`, `posts.status`, `posts.deleted_at`, `posts.featured`, `blocks.post_id`, `activity_logs.user_email`, `refresh_tokens.user_id`) are unindexed. | Add Drizzle `.index()` declarations for every column used in `WHERE`, `ORDER BY`, or `JOIN`. |
| 4 | API Contract | `backend/src/routes/posts.ts` | 419 | `DELETE /api/posts/:id` returns `500` when post is missing because `NotFoundError` is caught as generic error. | Check `error instanceof AppError && error.statusCode === 404` in the catch block; return `404`. |
| 5 | API Contract | `backend/src/routes/api/v1/posts.ts` | 141 | `GET /api/v1/posts/:id` returns `404` for **any** error, including DB connection failures. A crashed DB is indistinguishable from a missing post. | Inspect error type: return `404` only for `NotFoundError`; return `500` for unexpected errors. |
| 6 | Code Quality | `backend/src/migrate-from-supabase.ts` | 1 | Entire 130-line migration script disabled with `@ts-nocheck`, masking runtime errors during destructive data operations. | Remove `@ts-nocheck`, fix resulting type errors, add explicit types. |
| 7 | Code Quality | `backend/src/index.ts` | 167-188 | Global error handler uses fragile `err.message?.includes('File too large')` and `'Only JPEG and PNG'` string matching to assign HTTP status codes. | Use `err.code` (e.g., `LIMIT_FILE_SIZE`) or `instanceof` checks instead of message substrings. |
| 8 | Test Coverage | `backend/src/services/__tests__/` | — | 4 service test files (`activityLogService`, `blockService`, `contactService`, `postService`) fail to load due to `vi.mock` hoisting (`ReferenceError` on uninitialized variables). **Zero tests execute** for the most critical services. | Move mock variables inside the factory function or use `vi.doMock` to avoid hoisting issues. |
| 9 | Security | `backend/src/routes/api/v1/posts.ts` | 114-135 | External API `GET /api/v1/posts` returns **draft posts** when no `status` filter is provided, exposing unpublished content to any API key holder. | Default `status` to `'published'` in the external API route if not explicitly requested. |
| 10 | DevOps | `docker-compose.dev.yml` | 9, 46 | `POSTGRES_PASSWORD: devpassword` and `DATABASE_URL` with embedded password are hardcoded in compose file. | Move credentials to `.env` and reference via `${POSTGRES_PASSWORD}`. |
| 11 | Performance | `backend/src/middleware/multer.ts` | 5 | Multer uses `memoryStorage()`. A single request can upload up to 25 files at 10 MB each = 250 MB+ of heap. Concurrent uploads will crash the Node process. | Switch to `diskStorage()` or stream uploads directly to filesystem. |
| 12 | Frontend | `frontend/src/components/blocks/ImageFullBlock.tsx` | 13 | Invalid Tailwind class `p-5vh`. Tailwind requires bracket notation for arbitrary values (`p-[5vh]`). The padding is silently ignored. | Change to `p-[5vh]` or use a standard spacing token. |
| 13 | Database | `backend/src/services/postService.ts` | 157-172, 189-201, 223-252 | `create`, `update`, and `permanentDelete` perform multi-table operations (posts + blocks + filesystem) **without transactions**. Orphaned rows and inconsistent state on failure. | Wrap all multi-step mutations in `db.transaction()`. Perform filesystem cleanup after DB commit. |
| 14 | Architecture | `backend/src/routes/posts.ts` | 104-249, 252-416 | POST/PUT route handlers contain ~145-164 lines of business logic: image upload orchestration, block image extraction, gallery merging, activity-log diffing, JSON parsing. | Move file/block orchestration into `postService.createWithMedia()` / `updateWithMedia()`. Routes should only validate auth, parse body, call service, and return. |
| 15 | Architecture | `backend/src/routes/auth.ts` | 29-64 | `bcrypt.compare` and token generation orchestration live directly in the route handler. | Move to `userService.validatePassword()` and `authService.generateTokens()`. |
| 16 | Security | `frontend/src/api/client.ts`, `backend/src/routes/auth.ts` | 24-29, 43-55 | JWT access and refresh tokens are stored in `localStorage`, making them vulnerable to XSS theft. | Store access token in short-lived `httpOnly`, `secure`, `sameSite=strict` cookie. Store refresh token in separate `httpOnly` cookie. |

### 🟠 High (fix before next release)

| # | Agent | File | Line | Issue | Fix |
|---|-------|------|------|-------|-----|
| 17 | API Contract | `backend/src/docs/swagger.ts` | 23 | Swagger `Error` schema defines `{ error, message }`, but runtime returns `{ error }` or `{ error, details }`. | Align schema with runtime or vice versa. |
| 18 | API Contract | `backend/src/docs/swagger.ts` | 28 | Swagger `ValidationError` schema defines `{ errors: string[] }`, but runtime returns `{ error: 'Validation failed', details: [{ field, message }] }`. | Update schema to match actual response shape. |
| 19 | API Contract | `backend/src/routes/api/v1/posts.ts` | 235, 364 | Swagger claims `PostWithBlocks` (`{ post, blocks }`) on create/update, but runtime returns raw `Post` object. | Either update Swagger schema to `Post` or return `{ post, blocks }` from the route. |
| 20 | API Contract | `backend/src/routes/posts.ts` | 244, 405 | Internal API `POST/PUT` returns raw `Post`, but `GET /:id` returns `{ post, blocks }`. Consumers must handle two shapes for the same resource. | Unify create/update/read to return the same envelope. |
| 21 | API Contract | `backend/src/routes/api/v1/posts.ts` | 156-240 | JSON mode Swagger docs claim `blocks`, `hero_tags`, and `gallery_images` are strings for JSON-stringify, but JSON clients send actual arrays. `parseJsonField` calls `JSON.parse(value)` on arrays/objects and throws. | Accept both raw JSON arrays/objects and stringified JSON, or update Swagger schema to `type: array`. |
| 22 | API Contract | All `/:id` routes | — | No path parameter format validation. Malformed IDs produce `500` instead of `400`. | Add UUID/integer regex validation middleware on `/:id` routes. |
| 23 | API Contract | `backend/src/routes/contact.ts` | 28 | `POST /api/contact` inserts a DB row but returns `200` instead of semantically correct `201`. | Return `201 Created`. |
| 24 | Database | `backend/src/services/blockService.ts` | 76-84 | `reorder()` fires N individual `UPDATE` statements via `Promise.all`. | Replace with a single bulk `UPDATE ... CASE` expression. |
| 25 | Database | `backend/src/services/blockService.ts` | 108-135 | `syncBlocks` issues individual `UPDATE` per block. 20 blocks = 20 sequential UPDATEs. | Batch updates with `db.update().set().where(inArray(blocks.id, [...]))`. |
| 26 | Database | `backend/src/services/postService.ts` | 144-153 | Slug uniqueness check uses a `while(true)` loop, issuing one `SELECT` per iteration. | Use a single query with `ilike` or `regexp` to find next available suffix, or use `INSERT ... ON CONFLICT`. |
| 27 | Performance | `backend/src/routes/api/posts.ts` | 84-88, 327-329 | External API gallery uploads use sequential `for...of` with `await storageService.uploadImage()`. 20 images take ~20s instead of ~1s. | Replace with `Promise.all(galleryFiles.map(...))`. |
| 28 | Performance | `backend/src/services/postService.ts` | 126, 254 | `getFeatured()` and `getBySlug()` are uncached. Called on every homepage and page view. | Add a short-lived in-memory cache (e.g., LRU) with 60-300s TTL. |
| 29 | Performance | `backend/src/services/postService.ts` | 73-113 | `getAll()` selects all 20+ columns including heavy `gallery_images` and `hero_tags` arrays, even though list views only need title, slug, status, featured. | Create a lightweight `PostListItem` projection for list queries. |
| 30 | Performance | `frontend/src/components/sections/HeroSlider.tsx` | 82 | All slide images rendered as `absolute inset-0` simultaneously; browser often fetches all 5 hero images at once. | Render only current, previous, and next slides; remove off-screen slides from DOM. |
| 31 | Performance | `backend/src/routes/users.ts` | 13-21 | `GET /api/admin/users` returns all rows with no `LIMIT` or pagination. | Add `page`/`limit` params to `userService.findAll()` and the route. |
| 32 | Code Quality | `backend/src/routes/posts.ts` | 104-249 | POST handler is ~145 lines, violating SRP. Mixes validation, uploads, hero/OG image processing, block mapping, gallery management, activity logging. | Extract into helper functions or service methods (`processHeroImages`, `buildActivityLogChanges`). |
| 33 | Code Quality | `backend/src/routes/posts.ts` | 252-416 | PUT handler is ~164 lines, duplicating much of POST logic plus change-tracking. | Create a shared `updatePostFromRequest` abstraction for internal and external routes. |
| 34 | Code Quality | `backend/src/routes/api/posts.ts` | 246-371 | PUT handler is ~125 lines with duplicated file/URL priority logic. | Extract a reusable `processPostFiles` helper or consolidate with internal route utilities. |
| 35 | Code Quality | `frontend/src/hooks/usePostForm.ts` | 1-325 | File is 325 lines, managing form state, draft autosave, file handling, validation, submission, navigation, and dirty tracking. | Split into smaller hooks (`usePostAutosave`, `usePostFiles`, `usePostSubmit`) or move logic into a service layer. |
| 36 | Code Quality | `frontend/src/pages/admin/PostsPage.tsx` | 1-515 | File is 515 lines, mixing list rendering, pagination, bulk selection, bulk deletion modals, search, filtering, and toast management. | Extract sub-components (`PostList`, `DeleteModal`, `BulkActionsToolbar`) and move utility functions out. |
| 37 | Code Quality | `backend/src/routes/posts.ts` | 46-49 | Pagination parameter parsing is duplicated identically in `backend/src/routes/api/posts.ts` (lines 118-121). | Create a shared `parsePaginationParams(req.query)` utility. |
| 38 | Code Quality | Multiple files | — | `process.env` accessed outside `config/env.ts` in `jwt.ts`, `db/index.ts`, `telegramService.ts`, `storageService.ts`, `apiKey.ts`, `logger.ts`, `posts.ts`, `activityLogs.ts`, `api/posts.ts`, `index.ts` | Route all environment access through `backend/src/config/env.ts`. Import `env` everywhere. |
| 39 | Code Quality | Multiple backend services | — | `new Error(...)` thrown instead of `AppError` subclasses, breaking the global error handler's ability to assign correct status codes. | Replace with `AppError`, `ValidationError`, or `NotFoundError` as appropriate. |
| 40 | Security | `backend/src/routes/auth.ts:37`, `backend/src/routes/users.ts:37` | — | `bcrypt.hash(password, 10)` uses default 10 rounds. OWASP recommends 12+ for modern hardware. | Increase salt rounds to at least 12. |
| 41 | Security | `backend/src/routes/auth.ts` | 80-120 | `/api/admin/refresh` has **no rate limiting**. Unlimited refresh token validation requests create a DoS vector. | Add `express-rate-limit` to the refresh endpoint (e.g., 10/min per IP). |
| 42 | Security | `backend/src/index.ts` | 27 | `app.set('trust proxy', 1)` trusts the first proxy. If deployed without a reverse proxy, attackers can spoof IPs and bypass rate limiting. | Configure via environment variable (e.g., `TRUST_PROXY_COUNT`). |
| 43 | DevOps | `backend/Dockerfile` | 10 | `npm install` installs all dependencies including devDependencies; no `npm prune --production` or multi-stage build. | Add `--omit=dev` or switch to multi-stage build. |
| 44 | DevOps | `docker-compose.yml` | — | Backend service has no `healthcheck` defined, despite frontend depending on it. | Add a `healthcheck` to the backend service in compose. |
| 45 | DevOps | `.github/workflows/test.yml` | 36-37 | Backend tests run without a PostgreSQL service container. If tests are not fully mocked, they will fail in CI. | Add a `services:` block with `postgres:16-alpine` and pass connection string via env vars. |
| 46 | DevOps | `backend/.dockerignore` | 12-14 | `.dockerignore` ignores `src/` and all `*.ts` files, breaking `docker-compose.dev.yml` dev builds which copy the full context. | Remove `src` and `*.ts` from `.dockerignore` or create a separate `.dockerignore.dev`. |
| 47 | Architecture | `backend/src/index.ts` | — | God file (193 lines, 7 responsibilities): wires Express, Helmet, CORS, static uploads, route mounting, inline Swagger HTML, health checks, SPA fallback, global error handler. | Extract into `docs/swagger-ui.ts`, `middleware/startup.ts`, `middleware/health.ts`, `middleware/static.ts`. |
| 48 | Architecture | `backend/src/services/storageService.ts` | 3 | Service imports `validateFileSignature` from `../middleware/multer`. Services should never depend on middleware. | Move `validateFileSignature` and `MAGIC_BYTES` to `lib/files.ts`. |
| 49 | Architecture | All route files | — | Every route wraps its body in `try/catch`, logs locally, and returns `res.status(500).json(...)` directly, bypassing the global error handler. | Remove local `try/catch` blocks and use `next(error)` or an `asyncHandler` wrapper. |
| 50 | Architecture | Multiple route files | — | Magic numbers duplicated everywhere: `60 * 1000` rate-limit windows, `parseInt(page, 10) || 1`, `Math.min(100, ...)`, `bcrypt.hash(password, 10)`, `files: 25`, `pool.max: 5`. | Centralize constants in `backend/src/config/constants.ts`. |
| 51 | Frontend | `frontend/src/components/blocks/PostHeroBlock.tsx` | 75 | Scroll-to-content button contains only an icon with no `aria-label` or visible text. | Add `aria-label="Scroll to content"`. |
| 52 | Frontend | `frontend/src/components/admin/page-builder/BlockItem.tsx` | 127, 141 | Drag-handle and delete buttons contain only icons with no `aria-label`. | Add `aria-label="Drag block"` and `aria-label="Delete block"`. |
| 53 | Frontend | `frontend/src/components/admin/page-builder/editors/ImageFullEditor.tsx` | 73 | Remove-image button has no `aria-label`. | Add `aria-label="Remove image"`. |
| 54 | Frontend | `frontend/src/components/admin/page-builder/editors/TextImageEditor.tsx` | 245 | Remove-image button has no `aria-label`. | Add `aria-label="Remove image"`. |
| 55 | Frontend | `frontend/src/components/admin/page-builder/editors/ThreeImagesEditor.tsx` | 139 | Remove-image button has no `aria-label`. | Add `aria-label="Remove image"`. |
| 56 | Frontend | `frontend/src/components/admin/SeoFields.tsx` | 145 | Remove OG-image button has no `aria-label`. | Add `aria-label="Remove OG image"`. |
| 57 | Frontend | `frontend/src/pages/admin/PostsPage.tsx` | 204 | Search `<input>` has no associated `<label>` (only placeholder). | Add `<label htmlFor="search-posts">` or `aria-label`. |
| 58 | Frontend | `frontend/src/pages/admin/PostsPage.tsx` | 251, 304 | Select-all and row checkboxes have no `aria-label`. | Add `aria-label="Select all posts"` and `aria-label={`Select post ${post.title}`}`. |
| 59 | Frontend | `frontend/src/pages/admin/PostsPage.tsx` | 99, 103 | Overlapping `useEffect`s cause a double fetch when search query changes. | Remove the first effect; let `loadPosts` be called exclusively by Pagination and the debounced search effect. |
| 60 | Frontend | `frontend/src/pages/admin/PostsPage.tsx` | 287, 293 | `colSpan={7}` used but table has 8 columns. Loading and empty rows don't span full width. | Change to `colSpan={8}`. |
| 61 | Test Coverage | `backend/src/routes/` | — | All route files (`posts.ts`, `auth.ts`, `users.ts`, `contact.ts`, `activityLogs.ts`, `api/posts.ts`) report **0% coverage** because they are never loaded by tests. | Expand coverage config to include `src/routes` and write route-level tests. |
| 62 | Test Coverage | All backend service tests | — | Service unit tests mock every link in the Drizzle query builder chain. Refactoring query shape breaks tests even if behavior is unchanged. | Mock at the `db` boundary or use a test database instead of mocking every chain method. |
| 63 | Test Coverage | `backend/src/__tests__/e2e/api.test.ts` | — | "E2E" test mocks `postService`, `storageService`, and `activityLogService`, testing Express routes against an in-memory mock store rather than real DB/filesystem/Telegram. | Remove mocks and run against a real test database or rename to integration test. |
| 64 | Performance | `backend/src/services/activityLogService.ts` | 43-51 | `GET /api/logs/users` returns all distinct `user_email` values with no limit. | Add `LIMIT` (e.g., 1000) or pagination to `getUniqueUsers()`. |
| 65 | Performance | `frontend/src/components/admin/PostHeroPreview.tsx` | 10 | `URL.createObjectURL(data.heroImage)` called on every render without `URL.revokeObjectURL`, leaking memory. | Use `useEffect` to create/revoke the object URL with cleanup. |
| 66 | Frontend | `frontend/src/components/sections/HeroSlider.tsx` | 82 | All slides rendered simultaneously; `loading="lazy"` ignored by browser because hidden slides still occupy viewport. | Render only current +/- 1 slides; conditionally mount off-screen slides. |

### 🟡 Medium (fix in next sprint)

| # | Agent | File | Line | Issue | Fix |
|---|-------|------|------|-------|-----|
| 67 | API Contract | `backend/src/routes/posts.ts` | 70 | `GET /api/posts/featured` returns raw array instead of wrapped response. | Wrap in `{ data }` for consistency. |
| 68 | API Contract | `backend/src/routes/activityLogs.ts` | 43 | `GET /api/logs/users` returns raw `string[]`. | Wrap in `{ data }`. |
| 69 | API Contract | `backend/src/routes/users.ts` | 13 | `GET /api/admin/users` returns raw array without wrapper. | Wrap in `{ data }`. |
| 70 | API Contract | Multiple route files | — | DELETE endpoints return `200 + message` instead of `204 No Content`. | Document or switch to `204`. |
| 71 | API Contract | `backend/src/routes/posts.ts` | 104, 252 | Posts routes bypass standard `validateBody` middleware and use a custom `validatePostInput` that only validates present fields. | Use `validateBody(postCreateSchema)` for create and `validateBody(postUpdateSchema)` for update. |
| 72 | API Contract | `backend/src/routes/posts.ts` | 478 | `POST /api/posts/:id/gallery` returns `{ gallery_images, new_images }`, a unique non-standard shape. | Return a standard wrapped response. |
| 73 | API Contract | `backend/src/routes/posts.ts` | 527 | `DELETE /api/posts/:id/gallery` silently succeeds when image URL is not in gallery. | Return `404` when the URL is not present. |
| 74 | API Contract | `backend/src/routes/auth.ts` | 134 | `GET /api/admin/me` returns unwrapped user object. | Wrap in consistent envelope. |
| 75 | API Contract | `backend/src/docs/swagger.ts` | 237 | `PUT /posts/{id}` missing `409` response documentation despite `postService.update` throwing `ConflictError` for duplicate slugs. | Add `409` response to Swagger spec. |
| 76 | Database | `backend/src/db/schema.ts` | 52, 61 | `blocks` and `users` tables lack `updated_at` columns. | Add `updated_at` with `.defaultNow().notNull()` and update on mutations. |
| 77 | Database | `backend/src/services/postService.ts` | 93-99 | `getAll` uses `db.select().from(posts)` (all columns) where only summary fields are needed. | Explicitly list columns in `db.select({ ... })`. |
| 78 | Database | `backend/src/services/userService.ts` | 8, 22 | `findByEmail` and `findById` return `password_hash` even when callers only need existence or role. | Select only required columns. |
| 79 | Database | Multiple service files | — | `SELECT *` pattern used in `activityLogService.getLogs`, `contactService.getAll`, `blockService.getByPostId`. | Explicitly list required columns. |
| 80 | Database | `backend/src/services/postService.ts` | 204-209 | Mixed soft/hard delete strategy: `posts` soft-deleted, `users` and `blocks` hard-deleted. | Align on soft delete for all mutable entities or document intentional divergence. |
| 81 | Database | `backend/src/services/postService.ts` | 223-252 | `permanentDelete` hard-deletes a post that normally supports soft delete. If restored, blocks may have been hard-deleted. | Cascade soft-delete blocks when a post is soft-deleted. |
| 82 | Performance | `backend/src/services/blockService.ts` | 76-84 | `reorder()` fires N concurrent writes, creating unnecessary transaction overhead and lock contention. | Use a single bulk `UPDATE` with `CASE` expression. |
| 83 | Performance | `frontend/src/components/blocks/` | Multiple | `<img>` tags lack `srcset`, `sizes`, `decoding="async"`, and explicit `width`/`height`. Backend generates no thumbnails. | Add `decoding="async"` and responsive `srcset`/`sizes` where possible. |
| 84 | Performance | `frontend/src/components/admin/` | Multiple | `setTimeout(() => setCompressMsg(null), 3000)` leaks timers on unmount in `GalleryUploader`, `ImageFullEditor`, `TextImageEditor`, `ThreeImagesEditor`, `SingleImageUpload`. | Store timeout ID in `useRef` and clear in `useEffect` cleanup. |
| 85 | Performance | `frontend/src/hooks/usePostValidation.ts` | 46-51 | `scrollToFirstError` schedules a 50ms `setTimeout` never cleared on unmount. | Return cleanup function that clears the timeout. |
| 86 | Performance | `backend/src/config/jwt.ts` | 17-27 | `jwt.sign` / `jwt.verify` are CPU-bound and run on the main thread. | Offload to Worker Threads if high-traffic, or ensure strict rate limiting. |
| 87 | Performance | `backend/src/services/postService.ts` | 144-153 | Slug collision loop issues sequential DB queries. | Use a single query or random suffix to avoid iterations. |
| 88 | Code Quality | `frontend/src/hooks/usePostForm.ts` | 18, 19 | Boolean state variables `loading` and `saving` lack `is`/`has` prefix. | Rename to `isLoading` and `isSaving`. |
| 89 | Code Quality | `frontend/src/pages/admin/PostsPage.tsx` | 24, 26 | Boolean state variables `bulkLoading` and `loading` lack prefix. | Rename to `isBulkLoading` and `isLoading`. |
| 90 | Code Quality | `frontend/src/pages/admin/UsersPage.tsx` | 13, 14 | Boolean state variables `loading` and `formLoading` lack prefix. | Rename to `isLoading` and `isFormLoading`. |
| 91 | Code Quality | `frontend/src/hooks/usePostForm.ts` | 145, 260 | Non-descriptive variable names `lb` and `fe`. | Rename to `loadedBlocks` and `fieldErrors`. |
| 92 | Code Quality | `frontend/src/components/admin/page-builder/editors/TextImageEditor.tsx` | 29 | Single-letter function name `f`. | Rename to `buildFieldId`. |
| 93 | Code Quality | `backend/src/middleware/multer.ts` | 45 | `uploadBlockMedia` is misleading — it also accepts heroImage, ogImage, galleryImages. | Rename to `uploadPostMedia` or `uploadAdminMedia`. |
| 94 | Code Quality | `backend/src/routes/api/posts.validation.ts` | 32 | `_isCreate` prefixed with underscore (conventionally "unused") but is part of public API signature. | Remove parameter if truly unused, or rename to `isCreate`. |
| 95 | Code Quality | `backend/src/routes/posts.ts` | 87, 99, 408 | Identical `AppError` status-check ternary repeated three times. | Extract `getStatusFromError(error, 404)` helper. |
| 96 | Code Quality | `backend/src/routes/posts.ts` | 245-248 | POST catch block does **not** check `error instanceof AppError`, while PUT catch block does. | Unify error handling in both handlers. |
| 97 | Code Quality | `frontend/src/services/api.ts` | 39-48, 19-28 | `URLSearchParams` building logic duplicated across `postService.getAll` and `activityLogService.getAll`. | Create `buildQueryString(params: object)` helper. |
| 98 | Code Quality | `backend/src/lib/logger.ts` | 34, 40 | Production fallback uses `console.log` for all severities, destroying log level semantics. | Use `console.error` for errors, `console.info` for info. |
| 99 | Code Quality | `backend/src/services/postService.ts` | 166, 195 | `throw new NotFoundError('Failed to create post')` / `Failed to update post` uses 404 for creation failure. | Use `AppError` with status 500 or `InternalServerError`. |
| 100 | Code Quality | `frontend/src/hooks/usePostForm.ts` | 247, 269, 273 | Hardcoded Ukrainian UI strings mixed into business-logic hook. | Move strings to an i18n layer or constants file. |
| 101 | Code Quality | `backend/src/services/contactService.ts` | 5 | Imports `logger` with `.js` extension, inconsistent with rest of backend. | Remove `.js` extension. |
| 102 | Security | `.env.example` | — | Missing `PORT`, `NODE_ENV`, `FRONTEND_URL`, `API_KEY` variables that backend requires at runtime. | Add all backend-required variables to `.env.example`. |
| 103 | Security | `backend/src/middleware/multer.ts` | 25-30 | `fileFilter` only checks `file.mimetype`; magic-byte validation happens later in `storageService`, consuming memory/CPU before rejection. | Move magic-byte validation into a custom multer file filter or add a size-limiting pre-check. |
| 104 | Security | `backend/src/middleware/multer.ts` | 34 | `uploadMiddleware` sets `limits: { files: 25 }`, but `uploadBlockMedia` maxCount totals 42. Effective limit silently truncates uploads. | Align `limits.files` with intended `maxCount` total. |
| 105 | Security | `backend/src/services/activityLogService.ts` | — | Activity logs persist `user_email` (PII) and `changes` JSONB indefinitely. No retention policy or data masking. | Consider hashing/pseudonymizing emails or implementing a retention/deletion policy. |
| 106 | Frontend | `frontend/src/pages/ContactPage.tsx` | 285 | Google Maps `<iframe>` missing `title` attribute. | Add `title="Office location map"`. |
| 107 | Frontend | `frontend/src/pages/ProjectsPage.tsx` | 42 | `window.location.reload()` causes a full hard reload, losing client-side state. | Use `navigate(0)` from React Router or re-fetch data. |
| 108 | Frontend | `frontend/src/components/ErrorBoundary.tsx` | 33 | Same `window.location.reload()` anti-pattern. | Use `navigate(0)` or re-fetch data. |
| 109 | Frontend | `frontend/src/components/blocks/PostGalleryBlock.tsx` | 134 | Injects a raw `<style>` tag per component instance to hide scrollbars. | Move rule to a global stylesheet or Tailwind plugin. |
| 110 | Frontend | `frontend/src/pages/PublicPostPage.tsx` | 57 | `updateMetaTag` manipulates `document.head` directly inside the component render path. | Extract to a `usePageMeta` hook. |
| 111 | Frontend | `frontend/src/hooks/useAuth.ts` | 18 | Direct `api.get('/admin/me')` bypasses the service layer (`authService`). | Route through `authService.me()`. |
| 112 | Frontend | `frontend/src/components/admin/page-builder/PageBuilder.tsx` | 23 | `generateTempId` uses `Math.random()` with `Date.now()`. | Use `crypto.randomUUID()` if available. |
| 113 | Frontend | `frontend/src/components/sections/ProjectsGallerySection.tsx` | 22 | Inline style on icon: `style={{ strokeWidth: 1.5 }}`. | Configure icon library or use a CSS class. |
| 114 | Frontend | `frontend/src/pages/ContactPage.tsx` | 289 | Inline style on iframe: `style={{ border: 0 }}`. | Use Tailwind class `border-0`. |
| 115 | DevOps | Repository root | — | No root `.dockerignore`. Build context includes `.git/`, `node_modules/`, docs, seed data, coverage. | Create root `.dockerignore` with standard exclusions. |
| 116 | DevOps | `frontend/.dockerignore` | — | Missing `.git`, `coverage`, `.nyc_output`, `.DS_Store`, `*.md`, `.env.*`. | Expand to match standard patterns. |
| 117 | DevOps | `docker-compose.staging.yml` | 39 | `FRONTEND_URL=https://staging.b710.design` hardcoded. | Source from environment variable. |
| 118 | DevOps | `docker-compose.staging.yml` | — | Backup service missing from staging. | Add backup service or document intentional omission. |
| 119 | DevOps | `backup/Dockerfile` | — | Runs as root with no `HEALTHCHECK`. | Add `HEALTHCHECK` that verifies crontab or last backup timestamp. |
| 120 | DevOps | `docker-compose.dev.yml` | — | Only `db` service has healthcheck; `frontend` and `backend` lack them. | Add basic healthchecks for dev services. |
| 121 | DevOps | `docker-compose.dev.yml` | — | No restart policies on any dev service. | Add `restart: unless-stopped`. |
| 122 | Test Coverage | `frontend/src/hooks/__tests__/usePostForm.test.ts` | — | Hook tests inspect internal state (`slugLocked`, `featured`) rather than user-facing behavior. | Assert on rendered output or external side effects instead of internal properties. |
| 123 | Test Coverage | `frontend/src/hooks/__tests__/usePostForm.test.ts` | — | Uses `await new Promise(r => setTimeout(r, 0))` for async waiting. Brittle. | Use `waitFor` from Testing Library. |
| 124 | Test Coverage | `frontend/src/hooks/__tests__/useAuth.test.ts` | — | Same brittle `setTimeout` async waiting pattern. | Use `waitFor`. |
| 125 | Test Coverage | Multiple frontend files | — | No integration or E2E tests for pages, layouts, routing, or full user flows. | Add React Testing Library integration tests for at least one critical user flow. |
| 126 | Test Coverage | `backend/src/routes/__tests__/auth.test.ts` | — | Does not test logout success path, token version mismatch, or malformed JWT edge cases. | Add tests for error paths and edge cases. |
| 127 | Architecture | `backend/src/lib/logger.ts` | — | Reads `process.env.NODE_ENV` directly instead of using validated `env` config. | Import `env.NODE_ENV` from `../config/env.ts`. |
| 128 | Architecture | `shared/src/index.ts` | — | Re-exports use `.js` extensions. Acceptable for ESM interop but inconsistent with backend import style. | Standardize on extensionless imports or enforce via lint rule. |
| 129 | Architecture | `backend/src/index.ts` | 98-133 | Large inline Swagger HTML template embedded in main entry file. | Move to `backend/src/docs/swagger.html` or `backend/src/docs/swagger-ui.ts`. |
| 130 | Architecture | `frontend/src/pages/admin/PostsPage.tsx` | 515 lines | God file managing list rendering, pagination, bulk selection, filtering, search, deletion modals. | Extract into `usePostsList` hook and sub-components. |
| 131 | API Contract | `backend/src/routes/auth.ts` | 68 | `POST /api/admin/logout` catch block silently ignores DB failures and still returns `200`. | Document best-effort behavior or return a warning status. |
| 132 | API Contract | `backend/src/index.ts` | 151 | `/health` returns `{ status, timestamp }`, diverging from the main API envelope. | Acceptable for healthchecks; document divergence. |
| 133 | API Contract | `backend/src/routes/auth.ts` | 52, 107 | Auth endpoints return `{ token, refreshToken, user }` directly without wrapper. | Acceptable for auth; document divergence. |

### 🟢 Low (fix when time allows)

| # | Agent | File | Line | Issue | Fix |
|---|-------|------|------|-------|-----|
| 134 | Code Quality | `frontend/src/pages/admin/EditPostPage.tsx` | 1-339 | File exceeds 300 lines (339). Primarily JSX, but still difficult to scan. | Extract sub-components (e.g., `PostForm`, `DraftBanner`). |
| 135 | Code Quality | `frontend/src/components/admin/page-builder/editors/TextImageEditor.tsx` | 1-311 | File exceeds 300 lines (311). | Extract `FeatureList` sub-component and move helpers out. |
| 136 | Code Quality | `frontend/src/pages/ContactPage.tsx` | 1-302 | File exceeds 300 lines (302). | Extract form sections into smaller components. |
| 137 | Code Quality | `backend/src/routes/api/posts.ts` | 48-92 | `processUploadedFiles` is a 44-line helper living inside a route file, mixing upload priority rules with URL fallback logic. | Move to `services/storageService.ts` or dedicated `fileProcessor.ts`. |
| 138 | Code Quality | Backend seed/CLI scripts | Various | `console.log` used throughout one-off CLI scripts (`seed-posts.ts`, `seed-admin.ts`, `migrate.ts`, etc.). | Acceptable for scripts; consider using `logger` for consistency. |
| 139 | Architecture | `backend/src/lib/logger.ts` | — | File name `logger.ts` vs exported `logger` object is a minor naming mismatch. | Rename file or accept as-is. |
| 140 | Frontend | `frontend/src/App.tsx` | 21 | Loading fallback uses `text-gray-400` instead of `text-zinc-400`. | Change to `text-zinc-400` to match design palette. |
| 141 | Frontend | Admin pages (`PostsPage`, `ActivityLogPage`, `UsersPage`, etc.) | — | Admin pages use `gray` color scale while public site uses `zinc`. Visual inconsistency. | Unify on `zinc` throughout admin panel. |
| 142 | DevOps | `docker-compose.yml` | 8 | `BACKEND_HOST: buro710-prod-backend` hardcoded as build argument. | Parameterize with `${BACKEND_HOST:-buro710-prod-backend}`. |
| 143 | DevOps | `backend/Dockerfile` | — | Single-stage build. Not mandatory, but multi-stage would reduce image size and attack surface. | Consider multi-stage if image size becomes a concern. |
| 144 | Test Coverage | `frontend/src/components/blocks/ThreeImagesBlock.tsx` | — | Coverage at 85.71% statements, 57.14% branch. | Add tests for missing branches. |
| 145 | Test Coverage | `frontend/src/hooks/usePostDraft.ts` | — | Coverage at 81.25% statements, 50% branch. | Add tests for remaining branches. |
| 146 | Performance | `frontend/src/components/blocks/PostGalleryBlock.tsx` | 115 | Lacks responsive image attributes. | Add `decoding="async"` and `srcset` where possible. |
| 147 | Security | `backend/src/routes/auth.ts` | 80-120 | Refresh endpoint does not use `validateBody` with Zod schema. | Add a Zod schema for body shape validation. |
| 148 | Security | Repository root | — | Root `.env` duplicates `backend/.env` with identical content, increasing exposure risk. | Consolidate to a single `.env` at monorepo root. |
| 149 | Database | `backend/src/db/schema.ts` | 38 | `posts.gallery_images` and `posts.hero_tags` use `text().array()`. Acceptable for small arrays but less normalized than junction tables. | No action needed unless array sizes grow significantly. |
| 150 | Database | `backend/src/db/schema.ts` | 58 | `users.password_hash` is `text` rather than `varchar`. Acceptable since bcrypt output is fixed length. | No action needed. |

---

## Results by agent

### Agent 1 — Security: 15 issues
- Critical: 2 (dependency CVEs, draft posts exposure)
- High: 3 (JWT in localStorage, missing rate limit on refresh, trust proxy config)
- Medium: 6 (env.example gaps, file upload limits, mimetype-only filter, PII in logs, refresh validation, duplicate .env)
- Low: 4 (uploads public, logout error swallowing, healthcheck shape, auth envelope divergence)

### Agent 2 — Architecture: 11 issues
- Critical: 2 (business logic in routes, auth logic in routes)
- High: 2 (process.env scattered, god file index.ts)
- Medium: 5 (service imports middleware, ad-hoc error handling, magic numbers, inconsistent imports, inline Swagger HTML)
- Low: 2 (logger naming, shared .js extensions)

### Agent 3 — TypeScript: 0 errors, minor type-safety gaps
- `tsc --noEmit`: ✅ 0 errors in backend, frontend, and shared
- `strict: true`: ✅ Enabled in all three workspaces
- `noUnusedLocals`: ✅ Enabled in backend and frontend
- `noUnusedParameters`: ✅ Enabled in backend and frontend
- `noImplicitAny`: ✅ Implied by `strict: true`
- `any` usages: 10 occurrences (mostly in tests and one-off scripts)
- Circular dependencies: ✅ None found in backend or frontend
- Unused exports: Several potential unused exports detected by `ts-prune` (`uploadSingleImage`, `validateFormData`, middleware defaults)

### Agent 4 — Code Quality: 45 issues
- Critical: 3 (@ts-nocheck, fragile error handler string matching, API 404-for-all-errors)
- High: 19 (god files, duplicated pagination, scattered process.env, raw Error throws, missing AppError usage)
- Medium: 18 (naming violations, boolean prefixes, duplicated URLSearchParams logic, logger misuse, semantic misuse of NotFoundError, i18n strings in hooks, inconsistent imports)
- Low: 5 (files >300 lines, helper in route file, console.log in scripts)

### Agent 5 — API Contract: 23 issues
- Critical: 3 (500 on missing delete, 404-for-all-errors, no consistent envelope)
- High: 6 (Swagger/runtime mismatches, shape divergence, JSON mode breakage, missing ID validation)
- Medium: 11 (raw arrays, missing 201, bypassed validateBody, non-standard gallery shape, silent gallery delete success, unwrapped responses, mixed languages, missing 409 docs)
- Low: 3 (logout swallowing, healthcheck divergence, auth envelope divergence)

### Agent 6 — Database: 9 issues
- Critical: 1 (missing indexes on high-traffic columns)
- High: 2 (N+1 update patterns in block reorder/sync)
- Medium: 3 (missing updated_at, SELECT * misuse, mixed soft/hard delete)
- Low: 3 (data types acceptable, no pending migrations, plaintext storage review clean)

### Agent 7 — Test Coverage: 42.3% backend, 75.9% frontend
- Critical: 1 (4 broken service test files = 0 tests for postService, blockService, contactService, activityLogService)
- High: 3 (0% route coverage, brittle Drizzle mocks, fake E2E test)
- Medium: 3 (no factory pattern, shallow component tests, implementation-detail hook tests)
- Low: 2 (flaky async patterns, missing frontend integration tests)

### Agent 8 — Performance: 14 issues
- High: 4 (in-memory uploads, missing indexes, unbounded user list, sequential file uploads)
- Medium: 6 (no caching, large list payloads, HeroSlider DOM bloat, unbounded logs users, missing responsive images, timer leaks)
- Low: 4 (sync crypto on main thread, setTimeout leaks in hooks, slug collision loop)

### Agent 9 — DevOps: 19 issues
- Critical: 2 (hardcoded DB password, .dockerignore breaks dev builds)
- High: 5 (backend image includes devDeps, missing healthcheck, CI lacks PostgreSQL, single-stage backend, broken dev container)
- Medium: 8 (no root .dockerignore, incomplete frontend .dockerignore, hardcoded staging URL, missing backup service, backup no HEALTHCHECK, dev missing healthchecks, dev missing restart, test workflow lacks typecheck)
- Low: 4 (hardcoded BACKEND_HOST, single-stage acceptable, no deploy workflow, root .env duplication)

### Agent 10 — Frontend: 19 issues
- Critical: 1 (invalid Tailwind class `p-5vh`)
- High: 7 (memory leak in PostHeroPreview, missing aria-labels on buttons, missing search label, missing checkbox labels, double fetch in PostsPage, wrong colSpan, hard reload)
- Medium: 6 (iframe missing title, HeroSlider loads all images, raw style tag injection, document.head mutation in render, direct api.get bypassing service, Math.random temp IDs)
- Low: 5 (inline styles on icon/iframe, gray vs zinc palette, loading fallback color, colSpan miscount)

---

## Automated check results

| Check | Status | Details |
|-------|--------|---------|
| **TypeScript** | ✅ 0 errors | Backend, frontend, and shared all pass `tsc --noEmit` with `strict: true` |
| **Tests** | ❌ 4 failing suites | Backend coverage: 42.3% statements, 31.0% branch, 39.2% functions. Frontend: 75.9% statements, 62.1% branch, 65.5% functions. |
| **CVE audit** | ❌ 21 vulnerabilities | 11 High, 10 Moderate. Key: drizzle-orm, multer, express-rate-limit, axios, vite, undici, rollup, picomatch, minimatch, flatted |
| **console.log** | ⚠️ 49 occurrences | Mostly in one-off CLI scripts (`seed-posts.ts`, `migrate-from-supabase.ts`). Only 4 in runtime code (`backend/src/lib/logger.ts:2`, `frontend/src/lib/logger.ts:2`). |
| **Circular deps** | ✅ 0 cycles | None found in backend or frontend via `madge` |
| **Unused exports** | ⚠️ ~20 found | `ts-prune` flagged several middleware exports (`uploadSingleImage`, `validateFormData`) and type aliases that may be genuinely unused. |
| **Outdated deps** | ⚠️ 11 packages | None more than 2 major versions behind, but `typescript`, `vite`, `eslint`, `lucide-react`, `@types/node`, `jsdom`, `globals` are 1 major version behind. |

---

## Recommended fix order

1. **Patch HIGH-severity dependency CVEs** (Security, Critical)
   - `npm audit fix` in all workspaces. Prioritize `drizzle-orm`, `multer`, `express-rate-limit`, `axios`, `vite`.
   - Unblocks: Removes SQL injection, DoS, and SSRF vectors.

2. **Add database indexes** (Database, Critical)
   - `posts(slug, deleted_at, status, featured, created_at)`, `blocks(post_id, sort_order)`, `activity_logs(user_email, action, created_at)`, `refresh_tokens(user_id, token_hash, expires_at)`.
   - Unblocks: Prevents full table scans as data grows; improves every list and detail endpoint.

3. **Fix the 4 broken backend service test files** (Test Coverage, Critical)
   - Move mock variables inside `vi.mock` factories or use `vi.doMock`.
   - Unblocks: Restores ~60+ tests and makes coverage numbers meaningful.

4. **Move JWT storage from localStorage to httpOnly cookies** (Security, High)
   - Unblocks: Eliminates XSS token theft vector. Required for any auth-hardening work.

5. **Add transactions to post create/update/delete** (Database, Critical)
   - Wrap `postService.create`, `update`, and `permanentDelete` in `db.transaction()`.
   - Unblocks: Prevents orphaned posts/blocks and inconsistent filesystem state.

6. **Switch multer from memoryStorage to diskStorage** (Performance, Critical)
   - Unblocks: Prevents memory exhaustion and process crashes under concurrent uploads.

7. **Extract business logic from route handlers into services** (Architecture, Critical)
   - Create `postService.createWithMedia()` / `updateWithMedia()` and move file orchestration out of `routes/posts.ts` and `routes/api/posts.ts`.
   - Unblocks: Enables proper unit testing, reduces duplication, and fixes god-file issues.

8. **Standardize API response envelope and fix Swagger/runtime mismatches** (API Contract, High)
   - Adopt `{ success, data, meta?, error? }` globally. Fix Swagger schemas to match runtime.
   - Unblocks: Frontend can rely on consistent parsing. External API consumers get correct docs.

9. **Fix unbounded list endpoints (users, logs, posts)** (Performance, High)
   - Add pagination to `GET /api/admin/users` and `GET /api/logs/users`. Ensure `getAll` returns lightweight projections.
   - Unblocks: Prevents unbounded payload growth and OOM risks.
