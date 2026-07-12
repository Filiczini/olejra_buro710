import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema';

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  max: 5,
});

export const db = drizzle(pool, { schema });
export { schema };
export { pool };

// Either the root db or a transaction handle — lets services run inside a caller's transaction
export type DbClient = typeof db | Parameters<Parameters<typeof db.transaction>[0]>[0];
