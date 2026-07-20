import axios from 'axios';

export function resolveApiErrorMessage(error: unknown, fallback: string): string {
  if (!axios.isAxiosError(error)) return fallback;

  if (error.code === 'ECONNABORTED') {
    return 'Перевищено час очікування — перевірте з’єднання і спробуйте ще раз';
  }
  if (!error.response) {
    return 'Немає з’єднання з сервером';
  }

  const { status, data } = error.response;
  const serverMessage = (data as { error?: string } | undefined)?.error;

  if (status === 401) return 'Сесія закінчилась — увійдіть знову';
  if (status === 403) return serverMessage || 'Немає прав для цієї дії';
  if (status === 413) return 'Файл завеликий — зменшіть розмір зображення';
  if (status >= 500) return 'Помилка сервера — спробуйте пізніше';
  return serverMessage || fallback;
}
