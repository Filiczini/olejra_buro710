import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import portfolioRoutes from './routes/portfolio';
import dotenv from 'dotenv';
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use('/api/admin', authRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
