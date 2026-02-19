# Пропозиції покращень проєкту Buro 710

> Аналіз оновлено: 2026-02-19
> Версія: 2.0
> Попередній аналіз: 2026-02-16

---

## Зміст

1. [Виконані завдання](#виконані-завдання)
2. [Актуальні проблеми](#актуальні-проблеми)
3. [Поступовий план виправлення](#поступовий-план-виправлення)
4. [Технічні деталі](#технічні-деталі)

---

## Виконані завдання

| Завдання | Статус | Дата |
|----------|--------|------|
| Міграція структури (`src/` → `frontend/` + `backend/`) | ✅ Виконано | - |
| TypeScript strict mode (frontend + backend) | ✅ Виконано | - |
| GalleryUploader.tsx — виправлено useEffect pattern | ✅ Виконано | - |
| SingleImageUpload.tsx — виправлено hoisting problem | ✅ Виконано | - |
| .env файли додано в .gitignore | ✅ Виконано | - |

---

## Актуальні проблеми

### 🔴 Критичні

#### 1. ESLint config відсутній

**Проблема**: ESLint 9.x вимагає `eslint.config.js` (flat config), але файл відсутній.
Команда `npm run lint` падає з помилкою.

**Рішення**: Створити `frontend/eslint.config.js`:

```javascript
import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  }
);
```

---

#### 2. Type Safety — `(req as any).user`

**Проблема**: 4 місця використовують `as any` для доступу до `req.user`:

| Файл | Рядок |
|------|-------|
| `backend/src/routes/portfolio.ts` | 250, 338, 359 |
| `backend/src/routes/auth.ts` | 52 |

**Рішення**: Створити `backend/src/types/express.d.ts`:

```typescript
import 'express';

declare module 'express' {
  interface Request {
    user?: {
      userId: string;
      email: string;
      role: string;
    };
  }
}
```

Потім замінити `(req as any).user` на `req.user`.

---

### 🟡 Середньої пріоритетності

#### 3. Відсутність тестів

**Стан**: 0 тестових файлів

**Рішення**:
```bash
cd frontend
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

---

#### 4. console.log/error (197 випадків)

**Розподіл**:
- Backend routes/services: ~80
- Frontend pages/components: ~50
- Seed scripts: ~60 (допустимо)

**Рішення**: Створити уніфікований логер.

---

#### 5. Відсутність Error Boundary

React-додаток не має Error Boundary для обробки помилок рендерингу.

---

### 🟢 Рекомендовані

#### 6. Husky + lint-staged + Prettier

Немає pre-commit hooks для автоматичного ліінтингу.

#### 7. API валідація (Zod)

Немає schema валідації для вхідних даних.

---

## Поступовий план виправнення

### Фаза 1: Інфраструктура (2-3 години)

| ID | Завдання | Пріоритет | Оцінка | Статус |
|----|----------|-----------|--------|--------|
| 1.1 | Створити `eslint.config.js` | 🔴 P0 | 30m | ⬜ |
| 1.2 | Typed Express Request (`express.d.ts`) | 🔴 P0 | 30m | ⬜ |
| 1.3 | Виправити `(req as any).user` → `req.user` | 🔴 P0 | 15m | ⬜ |
| 1.4 | Додати prettier + eslint-config-prettier | 🟡 P1 | 20m | ⬜ |
| 1.5 | Налаштувати husky + lint-staged | 🟡 P1 | 20m | ⬜ |

### Фаза 2: Якість коду (2-3 години)

| ID | Завдання | Пріоритет | Оцінка | Статус |
|----|----------|-----------|--------|--------|
| 2.1 | Створити `logger.ts` (frontend + backend) | 🟡 P1 | 1.5h | ⬜ |
| 2.2 | Замінити console.* на logger | 🟡 P1 | 1h | ⬜ |
| 2.3 | Додати Error Boundary | 🟡 P1 | 30m | ⬜ |
| 2.4 | Виправити escape символи в telegramService | 🟢 P2 | 15m | ⬜ |

### Фаза 3: Тестування (4-5 годин)

| ID | Завдання | Пріоритет | Оцінка | Статус |
|----|----------|-----------|--------|--------|
| 3.1 | Встановити Vitest + testing-library | 🟡 P1 | 30m | ⬜ |
| 3.2 | Unit тести: authService, projectService | 🟡 P1 | 1.5h | ⬜ |
| 3.3 | Component тести: Button, Input, ProjectCard | 🟢 P2 | 1.5h | ⬜ |
| 3.4 | Integration тести: auth routes | 🟢 P2 | 1h | ⬜ |

### Фаза 4: Покращення (опціонально, 3-4 години)

| ID | Завдання | Пріоритет | Оцінка | Статус |
|----|----------|-----------|--------|--------|
| 4.1 | API валідація з Zod | 🟢 P2 | 2h | ⬜ |
| 4.2 | `noUncheckedIndexedAccess` в tsconfig | 🟢 P2 | 30m | ⬜ |
| 4.3 | OpenAPI документація | 🟢 P2 | 1.5h | ⬜ |

---

## Технічні деталі

### Структура проєкту

```
buro710/
├── frontend/          # React + Vite + Tailwind
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── services/
│   │   └── types/
│   └── package.json
├── backend/           # Express + Supabase
│   ├── src/
│   │   ├── config/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   └── types/
│   └── package.json
└── package.json       # Workspaces root
```

### Команди

```bash
npm run dev            # Frontend + Backend
npm run build          # TypeScript check + Vite build
npm run lint           # ESLint (потребує виправлення)
npm run seed           # Seed projects
```

---

*Звіт оновлено на основі сканування кодової бази 2026-02-19.*
