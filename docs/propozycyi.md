# Пропозиції покращень проєкту Buro 710

> Аналіз виконано: 2026-02-16
> Версія: 1.0

---

## Зміст

1. [Критичні проблеми](#критичні-проблеми)
2. [Проблеми безпеки](#проблеми-безпеки)
3. [Середньої пріоритетності](#середньої-пріоритетності)
4. [Рекомендовані покращення](#рекомендовані-покращення)
5. [Пріоритезований план дій](#пріоритезований-план-дій)

---

## Критичні проблеми

### 1. Подвійна структура коду (Дублювання)

Проєкт містить три паралельні структури:
- `src/` — моноліт (використовується для `npm run dev`)
- `frontend/` + `backend/` — розділена структура (Docker-ready)

**Проблема**: Код дублюється, що ускладнює підтримку та призводить до розсинхронізації.

**Рішення**:
- Визначити цільову структуру (рекомендую `frontend/` + `backend/`)
- Видалити застарілу `src/` або завершити міграцію

---

### 2. Відсутність тестів

```
**/*.test.{ts,tsx} — 0 файлів
**/*.spec.{ts,tsx} — 0 файлів
```

**Рішення**:
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

Типи тестів для впровадження:
- Unit тести для services
- Integration тести для routes
- Component тести для React компонентів

---

### 3. ESLint помилки (30+ помилок)

| Категорія | Кількість | Приклад |
|-----------|-----------|---------|
| `@typescript-eslint/no-explicit-any` | 7 | `(req as any).user` |
| `@typescript-eslint/no-unused-vars` | 5 | невикористані змінні |
| React anti-patterns | 3 | setState в useEffect |
| Непотрібні escape символи | 6 | в telegramService |

**Найкритичніші**:

```tsx
// ❌ frontend/src/components/admin/GalleryUploader.tsx:44
// setState в useEffect — спричиняє cascading renders
useEffect(() => {
  setImageItems(items);
}, []);

// ❌ frontend/src/components/admin/SingleImageUpload.tsx:32
// Hoisting problem — виклик функції до декларації
const previewUrl = await createPreview(image);
const createPreview = (file: File) => { ... }
```

**Рішення**:
```tsx
// ✅ GalleryUploader.tsx — винести ініціалізацію з useEffect
const [imageItems, setImageItems] = useState<ImageItem[]>(() => 
  initialImages.map((url, index) => ({...}))
);

// ✅ SingleImageUpload.tsx — перемістити функцію вище
const createPreview = (file: File): Promise<string> => { ... }

useEffect(() => {
  const generatePreview = async () => {
    if (image) {
      const previewUrl = await createPreview(image);
      // ...
    }
  };
  generatePreview();
}, [image, initialImageUrl]);
```

---

## Проблеми безпеки

### 4. Type Safety

| Проблема | Локація | Ризик |
|----------|---------|-------|
| `(req as any).user` | auth.ts:52 | Втрата type checking |
| Hardcoded timeout | client.ts:5 | Залежність від API |
| `.env` файл | backend/.env | Потенційний leak секретів |

**Рішення**:
```typescript
// ✅ Створити typed request interface
// src/types/express.d.ts
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

---

## Середньої пріоритетності

### 5. Зайва кількість console.log/error (229 випадків)

**Розподіл**:
- Frontend: ~50 console.error
- Backend: ~40 console.error/log
- Дубльований код (src/ + frontend/backend): ~100

**Рішення**: Впровадити логер

```typescript
// src/lib/logger.ts
type LogLevel = 'error' | 'warn' | 'info' | 'debug';

const isDev = import.meta.env.DEV;

export const logger = {
  error: (message: string, context?: unknown) => {
    console.error(`[ERROR] ${message}`, context ?? '');
    // TODO: Відправляти в Sentry/LogRocket у production
  },
  warn: (message: string, context?: unknown) => {
    if (isDev) console.warn(`[WARN] ${message}`, context ?? '');
  },
  info: (message: string) => {
    if (isDev) console.log(`[INFO] ${message}`);
  },
  debug: (message: string, context?: unknown) => {
    if (isDev) console.log(`[DEBUG] ${message}`, context ?? '');
  },
};
```

---

### 6. Відсутність Error Boundary

React-додаток не має Error Boundary для обробки помилок рендерингу.

**Рішення**:
```tsx
// src/components/ErrorBoundary.tsx
import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? <div>Щось пішло не так...</div>;
    }
    return this.props.children;
  }
}
```

---

### 7. TypeScript strict mode

`tsconfig.json` не має `strict: true`, що дозволяє небезпечні патерни.

**Рішення**: Додати в `tsconfig.json`:
```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

---

## Рекомендовані покращення

### 8. Архітектура

| Поточно | Рекомендовано |
|---------|---------------|
| Props drilling | React Context або Zustand |
| Немає валідації API | Zod / Yup schemas |
| Немає rate limiting docs | Додати документацію |

### 9. Developer Experience

```bash
# Додати pre-commit hooks
npm install -D husky lint-staged

# Додати форматування
npm install -D prettier eslint-config-prettier
```

```json
// package.json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"]
  }
}
```

---

## Пріоритезований план дій

| Пріоритет | Завдання | Оцінка часу | Статус |
|-----------|----------|-------------|--------|
| 🔴 P0 | Виправити React anti-patterns (GalleryUploader, SingleImageUpload) | 1h | ⬜ |
| 🔴 P0 | Виправити TypeScript `any` типи | 1h | ⬜ |
| 🔴 P0 | Завершити міграцію структури (src/ → frontend/backend) | 2h | ⬜ |
| 🟡 P1 | Додати Vitest + базові тести | 3h | ⬜ |
| 🟡 P1 | Впровадити логер | 1h | ⬜ |
| 🟡 P1 | Додати Error Boundary | 30m | ⬜ |
| 🟢 P2 | TypeScript strict mode | 2h | ⬜ |
| 🟢 P2 | Додати pre-commit hooks (husky + lint-staged) | 30m | ⬜ |
| 🟢 P2 | API валідація (Zod) | 2h | ⬜ |

---

## Додаткові ресурси

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Zod Schema Validation](https://zod.dev/)
- [Husky Git Hooks](https://typicode.github.io/husky/)

---

*Звіт згенеровано автоматично на основі аналізу кодової бази.*
