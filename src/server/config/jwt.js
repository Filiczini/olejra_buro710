import 'dotenv/config';
import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
export const generateToken = (payload) => {
    console.log('[JWT DEBUG] JWT_SECRET type:', typeof JWT_SECRET);
    console.log('[JWT DEBUG] JWT_SECRET length:', JWT_SECRET?.length);
    console.log('[JWT DEBUG] Generating token for payload:', payload);
    // Use 'as any' for options to fix TypeScript compatibility
    const token = jwt.sign(payload, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN
    });
    console.log('[JWT DEBUG] Token generated successfully');
    return token;
};
export const verifyToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    }
    catch {
        throw new Error('Invalid token');
    }
};
