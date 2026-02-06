import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { authMiddleware } from '../middleware/auth';
import { generateToken } from '../config/jwt';
const router = Router();
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const generatePasswordHash = async (password) => {
    return await bcrypt.hash(password, 10);
};
let adminPasswordHash;
const initializeAdmin = async () => {
    adminPasswordHash = await generatePasswordHash(ADMIN_PASSWORD);
};
initializeAdmin();
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }
    if (email !== ADMIN_EMAIL) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }
    const isValid = await bcrypt.compare(password, adminPasswordHash);
    if (!isValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = generateToken({ email });
    res.json({
        token,
        user: {
            email,
        },
    });
});
router.post('/logout', authMiddleware, (_req, res) => {
    res.json({ message: 'Logged out successfully' });
});
export default router;
