import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import resumeRoutes from './routes/resumeRoutes.js';
import authRoutes from './routes/authRoutes.js';
import errorHandler from './middleware/errorHandler.js';

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => {
  res.json({ status: 'Backend running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/resume', resumeRoutes);

app.use(errorHandler);

export default app;