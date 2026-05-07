import 'dotenv/config';
import { pool } from './db';
import fs from 'fs';
import path from 'path';

const DUMP_PATH = process.env.DUMP_PATH || './backup/seed.sql';

interface ParsedCopy {
  table: string;
  columns: string[];
  rows: string[][];
}

function parseCopyBlocks(sql: string): ParsedCopy[] {
  const copies: ParsedCopy[] = [];
  // Match: COPY public.table_name (col1, col2) FROM stdin;\n...data...\.
  const copyRegex = /COPY\s+public\.([\w_]+)\s+\(([\w_,\s]+)\)\s+FROM\s+stdin;\n([\s\S]*?)\\\./g;

  let match;
  while ((match = copyRegex.exec(sql)) !== null) {
    const table = match[1];
    const columns = match[2].split(',').map((c) => c.trim());
    const dataBlock = match[3].trim();
    const rows = dataBlock
      .split('\n')
      .filter((line) => line.length > 0)
      .map((line) => line.split('\t'));

    copies.push({ table, columns, rows });
  }

  return copies;
}

// Tables to import, in dependency order (posts before blocks)
const ALLOWED_TABLES = ['posts', 'blocks', 'contact_messages', 'activity_logs'];

async function seedFromDump() {
  const dumpPath = path.resolve(DUMP_PATH);

  if (!fs.existsSync(dumpPath)) {
    console.error(`Dump file not found: ${dumpPath}`);
    process.exit(1);
  }

  console.log(`Reading dump: ${dumpPath}`);
  const sql = fs.readFileSync(dumpPath, 'utf-8');
  const copies = parseCopyBlocks(sql);

  console.log(`Found ${copies.length} COPY blocks in dump`);

  const relevant = copies.filter((c) => ALLOWED_TABLES.includes(c.table));
  console.log(`Relevant tables: ${relevant.map((r) => r.table).join(', ')}`);

  // Order: posts first (blocks reference posts), then blocks, then others
  const ordered = [
    relevant.find((c) => c.table === 'posts'),
    relevant.find((c) => c.table === 'blocks'),
    relevant.find((c) => c.table === 'contact_messages'),
    relevant.find((c) => c.table === 'activity_logs'),
  ].filter(Boolean) as ParsedCopy[];

  const client = await pool.connect();

  try {
    // Safety check: if posts table already has data, skip seeding
    const postsCountResult = await client.query('SELECT COUNT(*) FROM posts;');
    const postsCount = parseInt(postsCountResult.rows[0].count, 10);
    if (postsCount > 0) {
      console.log(
        `\n⚠️  posts table already has ${postsCount} rows. Skipping seed to avoid data loss.`
      );
      console.log(
        'If you want to force re-seed, truncate the tables first or set FORCE_SEED=true.'
      );
      client.release();
      await pool.end();
      process.exit(0);
    }

    await client.query('BEGIN');

    // Disable triggers and FK checks for this session
    console.log('Disabling triggers and foreign key checks...');
    await client.query('SET session_replication_role = replica;');

    // Truncate tables in reverse order (children first)
    for (const copy of [...ordered].reverse()) {
      console.log(`Truncating ${copy.table}...`);
      await client.query(`TRUNCATE TABLE "${copy.table}" RESTART IDENTITY CASCADE;`);
    }

    // Insert data using batch INSERT for speed
    for (const copy of ordered) {
      if (!copy || copy.rows.length === 0) {
        console.log(`Skipping ${copy?.table} (empty)`);
        continue;
      }

      console.log(`Importing ${copy.rows.length} rows into ${copy.table}...`);

      const columns = copy.columns.map((c) => `"${c}"`).join(', ');

      const batchSize = 100;
      let imported = 0;

      for (let i = 0; i < copy.rows.length; i += batchSize) {
        const batch = copy.rows.slice(i, i + batchSize);
        const valuesSql: string[] = [];
        const params: (string | null)[] = [];
        let paramIndex = 1;

        for (const row of batch) {
          const placeholders = row.map(() => `$${paramIndex++}`).join(',');
          valuesSql.push(`(${placeholders})`);

          for (const val of row) {
            params.push(val === '\\N' ? null : val);
          }
        }

        const insertSql = `INSERT INTO "${copy.table}" (${columns}) VALUES ${valuesSql.join(', ')}`;
        await client.query(insertSql, params);
        imported += batch.length;
      }

      console.log(`  ✓ ${imported} rows imported into ${copy.table}`);
    }

    // Re-enable triggers
    await client.query('SET session_replication_role = DEFAULT;');
    await client.query('COMMIT');

    console.log('\n✅ Seed complete!');
    console.log('Note: users and refresh_tokens were NOT imported.');
    console.log('The seed-admin script will ensure admin user exists with the correct password.');

    client.release();
    await pool.end();
    process.exit(0);
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('\n❌ Seed failed:', error);

    try {
      await client.query('SET session_replication_role = DEFAULT;');
    } catch {
      // ignore
    }

    client.release();
    await pool.end();
    process.exit(1);
  }
}

seedFromDump();
