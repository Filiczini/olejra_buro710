# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

All commands are run from the monorepo root unless otherwise noted.

### Development
```bash
npm run dev              # Start frontend (port 5173) + backend (port 3000) concurrently
npm run dev:frontend     # Frontend only
npm run dev:backend      # Backend only (tsx watch)
```

### Build & Lint
```bash
npm run build            # tsc + vite build (frontend)
npm run lint             # ESLint on frontend
```

### Testing
```bash
# Backend tests (Vitest, node environment)
cd backend && npm test           # Watch mode
cd backend && npm run test:run   # Single run
cd backend && npm run test:coverage

# Frontend tests (Vitest, jsdom environment)
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

Manual formatting: `cd frontend && npm run format`

## Architecture

This is an npm workspaces monorepo with `frontend/` and `backend/` packages.

### Backend (`backend/src/`)

Express 5 server with TypeScript, running on port 3000.

**Two API tiers:**
- **Internal API** (`/api/admin`, `/api/portfolio`, `/api/posts`, `/api/logs`, `/api/contact`) — JWT-authenticated, used by the React admin panel
- **External API v1** (`/api/v1/posts`) — API key-authenticated (`apiKeyMiddleware`), public-facing CRUD for posts with full OpenAPI docs at `/api/docs`

**Key modules:**
- `src/index.ts` — Express app entry, route mounting, Swagger UI served inline
- `src/routes/` — Route handlers; `routes/api/` contains the external v1 API
- `src/services/` — Business logic (`postService`, `blockService`, `storageService`, `userService`, `activityLogService`, `contactService`, `telegramService`)
- `src/middleware/` — `auth.ts` (JWT), `apiKey.ts` (API key), `multer.ts` (file uploads), `validate.ts`
- `src/db/` — Drizzle ORM schema (`schema.ts`) and database connection (`index.ts`)
- `src/config/` — JWT config, env validation

**Database:** PostgreSQL 16 via Drizzle ORM + `node-postgres` (pg). Connection configured via `DATABASE_URL` env var. Schema defined in `src/db/schema.ts` with 5 tables: `posts`, `blocks`, `users`, `activityLogs`, `contactMessages`.

**Storage:** Local filesystem via `storageService`. Images uploaded via multer (memory storage) then written to `UPLOADS_DIR` (default `/app/uploads`). URLs are `/uploads/{folder}/{filename}`. File uploads support both binary multipart and URL strings — file takes priority over URL.

**Content blocks:** Posts use a block-based content system (`blockService`). Block types: `text_full`, `text_image`, `image_full`, `image_text`, `three_images`. Blocks have `type`, `data` (JSONB), and `sort_order`.

### Frontend (`frontend/src/`)

React 19 + TypeScript + Vite + Tailwind CSS 4, served on port 5173 in dev.

**Routing** (React Router 7, `App.tsx`):
- Public: `/`, `/projects`, `/project/:id`, `/about`, `/contact`, `/page/:slug`
- Admin (JWT-protected via `ProtectedRoute`): `/admin/*` — wrapped in `AdminLayout`

**Key modules:**
- `src/api/client.ts` — Axios instance with JWT interceptor, FormData content-type handling, and 401 auto-redirect
- `src/services/api.ts` — Service layer (`portfolioService`, `authService`, `postService`, etc.)
- `src/hooks/useAuth.ts` — Auth state hook
- `src/components/admin/page-builder/` — Block-based page editor with drag-and-drop (`@dnd-kit`)
- `src/components/blocks/` — Public-facing block renderers
- `src/types/` — Shared TypeScript interfaces (mirrors backend DB schema)

**Styling:** Tailwind CSS 4 utility classes only. Color palette: `zinc` as primary grayscale. Icons via `@iconify-icon/react`.

### Database (PostgreSQL 16)

Tables: `posts`, `blocks`, `users`, `activity_logs`, `contact_messages`. DB columns use `snake_case`. Drizzle schema in `backend/src/db/schema.ts`.

### Production

Docker Compose orchestrates PostgreSQL, backend, frontend/nginx, and backup containers. Uploaded files stored in a shared `uploads` volume (backend rw, nginx ro). Daily PostgreSQL backups at 3:00 AM with 7-day retention via `scripts/backup.sh`. See `docs/DEPLOYMENT.md` for VPS deployment details.

## Additional Conventions

Detailed code patterns (imports, component structure, naming, error handling, state management) are documented in `AGENTS.md`.
