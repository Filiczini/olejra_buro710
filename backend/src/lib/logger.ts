const isDev = process.env.NODE_ENV !== 'production';

export const logger = {
  error: (message: string, context?: unknown) => {
    console.error(`[ERROR] ${new Date().toISOString()} ${message}`, context ?? '');
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
