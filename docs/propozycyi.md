# Пропозиції покращень проєкту Buro 710

> Останнє сканування: 2026-03-06
> Версія: 6.0

---

## Зміст

1. [Огляд проєкту](#огляд-проєкту)
2. [Поточний стан](#поточний-стан)
3. [Відкриті проблеми та пропозиції](#відкриті-проблеми-та-пропозиції)
4. [План покращень](#план-покращень)

---

## Огляд проєкту

**Buro 710** — сайт для архітектурної студії. Концепція портфоліо/проєктів повністю видалена — сайт побудований на постах/статтях.

### Технологічний стек

| Компонент | Технологія |
|-----------|------------|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS 4 |
| Backend | Node.js, Express 5, Supabase (PostgreSQL) |
| Shared | `@buro710/shared` — Zod-схеми (contact, post) |
| Auth | JWT tokens |
| Deploy | Vercel (frontend) + Docker (backend) |
| Language | Ukrainian |

### Структура

```
buro710/
├── frontend/              # React + Vite + Tailwind
│   └── src/
│       ├── api/           # Axios client
│       ├── components/    # React components
│       │   ├── admin/     # Admin UI + page-builder
│       │   ├── blocks/    # Public block renderers
│       │   ├── layout/    # Header, Footer
│       │   ├── sections/  # Homepage sections
│       │   └── ui/        # Button, Input, ImageLightbox
│       ├── hooks/         # Custom hooks
│       ├── layouts/       # AdminLayout
│       ├── lib/           # logger
│       ├── pages/         # Public + admin pages
│       ├── services/      # API service layer
│       └── types/         # TypeScript types
│
├── backend/               # Express + Supabase
│   └── src/
│       ├── config/        # Supabase, JWT config
│       ├── lib/           # logger
│       ├── middleware/    # auth, apiKey, multer, validate
│       ├── routes/        # API routes + external v1
│       ├── services/      # Business logic
│       └── types/         # TypeScript types
│
├── shared/                # @buro710/shared
│   └── src/schemas/       # Zod-схеми: contact.ts, post.ts
│
├── .husky/                # Git hooks
├── docs/                  # Documentation
└── package.json           # Workspaces root
```

### API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/login | — | Login |
| GET | /api/auth/me | JWT | Current user |
| GET | /api/posts | JWT | List posts (admin, з пагінацією та пошуком) |
| GET | /api/posts/:id | JWT | Get post by ID |
| POST | /api/posts | JWT | Create post |
| PUT | /api/posts/:id | JWT | Update post |
| DELETE | /api/posts/:id | JWT | Delete post |
| GET | /api/v1/posts | API Key | Public posts list |
| GET | /api/v1/posts/:slug | API Key | Public post by slug |
| POST | /api/contact | Rate limit + Zod | Send contact form |
| GET | /api/logs | JWT | Activity logs |

---

## Поточний стан

### Реалізовано

| Компонент | Деталі |
|-----------|--------|
| ESLint 9 config | Flat config, React hooks rules |
| TypeScript strict mode | Frontend + Backend + Shared |
| Prettier | Форматування коду |
| Husky + lint-staged | Pre-commit hooks |
| Error Boundary | Обробка помилок рендерингу |
| Logger | Frontend + Backend |
| Vitest | 7 тест-файлів (frontend: Button, Input, logger; backend: apiKey, e2e, posts.helper, posts) |
| Docker config | docker-compose.yml |
| Zod-валідація | Shared-пакет `@buro710/shared`: `contactSchema`, `postCreateSchema`, `postUpdateSchema`, `blockSchema` |
| Rate limiting | Contact route: 3 запити/хвилину (`express-rate-limit`) |
| Posts validation | `posts.validation.ts` — ручна валідація для зовнішнього API v1 |
| useCallback | Всі сторінки з `useEffect` використовують `useCallback` — warnings виправлені |
| console.* | Видалено з усіх routes і services, залишено лише в seed-скриптах та logger |
| Featured posts | Поле `featured` у БД, toggle в адмін-панелі, секція на головній |
| Пагінація + пошук | Admin PostsPage: пагінація, пошук, фільтр по статусу |
| Shared package | `@buro710/shared` зі Zod-схемами, використовується в frontend і backend |
| ProjectsGallerySection | Секція "Вибрані Проєкти" на головній — завантажує featured пости з БД, стиль з `docs/projects.html` |
| ProjectsPage `/projects` | Публічна сторінка з усіма опублікованими постами, той самий стиль карток (grayscale hover, skeleton loading) |
| Навігація | Посилання "Проєкти" в хедері веде на `/projects` (раніше — `/posts`) |
| Seed: 10 нових постів | `seed-posts-new.ts` — 10 ресторанних проєктів (Osteria Mano, Nox, Solarium, Karst, Grain, Birch, Assembly, Marea, Dvor, Alto), 3 з них featured |

### Метрики

| Метрика | Значення |
|---------|----------|
| Пакети монорепо | 3 (frontend, backend, shared) |
| TypeScript файлів | ~110 |
| ESLint errors | 0 |
| ESLint warnings | 0 |
| Тест-файлів | 7 |
| console.* в routes/services | 0 |

---

## Відкриті проблеми та пропозиції

### Критично (SEO / видимість)

#### 1. `index.html` — порожній SEO

**Файл:** `frontend/index.html`

Поточний стан — лише базовий заголовок без будь-яких мета-тегів. Favicon — дефолтний `vite.svg`.

```html
<!-- Зараз: -->
<title>buro710</title>
<link rel="icon" href="/vite.svg" />
<!-- Немає: description, og:title, og:image, twitter:card, canonical -->
```

**Рішення:** Додати базові мета-теги, власний favicon, og:image за замовчуванням.

---

#### 2. ~~Відсутня публічна сторінка архіву постів~~ ✅ Виконано

Створено `frontend/src/pages/ProjectsPage.tsx`, роут `/projects` додано в `App.tsx`.

---

#### 3. Відсутні `robots.txt` і `sitemap.xml`

Файли для пошукових роботів не існують. Критично для індексації.

**Рішення:**
- `frontend/public/robots.txt` — статичний файл
- Динамічний `sitemap.xml` через ендпоінт бекенду або генерація при білді

---

### Середній пріоритет

#### 4. Відсутній `<Footer />` на сторінці поста

**Файл:** `frontend/src/pages/PublicPostPage.tsx`

`PublicPostPage` не рендерить `<Footer />` — сторінка "обривається". Всі інші публічні сторінки мають футер.

**Рішення:** Додати `<Footer />` в кінець `PublicPostPage`.

---

#### 5. Недостатнє покриття тестами бекенду

**Поточний стан:**
- `middleware/apiKey.test.ts` — тести middleware
- `e2e/api.test.ts` — e2e тести
- `routes/api/posts.test.ts` + `posts.helper.test.ts` — тести зовнішнього API

**Відсутні тести для сервісів:**
- `postService.test.ts`
- `blockService.test.ts`
- `contactService.test.ts`
- Тести admin-routes (`routes/posts.ts`, `routes/auth.ts`)

---

### Низький пріоритет

#### 6. `noUncheckedIndexedAccess` в tsconfig

TypeScript опція для безпечної роботи з масивами та об'єктами.

```json
// tsconfig.json
{
  "compilerOptions": {
    "noUncheckedIndexedAccess": true
  }
}
```

Може вимагати виправлення існуючого коду.

---

#### 7. RSS-стрічка

Корисно для архітектурної студії — підписка на нові публікації.

**Рішення:** Ендпоінт `GET /api/v1/rss.xml` або `/rss.xml` (статичний файл при деплої).

---

#### 8. Час читання статті

Автоматичний розрахунок з текстових блоків і відображення на сторінці поста.

---

## План покращень

### Фаза 1: SEO (1-2 години)

| ID | Завдання | Статус |
|----|----------|--------|
| 1.1 | Базові мета-теги + favicon в `index.html` | ✅ |
| 1.2 | `robots.txt` | ⬜ |
| 1.3 | `sitemap.xml` (статичний або динамічний) | ⬜ |

### Фаза 2: Контент (2-3 години)

| ID | Завдання | Статус |
|----|----------|--------|
| 2.1 | Публічна сторінка архіву проєктів `/projects` | ✅ |
| 2.2 | Додати `<Footer />` на `PublicPostPage` | ⬜ |

### Фаза 3: Тести (2-3 години)

| ID | Завдання | Статус |
|----|----------|--------|
| 3.1 | `postService.test.ts` | ⬜ |
| 3.2 | `blockService.test.ts` | ⬜ |
| 3.3 | Admin routes integration tests | ⬜ |

### Фаза 4: Опціонально

| ID | Завдання | Статус |
|----|----------|--------|
| 4.1 | `noUncheckedIndexedAccess` в tsconfig | ⬜ |
| 4.2 | RSS-стрічка | ⬜ |
| 4.3 | Час читання статті | ⬜ |

---

## Історія змін

| Дата | Версія | Зміни |
|------|--------|-------|
| 2026-03-06 | 6.0 | ProjectsGallerySection на головній (стиль з projects.html, featured пости з БД). ProjectsPage `/projects`. Навігація на `/projects`. Seed 10 нових постів-проєктів |
| 2026-03-06 | 5.0 | Повний рескан. Видалено концепцію projects/portfolio. Відображено реальний стан: Zod, rate limit, shared-пакет, виправлені warnings та ESLint errors |
| 2026-02-19 | 4.0 | Повний рескан проєкту, нова структура документа |
| 2026-02-19 | 3.0 | Завершено Фази 1-3 |
| 2026-02-16 | 1.0 | Початковий аналіз |

---

*Документ згенеровано на основі сканування кодової бази.*
