import 'dotenv/config';

const REQUIRED_ENV_VARS = [
  'JWT_SECRET',
  'ADMIN_EMAIL',
  'ADMIN_PASSWORD',
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'ALLOWED_ORIGINS'
] as const;

export const validateEnv = (): void => {
  // Debug: List all environment variables
  console.log('[ENV DEBUG] Required vars check:');
  REQUIRED_ENV_VARS.forEach((varName) => {
    const value = process.env[varName];
    console.log(`[ENV DEBUG] ${varName}:`, typeof value, value ? `exists` : `MISSING`);
  });

  const missing: string[] = [];

  REQUIRED_ENV_VARS.forEach((varName) => {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  });

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }

  // Additional validations
  if (process.env.ADMIN_PASSWORD && process.env.ADMIN_PASSWORD.length < 8) {
    throw new Error('ADMIN_PASSWORD must be at least 8 characters');
  }
};
