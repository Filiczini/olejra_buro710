const isDev = process.env.NODE_ENV !== 'production';

interface LogEntry {
  level: string;
  timestamp: string;
  message: string;
  [key: string]: unknown;
}

function formatContext(context?: unknown): Record<string, unknown> {
  if (!context) return {};
  if (context instanceof Error) {
    return { error: context.message, stack: context.stack };
  }
  if (typeof context === 'object') {
    return context as Record<string, unknown>;
  }
  return { details: context };
}

function log(level: string, message: string, context?: unknown) {
  const entry: LogEntry = {
    level,
    timestamp: new Date().toISOString(),
    message,
    ...formatContext(context),
  };

  if (isDev) {
    // Pretty print in development
    const prefix = `[${level.toUpperCase()}] ${entry.timestamp} ${message}`;
    if (level === 'error') console.error(prefix, context ?? '');
    else if (level === 'warn') console.warn(prefix, context ?? '');
    else console.log(prefix, context ?? '');
  } else {
    // JSON in production
    const output = JSON.stringify(entry);
    if (level === 'error') console.error(output);
    else if (level === 'warn') console.warn(output);
    else console.log(output);
  }
}

export const logger = {
  error: (message: string, context?: unknown) => log('error', message, context),
  warn: (message: string, context?: unknown) => log('warn', message, context),
  info: (message: string, context?: unknown) => log('info', message, context),
  debug: (message: string, context?: unknown) => {
    if (isDev) log('debug', message, context);
  },
};
