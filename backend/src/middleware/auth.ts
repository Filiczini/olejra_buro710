import type { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../config/jwt';
import { userService } from '../services/userService';
import { ACCESS_TOKEN_COOKIE } from '../lib/authCookies';

/** httpOnly cookie first (browser flow), Bearer header as fallback (API clients, tests). */
function extractToken(req: Request): string | undefined {
  const cookieToken: string | undefined = req.cookies?.[ACCESS_TOKEN_COOKIE];
  if (cookieToken) return cookieToken;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.split(' ')[1];
  }
  return undefined;
}

export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

/** Post/content management — admins and editors. Users/logs stay admin-only. */
export const editorMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'admin' && req.user?.role !== 'editor') {
    return res.status(403).json({ error: 'Editor access required' });
  }
  next();
};

export const optionalAuthMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  const token = extractToken(req);

  if (token) {
    try {
      req.user = verifyToken(token);
    } catch {
      // Invalid token — proceed as unauthenticated
    }
  }
  next();
};

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const token = extractToken(req);

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = verifyToken(token);
    const dbVersion = await userService.getTokenVersion(decoded.userId);
    if (dbVersion === -1 || decoded.tokenVersion !== dbVersion) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
};
