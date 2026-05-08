# План покращення тестування

## Мета
Довести стабільність, надійність і передбачуваність змін у monorepo `olejra_buro710` через системне розширення тестової піраміди.

---

## 1. E2E тести (Playwright)
**Пріоритет: Високий**

Юніт-тести покривають логіку, але не користувацькі сценарії. Додаємо 3-5 критичних end-to-end flow:

- [x] Адмін логін → створення посту з блоками → публікація → перевірка на публічній сторінці
- [x] Контактна форма → перевірка повідомлення в адмінці
- [x] CRUD користувачів

**Критерій готовності:**
- [x] Playwright встановлений та налаштований (`e2e/` workspace)
- [x] CI workflow оновлений для запуску E2E тестів
- [x] 3 E2E spec файли з проходженням тестів

---

## 2. Database інтеграційні тести
**Пріоритет: Високий**

Усі сервісні тести зараз мокують Drizzle. Треба додати шар тестів із реальною PostgreSQL (Testcontainers або in-memory pg), щоб ловити реальні SQL помилки, міграційні проблеми та race conditions.

- [x] Додати `@testcontainers/postgresql` як dev dependency
- [x] Написати інтеграційні тести для `postService`, `userService`, `contactService`
- [x] Запускати інтеграційні тести окремим скриптом (`npm run test:integration`)

---

## 3. Frontend coverage > 80%
**Пріоритет: Середній**

Зараз 82 тести покривають хуки, блоки та UI-компоненти. Не вистачає:

- [ ] Сторінкові тести (`AdminLayout`, `PostList`, `LoginPage`)
- [ ] Навігація / роутинг
- [ ] API клієнт (`client.ts`) — інтерсептори, обробка 401, retry логіка

---

## 4. Contract / API schema тести
**Пріоритет: Середній**

Перевіряти, що backend реально повертає те, що очікує frontend. Автоматично тестувати Zod shared schemas проти реальних відповідей API.

- [ ] Додати тест, який проходить по всіх роутах `/api/v1/*` і валідує відповіді через `postCreateSchema`, `postUpdateSchema`, `blockSchema`
- [ ] Фейлити CI при schema mismatch

---

## 5. CI оптимізації
**Пріоритет: Низький (швидка перемога)**

- [ ] Job-level кешування `node_modules` і `.vitest` для швидшого запуску
- [ ] Conditional runs — запускати frontend/backend тести тільки при зміні файлів у відповідних директоріях
- [ ] Shard'інг backend тестів при зростанні кількості

---

## 6. Performance & security gates
**Пріоритет: Низький**

- [ ] **Lighthouse CI** — перевіряти Core Web Vitals при кожному PR
- [ ] **Security headers test** — HSTS, CSP, X-Frame-Options
- [ ] **Bundle size gate** — фейлити PR, якщо frontend bundle виріс більше ліміту

---

## 7. Observability тести
**Пріоритет: Низький**

- [ ] Health check endpoint (`/health` або `/api/health`) — перевіряти DB connection, дисковий простір
- [ ] Swagger contract test — всі роути з `swagger.json` повертають 2xx/4xx, а не 404

---

## Поточний стан (baseline)
- Backend: 375 tests, coverage ~85%
- Frontend: 82 tests
- Shared: 57 tests
- E2E: 3 Playwright specs (admin post CRUD, contact form, admin users CRUD)
- CI: GitHub Actions — shared, frontend, backend, E2E паралельно

---

*План створено 2026-05-08*
