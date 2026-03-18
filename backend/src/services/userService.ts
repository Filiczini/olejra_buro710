import { eq } from 'drizzle-orm';
import { db } from '../db';
import { users } from '../db/schema';
import type { User } from '../types/user';

export const userService = {
  findByEmail: async (email: string): Promise<User | null> => {
    const result = await db.select().from(users).where(eq(users.email, email));

    if (result.length === 0) return null;

    return {
      id: result[0].id,
      email: result[0].email,
      password_hash: result[0].password_hash,
      role: result[0].role,
      created_at: result[0].created_at.toISOString(),
    } as User;
  },

  findById: async (id: string): Promise<User | null> => {
    const result = await db.select().from(users).where(eq(users.id, id));

    if (result.length === 0) return null;

    return {
      id: result[0].id,
      email: result[0].email,
      password_hash: result[0].password_hash,
      role: result[0].role,
      created_at: result[0].created_at.toISOString(),
    } as User;
  },
};
