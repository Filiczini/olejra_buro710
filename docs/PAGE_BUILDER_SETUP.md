# Page Builder CRM - Налаштування

## 1. Виконати міграцію бази даних

Виконайте SQL з файлу `src/server/migrations/002_create_posts_blocks.sql` у Supabase SQL Editor:

```sql
-- Скопіюйте та виконайте вміст файлу:
-- src/server/migrations/002_create_posts_blocks.sql
```

Або через psql:
```bash
psql $DATABASE_URL -f src/server/migrations/002_create_posts_blocks.sql
```

## 2. Створити Storage Bucket

У Supabase Dashboard:

1. Перейдіть до **Storage**
2. Натисніть **New bucket**
3. Назва: `blocks`
4. Увімкніть **Public bucket**
5. Збережіть

## 3. Налаштувати RLS Policy для blocks bucket

У Supabase SQL Editor:

```sql
-- Дозволити публічний читання
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'blocks');

-- Дозволити завантаження тільки для авторизованих
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'blocks'
  AND auth.role() = 'authenticated'
);
```

## 4. Перевірити роботу

1. Запустіть сервер: `npm run dev`
2. Перейдіть до `/admin/posts`
3. Створіть нову сторінку з блоками
4. Перевірте публічний доступ: `/page/your-slug`

## API Endpoints

| Method | Endpoint | Опис |
|--------|----------|------|
| GET | `/api/posts` | Список постів (адмінка) |
| GET | `/api/posts/:id` | Отримати пост з блоками |
| GET | `/api/posts/public/:slug` | Публічний доступ |
| POST | `/api/posts` | Створити пост |
| PUT | `/api/posts/:id` | Оновити пост |
| DELETE | `/api/posts/:id` | Видалити пост |

## Типи блоків

| Тип | Опис |
|-----|------|
| `text_full` | Текст на повну ширину |
| `image_full` | Зображення на повну ширину |
| `text_image` | Текст зліва, зображення справа |
| `image_text` | Зображення зліва, текст справа |
