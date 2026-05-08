import { execSync } from 'child_process';
import { PostgreSqlContainer } from '@testcontainers/postgresql';
import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '../../db/schema';

let container: Awaited<ReturnType<PostgreSqlContainer['start']>>;
let pool: pg.Pool;
export let db: ReturnType<typeof drizzle>;

export async function setupIntegrationTests() {
  container = await new PostgreSqlContainer('postgres:17-alpine')
    .withDatabase('test')
    .withUsername('test')
    .withPassword('test')
    .start();

  const databaseUrl = container.getConnectionUri();

  // Push schema to test database
  execSync('npx drizzle-kit push', {
    cwd: process.cwd(),
    env: { ...process.env, DATABASE_URL: databaseUrl, NODE_ENV: 'test' },
    stdio: 'inherit',
  });

  // Seed admin user
  execSync('npx tsx src/seed-admin.ts', {
    cwd: process.cwd(),
    env: { ...process.env, DATABASE_URL: databaseUrl, NODE_ENV: 'test' },
    stdio: 'inherit',
  });

  pool = new pg.Pool({ connectionString: databaseUrl, max: 5 });
  db = drizzle(pool, { schema });

  return { container, databaseUrl };
}

export async function teardownIntegrationTests() {
  await pool?.end();
  await container?.stop();
}
