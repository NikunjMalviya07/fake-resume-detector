import express from 'express';
import cors from 'cors';
import resumeRoutes from './routes/resumeRoutes.js';
import errorHandler from './middleware/errorHandler.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ status: 'Backend running' });
});

app.use('/api/resume', resumeRoutes);

app.use(errorHandler);

export default app;
