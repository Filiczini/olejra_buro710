import type { Request } from 'express';

export interface AuthenticatedUser {
  userId: string;
  email: string;
  role: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

declare module 'express' {
  interface Request {
    user?: AuthenticatedUser;
  }
}
