# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

All commands are run from the monorepo root unless otherwise noted.

### Development
```bash
npm run dev              # Start frontend (port 5173) + backend (port 3000) concurrently
npm run dev:frontend     # Frontend only
npm run dev:backend      # Backend only (tsx watch)
npm run start            # Start backend (production mode)
npm run preview          # Vite preview (frontend)
```

### Build & Lint
```bash
npm run build            # tsc + vite build (frontend)
npm run vercel-build     # Frontend build for Vercel
npm run lint             # ESLint on frontend
cd frontend && npm run format        # Prettier write
cd frontend && npm run format:check  # Prettier check
```

### Testing
```bash
npm run test             # Run all tests (shared + frontend + backend)
npm run test:frontend    # Frontend tests only
npm run test:backend     # Backend tests only
npm run test:coverage    # Frontend + backend coverage

# Or from individual packages:
cd backend && npm test           # Watch mode
cd backend && npm run test:run   # Single run
cd backend && npm run test:coverage

cd frontend && npm test          # Watch mode
cd frontend && npm run test:run  # Single run
```

Tests live at `backend/src/**/*.test.ts` and `frontend/src/**/*.test.{ts,tsx}`.

### Database
```bash
npm run seed:admin       # Create admin user (delegates to backend)
npm run seed:posts       # Seed blog posts (delegates to backend)
npm run seed:clean:posts # Clear posts (delegates to backend)
npm run validate:i18n    # Validate i18n keys

# Drizzle migrations
cd backend && npx drizzle-kit generate   # Generate migration from schema changes
cd backend && npx drizzle-kit migrate    # Apply migrations
cd backend && npx drizzle-kit studio     # Open Drizzle Studio (DB browser)
```

### Code Quality
Pre-commit hooks run automatically via Husky + lint-staged:
- `frontend/src/**/*.{ts,tsx}` — ESLint fix + Prettier
- `backend/src/**/*.ts` — Prettier

## Architecture

This is an npm workspaces monorepo with three packages: `shared/`, `frontend/`, `backend/`.

### Shared (`shared/src/`)

Zod validation schemas and utilities shared between frontend and backend.

- `src/schemas/post.ts` — `postCreateSchema`, `postUpdateSchema`, `blockSchema`
- `src/schemas/contact.ts` — `contactSchema`
- `src/schemas/auth.ts` — `loginSchema`
- `src/transliterate.ts` — `generateSlug()` utility

### Backend (`backend/src/`)

Express 5 server with TypeScript, running on port 3000.

**Two API tiers:**
- **Internal API** — JWT-authenticated, used by the React admin panel:
  - `POST /api/admin/login`, `POST /api/admin/refresh`, `POST /api/admin/logout`, `GET /api/admin/me`
  - `GET|POST|PUT|DELETE /api/posts` — post CRUD + gallery upload
  - `GET /api/logs`, `GET /api/logs/users` — activity logs
  - `POST /api/contact` — contact form (rate-limited 3/min, sends to Telegram)
- **External API v1** (`/api/v1/posts`) — API key-authenticated (`X-API-Key` header), public-facing CRUD with full OpenAPI docs at `/api/docs`

**Auth:** short-lived JWT access tokens (30m) + rotating refresh tokens (7d, SHA-256 hashes stored in `refresh_tokens`). `authMiddleware` checks `token_version` against the DB on each request; logout bumps the version and revokes all refresh tokens.

**Key modules:**
- `src/index.ts` — Express app entry, route mounting, middleware stack, Swagger UI
- `src/routes/` — Route handlers; `routes/api/` contains the external v1 API
- `src/services/` — Business logic (`postService`, `blockService`, `storageService`, `userService`, `activityLogService`, `contactService`, `telegramService`)
- `src/middleware/` — `auth.ts` (JWT), `apiKey.ts` (API key), `multer.ts` (file uploads), `validate.ts`
- `src/db/` — Drizzle ORM schema (`schema.ts`) and database connection (`index.ts`)
- `src/config/` — JWT config, env validation

**Database:** PostgreSQL 17 via Drizzle ORM + `node-postgres` (pg). Connection configured via `DATABASE_URL` env var. Schema defined in `src/db/schema.ts` with 6 tables: `posts`, `blocks`, `users`, `refresh_tokens`, `activity_logs`, `contact_messages`. Active posts have a partial unique index on `slug` (`WHERE deleted_at IS NULL`); post/block writes run inside transactions.

**Storage:** Local filesystem via `storageService`. Images uploaded via multer (memory storage) then written to `UPLOADS_DIR` (default `/app/uploads`). URLs are `/uploads/{folder}/{filename}`. File uploads support both binary multipart and URL strings — file takes priority over URL.

**Content blocks:** Posts use a block-based content system (`blockService`). Block types: `text_full`, `text_image`, `image_full`, `image_text`, `three_images`. Blocks have `type`, `data` (JSONB), and `sort_order`.

### Frontend (`frontend/src/`)

React 19 + TypeScript + Vite + Tailwind CSS 4, served on port 5173 in dev.

**Routing** (React Router 7, `App.tsx`):
- Public: `/`, `/projects`, `/about`, `/contact`, `/page/:slug`
- Admin (JWT-protected via `ProtectedRoute`, wrapped in `AdminLayout`):
  - `/admin/login`
  - `/admin/posts` — post list
  - `/admin/posts/create` — new post
  - `/admin/posts/edit/:id` — edit post
  - `/admin/logs` — activity log
  - `/admin/users` — users
  - `/admin/settings` — settings
- `*` — NotFoundPage

Admin pages are lazy-loaded.

**Key modules:**
- `src/api/client.ts` — Axios instance with JWT interceptor, FormData content-type handling, 401 auto-redirect
- `src/services/api.ts` — Service layer (`portfolioService`, `authService`, `postService`, etc.)
- `src/hooks/useAuth.ts` — Auth state hook
- `src/components/admin/page-builder/` — Block-based page editor with drag-and-drop (`@dnd-kit`)
- `src/components/blocks/` — Public-facing block renderers
- `src/types/` — TypeScript interfaces mirroring DB schema

**Styling:** Tailwind CSS 4 utility classes only. Color palette: `zinc` as primary grayscale. Icons via `lucide-react`.

### Database (PostgreSQL 17)

DB columns use `snake_case`. Drizzle schema in `backend/src/db/schema.ts`; migrations in `backend/src/db/migrations/` are applied automatically on container start (see `DOKPLOY.md`).

### Production

Docker Compose orchestrates PostgreSQL, backend, frontend/nginx, and backup containers. Uploaded files stored in a shared `uploads` volume (backend rw, nginx ro). Daily PostgreSQL backups at 3:00 AM with 7-day retention via `scripts/backup.sh`. See `docs/DEPLOYMENT.md` for VPS deployment details.

## Additional Conventions

Detailed code patterns (imports, component structure, naming, error handling, state management) are documented in `AGENTS.md`.
