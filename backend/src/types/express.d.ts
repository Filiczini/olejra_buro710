import type { Request } from 'express';

export interface AuthenticatedUser {
  userId: string;
  email: string;
  role: string;
  tokenVersion: number;
}

declare module 'express' {
  interface Request {
    user?: AuthenticatedUser;
  }
}
