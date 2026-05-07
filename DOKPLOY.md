# Deploy to Dokploy

## Prerequisites

1. Dokploy instance running
2. GitHub repository with your code

## Architecture

```
git push → Dokploy webhook
  └── docker compose up --build
        └── build backend (multi-stage: deps → production image)
        └── build frontend (multi-stage: build → nginx)
        └── PostgreSQL healthcheck passes
        └── backend starts → migrate() → HTTP server
        └── frontend starts → proxies /api to backend
```

## Automatic Migrations

**Міграції Drizzle застосовуються автоматично при кожному деплої.**

При старті backend-контейнера:
1. `entrypoint.sh` запускає `migrate.ts`
2. `migrate.ts` застосовує всі pending міграції з `backend/src/db/migrations/`
3. Потім запускається `seed-admin.ts` (якщо задані `ADMIN_EMAIL` і `ADMIN_PASSWORD`)
4. Тільки після цього стартує HTTP-сервер

Якщо міграція завершується помилкою — контейнер не піднімається (`process.exit(1)`), деплой зупиняється.

**Важливо:** ніколи не редагуй SQL-файли вже застосованих міграцій. Завжди генеруй нові через:
```bash
cd backend && npx drizzle-kit generate
```

---

## Deployment Steps

### 1. Create Application in Dokploy

1. Go to your Dokploy dashboard
2. Click "Create Application"
3. Choose "Docker Compose" as deployment type
4. Connect your GitHub repository

### 2. Configure Build Settings

- **Build Path**: `/` (root directory)
- **Docker Compose Path**: `docker-compose.yml`

### 3. Set Environment Variables

In Dokploy dashboard, add these environment variables:

```bash
NODE_ENV=production

# Required: PostgreSQL credentials
POSTGRES_DB=bureau710
POSTGRES_USER=bureau710_user
POSTGRES_PASSWORD=your-strong-random-password

# Required: Database connection string
DATABASE_URL=postgresql://bureau710_user:your-password@postgres:5432/bureau710

# Required: JWT configuration
JWT_SECRET=your-super-secret-jwt-key-min-64-chars

# Required: Admin credentials
ADMIN_EMAIL=your-email@example.com
ADMIN_PASSWORD=your-secure-password

# Required: Frontend URL (for CORS)
FRONTEND_URL=https://your-domain.com

# Required: API key for external API
API_KEY=your-random-api-key

# Optional: Telegram notifications
TELEGRAM_BOT_TOKEN=your-bot-token
TELEGRAM_CHAT_ID=your-chat-id
```

### 4. Configure Domains

1. **Frontend Domain**:
   - Add your domain (e.g., `yourdomain.com`)
   - Port: `8888` (maps to frontend container port 80)

2. **Backend API** (optional, if you need direct API access):
   - Add subdomain (e.g., `api.yourdomain.com`)
   - Port: `3000`

### 5. Deploy

1. Click "Deploy" in Dokploy
2. Wait for build to complete
3. Check logs — ви маєте побачити:
   ```
   Running migrations...
   Migrations complete
   Seeding admin user...
   Admin user created/updated successfully
   Starting server...
   Server running on port 3000
   ```

---

## Multi-Stage Build

### Backend Dockerfile

```
Stage 1 (builder): встановлює всі залежності, копіює source
Stage 2 (production): встановлює тільки production deps, копіює source з builder
```

Переваги:
- Менший образ (без devDependencies: vitest, @types/*, drizzle-kit)
- `tsx` залишається в production deps для запуску .ts файлів
- Міграції та seed запускаються автоматично через `entrypoint.sh`

### Frontend Dockerfile

```
Stage 1 (builder): збирає React + Vite → dist/
Stage 2 (nginx): роздає статику та проксує /api → backend
```

---

## Container Startup Order

```
1. PostgreSQL стартує → healthcheck (pg_isready)
2. Backend чекає на PostgreSQL (depends_on: condition: service_healthy)
3. Backend стартує → міграції → seed → HTTP server
4. Frontend чекає на backend (depends_on: condition: service_healthy)
5. Frontend стартує → Nginx готовий до запитів
```

---

## Staging Environment

Для стейджингу використовується окремий compose-файл:

- **Compose Path**: `docker-compose.staging.yml`
- **Branch**: `staging`
- **Domain**: `staging.yourdomain.com`
- **Alias**: `buro710-staging-backend`

---

## Troubleshooting

### Build fails
- Check Dockerfile paths
- Verify all dependencies are in package.json
- Check build logs in Dokploy

### Frontend can't reach backend
- Verify nginx.conf proxy settings
- Check container networking
- Verify VITE_API_URL is set to `/api`

### Database connection fails
- Verify PostgreSQL container is healthy: `docker compose ps postgres`
- Check `DATABASE_URL` points to `postgres:5432`
- Verify `POSTGRES_PASSWORD` matches between `.env` and container

### Migrations fail
- Check backend logs — шукай `Migration failed:`
- Переконайся, що міграції не конфліктують з існуючою схемою
- Якщо потрібно відкотити — використовуй `drizzle-kit drop` (тільки локально/на стейджингу)

### 401 after login
- Очисти localStorage в браузері: `localStorage.clear(); location.reload()`
- Перевір `token_version` в БД: `SELECT email, token_version FROM users;`
- Переконайся, що `JWT_SECRET` однаковий для всіх інстансів

## Production Checklist

- [ ] Set strong `JWT_SECRET` (min 64 chars)
- [ ] Change default admin credentials
- [ ] Configure `FRONTEND_URL` для CORS
- [ ] Enable HTTPS in Dokploy
- [ ] Verify backup container dumps PostgreSQL daily
- [ ] Configure rate limiting if needed
- [ ] Verify automatic migrations work on first deploy
