# Деплой на Vercel + Railway

## 📋 Загальний огляд

Цей проєкт використовує розділений деплой:
- **Frontend:** Vercel (React + Vite)
- **Backend:** Railway (Express + Supabase)
- **Database:** Supabase (PostgreSQL + Storage)

```
Frontend (Vercel)                          Backend (Railway)
     │                                            │
     │  https://olejra-buro710.vercel.app         │  https://olejraburo710-production.up.railway.app
     │                                            │
     └───────────────┬────────────────────────────┘
                   /api/*
```

---

## ✅ Статус деплою

| Компонент | URL | Status |
|-----------|-----|--------|
| Frontend | `https://olejra-buro710.vercel.app` | ⏳ Чекаю деплою |
| Backend | `https://olejraburo710-production.up.railway.app` | ⏳ Redeploy з новими змінами |
| Supabase | Ваш URL | ✅ Ready |

---

## 🚀 Крок 1: Деплой Frontend на Vercel

### 1.1 Login в Vercel
1. Перейдіть на https://vercel.com
2. Натисніть "Login" або "Sign Up"
3. Використайте GitHub для логіну (рекомендовано)

### 1.2 Import проєкту з GitHub
1. Після логіну натисніть "Add New..." → "Project"
2. Знайдіть репозиторій `olejra_buro710` (або ваше імя репозиторію)
3. Натисніть "Import"

### 1.3 Налаштування Project
Vercel автоматично виявить налаштування Vite проєкту:

**Framework Preset:** `Vite`
**Build Command:** `npm run build`
**Output Directory:** `dist`

### 1.4 Environment Variables
В розділі "Environment Variables" додайте:

| Variable | Value | Environment |
|----------|--------|-------------|
| `VITE_API_URL` | `https://olejraburo710-production.up.railway.app/api` | Production, Preview, Development |

### 1.5 Deploy
1. Натисніть "Deploy"
2. Чекайте поки завершиться build (1-2 хвилини)
3. URL буде доступний як `https://olejra-buro710.vercel.app`

### 1.6 Перевірка Frontend
1. Перейдіть на `https://olejra-buro710.vercel.app`
2. Відкрийте Console (F12 → Console)
3. Перевірте немає помилок
4. Перевірте чи працюють сторінки

---

## ⚙️ Крок 2: Налаштування Backend на Railway

### 2.1 Перевірити Railway Dashboard
1. Перейдіть на https://railway.app
2. Login з GitHub
3. Знайдіть проєкт `buro710` або `olejraburo710`

### 2.2 Додати Environment Variable
1. Відкрийте проєкт → Variables tab
2. Додайте нову змінну:
   - **Name:** `FRONTEND_URL`
   - **Value:** `https://olejra-buro710.vercel.app/`
3. Натисніть "Save Changes"
4. Натисніть "Redeploy" (якщо не деплоить автоматично)

### 2.3 Перевірити Health Check
1. Відкрийте Logs tab на Railway
2. Перевірте чи немає помилок
3. Перейдіть на URL: `https://olejraburo710-production.up.railway.app/health`
   - Має бути: `{"status":"ok","timestamp":"..."}`

### 2.4 Перевірка Backend
1. Спробуйте login в admin панель
2. Перевірте CRUD operations для projects
3. Перевірте file uploads в Supabase Storage

---

## 🔄 Крок 3: GitHub Auto-Deploy

### Railway
✅ **Автоматично деплоить при кожному push в GitHub**
- Підключено через `render.yaml`
- Автоматично перезбирає при нових комітах

### Vercel
✅ **Автоматично деплоить при кожному push в GitHub**
- Підключено після першого деплою
- Автоматично створює preview deployments для pull requests

---

## ✅ Перевірка після деплою

### Frontend Checks (Vercel)
- [ ] Сайт завантажується на `https://olejra-buro710.vercel.app`
- [ ] Стилі працюють (Tailwind CSS)
- [ ] Статичні ресурси оптимізовані
- [ ] Console в browser без помилок (F12 → Console)
- [ ] API calls працюють (Network tab в devtools)

### Backend Checks (Railway)
- [ ] Health check працює: `https://olejraburo710-production.up.railway.app/health`
- [ ] CORS не блокує запити з Vercel URL
- [ ] Admin login працює (`/api/admin/login`)
- [ ] CRUD operations працюють (`/api/portfolio/*`)
- [ ] File uploads в Supabase Storage (`POST /api/portfolio`)
- [ ] Activity logs записуються (`/api/logs`)

---

## 🛠️ Таблиця Environment Variables

### Vercel Environment Variables

| Variable | Value | Description |
|----------|--------|-------------|
| `VITE_API_URL` | `https://olejraburo710-production.up.railway.app/api` | Backend API URL |

### Railway Environment Variables

| Variable | Value | Description |
|----------|--------|-------------|
| `NODE_ENV` | `production` | Production mode |
| `FRONTEND_URL` | `https://olejra-buro710.vercel.app/` | Frontend URL для CORS |
| `PORT` | `3000` | Server port |
| `JWT_SECRET` | (секретний ключ) | JWT токен секрет |
| `ADMIN_EMAIL` | (admin email) | Admin email |
| `ADMIN_PASSWORD` | (admin password) | Admin password |
| `SUPABASE_URL` | (Supabase URL) | Supabase project URL |
| `SUPABASE_ANON_KEY` | (Supabase key) | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | (Supabase key) | Supabase service role key |
| `DATABASE_URL` | (PostgreSQL URL) | Supabase database URL |
| `TELEGRAM_BOT_TOKEN` | (bot token) | Telegram bot token |
| `TELEGRAM_CHAT_ID` | (chat ID) | Telegram chat ID |

---

## 📝 Структура проєкту

```
C:\CODE\buro710\
├── src/
│   ├── app.tsx              # React entry point
│   ├── components/           # React components
│   ├── pages/              # Page components
│   ├── server/             # Backend (Express)
│   │   ├── index.ts        # Server entry point
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   └── middleware/    # Middleware (auth, multer)
│   └── api/               # API client (axios)
├── public/                 # Static assets
├── docs/                   # Documentation (ця папка)
├── package.json            # Dependencies & scripts
├── vercel.json            # Vercel configuration
└── render.yaml            # Railway configuration
```

---

## 📞 Усунення проблем

### Railway не відповідає (502 error)
**Симптом:** `{"status":"error","code":502,"message":"Application failed to respond"}`

**Рішення:**
1. Перевірте Logs на Railway Dashboard
2. Зазвичай build займає 2-5 хвилин
3. Якщо є помилки в логах:
   - Перевірити environment variables
   - Перевірити build logs
   - Спробуйте manual redeploy

### Vercel build помилки
**Симптом:** Build failing на Vercel

**Рішення:**
1. Перевірте Vercel Deploy logs
2. Перевірте environment variables
3. Перевірте чи `npm run build` працює локально:
   ```bash
   npm run build
   ```

### CORS помилки
**Симптом:** CORS errors в Console (F12)

**Рішення:**
1. Перевірте чи `FRONTEND_URL` правильно встановлений на Railway
   - Має бути: `https://olejra-buro710.vercel.app/`
2. Перевірте в Console (F12) чи немає CORS errors
3. Перезапустіть Railway redeploy

### File uploads не працюють
**Симптом:** Error при завантаженні файлів

**Рішення:**
1. Перевірте Supabase Storage permissions
2. Перевірте чи `SUPABASE_SERVICE_ROLE_KEY` правильно встановлений
3. Перевірте Railway logs для деталей помилки

---

## 🚀 Команди для локальної розробки

```bash
# Start development (frontend + backend)
npm run dev

# Start frontend only
npm run dev:frontend

# Start backend only
npm run dev:backend

# Build for production
npm run build

# Start production server
npm run start

# Lint code
npm run lint

# Seed database with projects
npm run seed

# Seed database with random projects
npm run seed:random

# Clear all projects
npm run seed:clean

# Create admin user
npm run seed:admin
```

---

## 📚 Корисні посилання

- [Vercel Documentation](https://vercel.com/docs)
- [Railway Documentation](https://docs.railway.app)
- [Supabase Documentation](https://supabase.com/docs)
- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)

---

## 📞 Зв'язок

Якщо є питання або проблеми:
- Vercel Dashboard: https://vercel.com/dashboard
- Railway Dashboard: https://railway.app
- GitHub Repository: https://github.com/Filiczini/olejra_buro710

---

## ✅ Чек-лист перед деплоєм

- [ ] Frontend деплоиться на Vercel
- [ ] Backend деплоиться на Railway
- [ ] Environment Variables налаштовані на Vercel
- [ ] Environment Variables налаштовані на Railway
- [ ] CORS налаштований правильно (`FRONTEND_URL`)
- [ ] Health check працює на Railway
- [ ] Frontend завантажується з Vercel
- [ ] API calls працюють між Vercel та Railway
- [ ] File uploads працюють в Supabase Storage
- [ ] Admin panel працює
- [ ] Production builds працюють локально

---

**Створено:** 15 лютого 2026
**Версія:** 1.0.0
