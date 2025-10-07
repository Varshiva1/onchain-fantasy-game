import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { tournamentRoutes } from './routes/tournaments';
import { contestRoutes } from './routes/contests';
import { healthRoutes } from './routes/health';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/health', healthRoutes);
app.use('/api/tournaments', tournamentRoutes);
app.use('/api/contests', contestRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});
