import axios from 'axios';

const SERVER_MESSAGES: Record<string, string> = {
  'Admin access required': 'Потрібні права адміністратора',
  'Editor access required': 'Потрібні права редактора',
  'No token provided': 'Сесія закінчилась — увійдіть знову',
  'Invalid token': 'Сесія закінчилась — увійдіть знову',
  'Invalid or expired refresh token': 'Сесія закінчилась — увійдіть знову',
  Unauthorized: 'Сесія закінчилась — увійдіть знову',
  'Invalid credentials': 'Невірний email або пароль',
  'User not found': 'Користувача не знайдено',
  'Post not found': 'Сторінку не знайдено',
  'Block not found': 'Блок не знайдено',
  'Slug already exists': 'Такий URL вже існує',
  'Email already exists': 'Користувач з такою електронною поштою вже існує',
  'Title is required': 'Введіть назву сторінки',
  'Validation failed': 'Перевірте правильність заповнення полів',
  'No files uploaded': 'Файли не завантажено',
  'Image URL is required': 'Вкажіть посилання на зображення',
  'Invalid image URL format': 'Некоректне посилання на зображення',
  'Invalid file path': 'Некоректний шлях до файлу',
  'Only JPEG and PNG files are allowed': 'Дозволені лише файли JPEG та PNG',
  'File content does not match its declared type': 'Вміст файлу не відповідає його формату',
  'File too large. Maximum size is 10MB.': 'Файл завеликий — максимум 10 МБ',
  'Internal server error': 'Помилка сервера — спробуйте пізніше',
  'Too many requests, please try again later': 'Забагато запитів — спробуйте пізніше',
  'Too many refresh attempts, please try again later': 'Забагато спроб — спробуйте пізніше',
  'Telegram not configured': 'Telegram не налаштовано',
  'Failed to send Telegram message': 'Не вдалося надіслати повідомлення',
};

export function translateServerMessage(message: string): string {
  return SERVER_MESSAGES[message] ?? message;
}

export function resolveApiErrorMessage(error: unknown, fallback: string): string {
  if (!axios.isAxiosError(error)) return fallback;

  if (error.code === 'ECONNABORTED') {
    return 'Перевищено час очікування — перевірте з’єднання і спробуйте ще раз';
  }
  if (!error.response) {
    return 'Немає з’єднання з сервером';
  }

  const { status, data } = error.response;
  const rawMessage = (data as { error?: string } | undefined)?.error;
  const serverMessage = rawMessage ? translateServerMessage(rawMessage) : undefined;

  if (status === 401) return 'Сесія закінчилась — увійдіть знову';
  if (status === 403) return serverMessage || 'Немає прав для цієї дії';
  if (status === 413) return 'Файл завеликий — зменшіть розмір зображення';
  if (status >= 500) return 'Помилка сервера — спробуйте пізніше';
  return serverMessage || fallback;
}
