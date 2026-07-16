import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import orderRoutes from './routes/orderRoutes';
import productRoutes from './routes/productRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import mlRoutes from './routes/mlRoutes';
import { errorHandler } from './middleware/errorHandler';
import { setSocketServer } from './utils/liveEvents';
import { connectDB, disconnectDB } from './config/database';
import { startMLScheduler } from './services/scheduler';

dotenv.config();

const app= express();
const PORT = process.env.PORT || 5000;
const httpServer = createServer(app);
const wsServer = new WebSocketServer({ server: httpServer });

setSocketServer(wsServer);

// middleware   
app.use(cors());
app.use(express.json());

// routes
app.use('/api', orderRoutes);
app.use('/api', productRoutes);
app.use('/api', analyticsRoutes);
app.use('/api/ml', mlRoutes);

//health check
app.get('/health', (req, res) => { 
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

//error handling
app.use(errorHandler);

// Start server
const startServer = async (): Promise<void> => {
  // Connect to database
  await connectDB();

  // Start ML training scheduler
  startMLScheduler();

  // Graceful shutdown
  process.on('SIGINT', async () => {
    await disconnectDB();
    process.exit(0);
  });

  httpServer.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
  });
};

startServer();
