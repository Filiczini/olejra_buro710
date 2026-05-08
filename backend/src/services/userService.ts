import { eq, sql } from 'drizzle-orm';
import { db } from '../db';
import { users } from '../db/schema';
import type { User } from '@buro710/shared';

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

  getTokenVersion: async (userId: string): Promise<number> => {
    const result = await db
      .select({ token_version: users.token_version })
      .from(users)
      .where(eq(users.id, userId));
    if (result.length === 0) return -1;
    return result[0].token_version;
  },

  incrementTokenVersion: async (userId: string): Promise<void> => {
    await db
      .update(users)
      .set({ token_version: sql`${users.token_version} + 1` })
      .where(eq(users.id, userId));
  },

  findAll: async (): Promise<Omit<User, 'password_hash'>[]> => {
    const result = await db
      .select({
        id: users.id,
        email: users.email,
        role: users.role,
        created_at: users.created_at,
      })
      .from(users)
      .orderBy(users.created_at);

    return result.map((u) => ({
      id: u.id,
      email: u.email,
      role: u.role,
      created_at: u.created_at.toISOString(),
    })) as Omit<User, 'password_hash'>[];
  },

  create: async (
    email: string,
    passwordHash: string,
    role: string
  ): Promise<Omit<User, 'password_hash'>> => {
    const result = await db
      .insert(users)
      .values({
        email,
        password_hash: passwordHash,
        role,
      })
      .returning({
        id: users.id,
        email: users.email,
        role: users.role,
        created_at: users.created_at,
      });

    return {
      id: result[0].id,
      email: result[0].email,
      role: result[0].role,
      created_at: result[0].created_at.toISOString(),
    };
  },

  delete: async (id: string): Promise<void> => {
    await db.delete(users).where(eq(users.id, id));
  },

  updatePassword: async (id: string, passwordHash: string): Promise<void> => {
    await db
      .update(users)
      .set({ password_hash: passwordHash, token_version: sql`${users.token_version} + 1` })
      .where(eq(users.id, id));
  },
};
