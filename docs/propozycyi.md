# Пропозиції покращень проєкту Buro 710

> Останнє сканування: 2026-02-19
> Версія: 4.0

---

## Зміст

1. [Огляд проєкту](#огляд-проєкту)
2. [Поточний стан](#поточний-стан)
3. [Проблеми та рішення](#проблеми-та-рішення)
4. [План покращень](#план-покращень)
5. [Технічні деталі](#технічні-деталі)

---

## Огляд проєкту

**Buro 710** — портфоліо сайт для архітектурної студії.

### Технологічний стек

| Компонент | Технологія |
|-----------|------------|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS 4 |
| Backend | Node.js, Express 5, Supabase (PostgreSQL) |
| Auth | JWT tokens |
| Deploy | Vercel (frontend) + Docker (backend) |
| Language | Ukrainian |

### Структура

```
buro710/
├── frontend/              # React + Vite + Tailwind
│   ├── src/
│   │   ├── api/           # Axios client
│   │   ├── components/    # React components
│   │   ├── hooks/         # Custom hooks
│   │   ├── layouts/       # Page layouts
│   │   ├── lib/           # Utilities (logger)
│   │   ├── pages/         # Page components
│   │   ├── services/      # API service layer
│   │   ├── test/          # Test setup
│   │   └── types/         # TypeScript types
│   ├── eslint.config.js   # ESLint 9 flat config
│   ├── vitest.config.ts   # Vitest config
│   └── .prettierrc        # Prettier config
│
├── backend/               # Express + Supabase
│   ├── src/
│   │   ├── config/        # Supabase, JWT config
│   │   ├── lib/           # Utilities (logger)
│   │   ├── middleware/    # Auth, multer
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   └── types/         # TypeScript types
│   └── .prettierrc        # Prettier config
│
├── .husky/                # Git hooks
├── docs/                  # Documentation
├── scripts/               # Utility scripts
└── package.json           # Workspaces root
```

---

## Поточний стан

### ✅ Реалізовано

| Компонент | Статус | Деталі |
|-----------|--------|--------|
| ESLint 9 config | ✅ | Flat config, React hooks rules |
| TypeScript strict mode | ✅ | Frontend + Backend |
| Prettier | ✅ | Форматування коду |
| Husky + lint-staged | ✅ | Pre-commit hooks |
| Typed Express Request | ✅ | `AuthenticatedUser` interface |
| Error Boundary | ✅ | Обробка помилок рендерингу |
| Logger | ✅ | Frontend + Backend |
| Vitest | ✅ | 9 тестів passing |
| Docker config | ✅ | docker-compose.yml |

### 📊 Метрики

| Метрика | Значення |
|---------|----------|
| TypeScript файлів | ~100 |
| ESLint errors | 1 (unused variable) |
| ESLint warnings | 7 (useEffect deps) |
| Тести | 9 passing |
| console.* використань | ~200 |

### ⚠️ Відкриті питання

1. **ESLint error:** `originalEnv` unused в `logger.test.ts`
2. **ESLint warnings:** Missing useEffect dependencies (7 файлів)
3. **Console statements:** ~200 випадків (частково в seed scripts)

---

## Проблеми та рішення

### 🟡 Середній пріоритет

#### 1. ESLint error в тесті

**Файл:** `frontend/src/lib/__tests__/logger.test.ts:5`

```typescript
// Проблема:
const originalEnv = import.meta.env.DEV; // never used

// Рішення: видалити змінну
```

---

#### 2. useEffect dependencies warnings (7 файлів)

**Файли:**
- `frontend/src/pages/AllProjectsPage.tsx`
- `frontend/src/pages/PublicPostPage.tsx`
- `frontend/src/pages/admin/ActivityLogPage.tsx`
- `frontend/src/pages/admin/DashboardPage.tsx`
- `frontend/src/pages/admin/EditPostPage.tsx`
- `frontend/src/pages/admin/PostsPage.tsx` (2 warnings)

**Рішення:**
1. Обгорнути функції в `useCallback`
2. Або додати eslint-disable коментарі якщо функція повинна викликатись тільки при mount

---

#### 3. Console statements (~200)

**Розподіл:**
| Категорія | Кількість | Дія |
|-----------|-----------|-----|
| Seed scripts | ~80 | Залишити (CLI output) |
| Backend routes | ~25 | Замінити на logger |
| Backend services | ~10 | Частково виправлено |
| Frontend pages | ~15 | Замінити на logger |
| Tests | ~5 | Залишити (mock assertions) |
| Logger implementation | ~5 | Залишити |

**Виправлено:**
- `backend/src/routes/auth.ts`
- `backend/src/services/contactService.ts`
- `backend/src/services/projectService.ts`
- `backend/src/services/telegramService.ts`

---

### 🟢 Низький пріоритет

#### 4. Відсутність Zod валідації

API не має schema валідації вхідних даних.

**Рішення:**
```bash
npm install zod
```

Створити schemas для:
- Portfolio create/update
- Posts create/update
- Contact form

---

#### 5. Неповне покриття тестами

**Поточний стан:**
- `Button.test.tsx` — 5 тестів ✅
- `logger.test.ts` — 4 тести ✅

**Рекомендовано додати:**
- `Input.test.tsx`
- `ProjectCard.test.tsx`
- `projectService.test.ts` (backend)
- Auth routes integration tests

---

#### 6. noUncheckedIndexedAccess

TypeScript опція для безпечної роботи з масивами.

```json
// tsconfig.json
{
  "compilerOptions": {
    "noUncheckedIndexedAccess": true
  }
}
```

---

## План покращень

### Фаза 1: Quick Fixes (30 хв)

| ID | Завдання | Пріоритет | Статус |
|----|----------|-----------|--------|
| 1.1 | Видалити unused `originalEnv` з logger.test.ts | 🟡 | ⬜ |
| 1.2 | Виправити useEffect deps warnings | 🟡 | ⬜ |
| 1.3 | Замінити console.* на logger в routes | 🟡 | ⬜ |

### Фаза 2: Валідація (2-3 години)

| ID | Завдання | Пріоритет | Статус |
|----|----------|-----------|--------|
| 2.1 | Встановити Zod | 🟢 | ⬜ |
| 2.2 | Schema для portfolio routes | 🟢 | ⬜ |
| 2.3 | Schema для posts routes | 🟢 | ⬜ |
| 2.4 | Schema для contact form | 🟢 | ⬜ |

### Фаза 3: Тести (3-4 години)

| ID | Завдання | Пріоритет | Статус |
|----|----------|-----------|--------|
| 3.1 | Input.test.tsx | 🟢 | ⬜ |
| 3.2 | ProjectCard.test.tsx | 🟢 | ⬜ |
| 3.3 | Backend services tests | 🟢 | ⬜ |
| 3.4 | Auth integration tests | 🟢 | ⬜ |

### Фаза 4: Оптимізація (опціонально)

| ID | Завдання | Пріоритет | Статус |
|----|----------|-----------|--------|
| 4.1 | noUncheckedIndexedAccess | 🟢 | ⬜ |
| 4.2 | API documentation (OpenAPI) | 🟢 | ⬜ |
| 4.3 | Bundle analysis | 🟢 | ⬜ |

---

## Технічні деталі

### Команди

```bash
# Development
npm run dev              # Frontend + Backend
npm run dev:frontend     # Frontend only (port 5173)
npm run dev:backend      # Backend only (port 3000)

# Build
npm run build            # TypeScript check + Vite build
npm run preview          # Preview production build

# Quality
npm run lint             # ESLint (1 error, 7 warnings)
npm run format           # Prettier format frontend
npm run test             # Vitest watch mode
npm run test:run         # Vitest run once

# Database
npm run seed             # Seed projects
npm run seed:posts       # Seed posts
npm run seed:admin       # Create admin user
npm run seed:clean       # Clear projects
npm run migrate:projects # Run migrations
```

### Налаштування

**ESLint (frontend/eslint.config.js)**
- TypeScript recommended rules
- React Hooks rules
- Prettier compatibility

**TypeScript**
- Strict mode enabled
- ES2022 target
- Module: ESNext

**Prettier**
- Single quotes
- Semi: true
- Tab width: 2
- Trailing comma: es5

### Змінні середовища

**Frontend (.env)**
```
VITE_API_URL=http://localhost:3000/api
```

**Backend (.env)**
```
DATABASE_URL=supabase_connection_string
JWT_SECRET=your_secret_here
TELEGRAM_BOT_TOKEN=optional
TELEGRAM_CHAT_ID=optional
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Current user |
| GET | /api/portfolio | List projects |
| POST | /api/portfolio | Create project (auth) |
| PUT | /api/portfolio/:id | Update project (auth) |
| DELETE | /api/portfolio/:id | Delete project (auth) |
| GET | /api/posts | List posts |
| GET | /api/posts/:slug | Get post by slug |
| POST | /api/posts | Create post (auth) |
| POST | /api/contact | Send contact form |

---

## Історія змін

| Дата | Версія | Зміни |
|------|--------|-------|
| 2026-02-19 | 4.0 | Повний рескан проєкту, нова структура документа |
| 2026-02-19 | 3.0 | Завершено Фази 1-3 |
| 2026-02-16 | 1.0 | Початковий аналіз |

---

*Документ згенеровано на основі сканування кодової бази.*
