# Git Flow для Buro710

## Формат назви гілки
```
[тип]/[номер]-[детальний-опис]
```

**Приклади:**
- `feature/1-add-hero-slider-with-nav`
- `bugfix/2-fix-header-scroll-on-mobile`
- `hotfix/3-urgent-login-auth-fix`

---

## Типи гілок

### 1. **feature/** - Нова функціональність
- Додавання нових секцій/компонентів
- Інтеграція API
- Реалізація маршрутизації

**Приклади:**
- `feature/7-add-project-page-with-gallery`
- `feature/8-integrate-express-backend-api`
- `feature/9-create-contact-form-submission`

### 2. **bugfix/** - Виправлення помилок
- Виправлення помилок верстки
- Виправлення логіки компонентів
- Виправлення API запитів

**Приклади:**
- `bugfix/10-fix-mobile-responsive-issues`
- `bugfix/11-resolve-tailwind-class-not-working`
- `bugfix/12-correct-project-page-navigation`

### 3. **hotfix/** - Термінові виправлення
- Критичні помилки в проді
- Безпекові виправлення
- Термінові зміни

**Приклади:**
- `hotfix/13-urgent-security-patch-auth`
- `hotfix/14-fix-broken-production-deploy`

### 4. **refactor/** - Рефакторинг коду
- Оптимізація компонентів
- Покращення архітектури
- Очищення коду

**Приклади:**
- `refactor/15-extract-common-ui-components`
- `refactor/16-improve-api-error-handling`

### 5. **docs/** - Документація
- Оновлення README
- Додавання коментарів
- Документація API

**Приклади:**
- `docs/17-update-setup-instructions`
- `docs/18-add-component-usage-guide`

### 6. **chore/** - Технічні завдання
- Налаштування інструментів
- Оновлення залежностей
- Конфігурація

**Приклади:**
- `chore/19-update-eslint-rules`
- `chore/20-add-typescript-strict-mode`

---

## Контроль нумерації

### Глобальний лічильник
- Всі гілки використовують **один спільний лічильник**
- Номер збільшується для кожної нової гілки, незалежно від типу
- Зберігається в цьому файлі або git notes

### Приклад флоу нумерації
```
1. feature/1-add-hero-slider
2. feature/2-create-project-page
3. bugfix/3-fix-header-scroll
4. refactor/4-optimize-components
5. feature/5-add-contact-form
6. docs/6-update-readme
...
```

---

## Поточний статус проєкту

### Завершені гілки
- ✅ `feature/1-init-vite-react-project`
- ✅ `feature/2-install-tailwind-setup`
- ✅ `feature/3-create-ui-components`
- ✅ `feature/4-build-layout-components`
- ✅ `feature/5-implement-page-sections`
- ✅ `feature/6-create-project-page`

### Наступні потенційні гілки
- `feature/7-add-backend-express-setup`
- `feature/8-create-admin-authentication`
- `feature/9-build-admin-dashboard`
- `bugfix/10-fix-mobile-hero-slider`
- `refactor/11-extract-project-data-to-api`

---

## Команди Git для роботи з гілками

### Створення нової гілки
```bash
git checkout -b feature/7-add-backend-express-setup
```

### Переключення на гілку
```bash
git checkout bugfix/10-fix-mobile-hero-slider
```

### Перегляд всіх гілок
```bash
git branch -a
```

### Видалення злитої гілки
```bash
git branch -d feature/1-add-hero-slider
```

---

## Інформація про лічильник

**Останній номер гілки:** `6`

При створенні нової гілки:
1. Збільште номер на 1
2. Оновіть це значення в файлі
3. Використовуйте новий номер у назві гілки

---

## Правила іменування

### Типи обов'язково в lowercase
- ✅ `feature/1-add-hero-slider`
- ❌ `Feature/1-add-hero-slider`

### Опис з дефісами, без підкреслень
- ✅ `feature/1-add-hero-slider-with-nav`
- ❌ `feature/1_add_hero_slider`

### Детальний опис на англійській
- ✅ `feature/1-add-hero-slider-with-navigation`
- ❌ `feature/1-hero-slider`

---

## Коміт меседжі

Для кожної гілки використовуйте наступний формат комітів:

### Feature
```
feat: add hero slider with navigation

- Implement horizontal scroll with CSS Snap
- Add navigation controls
- Add pagination indicators
```

### Bugfix
```
fix: resolve header scroll issues on mobile

- Fix overflow on small screens
- Adjust padding for mobile viewport
- Test on various screen sizes
```

### Hotfix
```
fix: urgent - resolve authentication bypass vulnerability

- Add token validation
- Update auth middleware
- Security patch
```

---

## Створення Pull Request

Заголовок PR має відповідати назві гілки:
- Гілка: `feature/1-add-hero-slider-with-nav`
- PR: `Feature/1: Add hero slider with nav`

Опис PR має містити:
1. Короткий опис змін
2. Список змінених файлів
3. Інструкції для тестування
4. Скріншоти (для UI змін)
