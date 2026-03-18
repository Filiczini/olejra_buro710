import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { db, pool } from './db';
import { users } from './db/schema';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error('ERROR: ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env');
  process.exit(1);
}

const seedAdmin = async () => {
  console.log('Seeding admin user...');
  console.log(`Email: ${ADMIN_EMAIL}`);

  try {
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);

    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, ADMIN_EMAIL));

    if (existing.length > 0) {
      await db
        .update(users)
        .set({ password_hash: passwordHash })
        .where(eq(users.email, ADMIN_EMAIL));
      console.log('Admin user password updated successfully');
    } else {
      await db.insert(users).values({
        email: ADMIN_EMAIL,
        password_hash: passwordHash,
        role: 'admin',
      });
      console.log('Admin user created successfully');
    }

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error);
    await pool.end();
    process.exit(1);
  }
};

seedAdmin();
