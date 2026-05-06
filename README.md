# Buro 710 - Monorepo

Портфоліо вебсайт для архітектурного бюро, розділений на frontend та backend.

## Структура

```
buro710/
├── frontend/           # React + Vite + Tailwind CSS
│   ├── src/
│   ├── package.json
│   ├── Dockerfile
│   └── nginx.conf
│
├── backend/            # Express + PostgreSQL
│   ├── src/
│   ├── package.json
│   └── Dockerfile
│
└── docker-compose.yml  # Оркестрація для production
```

## Локальна розробка

### Backend

```bash
cd backend
cp .env.example .env
# Заповнити .env з вашими credentials (JWT_SECRET, ADMIN_*, POSTGRES_*)
npm install
npm run dev
```

Backend запуститься на http://localhost:3000

### Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Frontend запуститься на http://localhost:5173

## Production деплой

### Docker Compose (рекомендовано для VPS)

1. Клонувати репозиторій на VPS
2. Створити `backend/.env` з production змінними:

```bash
cd backend
cp .env.example .env
nano .env
```

3. Запустити:

```bash
docker compose up -d --build
```

Сайт буде доступний на порту 80.

### Змінні оточення

#### Backend (.env)

```bash
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://yourdomain.com
JWT_SECRET=<32+ chars random string>
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=<secure password>

# PostgreSQL (self-hosted)
POSTGRES_DB=bureau710
POSTGRES_USER=bureau710_user
POSTGRES_PASSWORD=<strong random password>

# Telegram (опціонально)
TELEGRAM_BOT_TOKEN=xxx
TELEGRAM_CHAT_ID=xxx
```

#### Frontend (.env)

```bash
VITE_API_URL=/api
```

## Команди

### Backend

| Команда | Опис |
|---------|------|
| `npm run dev` | Розробка з hot reload |
| `npm start` | Production режим |
| `npm run seed:admin` | Створити admin користувача |
| `npm run seed:clean` | Видалити всі проекти |

### Frontend

| Команда | Опис |
|---------|------|
| `npm run dev` | Розробка |
| `npm run build` | Production білд |
| `npm run preview` | Перегляд білду |

## Стек технологій

**Frontend:**
- React 19
- TypeScript
- Vite
- Tailwind CSS 4
- React Router 7

**Backend:**
- Node.js + Express 5
- TypeScript
- PostgreSQL 17 (self-hosted via Docker)
- JWT Authentication
