import crypto from 'crypto';
import { eq, and, gt } from 'drizzle-orm';
import { db } from '../db';
import { refreshTokens } from '../db/schema';

const REFRESH_TOKEN_BYTES = 32;
const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function generateToken(): string {
  return crypto.randomBytes(REFRESH_TOKEN_BYTES).toString('hex');
}

export const refreshTokenService = {
  create: async (userId: string): Promise<string> => {
    const plainToken = generateToken();
    const tokenHash = hashToken(plainToken);
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);

    await db.insert(refreshTokens).values({
      user_id: userId,
      token_hash: tokenHash,
      expires_at: expiresAt,
    });

    return plainToken;
  },

  verify: async (userId: string, plainToken: string): Promise<boolean> => {
    const tokenHash = hashToken(plainToken);
    const now = new Date();

    const result = await db
      .select({ id: refreshTokens.id })
      .from(refreshTokens)
      .where(
        and(
          eq(refreshTokens.user_id, userId),
          eq(refreshTokens.token_hash, tokenHash),
          gt(refreshTokens.expires_at, now)
        )
      );

    return result.length > 0;
  },

  /**
   * Look up a valid (non-expired) token by its value alone and return the
   * owning user id, or null. Used by the cookie-based refresh flow where the
   * client does not send a userId.
   */
  findUserByToken: async (plainToken: string): Promise<string | null> => {
    const tokenHash = hashToken(plainToken);
    const now = new Date();

    const result = await db
      .select({ user_id: refreshTokens.user_id })
      .from(refreshTokens)
      .where(and(eq(refreshTokens.token_hash, tokenHash), gt(refreshTokens.expires_at, now)));

    return result[0]?.user_id ?? null;
  },

  rotate: async (userId: string, oldPlainToken: string): Promise<string> => {
    const oldTokenHash = hashToken(oldPlainToken);

    await db
      .delete(refreshTokens)
      .where(and(eq(refreshTokens.user_id, userId), eq(refreshTokens.token_hash, oldTokenHash)));

    return refreshTokenService.create(userId);
  },

  revokeAllForUser: async (userId: string): Promise<void> => {
    await db.delete(refreshTokens).where(eq(refreshTokens.user_id, userId));
  },
};
