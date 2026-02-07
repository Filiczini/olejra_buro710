import 'dotenv/config';
import { Router } from 'express';
import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { authMiddleware } from '../middleware/auth';
import { generateToken } from '../config/jwt';

const router = Router();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL!;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD!;

// Debug: Check if env vars are loaded
console.log('[AUTH DEBUG] ADMIN_EMAIL type:', typeof ADMIN_EMAIL, 'value:', ADMIN_EMAIL);
console.log('[AUTH DEBUG] ADMIN_PASSWORD type:', typeof ADMIN_PASSWORD, 'value:', ADMIN_PASSWORD);
console.log('[AUTH DEBUG] ADMIN_PASSWORD length:', ADMIN_PASSWORD?.length);

if (!ADMIN_PASSWORD) {
  throw new Error('ADMIN_PASSWORD is not defined in environment variables');
}
if (!ADMIN_EMAIL) {
  throw new Error('ADMIN_EMAIL is not defined in environment variables');
}

const generatePasswordHash = async (password: string): Promise<string> => {
  console.log('[AUTH DEBUG] Hashing password, type:', typeof password);
  return await bcrypt.hash(password, 10);
};

let adminPasswordHash: string;

const initializeAdmin = async () => {
  adminPasswordHash = await generatePasswordHash(ADMIN_PASSWORD);
};

initializeAdmin();

router.post('/login', async (req: Request, res: Response) => {
  console.log('[AUTH DEBUG] /login endpoint called');
  console.log('[AUTH DEBUG] Request method:', req.method);
  console.log('[AUTH DEBUG] Request body:', req.body);
  console.log('[AUTH DEBUG] Content-Type:', req.get('content-type'));

  const { email, password } = req.body;

  if (!email || !password) {
    console.log('[AUTH DEBUG] Validation failed: Missing email or password');
    return res.status(400).json({ error: 'Email and password are required' });
  }

  if (email !== ADMIN_EMAIL) {
    console.log('[AUTH DEBUG] Validation failed: Wrong email', { provided: email, expected: ADMIN_EMAIL });
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const isValid = await bcrypt.compare(password, adminPasswordHash);
  console.log('[AUTH DEBUG] Password validation result:', isValid);

  if (!isValid) {
    console.log('[AUTH DEBUG] Validation failed: Wrong password');
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = generateToken({ email });
  console.log('[AUTH DEBUG] Token generated:', token ? 'YES' : 'NO');

  console.log('[AUTH DEBUG] Sending response...');
  
  res.json({
    token,
    user: {
      email,
    },
  });
});

router.post('/logout', authMiddleware, (_req: Request, res: Response) => {
  res.json({ message: 'Logged out successfully' });
});

export default router;
