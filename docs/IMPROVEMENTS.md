# Buro710 — План покращень

Проходимо по черзі. Після завершення пункту ставимо `[x]`.

---

## 1. КРИТИЧНІ

- [x] **1.1 Додати RBAC middleware** — будь-який залогінений юзер може CRUD пости, дивитись логи. Потрібен `adminMiddleware` що перевіряє `req.user.role === 'admin'`
  - `backend/src/routes/posts.ts`
  - `backend/src/routes/activityLogs.ts`

- [x] **1.2 Timing-safe порівняння API key** — замінити `!==` на `crypto.timingSafeEqual()`
  - `backend/src/middleware/apiKey.ts:20`

- [x] **1.3 Прибрати дублювання токена** — `create()`, `update()`, `delete()` вручну додають `Authorization` header, хоча інтерцептор в `client.ts` вже це робить
  - `frontend/src/services/api.ts:66,74,83`

---

## 2. БЕЗПЕКА

- [x] **2.1 Валідація розширень файлів при upload** — зараз тільки MIME, потрібен whitelist `.jpg/.jpeg/.png`
  - `backend/src/services/storageService.ts:29-34`

- [x] **2.2 Обмежити пагінацію** — `limit` max 100, `page` min 1, валідація `parseInt` з radix 10
  - `backend/src/routes/posts.ts:67-68`
  - `backend/src/routes/activityLogs.ts:13-14`
  - `backend/src/routes/api/posts.ts:149`

- [x] **2.3 Ліміт довжини search** — додати перевірку `search.length > 200`
  - `backend/src/services/postService.ts:107`

- [x] **2.4 Валідація CORS URL в production** — перевірити що `FRONTEND_URL` починається з `https://`
  - `backend/src/index.ts:19-24`

- [x] **2.5 Видалити .env з git history** — файли вже трекаються, потрібен `git filter-branch` або новий репо
  - `.env`, `backend/.env`, `frontend/.env`

---

## 3. АРХІТЕКТУРА

- [x] **3.1 Консолідувати валідацію** — `validatePostBody()` і `validatePostInput()` роблять одне й те саме
  - `backend/src/routes/posts.ts:31-60`
  - `backend/src/routes/api/posts.validation.ts:30-62`

- [x] **3.2 Консолідувати обробку блоків** — майже ідентичний код в двох файлах, винести в спільний модуль
  - `backend/src/routes/posts.ts:172-207`
  - `backend/src/routes/api/posts.ts:115-132`

- [x] **3.3 Кастомні Error класи** — замість `(error as Error).message === 'Slug already exists'`
  - Створити `ValidationError`, `NotFoundError`, `ConflictError`

- [x] **3.4 Консистентні response формати** — зараз `{ error }` vs `{ errors: [] }` vs `{ success, message, data }`
  - Визначити єдиний `ApiResponse<T>` envelope

- [x] **3.5 Soft delete для постів** — зараз hard delete без можливості відновлення
  - `backend/src/services/postService.ts:232-261`

- [x] **3.6 Shared package: прибрати .js файли з git** — залишити тільки .ts
  - `shared/src/*.js`, `shared/src/schemas/*.js`

---

## 4. PERFORMANCE

- [x] **4.1 Promise.all для post + blocks** — зараз 2 послідовних запити (N+1)
  - `backend/src/services/postService.ts:131-142`

- [x] **4.2 Паралельний upload зображень блоків** — зараз послідовний for loop
  - `backend/src/routes/posts.ts:242-268`

- [x] **4.3 getUniqueUsers() тягне всю таблицю** — потрібен DISTINCT або пагінація
  - `backend/src/services/activityLogService.ts:68-78`

- [x] **4.4 Додати `loading="lazy"` на зображення**
  - `frontend/src/components/sections/ProjectsGallerySection.tsx:45`
  - Інші компоненти з `<img>`

- [x] **4.5 React.memo для секцій з великими списками**
  - `frontend/src/components/sections/FeaturedPostsSection.tsx`
  - `frontend/src/components/sections/ProjectsGallerySection.tsx`

---

## 5. ФРОНТЕНД — ЯКІСТЬ КОДУ

- [x] **5.1 Замінити тихі `.catch(() => {})`** на логування або user feedback
  - `frontend/src/pages/ProjectsPage.tsx:17`
  - `frontend/src/components/sections/FeaturedPostsSection.tsx:14`
  - `frontend/src/components/sections/HeroSlider.tsx:19`

- [x] **5.2 Замінити array index на унікальний key** в динамічних списках
  - `frontend/src/components/blocks/ThreeImagesBlock.tsx:17`
  - `frontend/src/components/blocks/PostGalleryBlock.tsx:104`
  - `frontend/src/components/admin/page-builder/editors/TextImageEditor.tsx:151`
  - `frontend/src/pages/ContactPage.tsx:134,160`

- [x] **5.3 Спростити стан блоків** — зараз `useState` + `useRef` без чіткого ownership
  - `frontend/src/pages/admin/EditPostPage.tsx:51-92`

- [x] **5.4 Використати `AxiosError`** замість `err as { response? ... }`
  - `frontend/src/pages/admin/LoginPage.tsx:34`

- [x] **5.5 Винести транслітерацію** в `utils/transliterate.ts`
  - `frontend/src/pages/admin/EditPostPage.tsx:110-145`

- [x] **5.6 Винести Pagination** в окремий компонент
  - `frontend/src/pages/admin/PostsPage.tsx:274-315`

---

## 6. ACCESSIBILITY

- [ ] **6.1 Додати `aria-label`** на icon-only кнопки
  - `frontend/src/components/layout/Footer.tsx:10,17`
  - `frontend/src/components/blocks/PostGalleryBlock.tsx:79,89`

- [ ] **6.2 ESC закриває dropdown** + focus management
  - `frontend/src/components/admin/page-builder/AddBlockMenu.tsx:65`

- [ ] **6.3 Покращити alt text** — замість "Gallery 1" використовувати назву поста
  - `frontend/src/components/blocks/PostGalleryBlock.tsx:110`

---

## 7. CI/CD & КОНФІГУРАЦІЯ

- [ ] **7.1 Додати `tsc --noEmit`** в CI pipeline
  - `.github/workflows/test.yml`

- [ ] **7.2 Додати coverage reporting** в CI
  - `.github/workflows/test.yml`

- [ ] **7.3 Оновити Swagger** — додати `three_images` в block types
  - `backend/src/docs/swagger.ts:59`

- [ ] **7.4 Docker healthchecks** для обох сервісів
  - `backend/Dockerfile`, `frontend/Dockerfile`

- [ ] **7.5 Lint-staged для shared/** — зараз не лінтиться
  - `package.json` lint-staged config

---

## 8. ЛОГУВАННЯ

- [ ] **8.1 Структуроване логування** — JSON формат замість plain text
  - `backend/src/lib/logger.ts`

- [ ] **8.2 Request ID middleware** для трасування запитів
  - `backend/src/index.ts`

- [ ] **8.3 Контекст в error логах** — userId, requestId, duration
  - Всі route handlers
